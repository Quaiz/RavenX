"""Quick test: check what source info Google News RSS actually provides."""
import feedparser
from urllib.parse import quote

country = "Vietnam"
url = f"https://news.google.com/rss/search?q={quote(country)}&hl=en&gl=US&ceid=US:en"
feed = feedparser.parse(url)

for i, entry in enumerate(feed.entries[:3]):
    print(f"=== Entry {i} ===")
    print(f"Title: {entry.get('title', 'N/A')}")
    print(f"Link: {entry.get('link', 'N/A')[:100]}")
    
    # Check for source sub-element
    if hasattr(entry, 'source'):
        print(f"Source: {entry.source}")
    
    # Check all keys
    print(f"Keys: {list(entry.keys())}")
    
    # Print description snippet
    desc = entry.get('description', '')[:500]
    print(f"Description: {desc}")
    print()
