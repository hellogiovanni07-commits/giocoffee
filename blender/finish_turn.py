"""GioCoffee - finish the storefront turntable (blender/out_hero/turn/f00..fNN.png) for the stores hero.

Every frame gets the same crop (the union of what is visible across all frames) so the store never jumps while it
turns, then is saved as assets/3d/hero/turn/fNN.webp.

  python blender/finish_turn.py [width]
"""
import glob, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'blender', 'out_hero', 'turn'); DST = os.path.join(ROOT, 'assets', '3d', 'hero', 'turn')
W = int(sys.argv[1]) if len(sys.argv) > 1 else 960
os.makedirs(DST, exist_ok=True)
files = sorted(glob.glob(os.path.join(SRC, 'f*.png')))
l = t = 10 ** 9; r = b = 0
for f in files:
    a = np.array(Image.open(f))[..., 3]; ys, xs = np.nonzero(a > 8)
    l, t, r, b = min(l, xs.min()), min(t, ys.min()), max(r, xs.max()), max(b, ys.max())
box = (l - 8, t - 8, r + 9, b + 9); H = round((box[3] - box[1]) * W / (box[2] - box[0]))
for f in files:
    im = Image.open(f).convert('RGBA').crop(box).resize((W, H), Image.LANCZOS)
    n = os.path.splitext(os.path.basename(f))[0]
    im.save(os.path.join(DST, n + '.webp'), 'WEBP', quality=80, alpha_quality=90, method=6)
print(len(files), 'frames', (W, H))
