// Vérifie toutes les formes du moteur contre le lexique Lefff. node check_lefff.js [--all]
const fs = require('fs'), path = require('path');
const H = path.dirname(__filename);
const L = require(path.join(H, '..', 'lefff', 'package', 'dist', 'conjugations.json'));
let src = fs.readFileSync(path.join(H, 'verbs_extract.js'), 'utf8');
// La ligne VERBS.forEach(... x.id ...) et BY_VERB sont dans l'extrait : on insère les nouveaux verbes juste avant.
const marker = 'VERBS.forEach((x,i) => { x.id = i;';
src = src.replace(marker, fs.readFileSync(path.join(H, 'new_verbs.js'), 'utf8') + '\n' + marker);
src += '\n' + fs.readFileSync(path.join(H, 'engine.js'), 'utf8');
src += `\nmodule.exports = {VERBS, BY_VERB, TENSES, conj, simpleForms, pieces, formsOf, existsAt, hardAt, tenseNote, PARTS};`;
const m = {exports:{}}; new Function('module','require', src)(m, require);
const E = m.exports;
const MAP = {present:'P', futur:'F', cond:'C', imparfait:'I', ps:'J', subj:'S', subji:'T', imperatif:'Y'};
let errs = 0, warns = 0, checked = 0, missing = [];
const strip = (f, V, tid) => tid==='imperatif' && V.refl ? f.replace(/-(toi|nous|vous)$/, '') : f;
for (const V of E.VERBS){
  const key = V.v.replace(/^(se |s')/, '');
  const Lv = L[key];
  if (!Lv){ missing.push(V.v); continue; }
  for (const tid in MAP){
    const ref = Lv[MAP[tid]];
    const mine = E.simpleForms(V, tid);
    for (let p=0;p<6;p++){
      if (V.imp && p!==2) continue;
      const r = ref && ref[p] && ref[p]!=='NA' ? ref[p] : null;
      const my = mine[p].map(f => strip(f, V, tid));
      checked++;
      if (r && !my.includes(r)){ errs++; console.log(`ERR  ${V.v} ${tid} p${p}: lefff=${r} moi=${my.join('/')||'∅'}`); }
      else if (!r && my.length && !(tid==='imperatif' && V.refl===undefined && false)){ if (!(V.imp)) { warns++; if (process.argv.includes('--all')) console.log(`WARN ${V.v} ${tid} p${p}: lefff=∅ moi=${my.join('/')}`); } }
      else if (r && my[0]!==r){ warns++; if (process.argv.includes('--all')) console.log(`VAR  ${V.v} ${tid} p${p}: lefff=${r} moi=${my.join('/')}`); }
    }
  }
  // participe passé (4 formes : m, mp, f, fp)
  const pc = E.pieces(V);
  const K = Lv.K; checked++;
  if (K && K[0] && pc.ppF.join(',') !== K.join(',')){ if (pc.ppF[0]!==K[0]){ errs++; console.log(`ERR  ${V.v} pp: lefff=${K.join(',')} moi=${pc.ppF.join(',')}`); } else { warns++; if (process.argv.includes('--all')) console.log(`VAR  ${V.v} pp: lefff=${K.join(',')} moi=${pc.ppF.join(',')}`); } }
}
console.log(`\n${E.VERBS.length} verbes, ${checked} cases vérifiées, ${errs} erreurs, ${warns} variantes/avertissements, absents du Lefff : ${missing.join(', ')||'aucun'}`);
// Tour d'horizon des temps composés sur quelques verbes
if (process.argv.includes('--show')){
  for (const v of ['aller','manger','se lever','s\'asseoir','apparaître','être','haïr','distraire','falloir']){
    const V = E.BY_VERB[v];
    for (const T of E.TENSES){ console.log(v.padEnd(12), T.id.padEnd(10), [0,1,2,3,4,5].map(p => E.conj(V, T.id, p, p===4 ? {g:'x',n:'x'} : undefined).join('/')).join(' · ')); }
  }
}
