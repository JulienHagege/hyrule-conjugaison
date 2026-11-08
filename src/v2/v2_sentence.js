function comp(V){ const c = COMP[V.v]; if (!c) return ''; return Array.isArray(c) ? c[Math.floor(Math.random()*c.length)] : c; }
const endMark = () => TENSE==='imperatif' ? ' !' : '.';
function sentenceHtml(q, form){ return `${esc(cap(subjectText(q,form)))}<em>${esc(form)}</em>${q.c ? ' '+esc(q.c) : ''}${endMark()}`; }
// Ce qui précède le trou : « que » au subjonctif, le pronom des verbes pronominaux, l'élision (j', m', qu'). Rien à l'impératif.
function subjDisp(q){ return TENSE==='imperatif' ? `(${PERSON_LABEL[q.p].replace(' / ','/')})` : cap(subjectText(q).trim()); }
const VOWEL = /^[aeiouyâàéèêëîïôûùüœ]/i;
function subjectText(q, form){
  const V = VERBS[q.m!=null ? q.m : q.v], T = TENSE_BY[q.t||TENSE];
  if (T.id==='imperatif') return '';
  const first = form || (q.a && q.a[0]) || formsOf(V, T.id)[q.p][0] || '';
  const vow = VOWEL.test(first) && !(V.h && !T.cmp); // h aspiré : « je hais », mais « j'ai haï »
  let s = q.s, pre = '';
  if (T.pre) pre = VOWEL.test(s) ? "qu'" : 'que ';
  if (V.refl){
    let r = REFL[q.p];
    if (vow && (r==='me'||r==='te'||r==='se')) r = r[0]+"'";
    else r += ' ';
    if (q.p===0) s = 'je ';
    else s += ' ';
    return pre + s + r;
  }
  if (q.p===0) return pre + (vow ? "j'" : 'je ');
  return pre + s + ' ';
}
