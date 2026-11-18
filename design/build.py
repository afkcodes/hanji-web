#!/usr/bin/env python3
"""Concatenate parts/*.html into one self-contained page.

    python3 build.py                       # -> hanji.html (all parts)
    python3 build.py --out x.html 00 01 50 99   # only parts whose names start with these prefixes
"""
import argparse
from pathlib import Path

HERE = Path(__file__).resolve().parent

ap = argparse.ArgumentParser()
ap.add_argument("prefixes", nargs="*")
ap.add_argument("--out", default=str(HERE / "hanji.html"))
ap.add_argument("--force", default="", help="e.g. theme=ink,motion=reduced (review renders only)")
ap.add_argument("--review", action="store_true", help="headless review: rAF via timers, transitions off, so renders show settled states")
args = ap.parse_args()

parts = sorted((HERE / "parts").glob("*.html"))
if args.prefixes:
    parts = [p for p in parts if any(p.name.startswith(x) for x in args.prefixes)]
out = Path(args.out)
html = "\n".join(p.read_text() for p in parts)
if args.force:
    pairs = dict(kv.split("=") for kv in args.force.split(","))
    import json
    html = html.replace("<head>", "<head>\n<script>window.HANJI_FORCE=" + json.dumps(pairs) + "</script>", 1)
if args.review:
    shim = ("<script>window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),16);"
            "window.cancelAnimationFrame=id=>clearTimeout(id);</script>")
    html = html.replace("<head>", "<head>\n" + shim, 1)
    html = html.replace("</head>", "<style>*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important}</style></head>", 1)
out.write_text(html)
print(f"{out}  ({len(parts)} parts, {out.stat().st_size // 1024} KB)")
