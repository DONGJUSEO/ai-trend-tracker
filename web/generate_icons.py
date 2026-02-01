#!/usr/bin/env python3
"""Generate PWA icons for AI Trend Tracker"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes needed for PWA
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Hyundai Rotem brand colors (slate/gray theme)
BG_COLOR = "#334155"  # Slate-700
TEXT_COLOR = "#ffffff"  # White

def create_icon(size):
    """Create a simple icon with AI text"""
    # Create image with brand color background
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Calculate font size (proportional to icon size)
    font_size = int(size * 0.4)

    try:
        # Try to load a system font
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()

    # Draw "AI" text in the center
    text = "AI"

    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculate position to center the text
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - bbox[1]

    # Draw text
    draw.text((x, y), text, fill=TEXT_COLOR, font=font)

    # Draw a border
    border_width = max(2, size // 64)
    draw.rectangle(
        [(0, 0), (size - 1, size - 1)],
        outline="#60a5fa",  # Blue-400
        width=border_width
    )

    return img

def main():
    """Generate all icon sizes"""
    # Get the static directory path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(script_dir, 'static')

    print("🎨 Generating PWA icons...")

    for size in SIZES:
        icon = create_icon(size)
        filename = f"icon-{size}x{size}.png"
        filepath = os.path.join(static_dir, filename)
        icon.save(filepath, 'PNG')
        print(f"  ✅ Created {filename}")

    # Also create favicon.ico (using 32x32)
    favicon = create_icon(32)
    favicon.save(os.path.join(static_dir, 'favicon.ico'), 'ICO')
    print(f"  ✅ Created favicon.ico")

    print("\n✨ All icons generated successfully!")

if __name__ == '__main__':
    main()
