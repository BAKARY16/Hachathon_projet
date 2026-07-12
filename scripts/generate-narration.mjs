import { EdgeTTS } from 'node-edge-tts';
import fs from 'node:fs';
const dir=new URL('../video-assets/voice/',import.meta.url);fs.mkdirSync(dir,{recursive:true});
const scenes=[
 `Bienvenue sur Waste2Cash. Le tableau de bord résume les volumes collectés, le taux de valorisation, le temps de traitement et l’impact environnemental du réseau.`,
 `Ces indicateurs proviennent de quinze mille observations. Cette vue explique les formules utilisées et calcule la moyenne des invendus ainsi que la meilleure fenêtre de rotation.`,
 `Dans Stock et Matching, chaque lot est classé selon son urgence. Les filtres permettent de cibler une catégorie, une commune ou une enseigne précise.`,
 `L’intelligence artificielle recommande le partenaire le plus adapté. Une confirmation suffit pour mettre à jour le lot et lancer sa prise en charge opérationnelle.`,
 `Les prévisions anticipent les volumes d’invendus sur six mois. Elles aident les équipes à préparer les capacités de stockage et les besoins logistiques.`,
 `La page Partenaires centralise les principales enseignes d’Abidjan, avec leur capacité utilisée, leurs volumes moyens, leur localisation et leur satisfaction.`,
 `En ouvrant Socofrais, on accède à ses indicateurs, son historique de collecte et ses lots actifs, avec les mêmes outils de filtrage avancé.`,
 `L’espace fournisseurs permet de déclarer rapidement un invendu, sa quantité, son expiration et son lieu de collecte, puis de suivre son statut en temps réel.`,
 `Enfin, la page Impact transforme les résultats en repas sauvés, émissions évitées et familles touchées. Waste2Cash réunit performance économique et impact durable.`
];
const tts=new EdgeTTS({voice:'fr-FR-DeniseNeural',lang:'fr-FR',outputFormat:'audio-24khz-96kbitrate-mono-mp3',rate:'-3%',pitch:'-2Hz',volume:'+0%',timeout:30000});
for(let i=0;i<scenes.length;i++){const file=new URL(`${String(i+1).padStart(2,'0')}.mp3`,dir);await tts.ttsPromise(scenes[i],file.pathname.slice(1));console.log(`Voix ${i+1}/9 créée`)}
