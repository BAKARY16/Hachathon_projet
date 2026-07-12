// Module commun aux 3 interfaces : authentification simulée + base de données locale partagée (localStorage).
// Aucun backend : les 3 espaces lisent/écrivent la même source de données locale, simulant la base centrale.
import modelResults from './model-results.json';

export const DB_KEY = 'w2c-db-v1';
export const SESSION_KEY = 'w2c-session-v1';

// Comptes de démonstration (champ role : admin | fournisseur | client)
export const accounts = [
    { email: 'admin@waste2cash.ci', password: 'admin123', role: 'admin', name: 'Amadou Koné', initials: 'AK', label: 'Administrateur' },
    { email: 'fournisseur@socofrais.ci', password: 'socofrais123', role: 'fournisseur', name: 'Équipe Socofrais', initials: 'SO', label: 'Fournisseur · Socofrais' },
    { email: 'client@marche.ci', password: 'client123', role: 'client', name: 'Awa Diabaté', initials: 'AD', label: 'Client marketplace' }
];

export const roleRoute = { admin: '#/admin', fournisseur: '#/fournisseur', client: '#/marketplace' };

const seed = () => ({
    orders: [
        { id: 'CMD-1041', items: [{ id: 'MKT-9002', product: 'Riz blanc', q: 180, prixIA: 760, region: 'Bouaké', store: 'Cosmos' }], total: 136800, status: 'Validée', city: 'Abidjan', date: 'Il y a 2 h' },
        { id: 'CMD-1040', items: [{ id: 'MKT-9001', product: 'Yaourts nature', q: 120, prixIA: 820, region: 'Yamoussoukro', store: 'Sangel' }], total: 98400, status: 'Expédiée', city: 'Abidjan', date: 'Hier' }
    ],
    declarations: [
        { id: 'DEC-2844', product: 'Bananes plantain', cat: 'Fruits & légumes', q: 240, date: '2026-07-14', city: 'Cocody', partner: 'Socofrais', status: 'Priorisé par l’IA' },
        { id: 'DEC-2843', product: 'Yaourts brassés', cat: 'Produits laitiers', q: 85, date: '2026-07-13', city: 'Cocody', partner: 'Socofrais', status: 'Matché' },
        { id: 'DEC-2842', product: 'Riz en sacs', cat: 'Épicerie sèche', q: 310, date: '2026-08-02', city: 'Cocody', partner: 'Socofrais', status: 'Collecté' }
    ],
    lots: modelResults.lots,
    profile: { city: 'Abidjan', cat: 'Toutes', budget: 'Tous' },
    predictions: modelResults.marketplace.predictions
});

export const loadDb = () => {
    try { const raw = localStorage.getItem(DB_KEY); if (raw) return { ...seed(), ...JSON.parse(raw) } } catch { }
    const db = seed(); try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { } return db;
};
export const saveDb = db => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { } };

export const getSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null } };
export const setSession = user => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)) } catch { } };
export const clearSession = () => { try { localStorage.removeItem(SESSION_KEY) } catch { } };
export const authenticate = (email, password) => {
    const acc = accounts.find(a => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.password === password);
    if (!acc) return null;
    const { password: _, ...user } = acc; return user;
};
