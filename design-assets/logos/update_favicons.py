import os
import sys

# Add skills scripts to path for render_png
sys.path.append(r"C:\Users\Admin\.gemini\config\skills\logo-design\scripts")
import render_png

public_dir = r"d:\KERJAAN\pos-multicabang\public"

# High-contrast Badge Favicon SVG (Works on both light and dark browser tabs!)
badge_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>POS Multi-Cabang</title>
  <rect width="256" height="256" rx="56" fill="#09090B"/>
  <!-- Main Monogram P in crisp white -->
  <path fill-rule="evenodd" clip-rule="evenodd" d="
    M 48 36
    L 156 36
    C 191.35 36 220 64.65 220 100
    C 220 135.35 191.35 164 156 164
    L 96 164
    L 96 220
    L 48 220
    Z
    M 96 80
    L 152 80
    C 163.05 80 172 88.95 172 100
    C 172 111.05 163.05 120 152 120
    L 96 120
    Z
  " fill="#FFFFFF"/>
  <!-- Connected branch with emerald green accent -->
  <path d="M 96 172 L 156 172 C 162.63 172 168 177.37 168 184 C 168 190.63 162.63 196 156 196 L 96 196 Z" fill="#10B981"/>
  <circle cx="184" cy="184" r="24" fill="#10B981"/>
</svg>"""

fav_svg_path = os.path.join(public_dir, "favicon.svg")
with open(fav_svg_path, "w", encoding="utf-8") as f:
    f.write(badge_svg.strip())

# Render 16, 32, 48 pngs
png_16 = os.path.join(public_dir, "favicon-16.png")
png_32 = os.path.join(public_dir, "favicon-32.png")
png_48 = os.path.join(public_dir, "favicon-48.png")

render_png.render(fav_svg_path, png_16, 16, 16)
render_png.render(fav_svg_path, png_32, 32, 32)
render_png.render(fav_svg_path, png_48, 48, 48)

# Write favicon.ico
ico_path = os.path.join(public_dir, "favicon.ico")
render_png.write_ico([png_16, png_32, png_48], ico_path)

print("Updated favicon.svg, favicon-16.png, favicon-32.png, favicon-48.png, and favicon.ico successfully!")
