"""GioCoffee - finish the Blender renders (blender/out/*.png) into the site's pictures (assets/3d/<id>.webp + -sm.webp).

Products stand on a faint green grid floor (no cast shadow, so nothing can be cut at the frame edge).
The picture is trimmed to the product and its grid, squared and saved at 640 px and 160 px.

  python blender/finish.py [id ...]
"""
import glob, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'blender', 'out'); DST = os.path.join(ROOT, 'assets', '3d')


def finish(src, name):
    """No shadow any more: the product stands on a faint green grid that already fades out in the render.
    Trim to what is visible, square it round the product's centre, keep a little air."""
    a = np.array(Image.open(src).convert('RGBA'))
    al = a[..., 3].astype(np.float32)
    ys, xs = np.nonzero(al > 6)
    l, r, t, b = xs.min(), xs.max(), ys.min(), ys.max()
    s = int(max(r - l, b - t) * 1.06); cx, cy = (l + r) / 2, (t + b) / 2
    img = Image.fromarray(a)
    canvas = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    canvas.paste(img.crop((int(cx - s / 2), int(cy - s / 2), int(cx + s / 2), int(cy + s / 2))), (0, 0))
    canvas.resize((640, 640), Image.LANCZOS).save(os.path.join(DST, name + '.webp'), 'WEBP', quality=88, alpha_quality=95, method=6)
    canvas.resize((160, 160), Image.LANCZOS).save(os.path.join(DST, name + '-sm.webp'), 'WEBP', quality=86, alpha_quality=95, method=6)
    print(name, canvas.size)


if __name__ == '__main__':
    only = sys.argv[1:]
    for p in sorted(glob.glob(os.path.join(SRC, '*.png'))):
        n = os.path.splitext(os.path.basename(p))[0]
        if not only or n in only: finish(p, n)
