#!/usr/bin/env python3
"""mk_test.py <nom> <script_test.js> : fabrique t_<nom>.html = version autonome (enveloppe de build.py) + script de test, puis le lance en Chrome headless et imprime data-test / data-err."""
import re, sys, pathlib, subprocess, html
H = pathlib.Path(__file__).parent
name, test = sys.argv[1], (H/sys.argv[2]).read_text(encoding='utf-8')
src = (H/'hyrule-conjugaison.html').read_text(encoding='utf-8')
m = re.search(r'<title>.*?</title>\n', src); title = m.group(0)
body = src.replace(title, '', 1).replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '', 1)
out = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + title.strip()
       + '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n'
       + body + '\n<script>\nwindow.addEventListener(\'error\', e => document.body.setAttribute(\'data-err\', (document.body.getAttribute(\'data-err\')||\'\')+\' | \'+e.message+\' @\'+e.lineno));\n' + test + '\n</script>\n</body></html>\n')
p = H/f't_{name}.html'; p.write_text(out, encoding='utf-8')
chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
r = subprocess.run([chrome, '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--window-size=' + __import__('os').environ.get('WIN', '800,1000'), f'--virtual-time-budget={sys.argv[3] if len(sys.argv)>3 else 6000}', '--dump-dom', f'file://{p}'], capture_output=True, text=True, timeout=120)
dom = r.stdout
for attr in ('data-err', 'data-test'):
    mm = re.search(attr + r'="([^"]*)"', dom)
    print(attr, ':', html.unescape(mm.group(1)).replace(' || ', '\n  ') if mm else '(absent)')
if '--dom' in sys.argv: print(dom[:3000])
