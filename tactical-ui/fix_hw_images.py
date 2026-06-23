import os
import re

filepath = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components\MilitaryHardware.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix image URLs: remove /thumb/ and the trailing /1200px-...
def clean_wiki_url(match):
    full_url = match.group(0)
    if '/thumb/' in full_url:
        # e.g., https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File.jpg/1200px-File.jpg
        # We want to extract https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg
        parts = full_url.split('/')
        # find the index of 'thumb'
        thumb_idx = parts.index('thumb')
        # the base file name is parts[-2]
        # the path without thumb and without the last element is parts[:thumb_idx] + parts[thumb_idx+1:-1]
        new_url = '/'.join(parts[:thumb_idx] + parts[thumb_idx+1:-1])
        return new_url
    return full_url

# Replace URLs in the code
content = re.sub(r"https://upload\.wikimedia\.org[^\']+", clean_wiki_url, content)

# Add referrerPolicy to img tag
content = content.replace(
    '<img src={selectedItem.image} alt={selectedItem.name}',
    '<img src={selectedItem.image} alt={selectedItem.name} referrerPolicy="no-referrer" onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }}'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Images fixed.")
