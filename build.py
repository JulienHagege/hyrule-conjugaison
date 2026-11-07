#!/usr/bin/env python3
"""Construit index.html (version autonome) à partir de src/hyrule-conjugaison.html (source de l'artifact claude.ai).

Le source n'a ni doctype ni <head> : claude.ai ajoute cette enveloppe à la publication.
Pour un usage hors claude.ai (GitHub Pages, fichier local), on l'ajoute ici, avec le même reset.
Usage : python3 build.py  (depuis la racine du dépôt)
"""
import re, pathlib
root = pathlib.Path(__file__).parent
src = (root / 'src' / 'hyrule-conjugaison.html').read_text(encoding='utf-8')
m = re.search(r'<title>.*?</title>\n', src); title = m.group(0)
body = src.replace(title, '', 1).replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '', 1)
out = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
       + title.strip()
       + '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>'
       # Statistiques de visite (GoatCounter, sans cookies) : version publique seulement. Tableau de bord : https://hyp.goatcounter.com
       + '<script data-goatcounter="https://hyp.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script></head><body>\n'
       + body + '\n</body></html>\n')
(root / 'index.html').write_text(out, encoding='utf-8')
print('index.html écrit :', len(out), 'octets')
