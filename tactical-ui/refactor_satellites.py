import re

with open('src/components/OverlayLayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the SATELLITES useEffect block
sat_effect_regex = r"  // ── SATELLITES: Celestrak TLEs \+ satellite\.js ────────────────────────────────[\s\S]*?\}, \[active\.includes\('SATELLITES'\)\]\);"
content = re.sub(sat_effect_regex, "", content)

# 2. Remove the satellites state from OverlayLayers
state_regex = r"  const \[satellites, setSatellites\]     = useState\(\[\]\);\n  const satIntervalRef                  = useRef\(null\);\n  const satTlesRef                      = useRef\(\[\]\);\n"
content = re.sub(state_regex, "", content)

# 3. Create the new SatelliteLayer component right before TerminatorLayer
satellite_comp = """function SatelliteLayer() {
  const [satellites, setSatellites] = useState([]);
  const satIntervalRef = useRef(null);
  const satTlesRef = useRef([]);

  useEffect(() => {
    const loadTle = async () => {
      try {
        const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle');
        const text = await res.text();
        const lines = text.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
        const tles = [];
        for (let i = 0; i < lines.length; i += 3) {
          if (lines[i] && lines[i+1] && lines[i+2]) {
            tles.push({ name: lines[i], tle1: lines[i+1], tle2: lines[i+2] });
          }
        }
        satTlesRef.current = tles.slice(0, 30);
      } catch (e) {
        console.warn('Failed to fetch Celestrak TLEs', e);
      }
    };

    const updatePositions = () => {
      if (!satTlesRef.current.length) return;
      const now = new Date();
      const updated = satTlesRef.current.map(sat => {
        try {
          const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
          const positionAndVelocity = satellite.propagate(satrec, now);
          const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, satellite.gstime(now));
          return {
            name: sat.name,
            lat: satellite.degreesLat(positionGd.latitude),
            lon: satellite.degreesLong(positionGd.longitude),
            alt: positionGd.height,
            vel: Math.sqrt(
              Math.pow(positionAndVelocity.velocity.x, 2) + 
              Math.pow(positionAndVelocity.velocity.y, 2) + 
              Math.pow(positionAndVelocity.velocity.z, 2)
            ) * 3600 // km/h
          };
        } catch (e) { return null; }
      }).filter(Boolean);
      setSatellites(updated);
    };

    loadTle().then(() => {
      updatePositions();
      satIntervalRef.current = setInterval(updatePositions, 100);
    });

    return () => clearInterval(satIntervalRef.current);
  }, []);

  if (satellites.length === 0) return null;

  return (
    <>
      {satellites.map((sat, i) => (
        <Marker key={`sat-${i}`} position={[sat.lat, sat.lon]} icon={satIcon()}>
          <Popup className="tactical-popup" closeButton={false}>
            <TacticalPopup lines={[sat.name,
              `ALT: ${Math.round(sat.alt)} km`,
              `VEL: ${Math.round(sat.vel)} km/h`,
              `${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`]} accentColor={'#38bdf8'} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ─── Terminator Layer (DAY/NIGHT) ──────────────────────────────────────────────"""
content = content.replace("// ─── Terminator Layer (DAY/NIGHT) ──────────────────────────────────────────────", satellite_comp)

# 4. Replace the old SATELLITES rendering block with the new component
render_regex = r"      \{\/\* ── SATELLITES ── \*\/\}\n      \{active\.includes\('SATELLITES'\) && satellites\.map\(\(sat, i\) => \([\s\S]*?\)\)\}\n"
content = re.sub(render_regex, "      {/* ── SATELLITES ── */}\n      {active.includes('SATELLITES') && <SatelliteLayer />}\n", content)

with open('src/components/OverlayLayers.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
