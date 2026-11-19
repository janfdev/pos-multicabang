import os

# Concept A: "The Multi-Branch P" (Lettermark + Network Node)
# Bold geometric 'P' monogram where the counter and lower branch represent interconnected stores
concept_a_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <rect width="256" height="256" rx="56" fill="#09090B"/>
  <!-- Central Hub / Main Store Stem -->
  <rect x="44" y="44" width="48" height="168" rx="16" fill="#FFFFFF"/>
  <!-- Top Loop / POS Register Display -->
  <path d="M 92 44 L 160 44 C 190.93 44 216 69.07 216 100 C 216 130.93 190.93 156 160 156 L 92 156 Z" fill="#FFFFFF"/>
  <rect x="92" y="80" width="56" height="40" rx="10" fill="#09090B"/>
  <!-- Satellite Branch Node (Cabang 2) connected with glowing emerald accent -->
  <circle cx="166" cy="188" r="24" fill="#10B981"/>
  <!-- Branch Link bridge -->
  <rect x="92" y="178" width="56" height="20" rx="8" fill="#10B981" opacity="0.9"/>
</svg>"""

# Concept A Monochromatic (pure B&W for audit and standard marks)
concept_a_mono_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Central Hub / Main Store Stem -->
  <rect x="44" y="44" width="48" height="168" rx="16" fill="#000000"/>
  <!-- Top Loop -->
  <path d="M 92 44 L 160 44 C 190.93 44 216 69.07 216 100 C 216 130.93 190.93 156 160 156 L 92 156 Z" fill="#000000"/>
  <rect x="92" y="80" width="56" height="40" rx="10" fill="#FFFFFF"/>
  <!-- Branch Node -->
  <circle cx="166" cy="188" r="24" fill="#000000"/>
  <!-- Branch Link -->
  <rect x="92" y="178" width="56" height="20" rx="8" fill="#000000"/>
</svg>"""

# Concept B: "The Hex-Nexus / Interlocking Cabang Cube"
# 3 interconnected isometric facets representing Warehouse, Branch 1, Branch 2 forming an abstract 'P'
concept_b_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <rect width="256" height="256" rx="56" fill="#09090B"/>
  <g transform="translate(128, 128)">
    <!-- Top Face (Toko Pusat / Warehouse) -->
    <path d="M 0 -84 L 70 -44 L 0 -4 L -70 -44 Z" fill="#FFFFFF"/>
    <!-- Left Face (Toko 1 / POS Terminal) -->
    <path d="M -70 -34 L 0 6 L 0 86 L -70 46 Z" fill="#E4E4E7"/>
    <!-- Right Face (Toko 2 / Cabang Satelit) in Emerald Accent -->
    <path d="M 0 6 L 70 -34 L 70 46 L 0 86 Z" fill="#10B981"/>
    <!-- Center synchronization core -->
    <circle cx="0" cy="6" r="10" fill="#09090B"/>
  </g>
</svg>"""

concept_b_mono_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <g transform="translate(128, 128)">
    <path d="M 0 -84 L 70 -44 L 0 -4 L -70 -44 Z" fill="#000000"/>
    <path d="M -70 -34 L 0 6 L 0 86 L -70 46 Z" fill="#000000" opacity="0.75"/>
    <path d="M 0 6 L 70 -34 L 70 46 L 0 86 Z" fill="#000000"/>
    <circle cx="0" cy="6" r="10" fill="#FFFFFF"/>
  </g>
</svg>"""

# Concept C: "The Twin-Arch Storefront / Dual POS Node"
# Minimalist architectural mark: 2 geometric arches (cabang 1 & cabang 2) bridged by a cloud-sync beam
concept_c_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <rect width="256" height="256" rx="56" fill="#09090B"/>
  <!-- Primary Store Pillar (Left) -->
  <rect x="48" y="76" width="44" height="124" rx="14" fill="#FFFFFF"/>
  <!-- Secondary Store Pillar (Right) -->
  <rect x="164" y="76" width="44" height="124" rx="14" fill="#10B981"/>
  <!-- Sync Bridge / Canopy Roof -->
  <path d="M 48 64 C 48 48 64 36 84 36 L 172 36 C 192 36 208 48 208 64 L 208 84 L 48 84 Z" fill="#FFFFFF"/>
  <!-- Central Pulse Indicator -->
  <circle cx="128" cy="138" r="14" fill="#FFFFFF"/>
  <rect x="92" y="132" width="72" height="12" rx="6" fill="#FFFFFF" opacity="0.3"/>
</svg>"""

concept_c_mono_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <rect x="48" y="76" width="44" height="124" rx="14" fill="#000000"/>
  <rect x="164" y="76" width="44" height="124" rx="14" fill="#000000"/>
  <path d="M 48 64 C 48 48 64 36 84 36 L 172 36 C 192 36 208 48 208 64 L 208 84 L 48 84 Z" fill="#000000"/>
  <circle cx="128" cy="138" r="14" fill="#000000"/>
  <rect x="92" y="132" width="72" height="12" rx="6" fill="#000000" opacity="0.4"/>
</svg>"""

# Write files
base_dir = r"d:\KERJAAN\pos-multicabang\design-assets\logos"

files = {
    "concept-a-badge.svg": concept_a_svg,
    "concept-a-mono.svg": concept_a_mono_svg,
    "concept-b-badge.svg": concept_b_svg,
    "concept-b-mono.svg": concept_b_mono_svg,
    "concept-c-badge.svg": concept_c_svg,
    "concept-c-mono.svg": concept_c_mono_svg,
}

for filename, content in files.items():
    p = os.path.join(base_dir, filename)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Generated {len(files)} concept SVG files.")
