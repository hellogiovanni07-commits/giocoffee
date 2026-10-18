"""Dump the site's own artwork (cup paper, sleeve, prints, labels, latte art, decals) to blender/tex/*.png
and the menu specs to blender/items.json, by loading tools/textures.html in headless Chrome.
Serve the site first:  python -m http.server 5240"""
import base64, html, json, os, re, subprocess, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
tmp = tempfile.mkdtemp()
out = subprocess.run([CH, '--headless=new', '--disable-gpu', '--virtual-time-budget=20000', f'--user-data-dir={tmp}', '--dump-dom',
                      'http://127.0.0.1:5240/tools/textures.html'], capture_output=True, text=True, encoding='utf8', timeout=120).stdout
m = re.search(r'<pre id="out">(.*?)</pre>', out, re.S)
data = json.loads(html.unescape(m.group(1)))
os.makedirs(os.path.join(ROOT, 'blender', 'tex'), exist_ok=True)
for k, v in data['tex'].items():
    open(os.path.join(ROOT, 'blender', 'tex', k + '.png'), 'wb').write(base64.b64decode(v.split(',', 1)[1]))
json.dump(data['items'], open(os.path.join(ROOT, 'blender', 'items.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(data['tex']), 'textures,', len(data['items']), 'items')
