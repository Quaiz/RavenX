import re

with open('src/components/OverlayLayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Resize icons
replacements = {
    "chokeIcon = (risk) => mkDot(risk === 'HIGH' ? '#ef4444' : risk === 'MEDIUM' ? '#ffb800' : '#22c55e', 12);":
    "chokeIcon = (risk) => mkDot(risk === 'HIGH' ? '#ef4444' : risk === 'MEDIUM' ? '#ffb800' : '#22c55e', 8);",
    
    "portIcon    = () => mkDot('#38bdf8', 8);":
    "portIcon    = () => mkDot('#38bdf8', 6);",
    
    "nuclearIcon = () => mkDot('#22d3ee', 9);":
    "nuclearIcon = () => mkDot('#22d3ee', 6);",
    
    "baseIcon    = () => mkTriangle('#a855f7', 12);":
    "baseIcon    = () => mkTriangle('#a855f7', 8);",
    
    "volcanoIcon = (status) => mkTriangle(status === 'ERUPTING' ? '#ef4444' : '#f97316', 14);":
    "volcanoIcon = (status) => mkTriangle(status === 'ERUPTING' ? '#ef4444' : '#f97316', 10);",
    
    "gpsIcon     = () => mkPulse('#ef4444', 60);":
    "gpsIcon     = () => mkPulse('#ef4444', 40);",
    
    "osintIcon   = (sev) => mkDot(sev === 'HIGH' ? '#ef4444' : sev === 'MEDIUM' ? '#ffb800' : '#22c55e', 8);":
    "osintIcon   = (sev) => mkDot(sev === 'HIGH' ? '#ef4444' : sev === 'MEDIUM' ? '#ffb800' : '#22c55e', 6);",
    
    "outageIcon  = () => mkDot('#ef4444', 10);":
    "outageIcon  = () => mkDot('#ef4444', 6);",
    
    "borderIcon  = () => mkDot('#eab308', 8);":
    "borderIcon  = () => mkDot('#eab308', 6);",
    
    "iconSize: [20, 20], iconAnchor: [10, 10],":
    "iconSize: [14, 14], iconAnchor: [7, 7],",
    
    "iconSize: [14, 14], iconAnchor: [7, 7]":
    "iconSize: [10, 10], iconAnchor: [5, 5]"
}

for old, new_val in replacements.items():
    content = content.replace(old, new_val)
    
# 2. Add Popup to react-leaflet imports
content = content.replace('CircleMarker, Marker, Tooltip, GeoJSON, TileLayer, Polyline, useMap', 'CircleMarker, Marker, Tooltip, GeoJSON, TileLayer, Polyline, useMap, Popup')

# 3. Replace TacticalTooltip definition
old_tooltip = '''const TacticalTooltip = ({ lines, accentColor = '#ffb800' }) => (
  <div style={{ background: 'rgba(5,7,10,0.93)', border: `1px solid ${accentColor}35`, padding: '6px 10px', fontFamily: '\\'Courier New\\', monospace', fontSize: '9px', minWidth: '140px', pointerEvents: 'none' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ color: i === 0 ? accentColor : `rgba(255,255,255,${i === 1 ? 0.7 : 0.4})`, fontWeight: i === 0 ? 'bold' : 'normal', marginTop: i > 0 ? '2px' : '0px' }}>
        {l}
      </div>
    ))}
  </div>
);'''

new_popup = '''const TacticalPopup = ({ title, fields, accentColor = '#22c55e' }) => (
  <div className="w-[280px] bg-[#05070a]/95 border border-white/10 shadow-2xl rounded-sm overflow-hidden flex flex-col font-mono text-[10px] pointer-events-auto">
    <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between" style={{ borderLeft: `3px solid ${accentColor}` }}>
      <span className="font-bold tracking-wider text-white/90 truncate">{title}</span>
    </div>
    <div className="p-3 flex flex-col gap-2">
      {fields.map((f, i) => (
        <div key={i} className="flex gap-4">
          <span className="text-white/40 uppercase w-[75px] shrink-0 tracking-wider">{f.label}</span>
          <span className="text-white/80" style={{ color: f.color || 'rgba(255,255,255,0.8)' }}>
            {f.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);'''
content = content.replace(old_tooltip, new_popup)

# 4. Replace <Tooltip ...> <TacticalTooltip lines={[...]} ... /> </Tooltip> with Popup logic
# Since this is complex string parsing, I will write specific replacements for each one or regex.
# I'll just regex the <Tooltip ...> ... </Tooltip> out and replace it.

def replace_tooltip(match):
    # match.group(1) is the array content of lines
    # match.group(2) is accentColor if present
    content_inside = match.group(1)
    
    # We will just parse the lines naive by assuming they are separated by commas at the top level
    # Actually, it's easier to just pass the lines array into a function that formats it for TacticalPopup.
    # But since React code requires valid JSX, we can just transform it.
    
    # Let's map old lines array to the new fields array.
    # lines: [title, line2, line3] -> title is lines[0], fields are [{label: 'INFO', value: line2}]
    # We can do this in JS!
    
    # In JS: 
    # title={lines[0]} fields={lines.slice(1).map(l => { const [k, v] = l.split(': '); return {label: k || 'INFO', value: v || l} })}
    pass

# Instead of complex regex, let's use a simpler approach.
# We replace <TacticalTooltip lines={ARRAY} accentColor={COLOR} /> 
# with <TacticalPopup title={ARRAY[0]} fields={ARRAY.slice(1).map(l => { ... })} accentColor={COLOR} />

# Actually, I'll just write the exact replacements for the files since there are ~18 of them.
