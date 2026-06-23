import os
import glob
src_dir = r'd:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\src'
files = glob.glob(src_dir + '/**/*.js*', recursive=True)
count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'http://localhost:5000' in content:
        print(f'Fixing {file}')
        content = content.replace("'http://localhost:5000", "import.meta.env.VITE_BACKEND_URL + '")
        content = content.replace("\"http://localhost:5000", "import.meta.env.VITE_BACKEND_URL + \"")
        content = content.replace("`http://localhost:5000", "`${import.meta.env.VITE_BACKEND_URL}")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
print(f'Fixed {count} files')
