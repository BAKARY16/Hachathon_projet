# Waste2Cash Marketplace IA — Architecture technique

> Cahier des charges : plateforme e-commerce intelligente adossée à la base Waste2Cash existante, pour revendre les invendus à prix réduit (prix prédictif IA, recommandation produit, optimisation logistique).
>
> Ce document couvre l'architecture cible de production. La **démo fonctionnelle** est déjà intégrée à l'application (`src/main.jsx`) : espace acheteur « Marketplace », page admin « Marketplace IA » (KPI + cartographie), import CSV fournisseur — tous les chiffres y sont calculés depuis `waste2cash_dataset.csv` (15 000 observations) par `scripts/build-model-data.mjs`.

---

## 1. Vue d'ensemble

```
[Fournisseurs] ──(Formulaire / CSV / API connecteur)──▶ ┌──────────────────────────┐
                                                        │  Base de données centrale │◀──(réplication logique)──[Waste2Cash DB existante]
[Clients e-commerce] ──(catalogue, panier, commandes)──▶│       PostgreSQL          │
                                                        └────────────┬─────────────┘
                                                                     │
                                                      ┌──────────────▼──────────────┐
                                                      │   API centrale (FastAPI)     │──── Auth JWT par rôle (client / fournisseur / admin)
                                                      │   REST + webhooks temps réel │
                                                      └──────┬───────────┬──────────┘
                                                             │           │
                                              ┌──────────────▼──┐   ┌────▼─────────────────┐
                                              │   Moteur IA      │   │  Front-ends React     │
                                              │ prix · reco ·    │   │  Client / Fournisseur │
                                              │ logistique       │   │  / Back-office admin  │
                                              └──────────────────┘   └──────────────────────┘
```

Trois briques front (Client, Fournisseur, Back-office) sur **une seule base centrale** (extension du schéma Waste2Cash, pas de duplication : synchronisation par réplication logique ou API interne).

## 2. Schéma de base de données (extension PostgreSQL)

```sql
-- Tables existantes Waste2Cash (dataset) : collectes, lots, partenaires…
-- Extension marketplace :

CREATE TABLE fournisseurs (
  id            SERIAL PRIMARY KEY,
  nom           TEXT NOT NULL,
  ville         TEXT NOT NULL,            -- Abidjan, Bouaké, Korhogo, San-Pédro, Yamoussoukro
  commune       TEXT,                     -- Cocody, Marcory, …
  contact       TEXT,
  geo           POINT,                    -- lat/lng pour l'optimisation logistique
  cree_le       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE produits (
  id              SERIAL PRIMARY KEY,
  fournisseur_id  INT NOT NULL REFERENCES fournisseurs(id),
  categorie       TEXT NOT NULL,
  sous_categorie  TEXT,
  quantite_kg     NUMERIC(10,2) NOT NULL CHECK (quantite_kg > 0),
  etat            TEXT,
  date_limite     DATE NOT NULL,
  prix_initial    NUMERIC(10,0) NOT NULL,      -- FCFA / kg
  prix_ia         NUMERIC(10,0),               -- calculé par le moteur IA
  statut          TEXT NOT NULL DEFAULT 'en_validation'
                  CHECK (statut IN ('en_validation','en_vente','vendu','expire','retire')),
  source_import   TEXT CHECK (source_import IN ('formulaire','csv','api')),
  cree_le         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON produits (statut, date_limite);
CREATE INDEX ON produits (categorie);

CREATE TABLE clients (
  id           SERIAL PRIMARY KEY,
  nom          TEXT NOT NULL,
  ville        TEXT NOT NULL,
  geo          POINT,
  preferences  JSONB DEFAULT '{}',        -- {categorie, budget_max_fcfa_kg, quantite_type}
  cree_le      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE commandes (
  id               SERIAL PRIMARY KEY,
  client_id        INT NOT NULL REFERENCES clients(id),
  produit_id       INT NOT NULL REFERENCES produits(id),
  quantite_kg      NUMERIC(10,2) NOT NULL,
  prix_unitaire    NUMERIC(10,0) NOT NULL,      -- prix_ia figé à la commande
  statut           TEXT NOT NULL DEFAULT 'en_attente'
                   CHECK (statut IN ('en_attente','validee','expediee','annulee')),
  mode_validation  TEXT DEFAULT 'manuel' CHECK (mode_validation IN ('auto','manuel')),
  distance_km      NUMERIC(7,1),                -- calculée par le moteur logistique
  cree_le          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON commandes (statut, cree_le DESC);

CREATE TABLE predictions_ia (
  id                     SERIAL PRIMARY KEY,
  produit_id             INT NOT NULL REFERENCES produits(id),
  decote_predite_pct     NUMERIC(5,2) NOT NULL,
  prix_predit            NUMERIC(10,0) NOT NULL,
  probabilite_ecoulement NUMERIC(4,3) NOT NULL,
  score_recommandation   NUMERIC(5,2),
  version_modele         TEXT NOT NULL,
  calcule_le             TIMESTAMPTZ DEFAULT now()
);

-- Historisation pour ré-entraînement continu :
CREATE TABLE transactions_historique (
  id             BIGSERIAL PRIMARY KEY,
  produit_id     INT, commande_id INT,
  decote_reelle  NUMERIC(5,2),               -- final_discount_rate observé
  delai_vente_h  NUMERIC(7,1),               -- time_to_sell_hours observé
  enregistre_le  TIMESTAMPTZ DEFAULT now()
);
```

## 3. Spécification API (REST, FastAPI)

| Méthode | Endpoint | Rôle | Description |
|---|---|---|---|
| `POST` | `/auth/login` | tous | JWT avec claim `role` (client / fournisseur / admin) |
| `GET` | `/produits?categorie=&ville=&prix_max=&statut=en_vente` | client | Catalogue avec `prix_ia`, décote, probabilité |
| `GET` | `/produits/{id}` | client | Fiche produit + prédiction courante |
| `POST` | `/produits` | fournisseur | Dépôt manuel (formulaire « produit imprévu ») |
| `POST` | `/produits/import` | fournisseur | Import CSV/Excel — mapping auto + rapport de validation |
| `PATCH` | `/produits/{id}` | fournisseur/admin | Retrait, correction, changement de statut |
| `GET` | `/fournisseurs/{id}/depots` | fournisseur | Historique des dépôts et revenus générés |
| `POST` | `/commandes` | client | Création (statut `en_attente`), décrément du stock en transaction |
| `PATCH` | `/commandes/{id}` | admin | Validation / expédition — déclenche webhooks |
| `GET` | `/commandes?client_id=` | client | Suivi temps réel des statuts |
| `GET` | `/predictions/{produit_id}` | admin | Décote prédite, prix, probabilité, version modèle |
| `GET` | `/kpi/marketplace` | admin | CA, conversion, précision IA, délai moyen, ventes/catégorie |
| `GET` | `/carto/flux` | admin | Nœuds villes (volumes) + flux commandes avec distances optimales |
| `POST` | `/webhooks/subscribe` | systèmes | Notifications : dépôt→dispo client, commande→stock fournisseur, validation→KPI |

Règles de synchronisation temps réel : chaque écriture (dépôt, commande, validation) publie un événement (webhook / websocket) consommé par les trois fronts — c'est ce que la démo simule avec l'état React partagé entre les trois espaces.

## 4. Moteur IA — trois modèles

### 4.1 Prédiction de prix (implémenté dans la démo)
- **Cible production** : XGBoost — features `days_until_expiry`, `quantity_kg`, `categorie`, `saison`, `demande historique`, `météo` → décote optimale.
- **Implémentation démo (explicable)** : décote prédite = **moyenne des `final_discount_rate` observés sur les lots vendus**, croisée par catégorie × tranche d'urgence (≤ 1 j · 2–3 j · 4–7 j · 8 j et +). `prix_ia = prix_initial × (1 − décote)`.
- **Métrique** : MAE entre décote prédite et décote réelle des ventes. **Mesuré sur le dataset : MAE = 12,4 pts → précision 87,6 %** (3 690 ventes de la période récente).

### 4.2 Recommandation produit (implémenté dans la démo)
- **Cible production** : hybride filtrage collaboratif (historique d'achats) + contenu (catégorie, localisation, budget) ; métrique precision@k.
- **Démo (cold start, basé profil)** : `score = 45 % probabilité d'écoulement + 35 % urgence (1/(jours+1)) + 20 % décote normalisée`, bonifié de +12 pts si même ville que l'acheteur et +15 pts si catégorie préférée. Les 3 meilleurs lots sont affichés en « Match % ».

### 4.3 Optimisation logistique (implémenté dans la démo)
- **Cible production** : matrice de distances (OSRM/Mapbox), appariement fournisseur-client minimisant `coût transport + risque péremption` (péremption pondérée par la fenêtre de rotation par catégorie).
- **Démo** : distances orthodromiques (haversine) entre les 5 villes du dataset, recalculées en direct pour chaque commande et affichées sur la carte (flux vert = commande active).

## 5. Dashboard KPI (implémenté — page admin « Marketplace IA »)

| Indicateur | Valeur dataset | Source de calcul |
|---|---|---|
| CA généré par la revente | 116 M FCFA / 6 mois | Σ quantité × prix × (1 − décote réelle) des lots vendus |
| Taux de conversion invendus → revendus | 75,5 % | poids vendu ÷ poids collecté |
| Précision prix IA | 87,6 % (écart 12,4 pts) | décote prédite vs `final_discount_rate` réel |
| Délai moyen dépôt → vente | 61,2 h | moyenne `time_to_sell_hours` des ventes |
| CA par catégorie / ville | graphique + carte | agrégations dataset |
| Commandes temps réel | file en attente / validées / expédiées | état synchronisé avec l'espace client |

## 6. Cartographie (implémentée)

Carte SVG des 5 villes du dataset (Abidjan, Bouaké, Yamoussoukro, San-Pédro, Korhogo) : taille du nœud = volume collecté 6 mois, étiquettes volume / CA / distance moyenne intra-ville ; flux verts = commandes marketplace actives avec distance optimale affichée (ex. Bouaké → Abidjan : 283 km).

## 7. Import fournisseur CSV (implémenté)

Mapping automatique des colonnes (`produit|nom`, `cat…`, `quant|kg`, `date|exp`, `commune|ville`), contrôles : lignes incomplètes rejetées, doublons ignorés, score de **confiance de mapping** ; ≥ 80 % → publication automatique, sinon file d'attente de validation. Rapport d'import affiché (lues / créées / doublons / rejets).

## 8. Stack

| Couche | Démo actuelle | Cible production |
|---|---|---|
| Front | React + Vite + Recharts (mono-app, 3 espaces) | React/Next.js, mêmes composants |
| API | — (état partagé simulant les webhooks) | FastAPI (Python) ou NestJS |
| BDD | `model-results.json` généré du CSV à chaque build | PostgreSQL + réplication de la base Waste2Cash |
| IA | Agrégats explicables recalculés à chaque build | XGBoost + reco hybride + OSRM, ré-entraînement sur `transactions_historique` |
| Cartes | SVG + haversine | Mapbox/Google Maps + matrice de trafic |

## 9. Correspondance cahier des charges → livré

| Module du prompt | État |
|---|---|
| 1. E-commerce client (catalogue prix IA, profil, reco, panier, statuts, notifications) | ✅ démo fonctionnelle |
| 2. Plateforme fournisseur (formulaire, import CSV + validation, statuts, revenus) | ✅ démo fonctionnelle |
| 3. Interconnexion (rôles, synchro temps réel) | ✅ simulée (état partagé) · API spécifiée §3 |
| 4. Base de données centrale | ✅ schéma SQL complet §2 |
| 5. Moteur IA (prix, reco, logistique) | ✅ démo + spécification §4 |
| 6. Dashboard KPI | ✅ démo fonctionnelle |
| 7. Cartographie & distances optimales | ✅ démo fonctionnelle |
