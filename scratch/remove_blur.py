import os
import glob
import re

def remove_blur(directory):
    jsx_files = glob.glob(os.path.join(directory, '**', '*.jsx'), recursive=True)
    
    for filepath in jsx_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to remove backdrop-blur-md, backdrop-blur-sm, backdrop-blur-lg, etc.
        new_content = re.sub(r'backdrop-blur-[a-z]+', '', content)
        new_content = re.sub(r'shadow-\[0_0_.*?\]', '', new_content) # catch any remaining shadows
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed blur from: {filepath}")

remove_blur('tactical-ui/src')
print("Blur removal complete.")
