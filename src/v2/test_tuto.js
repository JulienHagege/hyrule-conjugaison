setTimeout(() => { const out = []; const T = (tag, cond, extra) => out.push((cond?'OK ':'FAIL ')+tag+(extra!==undefined?' → '+extra:''));
try{
  settleModal(); $('#inp-name').value = 'Hugo'; $('#btn-name').click();
  T('tuto ouvert au premier héros', !$('#modal-tuto').hidden && screen==='hub' && $('#tuto-title').textContent.includes('Bienvenue'));
  T('passer caché seulement à la fin', !$('#tuto-skip').hidden && $('#tuto-prev').hidden);
  for (let i=0;i<4;i++) $('#tuto-next').click();
  T('dernière étape', $('#tuto-title').textContent==='Sauvegarder' && $('#tuto-next').textContent.startsWith("C'est parti") && $('#tuto-skip').hidden && !$('#tuto-prev').hidden, $('#tuto-text').textContent.slice(0,60));
  $('#tuto-prev').click(); T('précédent', $('#tuto-title').textContent==='La Lune de sang');
  $('#tuto-next').click(); $('#tuto-next').click();
  T('fermé et mémorisé', $('#modal-tuto').hidden && ROOT.tuto===true && JSON.parse(localStorage.getItem('legende-temps-v2')).tuto===true);
  $('#btn-tuto').click(); T('rejouable depuis le hub', !$('#modal-tuto').hidden && $('#tuto-title').textContent.includes('Bienvenue')); $('#tuto-skip').click(); T('passer ferme', $('#modal-tuto').hidden);
  const h = $('#modal-tuto .card').getBoundingClientRect(); T('tient dans l\'écran', h.height < innerHeight, Math.round(h.height)+'/'+innerHeight);
}catch(e){ out.push('EXCEPTION '+e.message); }
document.body.setAttribute('data-test', out.join(' || ')); }, 500);
