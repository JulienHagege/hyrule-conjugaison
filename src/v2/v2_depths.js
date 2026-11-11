/* =========================================================
   LES PROFONDEURS : accord du participe passé avec avoir quand le COD est placé avant.
   Région bonus sous le Château (univers listés dans DEPTHS_TENSES), ouverte après une première victoire sur Ganondorf.
   Chaque épreuve se joue en deux gestes : toucher le COD dans la phrase, puis écrire auxiliaire + participe.
   Trois paliers, selon les étoiles gagnées dans la région (codLevel) :
     1. COD après / COD avant avec « que » ; 2. (★) pronoms l', les ; 3. (★★) pièges lui, leur, en.
   Les statistiques sont rangées par type de piège (S.cod), pas par verbe. Une étoile dans la région
   ajoute ces épreuves au Château et à la Lune de sang de l'univers.
   ========================================================= */
const DEPTHS = {id:'profondeurs', name:'Les Profondeurs', sub:'Accord du participe', icon:'⛏️', n:12};
const DEPTHS_TENSES = ['pc'];
const hasDepths = () => DEPTHS_TENSES.includes(TENSE);
const regOf = id => id===DEPTHS.id ? DEPTHS : REGIONS.find(r => r.id===id);
const depthsOpen = () => hasDepths() && !!((P && P.unlockAll) || S.bossWins>=1);
const depthStars = () => (S.regions[DEPTHS.id]||{}).stars||0;
const codOn = () => hasDepths() && depthStars()>=1;
const codLevel = () => depthStars()>=2 ? 3 : depthStars()>=1 ? 2 : 1;

// verbe, COD (féminin singulier | masculin singulier | féminin pluriel | masculin pluriel), complément qui n'est pas un COD,
// 1 si le verbe accepte « lui / leur » (faire quelque chose à quelqu'un)
const COD_DATA = [
  ['prendre', "l'épée|le bouclier|les flèches|les rubis", 'dans le coffre', 1],
  ['mettre', 'la tunique|le casque|les bottes|les gants', 'avant le combat'],
  ['écrire', 'la lettre|le message|les lettres|les poèmes', 'pendant la nuit', 1],
  ['ouvrir', 'la porte|le coffre|les portes|les coffres', 'avec la clé', 1],
  ['construire', 'la machine|le radeau|les machines|les ponts', 'près de la rivière', 1],
  ['découvrir', 'la grotte|le sanctuaire|les grottes|les sanctuaires', 'sous la montagne'],
  ['faire', 'la soupe|le gâteau|les brochettes|les plats', 'au feu de camp', 1],
  ['peindre', 'la fresque|le portrait|les fresques|les tableaux', 'au village', 1],
  ['détruire', 'la barrière|le rocher|les caisses|les rochers', 'avec une bombe'],
  ['apprendre', 'la chanson|le secret|les chansons|les secrets', 'auprès du Sage', 1],
  ['cuire', 'la viande|le poisson|les pommes|les champignons', 'dans la marmite', 1],
  ['éteindre', 'la torche|le feu|les torches|les feux', 'avant de partir'],
  ['offrir', 'la potion|le bouclier|les potions|les rubis', 'pour la fête', 1],
  ['promettre', 'la récompense|le trésor|les récompenses|les rubis', 'au village', 1],
  ['trouver', 'la carte|le trésor|les flèches|les rubis', 'dans la grotte'],
  ['vaincre', 'la créature|le Lynel|les créatures|les Bokoblins', 'près du lac'],
  ['choisir', "l'armure|l'arc|les armures|les arcs", 'chez le marchand', 1],
  ['voir', 'la tour|le dragon|les étoiles|les dragons', 'dans le ciel'],
  ['perdre', 'la clé|le bouclier|les clés|les rubis', 'dans le désert'],
  ['vendre', 'la gemme|le diamant|les gemmes|les champignons', 'au marché', 1],
  ['entendre', 'la cloche|le cri|les cloches|les chants', 'dans la forêt'],
  ['finir', 'la quête|le sanctuaire|les quêtes|les sanctuaires', 'avant la nuit'],
  ['remplir', 'la gourde|le sac|les gourdes|les sacs', 'à la rivière', 1],
  ['lancer', 'la lance|le boomerang|les bombes|les rochers', 'sur le monstre'],
  ['cueillir', 'la pomme|le champignon|les pommes|les champignons', 'dans la forêt', 1],
  ['recevoir', 'la récompense|le message|les récompenses|les cadeaux', 'au château'],
  ['protéger', 'la forêt|le village|les fées|les villageois', "pendant l'orage"],
  ['acheter', 'la potion|le bouclier|les potions|les arcs', 'au village', 1],
  ['lire', 'la carte|le livre|les lettres|les livres', 'à la bibliothèque', 1],
  ['attendre', 'la caravane|le marchand|les fées|les voyageurs', 'devant le temple'],
  ['manger', 'la pomme|le poisson|les baies|les champignons', 'près du feu']
];
const COD_GN = ['fs','ms','fp','mp'], COD_PPI = {ms:0, mp:1, fs:2, fp:3};
const COD_SUBJ = [{t:'Link',p:2},{t:'Zelda',p:2},{t:'Link',p:2},{t:'Zelda',p:2},{t:'Sidon',p:2},{t:'Riju',p:2},{t:'Tulin',p:2},{t:'Impa',p:2},{t:'je',p:0},{t:'tu',p:1},{t:'nous',p:3},{t:'vous',p:4},{t:'les Gorons',p:5},{t:'les Zoras',p:5},{t:'les Gerudos',p:5}];
// Types de piège, avec le palier qui les ouvre
const COD_KEYS = ['apres','que|ms','que|fs|a','que|fs|m','que|fp|a','que|fp|m','que|mp|a','que|mp|m','pro|ms','pro|fs','pro|fp','pro|mp','coi','en'];
const codKeyLvl = k => k.startsWith('pro') ? 2 : (k==='coi' || k==='en') ? 3 : 1;
const codKeys = () => COD_KEYS.filter(k => codKeyLvl(k)<=codLevel());
const COD_LABEL = {'apres':'COD après le verbe', 'que|ms':'COD avant, masculin singulier', 'que|fs|a':"COD avant, féminin singulier (ça s'entend)", 'que|fs|m':'COD avant, féminin singulier (muet)',
  'que|fp|a':"COD avant, féminin pluriel (ça s'entend)", 'que|fp|m':'COD avant, féminin pluriel (muet)', 'que|mp|a':'COD avant, masculin pluriel (participe en s ou t)', 'que|mp|m':'COD avant, masculin pluriel',
  'pro|ms':"Pronom l' avant, masculin singulier", 'pro|fs':"Pronom l' avant, féminin singulier", 'pro|fp':'Pronom les avant, féminin pluriel', 'pro|mp':'Pronom les avant, masculin pluriel',
  'coi':'Piège lui, leur (pas des COD)', 'en':"Piège en (jamais d'accord)"};
const COD_SHORT = {'apres':'COD après', 'que|ms':'avant · masc. sing.', 'que|fs|a':'avant · fém. sing. (prise)', 'que|fs|m':'avant · fém. sing. (trouvée)', 'que|fp|a':'avant · fém. plur. (prises)', 'que|fp|m':'avant · fém. plur. (trouvées)', 'que|mp|a':'avant · masc. plur. (ouverts)', 'que|mp|m':'avant · masc. plur. (trouvés)',
  'pro|ms':"l' · masc. sing.", 'pro|fs':"l' · fém. sing.", 'pro|fp':'les · fém. plur.', 'pro|mp':'les · masc. plur.', 'coi':'piège lui, leur', 'en':'piège en'};
const COD_EX = {'apres':'Link a trouvé les rubis', 'que|ms':'le trésor que Link a trouvé', 'que|fs|a':"l'épée que Link a prise", 'que|fs|m':'la carte que Link a trouvée',
  'que|fp|a':'les lettres que Link a écrites', 'que|fp|m':'les flèches que Link a trouvées', 'que|mp|a':'les coffres que Link a ouverts', 'que|mp|m':'les rubis que Link a trouvés',
  'pro|ms':"Le trésor, Link l'a trouvé", 'pro|fs':"La carte, Link l'a trouvée", 'pro|fp':'Les flèches, Link les a trouvées', 'pro|mp':'Les rubis, Link les a trouvés',
  'coi':'Link lui a offert les potions', 'en':'Des rubis, Link en a trouvé'};
const COD_W = k => k==='apres' ? 3 : k==='coi' ? 2.2 : k==='en' ? 2 : k.endsWith('|ms') ? .8 : k.startsWith('pro') ? 1.3 : 1;

// Statistiques par type de piège
function codItem(key){ if (!S.cod) S.cod = {}; return S.cod[key] || (S.cod[key] = {w:0,r:0,s:0,t:0}); }
const itemOf = q => q.cod ? codItem(q.cod.key) : item(q.v,q.p);
function codWeight(key){ const it = (S.cod||{})[key]; if (!it) return 1.2; let w = 1 + it.w*3; if (it.s>=3) w *= .3; return w; }
function weakCod(){ return Object.keys(S.cod||{}).filter(k => COD_LABEL[k] && isWeak(S.cod[k])); }
function codMastery(key){ const it = (S.cod||{})[key]; if (!it || !(it.r+it.w)) return 0; if (isWeak(it)) return 1; return it.r>=4 && it.r/(it.r+it.w)>=.9 ? 3 : it.r>=1 ? 2 : 1; }
const codAud = V => /[st]$/.test(pieces(V).ppF[0]);
const codData = () => COD_DATA.filter(d => BY_VERB[d[0]]);
function codWPick(ks){ const ws = ks.map(k => COD_W(k) * codWeight(k)); let x = Math.random()*ws.reduce((a,b) => a+b, 0); for (let i=0;i<ks.length;i++){ x -= ws[i]; if (x<=0) return ks[i]; } return ks[ks.length-1]; }
const codPickKey = noApres => codWPick(codKeys().filter(k => !(noApres && k==='apres')));
// Une épreuve. Types : 'apres' (Link a trouvé les rubis), 'que' (Voici les rubis que Link a trouvés), 'pro' (Les rubis, Link les a trouvés),
// 'coi' (Link lui a offert les rubis : pas d'accord), 'en' (Des rubis, Link en a trouvé : pas d'accord).
function mkCod(d, type, gn, subj){
  const V = BY_VERB[d[0]], T = TENSE_BY[TENSE], pc = pieces(V), base = pc.ppF[0], aud = codAud(V);
  subj = subj || COD_SUBJ[Math.floor(Math.random()*COD_SUBJ.length)];
  const agree = type==='que' || type==='pro';
  const aux = auxForms('a', T.cmp)[subj.p][0], pp = agree ? pc.ppF[COD_PPI[gn]] : base;
  const key = type==='que' ? (gn==='ms' ? 'que|ms' : 'que|'+gn+'|'+(aud ? 'a' : 'm')) : type==='pro' ? 'pro|'+gn : type;
  let noun = d[1].split('|')[COD_GN.indexOf(gn)]; if (type==='en') noun = noun.replace(/^les /, 'des ');
  const pron = type==='pro' ? (gn.endsWith('s') ? "l'" : 'les') : type==='en' ? 'en' : type==='coi' ? (Math.random()<.5 ? 'lui' : 'leur') : '';
  return {kind:'cod', v:BY_VERB[famHead(V.v)].id, m:V.id, p:subj.p, t:TENSE, s:subj.t, g:'m', n:'s', a:[aux+' '+pp], c:'',
    cod:{type, key, gn, noun, pron, tail:d[2], intro:Math.random()<.5 ? 'Voici' : 'Regarde', base, forms:pc.ppF.slice()}};
}
// Fabrique une épreuve pour un type de piège donné, en évitant de réutiliser les verbes de `used`
function codFromKey(key, used){
  const parts = key.split('|'), type = parts[0];
  const gn = type==='en' ? (Math.random()<.6 ? 'fp' : 'mp') : parts[1] || COD_GN[Math.floor(Math.random()*4)];
  let cands = codData().filter(d => (type==='que' && parts[2] ? codAud(BY_VERB[d[0]])===(parts[2]==='a') : true) && (type==='coi' ? d[3] : true));
  const fresh = cands.filter(d => !used || !used.has(d[0])); if (fresh.length) cands = fresh;
  const d = cands[Math.floor(Math.random()*cands.length)]; if (used) used.add(d[0]);
  return mkCod(d, type, gn);
}
function codQs(k, used){ used = used || new Set(); const out = []; for (let i=0;i<k;i++) out.push(codFromKey(codPickKey(false), used)); return out; }
// Expédition dans les Profondeurs : des paires jumelles (même verbe, même COD, après puis avant) et des épreuves isolées.
// Au palier 1, quatre paires ; ensuite trois, pour laisser la place aux pronoms et aux pièges.
function codRun(n){
  const used = new Set(), qs = [], pairs = codLevel()===1 ? Math.floor(n/3) : Math.floor(n/4);
  const queKeys = COD_KEYS.filter(k => k.startsWith('que'));
  for (let i=0;i<pairs;i++){
    const q = codFromKey(codWPick(queKeys), used), d = COD_DATA.find(x => x[0]===VERBS[q.m].v), subj = {t:q.s, p:q.p};
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
// Morceaux : cod (le nom), pron (l', les, en : le COD sous forme de pronom), coi (lui, leur), subj, tail, blank, mots fixes.
function codParts(q){
  const c = q.cod, first = (q.a && q.a[0]) || '', after = c.pron || first;
  const sj = q.p===0 ? (VOWEL.test(after) ? "j'" : 'je') : q.s;
  if (c.type==='apres') return [{k:'subj', t:cap(sj)}, {k:'blank'}, {k:'cod', t:c.noun}, {k:'tail', t:c.tail}];
  if (c.type==='coi') return [{k:'subj', t:cap(sj)}, {k:'coi', t:c.pron}, {k:'blank'}, {k:'cod', t:c.noun}, {k:'tail', t:c.tail}];
  if (c.type==='pro' || c.type==='en') return [{k:'cod', t:cap(c.noun)}, {k:'punct', t:','}, {k:'subj', t:sj}, {k:'pron', t:c.pron}, {k:'blank'}, {k:'tail', t:c.tail}];
  return [{k:'intro', t:c.intro}, {k:'cod', t:c.noun}, {k:'que', t:VOWEL.test(sj) ? "qu'" : 'que'}, {k:'subj', t:sj}, {k:'blank'}, {k:'tail', t:c.tail}];
}
function codJoin(parts, fn){ let out = ''; parts.forEach((p,i) => { out += fn(p); const nx = parts[i+1]; if (nx && nx.k!=='punct' && !(p.t && p.t.endsWith("'"))) out += ' '; }); return out; }
const codIsCod = k => k==='cod' || k==='pron';
// Phrase complète avec la réponse (correction, liste des erreurs)
function codSentenceHtml(q, form){ return codJoin(codParts(q), p => p.k==='blank' ? `<em>${esc(form)}</em>` : codIsCod(p.k) ? `<u class="codu">${esc(p.t)}</u>` : esc(p.t)) + '.'; }
function codSides(q, tap){
  const parts = codParts(q), i = parts.findIndex(p => p.k==='blank');
  const fn = p => tap && ['subj','cod','tail','pron','coi'].includes(p.k) ? `<span class="tap" role="button" tabindex="0" data-k="${p.k}">${esc(p.t)}</span>` : esc(p.t);
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
  if (c.type==='coi') return `« ${c.pron} » veut dire « à quelqu'un » : ce n'est pas un COD. Le vrai COD, ${n}, est placé après le verbe : pas d'accord.`;
  if (c.type==='en') return `Le COD est « en » (il remplace ${n}). Avec « en », le participe ne s'accorde jamais.`;
  const what = c.type==='pro' ? `Le pronom « ${c.pron} » remplace ${n} : c'est le COD, placé avant le verbe` : `Le COD ${n} est placé avant le verbe`;
  if (c.gn==='ms') return `${what}, mais il est masculin singulier : rien à ajouter.`;
  if (c.gn==='mp' && c.base.endsWith('s')) return `${what} : accord au masculin pluriel. « ${c.base} » finit déjà par s, rien à ajouter.`;
  const how = c.gn==='fs' ? 'féminin singulier : + e' : c.gn==='fp' ? 'féminin pluriel : + es' : 'masculin pluriel : + s';
  return `${what} : le participe s'accorde avec lui (${how}).`;
}
function codWhyHtml(q){ return `<div class="sage"><b>⏪ Rétrospective :</b><span>${esc(codNote(q))}</span></div>`; }
function codErrLi(e){ return `<li>${codSentenceHtml(e, e.a[0])} <span style="color:var(--muted)">(accord du participe)</span>${e.given ? ` <span style="color:var(--danger)">${e.moon ? '🌕 ' : ''}tu as ${e.moon ? 'choisi' : 'écrit'} « ${esc(e.given)} »</span>` : ''}</li>`; }

// ---------- Premier geste : toucher le COD
const codAskQ = q => `<span class="cod-q">${esc(VERBS[q.m].v)} qui ou quoi ?</span>`;
function codAsk(){
  const q = run.qs[run.i], box = $('#cod-step'), sen = $('#qcard .sentence');
  sen.classList.toggle('cod', !!q.cod); sen.classList.remove('done'); box.hidden = !q.cod;
  if (!q.cod) return;
  const gb = $('#q-group'); gb.textContent = 'Accord du participe'; gb.className = 'badge g3';
  const s = codSides(q, true); $('#q-subj').innerHTML = s.pre; $('#q-rest').innerHTML = s.post;
  sen.querySelectorAll('.tap').forEach(el => { el.addEventListener('click', () => codTap(el)); el.addEventListener('keydown', e => { if (e.key==='Enter' || e.key===' '){ e.preventDefault(); codTap(el); } }); });
  if (q.tapped) return codTapDone(q, false);
  $('#form-answer').hidden = true; $('#accents').hidden = true;
  $('#cod-msg').innerHTML = `🎯 <b>Rétrospective</b> : touche le COD dans la phrase. ${codAskQ(q)}`;
}
function codTap(el){
  if (!run || run.phase!=='ask') return; const q = run.qs[run.i]; if (!q.cod || q.tapped) return;
  const k = el.dataset.k, w = `« ${esc(el.textContent)} »`;
  if (codIsCod(k)){
    q.tapped = true;
    if (!q.tapMiss){ S.rupees += 5; run.rupees += 5; $('#g-rupees').textContent = run.rupees; const fl = document.createElement('span'); fl.className = 'float'; fl.textContent = '+5'; $('#g-rupees').parentElement.appendChild(fl); setTimeout(() => fl.remove(), 1000); }
    SFX.korok(); codTapDone(q, true);
  } else {
    q.tapMiss = (q.tapMiss||0)+1; SFX.mid(); el.classList.remove('miss'); void el.offsetWidth; el.classList.add('miss');
    $('#cod-msg').innerHTML = (k==='subj' ? `${w}, c'est le <b>sujet</b> : celui qui fait l'action.` : k==='coi' ? `${w} veut dire « à quelqu'un » : c'est un <b>COI</b>, pas un COD.` : `${w} dit où, quand ou comment : ce n'est pas le COD.`) + ' ' + codAskQ(q);
  }
}
function codTapDone(q, focus){
  const sen = $('#qcard .sentence'), c = q.cod; sen.classList.add('done');
  const hits = [...sen.querySelectorAll('.tap')].filter(el => codIsCod(el.dataset.k)); hits.forEach(el => el.classList.add('hit'));
  const lab = hits.find(el => el.dataset.k==='pron') || hits[0]; if (lab) lab.classList.add('lab');
  const found = c.pron && c.type!=='coi' ? `COD repéré : « ${esc(c.pron)} » remplace « ${esc(c.noun)} »` : 'COD repéré';
  $('#cod-msg').innerHTML = `✓ ${found}${q.tapMiss ? '' : ' (<b style="color:var(--rupee)">+5 rubis</b>)'}. Est-il <b>avant</b> ou <b>après</b> le verbe ? Écris l'auxiliaire et le participe.`;
  $('#form-answer').hidden = false; $('#accents').hidden = false;
  if (focus) setTimeout(() => $('#inp').focus(), 50);
}

// ---------- La règle : explication par paliers au premier passage, fiche de rappel ensuite
const exS = t => `<span class="s">${t}</span>`, exC = t => `<span class="c">${t}</span>`, exP = t => `<span class="p">${t}</span>`;
const RULE = [
  {lvl:1, icon:'⛏️', title:'Le secret des Profondeurs', html:`<p>Ici, tu apprends un secret de grammaire : <b>l'accord du participe passé avec avoir</b>.</p><p>Bonne nouvelle pour commencer : avec <b>avoir</b>, le participe ne s'accorde <b>jamais avec le sujet</b>.</p>
    <div class="ex">${exS('Zelda')} a ${exP('trouvé')} un rubis.</div><div class="ex">${exS('Les Gorons')} ont ${exP('trouvé')} un rubis.</div><p class="hint">« trouvé » ne bouge pas, peu importe qui trouve.</p>`},
  {lvl:1, icon:'🎯', title:'Trouve le COD', html:`<p>Le <b>COD</b>, c'est ce qui subit l'action. Pour le trouver, pose la question <b>qui ?</b> ou <b>quoi ?</b> après le verbe.</p>
    <div class="ex">Link a trouvé ${exC('les rubis')} dans la grotte.</div><p class="hint">Link a trouvé quoi ? → ${exC('les rubis')} : c'est le COD. « dans la grotte » dit où : ce n'est pas un COD.</p>`},
  {lvl:1, icon:'⏪', title:'Le pouvoir Rétrospective', html:`<p>Le participe a le même pouvoir que Link : il regarde <b>en arrière</b>, vers le début de la phrase.</p>
    <div class="ex">Link a ${exP('trouvé')} ${exC('les rubis')}.</div><p class="hint">Le COD est <b>après</b> : le participe ne le voit pas. Pas d'accord.</p>
    <div class="ex">Voici ${exC('les rubis')} que Link a ${exP('trouvés')}.</div><p class="hint">Le COD est <b>avant</b> : le participe le voit et s'accorde avec lui.</p>`},
  {lvl:1, icon:'✍️', title:'Comment accorder', html:`<p>Comme un adjectif : <b>e</b> au féminin, <b>s</b> au pluriel.</p>
    <div class="ex">${exC('le trésor')} que j'ai ${exP('trouvé')}</div><div class="ex">${exC('la carte')} que j'ai ${exP('trouvée')}</div><div class="ex">${exC('les rubis')} que j'ai ${exP('trouvés')}</div><div class="ex">${exC('les flèches')} que j'ai ${exP('trouvées')}</div>
    <p class="hint">Astuce : parfois, ça s'entend ! ${exC("l'épée")} que j'ai ${exP('prise')}, ${exC('la lettre')} que j'ai ${exP('écrite')}.</p>`},
  {lvl:1, icon:'⚔️', title:'À toi de jouer', html:`<p>À chaque épreuve, deux gestes :</p><p><b>1.</b> Touche le COD dans la phrase. Du premier coup, tu gagnes 5 rubis.</p><p><b>2.</b> Écris l'auxiliaire et le participe, par exemple « a trouvés ».</p>
    <p class="hint">Un doute en pleine partie ? Le bouton <b>📜 La règle</b> est toujours là. Gagne une étoile pour descendre plus profond.</p>`},
  {lvl:2, icon:'🔦', title:"Plus profond : l' et les", html:`<p>Nouveau : le COD peut se cacher dans un petit mot placé <b>avant</b> le verbe, <b>l'</b> ou <b>les</b>. Le participe le voit : il s'accorde.</p>
    <div class="ex">${exC('La carte')}, Link ${exC("l'")}a ${exP('trouvée')}.</div><p class="hint">« l' » remplace « la carte » : féminin singulier, + e.</p>
    <div class="ex">${exC('Les rubis')}, Zelda ${exC('les')} a ${exP('trouvés')}.</div><p class="hint">Attention : « l' » ne dit pas s'il est masculin ou féminin. Regarde le mot qu'il remplace.</p>`},
  {lvl:3, icon:'⚠️', title:'Tout au fond : les pièges', html:`<p>Trois petits mots se placent avant le verbe <b>sans jamais</b> faire accorder le participe.</p>
    <p><b>lui</b> et <b>leur</b> veulent dire « à quelqu'un » : ce ne sont pas des COD.</p><div class="ex">Link lui a ${exP('offert')} ${exC('les potions')}.</div><p class="hint">Le vrai COD, « les potions », est après le verbe : pas d'accord.</p>
    <p><b>en</b> : avec lui, le participe ne bouge jamais.</p><div class="ex">Des flèches, Zelda en a ${exP('trouvé')}.</div>`}
];
const ruleCard = () => `<p><b>Avec avoir</b>, jamais d'accord avec le sujet.</p><p>Cherche le <b>COD</b> : qui ? quoi ?</p>
  <div class="ex">Link a ${exP('trouvé')} ${exC('les rubis')}.</div><p class="hint">COD <b>après</b> le verbe : pas d'accord.</p>
  <div class="ex">Voici ${exC('les rubis')} que Link a ${exP('trouvés')}.</div><p class="hint">COD <b>avant</b> le verbe : accord avec le COD.</p>
  ${codLevel()>=2 ? `<div class="ex">${exC('La carte')}, Link ${exC("l'")}a ${exP('trouvée')}.</div><p class="hint"><b>l'</b>, <b>les</b> avant le verbe : ce sont des COD, accord.</p>` : ''}
  ${codLevel()>=3 ? `<div class="ex">Link lui a ${exP('offert')} les potions. Des flèches, il en a ${exP('trouvé')}.</div><p class="hint"><b>lui</b>, <b>leur</b>, <b>en</b> : jamais d'accord.</p>` : ''}
  <p><b>e</b> au féminin, <b>s</b> au pluriel : trouvé, trouvée, trouvés, trouvées.</p>`;
const codSeen = () => S.codSeen || (S.codTuto ? 1 : 0);
let ruleI = 0, ruleMode = 'card', ruleCb = null, ruleList = RULE, ruleMark = 0;
// mode 'card' : fiche de rappel ; mode 'tuto' : étapes de `list` (par défaut, tout ce qui est ouvert). `mark` = palier noté comme vu à la fermeture.
function openRule(mode, cb, list, mark){
  ruleMode = mode; ruleI = 0; ruleCb = cb || null; ruleMark = mark || 0;
  ruleList = list && list.length ? list : RULE.filter(s => s.lvl<=Math.max(codLevel(), codSeen(), 1));
  $('#rule').hidden = false; ruleStep();
}
function closeRule(){
  $('#rule').hidden = true;
  if (ruleMark && codSeen()<ruleMark){ S.codSeen = ruleMark; S.codTuto = true; save(); }
  const cb = ruleCb; ruleCb = null; ruleMark = 0; if (cb) cb();
  else if (screen==='game' && run && run.phase==='ask' && !$('#form-answer').hidden) setTimeout(() => $('#inp').focus(), 50);
}
function ruleStep(){
  const tuto = ruleMode==='tuto', s = tuto ? ruleList[ruleI] : {icon:'📜', title:'La règle des Profondeurs', html:ruleCard()}, last = !tuto || ruleI===ruleList.length-1;
  $('#rule-icon').textContent = s.icon; $('#rule-title').textContent = s.title; $('#rule-body').innerHTML = s.html;
  $('#rule-dots').innerHTML = tuto && ruleList.length>1 ? ruleList.map((_, i) => `<i class="${i===ruleI ? 'on' : ''}"></i>`).join('') : '';
  $('#rule-prev').hidden = !tuto || ruleI===0; $('#rule-next').textContent = !tuto ? "J'ai compris" : last ? (ruleCb ? 'Descendre !' : 'Terminé') : 'Suivant';
  $('#rule-more').hidden = tuto; $('#rule-skip').hidden = !tuto || last;
  $('#rule .card').scrollTop = 0;
}
$('#rule-next').addEventListener('click', () => { SFX.click(); if (ruleMode==='tuto' && ruleI<ruleList.length-1){ ruleI++; ruleStep(); } else closeRule(); });
$('#rule-prev').addEventListener('click', () => { SFX.click(); if (ruleI>0){ ruleI--; ruleStep(); } });
$('#rule-skip').addEventListener('click', () => { SFX.click(); closeRule(); });
$('#rule-more').addEventListener('click', () => { SFX.click(); openRule('tuto'); });
$('#btn-rule').addEventListener('click', () => { SFX.click(); openRule('card'); });
// Entrée dans la région : l'explication des paliers pas encore vus, puis l'expédition
function enterDepths(){
  if (!depthsOpen()) return; const lvl = codLevel(), seen = codSeen(), go = () => startRun('region', DEPTHS.id);
  if (seen<lvl) openRule('tuto', go, RULE.filter(s => s.lvl>seen && s.lvl<=lvl), lvl); else go();
}
// Fin d'expédition : annonce du palier suivant (lv0 = palier avant la partie)
function codLevelUp(lv0){
  const lv = codLevel(); if (lv<=lv0) return;
  const msg = lv0<2 ? "⛏️ Plus profond : les pronoms l' et les arrivent. Ces épreuves rejoignent aussi le Château et la Lune de sang." + (lv>=3 ? ' Et tout au fond : les pièges lui, leur, en.' : '') : '⛏️ Tout au fond des Profondeurs : les pièges lui, leur et en arrivent.';
  setTimeout(() => toast(msg), 2200);
}

// ---------- Carte : la trappe des Profondeurs, tout en bas
function depthsCard(map){
  if (!hasDepths()) return;
  const st = S.regions[DEPTHS.id] || {stars:0,plays:0}, open = depthsOpen(), mastered = COD_KEYS.filter(k => codMastery(k)>=2).length, lvl = codLevel();
  const nextUp = lvl===1 ? '1 étoile : pronoms, Château et Lune de sang' : lvl===2 ? '2 étoiles : les pièges lui, leur, en' : 'toutes les épreuves sont ouvertes';
  const b = document.createElement('button');
  b.className = 'region depths' + (open ? '' : ' locked'); b.dataset.r = DEPTHS.id;
  if (IMG[DEPTHS.id]) b.style.backgroundImage = `linear-gradient(90deg, rgba(6,10,24,.92) 0%, rgba(6,10,24,.55) 55%, rgba(6,10,24,.25) 100%), url(${IMG[DEPTHS.id]})`;
  b.innerHTML = `<div class="med">${DEPTHS.icon}</div><h3>${DEPTHS.name}</h3><div class="sub">${open ? 'Accord du participe passé avec avoir' : 'Un gouffre scellé sous le château…'}</div>
    <div class="stars">${[1,2,3].map(k => k<=st.stars ? '<b>★</b>' : '★').join('')}</div>
    <div class="mast"><div class="bar"><i style="width:${mastered/COD_KEYS.length*100}%"></i></div><span class="tabular">${mastered}/${COD_KEYS.length}</span></div>
    <div class="need${open ? ' soft' : ''}">${open ? (st.plays ? `${st.plays} ${st.plays>1 ? 'expéditions' : 'expédition'} · ${nextUp}` : 'Jamais exploré') : '🔒 Bats Ganondorf pour ouvrir le passage'}</div>
    ${open && (!st.plays || codSeen()<lvl) ? '<span class="new">Nouveau</span>' : ''}`;
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
  const lvl = codLevel();
  $('#b-verbs').insertAdjacentHTML('beforeend', `<div style="margin-bottom:12px"><div style="font-weight:900;margin-bottom:6px">${DEPTHS.icon} ${DEPTHS.name} · accord du participe <span class="pill">${COD_KEYS.filter(k => codMastery(k)>=2).length}/${COD_KEYS.length}</span></div>
    <div class="verbs">${COD_KEYS.map(k => { const m = codMastery(k), bad = S.cod && S.cod[k] && isWeak(S.cod[k]), locked = codKeyLvl(k)>lvl; return `<span class="${bad ? 'bad' : 'm'+m}"${locked ? ' style="opacity:.5"' : ''} title="${esc(COD_LABEL[k])} · ${esc(COD_EX[k])}${locked ? ' · ouvert avec ' + (codKeyLvl(k)-1) + ' étoile' + (codKeyLvl(k)>2 ? 's' : '') : ''}">${locked ? '🔒 ' : ''}${esc(COD_SHORT[k])}${m===3 ? ' ★★' : m===2 ? ' ★' : ''}</span>`; }).join('')}</div>
    <div class="actions"><button type="button" class="btn ghost" id="b-rule" style="padding:8px 12px">📜 Revoir la règle</button></div></div>`);
  $('#b-rule').addEventListener('click', () => { SFX.click(); openRule('tuto'); });
}
