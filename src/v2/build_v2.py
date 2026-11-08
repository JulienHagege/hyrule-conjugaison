#!/usr/bin/env python3
"""Assemble la version 2 (La Légende des Temps) à partir du source v29 et des blocs v2_*.js / engine.js."""
import re, pathlib, sys
H = pathlib.Path(__file__).parent
src = (H/'hyrule-conjugaison.v29.html').read_text(encoding='utf-8')
rd = lambda n: (H/n).read_text(encoding='utf-8')
NB = ' '
def fr(x): return re.sub(r' ([?!])(?=\S|$)', lambda m: NB+m.group(1), x)
def rep(a, b, count=1):
    global src
    if src.count(a)==0 and src.count(fr(a)): a = fr(a)
    b = fr(b)
    n = src.count(a)
    assert n>=1, 'introuvable : '+a[:90]
    if count==1: assert n==1, f'{n} occurrences : '+a[:90]
    src = src.replace(a, b) if count!=1 else src.replace(a, b, 1)

# ---------- Titre
rep('<title>Hyrule Conjugaison</title>', '<title>La Légende des Temps</title>')

# ---------- CSS
rep('@media (prefers-reduced-motion:reduce){', rd('v2.css') + '\n@media (prefers-reduced-motion:reduce){')

# ---------- HTML : hub avant HOME, barre d'univers, titres
rep('<!-- HOME -->\n<section class="screen" id="home" hidden>\n  <div class="hero">', rd('v2_hub.html') + '\n<!-- HOME -->\n<section class="screen" id="home" hidden>\n  <div class="unibar"><button class="btn ghost" id="btn-hub">🌌 Tous les univers</button><select id="sel-tense" class="tsel" aria-label="Changer d\'univers"></select></div>\n  <div class="hero">')
rep('<div class="tag">Le présent de l\'indicatif</div>\n    <h1>Hyrule Conjugaison</h1>', '<div class="tag">La Légende des Temps</div>\n    <h1 id="h-tense">Présent</h1>\n    <div class="tdef"><p class="tsub" id="h-tense-desc"></p><p class="tex" id="h-tense-ex"></p></div>')
rep('<div class="maptitle"><h2>Carte d\'Hyrule</h2><span>Choisis un sanctuaire</span></div>', '<div class="maptitle"><h2>Carte d\'Hyrule</h2><span id="map-hint">Choisis un sanctuaire</span></div>')
rep('<div class="qhead"><span id="q-num"></span><span class="badge" id="q-group"></span></div>', '<div class="qhead"><span id="q-num"></span><span class="badges"><span class="badge tense" id="q-tense"></span><span class="badge" id="q-group"></span></span></div>')
rep('<h2>📖 Carnet du Sage</h2>', '<h2 id="b-title">📖 Carnet du Sage</h2>')
rep('<h3>Maîtrise des verbes par région</h3>\n    <p style="color:var(--muted);margin:0 0 8px;font-size:14px">Un verbe est maîtrisé (★)', '<h3>Maîtrise des verbes par région</h3>\n    <p style="color:var(--muted);margin:0 0 8px;font-size:14px">Les verbes qui se conjuguent pareil forment une famille (prendre, apprendre, comprendre…) : ils sont montrés à tour de rôle et comptent ensemble. Une famille est maîtrisée (★)')
rep('Il passe en or (★★) après 4 réussites. Un verbe en rouge attend sa revanche', 'Elle passe en or (★★) après 4 réussites. Une famille en rouge attend sa revanche')
rep('<span>Effacer toute la progression et les erreurs ?</span><button class="btn danger" id="b-reset-yes">Oui, tout effacer</button>', '<span>Effacer la progression et les erreurs de cet univers (les autres temps ne bougent pas) ?</span><button class="btn danger" id="b-reset-yes">Oui, effacer cet univers</button>')
rep('<button class="btn ghost" id="b-reset">🗑️ Tout effacer</button>', '<button class="btn ghost" id="b-reset">🗑️ Effacer cet univers</button>')

# ---------- Données : nouveaux verbes, familles, moteur
marker = "VERBS.forEach((x,i) => { x.id = i; x.alts = x.f.map(s => s.split('/')); });"
rep(marker, rd('new_verbs.js').strip() + '\n' + marker)
old_tail = """const PERSON_LABEL = ['je','tu','il / elle','nous','vous','ils / elles'];
const SUBJECTS = [
  ['je'], ['tu'],
  ['il','elle','on','Link','Zelda','Purah','Tulin','Sidon','Riju','le Korogu','Ganondorf'],
  ['nous','Link et moi','Zelda et moi'],
  ['vous','Zelda et toi','Tulin et toi'],
  ['ils','elles','Link et Zelda','les Korogus','les Bokoblins','les Sages','Purah et Impa','les Zoras']
];"""
rep(old_tail, rd('v2_data.js').strip() + '\n' + rd('engine.js').strip())
# compléments des nouveaux verbes
rep('const COMP = {\n', 'const COMP = {\narriver:"au village de Cocorico", entrer:"dans le sanctuaire", rentrer:"à l\'écurie avant la nuit", rester:"près du feu de camp", monter:"au sommet de la tour", retourner:"aux Îles célestes", continuer:"la quête vers le château", saluer:"la princesse Zelda", "se réveiller":"au lever du soleil", "se laver":"dans le lac Hylia", "se coucher":"sous les étoiles", "se dépêcher":"d\'atteindre le sanctuaire", naviguer:"sur le lac Hylia", fatiguer:"le cheval avant la course", "se taire":"devant le roi Zora",\n')
# phrase : comp, sentenceHtml, subjectText
i0 = src.index('function comp(V){'); i1 = src.index('/* =========================================================\n   ÉTAT, SAUVEGARDE')
src = src[:i0] + rd('v2_sentence.js').strip() + '\n\n' + src[i1:]
# état
i0 = src.index('/* =========================================================\n   ÉTAT, SAUVEGARDE'); i1 = src.index('/* =========================================================\n   SON (synthèse Web Audio)')
src = src[:i0] + rd('v2_state.js').strip() + '\n\n' + src[i1:]
# synchro + démarrage
i0 = src.index('/* =========================================================\n   SYNCHRO ENTRE APPAREILS'); i1 = src.index('</script>', i0)
src = src[:i0] + rd('v2_sync.js').strip() + '\n' + src[i1:]
# hub : avant la section ÉVÉNEMENTS
rep('/* =========================================================\n   ÉVÉNEMENTS', rd('v2_hub.js').strip() + '\n\n/* =========================================================\n   ÉVÉNEMENTS')

# ---------- Réglages globaux
src = src.replace('S.sound', 'ROOT.sound').replace('S.music', 'ROOT.music')

# ---------- Écrans
rep("const SCREENS = ['home','game','result','book'];", "const SCREENS = ['hub','home','game','result','book'];")
rep("setScene(id==='game' && run ? (run.mode==='boss' ? 'chateau' : run.mode==='review' ? 'sage' : run.regionId) : 'home'); AMB.want = sceneId; AMB.sync();",
    "setScene(id==='game' && run ? (run.mode==='boss' ? 'chateau' : run.mode==='review' ? 'sage' : run.regionId) : id==='home' ? homeScene() : 'home'); AMB.want = id==='home' ? 'home_'+TENSE : sceneId; AMB.sync();")

# ---------- Accueil
rep("  $('#h-name').textContent = S.name || 'Link';", """  const T = TENSE_BY[TENSE];
  $('#h-name').textContent = P.name || 'Link';
  $('#h-tense').textContent = T.name; $('#h-tense-desc').textContent = T.mood + ' · ' + T.desc; $('#h-tense-ex').textContent = T.ex || '';
  const sel = $('#sel-tense'); sel.innerHTML = TENSES.map(t => `<option value="${t.id}"${t.id===TENSE?' selected':''}>${t.icon} ${t.name}</option>`).join('');""")
rep("  if (S.daily.d!==today()) { S.daily = {d:today(),c:0,done:false}; save(); }\n  $('#daily-bar').style.width = Math.min(100, S.daily.c/20*100)+'%';\n  $('#daily-text').textContent = S.daily.done ? '✅ Quête du jour accomplie !' : `${S.daily.c} / 20`;",
    "  if (P.daily.d!==today()) { P.daily = {d:today(),c:0,done:false}; save(); }\n  $('#daily-bar').style.width = Math.min(100, P.daily.c/20*100)+'%';\n  $('#daily-text').textContent = P.daily.done ? '✅ Quête du jour accomplie !' : `${P.daily.c} / 20`;")
rep("""    const verbs = VERBS.filter(v => v.r===R.id);
    const mastered = R.boss ? VERBS.filter(v => verbMastery(v)>=2).length : verbs.filter(v => verbMastery(v)>=2).length;
    const total = R.boss ? VERBS.length : verbs.length;""", """    const heads = HEADS.filter(h => (R.boss || h.r===R.id) && existsAt(h, TENSE));
    const mastered = heads.filter(h => verbMastery(h)>=2).length, total = heads.length;
    const nverbs = VERBS.filter(v => (R.boss || v.r===R.id) && existsAt(v, TENSE)).length;""")
rep("<div class=\"sub\">${R.sub} · ${total} verbes</div>", "<div class=\"sub\">${R.sub}<span class=\"nv\"> · ${nverbs} verbes</span></div>")

# ---------- Jeu
rep("  const h = VERBS[v].hard ? 2 : 1;", "  const h = hardAt(VERBS[v], TENSE) ? 2 : 1;")
rep("function mkQ(v,p){ const V = VERBS[v]; const subs = SUBJECTS[p]; return {v, p, s: V.imp ? 'il' : subs[Math.floor(Math.random()*subs.length)], c: comp(V)}; }\nfunction persons(V){ return V.imp ? [2] : [0,1,2,3,4,5]; }",
"""// Une question : v = famille (verbe tête, porte les statistiques), m = cousin affiché (à tour de rôle), a = réponses acceptées pour ce sujet.
function mkQ(v,p){
  const H = VERBS[v]; const members = FAMILIES[H.v].map(n => BY_VERB[n]).filter(M => M && personsAt(M, TENSE).includes(p));
  const list = members.length ? members : [H];
  const it = S.items[itemKey(v,p)], n = it ? it.r+it.w : 0; _famCount[H.v] = (_famCount[H.v]||0)+1;
  const M = list[(n + _famCount[H.v]) % list.length];
  const subs = SUBJECTS[p]; const sub = M.imp ? {t:'il',g:'m',n:'s'} : subs[Math.floor(Math.random()*subs.length)];
  return {v, m:M.id, p, t:TENSE, s:sub.t, g:sub.g, n:sub.n, a:conj(M, TENSE, p, sub), c:comp(M)};
}
function persons(V){ return personsAt(V, TENSE); }""")
rep("    if (qs.length<REVIEW_N){ const hard = []; VERBS.filter(V => V.hard && verbMastery(V)<3).forEach(V => persons(V).forEach(p => hard.push({v:V.id,p}))); take(hard, REVIEW_N-qs.length, q => weightOf(q.v,q.p)); }",
    "    if (qs.length<REVIEW_N){ const hard = []; HEADS.filter(V => existsAt(V, TENSE) && hardAt(V, TENSE) && verbMastery(V)<3).forEach(V => persons(V).forEach(p => hard.push({v:V.id,p}))); take(hard, REVIEW_N-qs.length, q => weightOf(q.v,q.p)); }")
rep("  const verbs = mode==='boss' ? VERBS : VERBS.filter(v => v.r===regionId);", "  const verbs = HEADS.filter(v => (mode==='boss' || v.r===regionId) && existsAt(v, TENSE));")
rep("      if (V.hard) w *= 2; if (V.r==='ciel') w *= 1.6;", "      if (hardAt(V, TENSE)) w *= 2; if (V.r==='ciel') w *= 1.6;")
rep("  const corePool = []; VERBS.filter(V => V.core).forEach(V => persons(V).forEach(p => corePool.push({v:V.id,p})));", "  const corePool = []; HEADS.filter(V => V.core && existsAt(V, TENSE)).forEach(V => persons(V).forEach(p => corePool.push({v:V.id,p})));")
rep("""  const q = run.qs[run.i], V = VERBS[q.v];
  run.phase = 'ask';
  $('#q-num').textContent = `Épreuve ${run.i+1} / ${run.qs.length}`;
  const gb = $('#q-group'); gb.textContent = V.g+(V.g===1?'er':'e')+' groupe'; gb.className = 'badge g'+V.g;
  $('#q-subj').textContent = cap(subjectText(q).trim());
  $('#q-blank').innerHTML = '&nbsp;';
  $('#q-rest').textContent = (q.c || '') + '.';""", """  const q = run.qs[run.i], V = VERBS[q.m];
  run.phase = 'ask';
  $('#q-num').textContent = `Épreuve ${run.i+1} / ${run.qs.length}`;
  const gb = $('#q-group'); gb.textContent = V.g+(V.g===1?'er':'e')+' groupe'; gb.className = 'badge g'+V.g;
  $('#q-tense').textContent = TENSE_BY[TENSE].name;
  $('#q-subj').textContent = subjDisp(q);
  $('#q-blank').innerHTML = '&nbsp;';
  $('#q-rest').textContent = (q.c || '') + endMark();""")
rep("""function norm(s){
  s = s.replace(/[’‘]/g,"'").trim().toLowerCase().replace(/\\s+/g,' ');
  for (let i=0;i<3;i++) s = s.replace(/^(j'|je |tu |il |elle |on |nous |vous |ils |elles |m'|t'|s'|me |te |se |n'|ne |pas )/, '');
  return s.trim();
}""", """function norm(s){
  s = s.replace(/[’‘]/g,"'").replace(/\\s*-\\s*/g,'-').trim().toLowerCase().replace(/\\s+/g,' ');
  s = s.replace(/^(que |qu')/, '');
  for (let i=0;i<3;i++) s = s.replace(/^(j'|je |tu |il |elle |on |nous |vous |ils |elles |m'|t'|s'|me |te |se |n'|ne |pas )/, '');
  return s.trim();
}""")
rep("""  const q = run.qs[run.i], V = VERBS[q.v], alts = V.alts[q.p];
  const ok = alts.includes(a);
  const almost = !ok && alts.map(deacc).includes(deacc(a));""", """  const q = run.qs[run.i], V = VERBS[q.m], alts = q.a;
  const ok = alts.includes(a);
  const almostAcc = !ok && alts.map(deacc).includes(deacc(a));
  const almostHyph = !ok && !almostAcc && alts.includes(a.replace(/\\s+(toi|nous|vous)$/, '-$1'));
  const almostSp = !ok && !almostAcc && !almostHyph && alts.map(x => x.replace(/\\s+/g,'')).includes(a.replace(/\\s+/g,''));
  const almost = almostAcc || almostHyph || almostSp;
  const almostMsg = almostHyph ? "Presque ! Il manque le trait d'union." : almostSp ? "Presque ! Il manque une espace entre les deux mots." : "Presque ! Il manque un accent.";""")
rep("""    if (!S.daily.done){ S.daily.c++; if (S.daily.c>=20){ S.daily.done=true; S.rupees+=50; setTimeout(()=>{ toast('🗓️ Quête du jour accomplie : +50 rubis !'); SFX.korok(); }, 900); } }""",
    """    if (!P.daily.done){ P.daily.c++; if (P.daily.c>=20){ P.daily.done=true; S.rupees+=50; setTimeout(()=>{ toast('🗓️ Quête du jour accomplie : +50 rubis !'); SFX.korok(); }, 900); } }""")
rep("    run.errors.push({v:q.v, p:q.p, given:raw.trim()});", "    run.errors.push({v:q.v, m:q.m, p:q.p, t:q.t, s:q.s, g:q.g, n:q.n, a:q.a, c:q.c, given:raw.trim()});")
rep("""<div class="big">Presque ! Il manque un accent.</div>""", """<div class="big">${almostMsg}</div>""")
assert src.count('<span>${esc(V.n)}</span>')==2
src = src.replace('<span>${esc(V.n)}</span>', '<span>${esc(tenseNote(V, TENSE))}</span>')
rep("""  const q = run.qs[run.i], V = VERBS[q.v];
  const ri = $('#inp-retype'); const a = norm(ri.value);
  if (V.alts[q.p].includes(a)){ SFX.ok(); next(); }""", """  const q = run.qs[run.i];
  const ri = $('#inp-retype'); const a = norm(ri.value);
  if (q.a.includes(a)){ SFX.ok(); next(); }""")
rep("""  return `<div class="conj">${V.f.map((f,i) => V.imp && i!==2 ? '' : `<div class="${i===p?'hit':''}"><span>${PERSON_LABEL[i]}</span> <b>${esc(f.replace('/',' / '))}</b></div>`).join('')}</div>`;""",
    """  const T = TENSE_BY[TENSE];
  // Libellé de personne : j' devant une voyelle, « que » / « qu' » au subjonctif, (tu) à l'impératif
  const lab = (i, f) => { if (TENSE==='imperatif') return '('+PERSON_LABEL[i].replace(' / ','/')+')'; let l = PERSON_LABEL[i]; if (i===0 && VOWEL.test(f) && !(V.h && !T.cmp)) l = "j'"; if (T.pre) l = (VOWEL.test(l) ? "qu'" : 'que ') + l; return l; };
  return `<div class="conj">${formsOf(V, TENSE).map((f,i) => !f.length ? '' : `<div class="${i===p?'hit':''}"><span>${lab(i, f[0])}</span> <b>${esc(f.slice(0,2).join(' / '))}</b></div>`).join('')}</div>`;""")
rep("""re.innerHTML = `<h3>À retravailler (le Sage s'en souvient)</h3><ul>${run.errors.map(e => { const V=VERBS[e.v]; const q={v:e.v,p:e.p,s:SUBJECTS[e.p][0]}; return `<li>${esc(subjectText(q))}<b>${esc(V.alts[e.p][0])}</b>""",
    """re.innerHTML = `<h3>À retravailler (le Sage s'en souvient)</h3><ul>${run.errors.map(e => { const V=VERBS[e.m]; const q=e; return `<li>${TENSE==='imperatif' ? '('+PERSON_LABEL[e.p].replace(' / ','/')+') ' : esc(subjectText(q))}<b>${esc(e.a[0])}</b>""")

# ---------- Lune de sang
rep("  const pool = []; VERBS.forEach(V => persons(V).forEach(p => pool.push({v:V.id,p})));\n  return sample(pool, MOON_N,", "  const pool = []; HEADS.filter(V => existsAt(V, TENSE)).forEach(V => persons(V).forEach(p => pool.push({v:V.id,p})));\n  return sample(pool, MOON_N,")
i0 = src.index('function distractors(V,p){'); i1 = src.index('function startMoon(){')
src = src[:i0] + rd('v2_distractors.js').strip() + '\n' + src[i1:]
rep("""  const q = moon.qs[moon.i], V = VERBS[q.v], correct = V.alts[q.p][0];
  const choices = shuffle([correct, ...distractors(V,q.p)]);""", """  const q = moon.qs[moon.i], V = VERBS[q.m], correct = q.a[0];
  const choices = shuffle([correct, ...distractors(q)]);""")
rep("""<div class="sentence"><span class="subj">${esc(cap(subjectText(q).trim()))}</span><span class="blank">&nbsp;</span><span class="rest">${esc(q.c||'')}.</span></div>""",
    """<div class="sentence"><span class="subj">${esc(subjDisp(q))}</span><span class="blank">&nbsp;</span><span class="rest">${esc(q.c||'')}${endMark()}</span></div>""")
rep("  const q = moon.qs[moon.i], V = VERBS[q.v], alts = V.alts[q.p], correct = alts[0];", "  const q = moon.qs[moon.i], alts = q.a, correct = alts[0];")
rep("    if (!moon.test){ S.rupees += g; it.r++; it.s++; S.tot.r++; if (!S.daily.done){ S.daily.c++; if (S.daily.c>=20){ S.daily.done=true; S.rupees+=50; } } }",
    "    if (!moon.test){ S.rupees += g; it.r++; it.s++; S.tot.r++; if (!P.daily.done){ P.daily.c++; if (P.daily.c>=20){ P.daily.done=true; S.rupees+=50; } } }")
rep("    if (!moon.test){ it.w++; it.s=0; S.tot.w++; run.errors.push({v:q.v, p:q.p, given: c || '(trop lent)', moon:true}); }",
    "    if (!moon.test){ it.w++; it.s=0; S.tot.w++; run.errors.push({v:q.v, m:q.m, p:q.p, t:q.t, s:q.s, g:q.g, n:q.n, a:q.a, c:q.c, given: c || '(trop lent)', moon:true}); }")

# ---------- Carnet
rep("""  const mastered = VERBS.filter(v => verbMastery(v)>=2).length;""", """  const heads = HEADS.filter(v => existsAt(v, TENSE)), mastered = heads.filter(v => verbMastery(v)>=2).length;
  $('#b-title').textContent = '📖 Carnet du Sage · ' + TENSE_BY[TENSE].name;""")
rep("""<div class="stat"><b class="tabular">${mastered}/${VERBS.length}</b><span>verbes maîtrisés</span></div>""", """<div class="stat"><b class="tabular">${mastered}/${heads.length}</b><span>familles maîtrisées</span></div>""")
rep("""  $('#b-errs').innerHTML = weak.length ? weak.map(x => { const V=VERBS[x.v]; return `<tr><td><b>${esc(V.v)}</b></td><td>${PERSON_LABEL[x.p]}</td><td style="color:var(--zonai);font-weight:800">${esc(V.f[x.p].replace('/',' / '))}</td>""",
    """  $('#b-errs').innerHTML = weak.length ? weak.map(x => { const V=VERBS[x.v]; const cs = cousinsOf(V); return `<tr><td><b>${esc(V.v)}</b>${cs.length?` <small style="color:var(--muted)">+ ${esc(cs.join(', '))}</small>`:''}</td><td>${PERSON_LABEL[x.p]}</td><td style="color:var(--zonai);font-weight:800">${esc(formsOf(V, TENSE)[x.p].slice(0,2).join(' / '))}</td>""")
rep("""    const vs = VERBS.filter(v => v.r===R.id);""", """    const vs = HEADS.filter(v => v.r===R.id && existsAt(v, TENSE));""")
rep("""return `<span class="${bad?'bad':'m'+m}" title="${m===0?'jamais vu':m===3?'maîtrisé, en or':m===2?'maîtrisé':'une erreur à corriger'}">${esc(v.v)}${m===3?' ★★':m===2?' ★':''}</span>`;""",
    """const cs = cousinsOf(v); return `<span class="${bad?'bad':'m'+m}" title="${cs.length ? 'Famille : '+esc(cs.join(', '))+' · ' : ''}${m===0?'jamais vue':m===3?'maîtrisée, en or':m===2?'maîtrisée':'une erreur à corriger'}">${esc(v.v)}${cs.length?`<small> +${cs.length}</small>`:''}${m===3?' ★★':m===2?' ★':''}</span>`;""")
rep("  $('#b-unlock').textContent = S.unlockAll ?", "  $('#b-unlock').textContent = P.unlockAll ?")
rep("""  const be = $('#b-err'); be.hidden = !S.lastErr;
  if (S.lastErr) be.innerHTML = `Dernière erreur technique (${esc(new Date(S.lastErr.t).toLocaleString('fr-FR'))}, ${esc(S.lastErr.where||'?')}) : ${esc(S.lastErr.m)}""",
    """  const be = $('#b-err'); be.hidden = !ROOT.lastErr;
  if (ROOT.lastErr) be.innerHTML = `Dernière erreur technique (${esc(new Date(ROOT.lastErr.t).toLocaleString('fr-FR'))}, ${esc(ROOT.lastErr.where||'?')}) : ${esc(ROOT.lastErr.m)}""")
rep("if (bc) bc.addEventListener('click', () => { delete S.lastErr; save(); renderBook(); });", "if (bc) bc.addEventListener('click', () => { delete ROOT.lastErr; save(); renderBook(); });")

# ---------- Événements
rep("$('#b-unlock').addEventListener('click', () => { S.unlockAll = !S.unlockAll; save(); renderBook(); toast(S.unlockAll ?", "$('#b-unlock').addEventListener('click', () => { P.unlockAll = !P.unlockAll; P.updated = Date.now(); save(); renderBook(); toast(P.unlockAll ?")
rep("$('#b-rename').addEventListener('click', () => { $('#inp-name').value = S.name;", "$('#b-rename').addEventListener('click', () => { $('#inp-name').value = P.name;")
rep("$('#b-reset-yes').addEventListener('click', () => { const name = S.name; S = DEFAULT(); S.name = name; S.resetAt = Date.now(); save(); $('#b-confirm').classList.remove('on'); renderBook(); toast('Progression effacée. Une nouvelle aventure commence.'); });",
    "$('#b-reset-yes').addEventListener('click', () => { P.worlds[TENSE] = S = DEFAULT(); S.resetAt = Date.now(); save(); $('#b-confirm').classList.remove('on'); renderBook(); toast(`Progression effacée pour « ${TENSE_BY[TENSE].name} ». Une nouvelle aventure commence.`); });")
rep("$('#btn-name').addEventListener('click', () => { const n = $('#inp-name').value.trim(); S.name = n || 'Link'; save(); track('nouveau-heros'); $('#modal-name').hidden = true; renderHome(); SFX.heart(); });",
    """$('#btn-name').addEventListener('click', () => { const n = $('#inp-name').value.trim() || 'Link'; $('#modal-name').hidden = true; SFX.heart();
  if (!P){ const p = NEW_PROFILE(n); ROOT.profiles[p.id] = p; ROOT.active = p.id; bind(); save(); track('nouveau-heros'); renderHub(); show('hub'); toast(`Bienvenue à Hyrule, ${n} ! Choisis ton premier univers.`); }
  else { P.name = n; P.updated = Date.now(); save(); if (screen==='book') renderBook(); else if (screen==='hub') renderHub(); else renderHome(); } });""")

# ---------- Accueil allégé : bandeau rang/lueurs sur fond translucide, cartes compactes et alignées, plus d'indication « Choisis un sanctuaire »
rep("""    <div class="level">
      <div class="row"><span>Rang : <b id="h-rank">Apprenti</b></span><span id="h-next"></span></div>
      <div class="bar gold"><i id="h-levelbar"></i></div>
    </div>
    <div class="level">
      <div class="row"><span>Lueurs bienfaisantes : <b id="h-lueur-txt">0</b></span><span id="h-lueur-next"></span></div>
      <div class="bar lueur"><i id="h-lueurbar"></i></div>
    </div>""", """    <div class="levels">
    <div class="level">
      <div class="row"><span>Rang : <b id="h-rank">Apprenti</b></span><span id="h-next"></span></div>
      <div class="bar gold"><i id="h-levelbar"></i></div>
    </div>
    <div class="level">
      <div class="row"><span>Lueurs : <b id="h-lueur-txt">0</b></span><span id="h-lueur-next"></span></div>
      <div class="bar lueur"><i id="h-lueurbar"></i></div>
    </div>
    </div>""")
rep("""    <div class="card sage" id="sage-card">
      <h2>✦ La révision du Sage</h2>
      <p id="sage-text">Aucune erreur pour l'instant. Le Sage te regarde avec fierté.</p>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button class="btn violet" id="btn-review">Réviser mes erreurs</button>
        <span class="chip review" id="chip-review">0 à revoir</span>
      </div>
    </div>
    <div class="card">
      <h2>🗓️ Quête du jour</h2>
      <p>20 bonnes réponses aujourd'hui : <b style="color:var(--gold)">+50 rubis</b>. Chaque sans-faute t'offre une lueur bienfaisante, et finir le Château d'Hyrule aussi.</p>
      <div class="bar"><i id="daily-bar"></i></div>
      <div style="margin-top:6px;font-size:13px;color:var(--muted);font-weight:800" id="daily-text">0 / 20</div>
    </div>""", """    <div class="card sage mini" id="sage-card">
      <div class="mini-head"><h2>✦ Révision du Sage</h2><span class="chip review" id="chip-review">0 à revoir</span></div>
      <p id="sage-text">Aucune erreur à revoir. Le Sage te regarde avec fierté.</p>
      <button class="btn violet" id="btn-review">Réviser mes erreurs</button>
    </div>
    <div class="card mini">
      <div class="mini-head"><h2>🗓️ Quête du jour</h2><span class="chip" id="daily-text">0 / 20</span></div>
      <p>20 bonnes réponses aujourd'hui : <b style="color:var(--gold)">+50 rubis</b>. Un sans-faute offre une lueur.</p>
      <div class="bar"><i id="daily-bar"></i></div>
    </div>""")
rep("""<div class="maptitle"><h2>Carte d'Hyrule</h2><span id="map-hint">Choisis un sanctuaire</span></div>""", """<div class="maptitle"><h2>Carte d'Hyrule</h2></div>""")
rep("""  $('#sage-text').textContent = weak.length ? (weak.length===1 ? "Une conjugaison te résiste encore. Le Sage t'attend pour la vaincre, avec 14 autres points à consolider. Une lueur si c'est sans faute !" : `${weak.length} conjugaisons te résistent. Le Sage t'attend pour les vaincre, avec les autres points à consolider : 15 épreuves, et une lueur si c'est sans faute.`) : cons ? "Aucune erreur en attente, mais le Sage connaît tes anciens points faibles : 15 épreuves pour les consolider, et une lueur si c'est sans faute." : "Aucune erreur à revoir. Le Sage te regarde avec fierté : va explorer un sanctuaire !";""",
    """  $('#sage-text').textContent = weak.length ? (weak.length===1 ? "Une conjugaison te résiste : 15 épreuves pour la vaincre, une lueur si c'est sans faute." : `${weak.length} conjugaisons te résistent : 15 épreuves pour les vaincre, une lueur si c'est sans faute.`) : cons ? "Aucune erreur en attente : 15 épreuves pour consolider tes anciens points faibles." : "Aucune erreur à revoir. Le Sage te regarde avec fierté.";""")
rep("""  $('#daily-text').textContent = P.daily.done ? '✅ Quête du jour accomplie !' : `${P.daily.c} / 20`;""", """  $('#daily-text').textContent = P.daily.done ? '✅ Accomplie !' : `${P.daily.c} / 20`;""")

# ---------- Carte : cartes de région de même hauteur, sous-titre et condition en une ligne
for a, c in [("1er groupe, les verbes sages", "1er groupe sage"), ("2e groupe : -ir, -issons", "2e groupe (-issons)"), ("1er groupe, les pièges", "1er groupe piégé"),
             ("Les verbes les plus bizarres", "Les plus bizarres"), ("Boss final : Ganondorf, 3 phases", "Ganondorf, 3 phases")]:
    rep('sub:"%s"' % a, 'sub:"%s"' % c)
rep("""      ${unlocked ? '' : `<div class="need">${R.boss ? 'Gagne une étoile dans chaque région' : 'Gagne une étoile à ' + REGIONS[i-1].name}</div>`}""",
    """      <div class="need${unlocked ? ' soft' : ''}">${unlocked ? (st.plays ? `${st.plays} ${st.plays>1 ? 'expéditions' : 'expédition'}` : 'Jamais exploré') : '<span class="long">★ requise : </span><span class="short">🔒 </span>' + (R.boss ? 'chaque région' : REGIONS[i-1].name)}</div>""")

# ---------- Musiques d'accueil par univers
rep("  chateau:{root:146.8,", rd('v2_themes.js').strip() + '\n  chateau:{root:146.8,')


# ---------- Fonds d'accueil par univers (PixelLab 400×224, sources dans img_v2/)
import base64
imgs = ''.join(f'  home_{k}:"data:image/png;base64,{base64.b64encode((H/"img_v2"/f"home_{k}.png").read_bytes()).decode()}",\n' for k in ['present','futur','imparfait','pc','imperatif','ps','pqp','fa','cond','subj','subjp','condp','pa','subji','subjpqp'])
rep('const IMG = {\n', 'const IMG = {\n' + imgs)

(H/'hyrule-conjugaison.html').write_text(src, encoding='utf-8')
print('écrit', len(src), 'octets')
