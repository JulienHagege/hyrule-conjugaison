/* =========================================================
   LES PROFONDEURS : accord du participe passé avec avoir quand le COD est placé avant.
   Région bonus sous le Château (univers listés dans DEPTHS_TENSES), ouverte après une première victoire sur Ganondorf.
   Chaque épreuve se joue en deux gestes : toucher le COD dans la phrase, puis écrire auxiliaire + participe.
   Les statistiques sont rangées par type de piège (S.cod), pas par verbe. Une étoile dans la région
   ajoute ces épreuves au Château et à la Lune de sang de l'univers.
   ========================================================= */
const DEPTHS = {id:'profondeurs', name:'Les Profondeurs', sub:'Accord du participe', icon:'⛏️', n:12};
const DEPTHS_TENSES = ['pc'];
const hasDepths = () => DEPTHS_TENSES.includes(TENSE);
const regOf = id => id===DEPTHS.id ? DEPTHS : REGIONS.find(r => r.id===id);
const depthsOpen = () => hasDepths() && !!((P && P.unlockAll) || S.bossWins>=1);
const codOn = () => hasDepths() && ((S.regions[DEPTHS.id]||{}).stars||0)>=1;

// verbe, COD (féminin singulier | masculin singulier | féminin pluriel | masculin pluriel), complément qui n'est pas un COD
const COD_DATA = [
  ['prendre', "l'épée|le bouclier|les flèches|les rubis", 'dans le coffre'],
  ['mettre', 'la tunique|le casque|les bottes|les gants', 'avant le combat'],
  ['écrire', 'la lettre|le message|les lettres|les poèmes', 'pendant la nuit'],
  ['ouvrir', 'la porte|le coffre|les portes|les coffres', 'avec la clé'],
  ['construire', 'la machine|le radeau|les machines|les ponts', 'près de la rivière'],
  ['découvrir', 'la grotte|le sanctuaire|les grottes|les sanctuaires', 'sous la montagne'],
  ['faire', 'la soupe|le gâteau|les brochettes|les plats', 'au feu de camp'],
  ['peindre', 'la fresque|le portrait|les fresques|les tableaux', 'au village'],
  ['détruire', 'la barrière|le rocher|les caisses|les rochers', 'avec une bombe'],
  ['apprendre', 'la chanson|le secret|les chansons|les secrets', 'auprès du Sage'],
  ['cuire', 'la viande|le poisson|les pommes|les champignons', 'dans la marmite'],
  ['éteindre', 'la torche|le feu|les torches|les feux', 'avant de partir'],
  ['offrir', 'la potion|le bouclier|les potions|les rubis', 'pour la fête'],
  ['promettre', 'la récompense|le trésor|les récompenses|les rubis', 'au village'],
  ['trouver', 'la carte|le trésor|les flèches|les rubis', 'dans la grotte'],
  ['vaincre', 'la créature|le Lynel|les créatures|les Bokoblins', 'près du lac'],
  ['choisir', "l'armure|l'arc|les armures|les arcs", 'chez le marchand'],
  ['voir', 'la tour|le dragon|les étoiles|les dragons', 'dans le ciel'],
  ['perdre', 'la clé|le bouclier|les clés|les rubis', 'dans le désert'],
  ['vendre', 'la gemme|le diamant|les gemmes|les champignons', 'au marché'],
  ['entendre', 'la cloche|le cri|les cloches|les chants', 'dans la forêt'],
  ['finir', 'la quête|le sanctuaire|les quêtes|les sanctuaires', 'avant la nuit'],
  ['remplir', 'la gourde|le sac|les gourdes|les sacs', 'à la rivière'],
  ['lancer', 'la lance|le boomerang|les bombes|les rochers', 'sur le monstre'],
  ['cueillir', 'la pomme|le champignon|les pommes|les champignons', 'dans la forêt'],
  ['recevoir', 'la récompense|le message|les récompenses|les cadeaux', 'au château'],
  ['protéger', 'la forêt|le village|les fées|les villageois', "pendant l'orage"],
  ['acheter', 'la potion|le bouclier|les potions|les arcs', 'au village'],
  ['lire', 'la carte|le livre|les lettres|les livres', 'à la bibliothèque'],
  ['attendre', 'la caravane|le marchand|les fées|les voyageurs', 'devant le temple'],
  ['manger', 'la pomme|le poisson|les baies|les champignons', 'près du feu']
];
const COD_GN = ['fs','ms','fp','mp'], COD_PPI = {ms:0, mp:1, fs:2, fp:3};
const COD_SUBJ = [{t:'Link',p:2},{t:'Zelda',p:2},{t:'Link',p:2},{t:'Zelda',p:2},{t:'Sidon',p:2},{t:'Riju',p:2},{t:'Tulin',p:2},{t:'Impa',p:2},{t:'je',p:0},{t:'tu',p:1},{t:'nous',p:3},{t:'vous',p:4},{t:'les Gorons',p:5},{t:'les Zoras',p:5},{t:'les Gerudos',p:5}];
const COD_KEYS = ['apres','que|ms','que|fs|a','que|fs|m','que|fp|a','que|fp|m','que|mp|a','que|mp|m'];
const COD_LABEL = {'apres':'COD après le verbe', 'que|ms':'COD avant, masculin singulier', 'que|fs|a':"COD avant, féminin singulier (ça s'entend)", 'que|fs|m':'COD avant, féminin singulier (muet)',
  'que|fp|a':"COD avant, féminin pluriel (ça s'entend)", 'que|fp|m':'COD avant, féminin pluriel (muet)', 'que|mp|a':'COD avant, masculin pluriel (participe en s ou t)', 'que|mp|m':'COD avant, masculin pluriel'};
const COD_SHORT = {'apres':'COD après', 'que|ms':'avant · masc. sing.', 'que|fs|a':'avant · fém. sing. (prise)', 'que|fs|m':'avant · fém. sing. (trouvée)', 'que|fp|a':'avant · fém. plur. (prises)', 'que|fp|m':'avant · fém. plur. (trouvées)', 'que|mp|a':'avant · masc. plur. (ouverts)', 'que|mp|m':'avant · masc. plur. (trouvés)'};
const COD_EX = {'apres':'Link a trouvé les rubis', 'que|ms':'le trésor que Link a trouvé', 'que|fs|a':"l'épée que Link a prise", 'que|fs|m':'la carte que Link a trouvée',
  'que|fp|a':'les lettres que Link a écrites', 'que|fp|m':'les flèches que Link a trouvées', 'que|mp|a':'les coffres que Link a ouverts', 'que|mp|m':'les rubis que Link a trouvés'};

// Statistiques par type de piège
function codItem(key){ if (!S.cod) S.cod = {}; return S.cod[key] || (S.cod[key] = {w:0,r:0,s:0,t:0}); }
const itemOf = q => q.cod ? codItem(q.cod.key) : item(q.v,q.p);
function codWeight(key){ const it = (S.cod||{})[key]; if (!it) return 1.2; let w = 1 + it.w*3; if (it.s>=3) w *= .3; return w; }
function weakCod(){ return Object.keys(S.cod||{}).filter(k => COD_LABEL[k] && isWeak(S.cod[k])); }
function codMastery(key){ const it = (S.cod||{})[key]; if (!it || !(it.r+it.w)) return 0; if (isWeak(it)) return 1; return it.r>=4 && it.r/(it.r+it.w)>=.9 ? 3 : it.r>=1 ? 2 : 1; }
const codAud = V => /[st]$/.test(pieces(V).ppF[0]);
const codData = () => COD_DATA.filter(d => BY_VERB[d[0]]);
function codPickKey(noApres){
  const ks = COD_KEYS.filter(k => !(noApres && k==='apres'));
  const ws = ks.map(k => (k==='apres' ? 3 : k==='que|ms' ? .8 : 1) * codWeight(k)); let x = Math.random()*ws.reduce((a,b) => a+b, 0);
  for (let i=0;i<ks.length;i++){ x -= ws[i]; if (x<=0) return ks[i]; } return ks[ks.length-1];
}
// Une épreuve : type 'apres' (Link a trouvé les rubis) ou 'que' (Voici les rubis que Link a trouvés)
function mkCod(d, type, gn, subj){
  const V = BY_VERB[d[0]], T = TENSE_BY[TENSE], pc = pieces(V), base = pc.ppF[0], aud = codAud(V);
  subj = subj || COD_SUBJ[Math.floor(Math.random()*COD_SUBJ.length)];
  const aux = auxForms('a', T.cmp)[subj.p][0], pp = type==='apres' ? base : pc.ppF[COD_PPI[gn]];
  const key = type==='apres' ? 'apres' : gn==='ms' ? 'que|ms' : 'que|'+gn+'|'+(aud ? 'a' : 'm');
  return {kind:'cod', v:BY_VERB[famHead(V.v)].id, m:V.id, p:subj.p, t:TENSE, s:subj.t, g:'m', n:'s', a:[aux+' '+pp], c:'',
    cod:{type, key, gn, noun:d[1].split('|')[COD_GN.indexOf(gn)], tail:d[2], intro:Math.random()<.5 ? 'Voici' : 'Regarde', base, forms:pc.ppF.slice()}};
}
// Fabrique une épreuve pour un type de piège donné, en évitant de réutiliser les verbes de `used`
function codFromKey(key, used){
  const parts = key.split('|'), type = parts[0]==='apres' ? 'apres' : 'que';
  const gn = type==='apres' ? COD_GN[Math.floor(Math.random()*4)] : parts[1];
  let cands = codData().filter(d => parts[2] ? codAud(BY_VERB[d[0]])===(parts[2]==='a') : true);
  const fresh = cands.filter(d => !used || !used.has(d[0])); if (fresh.length) cands = fresh;
  const d = cands[Math.floor(Math.random()*cands.length)]; if (used) used.add(d[0]);
  return mkCod(d, type, gn);
}
function codQs(k, used){ used = used || new Set(); const out = []; for (let i=0;i<k;i++) out.push(codFromKey(codPickKey(false), used)); return out; }
// Expédition dans les Profondeurs : des paires jumelles (même verbe, même COD, avant puis après) et des accords isolés.
function codRun(n){
  const used = new Set(), qs = [], pairs = Math.floor(n/3);
  for (let i=0;i<pairs;i++){
    const q = codFromKey(codPickKey(true), used), d = COD_DATA.find(x => x[0]===VERBS[q.m].v), subj = {t:q.s, p:q.p};
    qs.push(mkCod(d, 'apres', q.cod.gn, subj), q);
  }
  while (qs.length<n) qs.push(codFromKey(codPickKey(true), used));
  return shuffle(qs);
}
// Révision du Sage : les types de piège ratés y reviennent (5 épreuves au plus)
function codReview(qs){
  if (!hasDepths()) return qs; const wk = weakCod(); if (!wk.length) return qs;
  const k = Math.min(5, wk.length*2), used = new Set(), extra = [];
  for (let i=0;i<k;i++) extra.push(codFromKey(wk[i % wk.length], used));
  return qs.slice(0, Math.max(0, REVIEW_N-k)).concat(extra);
}

// ---------- Affichage de la phrase
function codParts(q){
  const c = q.cod, first = (q.a && q.a[0]) || '', sj = q.p===0 ? (VOWEL.test(first) ? "j'" : 'je') : q.s;
  if (c.type==='apres') return [{k:'subj', t:cap(sj)}, {k:'blank'}, {k:'cod', t:c.noun}, {k:'tail', t:c.tail}];
  return [{k:'intro', t:c.intro}, {k:'cod', t:c.noun}, {k:'que', t:VOWEL.test(sj) ? "qu'" : 'que'}, {k:'subj', t:sj}, {k:'blank'}, {k:'tail', t:c.tail}];
}
function codJoin(parts, fn){ let out = ''; parts.forEach((p,i) => { out += fn(p); if (i<parts.length-1 && !(p.t && p.t.endsWith("'"))) out += ' '; }); return out; }
// Phrase complète avec la réponse (correction, liste des erreurs)
function codSentenceHtml(q, form){ return codJoin(codParts(q), p => p.k==='blank' ? `<em>${esc(form)}</em>` : p.k==='cod' ? `<u class="codu">${esc(p.t)}</u>` : esc(p.t)) + '.'; }
function codSides(q, tap){
  const parts = codParts(q), i = parts.findIndex(p => p.k==='blank');
  const fn = p => tap && (p.k==='subj' || p.k==='cod' || p.k==='tail') ? `<span class="tap" role="button" tabindex="0" data-k="${p.k}">${esc(p.t)}</span>` : esc(p.t);
  const pre = parts.slice(0, i), post = parts.slice(i+1);
  return {pre: codJoin(pre, fn) + (pre[pre.length-1].t.endsWith("'") ? '' : ' '), post: ' ' + codJoin(post, fn) + '.'};
}
function codMoonHtml(q){ const s = codSides(q, false); return `<div class="sentence cod">${s.pre}<span class="blank">&nbsp;</span>${s.post}</div>`; }
function codDistractors(q){
  const c = q.cod, aux = q.a[0].split(' ')[0], out = [];
  c.forms.forEach(f => { const x = aux+' '+f; if (x!==q.a[0] && !out.includes(x)) out.push(x); });
  if (out.length<3){ const b = c.base, x = aux+' '+(b.endsWith('s') ? b.slice(0,-1)+'t' : b.endsWith('t') ? b.slice(0,-1)+'s' : VERBS[q.m].v); if (!out.includes(x)) out.push(x); }
  return shuffle(out).slice(0,3);
}
function codNote(q){
  const c = q.cod, n = `« ${c.noun} »`;
  if (c.type==='apres') return `Le COD ${n} est placé après le verbe : le participe ne le voit pas, il ne change pas. Et avec avoir, jamais d'accord avec le sujet.`;
  if (c.gn==='ms') return `Le COD ${n} est placé avant le verbe, mais il est masculin singulier : rien à ajouter.`;
  if (c.gn==='mp' && c.base.endsWith('s')) return `Le COD ${n} est placé avant le verbe : accord au masculin pluriel. « ${c.base} » finit déjà par s, rien à ajouter.`;
  const how = c.gn==='fs' ? 'féminin singulier : + e' : c.gn==='fp' ? 'féminin pluriel : + es' : 'masculin pluriel : + s';
  return `Le COD ${n} est placé avant le verbe : le participe s'accorde avec lui (${how}).`;
}
function codWhyHtml(q){ return `<div class="sage"><b>⏪ Rétrospective :</b><span>${esc(codNote(q))}</span></div>`; }
function codErrLi(e){ return `<li>${codSentenceHtml(e, e.a[0])} <span style="color:var(--muted)">(accord du participe)</span>${e.given ? ` <span style="color:var(--danger)">${e.moon ? '🌕 ' : ''}tu as ${e.moon ? 'choisi' : 'écrit'} « ${esc(e.given)} »</span>` : ''}</li>`; }

// ---------- Premier geste : toucher le COD
function codAsk(){
  const q = run.qs[run.i], box = $('#cod-step'), sen = $('#qcard .sentence');
  sen.classList.toggle('cod', !!q.cod); sen.classList.remove('done'); box.hidden = !q.cod;
  if (!q.cod) return;
  const gb = $('#q-group'); gb.textContent = 'Accord du participe'; gb.className = 'badge g3';
  const s = codSides(q, true); $('#q-subj').innerHTML = s.pre; $('#q-rest').innerHTML = s.post;
  sen.querySelectorAll('.tap').forEach(el => { el.addEventListener('click', () => codTap(el)); el.addEventListener('keydown', e => { if (e.key==='Enter' || e.key===' '){ e.preventDefault(); codTap(el); } }); });
  if (q.tapped) return codTapDone(q, false);
  $('#form-answer').hidden = true; $('#accents').hidden = true;
  $('#cod-msg').innerHTML = `🎯 <b>Rétrospective</b> : touche le COD dans la phrase. <span class="cod-q">${esc(VERBS[q.m].v)} qui ou quoi ?</span>`;
}
function codTap(el){
  if (!run || run.phase!=='ask') return; const q = run.qs[run.i]; if (!q.cod || q.tapped) return;
  const k = el.dataset.k, inf = VERBS[q.m].v;
  if (k==='cod'){
    q.tapped = true;
    if (!q.tapMiss){ S.rupees += 5; run.rupees += 5; $('#g-rupees').textContent = run.rupees; const fl = document.createElement('span'); fl.className = 'float'; fl.textContent = '+5'; $('#g-rupees').parentElement.appendChild(fl); setTimeout(() => fl.remove(), 1000); }
    SFX.korok(); codTapDone(q, true);
  } else {
    q.tapMiss = (q.tapMiss||0)+1; SFX.mid(); el.classList.remove('miss'); void el.offsetWidth; el.classList.add('miss');
    $('#cod-msg').innerHTML = (k==='subj' ? `« ${esc(el.textContent)} », c'est le <b>sujet</b> : celui qui fait l'action.` : `« ${esc(el.textContent)} » dit où, quand ou comment : ce n'est pas le COD.`) + ` <span class="cod-q">${esc(inf)} qui ou quoi ?</span>`;
  }
}
function codTapDone(q, focus){
  const sen = $('#qcard .sentence'); sen.classList.add('done'); const hit = sen.querySelector('.tap[data-k="cod"]'); if (hit) hit.classList.add('hit');
  $('#cod-msg').innerHTML = `✓ COD repéré${q.tapMiss ? '' : ' du premier coup : <b style="color:var(--rupee)">+5 rubis</b>'}. Est-il <b>avant</b> ou <b>après</b> le verbe ? Écris l'auxiliaire et le participe.`;
  $('#form-answer').hidden = false; $('#accents').hidden = false;
  if (focus) setTimeout(() => $('#inp').focus(), 50);
}

// ---------- La règle : explication complète au premier passage, fiche de rappel ensuite
const exS = t => `<span class="s">${t}</span>`, exC = t => `<span class="c">${t}</span>`, exP = t => `<span class="p">${t}</span>`;
const RULE = [
  {icon:'⛏️', title:'Le secret des Profondeurs', html:`<p>Ici, tu apprends un secret de grammaire : <b>l'accord du participe passé avec avoir</b>.</p><p>Bonne nouvelle pour commencer : avec <b>avoir</b>, le participe ne s'accorde <b>jamais avec le sujet</b>.</p>
    <div class="ex">${exS('Zelda')} a ${exP('trouvé')} un rubis.</div><div class="ex">${exS('Les Gorons')} ont ${exP('trouvé')} un rubis.</div><p class="hint">« trouvé » ne bouge pas, peu importe qui trouve.</p>`},
  {icon:'🎯', title:'Trouve le COD', html:`<p>Le <b>COD</b>, c'est ce qui subit l'action. Pour le trouver, pose la question <b>qui ?</b> ou <b>quoi ?</b> après le verbe.</p>
    <div class="ex">Link a trouvé ${exC('les rubis')} dans la grotte.</div><p class="hint">Link a trouvé quoi ? → ${exC('les rubis')} : c'est le COD. « dans la grotte » dit où : ce n'est pas un COD.</p>`},
  {icon:'⏪', title:'Le pouvoir Rétrospective', html:`<p>Le participe a le même pouvoir que Link : il regarde <b>en arrière</b>, vers le début de la phrase.</p>
    <div class="ex">Link a ${exP('trouvé')} ${exC('les rubis')}.</div><p class="hint">Le COD est <b>après</b> : le participe ne le voit pas. Pas d'accord.</p>
    <div class="ex">Voici ${exC('les rubis')} que Link a ${exP('trouvés')}.</div><p class="hint">Le COD est <b>avant</b> : le participe le voit et s'accorde avec lui.</p>`},
  {icon:'✍️', title:'Comment accorder', html:`<p>Comme un adjectif : <b>e</b> au féminin, <b>s</b> au pluriel.</p>
    <div class="ex">${exC('le trésor')} que j'ai ${exP('trouvé')}</div><div class="ex">${exC('la carte')} que j'ai ${exP('trouvée')}</div><div class="ex">${exC('les rubis')} que j'ai ${exP('trouvés')}</div><div class="ex">${exC('les flèches')} que j'ai ${exP('trouvées')}</div>
    <p class="hint">Astuce : parfois, ça s'entend ! ${exC("l'épée")} que j'ai ${exP('prise')}, ${exC('la lettre')} que j'ai ${exP('écrite')}.</p>`},
  {icon:'⚔️', title:'À toi de jouer', html:`<p>À chaque épreuve, deux gestes :</p><p><b>1.</b> Touche le COD dans la phrase. Du premier coup, tu gagnes 5 rubis.</p><p><b>2.</b> Écris l'auxiliaire et le participe, par exemple « a trouvés ».</p>
    <p class="hint">Un doute en pleine partie ? Le bouton <b>📜 La règle</b> est toujours là.</p>`}
];
const RULE_CARD = `<p><b>Avec avoir</b>, jamais d'accord avec le sujet.</p><p>Cherche le <b>COD</b> : qui ? quoi ?</p>
  <div class="ex">Link a ${exP('trouvé')} ${exC('les rubis')}.</div><p class="hint">COD <b>après</b> le verbe : pas d'accord.</p>
  <div class="ex">Voici ${exC('les rubis')} que Link a ${exP('trouvés')}.</div><p class="hint">COD <b>avant</b> le verbe : accord avec le COD.</p>
  <p><b>e</b> au féminin, <b>s</b> au pluriel : trouvé, trouvée, trouvés, trouvées.</p>`;
let ruleI = 0, ruleMode = 'card', ruleCb = null;
function openRule(mode, cb){ ruleMode = mode; ruleI = 0; ruleCb = cb || null; $('#rule').hidden = false; ruleStep(); }
function closeRule(done){
  $('#rule').hidden = true;
  if (ruleMode==='tuto' && !S.codTuto){ S.codTuto = true; save(); }
  const cb = ruleCb; ruleCb = null; if (cb) cb();
  else if (screen==='game' && run && run.phase==='ask' && !$('#form-answer').hidden) setTimeout(() => $('#inp').focus(), 50);
}
function ruleStep(){
  const tuto = ruleMode==='tuto', s = tuto ? RULE[ruleI] : {icon:'📜', title:'La règle des Profondeurs', html:RULE_CARD}, last = !tuto || ruleI===RULE.length-1;
  $('#rule-icon').textContent = s.icon; $('#rule-title').textContent = s.title; $('#rule-body').innerHTML = s.html;
  $('#rule-dots').innerHTML = tuto ? RULE.map((_, i) => `<i class="${i===ruleI ? 'on' : ''}"></i>`).join('') : '';
  $('#rule-prev').hidden = !tuto || ruleI===0; $('#rule-next').textContent = !tuto ? "J'ai compris" : last ? (ruleCb ? 'Descendre !' : 'Terminé') : 'Suivant';
  $('#rule-more').hidden = tuto; $('#rule-skip').hidden = !tuto || last;
  $('#rule .card').scrollTop = 0;
}
$('#rule-next').addEventListener('click', () => { SFX.click(); if (ruleMode==='tuto' && ruleI<RULE.length-1){ ruleI++; ruleStep(); } else closeRule(); });
$('#rule-prev').addEventListener('click', () => { SFX.click(); if (ruleI>0){ ruleI--; ruleStep(); } });
$('#rule-skip').addEventListener('click', () => { SFX.click(); closeRule(); });
$('#rule-more').addEventListener('click', () => { SFX.click(); ruleMode = 'tuto'; ruleI = 0; ruleStep(); });
$('#btn-rule').addEventListener('click', () => { SFX.click(); openRule('card'); });
function enterDepths(){ if (!depthsOpen()) return; if (!S.codTuto) openRule('tuto', () => startRun('region', DEPTHS.id)); else startRun('region', DEPTHS.id); }

// ---------- Carte : la trappe des Profondeurs, tout en bas
function depthsCard(map){
  if (!hasDepths()) return;
  const st = S.regions[DEPTHS.id] || {stars:0,plays:0}, open = depthsOpen(), mastered = COD_KEYS.filter(k => codMastery(k)>=2).length;
  const b = document.createElement('button');
  b.className = 'region depths' + (open ? '' : ' locked'); b.dataset.r = DEPTHS.id;
  if (IMG[DEPTHS.id]) b.style.backgroundImage = `linear-gradient(90deg, rgba(6,10,24,.92) 0%, rgba(6,10,24,.55) 55%, rgba(6,10,24,.25) 100%), url(${IMG[DEPTHS.id]})`;
  b.innerHTML = `<div class="med">${DEPTHS.icon}</div><h3>${DEPTHS.name}</h3><div class="sub">${open ? 'Accord du participe passé avec avoir' : 'Un gouffre scellé sous le château…'}</div>
    <div class="stars">${[1,2,3].map(k => k<=st.stars ? '<b>★</b>' : '★').join('')}</div>
    <div class="mast"><div class="bar"><i style="width:${mastered/COD_KEYS.length*100}%"></i></div><span class="tabular">${mastered}/${COD_KEYS.length}</span></div>
    <div class="need${open ? ' soft' : ''}">${open ? (st.plays ? `${st.plays} ${st.plays>1 ? 'expéditions' : 'expédition'}` + (codOn() ? ' · épreuves ajoutées au Château et à la Lune de sang' : '') : 'Jamais exploré') : '🔒 Bats Ganondorf pour ouvrir le passage'}</div>
    ${open && !st.plays ? '<span class="new">Nouveau</span>' : ''}`;
  b.disabled = !open;
  b.addEventListener('click', () => { SFX.click(); enterDepths(); });
  map.appendChild(b);
}
// ---------- Carnet : types de piège des Profondeurs
function codBook(){
  if (!hasDepths()) return;
  const wk = weakCod().sort((a,b) => S.cod[b].w-S.cod[a].w);
  if (wk.length){ const tb = $('#b-errs'); if (!weakList().length) tb.innerHTML = '';
    tb.insertAdjacentHTML('beforeend', wk.map(k => `<tr><td><b>Accord du participe</b></td><td>${esc(COD_LABEL[k])}</td><td style="color:var(--zonai);font-weight:800">${esc(COD_EX[k])}</td><td class="n err tabular">${S.cod[k].w}</td><td class="n tabular">${S.cod[k].r}</td></tr>`).join('')); }
  if (!depthsOpen() && !S.cod) return;
  $('#b-verbs').insertAdjacentHTML('beforeend', `<div style="margin-bottom:12px"><div style="font-weight:900;margin-bottom:6px">${DEPTHS.icon} ${DEPTHS.name} · accord du participe <span class="pill">${COD_KEYS.filter(k => codMastery(k)>=2).length}/${COD_KEYS.length}</span></div>
    <div class="verbs">${COD_KEYS.map(k => { const m = codMastery(k), bad = S.cod && S.cod[k] && isWeak(S.cod[k]); return `<span class="${bad ? 'bad' : 'm'+m}" title="${esc(COD_LABEL[k])} · ${esc(COD_EX[k])}">${esc(COD_SHORT[k])}${m===3 ? ' ★★' : m===2 ? ' ★' : ''}</span>`; }).join('')}</div>
    <div class="actions"><button type="button" class="btn ghost" id="b-rule" style="padding:8px 12px">📜 Revoir la règle</button></div></div>`);
  $('#b-rule').addEventListener('click', () => { SFX.click(); openRule('tuto'); });
}
