#!/usr/bin/env python3
"""
Regenerate Android mipmap + splash PNGs from the PWA icon (public/icon-512.png).
Run from repo: python3 scripts/sync-pwa-icons-to-android.py
"""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image
except ImportError as e:
    raise SystemExit("Install Pillow: pip install Pillow") from e

ROOT = Path(__file__).resolve().parent.parent
ICON = ROOT / "public" / "icon-512.png"
RES = ROOT / "android" / "app" / "src" / "main" / "res"

LAUNCHER = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
FOREGROUND = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}


def load_icon() -> Image.Image:
    if not ICON.is_file():
        raise SystemExit(f"Missing PWA icon: {ICON}")
    img = Image.open(ICON).convert("RGBA")
    return img


def resize_cover(icon: Image.Image, size: int) -> Image.Image:
    """Scale icon to fill a size×square (legacy launcher)."""
    ic = icon.copy()
    ic.thumbnail((size, size), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - ic.width) // 2
    y = (size - ic.height) // 2
    out.paste(ic, (x, y), ic)
    return out


def adaptive_foreground(icon: Image.Image, canvas: int) -> Image.Image:
    """Center icon in adaptive layer; keep ~55% of canvas for artwork (safe zone)."""
    max_logo = max(8, int(canvas * 0.55))
    ic = icon.copy()
    ic.thumbnail((max_logo, max_logo), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    x = (canvas - ic.width) // 2
    y = (canvas - ic.height) // 2
    out.paste(ic, (x, y), ic)
    return out


def splash_screen(icon: Image.Image, w: int, h: int) -> Image.Image:
    bg = Image.new("RGBA", (w, h), (11, 16, 32, 255))  # #0b1020
    # Logo ~28% of shorter side
    side = min(w, h)
    max_logo = max(64, int(side * 0.28))
    ic = icon.copy()
    ic.thumbnail((max_logo, max_logo), Image.Resampling.LANCZOS)
    x = (w - ic.width) // 2
    y = (h - ic.height) // 2
    bg.paste(ic, (x, y), ic.convert("RGBA"))
    return bg


def main() -> None:
    icon = load_icon()
    for d, px in LAUNCHER.items():
        folder = RES / f"mipmap-{d}"
        if not folder.is_dir():
            continue
        resize_cover(icon, px).save(folder / "ic_launcher.png", optimize=True)
        resize_cover(icon, px).save(folder / "ic_launcher_round.png", optimize=True)

    for d, px in FOREGROUND.items():
        folder = RES / f"mipmap-{d}"
        if not folder.is_dir():
            continue
        adaptive_foreground(icon, px).save(folder / "ic_launcher_foreground.png", optimize=True)

    for splash in RES.rglob("splash.png"):
        with Image.open(splash) as existing:
            w, h = existing.size
        splash_screen(icon, w, h).save(splash, optimize=True)

    print("Updated launcher + splash assets from", ICON.relative_to(ROOT))


if __name__ == "__main__":
    main()
