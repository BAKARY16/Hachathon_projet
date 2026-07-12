import { chromium } from 'playwright-core';
const out = 'C:/Users/USER/AppData/Local/Temp/claude/c--Users-USER-Documents-prompt-eng/18088679-d526-4710-9ae7-4f7cf88e02cf/scratchpad/';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
const shot = async (name, ms = 600) => { await page.waitForTimeout(ms); await page.screenshot({ path: out + name + '.png' }); };
const login = async (email, pass) => {
  await page.fill('input[autocomplete=username]', email);
  await page.fill('input[type=password]', pass);
  await page.getByRole('button', { name: /Se connecter/i }).click();
  await page.waitForTimeout(700);
};
const logout = async () => { await page.getByRole('button', { name: /Se déconnecter/i }).click(); await page.waitForTimeout(500); };

await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
console.log('1. hash initial →', await page.evaluate(() => location.hash));
await shot('r1-login');

// Mauvais identifiants
await login('admin@waste2cash.ci', 'mauvais'); console.log('2. mauvais mdp → reste sur', await page.evaluate(() => location.hash));

// Client marketplace
await login('client@marche.ci', 'client123');
console.log('3. client connecté →', await page.evaluate(() => location.hash));
await shot('r2-marketplace', 1200);
// Étanchéité : tentative d'accès admin
await page.evaluate(() => { location.hash = '#/admin' }); await page.waitForTimeout(600);
console.log('4. client force #/admin →', await page.evaluate(() => location.hash));
// Commande
await page.getByRole('button', { name: /Ajouter au panier/i }).nth(4).click();
await page.getByRole('button', { name: /Valider la commande/i }).click();
await page.waitForTimeout(500);
console.log('5. commande passée (notice visible:', await page.getByText(/Commande transmise/).count(), ')');
await logout();
console.log('6. logout →', await page.evaluate(() => location.hash));

// Admin : la commande du client doit être là (persistance localStorage)
await login('admin@waste2cash.ci', 'admin123');
console.log('7. admin connecté →', await page.evaluate(() => location.hash));
await shot('r3-admin-dash', 900);
await page.getByRole('button', { name: /Marketplace IA/i }).click();
await page.waitForTimeout(2500); // tuiles OSM
console.log('8. commandes CMD visibles:', await page.locator('.orders-admin .order-row').count());
await shot('r4-admin-market', 800);
await page.evaluate(() => document.querySelector('.map-card')?.scrollIntoView()); await shot('r5-leaflet', 2000);
await logout();

// Fournisseur : import CSV toujours fonctionnel
await login('fournisseur@socofrais.ci', 'socofrais123');
console.log('9. fournisseur connecté →', await page.evaluate(() => location.hash));
const csv = 'produit;categorie;quantite_kg;date_expiration;commune\nAnanas;Fruits & Légumes;95;2026-07-16;Cocody\nAnanas;Fruits & Légumes;95;2026-07-16;Cocody\nOkra;;;\n';
await page.setInputFiles('input[type=file][accept*=csv]', { name: 'stock.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
await page.waitForTimeout(700);
console.log('10. rapport CSV:', (await page.locator('.csv-chips').innerText()).replace(/\n/g, ' | '));
await page.evaluate(() => document.querySelector('.csv-card')?.scrollIntoView()); await shot('r6-fournisseur-csv');

// Persistance après rechargement complet
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(700);
console.log('11. après reload, session fournisseur →', await page.evaluate(() => location.hash), '· déclaration Ananas présente:', await page.getByText('Ananas').count() > 0);
await browser.close(); console.log('VÉRIFICATION TERMINÉE');
