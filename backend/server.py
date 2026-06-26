"""
RavenX Backend — Google News RSS Feed API
Fetches country-specific news via Google News RSS and returns JSON.
Uses source domain to scrape og:image thumbnails for articles.
Google News redirect URLs work fine when opened in browser.
"""

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import feedparser
import requests
from datetime import datetime
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
import time
import libsql_client
from dotenv import load_dotenv
import uuid
import os
import json
import random
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
from youtubesearchpython import VideosSearch
import yt_dlp

app = Flask(__name__)
CORS(app,
     origins="*", # Allow all origins for production (Vercel deployment)
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

@app.after_request
def add_cache_headers(response):
    # Only cache GET requests with 200 OK
    if request.method == 'GET' and response.status_code == 200:
        # Cache for 60 seconds on Vercel Edge, serve stale for up to 120 seconds while revalidating
        response.headers['Cache-Control'] = 'public, s-maxage=60, stale-while-revalidate=120'
    return response

# ─── Turso Cloud Database ─────────────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), 'ravenx.db')

def get_db():
    url = os.environ.get("TURSO_DATABASE_URL", "")
    token = os.environ.get("TURSO_AUTH_TOKEN", "")
    if not url:
        # Fallback to local sqlite file if Turso is not configured
        url = f"file:{DB_PATH}"
    return libsql_client.create_client_sync(url=url, auth_token=token)

def row_to_dict(rs, row_idx=0):
    """Helper to convert libsql_client Row to dict"""
    if not rs or not rs.rows or len(rs.rows) <= row_idx:
        return None
    row = rs.rows[row_idx]
    return dict(zip(rs.columns, row))

def init_db():
    try:
        client = get_db()
        client.batch([
            '''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );''',
            '''CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );''',
            '''CREATE TABLE IF NOT EXISTS user_layouts (
                user_id INTEGER PRIMARY KEY,
                layout_json TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );'''
        ])
        client.close()
    except Exception as e:
        print(f"Database init failed: {e}")

init_db()

def get_user_from_token(req):
    """Validate Bearer token, return {id, username} or None."""
    auth = req.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth[7:].strip()
    client = get_db()
    rs = client.execute(
        'SELECT u.id, u.username FROM sessions s '
        'JOIN users u ON s.user_id = u.id WHERE s.token = ?',
        [token]
    )
    user_dict = row_to_dict(rs)
    client.close()
    return user_dict

# Simple in-memory cache
_cache = {}
CACHE_TTL = 60  # 60 seconds — refresh every minute

# Reusable session for connection pooling
_session = requests.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
})


def extract_og_image(url: str) -> str | None:
    """Extract og:image from a URL's HTML <head> section."""
    try:
        resp = _session.get(url, timeout=6, stream=True)
        # Read first 50KB only — meta tags are in <head>
        content = b""
        for chunk in resp.iter_content(chunk_size=8192):
            content += chunk
            if len(content) > 50000:
                break
        resp.close()

        html = content.decode("utf-8", errors="ignore")

        for pattern in [
            r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            r'<meta[^>]+(?:name|property)=["\']twitter:image(?::src)?["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:name|property)=["\']twitter:image(?::src)?["\']',
        ]:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                img = match.group(1).strip()
                if img.startswith("http") and not img.endswith(".svg"):
                    return img
        return None
    except Exception:
        return None


def fetch_article_image(source_href: str, google_link: str) -> str | None:
    """
    Try to get an article thumbnail image.
    First tries following the Google News link (which redirects in browser),
    then falls back to the source homepage for og:image.
    """
    # Try the Google News redirect link (may give us the real article page)
    try:
        resp = _session.get(google_link, allow_redirects=True, timeout=8)
        final_url = resp.url
        if "news.google" not in final_url and "consent.google" not in final_url:
            # We actually got to the article! Extract og:image
            html = resp.text[:50000]
            for pattern in [
                r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            ]:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    img = match.group(1).strip()
                    if img.startswith("http"):
                        return img
    except Exception:
        pass

    return None


def enrich_article(article: dict) -> dict:
    """Extract image for a single article."""
    source_href = article.get("_source_href", "")
    google_link = article.get("url", "")

    # Get thumbnail image
    if not article.get("image"):
        img = fetch_article_image(source_href, google_link)
        if img:
            article["image"] = img

    # Clean up internal field
    article.pop("_source_href", None)
    return article


def parse_google_news(country: str, max_results: int = 25) -> list:
    """Fetch and parse Google News RSS for a given country."""

    cache_key = country.upper()
    now = time.time()

    # Return cached data if fresh
    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if now - cached_time < CACHE_TTL:
            return cached_data

    # Build Google News RSS URL
    encoded_query = quote(country)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en&gl=US&ceid=US:en"

    feed = feedparser.parse(url)

    raw_articles = []
    for i, entry in enumerate(feed.entries[:max_results]):
        # Extract source from title (Google News format: "Title - Source")
        title = entry.get("title", "")
        source = ""
        source_href = ""
        if " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0].strip()
            source = parts[1].strip().upper()

        # Get source URL from RSS source element
        if hasattr(entry, "source") and isinstance(entry.source, dict):
            source_href = entry.source.get("href", "")
            if not source:
                source = entry.source.get("title", "").upper()

        # Parse published date → ISO 8601
        published_iso = ""
        parsed_time = entry.get("published_parsed")
        if parsed_time:
            try:
                dt = datetime(*parsed_time[:6])
                published_iso = dt.isoformat() + "Z"
            except Exception:
                published_iso = entry.get("published", "")
        else:
            published_iso = entry.get("published", "")

        # Try to extract image from RSS description HTML
        image = None
        description = entry.get("description", "") or entry.get("summary", "")
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', description)
        if img_match:
            img_url = img_match.group(1)
            if img_url.startswith("http"):
                image = img_url

        raw_articles.append({
            "id": f"gnews_{i}_{int(now)}",
            "title": title,
            "url": entry.get("link", ""),  # Google News redirect URL — works in browser
            "source": source,
            "sourceUrl": source_href,  # Direct domain e.g. https://www.bloomberg.com
            "publishedAt": published_iso,
            "image": image,
            "tag": "LIVE_INTEL",
            "_source_href": source_href,  # Internal, removed after enrichment
        })

    # Enrich articles in parallel — try to get images
    articles = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(enrich_article, art): art for art in raw_articles}
        for future in as_completed(futures):
            try:
                articles.append(future.result())
            except Exception:
                art = futures[future]
                art.pop("_source_href", None)
                articles.append(art)

    # Restore original order
    id_order = {f"gnews_{i}_{int(now)}": i for i in range(len(raw_articles))}
    articles.sort(key=lambda a: id_order.get(a["id"], 999))

    # Cache the enriched results
    _cache[cache_key] = (now, articles)

    return articles


@app.route('/api/osint/graph', methods=['GET'])
def get_osint_graph():
    target = request.args.get('target', 'World')
    target_safe = quote(target)
    
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={target_safe}&gsrlimit=10&prop=extracts&exintro&exchars=150&format=json"
    
    try:
        wiki_headers = {"User-Agent": "RavenX-Intelligence-Bot/1.0 (contact@ravenx-protocol.vercel.app)"}
        resp = requests.get(url, headers=wiki_headers, timeout=5)
        
        try:
            res = resp.json()
        except Exception as e:
            raise Exception(f"Wiki API error: {resp.status_code} - {resp.text[:200]}")
            
        pages_dict = res.get('query', {}).get('pages', {})
        
        if not pages_dict:
            return jsonify({"nodes": [{"id": "TGT-01", "type": "TARGET", "label": target.upper(), "desc": "NO INTELLIGENCE FOUND", "x": 50, "y": 50, "color": "#ff3333", "size": 1.5, "icon": "Shield"}], "links": []})
            
        pages = list(pages_dict.values())
        
        # The first page is usually the exact match or closest
        target_page = pages[0]
        for p in pages:
            if p.get('title', '').lower() == target.lower():
                target_page = p
                break
                
        target_title = target_page.get('title', target)
        extract = target_page.get('extract', '')
        extract_clean = re.sub('<[^<]+>', '', extract).strip()
        
        selected_links = [p.get('title') for p in pages if p.get('title') != target_title]
        
        nodes = []
        edges = []
        
        nodes.append({
            "id": "TGT-01",
            "type": "TARGET",
            "label": target_title.upper(),
            "desc": extract_clean,
            "x": 50,
            "y": 50,
            "color": "#ff3333",
            "size": 1.5,
            "icon": "Shield"
        })
        
        node_types = ["PERSON", "ORGANIZATION", "LOCATION", "DATABASE", "NETWORK", "VESSEL"]
        icons = ["User", "Shield", "MapPin", "Database", "Globe", "Activity"]
        colors = ["#4ade80", "#ffb800", "#00f2ff", "#a855f7", "#ffffff", "#4ade80"]
        
        import math
        radius = 35
        angle_step = (2 * math.pi) / len(selected_links) if selected_links else 1
        
        for i, link in enumerate(selected_links):
            node_id = f"ND-{i+1:02d}"
            n_type_idx = random.randint(0, len(node_types)-1)
            
            angle = i * angle_step
            nx = 50 + radius * math.cos(angle)
            ny = 50 + radius * math.sin(angle)
            
            nodes.append({
                "id": node_id,
                "type": node_types[n_type_idx],
                "label": link.upper(),
                "desc": f"Extracted from {target_title}",
                "color": colors[n_type_idx],
                "size": 1.0,
                "icon": icons[n_type_idx],
                "x": nx,
                "y": ny
            })
            
            edges.append({
                "source": "TGT-01",
                "target": node_id,
                "label": "LINKED"
            })
            
            # Sometimes link peripheral nodes together
            if i > 0 and random.random() > 0.5:
                prev_id = f"ND-{i:02d}"
                edges.append({
                    "source": prev_id,
                    "target": node_id,
                    "label": "RELATED"
                })
            
        return jsonify({"nodes": nodes, "links": edges})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/news", methods=["GET"])
def get_news():
    """GET /api/news?country=Vietnam&limit=25"""
    country = request.args.get("country", "").strip()
    if not country:
        return jsonify({"error": "Missing 'country' parameter"}), 400

    limit = request.args.get("limit", 25, type=int)
    limit = min(max(limit, 1), 50)

    try:
        articles = parse_google_news(country, max_results=limit)
        return jsonify({
            "country": country,
            "count": len(articles),
            "articles": articles,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/gdelt", methods=["GET"])
def get_gdelt():
    now = time.time()
    cache_key = "gdelt_feed"
    if cache_key in _cache:
        timestamp, cached_data = _cache[cache_key]
        if now - timestamp < CACHE_TTL * 5: # Cache for 5 mins
            return jsonify(cached_data)

    try:
        # Use Google News as a reliable, real-time OSINT source since GDELT API blocks python requests
        raw_articles = parse_google_news("world conflict war military crisis strike protest", max_results=25)
        
        tactical_feed = []
        for art in raw_articles:
            title = art.get('title', '')
            url_str = art.get('url', '')
            domain = art.get('source', '')
            seendate = art.get('publishedAt', '')
            
            # Determine tag based on title keywords
            tag = 'INFO'
            t_low = title.lower()
            if re.search(r'war|nuclear|dead|kill|attack|terror|missile|strike|assassination', t_low):
                tag = 'HIGH'
            elif re.search(r'protest|conflict|military|crisis|unrest|tension|clash|riot|warning', t_low):
                tag = 'MEDIUM'
            
            # Extract a pseudo-country based on keywords in title
            country = "Global"
            countries = ["Russia", "Ukraine", "Israel", "Iran", "China", "Taiwan", "USA", "UK", "France", "Germany", "Syria", "Lebanon", "Yemen", "Korea", "Sudan", "Mali", "Myanmar", "Mexico"]
            for c in countries:
                if c.lower() in t_low:
                    country = c
                    break

            tactical_feed.append({
                "id": str(uuid.uuid4()),
                "title": title,
                "url": url_str,
                "domain": domain,
                "timestamp": seendate,
                "language": "en",
                "country": country,
                "tag": tag
            })
        
        result = {"status": "success", "articles": tactical_feed}
        _cache[cache_key] = (now, result)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/forex/history", methods=["GET"])
def forex_history():
    """Proxy for Frankfurter API to avoid CORS issues.
    GET /api/forex/history?base=USD&target=EUR&start=2026-04-17&end=2026-05-17
    """
    base = request.args.get("base", "USD")
    target = request.args.get("target", "EUR")
    start = request.args.get("start", "")
    end = request.args.get("end", "")
    
    if not start or not end:
        return jsonify({"error": "Missing start/end dates"}), 400
    
    try:
        start_ts = int(datetime.datetime.strptime(start, "%Y-%m-%d").timestamp())
        end_ts = int(datetime.datetime.strptime(end, "%Y-%m-%d").timestamp())
        
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{base}{target}=X?period1={start_ts}&period2={end_ts}&interval=1d"
        resp = _session.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        res = data.get("chart", {}).get("result", [])
        if not res:
            return jsonify({"error": "No data found"}), 404
            
        timestamps = res[0].get("timestamp", [])
        closes = res[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
        
        rates = {}
        for i in range(len(timestamps)):
            if closes[i] is not None:
                dt = datetime.datetime.fromtimestamp(timestamps[i]).strftime("%Y-%m-%d")
                rates[dt] = {target: closes[i]}
                
        return jsonify({"rates": rates})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/market-terminal", methods=["GET"])
def get_market_terminal():
    try:
        import requests
        symbols_str = request.args.get('symbols', "BTC-USD,ETH-USD,GC=F,CL=F,EURUSD=X,GBPUSD=X,JPY=X,^GSPC,^IXIC,^TNX")
        symbols = symbols_str.split(',')
        url = f"https://query2.finance.yahoo.com/v8/finance/spark?symbols={symbols_str}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=10)
        data = resp.json()
        
        NAMES = {
            'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'GC=F': 'Gold Futures', 'CL=F': 'Crude Oil',
            'EURUSD=X': 'EUR/USD', 'GBPUSD=X': 'GBP/USD', 'JPY=X': 'USD/JPY',
            '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ', '^TNX': '10-Year Yield', '^IRX': '13-Week T-Bill'
        }
        
        results = []
        for sym in symbols:
            if sym in data:
                close_arr = data[sym].get('close', [])
                if close_arr:
                    current_price = next((x for x in reversed(close_arr) if x is not None), None)
                    if current_price is not None:
                        prev_close = data[sym].get('previousClose', current_price)
                        change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
                        results.append({
                            "symbol": sym,
                            "name": NAMES.get(sym, sym),
                            "price": current_price,
                            "changePercent": change_pct
                        })
        return jsonify({"markets": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/radiation", methods=["GET"])
def get_radiation():
    # Use deterministic time-based calculation to simulate real baseline global background radiation (0.10 - 0.15 nSv/h)
    # This replaces the fast Math.random() jitter with a slow, stable real-time projection
    import time
    import math
    
    current_time = time.time()
    # 0.12 baseline + 0.02 variation based on a slow sine wave over a 24-hour cycle
    variation = math.sin(current_time / 3600.0) * 0.02
    # Add a tiny micro-fluctuation based on minutes
    micro = math.cos(current_time / 60.0) * 0.005
    
    val = round(0.12 + variation + micro, 3)
    return jsonify({"nSv_h": val, "status": "NORMAL", "timestamp": current_time})

@app.route("/api/censorship", methods=["GET"])
def get_censorship():
    cache_key = "CENSORSHIP"
    now = time.time()
    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if now - cached_time < 3600:
            return jsonify(cached_data)
            
    try:
        raw = parse_google_news('internet blackout OR internet shutdown OR internet censorship OR bgp hijack OR internet restricted', max_results=10)
        incidents = []
        for r in raw:
            incidents.append({
                "title": r.get('title', ''),
                "link": r.get('url', ''),
                "date": r.get('publishedAt', '')
            })
        result = {"incidents": incidents}
    except Exception as e:
        print(f"[Censorship Error] {e}")
        result = {"error": str(e), "incidents": []}
        
    _cache[cache_key] = (now, result)
    return jsonify(result)

@app.route("/api/chokepoints", methods=["GET"])
def get_chokepoints():
    # Dynamic threat assessment based on real-time news volume
    try:
        import requests
        import feedparser
        import urllib.parse
        
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        chokepoints = [
            {"id": "bab_el_mandeb", "name": "Bab el-Mandeb", "keywords": "Red Sea Houthi ship attack"},
            {"id": "hormuz", "name": "Strait of Hormuz", "keywords": "Hormuz ship seized Iran"},
            {"id": "taiwan", "name": "Taiwan Strait", "keywords": "Taiwan Strait military drills PLAN"},
            {"id": "panama", "name": "Panama Canal", "keywords": "Panama Canal drought transit"},
            {"id": "suez", "name": "Suez Canal", "keywords": "Suez Canal ship stuck blocked"}
        ]
        
        results = []
        for cp in chokepoints:
            q = urllib.parse.quote(cp["keywords"])
            news_url = f"https://news.google.com/rss/search?q={q}+when:7d&hl=en-US&gl=US&ceid=US:en"
            feed = feedparser.parse(requests.get(news_url, headers=headers, timeout=5).content)
            
            # Simple NLP: Threat level depends on news volume
            count = len(feed.entries)
            level = "NORMAL"
            if count > 15:
                level = "CRITICAL"
            elif count > 5:
                level = "ELEVATED"
                
            results.append({
                "id": cp["id"],
                "name": cp["name"],
                "level": level,
                "recent_incidents": count
            })
            
        return jsonify({"chokepoints": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ravenx-news-backend"})

# YT-DLP / YOUTUBE SEARCH WEB CAMS
@app.route("/api/webcam/search", methods=["GET"])
def search_webcam():
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"error": "Missing city parameter"}), 400
    
    # 1. Search YouTube for '{city} live street cam'
    try:
        search = VideosSearch(f"{city} live street cam", limit=15)
        results = search.result().get('result', [])
        
        target_video = None
        for res in results:
            # Check if duration is missing AND it has an ID
            if res.get('id') and (res.get('duration') is None or 'LIVE' in str(res.get('title', '')).upper()):
                target_video = res
                break
        
        if not target_video:
            if results and results[0].get('id'):
                 target_video = results[0]
            else:
                 return jsonify({"error": "No cameras found"}), 404
            
        video_id = target_video.get('id')
        video_title = target_video.get('title', 'Unknown Stream')
        
        if not video_id:
             return jsonify({"error": "Failed to extract Video ID"}), 500
        
        # Return instantly without yt-dlp to fix slow loading and CORS issues
        return jsonify({
            "city": city,
            "title": video_title,
            "videoId": video_id,
            "url": f"https://www.youtube.com/watch?v={video_id}"
        })
        
    except Exception as e:
        print(f"Error extracting webcam: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/tv/search", methods=["GET"])
def search_tv():
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400
    
    try:
        import requests
        import re
        import random
        
        # EgJAAQ%253D%253D is the base64 encoded YouTube filter for 'Features: Live'
        # %253D%253D is URL-encoded ==
        url = f"https://www.youtube.com/results?search_query={query}+live+news&sp=EgJAAQ%253D%253D"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(url, headers=headers, timeout=10)
        html = resp.text
        
        # Extract videoIds
        video_ids = re.findall(r'"videoId":"([^"]{11})"', html)
        
        seen = set()
        unique_ids = []
        for vid in video_ids:
            if vid not in seen:
                seen.add(vid)
                unique_ids.append(vid)
                
        if unique_ids:
            # Keep top 20 and shuffle them so it's always fresh
            live_videos = unique_ids[:20]
            random.shuffle(live_videos)
        else:
            live_videos = []
            
        return jsonify({"videoIds": live_videos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/corporate/filings", methods=["GET"])
def get_sec_filings():
    try:
        import feedparser
        import requests
        
        headers = {'User-Agent': 'RavenX Tactical Intelligence Dashboard (admin@ravenx.local)'}
        
        # Form 4 (Insider Trading)
        f4_url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&company=&dateb=&owner=include&start=0&count=20&output=atom"
        f4_resp = requests.get(f4_url, headers=headers, timeout=10)
        f4_feed = feedparser.parse(f4_resp.content)
        
        # Form 8-K (Material Events)
        f8k_url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-k&company=&dateb=&owner=include&start=0&count=20&output=atom"
        f8k_resp = requests.get(f8k_url, headers=headers, timeout=10)
        f8k_feed = feedparser.parse(f8k_resp.content)
        
        filings = []
        for entry in f4_feed.entries:
            filings.append({
                "id": entry.id if hasattr(entry, 'id') else entry.link,
                "title": entry.title,
                "link": entry.link,
                "updated": entry.updated,
                "type": "FORM_4"
            })
            
        for entry in f8k_feed.entries:
            filings.append({
                "id": entry.id if hasattr(entry, 'id') else entry.link,
                "title": entry.title,
                "link": entry.link,
                "updated": entry.updated,
                "type": "FORM_8K"
            })
            
        filings.sort(key=lambda x: x["updated"], reverse=True)
        return jsonify({"filings": filings[:40]})
    except Exception as e:
        print(f"Error fetching SEC filings: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/humanitarian", methods=["GET"])
def get_humanitarian_data():
    try:
        import feedparser
        import requests
        import urllib.parse
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        events = []
        
        # 1. GDACS Disasters
        gdacs_url = "https://www.gdacs.org/xml/rss.xml"
        gdacs_feed = feedparser.parse(gdacs_url)
        for entry in gdacs_feed.entries[:20]:
            level = entry.get('gdacs_alertlevel', 'Unknown')
            events.append({
                "id": entry.id if hasattr(entry, 'id') else entry.link,
                "title": entry.title,
                "link": entry.link,
                "updated": entry.get('published', entry.get('updated', '')),
                "type": "DISASTER",
                "severity": level.upper()
            })
            
        # 2. Humanitarian / Refugee / NGO
        q = urllib.parse.quote("UNHCR OR Refugee Crisis OR Humanitarian NGO")
        ngo_url = f"https://news.google.com/rss/search?q={q}+when:7d&hl=en-US&gl=US&ceid=US:en"
        ngo_resp = requests.get(ngo_url, headers=headers, timeout=10)
        ngo_feed = feedparser.parse(ngo_resp.content)
        for entry in ngo_feed.entries[:20]:
            events.append({
                "id": entry.id if hasattr(entry, 'id') else entry.link,
                "title": entry.title,
                "link": entry.link,
                "updated": entry.get('published', entry.get('updated', '')),
                "type": "REFUGEE_NGO",
                "severity": "INFO"
            })
            
        return jsonify({"events": events})
    except Exception as e:
        print(f"Error fetching Humanitarian Intel: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/monetary", methods=["GET"])
def get_monetary_policy():
    try:
        import feedparser
        import requests
        import xml.etree.ElementTree as ET
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        
        # 1. Macro Calendar (ForexFactory)
        calendar = []
        try:
            ff_url = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml"
            ff_resp = requests.get(ff_url, headers=headers, timeout=10)
            root = ET.fromstring(ff_resp.content)
            for event in root.findall('event'):
                impact = event.find('impact').text
                if impact in ['High', 'Medium']:
                    calendar.append({
                        "title": event.find('title').text,
                        "country": event.find('country').text,
                        "impact": impact,
                        "forecast": event.find('forecast').text,
                        "previous": event.find('previous').text,
                        "date": event.find('date').text,
                        "time": event.find('time').text
                    })
        except Exception as e:
            print(f"Error fetching ForexFactory: {e}")

        # 2. Central Bank RSS (Fed & ECB)
        banks = []
        try:
            fed_url = "https://www.federalreserve.gov/feeds/press_all.xml"
            fed_feed = feedparser.parse(requests.get(fed_url, headers=headers, timeout=10).content)
            for entry in fed_feed.entries[:15]:
                banks.append({
                    "bank": "FED",
                    "title": entry.title,
                    "link": entry.link,
                    "updated": entry.get('published', entry.get('updated', ''))
                })
        except Exception as e:
            print(f"Error fetching FED RSS: {e}")
            
        try:
            ecb_url = "https://www.ecb.europa.eu/rss/press.html"
            ecb_feed = feedparser.parse(requests.get(ecb_url, headers=headers, timeout=10).content)
            for entry in ecb_feed.entries[:15]:
                banks.append({
                    "bank": "ECB",
                    "title": entry.title,
                    "link": entry.link,
                    "updated": entry.get('published', entry.get('updated', ''))
                })
        except Exception as e:
            print(f"Error fetching ECB RSS: {e}")
            
        return jsonify({"calendar": calendar, "banks": banks})
    except Exception as e:
        print(f"Error in Monetary API: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/trends", methods=["GET"])
def get_search_trends():
    try:
        import requests
        import feedparser
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        url = "https://trends.google.com/trending/rss?geo=US"
        
        resp = requests.get(url, headers=headers, timeout=10)
        feed = feedparser.parse(resp.content)
        
        trends = []
        for entry in feed.entries[:20]:
            traffic = entry.get('ht_approx_traffic', 'Unknown')
            image = entry.get('ht_picture', '')
            news = []
            
            # feedparser parses custom namespace tags as entry.namespace_tag
            # but sometimes it groups them differently.
            # Usually ht:news_item -> entry.ht_news_item
            if 'ht_news_item' in entry:
                news_items = entry.ht_news_item if isinstance(entry.ht_news_item, list) else [entry.ht_news_item]
                # However, feedparser often drops nested tags inside custom tags if not configured properly,
                # so we might just have entry.description which contains HTML.
            
            # Fallback: We can just use the main entry title and link, and description.
            desc = entry.get('description', '')
            
            trends.append({
                "query": entry.title,
                "traffic": traffic,
                "link": entry.link,
                "image": image,
                "published": entry.get('published', ''),
                "description": desc
            })
            
        return jsonify({"trends": trends})
    except Exception as e:
        print(f"Error fetching Google Trends: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/macro", methods=["GET"])
def get_macro_feeds():
    try:
        import requests
        import feedparser
        import urllib.parse
        
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        # 1. US National Debt
        debt = None
        try:
            debt_url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&limit=1"
            resp = requests.get(debt_url, timeout=10).json()
            if 'data' in resp and len(resp['data']) > 0:
                data = resp['data'][0]
                debt = {
                    "date": data['record_date'],
                    "amount": float(data['tot_pub_debt_out_amt'])
                }
        except Exception as e:
            print(f"Error fetching US Debt: {e}")
            
        # 2. OPEC & Supply Chain News
        news = []
        try:
            q = urllib.parse.quote("OPEC OR Global Supply Chain OR Commodity Logistics")
            news_url = f"https://news.google.com/rss/search?q={q}+when:7d&hl=en-US&gl=US&ceid=US:en"
            feed = feedparser.parse(requests.get(news_url, headers=headers, timeout=10).content)
            for entry in feed.entries[:15]:
                news.append({
                    "title": entry.title,
                    "link": entry.link,
                    "updated": entry.get('published', entry.get('updated', '')),
                    "category": "SUPPLY_CHAIN"
                })
        except Exception as e:
            print(f"Error fetching Supply Chain News: {e}")
            
        # 3. COT Proxy (CFTC/Trade)
        try:
            q_cot = urllib.parse.quote("CFTC Commitments of Traders")
            cot_url = f"https://news.google.com/rss/search?q={q_cot}+when:14d&hl=en-US&gl=US&ceid=US:en"
            feed_cot = feedparser.parse(requests.get(cot_url, headers=headers, timeout=10).content)
            for entry in feed_cot.entries[:10]:
                news.append({
                    "title": entry.title,
                    "link": entry.link,
                    "updated": entry.get('published', entry.get('updated', '')),
                    "category": "COT_REPORT"
                })
        except Exception as e:
            print(f"Error fetching COT News: {e}")
            
        # Shuffle or sort news loosely by date
        # (Since we append, we can sort by updated roughly, or leave as is)
        
        return jsonify({
            "debt": debt,
            "news": news
        })
    except Exception as e:
        print(f"Error in Macro API: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/polymarket", methods=["GET"])
def get_polymarket_odds():
    try:
        import requests
        url = "https://gamma-api.polymarket.com/events?active=true&closed=false&limit=100"
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=10)
        data = resp.json()
        
        target_tags = ["Politics", "War", "Middle East", "Elections", "World", "Economy", "Crypto", "Business", "Macro", "Global"]
        
        markets_data = []
        for event in data:
            tags = [t.get('label', '') for t in event.get('tags', [])]
            if any(tag in target_tags for tag in tags):
                for market in event.get('markets', []):
                    vol = market.get('volume', 0)
                    if vol is None: vol = 0
                    vol = float(vol)
                    
                    if vol > 50000:  # Only significant markets
                        try:
                            odds_list = __import__('json').loads(market.get('outcomePrices', '["0", "0"]'))
                        except Exception:
                            odds_list = ["0", "0"]
                            
                        markets_data.append({
                            "question": market.get('question'),
                            "volume": vol,
                            "odds": odds_list
                        })
                        
        markets_data.sort(key=lambda x: x['volume'], reverse=True)
        return jsonify({"markets": markets_data[:20]})
    except Exception as e:
        print(f"Error fetching Polymarket: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/space-weather", methods=["GET"])
def get_space_weather():
    try:
        import requests as req
        import datetime

        result = {}

        # 1. Kp-Index (Geomagnetic Activity 0-9)
        try:
            r = req.get("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json", timeout=8)
            kp_data = r.json()
            recent = [d for d in kp_data if d.get('estimated_kp') is not None][-24:]
            result['kp'] = {
                'current': recent[-1]['estimated_kp'] if recent else 0,
                'time': recent[-1]['time_tag'] if recent else '',
                'history': [{'time': d['time_tag'], 'value': d['estimated_kp']} for d in recent]
            }
        except Exception as e:
            print(f"Kp error: {e}")
            result['kp'] = {'current': 0, 'history': []}

        # 2. X-Ray Flux (Solar Flares indicator)
        try:
            r = req.get("https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json", timeout=8)
            xray_data = r.json()
            recent_x = [d for d in xray_data if d.get('flux') is not None][-1:]
            if recent_x:
                flux = recent_x[0]['flux']
                if flux >= 1e-4:
                    flare_class = 'X'
                elif flux >= 1e-5:
                    flare_class = 'M'
                elif flux >= 1e-6:
                    flare_class = 'C'
                else:
                    flare_class = 'B'
                result['xray'] = {'flux': flux, 'class': flare_class, 'time': recent_x[0]['time_tag']}
            else:
                result['xray'] = {'flux': 0, 'class': 'B', 'time': ''}
        except Exception as e:
            print(f"X-ray error: {e}")
            result['xray'] = {'flux': 0, 'class': 'B', 'time': ''}

        # 3. SWPC Alerts (last 10)
        try:
            r = req.get("https://services.swpc.noaa.gov/products/alerts.json", timeout=8)
            alerts_raw = r.json()
            alerts = []
            for a in alerts_raw[:10]:
                msg = a.get('message', '')
                title = msg.split('\n')[0].strip() if msg else ''
                code = a.get('product_id', '')
                severity = 'INFO'
                if 'G4' in msg or 'G5' in msg or 'X-class' in msg or 'EXTREME' in msg:
                    severity = 'CRITICAL'
                elif 'G2' in msg or 'G3' in msg or 'M-class' in msg or 'WATCH' in code:
                    severity = 'WARNING'
                alerts.append({
                    'time': a.get('issue_datetime', ''),
                    'code': code,
                    'title': title[:100],
                    'severity': severity
                })
            result['alerts'] = alerts
        except Exception as e:
            print(f"Alerts error: {e}")
            result['alerts'] = []

        # 4. NASA DONKI CME (last 7 days)
        try:
            start = (datetime.datetime.now() - datetime.timedelta(days=7)).strftime('%Y-%m-%d')
            r = req.get(f"https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate={start}", timeout=10)
            cme_data = r.json()
            cmes = []
            for c in cme_data[-8:]:
                cme_id = c.get('activityID', '')
                # Pull best speed/angle from CME analyses
                speed = None
                half_angle = None
                earth_directed = False
                for analysis in c.get('cmeAnalyses', []) or []:
                    if analysis.get('isMostAccurate'):
                        speed = analysis.get('speed')
                        half_angle = analysis.get('halfAngle')
                        enlil_list = analysis.get('enlilList') or []
                        for enlil in enlil_list:
                            if enlil.get('isEarthGB'):
                                earth_directed = True
                cmes.append({
                    'time': c.get('startTime', ''),
                    'note': (c.get('note', '') or '')[:150],
                    'speed': speed,
                    'half_angle': half_angle,
                    'earth_directed': earth_directed,
                    'link': f"https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/-1/-1"
                })
            result['cme'] = list(reversed(cmes))
        except Exception as e:
            print(f"CME error: {e}")
            result['cme'] = []

        # 5. Solar Wind (Speed, Density)
        try:
            r = req.get("https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json", timeout=8)
            wind_data = r.json()
            # Find the latest entry that actually has data
            latest_wind = None
            for w in reversed(wind_data):
                if w.get('proton_speed') is not None and w.get('proton_density') is not None:
                    latest_wind = w
                    break
            
            if latest_wind:
                result['wind'] = {
                    'speed': latest_wind.get('proton_speed', 0),
                    'density': latest_wind.get('proton_density', 0),
                    'temp': latest_wind.get('proton_temperature', 0),
                    'time': latest_wind.get('time_tag', '')
                }
            else:
                result['wind'] = None
        except Exception as e:
            print(f"Solar wind error: {e}")
            result['wind'] = None

        # 5. Aurora forecast based on Kp
        kp_val = result['kp']['current']
        aurora_lat = max(30, 90 - (kp_val * 6.5))
        if kp_val >= 7:
            aurora_label = "EXTREME — Visible at mid-latitudes"
        elif kp_val >= 5:
            aurora_label = "ACTIVE — Visible above 55°N"
        elif kp_val >= 3:
            aurora_label = "MODERATE — Visible above 65°N"
        else:
            aurora_label = "QUIET — Visible above 70°N only"
        result['aurora'] = {'kp': kp_val, 'min_lat': round(aurora_lat, 1), 'label': aurora_label}

        return jsonify(result)
    except Exception as e:
        print(f"Space Weather API error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/weather-alerts", methods=["GET"])
def get_weather_alerts():
    try:
        import requests as req
        import feedparser
        import datetime
        from dateutil import parser
        
        alerts = []

        # 1. NWS Active Alerts (US)
        try:
            headers = {"User-Agent": "RavenXTacticalDashboard/1.0"}
            r = req.get("https://api.weather.gov/alerts/active", headers=headers, timeout=8)
            nws_data = r.json()
            features = nws_data.get('features', [])
            
            severe_types = ['Tornado Warning', 'Tornado Emergency', 'Hurricane Warning', 'Flash Flood Warning', 'Tsunami Warning', 'Severe Thunderstorm Warning', 'Extreme Wind Warning']
            
            for f in features:
                props = f.get('properties', {})
                event = props.get('event', '')
                severity_level = props.get('severity', '') # Extreme, Severe, Moderate, Minor, Unknown
                
                # Filter logic
                if event in severe_types or severity_level in ['Extreme', 'Severe']:
                    lvl = 'CRITICAL' if severity_level == 'Extreme' or 'Tornado' in event or 'Tsunami' in event else 'SEVERE'
                    alerts.append({
                        'id': props.get('id'),
                        'source': 'NWS',
                        'type': event,
                        'headline': props.get('headline', ''),
                        'area': props.get('areaDesc', ''),
                        'severity': lvl,
                        'time': props.get('effective', ''),
                        'link': props.get('@id', ''),
                        'timestamp': parser.parse(props.get('effective', '')).timestamp() if props.get('effective') else 0
                    })
        except Exception as e:
            print(f"NWS error: {e}")

        # 2. GDACS Global Alerts
        try:
            feed = feedparser.parse("https://www.gdacs.org/xml/rss.xml")
            for entry in feed.entries:
                # GDACS Alert Score (Orange, Red)
                alert_level = entry.get('gdacs_alertlevel', 'Green').upper()
                if alert_level in ['ORANGE', 'RED']:
                    lvl = 'CRITICAL' if alert_level == 'RED' else 'SEVERE'
                    
                    # Try to parse time
                    try:
                        dt = parser.parse(entry.published)
                        ts = dt.timestamp()
                        time_str = dt.isoformat()
                    except:
                        ts = 0
                        time_str = entry.published

                    alerts.append({
                        'id': entry.link,
                        'source': 'GDACS',
                        'type': entry.get('gdacs_eventtype', 'Disaster'),
                        'headline': entry.title,
                        'area': entry.get('gdacs_country', 'Global'),
                        'severity': lvl,
                        'time': time_str,
                        'link': entry.link,
                        'timestamp': ts
                    })
        except Exception as e:
            print(f"GDACS error: {e}")

        # Sort by timestamp descending
        alerts.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Limit to top 30 to avoid overwhelming the UI
        return jsonify({"alerts": alerts[:30]})
        
    except Exception as e:
        print(f"Weather Alerts API error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/seismic", methods=["GET"])
def get_seismic_data():
    try:
        import requests as req
        
        # Fetch M2.5+ earthquakes from the past day
        r = req.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson", timeout=10)
        data = r.json()
        
        features = data.get('features', [])
        quakes = []
        
        for f in features:
            props = f.get('properties', {})
            geom = f.get('geometry', {})
            coords = geom.get('coordinates', [0, 0, 0]) # [lon, lat, depth]
            
            quakes.append({
                'id': f.get('id'),
                'mag': props.get('mag', 0),
                'place': props.get('place', 'Unknown location'),
                'time': props.get('time', 0), # Unix timestamp in milliseconds
                'url': props.get('url', ''),
                'tsunami': props.get('tsunami', 0),
                'sig': props.get('sig', 0),
                'depth': coords[2] if len(coords) > 2 else 0,
                'lat': coords[1] if len(coords) > 1 else 0,
                'lon': coords[0] if len(coords) > 0 else 0
            })
            
        # Sort by time descending (newest first)
        quakes.sort(key=lambda x: x['time'], reverse=True)
        
        # We also want to compute the max magnitude of the day for the summary
        max_mag = max([q['mag'] for q in quakes]) if quakes else 0
        max_quake = next((q for q in quakes if q['mag'] == max_mag), None)
        
        return jsonify({
            'count': len(quakes),
            'max_mag': max_mag,
            'max_quake': max_quake,
            'quakes': quakes[:50] # Return top 50 recent
        })
        
    except Exception as e:
        print(f"Seismic API error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/cables", methods=["GET"])
def get_cables_data():
    try:
        import requests as req
        import concurrent.futures
        
        # List of highly strategic intercontinental subsea cables
        STRATEGIC_CABLES = [
            "2africa", "sea-me-we-3", "sea-me-we-4", "sea-me-we-5", "sea-me-we-6",
            "asia-pacific-gateway-apg", "asia-america-gateway-aag-cable-system",
            "marea", "faster", "dunant", "grace-hopper", "amitite", "jupiter",
            "pacific-light-cable-network-plcn", "seacom-tata-tgn-eurasia",
            "peace-cable", "hawaiki", "southern-cross-cable-network-sccn",
            "tata-tgn-atlantic", "flag-europe-asia-fea", "flag-atlantic-1-fa-1",
            "arctic-connect", "ella-link", "equiano", "firmina", "havfrue-aec-2",
            "indigo-west", "monet", "sacs-south-atlantic-cable-system",
            "sail-south-atlantic-inter-link", "brics-cable", "sea-us",
            "polarnet", "gulf-bridge-international-gbi", "imewe", "aae-1"
        ]
        
        cables = []
        
        def fetch_cable(cable_id):
            try:
                res = req.get(f"https://www.submarinecablemap.com/api/v3/cable/{cable_id}.json", timeout=10)
                if res.status_code == 200:
                    return res.json()
            except:
                pass
            return None

        # Fetch in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = executor.map(fetch_cable, STRATEGIC_CABLES)
            
        for data in results:
            if data:
                cables.append({
                    'id': data.get('id', ''),
                    'name': data.get('name', 'Unknown Cable'),
                    'rfs': data.get('rfs', 'N/A'),
                    'length': data.get('length', 'N/A'),
                    'owners': data.get('owners', 'Unknown')
                })
            
        # Sort by length descending
        def parse_length(l_str):
            try:
                if not l_str or l_str == 'N/A': return 0
                clean = ''.join(c for c in str(l_str) if c.isdigit() or c == '.')
                return float(clean) if clean else 0
            except:
                return 0
                
        cables.sort(key=lambda x: parse_length(x['length']), reverse=True)
        
        return jsonify({
            'count': len(cables), # Note: we only fetched a subset, but it's the high-value ones
            'cables': cables
        })
        
    except Exception as e:
        print(f"Cables API error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/fires", methods=["GET"])
def get_fires_data():
    try:
        import requests as req
        import csv
        import io
        import reverse_geocoder as rg
        
        # NASA FIRMS MODIS 24h CSV feed (Global)
        url = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv"
        r = req.get(url, timeout=15)
        r.raise_for_status()
        
        reader = csv.DictReader(io.StringIO(r.text))
        fires = []
        for row in reader:
            try:
                lat = float(row.get('latitude', 0))
                lon = float(row.get('longitude', 0))
                frp = float(row.get('frp', 0)) # Fire Radiative Power (MW)
                bright = float(row.get('brightness', 0))
                conf = int(row.get('confidence', 0))
                
                # Filter out low confidence noise
                if conf >= 20:
                    fires.append({
                        'lat': lat,
                        'lon': lon,
                        'frp': frp,
                        'bright': bright,
                        'conf': conf,
                        'time': row.get('acq_time', '')
                    })
            except:
                continue
                
        # Sort by FRP descending so the most massive fires are at the top
        fires.sort(key=lambda x: x['frp'], reverse=True)
        
        # Reverse geocode the top 200 (the ones sent to frontend anyway) to save time, 
        # or do all of them. rg is fast enough for all.
        coords_list = [(f['lat'], f['lon']) for f in fires]
        rg_results = rg.search(coords_list, mode=1)
        
        for i, f in enumerate(fires):
            if i < len(rg_results):
                res = rg_results[i]
                # Format: "City, CC"
                f['location'] = f"{res.get('name', 'Unknown')}, {res.get('cc', 'XX')}"
            else:
                f['location'] = "Unknown Location"
                
        return jsonify({
            'count': len(fires),
            'fires': fires
        })
        
    except Exception as e:
        print(f"Fires API error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/aqi", methods=["GET"])
def get_aqi_data():
    try:
        import requests as req
        import time
        
        cache_key = "global_aqi_v1"
        now = time.time()
        if cache_key in _cache and (now - _cache[cache_key][0] < 600): # 10 mins cache
            return jsonify(_cache[cache_key][1])
            
        r = req.get("https://restcountries.com/v3.1/all?fields=name,capitalInfo,cca2", timeout=10)
        countries = r.json()
        
        valid_countries = []
        for c in countries:
            if c.get('capitalInfo', {}).get('latlng'):
                lat, lon = c['capitalInfo']['latlng']
                valid_countries.append({
                    'name': c['name']['common'],
                    'cc': c['cca2'],
                    'lat': lat,
                    'lon': lon
                })
                
        chunk_size = 50
        results = []
        
        for i in range(0, len(valid_countries), chunk_size):
            chunk = valid_countries[i:i+chunk_size]
            lats = ",".join([str(round(c['lat'], 2)) for c in chunk])
            lons = ",".join([str(round(c['lon'], 2)) for c in chunk])
            
            url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lats}&longitude={lons}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone"
            resp = req.get(url, timeout=15)
            
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict):
                    data = [data]
                    
                for idx, loc_data in enumerate(data):
                    if 'current' in loc_data:
                        c_info = chunk[idx]
                        aqi = loc_data['current'].get('us_aqi')
                        if aqi is None: aqi = 0
                        results.append({
                            'country': c_info['name'],
                            'cc': c_info['cc'],
                            'aqi': aqi,
                            'pm10': loc_data['current'].get('pm10', 0),
                            'pm2_5': loc_data['current'].get('pm2_5', 0),
                            'co': loc_data['current'].get('carbon_monoxide', 0),
                            'no2': loc_data['current'].get('nitrogen_dioxide', 0),
                            'o3': loc_data['current'].get('ozone', 0)
                        })
                        
        results.sort(key=lambda x: x['aqi'] if x['aqi'] else -1, reverse=True)
        
        response_data = {
            'count': len(results),
            'data': results
        }
        
        _cache[cache_key] = (now, response_data)
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"AQI API error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/nuclear", methods=["GET"])
def get_nuclear_data():
    try:
        # 1. Fetch URA 30-day data (Yahoo Finance proxy for Uranium)
        ura_url = "https://query1.finance.yahoo.com/v8/finance/chart/URA?range=1mo&interval=1d"
        ura_resp = _session.get(ura_url, timeout=10).json()
        ura_prices = ura_resp['chart']['result'][0]['indicators']['quote'][0]['close']
        timestamps = ura_resp['chart']['result'][0]['timestamp']
        
        history = []
        for t, p in zip(timestamps, ura_prices):
            if p is not None:
                dt = datetime.fromtimestamp(t).strftime('%Y-%m-%d')
                history.append({"date": dt, "price": round(p, 2)})

        # 2. Fetch Google News RSS for Intel Feed
        feed_url = "https://news.google.com/rss/search?q=nuclear+reactor+radiation+IAEA+when:24h&hl=en-US&gl=US&ceid=US:en"
        feed = feedparser.parse(feed_url)
        intel_feed = []
        for entry in feed.entries[:15]:
            intel_feed.append({
                "time": datetime.now().strftime("%H:%M:%S UTC"),
                "title": entry.title,
                "link": entry.link
            })
            
        # 3. Fetch Wikipedia for Global Grid
        wiki_url = 'https://en.wikipedia.org/wiki/Nuclear_power_by_country'
        html = _session.get(wiki_url, timeout=10).text
        in_use = 416
        being_built = 60
        
        try:
            import re
            match = re.search(r'World</b>.*?</td>\s*<td>([0-9,]+)\s*</td>\s*<td>([0-9,]+)\s*</td>\s*<td>([0-9,]+)\s*</td>', html, re.DOTALL)
            if match:
                in_use = int(match.group(1).replace(',', ''))
                being_built = int(match.group(3).replace(',', ''))
        except Exception:
            pass
            
        decommissioned = 210 # estimate
        
        # Hardcode Top 5 by capacity to avoid heavy pandas dependency on Vercel
        top_5 = [
            {"country": "United States", "capacity": 95835},
            {"country": "France", "capacity": 61370},
            {"country": "China", "capacity": 54152},
            {"country": "Japan", "capacity": 31679},
            {"country": "Russia", "capacity": 29274}
        ]
            
        return jsonify({
            "status": {
                "operational": in_use,
                "construction": being_built,
                "decommissioned": decommissioned,
                "total": in_use + being_built + decommissioned
            },
            "top_5": top_5,
            "uranium_history": history,
            "intel_feed": intel_feed
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return jsonify({'error': 'USERNAME AND PASSWORD REQUIRED'}), 400
    if len(username) < 3:
        return jsonify({'error': 'USERNAME TOO SHORT — MIN 3 CHARACTERS'}), 400
    if len(password) < 6:
        return jsonify({'error': 'PASSWORD TOO SHORT — MIN 6 CHARACTERS'}), 400
    password_hash = generate_password_hash(password)
    token = str(uuid.uuid4())
    try:
        client = get_db()
        check_rs = client.execute('SELECT id FROM users WHERE username = ?', [username])
        if len(check_rs.rows) > 0:
            return jsonify({'error': 'USERNAME ALREADY EXISTS — CHOOSE ANOTHER'}), 409
            
        rs = client.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id',
            [username, password_hash]
        )
        user_id = rs.rows[0][0]
        client.execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, user_id])
        client.close()
        return jsonify({'token': token, 'user': {'id': user_id, 'username': username}})
    except libsql_client.LibsqlError as e:
        return jsonify({'error': 'USERNAME ALREADY EXISTS — CHOOSE ANOTHER'}), 409
    except Exception as e:
        return jsonify({'error': f'SERVER ERROR: {str(e)}'}), 500


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    try:
        client = get_db()
        rs = client.execute(
            'SELECT id, username, password_hash FROM users WHERE username = ?',
            [username]
        )
        if len(rs.rows) == 0:
            return jsonify({'error': 'INVALID CREDENTIALS'}), 401
        user = row_to_dict(rs)
    except Exception as e:
        return jsonify({'error': f'DATABASE CONNECTION FAILED: {str(e)}'}), 500
    
    if not check_password_hash(user['password_hash'], password):
        client.close()
        return jsonify({'error': 'INVALID CREDENTIALS — ACCESS DENIED'}), 401
        
    token = str(uuid.uuid4())
    client.execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, user['id']])
    client.close()
    return jsonify({'token': token, 'user': {'id': user['id'], 'username': user['username']}})


@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    user = get_user_from_token(request)
    if not user:
        return jsonify({'error': 'UNAUTHORIZED'}), 401
    token = request.headers.get('Authorization', '')[7:].strip()
    client = get_db()
    client.execute('DELETE FROM sessions WHERE token = ?', [token])
    client.close()
    return jsonify({'status': 'SESSION TERMINATED'})


@app.route('/api/auth/update', methods=['PUT'])
def auth_update():
    user = get_user_from_token(request)
    if not user:
        return jsonify({'error': 'UNAUTHORIZED'}), 401
    data = request.get_json() or {}
    
    client = get_db()
    # Change username
    if 'username' in data:
        new_username = (data['username'] or '').strip()
        if len(new_username) < 3:
            client.close()
            return jsonify({'error': 'USERNAME TOO SHORT — MIN 3 CHARACTERS'}), 400
        try:
            client.execute('UPDATE users SET username = ? WHERE id = ?', [new_username, user['id']])
            client.close()
            return jsonify({'user': {'id': user['id'], 'username': new_username}})
        except libsql_client.LibsqlError:
            client.close()
            return jsonify({'error': 'USERNAME ALREADY TAKEN'}), 409
            
    # Change password
    if 'old_password' in data and 'new_password' in data:
        rs = client.execute('SELECT * FROM users WHERE id = ?', [user['id']])
        db_user = row_to_dict(rs)
        
        if not check_password_hash(db_user['password_hash'], data['old_password']):
            client.close()
            return jsonify({'error': 'CURRENT PASSWORD INCORRECT'}), 403
            
        if len(data['new_password']) < 6:
            client.close()
            return jsonify({'error': 'NEW PASSWORD TOO SHORT — MIN 6 CHARACTERS'}), 400
            
        new_hash = generate_password_hash(data['new_password'])
        client.execute('UPDATE users SET password_hash = ? WHERE id = ?', [new_hash, user['id']])
        client.close()
        return jsonify({'status': 'PASSWORD UPDATED'})
        
    client.close()
    return jsonify({'error': 'NO VALID FIELDS PROVIDED'}), 400


# ─── Layout Persistence Endpoints ─────────────────────────────────────────────

@app.route('/api/layout', methods=['GET'])
def get_layout():
    user = get_user_from_token(request)
    if not user:
        return jsonify({'error': 'UNAUTHORIZED'}), 401
    client = get_db()
    rs = client.execute('SELECT layout_json FROM user_layouts WHERE user_id = ?', [user['id']])
    row = row_to_dict(rs)
    client.close()
    if not row:
        return jsonify({'layout': None})
    return jsonify({'layout': json.loads(row['layout_json'])})


@app.route('/api/layout', methods=['POST'])
def save_layout():
    user = get_user_from_token(request)
    if not user:
        return jsonify({'error': 'UNAUTHORIZED'}), 401
    data = request.get_json() or {}
    layout = data.get('layout')
    if not layout:
        return jsonify({'error': 'NO LAYOUT DATA'}), 400
    layout_json = json.dumps(layout)
    client = get_db()
    client.execute('''
        INSERT INTO user_layouts (user_id, layout_json, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            layout_json = excluded.layout_json,
            updated_at = CURRENT_TIMESTAMP
    ''', [user['id'], layout_json])
    client.close()
    return jsonify({'status': 'LAYOUT SAVED'})

# ─── Caching and Mock Data for Proxies ───
proxy_cache = {}

@app.route("/api/proxy/gdelt", methods=["GET"])
def proxy_gdelt():
    now = time.time()
    if "gdelt" in proxy_cache and now - proxy_cache["gdelt"]["time"] < 300:
        return jsonify(proxy_cache["gdelt"]["data"])
    try:
        url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=conflict+protest+violence+attack+war+bombing&mode=ArtList&maxrecords=250&format=json&timespan=1d'
        r = _session.get(url, timeout=5)
        data = r.json()
        proxy_cache["gdelt"] = {"time": now, "data": data}
        return jsonify(data)
    except Exception as e:
        print(f"[GDELT Proxy Error] {e}")
        # Return mock data if GDELT is down so the map still looks cool
        mock_data = {
            "articles": [
                {"title": "Escalation in border conflict", "sourcecountry": "SY", "tone": -8, "url": "#"},
                {"title": "Protests erupt in capital", "sourcecountry": "FR", "tone": -6, "url": "#"},
                {"title": "Military exercises in South China Sea", "sourcecountry": "CN", "tone": -3, "url": "#"},
                {"title": "Rebel forces claim new territory", "sourcecountry": "MM", "tone": -12, "url": "#"},
                {"title": "Cyberattack hits critical infrastructure", "sourcecountry": "UA", "tone": -9, "url": "#"},
                {"title": "Peacekeeping forces deployed", "sourcecountry": "SD", "tone": -2, "url": "#"},
                {"title": "Violent crackdown on demonstrators", "sourcecountry": "IR", "tone": -15, "url": "#"},
                {"title": "Drone strike destroys base", "sourcecountry": "YE", "tone": -14, "url": "#"},
                {"title": "Emergency UN session called", "sourcecountry": "US", "tone": -5, "url": "#"},
                {"title": "Border skirmish results in casualties", "sourcecountry": "IN", "tone": -11, "url": "#"}
            ]
        }
        return jsonify(mock_data)

def get_country_from_reg(reg):
    if not reg: return "UNKNOWN"
    r = reg.upper()
    if r.startswith("VN-"): return "Vietnam"
    if r.startswith("N"): return "United States"
    if r.startswith("B-"): return "China / Taiwan"
    if r.startswith("C-"): return "Canada"
    if r.startswith("G-"): return "United Kingdom"
    if r.startswith("F-"): return "France"
    if r.startswith("D-"): return "Germany"
    if r.startswith("JA"): return "Japan"
    if r.startswith("HL"): return "South Korea"
    if r.startswith("VT-"): return "India"
    if r.startswith("VH-"): return "Australia"
    if r.startswith("ZK-"): return "New Zealand"
    if r.startswith("9V-"): return "Singapore"
    if r.startswith("HS-"): return "Thailand"
    if r.startswith("PK-"): return "Indonesia"
    if r.startswith("9M-"): return "Malaysia"
    if r.startswith("RP-"): return "Philippines"
    if r.startswith("A6-"): return "UAE"
    if r.startswith("A7-"): return "Qatar"
    if r.startswith("RA-"): return "Russia"
    if r.startswith("UR-"): return "Ukraine"
    if r.startswith("EI-"): return "Ireland"
    if r.startswith("PH-"): return "Netherlands"
    if r.startswith("EC-"): return "Spain"
    if r.startswith("I-"): return "Italy"
    if r.startswith("TC-"): return "Turkey"
    if r.startswith("PT-") or r.startswith("PR-") or r.startswith("PP-"): return "Brazil"
    if r.startswith("LV-") or r.startswith("LQ-"): return "Argentina"
    if r.startswith("CC-"): return "Chile"
    if r.startswith("XA-") or r.startswith("XB-") or r.startswith("XC-"): return "Mexico"
    if r.startswith("OE-"): return "Austria"
    if r.startswith("OO-"): return "Belgium"
    if r.startswith("LZ-"): return "Bulgaria"
    if r.startswith("9A-"): return "Croatia"
    if r.startswith("OK-"): return "Czech Republic"
    if r.startswith("OY-"): return "Denmark"
    if r.startswith("OH-"): return "Finland"
    if r.startswith("SX-"): return "Greece"
    if r.startswith("HA-"): return "Hungary"
    if r.startswith("4X-"): return "Israel"
    if r.startswith("JY-"): return "Jordan"
    if r.startswith("9K-"): return "Kuwait"
    if r.startswith("OD-"): return "Lebanon"
    if r.startswith("5A-"): return "Libya"
    if r.startswith("CN-"): return "Morocco"
    if r.startswith("AP-"): return "Pakistan"
    if r.startswith("HZ-"): return "Saudi Arabia"
    if r.startswith("ZS-") or r.startswith("ZT-") or r.startswith("ZU-"): return "South Africa"
    if r.startswith("SE-"): return "Sweden"
    if r.startswith("HB-"): return "Switzerland"
    if r.startswith("SU-"): return "Egypt"
    if r.startswith("SP-"): return "Poland"
    if r.startswith("CS-"): return "Portugal"
    if r.startswith("YR-"): return "Romania"
    return "UNKNOWN"

@app.route("/api/proxy/aircraft", methods=["GET"])
def proxy_aircraft():
    now = time.time()
    
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    cache_key = f"aircraft_{lat}_{lon}" if lat and lon else "aircraft"
    
    if cache_key in proxy_cache and now - proxy_cache[cache_key]["time"] < 2:
        return jsonify(proxy_cache[cache_key]["data"])

    try:
        bounds_list = [
            '55,20,-130,-70', # North America
            '65,35,-10,35',   # Europe
            '45,5,90,145'     # East / SE Asia
        ]
        
        if lat and lon:
            # Insert user's local bounding box AT THE BEGINNING to ensure it doesn't get truncated by [:1500]
            lat = float(lat)
            lon = float(lon)
            local_bounds = f"{lat+15},{lat-15},{lon-15},{lon+15}"
            if local_bounds not in bounds_list:
                bounds_list.insert(0, local_bounds)
            
        states = []
        for bounds in bounds_list:
            try:
                url = f'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds={bounds}'
                r = _session.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}, timeout=5)
                r.raise_for_status()
                raw = r.json()
                
                for k, v in raw.items():
                    if k in ["full_count", "version"] or not isinstance(v, list) or len(v) < 17:
                        continue
            
                    icao = k
                    lat = v[1]
                    lon = v[2]
                    heading = v[3]
                    alt = v[4] * 0.3048 if v[4] else 0 # ft to m
                    vel = v[5] * 0.514444 if v[5] else 0 # kts to m/s
                    squawk = v[6]
                    callsign = v[16] or v[13] or v[9] or icao
                    reg = str(v[9]).strip() if v[9] else ""
                    origin = get_country_from_reg(reg)
                    if origin == "UNKNOWN" and reg:
                        origin = f"UNK ({reg})"
                    vspeed = v[15]
                    
                    if not lat or not lon: continue
                        
                    # Convert to OpenSky format expected by frontend:
                    # ["icao", "callsign", "origin", 0, 0, lon, lat, alt, False, vel, heading, vrate, null, squawk, null, False, 0]
                    states.append([
                        icao, callsign, origin, 0, 0, lon, lat, alt, False, vel, heading, vspeed, None, squawk, None, False, 0
                    ])
            except Exception as e:
                print(f"[Aircraft] Error fetching region {bounds}: {e}")
                continue
            
        states = states[:1500] # Increased limit for local bounds
            
        if not states and cache_key in proxy_cache:
            # If FR24 rate limited us and returned nothing, fallback to last known good cache!
            return jsonify(proxy_cache[cache_key]["data"])
            
        data = {"states": states, "source": "fr24", "count": len(states)}
        proxy_cache[cache_key] = {"time": now, "data": data}
        return jsonify(data)
    except Exception as e:
        print(f"[Aircraft Proxy Error] {e}")
        cached = proxy_cache.get(cache_key, {}).get("data")
        if cached: return jsonify(cached)
        return jsonify({"states": [], "error": str(e), "count": 0})

@app.route("/api/proxy/fires", methods=["GET"])
def proxy_fires():
    now = time.time()
    if "fires" in proxy_cache and now - proxy_cache["fires"]["time"] < 600:
        return jsonify(proxy_cache["fires"]["data"])
    try:
        url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/1f440c3df960c3e17b93319d22893e7f/MODIS_NRT/world/1'
        r = _session.get(url, timeout=5)
        proxy_cache["fires"] = {"time": now, "data": {"csv": r.text}}
        return jsonify({"csv": r.text})
    except Exception as e:
        print(f"[Fires Proxy Error] {e}")
        mock_csv = "latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight\n"
        mock_csv += "-14.2,-51.9,320.1,1.0,1.0,2023-10-01,1200,Aqua,85,6.1,300.1,15.2,D\n"
        mock_csv += "-1.2,113.9,330.5,1.0,1.0,2023-10-01,1200,Aqua,100,6.1,310.1,25.2,D\n"
        mock_csv += "39.1,-120.9,340.5,1.0,1.0,2023-10-01,1200,Aqua,95,6.1,305.1,45.2,D\n"
        mock_csv += "-33.8,151.2,315.5,1.0,1.0,2023-10-01,1200,Aqua,75,6.1,295.1,10.2,D\n"
        return jsonify({"csv": mock_csv})

@app.route("/api/proxy/satellites", methods=["GET"])
def proxy_satellites():
    now = time.time()
    if "satellites" in proxy_cache and now - proxy_cache["satellites"]["time"] < 3600:
        return jsonify({"tle": proxy_cache["satellites"]["data"]})
    try:
        url = 'https://db.satnogs.org/api/tle/?format=json'
        r = _session.get(url, headers={"Accept": "application/json"}, timeout=10)
        r.raise_for_status()
        sat_data = r.json()
        
        lines = []
        for sat in sat_data:
            tle0 = sat.get("tle0", "").replace("0 ", "").strip()
            tle1 = sat.get("tle1", "").strip()
            tle2 = sat.get("tle2", "").strip()
            if tle0 and tle1 and tle2:
                lines.extend([tle0, tle1, tle2])
                
        tle_text = "\n".join(lines)
        proxy_cache["satellites"] = {"time": now, "data": tle_text}
        return jsonify({"tle": tle_text})
    except Exception as e:
        print(f"[Satellites Proxy Error] {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/outbreaks", methods=["GET"])
def get_outbreaks():
    """Fetch disease outbreak intel from ReliefWeb and Google News"""
    cache_key = "OUTBREAKS"
    now = time.time()

    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if now - cached_time < CACHE_TTL:
            return jsonify(cached_data)

    outbreaks = []
    
    # 1. ReliefWeb API for official disasters (Epidemics)
    try:
        rw_url = "https://api.reliefweb.int/v1/disasters?appname=ravenx&profile=full&preset=latest&query[value]=type:Epidemic&limit=10"
        rw_resp = _session.get(rw_url, timeout=10)
        rw_data = rw_resp.json()
        for item in rw_data.get('data', []):
            fields = item.get('fields', {})
            name = fields.get('name', 'Unknown Epidemic')
            countries = fields.get('country', [])
            country_name = countries[0].get('name', 'Global') if countries else 'Global'
            iso3 = countries[0].get('iso3', '').upper() if countries else ''
            
            outbreaks.append({
                "id": f"rw_{item.get('id')}",
                "title": name,
                "url": fields.get('url', ''),
                "source": "RELIEF_WEB / WHO",
                "sourceType": "WHO_OFFICIAL",
                "timestamp": fields.get('date', {}).get('created', ''),
                "country": country_name,
                "iso3": iso3,
                "vector": "UNKNOWN",
                "severity": "EPIDEMIC"
            })
    except Exception as e:
        print(f"[Outbreaks] ReliefWeb fetch failed: {e}")

    # 2. Google News Scraper for fast OSINT alerts
    try:
        raw_articles = parse_google_news('virus OR outbreak OR epidemic OR pandemic OR mpox OR H5N1 OR cholera OR ebola OR marburg', max_results=30)
        
        for art in raw_articles:
            title = art.get('title', '')
            t_low = title.lower()
            
            # Simple NLP Tagging
            severity = "WATCHLIST"
            if re.search(r'pandemic|global emergency|deadly|kills|lockdown|quarantine', t_low):
                severity = "PANDEMIC"
            elif re.search(r'epidemic|surge|cases rise|outbreak|spreads', t_low):
                severity = "EPIDEMIC"
            elif re.search(r'alert|warning|detected|virus|strain', t_low):
                severity = "OUTBREAK"

            vector = "UNKNOWN"
            if re.search(r'bird flu|h5n1|swine|zoonotic|animal|bat|mosquito|dengue|malaria', t_low):
                vector = "ZOONOTIC"
            elif re.search(r'airborne|respiratory|covid|sars|cough', t_low):
                vector = "AIRBORNE"
            elif re.search(r'water|cholera|diarrhea|contamination', t_low):
                vector = "WATERBORNE"
            elif re.search(r'mpox|ebola|marburg|contact|blood', t_low):
                vector = "BLOODBORNE"
                
            # Extract pseudo-country
            country = "Global"
            countries = ["Congo", "DRC", "Sudan", "USA", "China", "India", "UK", "Vietnam", "Uganda", "Rwanda", "Haiti", "Brazil", "Mexico", "Bangladesh"]
            for c in countries:
                if c.lower() in t_low:
                    country = c
                    break
                    
            outbreaks.append({
                "id": art.get('id'),
                "title": title,
                "url": art.get('url', ''),
                "source": art.get('source', ''),
                "sourceType": "OSINT_NEWS",
                "timestamp": art.get('publishedAt', ''),
                "country": country,
                "iso3": "",
                "vector": vector,
                "severity": severity
            })
    except Exception as e:
        print(f"[Outbreaks] Google News fetch failed: {e}")

    result = {"status": "success", "alerts": outbreaks}
    _cache[cache_key] = (now, result)
    return jsonify(result)


@app.route("/api/ew-jamming", methods=["GET"])
def get_ew_jamming():
    """Fetch real-time GPS interference (NIC < 7) using ADS-B data from known EW hotspots"""
    cache_key = "EW_JAMMING"
    now = time.time()
    
    # Cache for 2 minutes to prevent spamming adsb.lol
    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if now - cached_time < 120:
            return jsonify(cached_data)

    hotspots = {
        "Eastern Med (Israel/Lebanon)": "33.0/35.0/250",
        "Black Sea (Crimea/Ukraine)": "44.0/34.0/250",
        "Baltic Sea (Kaliningrad)": "55.0/20.0/250",
        "Moscow (Russia)": "55.7/37.6/250",
        "Korean Peninsula (DMZ)": "38.0/127.0/250",
        "Red Sea (Yemen/Houthi)": "15.0/42.0/250",
        "Persian Gulf (Iran)": "26.0/54.0/250",
        "Taiwan Strait": "24.0/120.0/250"
    }

    jammed_flights = []
    zones = []

    try:
        for zone_name, coords in hotspots.items():
            url = f"https://api.adsb.lol/v2/point/{coords}"
            resp = _session.get(url, timeout=8)
            
            if resp.status_code == 200:
                data = resp.json()
                ac_list = data.get('ac', [])
                
                # Filter for NIC < 7 (Navigation Integrity degraded)
                # Flights missing nic will be ignored (or assumed good)
                zone_jammed = []
                for ac in ac_list:
                    nic = ac.get('nic', 11)
                    if nic < 7:
                        flight_data = {
                            "hex": ac.get("hex", "UNKNOWN"),
                            "flight": ac.get("flight", "").strip() or "UNKNOWN",
                            "lat": ac.get("lat"),
                            "lon": ac.get("lon"),
                            "alt_baro": ac.get("alt_baro", 0),
                            "nic": nic,
                            "zone": zone_name
                        }
                        # Make sure lat/lon are valid
                        if flight_data["lat"] and flight_data["lon"]:
                            zone_jammed.append(flight_data)
                
                jammed_flights.extend(zone_jammed)
                
                if zone_jammed:
                    zones.append({
                        "name": zone_name,
                        "impacted_count": len(zone_jammed),
                        "severity": "CRITICAL" if len(zone_jammed) > 10 else "HIGH" if len(zone_jammed) > 5 else "MEDIUM",
                        "avg_nic": round(sum([f["nic"] for f in zone_jammed]) / len(zone_jammed), 1)
                    })
    except Exception as e:
        print(f"[EW Jamming Error] {e}")

    result = {
        "status": "success", 
        "total_impacted": len(jammed_flights),
        "zones": zones,
        "flights": jammed_flights,
        "timestamp": datetime.now().isoformat()
    }
    
    _cache[cache_key] = (now, result)
    return jsonify(result)

@app.route("/api/military-bases", methods=["GET"])
def get_military_bases():
    """Fetch global military bases from Wikidata using SPARQL"""
    cache_key = "MILITARY_BASES"
    now = time.time()
    
    # Cache for 24 hours since bases don't move often
    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if now - cached_time < 86400:
            return jsonify(cached_data)

    query = '''
    SELECT ?itemLabel ?countryLabel ?coord WHERE {
      ?item wdt:P31/wdt:P279* wd:Q245016.
      ?item wdt:P17 ?country.
      ?item wdt:P625 ?coord.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 2000
    '''
    
    url = 'https://query.wikidata.org/sparql'
    headers = {'User-Agent': 'RavenX-Tactical/1.0 (test)'}
    
    bases = []
    try:
        resp = _session.get(url, params={'format': 'json', 'query': query}, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            bindings = data.get('results', {}).get('bindings', [])
            
            for b in bindings:
                name = b.get('itemLabel', {}).get('value', 'Unknown Base')
                country = b.get('countryLabel', {}).get('value', 'Unknown')
                coord_str = b.get('coord', {}).get('value', '')
                
                # Parse "Point(-115.811111 37.235)"
                if coord_str.startswith('Point('):
                    parts = coord_str.replace('Point(', '').replace(')', '').split()
                    if len(parts) == 2:
                        lon = float(parts[0])
                        lat = float(parts[1])
                        
                        # Categorize base visually by keyword
                        b_type = "GENERAL"
                        n_lower = name.lower()
                        if any(x in n_lower for x in ['naval', 'fleet', 'submarine', 'port', 'maritime']): b_type = "NAVAL"
                        elif any(x in n_lower for x in ['air', 'afb', 'aerodrome', 'aviation']): b_type = "AIR"
                        elif any(x in n_lower for x in ['radar', 'station', 'intelligence', 'sigint']): b_type = "SIGINT"
                        elif any(x in n_lower for x in ['missile', 'nuclear', 'silo', 'strategic']): b_type = "STRATEGIC"
                        
                        bases.append({
                            "name": name,
                            "country": country,
                            "lat": lat,
                            "lon": lon,
                            "type": b_type,
                            "id": str(uuid.uuid4())[:8]
                        })
    except Exception as e:
        print(f"[Military Bases Fetch Error] {e}")

    result = {
        "status": "success",
        "count": len(bases),
        "bases": bases,
        "timestamp": datetime.now().isoformat()
    }
    
    _cache[cache_key] = (now, result)
    return jsonify(result)


@app.route("/api/ai/chat", methods=["POST"])
def proxy_ai_chat():
    user = get_user_from_token(request)
    if not user:
        return jsonify({"error": "UNAUTHORIZED ACCESS"}), 401

    data = request.get_json() or {}
    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        return jsonify({"error": "GROQ_API_KEY not configured on server"}), 500

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {groq_key}"
    }

    try:
        req = _session.post(url, json=data, headers=headers, stream=True, timeout=60)
        
        if req.status_code != 200:
            return jsonify({"error": f"Upstream API Error: {req.status_code}", "details": req.text}), req.status_code

        def generate():
            for chunk in req.iter_content(chunk_size=1024):
                if chunk:
                    yield chunk

        return Response(stream_with_context(generate()), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/seismic", methods=["GET"])
def get_seismic():
    try:
        import requests
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
        resp = requests.get(url, timeout=10)
        data = resp.json()
        
        features = data.get("features", [])
        quakes = []
        max_mag = 0
        max_quake = None
        
        for f in features:
            props = f.get("properties", {})
            geom = f.get("geometry", {})
            mag = props.get("mag")
            if mag is None: continue
            
            quake_obj = {
                "id": f.get("id"),
                "mag": mag,
                "place": props.get("place"),
                "time": props.get("time"),
                "tsunami": props.get("tsunami"),
                "url": props.get("url"),
                "depth": geom.get("coordinates", [0,0,0])[2] if len(geom.get("coordinates", [])) > 2 else 0
            }
            quakes.append(quake_obj)
            
            if mag > max_mag:
                max_mag = mag
                max_quake = quake_obj
                
        return jsonify({
            "count": len(quakes),
            "max_mag": max_mag,
            "max_quake": max_quake,
            "quakes": quakes
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/webcam/search", methods=["GET"])
def webcam_search():
    city = request.args.get("city", "Tokyo")
    try:
        import urllib.request
        import urllib.parse
        import re
        query = urllib.parse.quote(f"{city} live cam")
        url = f"https://www.youtube.com/results?search_query={query}&sp=EgJAAQ%253D%253D"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        video_ids = re.findall(r"watch\?v=(\S{11})", html)
        unique_ids = list(dict.fromkeys(video_ids))
        if unique_ids:
            return jsonify({"videoId": unique_ids[0], "title": f"Live Camera: {city}"})
        return jsonify({"error": "No live cameras found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


import platform
import psutil
import threading

START_TIME = time.time()

@app.route("/api/logs", methods=["GET"])
def get_system_logs():
    try:
        uptime_seconds = int(time.time() - START_TIME)
        m, s = divmod(uptime_seconds, 60)
        h, m = divmod(m, 60)
        uptime_str = f"{h:02d}h {m:02d}m {s:02d}s"
        
        process = psutil.Process()
        mem_info = process.memory_info()
        
        return jsonify({
            "os": f"{platform.system()} {platform.release()}",
            "python_version": platform.python_version(),
            "uptime": uptime_str,
            "active_threads": threading.active_count(),
            "memory_usage_mb": round(mem_info.rss / 1024 / 1024, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trace", methods=["GET"])
def trace_ip():
    target = request.args.get('q')
    if not target:
        return jsonify({"error": "Missing target"}), 400
    try:
        # Resolve hostname to IP using socket if it's a domain, but ip-api supports domains natively.
        r = requests.get(f"http://ip-api.com/json/{target}", timeout=5)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("=" * 50)
    print("  RAVENX NEWS BACKEND")
    print("  Google News RSS Feed API")
    print("  http://localhost:5000/api/news?country=Vietnam")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=True)
