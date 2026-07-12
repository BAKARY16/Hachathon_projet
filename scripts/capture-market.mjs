import { chromium } from 'playwright-core';
const out = 'C:/Users/USER/AppData/Local/Temp/claude/c--Users-USER-Documents-prompt-eng/18088679-d526-4710-9ae7-4f7cf88e02cf/scratchpad/';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
const shot = async name => { await page.waitForTimeout(500); await page.screenshot({ path: out + name + '.png' }); };
// Espace acheteur
await page.getByRole('button', { name: /^Marketplace$/ }).first().click(); await shot('m1-buyer');
// Ajouter 2 produits au panier puis commander
await page.getByRole('button', { name: /Ajouter au panier/i }).nth(3).click();
await page.getByRole('button', { name: /Ajouter au panier/i }).nth(5).click();
await page.getByRole('button', { name: /Valider la commande/i }).click(); await shot('m2-order');
// Admin marketplace
await page.getByRole('button', { name: /Espace Administrateur/i }).first().click();
await page.getByRole('button', { name: /Marketplace IA/i }).click(); await shot('m3-admin');
await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' })); await shot('m4-map');
// Fournisseur : import CSV
await page.getByRole('button', { name: /Espace Fournisseurs/i }).first().click();
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })); await shot('m5-csv');
const csv = 'produit;categorie;quantite_kg;date_expiration;commune\nMangues;Fruits & Légumes;140;2026-07-15;Cocody\nMangues;Fruits & Légumes;140;2026-07-15;Cocody\nLait UHT;Produits Laitiers;80;2026-07-20;Marcory\nSardines;;;\n';
await page.setInputFiles('input[type=file][accept*=csv]', { name: 'stock.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
await page.waitForTimeout(600); await shot('m6-csv-report');
await browser.close(); console.log('captures marketplace OK');
