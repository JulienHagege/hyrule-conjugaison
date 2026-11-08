/* =========================================================
   SYNCHRO ENTRE APPAREILS (compte claude.ai, espace privé par personne) : la sauvegarde complète (tous les héros, tous les univers) est fusionnée.
   ========================================================= */
let DBREF = null, cloudTimer = null, cloudWriting = false, cloudDirty = false;
function setSync(state, text){ const c = $('#sync-chip'); if (!c) return; c.textContent = text; c.style.color = state==='ok' ? 'var(--zonai)' : state==='err' ? 'var(--danger)' : 'var(--muted)'; }
function adoptRoot(root){
  ROOT = root; bind();
  try{ localStorage.setItem(KEY, JSON.stringify(ROOT)); }catch(e){}
  if (P) $('#modal-name').hidden = true;
  if (screen==='home') renderHome(); else if (screen==='book') renderBook(); else if (screen==='hub') renderHub();
}
async function cloudPull(){
  if (!DBREF) return;
  const snap = await DBREF.get();
  if (snap.exists && snap.data().state){
    const remote = normRoot(snap.data().state);
    const merged = mergeRoot(ROOT, remote);
    const changedHere = rootSig(merged)!==rootSig(ROOT), changedThere = rootSig(merged)!==rootSig(remote);
    if (changedHere) adoptRoot(merged);
    if (changedThere){ cloudDirty = true; await cloudFlush(); }
    return changedHere ? 'pulled' : changedThere ? 'pushed' : 'same';
  }
  cloudDirty = true; await cloudFlush(); return 'created';
}
async function cloudFlush(){
  if (!DBREF || cloudWriting || !cloudDirty) return;
  cloudWriting = true; cloudDirty = false;
  try{ await DBREF.set({state:ROOT, updated:ROOT.updated||Date.now(), v:2}); setSync('ok', '☁️ Synchronisé'); }
  catch(e){
    // Un invité (lien public, autre compte) peut lire la page mais pas écrire : on reste en sauvegarde locale, sans réessayer en boucle.
    if (e && (e.code==='invalid_argument' || e.code==='not_granted' || e.code==='revoked' || e.code==='quota_exceeded')){ DBREF = null; cloudDirty = false; setSync('off', '☁️ Sauvegarde locale'); }
    else { cloudDirty = true; setSync('err', '☁️ Synchro en attente'); }
  }
  finally{ cloudWriting = false; if (cloudDirty) setTimeout(cloudFlush, 2500); }
}
function cloudSave(){ if (!DBREF) return; cloudDirty = true; clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudFlush, 1500); }
async function initCloud(){
  if (!window.claude || typeof window.claude.use!=='function'){ settleModal(); return; }
  try{
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user){ settleModal(); return; }
    const id = await user.id(); if (!id){ settleModal(); return; }
    DBREF = db.doc('data/users/'+id+'/save');
    const r = await cloudPull();
    setSync('ok', '☁️ Synchronisé');
    if (r==='pulled') toast('☁️ Progression récupérée depuis ton autre appareil');
  }catch(e){ console.warn('synchro', e); setSync('err', '☁️ Synchro indisponible'); }
  finally{ settleModal(); }
}
// Au retour sur l'onglet, hors partie en cours, on reprend la version la plus récente.
document.addEventListener('visibilitychange', () => { if (document.hidden){ cloudFlush(); } else if (DBREF && !run){ cloudPull().catch(()=>{}); } });
addEventListener('pagehide', () => { cloudFlush(); });

/* =========================================================
   DÉMARRAGE
   ========================================================= */
load();
function boot(data){
  if (data && data.run && data.run.qs){ run = data.run; show('game'); renderGame(); renderQuestion(); }
  else if (P) { renderHome(); show('home'); }
  else { renderHub(); show('hub'); }
  if (!P){ $('#modal-name').hidden = false; $('#modal-msg').textContent = 'Recherche d\'une sauvegarde sur ton compte…'; $('#modal-form').hidden = true; }
}
let cloudSettled = false;
function settleModal(){ if (cloudSettled) return; cloudSettled = true; if (P){ $('#modal-name').hidden = true; return; } $('#modal-msg').textContent = 'Comment s\'appelle le héros ?'; $('#modal-form').hidden = false; $('#inp-name').focus(); }
setTimeout(settleModal, 8000);
if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({run}));
(window.claude && window.claude.hot && window.claude.hot.ready) ? window.claude.hot.ready(boot) : boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
initCloud();
