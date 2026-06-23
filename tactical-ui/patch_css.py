import sys

file_path = 'd:\\ThirdYearsInHell\\miniproject\\RavenX\\tactical-ui\\src\\index.css'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

css = """
/* DEFCON 1 GLOBAL ALERT */
body.defcon-1::after {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  box-shadow: inset 0 0 150px rgba(255, 0, 0, 0.4);
  pointer-events: none;
  z-index: 999999;
  animation: defcon-pulse 2s infinite alternate;
}

@keyframes defcon-pulse {
  0% { box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.2); }
  100% { box-shadow: inset 0 0 200px rgba(255, 0, 0, 0.6); }
}

body.defcon-1 {
  /* Tint everything slightly red */
  filter: sepia(100%) hue-rotate(310deg) saturate(200%);
}
"""

if 'body.defcon-1' not in content:
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write("\n" + css)
    print("Patched index.css")
else:
    print("Already patched")
