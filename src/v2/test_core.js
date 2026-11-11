setTimeout(async () => { const out = []; const T = (tag, cond, extra) => out.push((cond?'OK ':'FAIL ')+tag+(extra!==undefined?' → '+extra:''));
try{
  // A. migration d'une sauvegarde v1
  const old = {name:'Hugo', rupees:1234, lueurs:5, bonusHearts:1, sound:true, music:false, items:{'comprendre|2':{w:2,r:1,s:0,t:100}, 'prendre|2':{w:1,r:4,s:3,t:200}, 'chanter|0':{w:0,r:3,s:3,t:50}, 'disparu|1':{w:1,r:0,s:0,t:1}}, regions:{plaines:{stars:3,plays:4,best:10}}, daily:{d:'2026-11-08',c:5,done:false}, tot:{r:80,w:12}, unlockAll:true, moonRuns:1, bossWins:1, updated:300};
  const R1 = migrateV1(JSON.parse(JSON.stringify(old)));
  const w = R1.profiles.main.worlds.present;
  T('migration profil', R1.active==='main' && R1.profiles.main.name==='Hugo' && R1.profiles.main.unlockAll===true && R1.profiles.main.daily.c===5);
  T('migration monde', w.rupees===1234 && w.lueurs===5 && w.bonusHearts===1 && w.regions.plaines.stars===3 && w.tot.r===80 && w.bossWins===1, JSON.stringify(w).slice(0,120));
  T('items fusionnés en famille', w.items['prendre|2'] && w.items['prendre|2'].w===3 && w.items['prendre|2'].r===5 && w.items['prendre|2'].s===3 && !w.items['comprendre|2'] && w.items['chanter|0'] && !w.items['disparu|1'], JSON.stringify(w.items));
  T('réglages globaux', R1.sound===true && R1.music===false);
  // B. fusion de deux sauvegardes
  const R2 = JSON.parse(JSON.stringify(R1)); R2.profiles.main.worlds.futur = Object.assign(DEFAULT(), {rupees:50, tot:{r:5,w:0}, updated:400}); R2.profiles.main.worlds.present.tot = {r:90,w:12}; R2.profiles.main.worlds.present.rupees = 1500; R2.profiles.main.worlds.present.updated = 500;
  R2.profiles.p2 = Object.assign(NEW_PROFILE('Meryl'), {id:'p2', worlds:{present:Object.assign(DEFAULT(), {tot:{r:3,w:1}})}});
  const M = mergeRoot(R1, R2);
  T('fusion : univers ajouté', M.profiles.main.worlds.futur && M.profiles.main.worlds.futur.rupees===50);
  T('fusion : monde le plus avancé gagne', M.profiles.main.worlds.present.rupees===1500 && M.profiles.main.worlds.present.tot.r===90);
  T('fusion : profil ajouté', M.profiles.p2 && M.profiles.p2.name==='Meryl');
  const R3 = JSON.parse(JSON.stringify(M)); delete R3.profiles.p2; R3.deleted = {p2: Date.now()+1000};
  const M2 = mergeRoot(M, R3); T('fusion : suppression propagée', !M2.profiles.p2);
  // Adopter R1 comme état courant
  ROOT = normRoot(R1); bind(); $('#modal-name').hidden = true;
  T('bind présent', TENSE==='present' && S.rupees===1234 && P.name==='Hugo');
  renderHome(); T('accueil présent', $('#h-tense').textContent==='Présent' && $('#h-rupees').textContent==='1234' && $('#sel-tense').options.length===15 && $('#map').children.length===8);
  // C. changement d'univers
  switchWorld('futur'); T('switch futur', TENSE==='futur' && S.rupees===0 && P.worlds.present.rupees===1234 && $('#h-tense').textContent==='Futur simple' && screen==='home');
  let qs = buildQuestions('region','plaines'); T('questions futur plaines', qs.length===10 && qs.every(q => q.t==='futur' && q.a.length && /r(ai|as|a|ons|ez|ont)$/.test(q.a[0])), qs.map(q => VERBS[q.m].v+':'+q.a[0]).join(', '));
  { let ok = true; const keep0 = S.regions, ua0 = P.unlockAll; P.unlockAll = false; S.regions = {}; for (let k=0;k<40;k++){ if (!buildQuestions('region','plaines').every(q => VERBS[q.m].r==='plaines')) ok = false; run = {mode:'region', regionId:'plaines'}; if (!moonPool().every(q => VERBS[q.m].r==='plaines')) ok = false; run = null; } S.regions = keep0; P.unlockAll = ua0; T('plaines : uniquement ses verbes (sanctuaire et Lune de sang)', ok); }
  { const keep = S.regions, ua = P.unlockAll; P.unlockAll = false; const mr = () => { const set = new Set(); for (let k=0;k<60;k++) moonPool().forEach(q => set.add(VERBS[q.m].r)); return [...set].sort().join(','); };
    S.regions = {plaines:{stars:1,plays:1,best:8}, foret:{stars:1,plays:1,best:8}}; run = {mode:'region', regionId:'plaines'}; const a = mr(); run = {mode:'review'}; const b = mr();
    S.regions = {}; run = {mode:'review'}; const c = mr(); run = null; S.regions = keep; P.unlockAll = ua;
    T('lune : régions débloquées du temps en cours', a==='eldin,foret,plaines' && b===a && c==='plaines', a+' / '+b+' / '+c); }
  T('familles : tête ≠ cousin possible', qs.every(q => famHead(VERBS[q.m].v)===VERBS[q.v].v));
  qs = buildQuestions('region','eldin'); T('futur eldin pièges', qs.some(q => /(ll|tt|è|ie)r/.test(q.a[0])), qs.map(q => q.a[0]).join(', '));
  // D. impératif
  switchWorld('imperatif'); qs = buildQuestions('region','zora'); T('impératif personnes', qs.length===12 && qs.every(q => [1,3,4].includes(q.p) && q.a.length), qs.map(q => VERBS[q.m].v+':'+q.p+':'+q.a[0]).join(', '));
  T('impératif affichage', subjDisp(qs[0]).startsWith('(') && endMark().endsWith('!'));
  qs = buildQuestions('region','hebra'); T('impératif : pas d\'impersonnel ni pouvoir', qs.every(q => !VERBS[q.m].imp && VERBS[q.m].v!=='pouvoir'), qs.map(q => VERBS[q.m].v).join(', '));
  const sl = BY_VERB['se lever']; T('impératif pronominal', conj(sl,'imperatif',1)[0]==='lève-toi' && conj(sl,'imperatif',3)[0]==='levons-nous');
  // E. temps composés et accord
  T('accord elle est tombée', conj(BY_VERB['tomber'],'pc',2,{g:'f',n:'s'})[0]==='est tombée');
  T('accord je (les deux)', JSON.stringify(conj(BY_VERB['aller'],'pc',0,{g:'x',n:'s'}))==='["suis allé","suis allée"]');
  T('avoir pas d\'accord', JSON.stringify(conj(BY_VERB['manger'],'pqp',5,{g:'f',n:'p'}))==='["avaient mangé"]');
  T('pronominal composé', conj(BY_VERB['se laver'],'pc',3,{g:'m',n:'p'})[0]==='sommes lavés');
  switchWorld('pc'); const qq = mkQ(BY_VERB['tomber'].id, 2); T('mkQ pc', qq.a.length>=1 && /^(est|a) /.test(qq.a[0]) && FAMILIES.tomber.includes(VERBS[qq.m].v), JSON.stringify(qq));
  // L. sujet et « que »
  switchWorld('subj'); const qa = {v:BY_VERB['aller'].id, m:BY_VERB['aller'].id, p:0, t:'subj', s:'je', g:'x', n:'s', a:conj(BY_VERB['aller'],'subj',0)}; T('que j\'aille', subjectText(qa)==="que j'", subjectText(qa));
  const qi = {v:BY_VERB['venir'].id, m:BY_VERB['venir'].id, p:2, t:'subj', s:'il', g:'m', n:'s', a:conj(BY_VERB['venir'],'subj',2)}; T('qu\'il vienne', subjectText(qi)==="qu'il " && qi.a[0]==='vienne', subjectText(qi));
  const qr = {v:BY_VERB['se lever'].id, m:BY_VERB['se lever'].id, p:2, t:'subj', s:'Zelda', g:'f', n:'s', a:conj(BY_VERB['se lever'],'subj',2)}; T('que Zelda se lève', subjectText(qr)==='que Zelda se ', subjectText(qr));
  // M. normalisation
  T('norm que', norm("qu'il aille")==='aille' && norm("que je chante")==='chante' && norm("j'ai mangé")==='ai mangé' && norm('lève - toi')==='lève-toi' && norm('me suis levé')==='suis levé');
  // notes du Sage par temps
  T('note futur', tenseNote(BY_VERB['appeler'],'futur').includes('appeller'), tenseNote(BY_VERB['appeler'],'futur'));
  T('note pc', tenseNote(BY_VERB['tomber'],'pc').includes('être') && tenseNote(BY_VERB['tomber'],'pc').includes('tombé'), tenseNote(BY_VERB['tomber'],'pc'));
  T('hard par temps', hardAt(BY_VERB['envoyer'],'futur')===true && hardAt(BY_VERB['envoyer'],'imparfait')===true && hardAt(BY_VERB['chanter'],'futur')===false && hardAt(BY_VERB['manger'],'ps')===true && hardAt(BY_VERB['chanter'],'pc')===false && hardAt(BY_VERB['tomber'],'pc')===true);
  T('distraire absent du passé simple', !existsAt(BY_VERB['distraire'],'ps') && existsAt(BY_VERB['distraire'],'pc') && !existsAt(BY_VERB['falloir'],'imperatif'));
  // I. export / import
  const code = await encodeSave(); const back = await decodeSave(code); T('code aller-retour', code.startsWith('LT') && JSON.stringify(normRoot(back))===JSON.stringify(normRoot(ROOT)), code.length+' caractères');
  const other = NEW_ROOT(); const pz = NEW_PROFILE('Zelda'); pz.worlds.ps = Object.assign(DEFAULT(), {tot:{r:7,w:0}, rupees:70}); other.profiles[pz.id] = pz;
  const gained = importRoot(other); T('import ajoute un héros', gained===7 && ROOT.profiles[pz.id] && P.name==='Hugo', gained);
  // J. hub
  renderHub(); show('hub'); T('hub rendu', document.querySelectorAll('#uni-grid .uni').length===15 && document.querySelectorAll('#prof-list .prof').length===2 && $('#gb-rows').children.length>=1, $('#gb-stats').textContent.replace(/\s+/g,' ').slice(0,120));
  $('#inp-newprof').value = 'Meryl'; $('#btn-newprof').click(); T('nouveau héros', P.name==='Meryl' && Object.keys(ROOT.profiles).length===3 && TENSE==='subj');
  switchProfile('main'); T('retour Hugo', P.name==='Hugo' && S===P.worlds[TENSE]);
  // K. carnet
  switchWorld('futur'); renderBook(); show('book'); T('carnet futur', $('#b-title').textContent.includes('Futur') && $('#b-verbs').textContent.includes('appeler'));
  T('sans erreur JS', !document.body.getAttribute('data-err'));
}catch(e){ out.push('EXCEPTION '+e.message+' '+(e.stack||'').split('\n')[1]); }
document.body.setAttribute('data-test', out.join(' || '));
}, 400);
