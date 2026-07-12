import { chromium } from 'playwright-core';
import fs from 'node:fs';
const out = 'C:/Users/USER/AppData/Local/Temp/claude/c--Users-USER-Documents-prompt-eng/18088679-d526-4710-9ae7-4f7cf88e02cf/scratchpad/';
const photo = fs.readFileSync(new URL('../public/assets/produits/fromage.jpg', import.meta.url));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
const shot = async (name, ms = 600) => { await page.waitForTimeout(ms); await page.screenshot({ path: out + name + '.png' }); };
const login = async (email, pass) => { await page.fill('input[autocomplete=username]', email); await page.fill('input[type=password]', pass); await page.getByRole('button', { name: /Se connecter/i }).click(); await page.waitForTimeout(700); };
await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

// Fournisseur : modifier la déclaration "Yaourts brassés" (statut Matché = déjà en vente)
await login('fournisseur@socofrais.ci', 'socofrais123');
const row = page.locator('.declaration-row', { hasText: 'Yaourts brassés' });
await row.getByRole('button', { name: /Modifier/i }).click();
await page.waitForTimeout(500);
console.log('1. formulaire en mode édition:', await page.getByText(/Modifier la déclaration DEC-2843/).count());
console.log('2. champs préchargés:', await page.locator('input[placeholder*="Tomates"]').inputValue(), '·', await page.locator('input[type=number]').inputValue(), 'kg');
await page.fill('input[placeholder*="Tomates"]', 'Yaourts brassés sucrés');
await page.fill('input[type=number]', '120');
await page.setInputFiles('input[accept="image/*"]', { name: 'yaourts.jpg', mimeType: 'image/jpeg', buffer: photo });
await page.waitForTimeout(900);
await shot('e1-edit-form');
await page.getByRole('button', { name: /Enregistrer les modifications/i }).click();
await page.waitForTimeout(600);
const updated = page.locator('.declaration-row', { hasText: 'Yaourts brassés sucrés' });
console.log('3. déclaration mise à jour:', await updated.count(), '· 120 kg:', (await updated.innerText()).includes('120 kg'), '· nouvelle photo:', (await updated.locator('.dec-thumb').getAttribute('src')).startsWith('data:image/jpeg'));
await shot('e2-updated-row');
await page.getByRole('button', { name: /Se déconnecter/i }).click(); await page.waitForTimeout(500);

// Client : le produit en vente reflète la mise à jour (nom, quantité, photo)
await login('client@marche.ci', 'client123');
await page.waitForTimeout(800);
const card = page.locator('.product-card', { hasText: 'Yaourts brassés sucrés' });
console.log('4. marketplace à jour:', await card.count(), '· photo data-URL:', (await card.locator('.pimg').getAttribute('src')).startsWith('data:image/jpeg'), '· 120 kg:', (await card.innerText()).includes('120'));
await card.locator('.pclick').click(); await page.waitForTimeout(400);
console.log('5. modale à jour:', (await page.locator('.modal-card').innerText()).includes('120 kg'));
await shot('e3-marketplace-updated');
await browser.close(); console.log('FLUX MISE À JOUR VÉRIFIÉ');
