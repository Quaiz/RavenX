import re

with open('src/components/OverlayLayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the tip function
tip_func_regex = r"const tip = \([\s\S]*?</div>`;"
tooltip_comp = '''const TacticalTooltip = ({ lines, accentColor = '#ffb800' }) => (
  <div style={{ background: 'rgba(5,7,10,0.93)', border: `1px solid ${accentColor}35`, padding: '6px 10px', fontFamily: '\\'Courier New\\', monospace', fontSize: '9px', minWidth: '140px', pointerEvents: 'none' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ color: i === 0 ? accentColor : `rgba(255,255,255,${i === 1 ? 0.7 : 0.4})`, fontWeight: i === 0 ? 'bold' : 'normal', marginTop: i > 0 ? '2px' : '0px' }}>
        {l}
      </div>
    ))}
  </div>
);'''
content = re.sub(tip_func_regex, tooltip_comp, content)

# Replace all <span dangerouslySetInnerHTML={{ __html: tip( ... ) }} />
span_regex = r"<span dangerouslySetInnerHTML=\{\{ __html: tip\(\[([\s\S]*?)\],\s*([^)]+)\) \}\}\s*/>"

def repl(match):
    lines_arr = match.group(1).strip()
    color = match.group(2).strip()
    return f"<TacticalTooltip lines={{[{lines_arr}]}} accentColor={{{color}}} />"

content = re.sub(span_regex, repl, content)

span_regex_no_color = r"<span dangerouslySetInnerHTML=\{\{ __html: tip\(\[([\s\S]*?)\]\) \}\}\s*/>"
def repl_no_color(match):
    lines_arr = match.group(1).strip()
    return f"<TacticalTooltip lines={{[{lines_arr}]}} />"
content = re.sub(span_regex_no_color, repl_no_color, content)

with open('src/components/OverlayLayers.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
