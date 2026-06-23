import os
import glob

def run_replacements(directory):
    jsx_files = glob.glob(os.path.join(directory, '**', '*.jsx'), recursive=True)
    
    replacements = [
        ('text-cyan-400', 'text-white/70'),
        ('text-cyan-500', 'text-white/50'),
        ('border-cyan-400/20', 'border-white/5'),
        ('border-cyan-500/20', 'border-white/5'),
        ('border-cyan-500/30', 'border-white/10'),
        ('border-cyan-500/50', 'border-white/10'),
        ('bg-cyan-900/20', 'bg-white/5'),
        ('bg-cyan-500/20', 'bg-white/10'),
        ('bg-cyan-400/20', 'bg-white/10'),
        ('bg-cyan-500/10', 'bg-white/5'),
        ('bg-cyan-400/10', 'bg-white/[0.02]'),
        ('bg-cyan-400/5', 'bg-white/[0.02]'),
        ('shadow-[0_0_15px_cyan]', 'shadow-none'),
        ('shadow-[0_0_8px_#22d3ee]', 'shadow-none'),
        ('shadow-[0_0_20px_#22d3ee]', 'shadow-none'),
        ('shadow-[0_0_10px_cyan]', 'shadow-none'),
        ('from-cyan-500/20', 'from-white/5'),
        ('from-cyan-500/50', 'from-white/10'),
        ('via-cyan-400/50', 'via-white/10'),
        ('box-glow', ''),
        ('text-glow', '')
    ]

    for filepath in jsx_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for old, new in replacements:
            content = content.replace(old, new)
            
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {filepath}")

run_replacements('tactical-ui/src')
print("Global replacement complete.")
