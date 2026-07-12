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

1. **Client** (`client@marche.ci`) : parcourir le catalogue (chaque produit a sa photo réelle, son état, sa prédiction IA individuelle calculée sur l'historique de sa propre sous-catégorie), ajouter 1–2 lots au panier, **valider la commande**, se déconnecter.
2. **Admin** (`admin@waste2cash.ci`) : ouvrir **Marketplace IA** → la commande du client est dans la file « en attente », la **valider** ; observer la **carte Leaflet** (fournisseurs bleus, clients verts, distances optimales) ; se déconnecter.
3. **Fournisseur** (`fournisseur@socofrais.ci`) : déposer un invendu via le formulaire ou **importer un CSV** (colonnes reconnues automatiquement : produit, catégorie, quantité, date, commune — doublons et lignes incomplètes rejetés).

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
