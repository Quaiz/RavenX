from PIL import Image, ImageDraw, ImageFont
import os

def process_raven_logo(input_path, output_favicon, output_og):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    # The raven is black. The background is a white/gray checkerboard.
    # We will make anything that is NOT black transparent.
    new_data = []
    for item in data:
        # If pixel is dark enough, keep it black with full opacity.
        if item[0] < 100 and item[1] < 100 and item[2] < 100:
            # Let's make it a nice bright color for dark theme? The user said:
            # "đừng có đổi logo trong phần giao diện... sang logo quạ này để ko bị dính background"
            # If the user wants the raven logo for the web (favicon/OG), it's probably best to make it white or keep it black. 
            # Wait, the app is dark themed. A black raven won't be visible on a dark background!
            # Let's make the raven WHITE for the dark theme, or maybe keep it as is if they want.
            # I will make it #A5B793 (the olive green from the UI) or just white. Let's make it white.
            new_data.append((255, 255, 255, 255))
        else:
            new_data.append((255, 255, 255, 0))
            
    img.putdata(new_data)
    
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Save favicon
    favicon = img.copy()
    favicon.thumbnail((256, 256))
    favicon.save(output_favicon)
    print(f"Saved favicon to {output_favicon}")
    
    # Create OG Image (1200x630)
    og_img = Image.new('RGB', (1200, 630), color=(10, 10, 10))
    draw = ImageDraw.Draw(og_img)
    
    # Paste the raven logo on the left
    logo_size = 300
    logo_for_og = img.copy()
    logo_for_og.thumbnail((logo_size, logo_size))
    
    # Position: vertically centered, horizontally on the left side
    logo_x = 200
    logo_y = (630 - logo_for_og.height) // 2
    og_img.paste(logo_for_og, (logo_x, logo_y), logo_for_og)
    
    # Draw text "RavenX" on the right
    # Try to load a nice font (Palantir-like sleek sans-serif)
    text = "Raven-X"
    try:
        font = ImageFont.truetype("segoeuib.ttf", 140)
    except IOError:
        try:
            font = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 140)
        except IOError:
            try:
                font = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 140)
            except IOError:
                font = ImageFont.load_default()
            
    # Position for text
    text_x = logo_x + logo_size + 50
    # Center vertically
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        text_w, text_h = draw.textsize(text, font=font)
        
    text_y = (630 - text_h) // 2 - 20 # adjust a bit up
    
    # Draw text in WHITE
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    # Remove subtitle as requested
    
    og_img.save(output_og)
    print(f"Saved OG image to {output_og}")

if __name__ == "__main__":
    input_img = r"C:\Users\thaim\.gemini\antigravity\brain\77819608-8ed7-46a9-860b-b118f1a31eec\media__1780296167217.png"
    favicon_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\raven_favicon.png"
    og_path = r"d:\ThirdYearsInHell\miniproject\RavenX\tactical-ui\public\raven_og_image.png"
    
    process_raven_logo(input_img, favicon_path, og_path)
