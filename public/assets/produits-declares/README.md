# Images des produits déclarés par les fournisseurs

Ce dossier regroupe les images associées aux produits déclarés sur la plateforme Fournisseurs.

- `<categorie>.jpg` : image par défaut utilisée quand une déclaration n'a pas de photo
  (`fruits-legumes.jpg`, `produits-laitiers.jpg`, `boulangerie.jpg`, `epicerie-seche.jpg`, `viande-poisson.jpg`, `surgeles.jpg`).
- Les photos téléversées via le formulaire « Déclarer un stock d'invendus » sont compressées
  côté client (≤ 520 px, JPEG) et persistées dans la base locale partagée (`localStorage`,
  clé `w2c-db-v1`) avec la déclaration — la démo fonctionne 100 % sans backend, le navigateur
  ne pouvant pas écrire directement dans un dossier du disque. En production, l'endpoint
  `POST /produits` stockerait ces fichiers ici sous le nom `<id-declaration>.jpg`.

Une déclaration validée par l'administrateur (« Valider le routage ») est automatiquement
publiée sur la marketplace avec son image.
