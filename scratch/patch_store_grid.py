import os

filepath = 'tactical-ui/src/store.js'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find window management start
start_idx = -1
for i, line in enumerate(lines):
    if '// ── Window Management System ──' in line:
        start_idx = i
        break

# Find where it ends
end_idx = -1
for i in range(start_idx, len(lines)):
    if 'setActiveView: (view) => set({ activeView: view }),' in lines[i]:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    grid_state = """ // ── Rigid Grid Layout State ──
  graphQueue: [],
  sendToGraph: (entity) => set(state => {
    const exists = state.graphQueue.find(e => e.id === entity.id);
    if (exists) return state;
    return { graphQueue: [...state.graphQueue, entity] };
  }),
  clearGraphQueue: () => set({ graphQueue: [] }),

  activeWorkspace: 1,
  switchWorkspace: (id) => set({ activeWorkspace: id }),

  leftSidebar: { isOpen: false, activeTab: 'MODULES' },
  rightSidebar: { isOpen: false, activeModuleId: null },
  bottomDrawer: { isOpen: false, activeModuleId: null, height: 300 },
  
  toggleLeftSidebar: () => set(state => ({ leftSidebar: { ...state.leftSidebar, isOpen: !state.leftSidebar.isOpen }})),
  openRightSidebar: (moduleId) => set(state => ({ rightSidebar: { isOpen: true, activeModuleId: moduleId }})),
  closeRightSidebar: () => set(state => ({ rightSidebar: { ...state.rightSidebar, isOpen: false }})),
  openBottomDrawer: (moduleId) => set(state => ({ bottomDrawer: { ...state.bottomDrawer, isOpen: true, activeModuleId: moduleId }})),
  closeBottomDrawer: () => set(state => ({ bottomDrawer: { ...state.bottomDrawer, isOpen: false }})),
  setBottomDrawerHeight: (h) => set(state => ({ bottomDrawer: { ...state.bottomDrawer, height: h }})),

  loadLayout: (layout) => {
    // legacy layout loader ignored for grid architecture
    return {};
  },

  toggleModule: (id) => set(state => {
      const RIGHT_MODULES = ['COUNTRY_INTEL', 'LOCAL_AIR_RADAR', 'NUCLEAR_FACILITIES', 'WANTED_CRIMINALS', 'DISEASE_OUTBREAKS', 'MILITARY_BASES', 'MILITARY_HARDWARE', 'SPACE_WEATHER', 'WEATHER_ALERTS', 'NASA_FIRES', 'SEISMIC', 'AIR_QUALITY', 'CENSORSHIP', 'HUMANITARIAN', 'GPS_JAMMING', 'POWER_GRIDS'];
      const BOTTOM_MODULES = ['OSINT_FEED', 'MARKET_TERMINAL', 'GLOBAL_NEWS', 'MACRO_FEEDS', 'MONETARY_POLICY', 'PREDICTION_MARKETS', 'GOOGLE_TRENDS', 'LIVE_WEBCAMS', 'WORLD_CLOCK', 'CRYPTO', 'FOREX', 'CORPORATE_INTEL', 'MARITIME_INTEL', 'AIS_VESSELS'];

      let nextOverlays = state.mapConfig.activeOverlays;
      if (id === 'FLIGHT_TRACKING') {
          if (!nextOverlays.includes('ADSB_AIRCRAFT')) nextOverlays = [...nextOverlays, 'ADSB_AIRCRAFT'];
          else nextOverlays = nextOverlays.filter(o => o !== 'ADSB_AIRCRAFT');
      }
      if (id === 'SATELLITE_TRACKING') {
          if (!nextOverlays.includes('SATELLITES')) nextOverlays = [...nextOverlays, 'SATELLITES'];
          else nextOverlays = nextOverlays.filter(o => o !== 'SATELLITES');
      }

      const updates = { mapConfig: { ...state.mapConfig, activeOverlays: nextOverlays } };

      if (RIGHT_MODULES.includes(id)) {
          if (state.rightSidebar.activeModuleId === id && state.rightSidebar.isOpen) {
              updates.rightSidebar = { ...state.rightSidebar, isOpen: false };
          } else {
              updates.rightSidebar = { isOpen: true, activeModuleId: id };
          }
      } else if (BOTTOM_MODULES.includes(id)) {
          if (state.bottomDrawer.activeModuleId === id && state.bottomDrawer.isOpen) {
              updates.bottomDrawer = { ...state.bottomDrawer, isOpen: false };
          } else {
              updates.bottomDrawer = { ...state.bottomDrawer, isOpen: true, activeModuleId: id };
          }
      } else if (id === 'LINK_ANALYSIS') {
          updates.activeWorkspace = 3;
      }

      return updates;
  }),

"""
    new_lines = lines[:start_idx] + [grid_state] + lines[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Patched store.js successfully.")
else:
    print(f"Could not find patch points. start: {start_idx}, end: {end_idx}")
