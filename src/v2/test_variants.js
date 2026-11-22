setTimeout(async () => { const out = []; const T = (tag, cond, extra) => out.push((cond?'OK ':'FAIL ')+tag+(extra!==undefined?' → '+extra:''));
try{
  settleModal(); $('#inp-name').value = 'Hugo'; $('#btn-name').click();
  const submit = s => { $('#inp').value = s; $('#form-answer').dispatchEvent(new Event('submit', {cancelable:true})); };
  const retype = s => { $('#inp-retype').value = s; retypeCheck(); };
  switchWorld('futur'); startRun('region','hebra'); run.moonAt = -1;
  const V = BY_VERB["s'asseoir"]; run.qs[0] = {v:V.id, m:V.id, p:0, t:'futur', s:'je', g:'m', n:'s', a:conj(V,'futur',0,{t:'je',g:'m',n:'s'}), c:'sur le banc'}; renderQuestion();
  T('asseoir futur : deux formes', run.qs[0].a.join('/')==='assiérai/assoirai', run.qs[0].a.join('/'));
  submit('asseyerai');
  const vb = $('#fb .variants');
  T('faute : encadré variantes', vb && /Deux orthographes justes/.test(vb.textContent) && /assiérai/.test(vb.textContent) && /assoirai/.test(vb.textContent) && /une seule/.test(vb.textContent), vb && vb.textContent);
  T('consigne recopie', /une des orthographes/.test($('#form-retype label').textContent));
  retype('assiérai / assoirai'); T('deux formes refusées', run.i===0 && run.phase==='retype');
  retype('je m\'assoirai'); T('recopie forme 2 acceptée', run.i===1);
  // réponse juste avec la 2e forme
  run.qs[1] = {...run.qs[0]}; renderQuestion(); submit("je m'assoirai");
  T('assoirai accepté', run.phase==='fb' && /aussi écrire/.test($('#fb').textContent) && /assiérai/.test($('#fb .variants.ok').textContent), $('#fb').textContent.slice(0,120));
  next();
  // verbe sans variante : pas d'encadré
  const C = BY_VERB['venir']; run.qs[2] = {v:C.id, m:C.id, p:0, t:'futur', s:'je', g:'m', n:'s', a:conj(C,'futur',0,{t:'je',g:'m',n:'s'}), c:''}; renderQuestion(); submit('venirai');
  T('pas d\'encadré sans variante', !$('#fb .variants') && /Recopie/.test($('#form-retype label').textContent));
  retype('viendrai');
  // connaître futur sans accent
  const K = BY_VERB['connaître']; T('connaitrai accepté', conj(K,'futur',0,{t:'je',g:'m',n:'s'}).includes('connaitrai'));
  T('raison circonflexe', /1990/.test(variantWhy(K,'futur',conj(K,'futur',0,{t:'je',g:'m',n:'s'}))));
  T('raison payer', /-ayer/.test(variantWhy(BY_VERB.payer,'futur',['paierai','payerai'])));
  T('raison préférer', /é de l'infinitif/.test(variantWhy(BY_VERB['préférer'],'futur',['préférerai','préfèrerai'])));
  T('raison épeler', /accent grave/.test(variantWhy(BY_VERB['épeler'],'present',['épelle','épèle'])));
  switchWorld('pc'); const A = BY_VERB['apparaître']; T('raison apparaître', /être ou avec avoir/.test(variantWhy(A,'pc',conj(A,'pc',2,{t:'il',g:'m',n:'s'}))), conj(A,'pc',2,{t:'il',g:'m',n:'s'}).join('/'));
  // Distracteurs de la Lune : jamais une forme juste
  switchWorld('futur'); let bad = 0; for (let k=0;k<200;k++){ const q = {v:V.id, m:V.id, p:k%6, t:'futur', s:'il', g:'m', n:'s', a:conj(V,'futur',k%6,{t:'il',g:'m',n:'s'})}; if (distractors(q).some(d => q.a.includes(d))) bad++; }
  T('lune : aucune variante en leurre', bad===0, bad);
}catch(e){ out.push('ERR '+e.message+' '+e.stack.slice(0,200)); }
document.body.setAttribute('data-test', out.join(' || '));
}, 1500);
