import os
import subprocess

base_dir = r"d:\KERJAAN\pos-multicabang\design-assets\logos"

# -------------------------------------------------------------
# CONCEPT A: "The Branching Monogram P" (Recommended)
# Pure compound path with fill-rule="evenodd", perfect optical balance.
# Shows strong 'P' for POS, with an active satellite branch node for Multi-Cabang.
# -------------------------------------------------------------
concept_a_symbol = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>POS Multi-Cabang - Branching Monogram P</title>
  <!-- Main Monogram P (Compound path with true transparent hole) -->
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
  " fill="#09090B"/>
  <!-- Branch Link and Satellite Node -->
  <path d="M 96 172 L 156 172 C 162.63 172 168 177.37 168 184 C 168 190.63 162.63 196 156 196 L 96 196 Z" fill="#09090B"/>
  <circle cx="184" cy="184" r="24" fill="#09090B"/>
</svg>"""

# Concept A on BagUI Badge (Dark tile with emerald accent)
concept_a_badge = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>POS Multi-Cabang App Icon</title>
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

# Lockup for Concept A: Symbol + Clean Geist-style geometric wordmark
concept_a_lockup = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 256" width="840" height="256">
  <title>POS Multi-Cabang - Lockup</title>
  <g transform="translate(16, 0)">
    <!-- Symbol -->
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
    " fill="#09090B"/>
    <path d="M 96 172 L 156 172 C 162.63 172 168 177.37 168 184 C 168 190.63 162.63 196 156 196 L 96 196 Z" fill="#09090B"/>
    <circle cx="184" cy="184" r="24" fill="#09090B"/>
  </g>
  <!-- Wordmark -->
  <text x="290" y="112" font-family="'Geist', 'Inter', system-ui, sans-serif" font-size="76" font-weight="900" letter-spacing="-2" fill="#09090B">POS CABANG</text>
  <text x="292" y="174" font-family="'Geist', 'Inter', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="4" fill="#71717A">MULTI-OUTLET INVENTORY</text>
  <rect x="292" y="196" width="72" height="6" rx="3" fill="#10B981"/>
</svg>"""


# -------------------------------------------------------------
# CONCEPT B: "The Interlocking Nexus" (Multi-Outlet Facet Cube)
# 3 interlocking isometric faces forming an abstract P, representing Toko 1, Toko 2 & Gudang
# -------------------------------------------------------------
concept_b_symbol = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>POS Multi-Cabang - Interlocking Nexus</title>
  <g transform="translate(128, 128)">
    <!-- Top Face: Gudang Pusat -->
    <path d="M 0 -84 L 72 -42 L 0 0 L -72 -42 Z" fill="#09090B"/>
    <!-- Left Face: Toko 1 Retail -->
    <path d="M -72 -32 L 0 10 L 0 94 L -72 52 Z" fill="#27272A"/>
    <!-- Right Face: Toko 2 Cabang -->
    <path d="M 0 10 L 72 -32 L 72 52 L 0 94 Z" fill="#52525B"/>
    <!-- Core Hub -->
    <circle cx="0" cy="10" r="12" fill="#FFFFFF"/>
  </g>
</svg>"""

concept_b_lockup = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 256" width="840" height="256">
  <title>POS Multi-Cabang - Nexus Lockup</title>
  <g transform="translate(16, 0)">
    <g transform="translate(128, 128)">
      <path d="M 0 -84 L 72 -42 L 0 0 L -72 -42 Z" fill="#09090B"/>
      <path d="M -72 -32 L 0 10 L 0 94 L -72 52 Z" fill="#27272A"/>
      <path d="M 0 10 L 72 -32 L 72 52 L 0 94 Z" fill="#52525B"/>
      <circle cx="0" cy="10" r="12" fill="#FFFFFF"/>
    </g>
  </g>
  <text x="290" y="112" font-family="'Geist', 'Inter', system-ui, sans-serif" font-size="76" font-weight="900" letter-spacing="-2" fill="#09090B">NEXUS POS</text>
  <text x="292" y="174" font-family="'Geist', 'Inter', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="4" fill="#71717A">DISTRIBUTED COMMERCE</text>
  <rect x="292" y="196" width="72" height="6" rx="3" fill="#09090B"/>
</svg>"""


# -------------------------------------------------------------
# CONCEPT C: "The Dual Storefront Bridge"
# Modern architectural symmetry: 2 store portals bridged by real-time cloud data
# -------------------------------------------------------------
concept_c_symbol = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>POS Multi-Cabang - Dual Storefront</title>
  <!-- Main Canopy / Warehouse Header -->
  <path d="M 44 48 C 44 38 52 30 62 30 L 194 30 C 204 30 212 38 212 48 L 212 80 L 44 80 Z" fill="#09090B"/>
  <!-- Left Pillar: Toko 1 -->
  <rect x="44" y="94" width="48" height="126" rx="12" fill="#09090B"/>
  <!-- Right Pillar: Toko 2 -->
  <rect x="164" y="94" width="48" height="126" rx="12" fill="#09090B"/>
  <!-- Center Transfer / Cloud Bridge Node -->
  <circle cx="128" cy="144" r="20" fill="#09090B"/>
  <rect x="92" y="138" width="72" height="12" rx="6" fill="#09090B"/>
</svg>"""

concept_c_lockup = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 256" width="840" height="256">
  <title>POS Multi-Cabang - Dual Storefront Lockup</title>
  <g transform="translate(16, 0)">
    <path d="M 44 48 C 44 38 52 30 62 30 L 194 30 C 204 30 212 38 212 48 L 212 80 L 44 80 Z" fill="#09090B"/>
    <rect x="44" y="94" width="48" height="126" rx="12" fill="#09090B"/>
    <rect x="164" y="94" width="48" height="126" rx="12" fill="#09090B"/>
    <circle cx="128" cy="144" r="20" fill="#09090B"/>
    <rect x="92" y="138" width="72" height="12" rx="6" fill="#09090B"/>
  </g>
  <text x="290" y="112" font-family="'Geist', 'Inter', system-ui, sans-serif" font-size="76" font-weight="900" letter-spacing="-2" fill="#09090B">PORTAL POS</text>
  <text x="292" y="174" font-family="'Geist', 'Inter', system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="4" fill="#71717A">DUAL-BRANCH NETWORK</text>
  <rect x="292" y="196" width="72" height="6" rx="3" fill="#09090B"/>
</svg>"""

# Save individual SVG files
files = {
    "concept-a-symbol.svg": concept_a_symbol,
    "concept-a-badge.svg": concept_a_badge,
    "concept-a-lockup.svg": concept_a_lockup,
    "concept-b-symbol.svg": concept_b_symbol,
    "concept-b-lockup.svg": concept_b_lockup,
    "concept-c-symbol.svg": concept_c_symbol,
    "concept-c-lockup.svg": concept_c_lockup,
}

for name, content in files.items():
    filepath = os.path.join(base_dir, name)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Saved: {filepath}")

# Audit files
print("\n--- Running SVG Audit ---")
skill_dir = r"C:\Users\Admin\.gemini\config\skills\logo-design"
audit_script = os.path.join(skill_dir, "scripts", "svg_audit.py")
subprocess.run([
    "python", audit_script,
    os.path.join(base_dir, "concept-a-symbol.svg"),
    os.path.join(base_dir, "concept-b-symbol.svg"),
    os.path.join(base_dir, "concept-c-symbol.svg"),
])

# Generate Concept Sheet
print("\n--- Generating Concept Sheet ---")
concept_sheet_script = os.path.join(skill_dir, "scripts", "concept_sheet.py")
out_png = os.path.join(base_dir, "concepts-overview.png")

cmd = [
    "python", concept_sheet_script,
    os.path.join(base_dir, "concept-a-symbol.svg"),
    os.path.join(base_dir, "concept-b-symbol.svg"),
    os.path.join(base_dir, "concept-c-symbol.svg"),
    "--lockups",
    os.path.join(base_dir, "concept-a-lockup.svg"),
    os.path.join(base_dir, "concept-b-lockup.svg"),
    os.path.join(base_dir, "concept-c-lockup.svg"),
    "--names",
    "Branching P (Recommended)",
    "Interlocking Nexus",
    "Dual Storefront",
    "--notes",
    "Monogram P where the counter & lower branch form synchronized multi-outlet nodes. Exceptional 16px favicon readability.",
    "Geometric isometric cube linking Warehouse, Toko 1 & Toko 2 in perpetual inventory balance.",
    "Minimalist architectural facade bridging two independent store pillars via real-time cloud data.",
    "--title", "POS Multi-Cabang — Identitas Visual & Logo",
    "--subtitle", "Evaluasi 3 Konsep Mark: Skalabilitas Favicon 16px, PWA Icon, & Monokrom",
    "--recommend", "1",
    "-o", out_png
]

subprocess.run(cmd)
print("\nCompleted successfully!")
