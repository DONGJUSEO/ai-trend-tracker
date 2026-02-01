#!/usr/bin/env python3
"""Generate robot/AI themed PWA icons"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Modern AI/Robot color scheme
BG_GRADIENT_START = "#1e293b"  # Slate-800
BG_GRADIENT_END = "#334155"     # Slate-700
ROBOT_COLOR = "#60a5fa"         # Blue-400
ACCENT_COLOR = "#3b82f6"        # Blue-500
EYE_COLOR = "#22d3ee"           # Cyan-400
HIGHLIGHT_COLOR = "#ffffff"     # White

def create_gradient_background(size):
    """Create a gradient background"""
    img = Image.new('RGB', (size, size), BG_GRADIENT_START)
    draw = ImageDraw.Draw(img)

    # Simple vertical gradient
    for y in range(size):
        ratio = y / size
        r1, g1, b1 = tuple(int(BG_GRADIENT_START[i:i+2], 16) for i in (1, 3, 5))
        r2, g2, b2 = tuple(int(BG_GRADIENT_END[i:i+2], 16) for i in (1, 3, 5))

        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)

        draw.line([(0, y), (size, y)], fill=(r, g, b))

    return img

def draw_robot_icon(size):
    """Draw a modern robot/AI icon"""
    img = create_gradient_background(size)
    draw = ImageDraw.Draw(img)

    # Calculate sizes based on icon size
    margin = size // 8
    robot_size = size - (margin * 2)

    # Robot head (rounded rectangle)
    head_x = margin
    head_y = margin + size // 8
    head_w = robot_size
    head_h = robot_size * 2 // 3

    # Draw robot head with rounded corners
    corner_radius = size // 10
    draw.rounded_rectangle(
        [head_x, head_y, head_x + head_w, head_y + head_h],
        radius=corner_radius,
        fill=ROBOT_COLOR,
        outline=ACCENT_COLOR,
        width=max(2, size // 64)
    )

    # Antenna (small circle on top)
    antenna_r = size // 16
    antenna_x = size // 2
    antenna_y = head_y - antenna_r
    draw.ellipse(
        [antenna_x - antenna_r, antenna_y - antenna_r,
         antenna_x + antenna_r, antenna_y + antenna_r],
        fill=ACCENT_COLOR
    )
    # Antenna line
    draw.line(
        [(antenna_x, antenna_y + antenna_r), (antenna_x, head_y)],
        fill=ACCENT_COLOR,
        width=max(2, size // 96)
    )

    # Eyes (two rounded rectangles with glow effect)
    eye_w = robot_size // 5
    eye_h = robot_size // 8
    eye_y = head_y + head_h // 3

    left_eye_x = head_x + robot_size // 4 - eye_w // 2
    right_eye_x = head_x + robot_size * 3 // 4 - eye_w // 2

    # Glow effect for eyes
    for offset in range(3, 0, -1):
        alpha = int(100 / offset)
        glow_color = tuple(list(tuple(int(EYE_COLOR[i:i+2], 16) for i in (1, 3, 5))) + [alpha])

    # Left eye
    draw.rounded_rectangle(
        [left_eye_x, eye_y, left_eye_x + eye_w, eye_y + eye_h],
        radius=eye_h // 2,
        fill=EYE_COLOR
    )

    # Right eye
    draw.rounded_rectangle(
        [right_eye_x, eye_y, right_eye_x + eye_w, eye_y + eye_h],
        radius=eye_h // 2,
        fill=EYE_COLOR
    )

    # Mouth (curved line or rectangle)
    mouth_w = robot_size // 2
    mouth_h = robot_size // 16
    mouth_x = head_x + (robot_size - mouth_w) // 2
    mouth_y = head_y + head_h * 2 // 3

    draw.rounded_rectangle(
        [mouth_x, mouth_y, mouth_x + mouth_w, mouth_y + mouth_h],
        radius=mouth_h // 2,
        fill=ACCENT_COLOR
    )

    # Circuit pattern details (small lines)
    detail_y = head_y + head_h // 6
    for i in range(3):
        x_offset = head_x + robot_size // 10 + i * (robot_size // 12)
        draw.line(
            [(x_offset, detail_y), (x_offset + size // 20, detail_y)],
            fill=HIGHLIGHT_COLOR,
            width=max(1, size // 128)
        )
        draw.line(
            [(head_x + robot_size - x_offset - size // 20, detail_y),
             (head_x + robot_size - x_offset, detail_y)],
            fill=HIGHLIGHT_COLOR,
            width=max(1, size // 128)
        )

    # Add "AI" text at bottom
    try:
        font_size = size // 8
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()

    text = "AI"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (size - text_w) // 2
    text_y = head_y + head_h + margin // 2 - bbox[1]

    draw.text((text_x, text_y), text, fill=HIGHLIGHT_COLOR, font=font)

    # Outer glow/border
    border_width = max(2, size // 48)
    draw.rounded_rectangle(
        [margin // 2, margin // 2, size - margin // 2, size - margin // 2],
        radius=size // 12,
        outline=ACCENT_COLOR,
        width=border_width
    )

    return img

def main():
    """Generate all robot-themed icons"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(script_dir, 'static')

    print("🤖 Generating robot-themed PWA icons...")

    for size in SIZES:
        icon = draw_robot_icon(size)
        filename = f"icon-{size}x{size}.png"
        filepath = os.path.join(static_dir, filename)
        icon.save(filepath, 'PNG')
        print(f"  ✅ Created {filename}")

    # Create favicon
    favicon = draw_robot_icon(32)
    favicon.save(os.path.join(static_dir, 'favicon.ico'), 'ICO')
    print(f"  ✅ Created favicon.ico")

    print("\n✨ Robot-themed icons generated successfully!")
    print("🎨 Theme: Futuristic AI Robot with blue/cyan colors")

if __name__ == '__main__':
    main()
