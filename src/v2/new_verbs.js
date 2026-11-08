// Verbes ajoutés pour les nouveaux univers : la maison d'être, les pronominaux réguliers, le e muet du futur, les -guer, se taire.
N.etreAux = "Verbe du 1er groupe tout simple au présent. Aux temps composés, il se conjugue avec être : je suis tombé, elle est arrivée.";
N.pronom = "Verbe pronominal : le pronom change avec la personne → je me lave, tu te laves, il se lave, nous nous lavons.";
N.uer = "Verbe en -uer : au présent rien de spécial (je continue, nous continuons), mais au futur le e muet reste : je continuerai.";
N.guer = "Verbe en -guer : le u reste partout, même devant a et o → nous naviguons, je naviguais.";
N.taire = "se taire : je me tais, il se tait (sans accent circonflexe, contrairement à il plaît), nous nous taisons.";
"arriver entrer rentrer rester monter retourner".split(' ').forEach(v => add('plaines',1,v,er(v.slice(0,-2)),N.etreAux));
"continuer saluer".split(' ').forEach(v => add('plaines',1,v,er(v.slice(0,-2)),N.uer));
"se réveiller,se laver,se coucher,se dépêcher".split(',').forEach(v => add('plaines',1,v,er(v.slice(3,-2)),N.pronom,{refl:1}));
"naviguer fatiguer".split(' ').forEach(v => add('eldin',1,v,er(v.slice(0,-2)),N.guer));
add('gerudo',3,'se taire','tais,tais,tait,taisons,taisez,taisent',N.taire,{refl:1});
