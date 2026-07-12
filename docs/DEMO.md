# Waste2Cash — Guide de démonstration (3 interfaces séparées, sans backend)

## Lancer la démo

```bash
npm install        # première fois uniquement
npm run dev        # http://localhost:5173  (ou npm run build && npm run preview → http://localhost:4173)
```

Tout fonctionne **côté client** : les données (produits, commandes, déclarations, prédictions IA) sont recalculées depuis `waste2cash_dataset.csv` à chaque build, puis stockées/partagées dans `localStorage` — les trois interfaces lisent et écrivent la **même base locale**, sans serveur. Seules les tuiles de carte (OpenStreetMap/CARTO, publiques et gratuites) sont chargées en ligne.

## Comptes de test (un rôle = une interface, étanchéité stricte)

| Interface | Email | Mot de passe | Redirection |
|---|---|---|---|
| **Admin** — dashboard KPI, Stock & Matching, Marketplace IA (validation des commandes, carte Leaflet), Prévisions, Partenaires, Impact | `admin@waste2cash.ci` | `admin123` | `#/admin` |
| **Fournisseur** — déclaration d'invendus, import CSV/Excel, suivi des dépôts et revenus | `fournisseur@socofrais.ci` | `socofrais123` | `#/fournisseur` |
| **Marketplace (client)** — catalogue produits individuels, recommandations IA, panier, commandes | `client@marche.ci` | `client123` | `#/marketplace` |

Sur la page de connexion, cliquer sur un compte de démonstration pré-remplit les champs. À la connexion, l'utilisateur est **redirigé uniquement vers son espace** ; toute tentative d'accès manuel à une autre route (`#/admin` en étant client, etc.) est automatiquement renvoyée vers l'espace du rôle connecté.

## Scénario de démonstration conseillé (2 minutes)

1. **Fournisseur** (`fournisseur@socofrais.ci`) : déclarer un invendu via le formulaire **avec une photo** (compressée et enregistrée dans la base locale, affichée avec la déclaration) ou **importer un CSV** (colonnes reconnues automatiquement — doublons et lignes incomplètes rejetés). Le bouton **« Modifier »** d'une déclaration recharge le formulaire pour **mettre à jour le produit et sa photo** (remplacer ou retirer) — si le produit est déjà en vente, la fiche marketplace est mise à jour instantanément. Se déconnecter.
2. **Admin** (`admin@waste2cash.ci`) : dans **Stock & Matching**, la déclaration apparaît avec sa vignette → **« Valider le routage »** la publie automatiquement sur la marketplace. Dans **Marketplace IA** : valider les commandes clients, observer la **carte Leaflet** (fournisseurs bleus, clients verts, distances optimales). Se déconnecter.
3. **Client** (`client@marche.ci`) : le produit déclaré est en vente avec sa photo et le badge « Déclaré · validé ». **Cliquer sur un produit** ouvre sa fiche détaillée (état, quantité, expiration, prix initial, décote et prix IA — sans localisation ni barre de probabilité). Ajouter au panier et **valider la commande**.

Les images par défaut des produits déclarés (par catégorie) sont dans `public/assets/produits-declares/` ; les photos téléversées sont persistées dans la base locale avec la déclaration (voir le README de ce dossier).

Les données persistent après rechargement et entre les sessions (même navigateur). Pour **réinitialiser la démo** : console navigateur → `localStorage.clear()` puis recharger.

## Où est quoi dans le code

| Élément | Fichier |
|---|---|
| Authentification simulée + base locale partagée (module commun aux 3 interfaces) | `src/store.js` |
| Les 3 interfaces, routes `#/admin` · `#/fournisseur` · `#/marketplace` + gardes | `src/main.jsx` |
| Moteur IA (prix par produit, probabilité d'écoulement, score de recommandation) recalculé du dataset à chaque build | `scripts/build-model-data.mjs` → `src/model-results.json` (`marketplace.predictions[produit_id]`) |
| Images réelles des produits (mapping direct `id → image`) | `public/assets/produits/<slug>.jpg` (récupérées via `scripts/fetch-product-images.mjs`) |
| Carte Leaflet (react-leaflet + tuiles OSM/CARTO gratuites) | composant `MarketMap` dans `src/main.jsx` |
| Test bout-en-bout automatisé (logins, étanchéité, persistance, CSV) | `scripts/verify-3-interfaces.mjs` |
