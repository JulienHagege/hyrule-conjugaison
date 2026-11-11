setTimeout(async () => { const out = []; const T = (tag, cond, extra) => out.push((cond?'OK ':'FAIL ')+tag+(extra!==undefined?' → '+extra:''));
const submit = v => { $('#inp').value = v; $('#form-answer').dispatchEvent(new Event('submit', {cancelable:true})); };
try{
  settleModal(); $('#inp-name').value = 'Hugo'; $('#btn-name').click(); if (typeof closeTuto==='function') closeTuto();
  // Données : tous les verbes existent, auxiliaire avoir, quatre COD
  const miss = COD_DATA.filter(d => !BY_VERB[d[0]]).map(d => d[0]); T('verbes des Profondeurs connus', !miss.length, miss.join(','));
  T('auxiliaire avoir partout', COD_DATA.every(d => !BY_VERB[d[0]] || pieces(BY_VERB[d[0]]).aux==='a'), COD_DATA.filter(d => BY_VERB[d[0]] && pieces(BY_VERB[d[0]]).aux!=='a').map(d => d[0]+':'+pieces(BY_VERB[d[0]]).aux).join(','));
  T('quatre COD par verbe', COD_DATA.every(d => d[1].split('|').length===4));
  out.push('PP '+codData().map(d => d[0]+'='+pieces(BY_VERB[d[0]]).ppF.join('/')).join(' ; '));
  // Autres univers : pas de carte
  switchWorld('present', true); T('présent : pas de Profondeurs', !document.querySelector('.region.depths'));
  switchWorld('pc', true);
  const card = () => document.querySelector('.region.depths');
  T('pc : carte verrouillée en dernier', card() && card().disabled && $('#map').lastElementChild===card(), card() && card().textContent.replace(/\s+/g,' ').slice(0,90));
  S.bossWins = 1; renderHome(); T('carte ouverte après le Château', card() && !card().disabled && !!card().querySelector('.new'));
  // Premier lancement : explication, puis la partie
  card().click(); T('explication au premier lancement', !$('#rule').hidden && !run && $('#rule-title').textContent.includes('secret'));
  for (let i=0;i<4;i++) $('#rule-next').click(); T('dernière étape', $('#rule-next').textContent.includes('Descendre'), $('#rule-next').textContent);
  $('#rule-next').click(); T('partie lancée après l\'explication', $('#rule').hidden && run && run.regionId==='profondeurs' && run.qs.length===12 && S.codTuto===true && document.body.classList.contains('depths-mode') && sceneId==='profondeurs');
  run.moonAt = -1;
  out.push('PHRASES '+run.qs.map(q => codSentenceHtml(q, q.a[0]).replace(/<[^>]+>/g,'')+' ['+q.cod.key+']').join(' | '));
  const nA = run.qs.filter(q => q.cod.type==='apres').length; T('paires jumelles', nA===4 && run.qs.every(q => q.kind==='cod'), 'apres='+nA);
  // Premier geste : mauvais puis bon
  const q0 = run.qs[0]; T('saisie masquée avant le geste', $('#form-answer').hidden && !$('#cod-step').hidden && $('#cod-msg').textContent.includes('touche le COD'), $('#cod-msg').textContent);
  out.push('ECRAN '+$('#qcard .sentence').textContent.replace(/\s+/g,' '));
  const tap = k => document.querySelector('#qcard .sentence .tap[data-k="'+k+'"]').click();
  tap('subj'); T('sujet touché : explication', $('#form-answer').hidden && $('#cod-msg').textContent.includes('sujet'), $('#cod-msg').textContent);
  const r0 = run.rupees; tap('cod'); T('COD touché : saisie ouverte, pas de bonus', !$('#form-answer').hidden && q0.tapped && run.rupees===r0);
  submit(q0.a[0]); T('bonne réponse', run.phase==='fb' && run.res[0]==='ok' && S.cod[q0.cod.key].r===1 && $('#fb').textContent.includes('Rétrospective'), $('#fb .sage').textContent.slice(0,120));
  next();
  // Deuxième : bon geste du premier coup (+5), mauvaise réponse
  const q1 = run.qs[1], r1 = run.rupees; tap('cod'); T('+5 du premier coup', run.rupees===r1+5);
  const wrong = q1.a[0].split(' ')[0]+' '+q1.cod.forms.find(f => (q1.a[0].split(' ')[0]+' '+f)!==q1.a[0]);
  const h = run.hearts; submit(wrong); T('mauvais accord : cœur perdu, note du Sage', run.phase==='retype' && run.hearts===h-1 && S.cod[q1.cod.key].w===1 && $('#fb .sage').textContent.includes('COD'), wrong+' / '+$('#fb .right').textContent+' / '+$('#fb .sage').textContent.slice(0,140));
  $('#inp-retype').value = q1.a[0]; retypeCheck(); T('recopie', run.i===2);
  // Rappel de la règle en pleine partie
  $('#btn-rule').click(); T('rappel de la règle', !$('#rule').hidden && $('#rule-title').textContent.includes('règle') && !$('#rule-more').hidden); $('#rule-next').click(); T('rappel fermé, partie intacte', $('#rule').hidden && run && run.i===2);
  // Fin de partie
  let g = 0; while (run && screen==='game' && g<30){ const q = run.qs[run.i]; if (run.phase==='ask'){ tap('cod'); submit(q.a[0]); } if (run.phase==='fb') next(); g++; }
  T('expédition terminée, 2 étoiles', screen==='result' && S.regions.profondeurs && S.regions.profondeurs.stars===2 && codOn(), JSON.stringify(S.regions.profondeurs)+' '+$('#r-errs').textContent.slice(0,160));
  // Paliers : pronoms après une étoile, pièges après deux
  const typesOf = n => { const set = new Set(); for (let k=0;k<n;k++) codRun(12).forEach(q => set.add(q.cod.type)); return [...set].sort().join(','); };
  const keep = S.regions.profondeurs.stars;
  S.regions.profondeurs.stars = 0; T('palier 1 : apres et que', typesOf(30)==='apres,que' && codLevel()===1 && !codOn(), typesOf(30));
  S.regions.profondeurs.stars = 1; T('palier 2 : pronoms', typesOf(40)==='apres,pro,que' && codLevel()===2, typesOf(40));
  S.regions.profondeurs.stars = 2; T('palier 3 : pièges', typesOf(40)==='apres,coi,en,pro,que' && codLevel()===3, typesOf(40));
  const show1 = k => { const q = codFromKey(k); return codSentenceHtml(q, q.a[0]).replace(/<[^>]+>/g,'')+' ['+codNote(q).slice(0,70)+']'; };
  out.push('NOUVELLES '+['pro|fs','pro|ms','pro|fp','pro|mp','coi','coi','en','en','pro|fs','coi','en'].map(show1).join(' | '));
  { let ok = true, bad = ''; for (let k=0;k<400;k++){ const key = COD_KEYS[k % COD_KEYS.length], q = codFromKey(key), c = q.cod, f = q.a[0].split(' ')[1];
      const want = (c.type==='que' || c.type==='pro') ? c.forms[COD_PPI[c.gn]] : c.base; if (f!==want || c.key!==key || (c.type==='coi' && !COD_DATA.find(d => d[0]===VERBS[q.m].v)[3]) || (c.type==='en' && !c.noun.startsWith('des '))){ ok = false; bad = key+' '+q.a[0]; } }
    T('formes attendues pour chaque type', ok, bad); }
  // Écran : pronom, piège lui, piège en
  S.regions.profondeurs.stars = 2; S.codSeen = 3; startRun('region','profondeurs'); run.moonAt = -1;
  const putQ = q => { run.qs[run.i] = q; renderGame(); renderQuestion(); return q; };
  let qx = putQ(mkCod(COD_DATA[14], 'pro', 'fs', {t:'je', p:0})); out.push('ECRAN pro '+$('#qcard .sentence').textContent.replace(/\s+/g,' '));
  document.querySelector('#qcard .tap[data-k="pron"]').click(); T('pronom touché = COD', qx.tapped && !$('#form-answer').hidden && $('#cod-msg').textContent.includes('remplace'), $('#cod-msg').textContent);
  submit('ai trouvée'); T('pronom : accord accepté', run.res[run.i]==='ok', qx.a[0]); next();
  qx = putQ(mkCod(COD_DATA[12], 'coi', 'fp', {t:'Link', p:2})); out.push('ECRAN coi '+$('#qcard .sentence').textContent.replace(/\s+/g,' '));
  document.querySelector('#qcard .tap[data-k="coi"]').click(); T('lui touché : COI expliqué', !qx.tapped && $('#cod-msg').textContent.includes('COI'), $('#cod-msg').textContent);
  tap('cod'); submit('a offertes'); T('piège lui : accord refusé', run.phase==='retype' && S.cod.coi.w===1 && $('#fb .sage').textContent.includes('quelqu'), $('#fb .sage').textContent.slice(0,150)); $('#inp-retype').value = qx.a[0]; retypeCheck();
  qx = putQ(mkCod(COD_DATA[14], 'en', 'fp', {t:'je', p:0})); out.push('ECRAN en '+$('#qcard .sentence').textContent.replace(/\s+/g,' '));
  tap('pron'); submit("ai trouvé"); T('piège en : pas d\'accord', run.res[run.i]==='ok' && qx.a[0]==='ai trouvé', $('#fb .sage').textContent.slice(0,120));
  $('#btn-quit').click(); $('#btn-quit').click(); T('abandon', !run);
  // Explication par palier à l'entrée
  S.regions.profondeurs.stars = 1; S.codSeen = 1; renderHome(); T('badge Nouveau au palier 2', !!card().querySelector('.new')); card().click();
  T('palier 2 : une seule étape, les pronoms', !$('#rule').hidden && $('#rule-title').textContent.includes('Plus profond') && $('#rule-next').textContent.includes('Descendre'), $('#rule-title').textContent);
  $('#rule-next').click(); T('palier 2 vu, partie lancée', S.codSeen===2 && run && run.regionId==='profondeurs'); $('#btn-quit').click(); $('#btn-quit').click();
  $('#btn-rule'); openRule('card'); T('fiche : pronoms sans pièges', $('#rule-body').textContent.includes("l', les") && !$('#rule-body').textContent.includes('leur')); closeRule();
  S.regions.profondeurs.stars = keep; S.codSeen = 3; S.cod = {}; S.cod[q1.cod.key] = {w:1,r:0,s:0,t:1};
  // Château et Lune de sang
  let nb = 0; for (let k=0;k<20;k++){ const qs = buildQuestions('boss','chateau'); if (qs.length!==25) nb = -999; nb += qs.filter(q => q.cod).length; } T('château : 5 épreuves d\'accord sur 25', nb===100, nb);
  run = {mode:'region', regionId:'plaines'}; let nm = 0, tot = 0; for (let k=0;k<40;k++){ const qs = moonPool(); tot += qs.length; nm += qs.filter(q => q.cod).length; } T('lune : 1 à 2 épreuves d\'accord sur 5', tot===200 && nm>=40 && nm<=80, nm+'/'+tot);
  run = {mode:'region', regionId:'profondeurs'}; T('lune des Profondeurs : accord seulement', moonPool().every(q => q.cod));
  const qm = moonPool()[0]; const ds = distractors(qm); T('choix de la lune', ds.length===3 && !ds.includes(qm.a[0]) && new Set(ds).size===3, qm.a[0]+' vs '+ds.join(', ')+' · '+codMoonHtml(qm).replace(/<[^>]+>/g,''));
  const qp = mkCod(COD_DATA[0], 'que', 'mp'); T('pris : distracteurs', distractors(qp).length===3, qp.a[0]+' vs '+distractors(qp).join(', '));
  run = null;
  // Révision et accueil : un type de piège raté
  S.cod = {'que|fs|a':{w:2,r:0,s:0,t:1}};
  renderHome(); T('accueil : erreur d\'accord à revoir', $('#chip-review').textContent.startsWith('1 ') && !$('#btn-review').disabled, $('#chip-review').textContent);
  const rv = buildQuestions('review'); T('révision : épreuves d\'accord', rv.filter(q => q.cod).length===2 && rv.filter(q => q.cod).every(q => q.cod.key==='que|fs|a'), rv.length+' dont '+rv.filter(q => q.cod).length);
  renderBook(); T('carnet : section Profondeurs', $('#b-verbs').textContent.includes('Les Profondeurs') && $('#b-errs').textContent.includes('Accord du participe') && !!$('#b-rule'));
  renderGlobalBook(); T('hub : étoiles', $('#gb-rows').textContent.includes('2/27'), $('#gb-rows').textContent.slice(0,80));
  // Château réel : une épreuve d'accord se joue en deux gestes et blesse Ganondorf
  startRun('boss','chateau'); const bi = run.qs.findIndex(q => q.cod); run.i = bi; renderGame(); renderQuestion();
  T('château : geste demandé', $('#form-answer').hidden && !$('#cod-step').hidden); const hp = run.bossHp; tap('cod'); submit(run.qs[bi].a[0]); T('château : accord réussi', run.res[bi]==='ok' && run.bossHp===hp-1);
  next(); const ni = run.qs.findIndex((q,i) => i>=run.i && !q.cod); run.i = ni; renderGame(); renderQuestion(); T('château : épreuve normale ensuite', $('#cod-step').hidden && !$('#form-answer').hidden && !$('#qcard .sentence').classList.contains('cod') && !$('#q-subj').querySelector('.tap'));
  $('#btn-quit').click(); $('#btn-quit').click(); T('abandon du château', !run);
  // Lune de sang réelle sur une épreuve d'accord
  run = {mode:'region', regionId:'profondeurs', qs:[], i:0, hearts:5, rupees:0, combo:0, best:0, res:[], errors:[], rewind:0, phase:'moon', correct:0, moonAt:-1, moonDone:true};
  moon = {qs: moonPool(), i:0, rupees:0, lost:0, errors:0, t0:0, timer:null, test:false, guard:null}; $('#moon').hidden = false; moonQuestion();
  const mq = moon.qs[0], before = (S.cod[mq.cod.key]||{r:0}).r; T('lune : phrase et 4 choix', document.querySelectorAll('#moon .choices button').length===4 && !!document.querySelector('#moon .sentence.cod'), $('#moon .sentence').textContent.replace(/\s+/g,' '));
  moonAnswer(mq.a[0]); T('lune : bonne réponse comptée', S.cod[mq.cod.key].r===before+1 && $('#moon-msg').className.includes('ok'));
  moon.i = 0; moon.timer = 1; moonAnswer('zzz'); T('lune : erreur listée', run.errors.length===1 && run.errors[0].cod && codErrLi(run.errors[0]).includes('choisi'));
  const errLi = run.errors.length; run = null; closeMoon(); S.cod = {'que|fs|a':{w:2,r:0,s:0,t:1}};
  // Sans étoile : rien dans le château ni la lune ; autre univers : jamais
  S.regions.profondeurs.stars = 0; T('sans étoile : château intact', buildQuestions('boss','chateau').every(q => !q.cod));
  S.regions.profondeurs.stars = 2; switchWorld('pqp', true); T('autre univers : château intact', buildQuestions('boss','chateau').every(q => !q.cod) && !card());
  // Fusion : S.cod voyage avec le monde
  const m = mergeRoot(NEW_ROOT(), JSON.parse(JSON.stringify(ROOT))); T('fusion conserve les Profondeurs', !!m.profiles[P.id].worlds.pc.cod && m.profiles[P.id].worlds.pc.codTuto===true);
  T('sans erreur JS', !document.body.getAttribute('data-err'), document.body.getAttribute('data-err')||'');
}catch(e){ out.push('FAIL exception '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' / ')); }
document.body.setAttribute('data-test', out.join(' || '));
}, 1500);
