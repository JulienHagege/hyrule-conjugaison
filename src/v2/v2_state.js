/* =========================================================
   ÉTAT, SAUVEGARDE : un profil par héros, un monde (= un univers, un temps) par profil. S pointe sur le monde actif, P sur le profil.
   ========================================================= */
const KEY = 'legende-temps-v2', KEY_V1 = 'hyrule-conj-v1';
// Statistiques d'usage (GoatCounter), uniquement sur la version publique GitHub Pages : le script n'existe pas dans l'artifact, donc no-op ici.
function track(name){ try{ if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({path:name, title:name, event:true}); }catch(e){} }
// Journal de la dernière erreur technique : affiché dans la zone parents du Carnet, pour diagnostiquer à distance.
function logErr(e, where){
  try{
    const msg = e && e.message ? e.message : String(e || 'erreur');
    const st = e && e.stack ? String(e.stack).split('\n').slice(0,2).join(' ').replace(/https?:\S+/g, '') : '';
    ROOT.lastErr = {m: (msg+' '+st).replace(/\s+/g,' ').trim().slice(0,320), t: Date.now(), where: where || (typeof run!=='undefined' && run ? run.mode+'/'+run.phase : (typeof screen==='string' ? screen : '?')), ua: navigator.userAgent.slice(0,90)};
    console.error(e); save();
  }catch(_){}
}
window.addEventListener('error', e => logErr(e.error || e.message));
window.addEventListener('unhandledrejection', e => logErr(e.reason));
const DEFAULT = () => ({ rupees:0, lueurs:0, bonusHearts:0, items:{}, regions:{}, tot:{r:0,w:0}, moonRuns:0, bossWins:0, updated:0 });
const NEW_PROFILE = name => ({ id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), name:name||'', created:Date.now(), updated:Date.now(), daily:{d:'',c:0,done:false}, unlockAll:false, worlds:{} });
const NEW_ROOT = () => ({ v:2, profiles:{}, deleted:{}, active:null, world:'present', sound:true, music:true, tuto:false, updated:0 });
let ROOT = NEW_ROOT(), P = null, S = DEFAULT(), TENSE = 'present';
const famHead = name => FAM_OF[name] || name;
// Les statistiques par verbe de l'ancienne version sont fusionnées dans leur famille.
function remapItems(items){
  const out = {};
  for (const k in items||{}){
    const [v,p] = k.split('|'); const head = famHead(v); if (!BY_VERB[head]) continue;
    const it = items[k], nk = head+'|'+p, cur = out[nk];
    if (!cur) out[nk] = Object.assign({w:0,r:0,s:0,t:0}, it);
    else { cur.w += it.w||0; cur.r += it.r||0; if ((it.t||0) >= (cur.t||0)){ cur.s = it.s||0; cur.t = it.t||0; } }
  }
  return out;
}
// Ancienne sauvegarde (un seul héros, le présent) → un profil « main » avec un monde « present ». Même identifiant sur tous les appareils, pour que la synchro les fusionne.
function migrateV1(old){
  const w = Object.assign(DEFAULT(), old); ['name','sound','music','unlockAll','daily','lastErr','v'].forEach(k => delete w[k]);
  if (w.lueurs==null) w.lueurs = w.koroks||0; w.items = remapItems(w.items);
  const prof = NEW_PROFILE(old.name||''); prof.id = 'main'; prof.created = old.updated||Date.now(); prof.updated = old.updated||0; prof.daily = old.daily||prof.daily; prof.unlockAll = !!old.unlockAll; prof.worlds = {present:w};
  return Object.assign(NEW_ROOT(), {profiles:{main:prof}, active:'main', sound: old.sound!==false, music: old.music!==false, lastErr: old.lastErr, updated: old.updated||0});
}
function normRoot(r){
  if (!r || typeof r!=='object') return NEW_ROOT();
  if (!r.profiles) r = migrateV1(r);
  const out = Object.assign(NEW_ROOT(), r); out.profiles = out.profiles||{}; out.deleted = out.deleted||{};
  for (const pid in out.profiles){ const p = Object.assign(NEW_PROFILE(''), out.profiles[pid]); p.id = pid; p.worlds = p.worlds||{}; for (const w in p.worlds) p.worlds[w] = Object.assign(DEFAULT(), p.worlds[w]); out.profiles[pid] = p; }
  return out;
}
const prog = x => ((x.tot&&x.tot.r)||0) + ((x.tot&&x.tot.w)||0);
// Jamais une sauvegarde vide ou moins avancée n'écrase une sauvegarde plus avancée : une remise à zéro volontaire plus récente l'emporte,
// sinon le nombre de réponses jouées décide, la date en dernier recours.
function pickWorld(a, b){
  const bReset = (b.resetAt||0) > (a.updated||0), aReset = (a.resetAt||0) > (b.updated||0);
  if (bReset && !aReset) return b; if (aReset && !bReset) return a;
  if (prog(a)!==prog(b)) return prog(a)>prog(b) ? a : b;
  return (b.updated||0) > (a.updated||0) ? b : a;
}
// Fusion de deux sauvegardes complètes (synchro, fichier chargé) : profil par profil, monde par monde. Le profil et l'univers actifs restent ceux d'ici.
function mergeRoot(a, b){
  const out = normRoot(JSON.parse(JSON.stringify(a))); b = normRoot(JSON.parse(JSON.stringify(b)));
  for (const pid in b.deleted) out.deleted[pid] = Math.max(out.deleted[pid]||0, b.deleted[pid]);
  for (const pid in b.profiles){
    const pb = b.profiles[pid], pa = out.profiles[pid];
    if (!pa){ out.profiles[pid] = pb; continue; }
    if ((pb.updated||0) > (pa.updated||0)){ pa.name = pb.name||pa.name; pa.unlockAll = pb.unlockAll; pa.updated = pb.updated; }
    const da = pa.daily||{d:'',c:0}, db = pb.daily||{d:'',c:0}; if (db.d > da.d || (db.d===da.d && db.c > da.c)) pa.daily = pb.daily;
    for (const wid in pb.worlds) pa.worlds[wid] = pa.worlds[wid] ? pickWorld(pa.worlds[wid], pb.worlds[wid]) : pb.worlds[wid];
  }
  for (const pid in out.deleted){ const p = out.profiles[pid]; if (p && out.deleted[pid] > (p.updated||0) && !Object.values(p.worlds).some(w => (w.updated||0) > out.deleted[pid])) delete out.profiles[pid]; }
  if ((b.updated||0) > (a.updated||0)){ out.sound = b.sound; out.music = b.music; if (b.lastErr) out.lastErr = b.lastErr; }
  return out;
}
function rootProg(r){ let n = 0; for (const pid in r.profiles) for (const w in r.profiles[pid].worlds) n += prog(r.profiles[pid].worlds[w]); return n; }
function profProg(p){ let n = 0; for (const w in p.worlds) n += prog(p.worlds[w]); return n; }
const rootSig = r => JSON.stringify(Object.assign({}, r, {active:null, world:null, updated:0}));
// Rattache S et P au profil et à l'univers actifs (crée le monde s'il n'existe pas encore)
let _famCount = {};
function bind(){
  const ids = Object.keys(ROOT.profiles);
  if (!ROOT.active || !ROOT.profiles[ROOT.active]) ROOT.active = ids[0] || null;
  if (!TENSE_BY[ROOT.world]) ROOT.world = 'present';
  TENSE = ROOT.world; _famCount = {};
  P = ROOT.active ? ROOT.profiles[ROOT.active] : null;
  if (P){ if (!P.worlds[TENSE]) P.worlds[TENSE] = DEFAULT(); S = P.worlds[TENSE]; } else S = DEFAULT();
}
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if (raw) ROOT = normRoot(JSON.parse(raw));
    else { const old = localStorage.getItem(KEY_V1); if (old) ROOT = migrateV1(JSON.parse(old)); }
  }catch(e){ console.warn(e); ROOT = NEW_ROOT(); }
  bind();
}
function save(){ const now = Date.now(); S.updated = now; ROOT.updated = now; try{ localStorage.setItem(KEY, JSON.stringify(ROOT)); }catch(e){} cloudSave(); }
const today = () => new Date().toISOString().slice(0,10);
function itemKey(v,p){ return famHead(VERBS[v].v)+'|'+p; }
function item(v,p){ const k = itemKey(v,p); return S.items[k] || (S.items[k] = {w:0,r:0,s:0,t:0}); }
function isWeak(it){ return it.w>0 && it.s<2; }
const REVIEW_N = 15;
// Erreurs passées pas encore solides (moins de 4 réussites d'affilée) : la révision les consolide quand il n'y a plus d'erreur en attente.
function consolidateList(){ return Object.entries(S.items).filter(([k,it]) => it.w>0 && it.s<4 && BY_VERB[k.split('|')[0]]).map(([k,it]) => { const [v,p] = k.split('|'); return {v:BY_VERB[v].id, p:+p, it}; }); }
function weakList(){ return Object.entries(S.items).filter(([k,it]) => isWeak(it) && BY_VERB[k.split('|')[0]]).map(([k,it]) => { const [v,p] = k.split('|'); return {v:BY_VERB[v].id, p:+p, it}; }); }

// Calibré pour qu'une trentaine de sanctuaires (ou 5 châteaux) mènent au rang Légende.
const RANKS = [[0,'Apprenti'],[300,'Écuyer'],[800,'Chevalier'],[1600,'Champion'],[2800,'Sage'],[4500,"Héros d'Hyrule"],[7000,'Légende']];
function rank(r){ let cur = RANKS[0], next = null; for (const x of RANKS){ if (r>=x[0]) cur = x; else { next = x; break; } } return {cur,next}; }

function regionUnlocked(i){
  if ((P && P.unlockAll) || i===0) return true;
  const R = REGIONS[i];
  if (R.boss) return REGIONS.slice(0,-1).every(r => (S.regions[r.id]||{}).stars>=1);
  return (S.regions[REGIONS[i-1].id]||{}).stars>=1;
}
// Maîtrise d'une famille : 0 = jamais vue · 1 = une erreur reste à corriger · 2 = maîtrisée (réussie au moins une fois, aucune erreur en attente) · 3 = dorée (4 réussites et 90 %)
function verbMastery(v){
  let r=0,w=0,weak=false;
  for (let p=0;p<6;p++){ const it = S.items[itemKey(v.id,p)]; if(it){ r+=it.r; w+=it.w; if (isWeak(it)) weak=true; } }
  if (!r && !w) return 0;
  if (weak || !r) return 1;
  if (r>=4 && r/(r+w)>=.9) return 3;
  return 2;
}
const cousinsOf = V => FAMILIES[famHead(V.v)].filter(x => x!==famHead(V.v));

/* ---------- Sauvegarde : fichier et code à copier, pour changer d'appareil ---------- */
// Dans l'artifact claude.ai, le téléchargement passe par la capacité « downloads » (le viewer demande confirmation) ; ailleurs, un lien Blob classique.
async function downloadSave(){
  const name = ((P && P.name) || 'heros').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w-]/g,'_');
  const filename = `legende-des-temps-${name}-${today()}.json`, data = JSON.stringify(ROOT);
  if (window.claude && typeof window.claude.use==='function'){
    const dl = await window.claude.use('downloads');
    if (dl){ await dl.save({filename, data}); return 'saved'; }
  }
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  return 'saved';
}
function b64(u8){ let s = ''; for (let i=0;i<u8.length;i+=0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i+0x8000)); return btoa(s); }
function unb64(s){ const b = atob(s); const u = new Uint8Array(b.length); for (let i=0;i<b.length;i++) u[i] = b.charCodeAt(i); return u; }
async function encodeSave(){
  const s = JSON.stringify(ROOT);
  try{ if (window.CompressionStream){ const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(s)); w.close(); const buf = await new Response(cs.readable).arrayBuffer(); return 'LT1.'+b64(new Uint8Array(buf)); } }catch(e){}
  return 'LT0.'+b64(new TextEncoder().encode(s));
}
async function decodeSave(code){
  code = String(code||'').trim();
  if (code.startsWith('{')) return JSON.parse(code);
  const m = /^LT([01])\.([A-Za-z0-9+/=]+)$/.exec(code.replace(/\s+/g,''));
  if (!m) throw new Error('Ce code ne ressemble pas à une sauvegarde.');
  const bytes = unb64(m[2]);
  if (m[1]==='0') return JSON.parse(new TextDecoder().decode(bytes));
  const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); w.write(bytes); w.close();
  return JSON.parse(await new Response(ds.readable).text());
}
// Charge une sauvegarde (objet v1 ou v2) en la fusionnant avec celle d'ici. Un héros vide créé ici par défaut s'efface devant un héros importé du même nom.
function importRoot(obj){
  const incoming = normRoot(obj), before = rootProg(ROOT);
  const merged = mergeRoot(ROOT, incoming);
  const ids = Object.keys(merged.profiles);
  for (const pid of ids){ const p = merged.profiles[pid]; if (!profProg(p) && ids.length>1 && ids.some(o => o!==pid && (merged.profiles[o].name||'').toLowerCase()===(p.name||'').toLowerCase() && profProg(merged.profiles[o]))) delete merged.profiles[pid]; }
  if (!merged.profiles[merged.active]) merged.active = incoming.active && merged.profiles[incoming.active] ? incoming.active : Object.keys(merged.profiles)[0];
  ROOT = merged; bind(); save();
  return rootProg(ROOT) - before;
}
