setTimeout(async () => { const out = []; const T = (tag, cond, extra) => out.push((cond?'OK ':'FAIL ')+tag+(extra!==undefined?' → '+extra:''));
const wait = ms => new Promise(r => setTimeout(r, ms));
try{
  T('pas de visite sans héros', $('#tour').hidden);
  settleModal(); $('#inp-name').value = 'Hugo'; $('#btn-name').click(); await wait(50);
  T('visite ouverte au premier héros', !$('#tour').hidden && screen==='hub' && $('#tour-title').textContent.includes('Bienvenue') && !$('#tour-mock').hidden && $('#tour-mock .qcard'), $('#tour-title').textContent);
  $('#tour-next').click(); await wait(80);
  const sp = $('#tour-spot').getBoundingClientRect();
  T('univers : hub éclairé', screen==='hub' && !$('#tour-spot').hidden && sp.width>100 && sp.height>50 && $('#tour-mock').hidden, Math.round(sp.width)+'x'+Math.round(sp.height));
  $('#tour-next').click(); await wait(80);
  T('héros : écran accueil', screen==='home' && !$('#home').hidden && $('#tour-title').textContent==='Ton héros');
  $('#tour-next').click(); await wait(80);
  const r = $('#map').getBoundingClientRect(), s2 = $('#tour-spot').getBoundingClientRect(), pt = $('#tour-panel').getBoundingClientRect().top;
  T('carte éclairée au-dessus du panneau', Math.abs(s2.left - (r.left-8))<2 && s2.top>=0 && s2.bottom<=pt && s2.height>100, `spot ${Math.round(s2.top)}→${Math.round(s2.bottom)} panneau ${Math.round(pt)}`);
  $('#tour-next').click(); await wait(80); T('sage éclairé', $('#tour-title').textContent.startsWith('Le Sage') && !$('#tour-spot').hidden);
  $('#tour-next').click(); await wait(80); T('lune : maquette', !$('#tour-mock').hidden && document.querySelector('#tour-mock .moon-panel') && document.querySelectorAll('#tour-mock .choices button').length===4 && $('#tour-spot').hidden);
  $('#tour-next').click(); await wait(80); T('sauvegarde : retour hub', screen==='hub' && $('#tour-title').textContent==='Sauvegarder' && $('#tour-next').textContent.startsWith("C'est parti") && $('#tour-skip').hidden);
  $('#tour-prev').click(); await wait(50); T('précédent', $('#tour-title').textContent==='La Lune de sang'); $('#tour-next').click(); await wait(50);
  $('#tour-next').click(); T('fermée et mémorisée', $('#tour').hidden && ROOT.tuto===true && JSON.parse(localStorage.getItem('legende-temps-v2')).tuto===true);
  $('#btn-tuto').click(); await wait(50); T('rejouable depuis le hub', !$('#tour').hidden && $('#tour-title').textContent.includes('Bienvenue')); $('#tour-skip').click(); T('passer ferme', $('#tour').hidden);
  T('sans erreur JS', !document.body.getAttribute('data-err'));
}catch(e){ out.push('EXCEPTION '+e.message+' '+(e.stack||'').split('\n')[1]); }
document.body.setAttribute('data-test', out.join(' || ')); }, 500);
