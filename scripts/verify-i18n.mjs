import { chromium } from 'playwright-core';
const out = 'C:/Users/USER/AppData/Local/Temp/claude/c--Users-USER-Documents-prompt-eng/18088679-d526-4710-9ae7-4f7cf88e02cf/scratchpad/';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
const shot = async (name, ms = 600) => { await page.waitForTimeout(ms); await page.screenshot({ path: out + name + '.png' }); };
const login = async (email, pass) => { await page.fill('input[autocomplete=username]', email); await page.fill('input[type=password]', pass); await page.getByRole('button', { name: /Se connecter|Sign in/i }).click(); await page.waitForTimeout(700); };
const logout = async () => { await page.getByRole('button', { name: /Se déconnecter|Log out/i }).click(); await page.waitForTimeout(500); };
await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

// 1. Bascule EN sur la page de connexion
await page.locator('.lang-switch button', { hasText: 'EN' }).click(); await page.waitForTimeout(300);
console.log('1. login en anglais:', await page.getByText('Sign in to your workspace').count(), '· comptes:', await page.getByText('DEMO ACCOUNTS').count());
await shot('l1-login-en');

// 2. Marketplace client en anglais
await login('client@marche.ci', 'client123');
console.log('2. marketplace EN:', await page.getByText('Unsold goods marketplace').count(), '· panier:', await page.getByText('Cart', { exact: true }).count(), '· reco:', await page.getByText(/Add to cart/i).first().isVisible());
await shot('l2-marketplace-en', 1000);
await logout();

// 3. Fournisseur en anglais
await login('fournisseur@socofrais.ci', 'socofrais123');
console.log('3. fournisseur EN:', await page.getByText('Declare unsold stock').count(), '· import:', await page.getByText('Bulk import (CSV / Excel)').count(), '· éditer:', await page.getByRole('button', { name: 'Edit' }).count() >= 3);
await shot('l3-fournisseur-en');
await logout();

// 4. Admin en anglais + persistance du choix après rechargement
await login('admin@waste2cash.ci', 'admin123');
console.log('4. admin EN — nav:', await page.getByRole('button', { name: 'Overview' }).count(), '· KPI:', await page.getByText('RECOVERY RATE').count());
await page.getByRole('button', { name: 'AI Marketplace' }).click(); await page.waitForTimeout(1500);
console.log('5. page marketplace admin EN:', await page.getByText('Marketplace — resale management').count(), '· carte:', await page.getByText('Mapping & optimal distances').count());
await shot('l4-admin-en', 1500);
await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(800);
console.log('6. après reload, langue EN conservée:', await page.getByText('Hello Amadou,').count() === 1);
// 7. Retour FR
await page.locator('.lang-switch button', { hasText: 'FR' }).click(); await page.waitForTimeout(400);
console.log('7. retour FR:', await page.getByText('Bonjour Amadou,').count() === 1);
await browser.close(); console.log('I18N VÉRIFIÉ');
