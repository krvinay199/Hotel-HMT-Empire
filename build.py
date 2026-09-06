#!/usr/bin/env python3
"""
build.py — Hotel HMT Empire Production Release Builder
=====================================================
Builds a production-ready, minified distribution in the `dist/` directory.

Features:
- CSS Bundling & Minification: Combines and compresses all stylesheets into `css/bundle.min.css`.
- JS Minification: Strips comments, removes unnecessary whitespace, and preserves ES module imports.
- HTML Optimization: Bundles asset links, minifies markup, and enables release-mode log silencer.
- Admin Panel: Optimizes and bundles the admin dashboard into `dist/admin/`.
- Asset Copying: Synchronizes images, favicons, fonts, and metadata into `dist/`.
"""

import os
import re
import shutil
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
DIST_DIR = ROOT_DIR / "dist"

def log(msg, symbol="✓"):
    print(f" \033[32m{symbol}\033[0m {msg}")

def warn(msg):
    print(f" \033[33m!\033[0m {msg}")

def minify_css(css_content: str) -> str:
    """Minify CSS by stripping comments, whitespace, and formatting."""
    # Remove CSS comments
    css = re.sub(r'/\*[\s\S]*?\*/', '', css_content)
    # Remove newlines and tabs
    css = re.sub(r'[\r\n\t]+', ' ', css)
    # Remove space around punctuation
    css = re.sub(r'\s*([\{\}\:\;\,])\s*', r'\1', css)
    # Remove trailing semicolons before closing brace
    css = re.sub(r';\}', '}', css)
    # Collapse multiple spaces
    css = re.sub(r' +', ' ', css)
    return css.strip()

def minify_js(js_content: str) -> str:
    """Minify JS while safely preserving strings, template literals, and ES modules."""
    lines = js_content.splitlines()
    cleaned_lines = []
    in_multiline_comment = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Handle multiline comments
        if in_multiline_comment:
            if '*/' in stripped:
                in_multiline_comment = False
                stripped = stripped.split('*/', 1)[1].strip()
                if not stripped:
                    continue
            else:
                continue

        if stripped.startswith('/*'):
            if '*/' in stripped:
                stripped = re.sub(r'/\*.*?\*/', '', stripped).strip()
                if not stripped:
                    continue
            else:
                in_multiline_comment = True
                continue

        # Remove single-line comments (unless inside URL/string heuristic)
        if stripped.startswith('//'):
            continue
        
        # Strip trailing single-line comments if not part of string
        if '//' in stripped and not ('http://' in stripped or 'https://' in stripped or '://' in stripped):
            # Safe basic strip if comment is at end
            parts = stripped.split('//')
            if len(parts) == 2 and not ('"' in parts[1] or "'" in parts[1] or '`' in parts[1]):
                stripped = parts[0].strip()

        cleaned_lines.append(stripped)

    js = '\n'.join(cleaned_lines)
    # Remove inline block comments
    js = re.sub(r'/\*[\s\S]*?\*/', '', js)
    return js.strip()

def minify_html(html_content: str) -> str:
    """Minify HTML by removing comments and collapsing whitespace between tags."""
    # Remove HTML comments except conditional ones
    html = re.sub(r'<!--(?!\[if)[\s\S]*?-->', '', html_content)
    # Collapse multiple spaces and newlines between tags
    html = re.sub(r'>\s+<', '><', html)
    # Remove consecutive spaces
    html = re.sub(r' {2,}', ' ', html)
    return html.strip()

def build():
    print("\n\033[1m🚀 Building Hotel HMT Empire for Production Release...\033[0m\n")

    # 1. Clean & recreate dist/
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    log("Created clean `dist/` directory")

    # 2. Bundle & Minify Main CSS
    css_files_order = [
        ROOT_DIR / "css" / "reset.css",
        ROOT_DIR / "css" / "base.css",
        ROOT_DIR / "css" / "layout.css",
        ROOT_DIR / "css" / "components" / "preloader.css",
        ROOT_DIR / "css" / "components" / "navbar.css",
        ROOT_DIR / "css" / "components" / "hero.css",
        ROOT_DIR / "css" / "components" / "experience.css",
        ROOT_DIR / "css" / "components" / "rooms.css",
        ROOT_DIR / "css" / "components" / "booking.css",
        ROOT_DIR / "css" / "components" / "restaurant.css",
        ROOT_DIR / "css" / "components" / "banquet.css",
        ROOT_DIR / "css" / "components" / "rfq.css",
        ROOT_DIR / "css" / "components" / "map.css",
        ROOT_DIR / "css" / "components" / "whatsapp.css",
        ROOT_DIR / "css" / "components" / "footer.css",
    ]

    bundle_css = ""
    for css_path in css_files_order:
        if css_path.exists():
            bundle_css += f"\n/* {css_path.name} */\n" + css_path.read_text(encoding="utf-8")
        else:
            warn(f"Stylesheet not found: {css_path}")

    minified_bundle_css = minify_css(bundle_css)
    dist_css_dir = DIST_DIR / "css"
    dist_css_dir.mkdir(parents=True, exist_ok=True)
    (dist_css_dir / "bundle.min.css").write_text(minified_bundle_css, encoding="utf-8")
    log(f"Bundled {len(css_files_order)} stylesheets into `dist/css/bundle.min.css` ({len(minified_bundle_css):,} bytes)")

    # 3. Process & Minify Admin CSS
    admin_css_file = ROOT_DIR / "css" / "components" / "admin.css"
    if admin_css_file.exists():
        admin_bundle = minify_css(
            (ROOT_DIR / "css" / "reset.css").read_text(encoding="utf-8") + "\n" +
            (ROOT_DIR / "css" / "base.css").read_text(encoding="utf-8") + "\n" +
            (ROOT_DIR / "css" / "layout.css").read_text(encoding="utf-8") + "\n" +
            admin_css_file.read_text(encoding="utf-8")
        )
        (dist_css_dir / "admin.bundle.min.css").write_text(admin_bundle, encoding="utf-8")
        log(f"Created `dist/css/admin.bundle.min.css` ({len(admin_bundle):,} bytes)")

    # 4. Copy & Minify JavaScript Modules
    js_src_dir = ROOT_DIR / "js"
    js_dist_dir = DIST_DIR / "js"
    js_dist_dir.mkdir(parents=True, exist_ok=True)

    for root, _, files in os.walk(js_src_dir):
        rel_path = Path(root).relative_to(js_src_dir)
        target_dir = js_dist_dir / rel_path
        target_dir.mkdir(parents=True, exist_ok=True)

        for f in files:
            if f.endswith(".js"):
                src_file = Path(root) / f
                dest_file = target_dir / f
                content = src_file.read_text(encoding="utf-8")
                minified = minify_js(content)
                dest_file.write_text(minified, encoding="utf-8")
            elif f.endswith(".json"):
                shutil.copy(Path(root) / f, target_dir / f)

    log("Processed and minified all JavaScript modules into `dist/js/`")

    # 5. Build Main index.html
    main_html = (ROOT_DIR / "index.html").read_text(encoding="utf-8")

    # Replace individual CSS links with single bundle link
    css_links_pattern = r'<!-- ── CSS: Core Styles ──[\s\S]*?<!-- ── CSS: Component Styles ──[\s\S]*?<link rel="stylesheet" href="css/components/footer\.css" />'
    replacement_css_tag = '<link rel="stylesheet" href="css/bundle.min.css" />'
    main_html = re.sub(css_links_pattern, replacement_css_tag, main_html)

    # Ingest release deterrence script for Inspect/Right Click if in production
    release_guard = """
  <!-- Release Protection: Inspect & Console Silenced -->
  <script>
    (function(){
      try {
        var noop = function(){};
        var methods = ['log','info','warn','error','debug','trace','table','dir','assert','group','groupCollapsed','groupEnd','time','timeEnd','timeLog'];
        for (var i = 0; i < methods.length; i++) { if (window.console && window.console[methods[i]]) window.console[methods[i]] = noop; }
        document.addEventListener('contextmenu', function(e){ if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') e.preventDefault(); });
        document.addEventListener('keydown', function(e){
          if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
          if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c'))) {
            e.preventDefault();
          }
        });
      } catch(e){}
    })();
  </script>
"""
    # Replace existing dev vs release script with optimized release guard in dist
    main_html = re.sub(r'<!-- ── Dev vs Release Log Handler ──[\s\S]*?</script>', release_guard.strip(), main_html)
    
    minified_main_html = minify_html(main_html)
    (DIST_DIR / "index.html").write_text(minified_main_html, encoding="utf-8")
    log(f"Generated `dist/index.html` ({len(minified_main_html):,} bytes)")

    # 6. Build Admin index.html
    admin_src = ROOT_DIR / "admin" / "index.html"
    if admin_src.exists():
        dist_admin_dir = DIST_DIR / "admin"
        dist_admin_dir.mkdir(parents=True, exist_ok=True)
        admin_html = admin_src.read_text(encoding="utf-8")

        # Replace css links in admin with bundle
        admin_css_pattern = r'<link rel="stylesheet" href="\.\./css/reset\.css" />[\s\S]*?<link rel="stylesheet" href="\.\./css/components/admin\.css" />'
        admin_html = re.sub(admin_css_pattern, '<link rel="stylesheet" href="../css/admin.bundle.min.css" />', admin_html)
        admin_html = re.sub(r'<!-- ── Dev vs Release Log Handler ──[\s\S]*?</script>', release_guard.strip(), admin_html)

        minified_admin_html = minify_html(admin_html)
        (dist_admin_dir / "index.html").write_text(minified_admin_html, encoding="utf-8")
        log(f"Generated `dist/admin/index.html` ({len(minified_admin_html):,} bytes)")

    # 7. Copy Assets & Configs
    assets_src = ROOT_DIR / "assets"
    if assets_src.exists():
        shutil.copytree(assets_src, DIST_DIR / "assets")
        log("Copied `assets/` directory to `dist/assets/`")

    # Copy Firestore rules and indexes for Firebase deployments
    for config_file in ["firestore.rules", "firestore.indexes.json", "firebase.json"]:
        if (ROOT_DIR / config_file).exists():
            shutil.copy(ROOT_DIR / config_file, DIST_DIR / config_file)

    print("\n\033[1;32m🎉 Production Release Build Complete!\033[0m")
    print("📁 Release output folder: \033[1m./dist/\033[0m")
    print("\nTo preview the production build locally:")
    print("  \033[36mcd dist && python3 -m http.server 8090\033[0m\n")

if __name__ == "__main__":
    build()
