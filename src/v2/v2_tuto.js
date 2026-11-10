/* =========================================================
   VISITE GUIDÉE : au premier lancement, puis via « ❓ Visite guidée » dans le hub.
   Chaque étape montre le vrai écran (hub, accueil) avec la zone concernée éclairée,
   ou une maquette (épreuve, Lune de sang) quand l'écran demande une partie en cours.
   ========================================================= */
const MOCK = {
  quest: () => `<div class="qcard"><div class="qhead"><span>Épreuve 1 / 10</span><span class="badges"><span class="badge tense">🌅 Présent</span></span></div>
    <div class="sentence"><span class="subj">Link</span><span class="blank">&nbsp;</span><span class="rest">l'épée dans le coffre.</span></div><div class="verbline">Verbe : <b>prendre</b></div>
    <div class="mock-input">prend<span class="caret"></span></div>
    <div class="mock-hearts hearts">${Array.from({length:5}, (_, i) => HEART.replace('<svg', `<svg class="${i<4?'':'off'}"`)).join('')}</div></div>`,
  moon: () => `<div class="moon-panel"><div class="moon-hud"><span>🌕 1 / 5</span><span class="hearts">${Array.from({length:5}, () => HEART).join('')}</span><span class="tabular" style="color:var(--rupee)">+30 rubis</span></div>
    <div class="timer"><i style="width:62%"></i></div>
    <div class="sentence"><span class="subj">Nous</span><span class="blank">&nbsp;</span><span class="rest">le Lynel argenté.</span></div><div class="verbline">Verbe : <b>craindre</b></div>
    <div class="choices"><button type="button" disabled>craindons</button><button type="button" disabled class="good">craignons</button><button type="button" disabled>craignions</button><button type="button" disabled>crainons</button></div></div>`
};
const TUTO = [
  {mock:'quest', icon:'⚔️', title:'Bienvenue à Hyrule !', text:"À chaque épreuve, une phrase a un trou : écris le verbe bien conjugué, puis valide. Chaque bonne réponse rapporte des <b>rubis</b>. Tu as <b>5 cœurs</b> : une erreur en coûte un, le Sage t'explique la règle et tu recopies la bonne forme pour la retenir."},
  {screen:'hub', target:'#uni-grid', icon:'🌌', title:'Les univers', text:"Chaque temps de conjugaison est un <b>univers</b> : présent, futur, imparfait… Ils sont classés par classe, du CM1 à la 4e. Touche un univers pour y entrer ; tu peux en changer quand tu veux."},
  {screen:'home', target:'.hero .hud', icon:'💎', title:'Ton héros', text:"Dans chaque univers tu as tes propres <b>rubis</b>, <b>lueurs</b> et <b>cœurs</b>. Les rubis font monter ton <b>rang</b>, d'Apprenti à Légende. Le sélecteur tout en haut permet de changer d'univers, « Tous les univers » ramène ici."},
  {screen:'home', target:'#map', icon:'🗺️', title:"La carte d'Hyrule", text:"Huit <b>régions</b>, chacune avec ses verbes. Gagne une étoile dans une région pour ouvrir la suivante, jusqu'au <b>Château</b> où t'attend Ganondorf. Trois étoiles par région : sans faute, c'est la troisième."},
  {screen:'home', target:'#sage-card', icon:'✦', title:'Le Sage et les lueurs', text:"Le Sage se souvient de tes erreurs et te les fait retravailler dans la <b>Révision du Sage</b>. Une partie sans faute t'offre une <b>lueur bienfaisante</b> : avec 4 lueurs, tu gagnes un cœur de plus pour toujours."},
  {mock:'moon', icon:'🌕', title:'La Lune de sang', text:"Parfois, en pleine partie, la <b>Lune de sang</b> se lève : 5 questions à choix, très rapides. Touche la bonne forme avant la fin de la barre rouge pour gagner des rubis bonus. Trop lent ou faux : un cœur perdu ! Jamais pendant le Château."},
  {screen:'hub', target:'#save-card', icon:'💾', title:'Sauvegarder', text:"Ta progression se garde toute seule sur cet appareil. Pour continuer sur un autre téléphone ou ordinateur : <b>Copier un code</b> ici, <b>Coller un code</b> là-bas (ou un fichier). Les deux progressions se fusionnent, rien n'est jamais perdu."}
];
let tourI = 0, tourOn = false;
function openTuto(){ if (run) return; tourI = 0; tourOn = true; $('#tour').hidden = false; tourStep(); }
function closeTuto(){ tourOn = false; $('#tour').hidden = true; if (!ROOT.tuto){ ROOT.tuto = true; save(); } }
function tourStep(){
  const s = TUTO[tourI], last = tourI===TUTO.length-1, layer = $('#tour'), panel = $('#tour-panel');
  if (s.screen && screen!==s.screen){ if (s.screen==='hub'){ renderHub(); show('hub'); } else { renderHome(); show('home'); } }
  $('#tour-icon').textContent = s.icon; $('#tour-title').textContent = s.title; $('#tour-text').innerHTML = s.text;
  $('#tour-dots').innerHTML = TUTO.map((_, i) => `<i class="${i===tourI?'on':''}"></i>`).join('');
  $('#tour-next').textContent = last ? "C'est parti !" : 'Suivant'; $('#tour-prev').hidden = tourI===0; $('#tour-skip').hidden = last;
  const mock = $('#tour-mock'); mock.hidden = !s.mock; mock.innerHTML = s.mock ? MOCK[s.mock]() : '';
  layer.classList.toggle('dim', !s.target); panel.classList.toggle('center', !s.target); $('#tour-spot').hidden = !s.target;
  panel.scrollTop = 0;
  if (s.target){ placeSpot(true); requestAnimationFrame(() => placeSpot(false)); setTimeout(() => placeSpot(false), 60); }
}
function placeSpot(scroll){
  const s = TUTO[tourI]; if (!tourOn || !s || !s.target) return;
  const el = document.querySelector(s.target), spot = $('#tour-spot'); if (!el){ spot.hidden = true; return; }
  const pad = 8, top0 = 12, maxBottom = $('#tour-panel').getBoundingClientRect().top - 10;
  if (scroll){ const r0 = el.getBoundingClientRect(); const room = maxBottom - top0; const want = r0.height + 2*pad < room ? top0 + (room - r0.height)/2 : top0 + pad; window.scrollBy({top: r0.top - want, behavior:'auto'}); }
  const r = el.getBoundingClientRect(), top = r.top - pad, bottom = Math.min(r.bottom + pad, maxBottom);
  spot.hidden = bottom - top < 24;
  Object.assign(spot.style, {left: (r.left - pad)+'px', top: top+'px', width: (r.width + 2*pad)+'px', height: Math.max(0, bottom - top)+'px'});
}
addEventListener('scroll', () => placeSpot(false), {passive:true}); addEventListener('resize', () => placeSpot(false));
$('#tour-next').addEventListener('click', () => { SFX.click(); if (tourI < TUTO.length-1){ tourI++; tourStep(); } else { SFX.heart(); closeTuto(); } });
$('#tour-prev').addEventListener('click', () => { SFX.click(); if (tourI > 0){ tourI--; tourStep(); } });
$('#tour-skip').addEventListener('click', () => { SFX.click(); closeTuto(); });
$('#btn-tuto').addEventListener('click', () => { SFX.click(); openTuto(); });
