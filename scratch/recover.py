import os, glob, json, re

brains_dir = r'C:\Users\thaim\.gemini\antigravity\brain'
logs = glob.glob(os.path.join(brains_dir, '*', '.system_generated', 'logs', 'overview.txt'))
out_dir = r'd:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components'

recovered_files = {}

for log in logs:
    try:
        with open(log, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    if obj.get('type') == 'TOOL_RESPONSE' and obj.get('tool_name') == 'default_api:view_file':
                        output = obj.get('output', '')
                        # Match: File Path: `file:///d:/.../src/components/WantedCriminals.jsx`
                        # or File Path: file:///...
                        m = re.search(r'File Path: `?file:///(?:[a-zA-Z]:/)?.*?/src/components/([^`\n]+)`?\n.*?Showing lines \d+ to \d+\nThe following code.*?:\n(.*?)(?=\n\nThe above content|\n\n\[\w+\]|$)', output, re.DOTALL)
                        if m:
                            filename = m.group(1)
                            content = m.group(2)
                            # Remove line numbers: "1: import React..." -> "import React..."
                            clean_content = re.sub(r'^\d+: ', '', content, flags=re.MULTILINE)
                            if filename not in recovered_files or len(clean_content) > len(recovered_files[filename]):
                                recovered_files[filename] = clean_content
                except:
                    pass
    except:
        pass

for filename, content in recovered_files.items():
    path = os.path.join(out_dir, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Recovered {len(recovered_files)} files: {list(recovered_files.keys())}")
