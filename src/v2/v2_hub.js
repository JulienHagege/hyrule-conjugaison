/* =========================================================
   HUB : les univers (un par temps), les héros, la sauvegarde, le Carnet des Temps
   ========================================================= */
const LEVEL_LABEL = {CM1:'CM1 · les bases', CM2:'CM2', '6e':'6e', '5e':'5e', '4e':'4e', '3e':'3e', 'Lycée':'Lycée et grands récits'};
const homeScene = () => IMG['home_'+TENSE] ? 'home_'+TENSE : 'home';
function switchWorld(tid, go){ if (!TENSE_BY[tid]) return; ROOT.world = tid; bind(); save(); track('univers-'+tid); if (go!==false){ renderHome(); show('home'); } }
function switchProfile(pid){ if (!ROOT.profiles[pid]) return; ROOT.active = pid; bind(); save(); renderHub(); }
function worldSummary(w){
  if (!w) return null;
  const stars = REGIONS.reduce((n,R) => n + ((w.regions[R.id]||{}).stars||0), 0);
  return {stars, max: REGIONS.length*3, rank: rank(w.rupees||0).cur[1], rupees: w.rupees||0, lueurs: w.lueurs||0, tot: prog(w), ok: (w.tot&&w.tot.r)||0, wins: w.bossWins||0};
}
function renderHub(){
  $('#hub-name').textContent = P ? (P.name||'Link') : 'Link';
  const grid = $('#uni-grid'); grid.innerHTML = '';
  let lastLvl = null;
  TENSES.forEach(T => {
    if (T.lvl!==lastLvl){ lastLvl = T.lvl; const h = document.createElement('div'); h.className = 'uni-lvl'; h.textContent = LEVEL_LABEL[T.lvl]||T.lvl; grid.appendChild(h); }
    const w = P && P.worlds[T.id], s = worldSummary(w);
    const b = document.createElement('button'); b.className = 'uni' + (T.id===TENSE ? ' cur' : ''); b.style.setProperty('--c', T.color);
    if (IMG['home_'+T.id]) b.style.backgroundImage = `linear-gradient(180deg, rgba(10,19,32,.25) 0%, rgba(10,19,32,.7) 55%, rgba(10,19,32,.96) 100%), url(${IMG['home_'+T.id]})`;
    b.innerHTML = `<div class="uni-head"><span class="uni-icon">${T.icon}</span><span class="uni-mood">${T.mood}</span></div><h3>${T.name}</h3><p>${T.desc}</p>`
      + (s && s.tot ? `<div class="uni-stats"><span>★ ${s.stars}/${s.max}</span><span>${esc(s.rank)}</span><span class="rup">${s.rupees} rubis</span>${s.wins?'<span>👑</span>':''}</div>` : `<div class="uni-stats"><span class="new-u">Jamais exploré</span></div>`);
    b.addEventListener('click', () => { SFX.click(); switchWorld(T.id); });
    grid.appendChild(b);
  });
  const profs = Object.values(ROOT.profiles).sort((a,b) => (a.created||0)-(b.created||0));
  const pl = $('#prof-list');
  pl.innerHTML = profs.map(p => { let stars = 0; for (const w in p.worlds) stars += worldSummary(p.worlds[w]).stars; const n = Object.keys(p.worlds).filter(w => prog(p.worlds[w])).length;
    return `<div class="prof ${p.id===ROOT.active?'cur':''}"><button type="button" class="prof-pick" data-id="${p.id}"><b>${esc(p.name||'Link')}</b><span>${profProg(p)} réponses · ★ ${stars} · ${n} univers explorés</span></button>${profs.length>1 ? `<button type="button" class="btn ghost prof-del" data-id="${p.id}" title="Supprimer ce héros">🗑️</button>` : ''}</div>`; }).join('');
  pl.querySelectorAll('.prof-pick').forEach(b => b.addEventListener('click', () => { SFX.click(); switchProfile(b.dataset.id); }));
  pl.querySelectorAll('.prof-del').forEach(b => b.addEventListener('click', () => {
    const p = ROOT.profiles[b.dataset.id]; if (!p) return;
    if (b.dataset.armed!=='1'){ b.dataset.armed = '1'; b.textContent = 'Supprimer ?'; b.classList.add('danger'); setTimeout(() => { b.dataset.armed = ''; b.textContent = '🗑️'; b.classList.remove('danger'); }, 3000); return; }
    ROOT.deleted[p.id] = Date.now(); delete ROOT.profiles[p.id]; if (ROOT.active===p.id) ROOT.active = null; bind(); save(); renderHub(); toast(`Le héros « ${p.name||'Link'} » a quitté Hyrule.`);
  }));
  renderGlobalBook();
  $('#hub-sound').textContent = ROOT.sound ? '🔊 Son' : '🔇 Son coupé';
  $('#hub-music').textContent = ROOT.music!==false ? '🎵 Musique' : '🎵 Musique coupée'; $('#hub-music').disabled = !ROOT.sound;
}
function renderGlobalBook(){
  const rows = []; let R = 0, W = 0, ru = 0, lu = 0, st = 0;
  TENSES.forEach(T => { const w = P && P.worlds[T.id]; if (!w || !prog(w)) return; const s = worldSummary(w); R += s.ok; W += s.tot-s.ok; ru += s.rupees; lu += s.lueurs; st += s.stars;
    rows.push(`<tr><td>${T.icon} <b>${T.name}</b></td><td class="n tabular">${s.tot}</td><td class="n tabular">${s.tot?Math.round(s.ok/s.tot*100):0} %</td><td class="n tabular">${s.stars}/${s.max}</td><td>${esc(s.rank)}</td><td class="n tabular">${s.rupees}</td></tr>`); });
  $('#gb-stats').innerHTML = `<div class="stat"><b class="tabular">${R+W}</b><span>réponses</span></div><div class="stat"><b class="tabular">${R+W?Math.round(R/(R+W)*100):0} %</b><span>réussite</span></div><div class="stat"><b class="tabular">${st}</b><span>étoiles</span></div><div class="stat"><b class="tabular">${ru}</b><span>rubis</span></div><div class="stat"><b class="tabular">${lu}</b><span>lueurs</span></div><div class="stat"><b class="tabular">${rows.length}/${TENSES.length}</b><span>univers explorés</span></div>`;
  $('#gb-rows').innerHTML = rows.length ? rows.join('') : '<tr><td colspan="6" style="color:var(--muted)">Aucun univers exploré pour l\'instant. Choisis un temps ci-dessus !</td></tr>';
}
function saveMsg(txt, ok){ const m = $('#save-msg'); m.textContent = txt; m.style.color = ok ? 'var(--zonai)' : 'var(--danger)'; }
async function importFromText(txt){
  try{ const obj = await decodeSave(txt); const gained = importRoot(obj); renderHub(); SFX.heart(); saveMsg(gained>0 ? `Sauvegarde chargée : ${gained} réponses de plus dans l'aventure.` : 'Sauvegarde chargée et fusionnée (rien de nouveau par rapport à ici).', true); toast('💾 Sauvegarde chargée'); }
  catch(e){ console.warn(e); saveMsg('Impossible de lire cette sauvegarde : ' + (e && e.message || e), false); }
}
$('#btn-hub').addEventListener('click', () => { SFX.click(); renderHub(); show('hub'); });
$('#sel-tense').addEventListener('change', e => { SFX.click(); switchWorld(e.target.value); });
$('#hub-sound').addEventListener('click', () => { ROOT.sound = !ROOT.sound; save(); renderHub(); if (ROOT.sound) SFX.ok(); AMB.sync(); });
$('#hub-music').addEventListener('click', () => { ROOT.music = ROOT.music===false; save(); renderHub(); SFX.click(); AMB.sync(); });
$('#btn-newprof').addEventListener('click', () => { const n = $('#inp-newprof').value.trim(); if (!n){ $('#inp-newprof').focus(); return; } const p = NEW_PROFILE(n); ROOT.profiles[p.id] = p; ROOT.active = p.id; $('#inp-newprof').value = ''; bind(); save(); track('nouveau-heros'); SFX.heart(); renderHub(); toast(`Bienvenue à Hyrule, ${n} !`); });
$('#inp-newprof').addEventListener('keydown', e => { if (e.key==='Enter') $('#btn-newprof').click(); });
$('#btn-export').addEventListener('click', async () => { SFX.click(); try{ await downloadSave(); saveMsg('Fichier enregistré. Sur l\'autre appareil, ouvre le jeu puis « Charger un fichier ».', true); }catch(e){ saveMsg(e && e.code==='declined' ? 'Enregistrement annulé.' : 'Impossible d\'enregistrer le fichier ici : utilise « Copier un code ».', false); } });
$('#inp-import').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (!f) return; f.text().then(importFromText); e.target.value = ''; });
$('#btn-code').addEventListener('click', async () => { SFX.click(); const code = await encodeSave(); const box = $('#paste-box'); box.hidden = false; $('#ta-code').value = code;
  try{ await navigator.clipboard.writeText(code); saveMsg(`Code copié (${code.length} caractères). Colle-le dans « Coller un code » sur l'autre appareil.`, true); }catch(e){ $('#ta-code').select(); saveMsg('Le code est affiché ci-dessous : sélectionne-le et copie-le.', true); } });
$('#btn-paste').addEventListener('click', () => { SFX.click(); const box = $('#paste-box'); box.hidden = !box.hidden; if (!box.hidden){ $('#ta-code').value = ''; $('#ta-code').focus(); } });
$('#btn-paste-ok').addEventListener('click', () => { const t = $('#ta-code').value.trim(); if (!t){ saveMsg('Colle d\'abord un code.', false); return; } importFromText(t); });
