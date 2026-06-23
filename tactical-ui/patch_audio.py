import sys

file_path = 'd:\\ThirdYearsInHell\\miniproject\\RavenX\\tactical-ui\\src\\utils\\audioEngine.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace preload block
content = content.replace("this.preload('/sounds/success.mp3', 'success');", "this.preload('/sounds/enemy_down.mp3', 'enemy_down');\n  this.preload('/sounds/revive.mp3', 'revive');\n  this.preload('/sounds/marked.mp3', 'marked');")
content = content.replace("this.preload('/sounds/auth_click.mp3', 'auth_click');", "")
content = content.replace("this.preload('/sounds/initialize.mp3', 'initialize');", "")
content = content.replace("this.preload('/sounds/generic_click.mp3', 'generic_click');", "")

# Replace play mappings
content = content.replace("this.play('generic_click');", "this.play('notification', true, 0.2);")
content = content.replace("this.play('generic_click', true, 0.1);", "this.play('notification', true, 0.05);")
content = content.replace("this.play('generic_click', true, 0.05);", "this.play('notification', true, 0.02);")
content = content.replace("this.play('notification'); // Fallback for error", "this.play('marked');")
content = content.replace("this.play('auth_click');", "this.play('revive');")
content = content.replace("this.play('success', false);", "this.play('enemy_down', false);")
content = content.replace("this.play('initialize');", "this.play('revive');")

# Add playCritical
if 'playCritical' not in content:
    content = content.replace('setEnabled(val) {', 'playCritical() {\n    this.play(\'marked\', false, 1.0);\n  }\n\n  setEnabled(val) {')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched audioEngine.js')
