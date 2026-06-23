import json
import re

def clean_text(text):
    if not text: return text
    
    # Remove language pronunciation blocks like (Vietnamese: [fa...];
    # We look for (Language: [something] optionally followed by ; or ,
    text = re.sub(r'\([A-Za-z\s]+:\s*\[[^\]]+\][^;,\)]*(?:;|,)\s*', '(', text)
    
    # Remove language blocks that end the parenthesis: (Vietnamese: [fa...])
    text = re.sub(r'\([A-Za-z\s]+:\s*\[[^\]]+\][^)]*\)', '', text)
    
    # Remove standalone brackets [pronunciation]
    text = re.sub(r'\[/?(?:IPA|pron)?(?:[^\]]+)\]', '', text)
    
    # Remove /pronunciation/ slashes
    text = re.sub(r'/[^/]+/', '', text)
    
    # Remove ( listen) or similar audio artifacts
    text = re.sub(r'\(\s*(?:listen|/?audio[^)]*)\s*\)', '', text, flags=re.IGNORECASE)
    
    # Clean up empty parens () or (, ) or (; )
    text = re.sub(r'\(\s*(?:;|,)?\s*\)', '', text)
    
    # Clean up stray spaces
    text = re.sub(r'\(\s+', '(', text)
    text = re.sub(r'\s+\)', ')', text)
    text = re.sub(r'\s+,', ',', text)
    text = re.sub(r'\s+;', ';', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def main():
    in_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\leaders_data.json"
    with open(in_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for country, info in data.items():
        if info.get('head_of_state', {}).get('desc'):
            info['head_of_state']['desc'] = clean_text(info['head_of_state']['desc'])
        if info.get('head_of_gov', {}).get('desc'):
            info['head_of_gov']['desc'] = clean_text(info['head_of_gov']['desc'])
            
    with open(in_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print("Cleaned descriptions!")

if __name__ == "__main__":
    main()
