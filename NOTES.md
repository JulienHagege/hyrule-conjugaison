# La Légende des Temps (ex Hyrule Conjugaison), notes de reprise

Jeu d'entraînement à la conjugaison pour Hugo (10 ans, fan de Zelda Tears of the Kingdom). Créé le 2026-11-07 avec Claude Code ; v2 « La Légende des Temps » (tous les temps, familles de verbes, héros, hub) le 2026-11-08. L'URL GitHub Pages n'a pas changé.

## Les trois canaux de publication (à mettre à jour ensemble à chaque modification)

| Canal | Quoi | Comment |
|---|---|---|
| Artifact claude.ai (Hugo, avec synchro entre appareils) | `src/hyrule-conjugaison.html` tel quel | Outil Artifact, `url` = https://claude.ai/artifact/AgQ21Fjne2yjCF72fnBXSt, capabilities `{db:{}, user:{}, downloads:true}` (déjà déclarées, conservées si omises) |
| GitHub Pages (public, pour les copains) | `index.html` = version autonome | `python3 build.py && git add -A && git commit && git push`, puis https://julienhagege.github.io/hyrule-conjugaison/ |
| Dropbox (copie hors ligne) | `index.html` copié | `cp index.html "~/Library/CloudStorage/Dropbox/Applications/Hyrule Conjugaison/hyrule-conjugaison.html"` |

Ne jamais publier le source brut hors claude.ai : sans l'enveloppe, les écrans masqués (modal du nom, Lune de sang) restent visibles.

## Architecture v2 (La Légende des Temps)

- Construction : `src/hyrule-conjugaison.html` est produit par `python3 src/v2/build_v2.py`, qui lit `src/v2/hyrule-conjugaison.v29.html` (dernière v1) et y greffe les blocs `src/v2/*.js`, `v2.css`, `v2_hub.html`, les images `src/img/home_*.png`, puis applique des remplacements ciblés. Pour une petite retouche, éditer directement `src/hyrule-conjugaison.html` ET reporter la modification dans le bloc v2 concerné (sinon elle sera perdue au prochain build_v2). Ensuite `python3 build.py` pour `index.html`.
- Temps : `TENSES` (15 : present, pc, imparfait, pqp, ps, pa, futur, fa, subj, subji, subjp, subjpqp, cond, condp, imperatif), chacun avec niveau scolaire (`lvl`), icône, couleur, `persons` (impératif : tu, nous, vous), `pre:'que'` (subjonctif), `cmp` (temps simple de l'auxiliaire pour les temps composés).
- Moteur (`engine.js`) : `PARTS` = temps primitifs explicites par verbe (participe passé `pp`, auxiliaire `aux` e/ae, radical du futur `fut`, passé simple `ps` « radical|type a/i/u/n », imparfait, subjonctif, impératif, formes irrégulières complètes `psF`, `imparfF`, `subjiF`, `ppF`, accord `ppInv`, `noPs`, `noImper`). `partsOf(V)` hérite d'un verbe de base par préfixe (refaire ← faire). `conj(V, temps, personne, sujet)` renvoie la liste des formes acceptées ; `formsOf`, `existsAt`, `personsAt`, `hardAt` (piège automatique par temps), `tenseNote` (notes du Sage par temps). Vérifié contre le lexique Lefff (`src/v2/check_lefff.js`, paquet npm `french-verbs-lefff`) : 11 689 formes, 3 écarts assumés (il vêt, il se tait, résolu).
- Familles (`v2_data.js`) : `FAMILIES` chef → cousins (prendre : apprendre, comprendre, surprendre…), `FAM_OF`, `HEADS`. Les stats sont stockées par chef de famille (`famHead(verbe)|personne`), les cousins sont tirés à tour de rôle (`mkQ`). 241 verbes, 129 familles. Nouveaux verbes v2 dans `new_verbs.js` (maison d'être, pronominaux réguliers, -uer, -guer, se taire).
- Sujets avec genre et nombre (`SUBJECTS[p] = [{t,g,n}]`) pour l'accord du participe avec être. `subjectText` ajoute « que / qu' », les pronoms réfléchis, « j' ».
- État v2 `ROOT` (localStorage `legende-temps-v2`) : `profiles{id:{name, daily, unlockAll, worlds{temps: monde}}}`, `deleted`, `active`, `world`, `sound`, `music`, `lastErr`. Un monde = l'ancien état `S` (rupees, lueurs, items, regions…). Globals liés par `bind()` : `P` (héros actif), `S` (monde actif), `TENSE`. Migration automatique de `hyrule-conj-v1` → héros `main`, univers présent (`migrateV1`, `remapItems` fusionne les verbes dans leur famille). Fusion `mergeRoot` par héros et par monde (suppressions via `deleted`). Synchro db claude : même doc `data/users/<id>/save`, `{state: ROOT, v: 2}`.
- Hub (`v2_hub.js`, `v2_hub.html`) : grille des univers par niveau, héros (ajout, bascule, suppression armée 3 s), sauvegarde (fichier via capability `downloads`, code `LT1.<base64 deflate>` via `encodeSave/decodeSave`, chargement = fusion jamais écrasement), Carnet des Temps (`renderGlobalBook`). Accueil : barre `.unibar` avec bouton « Tous les univers » et `<select id="sel-tense">`, fond `IMG['home_<temps>']`, musique `THEMES['home_<temps>']`.
- Tests : `src/v2/mk_test.py <nom> <test.js>` enveloppe le source + un script de test et le lance en Chrome headless (`test_core.js` moteur et état, `test_run.js` parties complètes dans plusieurs univers).

## Architecture du fichier unique (v1, toujours valable pour la carte, les sanctuaires, la Lune de sang, le château)

- `<style>` : tokens dans `:root`, thème sombre unique. Sections : Home, Game, Boss, Lune de sang, Result, Carnet, Modal.
- Données : `N` (notes pédagogiques), `REGIONS`, `VERBS` via `add(région, groupe, verbe, formes, note, options)` avec générateurs (`er`, `ir2`, `ger`, `cer`, `dbl`, `grave`, `eacc`, `ayer`, `yer`, `ir3`, `venir`, `dre`, `prendre`, `mettre`, `aitre`, `indre`, `uire`, `cevoir`, `faire`, `dire`, `dblr`, `egacc`). Formes : `[je, tu, il, nous, vous, ils]`, alternatives séparées par `/`. Flags : `refl` (pronominal), `imp` (impersonnel), `h` (h aspiré), `hard` (tiré 2 fois plus), `core` (2 épreuves par sanctuaire).
- `COMP` : complément de phrase par verbe (univers Zelda), sans accord avec le sujet. `SUBJECTS` : sujets variés par personne.
- État `S` (v1 ; en v2 c'est un monde dans `ROOT`, voir plus haut) : rupees, lueurs, bonusHearts, items `{verbe|personne: {w,r,s,t}}`, regions `{stars,plays,best}`, daily, tot, moonRuns, bossWins, resetAt, updated.
- Fusion synchro : le plus grand nombre de réponses jouées gagne, un resetAt plus récent l'emporte, la date sert en dernier recours.
- Sélection des épreuves : `weightOf` (erreurs ×3, maîtrisé ×0,3, hard ×2) ; sanctuaire = 2 verbes `core` + région ; révision = 15 épreuves par paliers (erreurs en attente, autres personnes des mêmes verbes, anciennes erreurs avec moins de 4 réussites d'affilée via `consolidateList`, verbes `hard` non maîtrisés), bouton actif tant qu'il reste quelque chose à consolider ; château = 40 % erreurs récentes + 3e groupe ×2,2, Eldin ×0,5, réguliers ×0,02.
- Images : `IMG` (data URI, pixel art PixelLab 400×224, sources dans `src/img/`, dont les 15 fonds d'accueil `home_<temps>.png`). Dessinées en canvas plein écran avec vignette ; particules par région (`SCENE_FX`).
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
