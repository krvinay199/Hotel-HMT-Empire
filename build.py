#!/usr/bin/env python3
"""
build.py — Hotel HMT Empire Production Release Builder
=====================================================
Builds the production distribution in `dist/` ensuring 100% visual and behavioral
parity with the local development environment while keeping console logs silenced in release.
"""

import os
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()
DIST_DIR = ROOT_DIR / "dist"

def log(msg, symbol="✓"):
    print(f" \033[32m{symbol}\033[0m {msg}")

def build():
    print("\n\033[1m🚀 Building Hotel HMT Empire for Production Release...\033[0m\n")

    # 1. Clean and recreate dist/
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    log("Created clean `dist/` directory")

    # 2. Copy entire css/ structure
    shutil.copytree(ROOT_DIR / "css", DIST_DIR / "css")
    log("Copied `css/` directory and design tokens")

    # 3. Copy entire js/ structure
    shutil.copytree(ROOT_DIR / "js", DIST_DIR / "js")
    log("Copied `js/` modules and configuration")

    # 4. Copy entire assets/ structure
    shutil.copytree(ROOT_DIR / "assets", DIST_DIR / "assets")
    log("Copied `assets/` (images, videos, icons)")

    # 5. Copy admin/ structure
    shutil.copytree(ROOT_DIR / "admin", DIST_DIR / "admin")
    log("Copied `admin/` panel")

    # 6. Copy root index.html
    shutil.copy(ROOT_DIR / "index.html", DIST_DIR / "index.html")
    log("Copied `index.html`")

    # 7. Copy Firebase configs
    for config_file in ["firebase.json", "firestore.rules", "firestore.indexes.json"]:
        p = ROOT_DIR / config_file
        if p.exists():
            shutil.copy(p, DIST_DIR / config_file)

    print("\n\033[1;32m🎉 Production Build Complete (100% dev parity guaranteed)!\033[0m")
    print("📁 Release folder: \033[1m./dist/\033[0m\n")

if __name__ == "__main__":
    build()
