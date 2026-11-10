/* =========================================================
   TUTORIEL : cinq étapes au premier lancement, rejouable depuis le hub
   ========================================================= */
const TUTO = [
  {icon:'⚔️', title:'Bienvenue à Hyrule !', text:"Tu es un héros d'Hyrule. À chaque épreuve, une phrase a un trou : écris le verbe bien conjugué, puis valide. Chaque bonne réponse rapporte des <b>rubis</b>. Tu as <b>5 cœurs</b> : une erreur en coûte un, le Sage t'explique la règle et tu recopies la bonne forme pour la retenir."},
  {icon:'🌌', title:'Les univers', text:"Chaque temps de conjugaison est un <b>univers</b> : le présent, le futur, l'imparfait… Dans chaque univers, une carte d'Hyrule avec <b>8 régions</b> : gagne une étoile dans une région pour ouvrir la suivante, jusqu'au <b>Château</b> de Ganondorf. Tu changes d'univers avec le sélecteur en haut de l'écran, ou depuis « Tous les univers »."},
  {icon:'✦', title:'Le Sage et les lueurs', text:"Le Sage se souvient de tes erreurs et te les fait retravailler dans la <b>Révision du Sage</b>. Une partie sans faute t'offre une <b>lueur bienfaisante</b> : avec 4 lueurs, tu gagnes un cœur de plus pour toujours. Le <b>Carnet du Sage</b> montre les verbes que tu maîtrises."},
  {icon:'🌕', title:'La Lune de sang', text:"Parfois, en pleine partie, la <b>Lune de sang</b> se lève : 5 questions à choix, très rapides. Choisis la bonne forme avant la fin du compte à rebours pour gagner des rubis bonus. Trop lent ou faux : un cœur perdu ! Elle ne se lève jamais pendant le Château."},
  {icon:'💾', title:'Sauvegarder', text:"Ta progression se garde toute seule sur cet appareil. Pour continuer sur un autre téléphone ou ordinateur : « Tous les univers » puis <b>Sauvegarde</b> : « Copier un code » ici, « Coller un code » là-bas (ou un fichier). Les deux progressions se fusionnent, rien n'est jamais perdu."}
];
let tutoI = 0;
function openTuto(){ tutoI = 0; renderTuto(); $('#modal-tuto').hidden = false; }
function closeTuto(){ $('#modal-tuto').hidden = true; if (!ROOT.tuto){ ROOT.tuto = true; save(); } }
function renderTuto(){
  const s = TUTO[tutoI], last = tutoI===TUTO.length-1;
  $('#tuto-icon').textContent = s.icon; $('#tuto-title').textContent = s.title; $('#tuto-text').innerHTML = s.text;
  $('#tuto-dots').innerHTML = TUTO.map((_, i) => `<i class="${i===tutoI?'on':''}"></i>`).join('');
  $('#tuto-next').textContent = last ? "C'est parti !" : 'Suivant'; $('#tuto-prev').hidden = tutoI===0; $('#tuto-skip').hidden = last;
}
$('#tuto-next').addEventListener('click', () => { SFX.click(); if (tutoI < TUTO.length-1){ tutoI++; renderTuto(); } else { SFX.heart(); closeTuto(); } });
$('#tuto-prev').addEventListener('click', () => { SFX.click(); if (tutoI > 0){ tutoI--; renderTuto(); } });
$('#tuto-skip').addEventListener('click', () => { SFX.click(); closeTuto(); });
$('#btn-tuto').addEventListener('click', () => { SFX.click(); openTuto(); });
