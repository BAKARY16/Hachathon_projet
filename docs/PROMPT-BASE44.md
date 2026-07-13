# Prompt Base44 — Waste2Cash (copier-coller intégral)

> Copie tout le texte ci-dessous (à partir de « Construis une application… ») dans Base44. Il décrit le projet à l'identique, fonctionnalité par fonctionnalité, y compris les plus petites.

---

Construis une application web complète nommée **Waste2Cash** : une plateforme intelligente de valorisation et de revente des invendus alimentaires en Côte d'Ivoire. L'application est composée de **3 interfaces strictement cloisonnées** (Administrateur, Fournisseur, Marketplace client) accessibles par connexion, d'un **moteur de prix/recommandation IA**, d'une **carte Leaflet**, et d'un **sélecteur de langue Français/Anglais**. Reste fidèle à cette spécification, n'invente rien d'autre.

## 1. Design system (à respecter partout)

- Police **Manrope** (Google Fonts). Fond de page `#f5f7fa`, texte `#17243a`.
- Couleur primaire **bleu `#1f5fbf`**, secondaire **vert `#2e7d32`**, accent orange `#e76b3b` / `#b66528`.
- Cartes blanches, bordure `#e5eaf0`, coins arrondis 12 px, ombre très légère.
- Badges/pastilles arrondies : vert clair `#eef8f0` (texte vert), bleu clair `#eaf1fb` (texte bleu), orange clair `#fff4e9` (texte orange), rouge clair `#fff0ea` (texte `#c5522d`).
- Libellés de sections en petites majuscules espacées, gris `#8b98aa` ; gros chiffres en Manrope 800.
- Logo : icône feuille dans un carré bleu arrondi + « Waste**2**Cash » (le « 2 » en vert).
- Monnaie : **FCFA**, format français (« 1 520 F »), unités « t », « kg », « F/kg ».

## 2. Authentification, rôles et étanchéité

Page de connexion (logo, titre « Connexion à votre espace », email + mot de passe, bouton « Se connecter », message d'erreur si identifiants incorrects) avec une section « COMPTES DE DÉMONSTRATION » : 3 boutons cliquables qui pré-remplissent les champs.

| Rôle | Email | Mot de passe | Redirigé vers |
|---|---|---|---|
| admin | admin@waste2cash.ci | admin123 | Interface Admin |
| fournisseur | fournisseur@socofrais.ci | socofrais123 | Interface Fournisseur |
| client | client@marche.ci | client123 | Marketplace |

Règles strictes : à la connexion, redirection automatique vers l'interface du rôle **uniquement** ; un utilisateur ne peut jamais accéder à une autre interface (toute tentative le renvoie chez lui) ; bouton « Se déconnecter » visible en permanence dans l'en-tête de chaque interface avec l'avatar (initiales), le nom et le rôle de l'utilisateur connecté. Sessions persistantes (rester connecté après rechargement).

## 3. Multilingue FR / EN (obligatoire)

Un **bouton à deux segments « FR | EN »** est présent : sur la page de connexion et dans la barre supérieure des 3 interfaces. Il bascule instantanément **toute l'interface** (menus, titres, boutons, formulaires, statuts, légendes de graphiques, messages) entre français et anglais. Le choix est **mémorisé** (persiste après rechargement et reconnexion). Les données métier (noms de produits, catégories, villes, enseignes) restent inchangées. Langue par défaut : français.

## 4. Modèle de données (avec données de démarrage)

- **Utilisateur** : email, mot de passe, rôle (admin/fournisseur/client), nom, initiales.
- **Produit marketplace** : nom, sous-catégorie, catégorie, état (Frais/Ambiante/Sec/Surgelé), quantité kg, jours avant expiration, enseigne d'origine, ville (Abidjan/Bouaké/Yamoussoukro/San-Pédro/Korhogo), prix initial F/kg, décote IA %, prix IA F/kg, probabilité d'écoulement %, score de recommandation /100, **image réelle du produit** (photo de tomate pour la tomate, etc.).
- **Déclaration fournisseur** : id (DEC-xxxx), produit, catégorie, quantité kg, date d'expiration, commune (Cocody/Marcory/Yopougon/Plateau/Angré), photo (téléversée), statut : `En attente` → `Priorisé par l'IA` → `Matché` → `Collecté`.
- **Commande** : id (CMD-xxxx), articles, total FCFA, ville de livraison, date, statut : `En attente` → `Validée` → `Expédiée`.
- **Lot de collecte** (admin) : id (W2C-xxxx), produit, catégorie, quantité, jours avant expiration, commune, score de priorité IA /100, enseigne recommandée avec % de match et distance km, statut `À confirmer`/`Matché`.
- **Partenaire** : 6 enseignes d'Abidjan — Socofrais (Cocody), Sangel (Marcory), Playce (Plateau), Cap Nord (Angré), Cosmos (Yopougon), Cap Sud (Marcory) — avec capacité utilisée %, demande dominante, distance km, note /5, volume 6 mois, historique mensuel.

Seed produits marketplace (15 produits individuels, chacun avec sa vraie photo) : Tomates fraîches 1 520→680 F (−56 %), Salades fraîches 1 420→610 F (−57 %), Charcuterie 4 560→2 040 F (−55 %), Viande de bœuf 3 890→1 730 F, Pâtisseries 1 950→910 F, Baguettes de pain 1 530→700 F, Poulet fermier 4 120→1 890 F, Fromage 2 310→990 F, Beurre 1 840→770 F, Mangues 1 400→630 F, Croissants 1 400→640 F, Poisson frais 5 530→2 490 F, Noix de cajou 1 180→530 F, Conserves 2 060→960 F, Yaourts nature 1 780→830 F. Expiration 1 à 3 jours, probabilité 55–65 %.

Seed déclarations : Bananes plantain 240 kg (Priorisé par l'IA), Yaourts brassés 85 kg (Matché), Riz en sacs 310 kg (Collecté). Seed commandes : CMD-1041 Riz blanc 180 kg, 136 800 F (Validée) ; CMD-1040 Yaourts nature 120 kg, 98 400 F (Expédiée).

## 5. Interface ADMIN (sidebar sombre-claire à gauche, 6 pages)

Sidebar : logo, bloc « ESPACE DE TRAVAIL — Côte d'Ivoire », menu (Vue d'ensemble, Stock & Matching, Marketplace IA, Prévisions IA, Partenaires, Impact), encart vert « IMPACT CE MOIS — 53,7 t d'invendus valorisés, barre 92 % de l'objectif mensuel », pied « ● Système opérationnel ». En-tête : fil « WASTE2CASH CONTROL CENTER » + titre de page, cloche de notification (pastille orange ; clic → alerte « Aucune nouvelle alerte critique »), avatar « AK Amadou Koné · Administrateur ».

**5.1 Vue d'ensemble** : badge « ● DONNÉES EN DIRECT », « Bonjour Amadou, », sélecteur « Juin 2026 ». 4 KPI : STOCK COLLECTÉ **25,4 t** (+12,5 %), TAUX DE VALORISATION **75,5 %** (+4,2 %), TEMPS MOYEN DE MATCH **61,2 h** (18 % plus rapide), CO₂ ÉVITÉ **266,7 tCO₂e** (+14,1 %) — chaque KPI avec la mention « · données modèle ». Graphique en aires « Performance de collecte » (2 séries : Collecté bleu, Valorisé vert, 6 mois Jan→Juin, ~21–28 t). Barres horizontales « Volume par catégorie » (Fruits & Légumes ~59 t, Produits Laitiers, Épicerie Sèche, Viande & Poisson, Boulangerie, Surgelés). Carte « Activité récente » : 2 lignes (« Lot W2C-2840 valorisé avec succès — 320 kg… Il y a 12 min » ; « Nouveau match IA à 94 % — Il y a 28 min ») + bouton « Voir tout ». En bas : graphique « Moyenne des invendus par catégorie ».

**5.2 Stock & Matching** : « X LOTS À TRAITER », bouton « Lancer le matching automatique » (alerte de confirmation). Barre de filtres : recherche texte + listes Catégorie / Urgence (Urgent, Élevée, Normale) / Commune / Enseigne. Tableau de 12 lots : ID bleu + produit·catégorie, quantité kg, badge expiration coloré (≤1 j rouge, ≤3 j bleu, sinon vert), commune avec épingle, score IA dans un cercle coloré + libellé d'urgence, recommandation « ✨ Enseigne · 93 % match · 35 km », bouton « Confirmer » → devient « ✓ Matché ». État vide : « Aucun lot ne correspond à ces filtres. » Note IA en bas expliquant le score. Sous le tableau : section « Déclarations & plan d'écoulement » — table des déclarations fournisseur avec **vignette photo**, enseigne, stock, débouché suggéré (Marché Adjamé / Yango Delivery / Grossiste Treichville), score/délai, bouton **« Valider le routage »** → statut « Matché » et **publication automatique du produit sur la marketplace**.

**5.3 Marketplace IA** : 4 KPI — CA GÉNÉRÉ PAR LA REVENTE **116 M FCFA / 6 mois**, TAUX DE CONVERSION **75,5 %**, PRÉCISION PRIX IA **87,7 %** (écart moyen 12,3 pts prédit vs réel), DÉLAI DÉPÔT→VENTE **61,2 h**. Graphique barres « Chiffre d'affaires par catégorie » (Viande & Poisson ~31 M en tête). Carte « Commandes marketplace » : file temps réel, bouton « Valider » (En attente→Validée) puis « Marquer expédiée » (→Expédiée), badge vert quand expédiée. **Carte Leaflet** (fond OpenStreetMap/CARTO, centre Côte d'Ivoire, zoom 7) : cercles bleus sur les 5 villes de collecte (taille ∝ volume : Abidjan 67 t, Bouaké 28 t, Yamoussoukro 22 t, San-Pédro 20 t, Korhogo 16 t ; popup volume/CA/km moyen), points verts = clients ayant commandé, **lignes vertes pointillées fournisseur→client avec la distance en km affichée** (ex. Bouaké→Abidjan 283 km), légende + liste des flux sous la carte. Note « Comment le prix IA est-il calculé ? » expliquant la formule (§8).

**5.4 Prévisions IA** : badge « MODÈLE PRÉDICTIF ACTIF », 3 cartes (VOLUME TOTAL PRÉVU 214,6 t +16,8 % ; CATÉGORIE EN HAUSSE Fruits & légumes +24,2 % ; CONFIANCE DU MODÈLE 92,4 % R²), graphique lignes 6 mois (3 séries), encart « La donnée au service de la planification » avec bouton « Consulter la méthodologie », puis « Forecast par enseigne » (aire verte + sélecteur d'enseigne).

**5.5 Partenaires** : bandeau bleu 4 stats (6 enseignes actives · 61 % capacité moyenne · 4,8/5 satisfaction · 5 communes), grille de 6 cartes enseigne (logo initiales, barre de capacité, invendus moyens/mois, distance, étoiles, « Voir le profil »). Clic → **fiche détaillée** : 3 KPI (volume 6 mois, taux de routage, capacité), graphique historique 6 mois, et la liste filtrable de ses lots. Bouton retour.

**5.6 Impact** : héros dégradé bleu « Chaque kilo valorisé nourrit un avenir meilleur. » + cercle « 91,9 % valorisés » ; 4 cartes (REPAS SAUVÉS 428 600 ; CO₂ ÉVITÉ 1 240 tCO₂e ; 24 ORGANISATIONS ; 18 750 FAMILLES) ; section « NOTRE TRAJECTOIRE » 2 paragraphes + bouton « Découvrir notre vision » ; bandeau ODD 2 / 12 / 13.

## 6. Interface FOURNISSEUR (Socofrais)

Barre supérieure : logo, FR|EN, avatar SO « Équipe Socofrais · Fournisseur », Se déconnecter. Titre « Bonjour, équipe Socofrais. » 4 KPI : VOLUME DÉCLARÉ CE MOIS (somme dynamique), TAUX DE REPRISE 94 %, DÉCLARATIONS ACTIVES (compteur), REVENUS GÉNÉRÉS · 6 MOIS 18,9 M F.

**Formulaire « Déclarer un stock d'invendus »** : nom du produit, catégorie (liste), quantité kg, date d'expiration, commune de collecte, **téléversement de photo avec aperçu** (zone en pointillés « Choisir une photo » ; une fois choisie : miniature + « Photo enregistrée — cliquer pour la remplacer » + lien rouge « Retirer »), bouton « Envoyer la déclaration ». La photo est stockée et affichée partout avec la déclaration ; sans photo, une image par défaut de la catégorie est utilisée.

**« Mes déclarations »** : liste avec **vignette photo**, nom, id · catégorie · poids, badge de statut coloré, mention « · en vente sur la marketplace » si Matché, et **bouton « Modifier »** qui recharge le formulaire en mode édition (titre « Modifier la déclaration DEC-xxxx », boutons « Enregistrer les modifications » + « Annuler ») — tous les champs et la photo sont modifiables, les changements se répercutent **immédiatement** sur la marketplace si le produit y est en vente.

**« Import en masse (CSV / Excel) »** : zone de dépôt ; mapping automatique des colonnes (produit, catégorie, quantité, date, commune, en-têtes français ou anglais, séparateur , ou ;) ; contrôles : lignes incomplètes rejetées, doublons ignorés ; rapport en pastilles colorées « X lignes lues · Y déclarations créées · Z doublons ignorés · W lignes incomplètes rejetées · Confiance mapping N % » ; si confiance ≥ 80 % → statut « Priorisé par l'IA » (publication automatique), sinon « En attente » (file de validation).

## 7. Interface MARKETPLACE (client)

Barre supérieure : logo, FR|EN, avatar AD « Awa Diabaté · Espace client », Se déconnecter. Titre « Marketplace des invendus » + badge « ● X LOTS EN VENTE · PRIX RECALCULÉS PAR L'IA » + sous-titre « décote apprise sur 3 690 ventes réelles (55,4 % en moyenne) ».

- **Profil acheteur** (carte) : Localisation (5 villes), Catégorie préférée, Budget max — alimente la recommandation.
- **3 cartes « Recommandé »** : photo, badge « ✨ Match 88 % » (score + bonus +12 si même ville, +15 si catégorie préférée), prix barré → prix IA → badge −%, clic = ajout au panier.
- **Filtres** : recherche, catégorie, ville, budget max (Tous / ≤600 / ≤1 200 / ≤2 500 F).
- **Grille de fiches produit individuelles** : photo réelle, badge catégorie (+ badge orange « Déclaré · validé » pour les produits issus des fournisseurs), nom, badge jours avant expiration + état (Frais…), prix barré / **prix IA en gros** / badge vert −%, « X kg disponibles · lot complet Y F », ligne « ✨ Prédiction IA propre au produit · N lots analysés », bouton « Ajouter au panier » → « ✓ Dans le panier ».
- **Clic sur un produit → boîte de dialogue (modale)** : grande photo, badges, nom, sous-catégorie · réf., grille de faits (ÉTAT, QUANTITÉ DISPONIBLE, EXPIRATION, SCORE RECO IA, PRIX INITIAL, DÉCOTE IA), prix, valeur du lot complet, ligne prédiction, bouton Ajouter au panier, croix de fermeture + clic hors de la modale pour fermer. **La modale ne montre NI la localisation (ville/enseigne) NI la barre de probabilité d'écoulement.**
- **Panier** (colonne collante) : lignes produit (kg × prix, total ligne, croix de retrait), Total, bouton « Valider la commande » (désactivé si vide), note « Suivi en temps réel : En attente → Validée → Expédiée ». À la commande : bannière verte de confirmation, les lots commandés **disparaissent du catalogue** (stock temps réel).
- **« Mes commandes »** : id, date, ville de livraison, produits, total, badge de statut — synchronisé avec la validation admin.

## 8. Moteur IA (formules exactes, déterministes)

- **Décote prédite (par produit)** = moyenne des démarques observées dans l'historique de ce produit précis (sa sous-catégorie), croisée par tranche d'urgence : ≤1 jour / 2–3 jours / 4–7 jours / 8 jours et + (repli sur la catégorie si échantillon insuffisant). **Prix IA = prix initial × (1 − décote)**, arrondi à la dizaine.
- **Précision IA** = 100 − écart absolu moyen (en points) entre décote prédite et démarque finale réelle des ventes ≈ **87,7 %**.
- **Score de recommandation** = 100 × (0,45 × probabilité d'écoulement + 0,35 × 1/(jours+1) + 0,20 × décote/75), plafonné à 99. Bonus profil : +12 même ville, +15 catégorie préférée.
- **Score de priorité des lots (admin)** = 60 % urgence avant expiration + 40 % probabilité d'écoulement.
- **Distances** : formule de haversine entre villes (Abidjan 5.35,-4.02 ; Bouaké 7.69,-5.03 ; Korhogo 9.46,-5.63 ; San-Pédro 4.75,-6.64 ; Yamoussoukro 6.83,-5.29).
- Produit déclaré publié : prix initial = moyenne de sa catégorie ; jours recalculés depuis la date d'expiration.

## 9. Flux transverses à respecter

1. Fournisseur déclare (avec photo) → admin voit la déclaration avec vignette → « Valider le routage » → produit publié sur la marketplace avec photo, badge « Déclaré · validé » et prix IA.
2. Client commande → la commande apparaît « En attente » chez l'admin → « Valider » → « Marquer expédiée » → le client voit le statut évoluer ; le flux apparaît sur la carte Leaflet avec sa distance.
3. Fournisseur modifie une déclaration en vente → la fiche marketplace (nom, photo, quantité, prix) se met à jour immédiatement.
4. Toutes les données persistent (rechargement, déconnexion/reconnexion).

## 10. Critères d'acceptation

✅ 3 interfaces cloisonnées + login + redirection par rôle, aucun accès croisé. ✅ Bouton FR|EN partout, bascule instantanée et mémorisée. ✅ 15 produits seed avec vraies photos + produits déclarés publiés après validation. ✅ Modale produit sans localisation ni barre de probabilité. ✅ Upload/modification/suppression de photo dans les déclarations. ✅ Import CSV avec rapport détaillé. ✅ Carte Leaflet avec villes, clients et distances en km. ✅ Tous les KPI et formules ci-dessus, formats français (virgule décimale, FCFA).
