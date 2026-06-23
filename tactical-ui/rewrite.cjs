const fs = require('fs');

let content = fs.readFileSync('src/components/OverlayLayers.jsx', 'utf8');

// 1. Marker Size Reduction
const replacements = {
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
    
    "iconSize: [20, 20], iconAnchor: [10, 10]":
    "iconSize: [14, 14], iconAnchor: [7, 7]",
    
    "iconSize: [14, 14], iconAnchor: [7, 7]":
    "iconSize: [10, 10], iconAnchor: [5, 5]"
};

for (const [oldVal, newVal] of Object.entries(replacements)) {
    content = content.replace(oldVal, newVal);
}

// 2. Import Popup
content = content.replace('CircleMarker, Marker, Tooltip, GeoJSON, TileLayer, Polyline, useMap', 'CircleMarker, Marker, Tooltip, GeoJSON, TileLayer, Polyline, useMap, Popup');

// 3. Replace TacticalTooltip with TacticalPopup
const oldTooltipRegex = /const TacticalTooltip = \([\s\S]*?\);\n/g;
const newPopup = `const TacticalPopup = ({ lines, accentColor = '#22c55e' }) => {
  const title = lines[0] || 'UNKNOWN';
  const fields = lines.slice(1).map(l => {
    if (!l) return null;
    const parts = l.split(':');
    if (parts.length > 1) {
      return { label: parts[0].trim().substring(0, 10), value: parts.slice(1).join(':').trim() };
    }
    return { label: 'INFO', value: l };
  }).filter(Boolean);

  return (
    <div className="w-[280px] bg-[#05070a]/95 border border-white/10 shadow-2xl rounded-sm overflow-hidden flex flex-col font-mono text-[10px] pointer-events-auto">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between" style={{ borderLeft: \`3px solid \${accentColor}\` }}>
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
  );
};
`;
content = content.replace(oldTooltipRegex, newPopup);

// 4. Replace Tooltip tags
content = content.replace(/<Tooltip className="tactical-tooltip" direction="top" offset=\{\[0, -15\]\} opacity=\{1\}>/g, '<Popup className="tactical-popup" closeButton={false}>');
content = content.replace(/<Tooltip className="tactical-tooltip" sticky direction="top" offset=\{\[0, -15\]\} opacity=\{1\}>/g, '<Popup className="tactical-popup" closeButton={false}>');
content = content.replace(/<\/Tooltip>/g, '</Popup>');
content = content.replace(/<TacticalTooltip/g, '<TacticalPopup');

fs.writeFileSync('src/components/OverlayLayers.jsx', content);
