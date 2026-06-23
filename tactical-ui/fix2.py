import re

with open('src/components/OverlayLayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all <Tooltip className="tactical-tooltip"> with <Tooltip className="tactical-tooltip" direction="top" offset={[0, -15]} opacity={1}>
# And <Tooltip className="tactical-tooltip" sticky> with <Tooltip className="tactical-tooltip" sticky direction="top" offset={[0, -15]} opacity={1}>
content = content.replace('<Tooltip className="tactical-tooltip">', '<Tooltip className="tactical-tooltip" direction="top" offset={[0, -15]} opacity={1}>')
content = content.replace('<Tooltip className="tactical-tooltip" sticky>', '<Tooltip className="tactical-tooltip" sticky direction="top" offset={[0, -15]} opacity={1}>')

with open('src/components/OverlayLayers.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
