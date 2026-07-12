import{EdgeTTS}from'node-edge-tts';import fs from'node:fs';const dir=new URL('../video-full/voice/',import.meta.url);fs.mkdirSync(dir,{recursive:true});
const s=[
`Waste2Cash réunit administrateurs, fournisseurs et acheteurs dans trois espaces sécurisés.`,
`Nous évitons que des invendus consommables expirent faute de débouchés rapides.`,
`L’administrateur filtre les lots et les classe automatiquement par urgence.`,
`L’IA combine expiration, vente probable, distance et capacité pour recommander.`,
`Après validation, le produit rejoint immédiatement la marketplace avec son prix.`,
`Nos commissions sur chaque transaction réussie constituent notre principal revenu.`,
`La carte optimise les distances, les délais et les coûts logistiques.`,
`Les prévisions anticipent six mois de volumes et de capacités.`,
`Nos clients sont enseignes, grossistes, revendeurs et plateformes de livraison.`,
`Chaque enseigne retrouve ses performances, collectes et lots actifs.`,
`Socofrais déclare le produit, la quantité, l’expiration, la commune et la photo.`,
`La déclaration apparaît aussitôt et reste synchronisée jusqu’à la vente.`,
`L’import CSV détecte les colonnes, les doublons et les erreurs automatiquement.`,
`L’acheteur reçoit des recommandations selon sa ville, son budget et ses préférences.`,
`La fiche détaille quantité, décote et prix IA avant la commande.`,
`La commande retire le stock du catalogue et active son suivi.`,
`L’administrateur valide puis expédie ; l’acheteur voit immédiatement le statut.`,
`Notre force : prévision, vente et logistique réunies dans une solution locale.`,
`Waste2Cash transforme les pertes en revenus, repas sauvés et carbone évité.`,
`Un modèle rentable pour étendre l’impact à toute la Côte d’Ivoire. Merci.`];
const t=new EdgeTTS({voice:'fr-FR-DeniseNeural',lang:'fr-FR',outputFormat:'audio-24khz-96kbitrate-mono-mp3',rate:'+5%',pitch:'-2Hz',volume:'+0%',timeout:30000});for(let i=0;i<s.length;i++){await t.ttsPromise(s[i],new URL(`${String(i+1).padStart(2,'0')}.mp3`,dir).pathname.slice(1));console.log(`Voix ${i+1}/20`)}
