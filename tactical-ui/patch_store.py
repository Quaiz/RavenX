import sys

file_path = 'd:\\ThirdYearsInHell\\miniproject\\RavenX\\tactical-ui\\src\\store.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "  // ── Ops Color Modes ──"
replacement = """  // ── Ops Color Modes ──
  defconLevel: 5,
  setDefconLevel: (level) => {
    if (level === 1) {
      document.body.classList.add('defcon-1');
    } else {
      document.body.classList.remove('defcon-1');
    }
    set({ defconLevel: level });
  },
"""

if "defconLevel: 5" not in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched store.js")
else:
    print("Already patched")
