/* =========================================================
   MOTEUR DE CONJUGAISON : pièces maîtresses par verbe + terminaisons
   Modèle du Bescherelle : chaque verbe donne son présent (généré ou écrit), son participe passé, son auxiliaire,
   le radical de son futur et celui de son passé simple. Le reste se déduit. Les vrais irréguliers (être, avoir,
   aller, faire, pouvoir, savoir, vouloir, valoir, falloir, pleuvoir) ont en plus leur subjonctif et leur impératif
   écrits en toutes lettres. Toutes les formes sont vérifiées contre le lexique Lefff (voir check_lefff.js).
   ========================================================= */

// Temps (= univers). persons : indices des personnes jouables. pre : mot avant le sujet. cmp : temps composé = [auxiliaire au temps X].
// lvl : première année où le temps est introduit. Primaire : programmes 2008 ; collège : BO spécial n°6 du 28 août 2008 (6e : indicatif temps simples et composés y compris le conditionnel, impératif ; 5e : subjonctif présent, antériorité des temps composés ; 4e selon Julien : subjonctif passé, imparfait et plus-que-parfait).
const TENSES = [
  {id:'present',  name:'Présent',                     mood:'Indicatif',    lvl:'CM1',   icon:'🌅', color:'#5de3c0', ex:"je chante · nous finissons · ils prennent", desc:"Ce qui se passe maintenant. Le temps de base, celui de l'aventure."},
  {id:'futur',    name:'Futur simple',                mood:'Indicatif',    lvl:'CM1',   icon:'🔮', color:'#6ad0ff', ex:"je chanterai · nous finirons · ils prendront", desc:"Ce qui arrivera. Radical + ai, as, a, ons, ez, ont."},
  {id:'imparfait',name:'Imparfait',                   mood:'Indicatif',    lvl:'CM1',   icon:'🕰️', color:'#d7b06a', ex:"je chantais · nous finissions · ils prenaient", desc:"Autrefois, les habitudes et les décors du passé. ais, ais, ait, ions, iez, aient."},
  {id:'pc',       name:'Passé composé',               mood:'Indicatif',    lvl:'CM2',   icon:'📜', color:'#ffb347', cmp:'present', ex:"j'ai chanté · nous sommes partis · ils ont pris", desc:"Une action passée et terminée : avoir ou être au présent + participe passé."},
  {id:'imperatif',name:'Impératif présent',           mood:'Impératif',    lvl:'CM2',   icon:'⚔️', color:'#ff7357', persons:[1,3,4], ex:"chante · finissons · prenez", desc:"Donner un ordre ou un conseil. Trois personnes seulement, sans sujet."},
  {id:'ps',       name:'Passé simple',                mood:'Indicatif',    lvl:'CM2',   icon:'🏺', color:'#e8c45e', ex:"il chanta · nous finîmes · ils prirent", desc:"Le temps des récits et des légendes : il chanta, ils partirent, elle fut."},
  {id:'pqp',      name:'Plus-que-parfait',            mood:'Indicatif',    lvl:'6e',    icon:'🪨', color:'#9bd36a', cmp:'imparfait', ex:"j'avais chanté · nous étions partis · ils avaient pris", desc:"Le passé d'avant le passé : avoir ou être à l'imparfait + participe passé."},
  {id:'fa',       name:'Futur antérieur',             mood:'Indicatif',    lvl:'6e',    icon:'🌠', color:'#bfe6ff', cmp:'futur', ex:"j'aurai chanté · nous serons partis · ils auront pris", desc:"Ce qui sera déjà fini dans le futur : avoir ou être au futur + participe passé."},
  {id:'cond',     name:'Conditionnel présent',        mood:'Conditionnel', lvl:'6e',    icon:'💭', color:'#b48cff', ex:"je chanterais · nous finirions · ils prendraient", desc:"Si c'était possible… Radical du futur + terminaisons de l'imparfait."},
  {id:'condp',    name:'Conditionnel passé',          mood:'Conditionnel', lvl:'6e',    icon:'🌧️', color:'#8fa8d8', cmp:'cond', ex:"j'aurais chanté · nous serions partis · ils auraient pris", desc:"Ce qui aurait pu arriver : avoir ou être au conditionnel + participe passé."},
  {id:'pa',       name:'Passé antérieur',             mood:'Indicatif',    lvl:'5e',    icon:'🏜️', color:'#ffc46a', cmp:'ps', ex:"il eut chanté · nous fûmes partis · ils eurent pris", desc:"Dans un récit, juste avant un passé simple : avoir ou être au passé simple + participe passé."},
  {id:'subj',     name:'Subjonctif présent',          mood:'Subjonctif',   lvl:'5e',    icon:'✨', color:'#ffe9a3', pre:'que', ex:"que je chante · que nous finissions · qu'ils prennent", desc:"Il faut que… Le souhait, le doute, l'obligation. e, es, e, ions, iez, ent."},
  {id:'subjp',    name:'Subjonctif passé',            mood:'Subjonctif',   lvl:'4e',    icon:'🕯️', color:'#f3d577', pre:'que', cmp:'subj', ex:"que j'aie chanté · que nous soyons partis · qu'ils aient pris", desc:"Il faut que ce soit déjà fait : avoir ou être au subjonctif présent + participe passé."},
  {id:'subji',    name:'Subjonctif imparfait',        mood:'Subjonctif',   lvl:'4e',    icon:'🌲', color:'#5de38a', pre:'que', ex:"qu'il chantât · que nous finissions · qu'ils prissent", desc:"Le subjonctif des livres anciens : qu'il chantât, qu'elle fût, qu'ils vinssent."},
  {id:'subjpqp',  name:'Subjonctif plus-que-parfait', mood:'Subjonctif',   lvl:'4e',    icon:'🌌', color:'#c9adff', pre:'que', cmp:'subji', ex:"qu'il eût chanté · que nous fussions partis · qu'ils eussent pris", desc:"Le sommet de la montagne : avoir ou être au subjonctif imparfait + participe passé."}
];
const TENSE_BY = Object.fromEntries(TENSES.map(t => [t.id, t]));
const ALL_P = [0,1,2,3,4,5];

// Pièces maîtresses. pp = participe passé (masculin singulier) ; aux 'e' = être, 'ae' = les deux ; fut = radical du futur (alternatives avec /) ;
// ps = 'radical|type' (a : chantai · i : finis · u : fus · n : vins) ; imparf = radical de l'imparfait ; subj, imper, imparfF, psF = formes écrites.
const PARTS = {
  'être':   {pp:'été', fut:'ser', ps:'f|u', imparf:'ét', subj:'sois,sois,soit,soyons,soyez,soient', imper:'sois,soyons,soyez', ppInv:1},
  'avoir':  {pp:'eu', fut:'aur', ps:'e|u', subj:'aie,aies,ait,ayons,ayez,aient', imper:'aie,ayons,ayez'},
  'aller':  {pp:'allé', aux:'e', fut:'ir', subj:'aille,ailles,aille,allions,alliez,aillent', imper:'va,allons,allez'},
  'faire':  {pp:'fait', fut:'fer', ps:'f|i', subj:'fasse,fasses,fasse,fassions,fassiez,fassent'},
  'dire':   {pp:'dit', ps:'d|i'},
  'interdire': {pp:'interdit', ps:'interd|i'}, 'prédire': {pp:'prédit', ps:'préd|i'}, 'contredire': {pp:'contredit', ps:'contred|i'},
  'maudire':{pp:'maudit', ps:'maud|i'},
  'haïr':   {pp:'haï', psF:'haïs,haïs,haït,haïmes,haïtes,haïrent', subjiF:'haïsse,haïsses,haït,haïssions,haïssiez,haïssent'},
  'vaincre':{pp:'vaincu', ps:'vainqu|i'},
  'coudre': {pp:'cousu', ps:'cous|i'}, 'moudre': {pp:'moulu', ps:'moul|u'}, 'résoudre': {pp:'résolu', ps:'résol|u'},
  'acquérir': {pp:'acquis', fut:'acquerr', ps:'acqu|i'},
  'bouillir': {pp:'bouilli', ps:'bouill|i'}, 'vêtir': {pp:'vêtu', ps:'vêt|i'},
  // -oir
  'voir':   {pp:'vu', fut:'verr', ps:'v|i'}, 'revoir': {pp:'revu', fut:'reverr', ps:'rev|i'}, 'prévoir': {pp:'prévu', fut:'prévoir', ps:'prév|i'},
  'pouvoir':{pp:'pu', fut:'pourr', ps:'p|u', subj:'puisse,puisses,puisse,puissions,puissiez,puissent', noImper:1},
  'vouloir':{pp:'voulu', fut:'voudr', ps:'voul|u', subj:'veuille,veuilles,veuille,voulions,vouliez,veuillent', imper:'veuille/veux,veuillons/voulons,veuillez/voulez'},
  'devoir': {pp:'dû', ppF:'dû,dus,due,dues', fut:'devr', ps:'d|u'},
  'savoir': {pp:'su', fut:'saur', ps:'s|u', subj:'sache,saches,sache,sachions,sachiez,sachent', imper:'sache,sachons,sachez'},
  'recevoir': {pp:'reçu', fut:'recevr', ps:'reç|u'}, 'apercevoir': {pp:'aperçu', fut:'apercevr', ps:'aperç|u'}, 'décevoir': {pp:'déçu', fut:'décevr', ps:'déç|u'},
  'valoir': {pp:'valu', fut:'vaudr', ps:'val|u', subj:'vaille,vailles,vaille,valions,valiez,vaillent'},
  "s'asseoir": {pp:'assis', fut:'assiér/assoir', ps:'ass|i'},
  'émouvoir': {pp:'ému', fut:'émouvr', ps:'ém|u'},
  'falloir': {pp:'fallu', fut:'faudr', ps:'fall|u', imparfF:'-,-,fallait,-,-,-', subj:'-,-,faille,-,-,-'},
  'pleuvoir': {pp:'plu', fut:'pleuvr', ps:'pl|u', imparfF:'-,-,pleuvait,-,-,-', subj:'-,-,pleuve,-,-,-'},
  'envoyer': {fut:'enverr'}, 'renvoyer': {fut:'renverr'},
  'neiger': {pp:'neigé', imparfF:'-,-,neigeait,-,-,-', subj:'-,-,neige,-,-,-'},
  // -ir du 3e groupe
  'venir': {pp:'venu', aux:'e', fut:'viendr', ps:'v|n'}, 'revenir': {pp:'revenu', aux:'e', fut:'reviendr', ps:'rev|n'}, 'devenir': {pp:'devenu', aux:'e', fut:'deviendr', ps:'dev|n'},
  'prévenir': {pp:'prévenu', fut:'préviendr', ps:'prév|n'}, 'se souvenir': {pp:'souvenu', fut:'souviendr', ps:'souv|n'},
  'tenir': {pp:'tenu', fut:'tiendr', ps:'t|n'}, 'obtenir': {pp:'obtenu', fut:'obtiendr', ps:'obt|n'}, 'retenir': {pp:'retenu', fut:'retiendr', ps:'ret|n'}, 'appartenir': {pp:'appartenu', fut:'appartiendr', ps:'appart|n'},
  'courir': {pp:'couru', fut:'courr', ps:'cour|u'}, 'parcourir': {pp:'parcouru', fut:'parcourr', ps:'parcour|u'},
  'mourir': {pp:'mort', aux:'e', fut:'mourr', ps:'mour|u'},
  'ouvrir': {pp:'ouvert'}, 'offrir': {pp:'offert'}, 'couvrir': {pp:'couvert'}, 'découvrir': {pp:'découvert'}, 'souffrir': {pp:'souffert'},
  'cueillir': {pp:'cueilli', fut:'cueiller'}, 'accueillir': {pp:'accueilli', fut:'accueiller'},
  'partir': {aux:'e'}, 'repartir': {aux:'e'}, 'sortir': {aux:'e'},
  // -re
  'prendre': {pp:'pris', ps:'pr|i'}, 'apprendre': {pp:'appris', ps:'appr|i'}, 'comprendre': {pp:'compris', ps:'compr|i'}, 'surprendre': {pp:'surpris', ps:'surpr|i'},
  'descendre': {aux:'e'},
  'mettre': {pp:'mis', ps:'m|i'}, 'permettre': {pp:'permis', ps:'perm|i'}, 'promettre': {pp:'promis', ps:'prom|i'},
  'connaître': {pp:'connu', ps:'conn|u'}, 'paraître': {pp:'paru', ps:'par|u'}, 'disparaître': {pp:'disparu', ps:'dispar|u'}, 'apparaître': {pp:'apparu', aux:'ae', ps:'appar|u'},
  'naître': {pp:'né', aux:'e', ps:'naqu|i'},
  'lire': {pp:'lu', ps:'l|u'}, 'relire': {pp:'relu', ps:'rel|u'},
  'écrire': {pp:'écrit', ps:'écriv|i'}, 'décrire': {pp:'décrit', ps:'décriv|i'},
  'rire': {pp:'ri', ps:'r|i'}, 'sourire': {pp:'souri', ps:'sour|i'},
  'vivre': {pp:'vécu', ps:'véc|u'}, 'suivre': {pp:'suivi', ps:'suiv|i'},
  'plaire': {pp:'plu', ps:'pl|u'}, 'se taire': {pp:'tu', ps:'t|u'},
  'conduire': {pp:'conduit'}, 'construire': {pp:'construit'}, 'traduire': {pp:'traduit'}, 'cuire': {pp:'cuit'}, 'détruire': {pp:'détruit'}, 'produire': {pp:'produit'},
  'croire': {pp:'cru', ps:'cr|u'}, 'boire': {pp:'bu', ps:'b|u'}, 'conclure': {pp:'conclu', ps:'concl|u'},
  'distraire': {pp:'distrait', noPs:1},
  // 1er groupe : auxiliaire être
  'tomber': {aux:'e'}, 'arriver': {aux:'e'}, 'entrer': {aux:'e'}, 'rentrer': {aux:'e'}, 'rester': {aux:'e'}, 'monter': {aux:'e'}, 'retourner': {aux:'e'}
};

const END = {
  fut: ['ai','as','a','ons','ez','ont'],
  cond: ['ais','ais','ait','ions','iez','aient'],
  imparf: ['ais','ais','ait','ions','iez','aient'],
  ps: {a:['ai','as','a','âmes','âtes','èrent'], i:['is','is','it','îmes','îtes','irent'], u:['us','us','ut','ûmes','ûtes','urent'], n:['ins','ins','int','înmes','întes','inrent']},
  subj: ['e','es','e','ions','iez','ent']
};
const splitAlt = s => s==='-' ? [] : s.split('/');
const uniq = a => a.filter((x,i) => x && a.indexOf(x)===i);
// Radical + terminaison avec les règles d'orthographe des verbes en -ger / -cer : le e ou la cédille ne servent que devant a, o, u.
function glue(stem, end){
  const soft = /^[aâoôuû]/.test(end);
  if (stem.endsWith('ge')) return (soft ? stem : stem.slice(0,-1)) + end;
  if (stem.endsWith('g')) return (soft ? stem+'e' : stem) + end;
  if (stem.endsWith('ç')) return (soft ? stem : stem.slice(0,-1)+'c') + end;
  return stem + end;
}
const _conjCache = {};
function infStem(V){ const v = V.v.replace(/^(se |s')/, ''); return v; }
function group(V){ return V.g; }
// Un dérivé à préfixe (refaire, redire, convaincre…) hérite des pièces de sa base, préfixées. Seul l'auxiliaire ne s'hérite pas.
function partsOf(V){
  if (PARTS[V.v]) return PARTS[V.v];
  const inf = infStem(V); let best = null;
  for (const k in PARTS){ const b = k.replace(/^(se |s')/, ''); if (inf!==b && inf.endsWith(b) && BY_VERB[k] && BY_VERB[k].g===V.g && (!best || b.length>best.b.length)) best = {k, b}; }
  if (!best) return {};
  const src = PARTS[best.k], pre = inf.slice(0, -best.b.length), out = {};
  const pf = s => s.split(',').map(f => f==='-' ? f : f.split('/').map(x => pre+x).join('/')).join(',');
  for (const f in src){
    if (f==='aux') continue;
    if (f==='pp') out.pp = pre+src.pp;
    else if (f==='fut') out.fut = src.fut.split('/').map(x => pre+x).join('/');
    else if (f==='ps') out.ps = pre+src.ps;
    else if (f==='imparf') out.imparf = pre+src.imparf;
    else if (typeof src[f]==='string') out[f] = pf(src[f]);
    else out[f] = src[f];
  }
  return out;
}
function pieces(V){
  const inf = infStem(V), P = partsOf(V);
  const pr = V.alts; // présent : 6 tableaux d'alternatives
  const out = {inf, P, refl: !!V.refl, imp: !!V.imp};
  // Participe passé
  out.pp = P.pp || (inf.endsWith('er') ? inf.slice(0,-2)+'é' : V.g===2 ? inf.slice(0,-2)+'i' : inf.endsWith('ir') ? inf.slice(0,-2)+'i' : /indre$/.test(inf) ? inf.slice(0,-3)+'t' : inf.endsWith('dre') ? inf.slice(0,-2)+'u' : inf.endsWith('re') ? inf.slice(0,-2)+'u' : null);
  out.ppF = P.ppF ? P.ppF.split(',') : P.ppInv ? [out.pp,out.pp,out.pp,out.pp] : [out.pp, out.pp.endsWith('s') ? out.pp : out.pp+'s', out.pp+'e', out.pp+'es'];
  out.aux = V.refl ? 'e' : (P.aux || 'a');
  // Futur : pour le 1er groupe, la forme « je » du présent + r (appelle → appeller, achète → achèter, paie/paye → paier/payer) ;
  // les verbes en é + consonne + er gardent aussi le radical de l'infinitif (je préférerai, orthographe traditionnelle, puis je préfèrerai).
  if (P.fut) out.fut = P.fut.split('/');
  else if (inf.endsWith('er')){ const je = (V.imp ? pr[2] : pr[0]).map(f => f+'r'); const eacc = /é[^aeiouéè]+er$/.test(inf) && pr[0][0].includes('è'); out.fut = uniq(eacc ? [inf, ...je] : je); }
  else if (inf.endsWith('re')) out.fut = [inf.slice(0,-1)];
  else out.fut = [inf];
  // Passé simple
  if (P.psF) out.psF = P.psF.split(',').map(splitAlt);
  else if (!P.noPs){
    let spec = P.ps;
    if (!spec){
      if (inf.endsWith('cer')) spec = inf.slice(0,-3)+'ç|a';
      else if (inf.endsWith('er')) spec = inf.slice(0,-2)+'|a';
      else if (V.g===2) spec = inf.slice(0,-2)+'|i';
      else if (/indre$/.test(inf)) spec = inf.slice(0,-4)+'gn|i';
      else if (/uire$/.test(inf)) spec = inf.slice(0,-2)+'s|i';
      else if (inf.endsWith('ir')) spec = inf.slice(0,-2)+'|i';
      else if (inf.endsWith('re')) spec = inf.slice(0,-2)+'|i';
    }
    const [stem, type] = spec.split('|');
    out.psF = END.ps[type].map(e => [glue(stem, e)]);
  } else out.psF = null;
  // Imparfait : radical de « nous » au présent
  if (P.imparfF) out.imparfF = P.imparfF.split(',').map(splitAlt);
  else { const stems = P.imparf ? [P.imparf] : pr[3].map(f => f.replace(/ons$/, '')); out.imparfF = END.imparf.map(e => uniq(stems.map(s => glue(s, e)))); }
  // Subjonctif présent : radical de « ils » au singulier et à la 3e du pluriel, radical de « nous » pour nous et vous
  if (P.subj) out.subjF = P.subj.split(',').map(splitAlt);
  else {
    const s1 = (V.imp ? pr[2].map(f => f.replace(/e$/, '')) : pr[5].map(f => f.replace(/ent$/, ''))), s2 = pr[3].map(f => f.replace(/ons$/, ''));
    out.subjF = END.subj.map((e,i) => (i===3||i===4) ? uniq(s2.map(s => glue(s, e))) : uniq(s1.map(s => glue(s, e))));
    if (V.imp) out.subjF = out.subjF.map((a,i) => i===2 ? a : []);
  }
  // Impératif : tu, nous, vous du présent ; le s de « tu » tombe après un e (chante, ouvre) et pour aller (va)
  if (P.imper) out.imperF = P.imper.split(',').map(splitAlt);
  else if (P.noImper || V.imp) out.imperF = null;
  else out.imperF = [pr[1].map(f => /es$/.test(f) ? f.slice(0,-1) : f), pr[3], pr[4]];
  return out;
}
// Formes (6 tableaux d'alternatives) d'un verbe à un temps simple. Les personnes absentes donnent [].
function simpleForms(V, tid){
  const pc = pieces(V);
  const only = V.imp ? [2] : ALL_P;
  const keep = (arr) => arr.map((a,i) => only.includes(i) ? a : []);
  switch (tid){
    case 'present': return V.alts.map(a => a[0]==='-' ? [] : a);
    case 'futur': return keep(END.fut.map(e => uniq(pc.fut.map(s => s+e))));
    case 'cond': return keep(END.cond.map(e => uniq(pc.fut.map(s => s+e))));
    case 'imparfait': return keep(pc.imparfF);
    case 'ps': return pc.psF ? keep(pc.psF) : [[],[],[],[],[],[]];
    case 'subj': return keep(pc.subjF);
    case 'subji': {
      if (pc.P.subjiF) return keep(pc.P.subjiF.split(',').map(splitAlt));
      if (!pc.psF) return [[],[],[],[],[],[]];
      // À partir de la 2e personne du passé simple : chantas → chantasse, chantât ; vins → vinsse, vînt
      const tu = pc.psF[1][0]; const base = tu.slice(0,-1);
      const hat = base.replace(/([aiu])(n?)$/, (m, v, n) => ({a:'â',i:'î',u:'û'}[v]) + n);
      return keep([[base+'sse'], [base+'sses'], [hat+'t'], [base+'ssions'], [base+'ssiez'], [base+'ssent']]);
    }
    case 'imperatif': {
      if (!pc.imperF) return [[],[],[],[],[],[]];
      const suf = V.refl ? ['-toi','-nous','-vous'] : ['','',''];
      return [[], pc.imperF[0].map(f => f+suf[0]), [], pc.imperF[1].map(f => f+suf[1]), pc.imperF[2].map(f => f+suf[2]), []];
    }
  }
  return null;
}
const AUX_FORMS = {}; // cache des formes d'être et avoir par temps simple
function auxForms(aux, tid){ const k = aux+tid; if (!AUX_FORMS[k]) AUX_FORMS[k] = simpleForms(BY_VERB[aux==='e' ? 'être' : 'avoir'], tid); return AUX_FORMS[k]; }
// Accord du participe : g = 'm' | 'f' | 'x' (les deux), n = 's' | 'p' | 'x'
function ppAgree(pc, g, n){
  const F = pc.ppF, out = [];
  const gs = g==='x' ? ['m','f'] : [g], ns = n==='x' ? ['s','p'] : [n];
  for (const nn of ns) for (const gg of gs) out.push(F[(gg==='f' ? 2 : 0) + (nn==='p' ? 1 : 0)]);
  return uniq(out);
}
// Formes complètes d'un verbe à un temps, pour une personne p. subj : {g, n} pour l'accord (défaut : masculin, nombre de la personne).
function conj(V, tid, p, subj){
  const T = TENSE_BY[tid];
  if (!T.cmp) return (simpleForms(V, tid)[p] || []).slice();
  const pc = pieces(V);
  const g = subj ? subj.g : 'm', n = subj ? subj.n : (p>=3 ? 'p' : 's');
  const auxes = pc.aux==='ae' ? ['a','e'] : [pc.aux];
  const out = [];
  for (const a of auxes){
    const af = auxForms(a, T.cmp)[p] || [];
    const pps = (a==='e') ? ppAgree(pc, g, n) : [pc.pp];
    for (const x of af) for (const y of pps) out.push(x+' '+y);
  }
  if (V.imp) return p===2 ? out : [];
  return out;
}
// Les 6 personnes au temps courant, accord masculin par défaut (tableaux, Carnet, distracteurs)
function formsOf(V, tid){ const k = V.id+'|'+tid; if (!_conjCache[k]) _conjCache[k] = ALL_P.map(p => conj(V, tid, p)); return _conjCache[k]; }
// Le verbe existe-t-il à ce temps ? (impersonnels sans impératif, distraire sans passé simple)
function existsAt(V, tid){ const T = TENSE_BY[tid]; const ps = T.persons || (V.imp ? [2] : ALL_P); return ps.some(p => conj(V, tid, p).length>0); }
function personsAt(V, tid){ const T = TENSE_BY[tid]; const base = V.imp ? [2] : (T.persons || ALL_P); return base.filter(p => conj(V, tid, p).length>0); }
// Un verbe est un « piège » à un temps donné quand sa forme s'écarte de la règle par défaut : tiré deux fois plus souvent.
function hardAt(V, tid){
  const T = TENSE_BY[tid], P = partsOf(V), inf = infStem(V), g = V.g;
  const trapI = /(ger|cer|ier|yer)$/.test(inf) && g===1; // nous mangions, nous criions, nous payions
  const base = tid==='present' ? !!V.hard : tid==='imparfait' ? (trapI || V.v==='être') : (tid==='futur'||tid==='cond') ? (!!P.fut || (g===1 && !pieces(V).fut.includes(inf)))
    : (tid==='ps'||tid==='subji') ? (g===3 || /(ger|cer)$/.test(inf)) : tid==='subj' ? (!!P.subj || trapI || (pieces(V).subjF[0][0]||'') !== (pieces(V).subjF[3][0]||'').replace(/ions$/,'e') && g===3)
    : tid==='imperatif' ? (!!P.imper || !!V.refl || (g===1 && !inf.endsWith('er'))) : !!(P.pp || P.aux || V.refl); // temps composés : participe irrégulier, être, pronominal
  return base;
}
// Note du Sage adaptée au temps
function tenseNote(V, tid){
  const T = TENSE_BY[tid], pc = pieces(V), P = partsOf(V);
  const aux = pc.aux==='e' ? 'être' : pc.aux==='ae' ? 'avoir ou être' : 'avoir';
  if (T.cmp){ const base = TENSE_BY[T.cmp].name.toLowerCase(); return `${T.name} = ${aux} au ${base} + participe passé « ${pc.pp} »${pc.aux!=='a' ? ", qui s'accorde avec le sujet (allé, allée, allés, allées)" : ''}.${V.refl ? " Les verbes pronominaux prennent toujours être." : ''}`; }
  switch (tid){
    case 'present': return V.n;
    case 'futur': return `Futur simple : radical « ${pc.fut.join(' / ')} » + ai, as, a, ons, ez, ont.${P.fut ? " Radical irrégulier, à retenir par cœur." : V.g===1 ? " Pour le 1er groupe, c'est la forme « je » du présent + r : les pièges restent (j'appellerai, j'achèterai)." : V.v.endsWith('re') ? " Pour les verbes en -re, on enlève le e final de l'infinitif." : " C'est l'infinitif entier."}`;
    case 'cond': return `Conditionnel présent : radical du futur « ${pc.fut.join(' / ')} » + ais, ais, ait, ions, iez, aient (les terminaisons de l'imparfait).`;
    case 'imparfait': return `Imparfait : radical de « nous » au présent (${V.alts[3][0]} → ${V.alts[3][0].replace(/ons$/,'')}-) + ais, ais, ait, ions, iez, aient.${/ger$/.test(pc.inf) ? " Le e de mangeons reste devant a (je mangeais) mais pas devant i (nous mangions)." : /cer$/.test(pc.inf) ? " La cédille reste devant a (je lançais) mais pas devant i (nous lancions)." : /(ier|yer)$/.test(pc.inf) ? " Deux lettres qui se suivent avec nous et vous : nous criions, nous payions." : V.v==='être' ? " Être prend le radical ét- : j'étais, nous étions." : ''}`;
    case 'ps': return `Passé simple : ${pc.psF ? `${pc.psF[2][0]}, ${pc.psF[5][0]}. ` : ''}${V.g===1 ? "1er groupe : ai, as, a, âmes, âtes, èrent." : V.g===2 ? "2e groupe : is, is, it, îmes, îtes, irent." : /\|u$/.test(P.ps||'') ? "Terminaisons en u : us, us, ut, ûmes, ûtes, urent." : /\|n$/.test(P.ps||'') ? "venir et tenir : ins, ins, int, înmes, întes, inrent." : "Terminaisons en i : is, is, it, îmes, îtes, irent."} Accent circonflexe avec nous et vous.`;
    case 'subj': return `Subjonctif présent : « que » + radical de « ils » au présent (${V.alts[5][0]||V.alts[2][0]}) + e, es, e, ent ; pour nous et vous, radical de « nous » + ions, iez.${P.subj ? " Ce verbe a un subjonctif irrégulier, à retenir par cœur." : ''}`;
    case 'subji': return `Subjonctif imparfait : à partir du passé simple (${pc.psF ? pc.psF[1][0] : ''}) + se, ses, ^t, sions, siez, sent. Accent circonflexe à la 3e personne : ${pc.psF ? simpleForms(V,'subji')[2][0] : ''}.`;
    case 'imperatif': return `Impératif : les formes tu, nous, vous du présent, sans sujet.${V.g===1 || /^(ouvr|offr|couvr|découvr|souffr|cueill|accueill)/.test(pc.inf) ? " Pas de s à la 2e personne : chante, ouvre." : ''}${V.refl ? " Pronominal : le pronom passe après avec un trait d'union (lève-toi, levons-nous)." : ''}${P.imper ? " Formes irrégulières, à retenir par cœur." : ''}`;
  }
  return V.n;
}
