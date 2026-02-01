#!/usr/bin/env python3
"""Generate PWA icons from user's robot.png image"""

from PIL import Image, ImageDraw
import os

# Icon sizes
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Modern background color
BG_COLOR = "#1e293b"  # Slate-800 (matches robot theme)

def create_icon_from_robot(robot_img, size, add_background=True):
    """Create PWA icon from robot image"""

    if add_background:
        # Create background
        icon = Image.new('RGB', (size, size), BG_COLOR)

        # Calculate padding (10% of size)
        padding = size // 10
        robot_size = size - (padding * 2)

        # Resize robot image maintaining aspect ratio
        robot_resized = robot_img.copy()
        robot_resized.thumbnail((robot_size, robot_size), Image.Resampling.LANCZOS)

        # Center the robot on the background
        x = (size - robot_resized.width) // 2
        y = (size - robot_resized.height) // 2

        # Paste robot image (with alpha if available)
        if robot_resized.mode == 'RGBA':
            icon.paste(robot_resized, (x, y), robot_resized)
        else:
            icon.paste(robot_resized, (x, y))

        # Add subtle border
        draw = ImageDraw.Draw(icon)
        border_width = max(2, size // 64)
        draw.rectangle(
            [0, 0, size - 1, size - 1],
            outline="#3b82f6",  # Blue-500
            width=border_width
        )
    else:
        # Just resize without background
        icon = robot_img.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)

        # Center on canvas if needed
        if icon.size[0] != size or icon.size[1] != size:
            centered = Image.new('RGBA' if robot_img.mode == 'RGBA' else 'RGB',
                                (size, size), (255, 255, 255, 0) if robot_img.mode == 'RGBA' else BG_COLOR)
            x = (size - icon.width) // 2
            y = (size - icon.height) // 2
            if icon.mode == 'RGBA':
                centered.paste(icon, (x, y), icon)
            else:
                centered.paste(icon, (x, y))
            icon = centered

    return icon

def main():
    """Generate all PWA icons from robot.png"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(script_dir, 'static')
    images_dir = os.path.join(static_dir, 'images')

    robot_path = os.path.join(images_dir, 'robot.png')

    if not os.path.exists(robot_path):
        print(f"❌ Error: robot.png not found at {robot_path}")
        return

    print("🤖 Loading robot.png...")
    robot_img = Image.open(robot_path)

    # Convert to RGBA if it has transparency
    if robot_img.mode in ('RGBA', 'LA') or (robot_img.mode == 'P' and 'transparency' in robot_img.info):
        robot_img = robot_img.convert('RGBA')
    else:
        robot_img = robot_img.convert('RGB')

    print(f"📐 Original size: {robot_img.size[0]}x{robot_img.size[1]}")
    print(f"🎨 Generating PWA icons with background...")

    for size in SIZES:
        icon = create_icon_from_robot(robot_img, size, add_background=True)
        filename = f"icon-{size}x{size}.png"
        filepath = os.path.join(static_dir, filename)
        icon.save(filepath, 'PNG')
        print(f"  ✅ Created {filename}")

    # Create favicon (smaller, no background)
    favicon = create_icon_from_robot(robot_img, 32, add_background=True)
    favicon_path = os.path.join(static_dir, 'favicon.ico')
    favicon.save(favicon_path, 'ICO')
    print(f"  ✅ Created favicon.ico")

    print("\n✨ All icons generated successfully from your robot.png!")
    print("🎨 Applied dark background and subtle border")

if __name__ == '__main__':
    main()
