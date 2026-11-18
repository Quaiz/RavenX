import L from 'leaflet';

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/**
 * Compute the Earth's solar terminator polygon (night-side shadow) for a given Date.
 * Pure JS astronomical approximation — zero external dependencies (replaces leaflet-terminator/moment).
 */
export function createSolarTerminatorPolygon(date = new Date(), options = {}) {
  const julianDay = date.getTime() / 86400000 + 2440587.5;
  const n = julianDay - 2451545.0;

  // Mean longitude & mean anomaly of the Sun (degrees)
  const L_sun = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * D2R;

  // Ecliptic longitude & obliquity
  const lambda = (L_sun + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * D2R;
  const epsilon = (23.439 - 0.0000004 * n) * D2R;

  // Solar declination & right ascension
  const decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda)) * R2D;

  // Greenwich Mean Sidereal Time (degrees) & subsolar longitude
  const gmst = (280.46061837 + 360.98564736629 * n) % 360;
  const subsolarLon = ((ra - gmst + 540) % 360) - 180;

  const latLngs = [];
  const tanDecl = Math.tan(decl);

  for (let lon = -180; lon <= 180; lon += 2) {
    const ha = (lon - subsolarLon) * D2R;
    let lat = Math.atan(-Math.cos(ha) / (tanDecl || 1e-9)) * R2D;
    lat = Math.max(-89.9, Math.min(89.9, lat));
    latLngs.push([lat, lon]);
  }

  // Close polygon over the night pole (South if decl > 0, North if decl <= 0)
  const nightPole = decl > 0 ? -90 : 90;
  latLngs.push([nightPole, 180]);
  latLngs.push([nightPole, -180]);

  return L.polygon(latLngs, {
    fillColor: '#000000',
    fillOpacity: 0.5,
    interactive: false,
    color: '#ffffff',
    weight: 1,
    opacity: 0.5,
    ...options,
  });
}
