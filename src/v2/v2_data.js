
// Familles : un verbe tête et ses cousins qui se conjuguent pareil (même modèle à tous les temps). Les statistiques, la révision
// et le Carnet raisonnent par famille ; les cousins sont montrés à tour de rôle. Un verbe absent d'ici est sa propre famille.
const FAMILIES = {
  crier:['oublier','étudier'], tomber:['arriver','entrer','rentrer','rester','monter','retourner'], 'se réveiller':['se laver','se coucher','se dépêcher'], continuer:['saluer'],
  manger:['nager','ranger','voyager','partager','plonger','bouger','changer'], protéger:['piéger'], lancer:['avancer','commencer','placer','effacer','remplacer','annoncer'],
  appeler:['rappeler'], épeler:['étinceler'], jeter:['rejeter','projeter'], acheter:['racheter'], geler:['peler','congeler'], lever:['enlever','soulever'], mener:['emmener','promener'],
  préférer:['espérer','répéter','compléter','exagérer','accélérer'], posséder:['régler','sécher','inquiéter'], payer:['essayer','balayer','effrayer'], employer:['nettoyer','aboyer'], envoyer:['renvoyer'], essuyer:['appuyer','ennuyer'], naviguer:['fatiguer'],
  partir:['repartir','sortir'], sentir:['ressentir','mentir'], venir:['revenir','devenir','prévenir'], tenir:['obtenir','retenir','appartenir'], courir:['parcourir'], ouvrir:['offrir','couvrir','découvrir','souffrir'], cueillir:['accueillir'],
  prendre:['apprendre','comprendre','surprendre'], attendre:['entendre','vendre','rendre','défendre','répondre'], perdre:['mordre','tordre','descendre'], rompre:['interrompre'], mettre:['permettre','promettre'], battre:['combattre'],
  connaître:['paraître','disparaître','apparaître'], lire:['relire'], écrire:['décrire'], rire:['sourire'], peindre:['éteindre','atteindre'], craindre:['plaindre'], joindre:['rejoindre'], conduire:['construire','traduire','cuire','détruire','produire'], interdire:['prédire','contredire'],
  voir:['revoir'], recevoir:['apercevoir','décevoir'],
  faire:['refaire','défaire','satisfaire','parfaire','contrefaire'], dire:['redire'], vaincre:['convaincre']
};
const FAM_OF = {}; for (const h in FAMILIES){ FAMILIES[h] = [h, ...FAMILIES[h]]; FAMILIES[h].forEach(m => { FAM_OF[m] = h; }); }
VERBS.forEach(V => { if (!FAM_OF[V.v]){ FAM_OF[V.v] = V.v; FAMILIES[V.v] = [V.v]; } });
const HEADS = VERBS.filter(V => FAM_OF[V.v]===V.v);
const PERSON_LABEL = ['je','tu','il / elle','nous','vous','ils / elles'];
// Sujets : g = genre (m, f, x = les deux acceptés), n = nombre (s, p, x = les deux). Sert à l'accord du participe avec être.
const SUBJECTS = [
  [{t:'je',g:'x',n:'s'}], [{t:'tu',g:'x',n:'s'}],
  [{t:'il',g:'m',n:'s'},{t:'elle',g:'f',n:'s'},{t:'on',g:'m',n:'x'},{t:'Link',g:'m',n:'s'},{t:'Zelda',g:'f',n:'s'},{t:'Purah',g:'f',n:'s'},{t:'Tulin',g:'m',n:'s'},{t:'Sidon',g:'m',n:'s'},{t:'Riju',g:'f',n:'s'},{t:'le Korogu',g:'m',n:'s'},{t:'Ganondorf',g:'m',n:'s'}],
  [{t:'nous',g:'x',n:'p'},{t:'Link et moi',g:'m',n:'p'},{t:'Zelda et moi',g:'x',n:'p'}],
  [{t:'vous',g:'x',n:'x'},{t:'Zelda et toi',g:'x',n:'p'},{t:'Tulin et toi',g:'m',n:'p'}],
  [{t:'ils',g:'m',n:'p'},{t:'elles',g:'f',n:'p'},{t:'Link et Zelda',g:'m',n:'p'},{t:'les Korogus',g:'m',n:'p'},{t:'les Bokoblins',g:'m',n:'p'},{t:'les Sages',g:'m',n:'p'},{t:'Purah et Impa',g:'f',n:'p'},{t:'les Zoras',g:'m',n:'p'}]
];
