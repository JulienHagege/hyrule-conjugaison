// Mauvaises réponses plausibles pour la Lune de sang : fautes typiques sur la forme juste, autres personnes, et aux temps composés
// le mauvais auxiliaire ou un participe mal accordé.
function distractors(q){
  const V = VERBS[q.m], alts = q.a, c = alts[0], T = TENSE_BY[TENSE];
  const muts = [c.endsWith('s') ? c.slice(0,-1) : c+'s', c.replace(/ent$/,'ont'), c.replace(/ons$/,'ont'), c.replace(/ez$/,'er'), c.replace(/ent$/,'e'), c.replace(/e$/,'es'),
    deacc(c), c.replace(/è/g,'é'), c.replace(/é/g,'è'), c.replace(/eons$/,'ons'), c.replace(/ç/g,'c'), c.replace(/([lt])\1/,'$1'), c.replace(/([lt])(e|es|ent)$/,'$1$1$2'),
    c.replace(/t$/,'d'), c.replace(/d$/,'t'), c.replace(/ie(s)?$/,'ye$1'), c.replace(/oi(s|t)$/,'oy$1'), c.replace(/x$/,'s'), c.replace(/s$/,'x'), c.replace(/ai$/,'ais'), c.replace(/ait$/,'ais'), c.replace(/issons$/,'ons'), c.replace(/ît$/,'it'), c.replace(/ites$/,'isez'), c.replace(/ont$/,'ent'),
    c.replace(/âmes$/,'ames'), c.replace(/îmes$/,'imes'), c.replace(/ât$/,'at'), c.replace(/ût$/,'ut'), c.replace(/erai$/,'erais'), c.replace(/rai$/,'rais'), c.replace(/rais$/,'rai'), c.replace(/ions$/,'ons'), c.replace(/iez$/,'ez'), c.replace(/iions$/,'ions'), c.replace(/yions$/,'yons')];
  if (T.cmp){
    const sp = c.indexOf(' '), aux = c.slice(0, sp), pp = c.slice(sp+1), pc = pieces(V);
    const other = auxForms(pc.aux==='e' ? 'a' : 'e', T.cmp)[q.p]; if (other && other[0]) muts.push(other[0]+' '+pp);
    const wrongP = auxForms(pc.aux==='e' ? 'e' : 'a', T.cmp)[(q.p+1)%6]; if (wrongP && wrongP[0]) muts.push(wrongP[0]+' '+pp);
    muts.push(aux+' '+(pp.endsWith('s') ? pp.slice(0,-1) : pp+'s'), aux+' '+(pp.endsWith('e') ? pp.slice(0,-1) : pp+'e'), aux+' '+pp.replace(/é(e?s?)$/,'er'), aux+' '+pp.replace(/i(e?s?)$/,'it'), aux+' '+pp.replace(/u(e?s?)$/,'us'), aux+' '+pp.replace(/t$/,'s'));
  }
  if (TENSE==='imperatif' && V.refl) muts.push(c.replace(/-toi$/,'-te'), c.replace(/-nous$/,'-vous'), c.replace(/-vous$/,'-nous'), c.replace(/^(\S+?)e-toi$/,'$1es-toi'));
  const mut = []; muts.forEach(m => { if (m && m!==c && !alts.includes(m) && !mut.includes(m)) mut.push(m); });
  const others = []; formsOf(V, TENSE).forEach((f,i) => { if (i!==q.p) f.forEach(x => { if (!alts.includes(x) && !others.includes(x)) others.push(x); }); });
  shuffle(mut); shuffle(others);
  const out = mut.slice(0, Math.min(mut.length, 1+Math.floor(Math.random()*2)));
  for (const o of others){ if (out.length>=3) break; if (!out.includes(o)) out.push(o); }
  for (const m of mut){ if (out.length>=3) break; if (!out.includes(m)) out.push(m); }
  return out.slice(0,3);
}
