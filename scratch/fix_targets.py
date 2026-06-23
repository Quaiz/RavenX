import os, re
d = r'd:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src\components'
for f in os.listdir(d):
    if f.endswith('.jsx'):
        path = os.path.join(d, f)
        content = open(path, 'r', encoding='utf-8').read()
        
        # Replace Target with Crosshair in import statements from lucide-react
        new_content = re.sub(r'(import\s+\{[^}]*)\bTarget\b([^}]*\}\s+from\s+[\'"]lucide-react[\'"])', r'\1Crosshair\2', content)
        
        # Replace <Target /> with <Crosshair />
        new_content = re.sub(r'<Target\b', r'<Crosshair', new_content)
        
        # Replace mapping references like 'LAND': Target
        new_content = re.sub(r':\s*Target\b', r': Crosshair', new_content)
        
        if content != new_content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Fixed {f}')
