"""Render every menu item's 3D model to assets/3d/<id>.webp (+ -sm.webp).

Usage (from the giocoffee folder, with the site served on :5240):
    python -m http.server 5240
    python tools/render3d.py [id ...]
Drives headless Chrome through tools/render.html?id=<id>&still on a
transparent background. Bump ART_VERSION in js/data.js afterwards.
"""
import os, re, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE = os.environ.get("GIO_URL", "http://127.0.0.1:5240")
OUT = os.path.join(ROOT, "assets", "3d")
SIZE = 900

def ids():
    src = open(os.path.join(ROOT, "js", "data.js"), encoding="utf8").read()
    return re.findall(r"\{ id: '([a-z0-9-]+)', cat:", src)

def render(i):
    tmp = tempfile.mkdtemp()
    png = os.path.join(tmp, "s.png")
    cmd = [CHROME, "--headless=new", "--disable-gpu-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
           "--hide-scrollbars", "--default-background-color=00000000", f"--window-size={SIZE},{SIZE}",
           "--virtual-time-budget=20000", f"--user-data-dir={tmp}", f"--screenshot={png}",
           f"{BASE}/tools/render.html?id={i}&still"]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    im = Image.open(png).convert("RGBA")
    box = im.getchannel("A").point(lambda a: 255 if a > 70 else 0).getbbox()
    if not box:
        return i, "EMPTY"
    # square crop around the content with a little air
    l, t, r, b = box; cx, cy = (l + r) / 2, (t + b) / 2; s = max(r - l, b - t) * 1.12
    im = im.crop((int(cx - s / 2), int(cy - s / 2), int(cx + s / 2), int(cy + s / 2)))
    im.resize((640, 640), Image.LANCZOS).save(os.path.join(OUT, f"{i}.webp"), "WEBP", quality=86, method=6)
    im.resize((160, 160), Image.LANCZOS).save(os.path.join(OUT, f"{i}-sm.webp"), "WEBP", quality=84, method=6)
    return i, "ok"

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    todo = sys.argv[1:] or ids()
    with ThreadPoolExecutor(4) as ex:
        for i, s in ex.map(render, todo):
            print(i, s, flush=True)
