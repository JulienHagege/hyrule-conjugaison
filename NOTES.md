# Hyrule Conjugaison, notes de reprise

Jeu d'entraînement au présent de l'indicatif pour Hugo (10 ans, fan de Zelda Tears of the Kingdom). Créé le 2026-11-07 avec Claude Code.

## Les trois canaux de publication (à mettre à jour ensemble à chaque modification)

| Canal | Quoi | Comment |
|---|---|---|
| Artifact claude.ai (Hugo, avec synchro entre appareils) | `src/hyrule-conjugaison.html` tel quel | Outil Artifact, `url` = https://claude.ai/artifact/AgQ21Fjne2yjCF72fnBXSt, capabilities `{db:{}, user:{}}` (déjà déclarées, conservées si omises) |
| GitHub Pages (public, pour les copains) | `index.html` = version autonome | `python3 build.py && git add -A && git commit && git push`, puis https://julienhagege.github.io/hyrule-conjugaison/ |
| Dropbox (copie hors ligne) | `index.html` copié | `cp index.html "~/Library/CloudStorage/Dropbox/Applications/Hyrule Conjugaison/hyrule-conjugaison.html"` |

Ne jamais publier le source brut hors claude.ai : sans l'enveloppe, les écrans masqués (modal du nom, Lune de sang) restent visibles.

## Architecture du fichier unique

- `<style>` : tokens dans `:root`, thème sombre unique. Sections : Home, Game, Boss, Lune de sang, Result, Carnet, Modal.
- Données : `N` (notes pédagogiques), `REGIONS`, `VERBS` via `add(région, groupe, verbe, formes, note, options)` avec générateurs (`er`, `ir2`, `ger`, `cer`, `dbl`, `grave`, `eacc`, `ayer`, `yer`, `ir3`, `venir`, `dre`, `prendre`, `mettre`, `aitre`, `indre`, `uire`, `cevoir`, `faire`, `dire`, `dblr`, `egacc`). Formes : `[je, tu, il, nous, vous, ils]`, alternatives séparées par `/`. Flags : `refl` (pronominal), `imp` (impersonnel), `h` (h aspiré), `hard` (tiré 2 fois plus), `core` (2 épreuves par sanctuaire).
- `COMP` : complément de phrase par verbe (univers Zelda), sans accord avec le sujet. `SUBJECTS` : sujets variés par personne.
- État `S` (localStorage `hyrule-conj-v1` + db claude `data/users/<id>/save`) : rupees, lueurs, bonusHearts, items `{verbe|personne: {w,r,s,t}}`, regions `{stars,plays,best}`, daily, tot, moonRuns, bossWins, resetAt, updated.
- Fusion synchro : le plus grand nombre de réponses jouées gagne, un resetAt plus récent l'emporte, la date sert en dernier recours.
- Sélection des épreuves : `weightOf` (erreurs ×3, maîtrisé ×0,3, hard ×2) ; sanctuaire = 2 verbes `core` + région ; révision = 15 épreuves par paliers (erreurs en attente, autres personnes des mêmes verbes, anciennes erreurs avec moins de 4 réussites d'affilée via `consolidateList`, verbes `hard` non maîtrisés), bouton actif tant qu'il reste quelque chose à consolider ; château = 40 % erreurs récentes + 3e groupe ×2,2, Eldin ×0,5, réguliers ×0,02.
- Images : `IMG` (data URI, pixel art PixelLab 400×224, sources dans `src/img/`). Dessinées en canvas plein écran avec vignette ; particules par région (`SCENE_FX`).
- Audio : tout synthétisé (Web Audio), `SFX.*`, `MUSIC` pour la Lune de sang, `AMB` pour les ambiances par monde (`THEMES` : nappe filtrée + mélodie générée sur une gamme + écho, parfois pulsation). `show()` fixe `AMB.want = sceneId` puis `AMB.sync()` ; `AMB.hold` pendant la Lune de sang ; réglage `S.music`, bouton 🎵 en bas de l'accueil (grisé si le son est coupé). Niveau visé bien sous les effets (nappe ~.05 à .1 réparti sur les oscillateurs, mélodie .03 à .05).
- Diagnostic à distance : `logErr(e, où)` journalise la dernière erreur technique dans `S.lastErr` (synchronisée avec la sauvegarde, lisible via ArtifactData sur `data/users/<id>/save`) et l'affiche dans la zone parents du Carnet avec un bouton Effacer. Les erreurs globales (`window error` / `unhandledrejection`) y passent aussi.
- Lune de sang blindée : texte écrit avant `paintSky()` (protégé), `moonRescue` après 8 s sans panneau, question/réponse/fin protégées avec repli `closeMoon()`. Ne jamais dessiner un `arc()` à rayon négatif (particules mourantes) : c'était la cause de l'écran rouge vide.

## Règles de jeu validées par Julien

- Cœurs : 5 de base, +1 par 4 lueurs, +1 direct par château sans faute, max 10.
- Lueur : une par run sans faute (sanctuaire, révision ou château) ; château terminé = +1 garantie.
- Rubis : 10 par épreuve (20 aux Îles, 30 à 40 au château) + combo ; bonus sans faute 30 / 100 (révision) / 300 (château) ; victoire château +200. Rangs jusqu'à Légende à 7000.
- Lune de sang : une partie sur 1 ou 2 (jamais contre Ganondorf), se lève sur 3 épreuves, 5 QCM à 6,6 s, +30/20/10 rubis selon la vitesse, faux ou lent = un cœur perdu, sans faute +50 et fanfare. Bouton test dans le Carnet (zone parents), sans impact sur les stats.
- Verbe maîtrisé (★) = réussi une fois sans erreur en attente ; or (★★) = 4 réussites à 90 %.
- Style : jamais de tiret cadratin, typo FR (espace insécable avant ! et ?), registre casual.
