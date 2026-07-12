import { chromium } from 'playwright-core';
import fs from 'node:fs';
const out = 'C:/Users/USER/AppData/Local/Temp/claude/c--Users-USER-Documents-prompt-eng/18088679-d526-4710-9ae7-4f7cf88e02cf/scratchpad/';
const photo = fs.readFileSync(new URL('../public/assets/produits/tomate.jpg', import.meta.url));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
const shot = async (name, ms = 600) => { await page.waitForTimeout(ms); await page.screenshot({ path: out + name + '.png' }); };
const login = async (email, pass) => { await page.fill('input[autocomplete=username]', email); await page.fill('input[type=password]', pass); await page.getByRole('button', { name: /Se connecter/i }).click(); await page.waitForTimeout(700); };
const logout = async () => { await page.getByRole('button', { name: /Se déconnecter/i }).click(); await page.waitForTimeout(500); };
await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

// 1. Fournisseur : déclaration avec photo
await login('fournisseur@socofrais.ci', 'socofrais123');
await page.fill('input[placeholder*="Tomates"]', 'Tomates cerises bio');
await page.selectOption('select >> nth=0', 'Fruits & Légumes');
await page.fill('input[type=number]', '75');
await page.fill('input[type=date]', '2026-07-15');
await page.setInputFiles('input[accept="image/*"]', { name: 'tomates.jpg', mimeType: 'image/jpeg', buffer: photo });
await page.waitForTimeout(900);
console.log('1. aperçu photo affiché:', await page.locator('.photo-ok img').count());
await page.getByRole('button', { name: /Envoyer la déclaration/i }).click();
await page.waitForTimeout(600);
const firstThumb = await page.locator('.declarations .dec-thumb').first().getAttribute('src');
console.log('2. déclaration créée avec photo data-URL:', firstThumb.startsWith('data:image/jpeg'));
await shot('p1-fournisseur-photo');
await logout();

// 2. Admin : validation de la déclaration
await login('admin@waste2cash.ci', 'admin123');
await page.getByRole('button', { name: /Stock & Matching/i }).click();
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector('.routing')?.scrollIntoView());
const row = page.locator('.route-row', { hasText: 'Tomates cerises bio' });
console.log('3. déclaration visible côté admin avec vignette:', await row.locator('.dec-thumb').count());
await row.getByRole('button', { name: /Valider le routage/i }).click();
await page.waitForTimeout(400);
await shot('p2-admin-validation');
await logout();

// 3. Client : produit déclaré publié + modale
await login('client@marche.ci', 'client123');
await page.waitForTimeout(800);
const card = page.locator('.product-card', { hasText: 'Tomates cerises bio' });
console.log('4. produit déclaré publié sur la marketplace:', await card.count(), '· badge:', await card.locator('.pnew').count());
await card.locator('.pclick').click();
await page.waitForTimeout(500);
const modalText = await page.locator('.modal-card').innerText();
console.log('5. modale ouverte:', await page.locator('.modal-card').count(), '· sans localisation:', !/Cocody|Abidjan|Bouaké|Socofrais|Cosmos/.test(modalText), '· sans barre proba:', await page.locator('.modal-card .prob').count() === 0);
await shot('p3-modal-declared');
await page.locator('.modal-card').getByRole('button', { name: /Ajouter au panier/i }).click();
await page.waitForTimeout(400);
console.log('6. ajouté au panier depuis la modale:', await page.locator('.cart-row', { hasText: 'Tomates cerises bio' }).count());
// Modale d'un produit du catalogue standard
await page.locator('.product-card', { hasText: 'Poisson frais' }).first().locator('.pclick').click();
await page.waitForTimeout(500);
const m2 = await page.locator('.modal-card').innerText();
console.log('7. modale produit catalogue sans localisation:', !/Socofrais|Sangel|Playce|Cosmos|Cap Nord|Cap Sud|Abidjan|Bouaké|Korhogo|San-Pédro|Yamoussoukro/.test(m2));
await shot('p4-modal-catalog');
await browser.close(); console.log('FLUX PHOTO VÉRIFIÉ');
