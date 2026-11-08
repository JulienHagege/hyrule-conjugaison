setTimeout(async () => { const out = []; const T = (tag, cond, extra) => out.push((cond?'OK ':'FAIL ')+tag+(extra!==undefined?' → '+extra:''));
try{
  // Démarrage sans profil : le modal du nom crée le héros et mène au hub
  T('boot sans profil : modal', !P && !$('#modal-name').hidden && screen==='hub');
  settleModal(); $('#inp-name').value = 'Hugo'; $('#btn-name').click();
  T('héros créé', P && P.name==='Hugo' && screen==='hub' && $('#modal-name').hidden && Object.keys(ROOT.profiles).length===1);
  // Partie complète au passé composé, Plaines, toutes bonnes réponses
  switchWorld('pc'); startRun('region','plaines'); run.moonAt = -1; // pas de lune pour ce test
  const n = run.qs.length; let i = 0;
  while (run && run.phase==='ask' && i<40){ const q = run.qs[run.i]; $('#inp').value = q.a[0]; $('#form-answer').dispatchEvent(new Event('submit', {cancelable:true})); if (run.phase!=='fb'){ out.push('FAIL réponse refusée : '+q.a[0]+' / '+$('#fb').textContent.slice(0,80)); break; } next(); i++; }
  T('sanctuaire pc terminé', screen==='result' && run.correct===n && S.regions.plaines && S.regions.plaines.stars===3 && S.lueurs===1, `${run.correct}/${n} rubis=${S.rupees} sub=${$('#r-sub').textContent}`);
  T('présent intact', !P.worlds.present || prog(P.worlds.present)===0);
  T('quête du jour sur le profil', P.daily.c===n);
  // Mauvaise réponse à l'imparfait → erreur mémorisée dans la famille, note du Sage adaptée, révision
  switchWorld('imparfait'); startRun('region','eldin'); run.moonAt = -1;
  const q0 = run.qs[0]; $('#inp').value = 'xxx'; $('#form-answer').dispatchEvent(new Event('submit', {cancelable:true}));
  T('erreur comptée', run.phase==='retype' && item(q0.v,q0.p).w===1 && run.hearts===maxHearts()-1 && $('#fb .sage').textContent.includes('Imparfait'), $('#fb .sage').textContent.slice(0,100));
  $('#inp-retype').value = q0.a[0]; retypeCheck(); T('recopie acceptée', run.i===1 && run.phase==='ask');
  // réponse presque juste (accent)
  const q1 = run.qs[1]; $('#inp').value = deacc(q1.a[0]); $('#form-answer').dispatchEvent(new Event('submit', {cancelable:true}));
  T('presque (accent)', run.res[1]==='mid' && $('#fb .big').textContent.includes('accent'), $('#fb .big').textContent);
  $('#btn-quit').click(); $('#btn-quit').click(); T('abandon', screen==='home' && !run);
  T('révision disponible imparfait', weakList().length>=1 && !$('#btn-review').disabled);
  startRun('review'); T('révision 15', run.qs.length===15 && run.qs.every(q => q.t==='imparfait' && q.a.length), run.qs.map(q => q.a[0]).join(', '));
  $('#btn-quit').click(); $('#btn-quit').click();
  // Impératif : trait d'union manquant = presque
  switchWorld('imperatif'); startRun('region','eldin'); run.moonAt = -1;
  const qr = run.qs.find(q => VERBS[q.m].refl) || null; if (qr){ run.i = run.qs.indexOf(qr); renderGame(); renderQuestion(); $('#inp').value = qr.a[0].replace('-', ' '); $('#form-answer').dispatchEvent(new Event('submit', {cancelable:true})); T('presque (trait d\'union)', run.res[run.i]==='mid' && $('#fb .big').textContent.includes('trait'), qr.a[0]+' / '+$('#fb .big').textContent); } else out.push('SKIP pas de pronominal tiré');
  T('impératif sans sujet', $('#q-subj').textContent.startsWith('(') && $('#q-rest').textContent.trim().endsWith('!'));
  $('#btn-quit').click(); $('#btn-quit').click();
  // Lune de sang au plus-que-parfait
  switchWorld('pqp'); startRun('region','gerudo'); run.moonAt = -1; startMoon();
  await new Promise(r => setTimeout(r, 4200));
  const panel = $('#moon .moon-panel'); const ch = [...document.querySelectorAll('#moon .choices button')].map(b => b.dataset.c);
  T('lune pqp affichée', !!panel && ch.length===4 && new Set(ch).size===4 && ch.every(c => / /.test(c)), ch.join(' | '));
  const mq = moon.qs[0]; moonAnswer(mq.a[0]); await new Promise(r => setTimeout(r, 1300));
  T('lune réponse juste', moon.i===1 && moon.rupees>0 && run.errors.length===0);
  closeMoon(); $('#btn-quit').click(); $('#btn-quit').click();
  // Château au futur : questions et pondération ne plantent pas
  switchWorld('futur'); const bq = buildQuestions('boss','chateau'); T('château futur', bq.length===25 && bq.every(q => q.a.length), bq.slice(0,8).map(q => VERBS[q.m].v+':'+q.a[0]).join(', '));
  // Tous les univers : une partie construite sans erreur dans chaque région
  const probs = []; for (const t of TENSES){ switchWorld(t.id, false); for (const R of REGIONS){ try{ const qs = buildQuestions(R.boss?'boss':'region', R.id); if (qs.length!==R.n || qs.some(q => !q.a.length)) probs.push(t.id+'/'+R.id+':'+qs.length); }catch(e){ probs.push(t.id+'/'+R.id+':'+e.message); } } }
  T('15 univers × 8 régions', probs.length===0, probs.join(' '));
  T('sans erreur JS', !document.body.getAttribute('data-err'));
}catch(e){ out.push('EXCEPTION '+e.message+' '+(e.stack||'').split('\n')[1]); }
document.body.setAttribute('data-test', out.join(' || '));
}, 400);
