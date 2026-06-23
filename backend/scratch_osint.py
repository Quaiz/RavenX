import requests
import json
import random
import urllib.parse
import re

def generate_osint_graph(target):
    target_safe = urllib.parse.quote(target)
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=links|extracts&exintro&titles={target_safe}&pllimit=50&format=json"
    
    try:
        res = requests.get(url, timeout=5).json()
        pages = res.get('query', {}).get('pages', {})
        page = list(pages.values())[0]
        
        if page.get('pageid') is None:
            return {"error": "Target not found"}
            
        target_title = page.get('title', target)
        extract = page.get('extract', '')
        # Clean HTML tags
        extract_clean = re.sub('<[^<]+>', '', extract).strip()[:150] + '...'
        
        links = [l['title'] for l in page.get('links', [])]
        
        # Filter out Wikipedia meta pages
        filtered_links = [l for l in links if ":" not in l and not l.startswith("List of")]
        
        # Pick up to 7 random links to form the network
        selected_links = random.sample(filtered_links, min(7, len(filtered_links)))
        
        nodes = []
        edges = []
        
        # Center Node
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
        
        node_types = ["PERSON", "ORGANIZATION", "LOCATION", "DATABASE", "NETWORK"]
        icons = ["User", "Shield", "MapPin", "Database", "Globe"]
        colors = ["#4ade80", "#ffb800", "#00f2ff", "#a855f7", "#ffffff"]
        
        # Connected Nodes
        for i, link in enumerate(selected_links):
            node_id = f"ND-{i+1:02d}"
            # Randomly assign a type to make it look tactical
            n_type_idx = random.randint(0, len(node_types)-1)
            
            nodes.append({
                "id": node_id,
                "type": node_types[n_type_idx],
                "label": link.upper(),
                "desc": "Extracted via Open Source Intelligence",
                "color": colors[n_type_idx],
                "size": 1.0,
                "icon": icons[n_type_idx]
            })
            
            edges.append({
                "source": "TGT-01",
                "target": node_id,
                "label": "LINKED"
            })
            
        return {"nodes": nodes, "links": edges}
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print(json.dumps(generate_osint_graph("Russia"), indent=2))
