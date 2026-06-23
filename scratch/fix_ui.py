import os

def fix_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replacements = [
    ('animate-pulse box-glow', 'border-2'),
    ('`0 0 20px ${node.color}40, inset 0 0 10px ${node.color}40`', '`inset 0 0 4px ${node.color}20`'),
    ('text-glow', 'text-white'),
    ('`0 0 4px ${node.color}, 0 0 8px #000, 0 0 12px #000`', '`0 1px 2px #000`'),
    ('`0 0 15px ${selectedNode.color}30`', "'none'")
]

fix_file('tactical-ui/src/components/LinkAnalysis.jsx', replacements)
print("Fixed LinkAnalysis.jsx")

# Fix LocalAirRadar.jsx colors and glows
radar_replacements = [
    ('text-cyan-400', 'text-cyan-500/70'),
    ('text-cyan-500', 'text-cyan-600/70'),
    ('border-cyan-500/50', 'border-white/10'),
    ('border-cyan-500/20', 'border-white/5'),
    ('bg-cyan-900/20', 'bg-white/5'),
    ('bg-cyan-500/20', 'bg-white/10'),
    ('shadow-[0_0_15px_cyan]', 'shadow-none'),
    ('from-cyan-500/20', 'from-cyan-500/5')
]
fix_file('tactical-ui/src/components/LocalAirRadar.jsx', radar_replacements)
print("Fixed LocalAirRadar.jsx")

# Fix CountryIntel.jsx
intel_replacements = [
    ('text-cyan-400', 'text-cyan-500/70'),
    ('bg-cyan-400/20', 'bg-cyan-500/10'),
    ('border-cyan-400/20', 'border-white/5'),
    ('bg-cyan-400/10', 'bg-white/5'),
    ('shadow-[0_0_8px_#22d3ee]', 'shadow-none')
]
fix_file('tactical-ui/src/components/CountryIntel.jsx', intel_replacements)
print("Fixed CountryIntel.jsx")
