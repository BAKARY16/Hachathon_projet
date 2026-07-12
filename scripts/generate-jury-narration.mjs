import { EdgeTTS } from 'node-edge-tts';import fs from 'node:fs';
const dir=new URL('../video-jury/voice/',import.meta.url);fs.mkdirSync(dir,{recursive:true});
const scenes=[
`Bienvenue sur Waste2Cash, la plateforme ivoirienne qui transforme les invendus alimentaires en valeur économique, sociale et environnementale.`,
`Chaque jour, des produits encore consommables expirent faute d’anticipation et de débouchés. Waste2Cash intervient avant cette perte.`,
`L’administrateur voit chaque lot, son urgence et le partenaire recommandé, puis valide en un clic le routage proposé.`,
`Nos clients sont les supermarchés fournisseurs, puis les grossistes, revendeurs et plateformes de livraison qui recherchent des stocks abordables.`,
`Le fournisseur déclare ses surplus, ajoute une photo, importe un fichier et suit chaque lot jusqu’à sa valorisation.`,
`Notre IA prévoit les volumes, calcule l’urgence, recommande un prix réduit et choisit le meilleur débouché selon la demande et la distance.`,
`Les acheteurs découvrent des produits à prix optimisé, reçoivent des recommandations personnalisées et commandent directement depuis la marketplace.`,
`Notre revenu vient d’une commission sur les transactions réussies, complétée demain par des abonnements de prévision et de pilotage pour les enseignes.`,
`Le back-office mesure le chiffre d’affaires, la conversion, la précision des prix et optimise les flux logistiques entre fournisseurs et clients.`,
`Notre avantage : réunir prévision, prix dynamique, matching, logistique et impact dans une solution locale unique.`,
`Le réseau intègre les principales enseignes d’Abidjan, avec leurs capacités, leurs besoins et leurs performances suivis en temps réel.`,
`Waste2Cash réduit le gaspillage, soutient les familles et évite des émissions. Chaque kilo valorisé devient une opportunité.`
];
const tts=new EdgeTTS({voice:'fr-FR-DeniseNeural',lang:'fr-FR',outputFormat:'audio-24khz-96kbitrate-mono-mp3',rate:'-1%',pitch:'-2Hz',volume:'+0%',timeout:30000});
for(let i=0;i<scenes.length;i++){await tts.ttsPromise(scenes[i],new URL(`${String(i+1).padStart(2,'0')}.mp3`,dir).pathname.slice(1));console.log(`Narration ${i+1}/12`)}
