import fs from 'node:fs';
const out = new URL('../public/assets/produits/', import.meta.url); fs.mkdirSync(out, { recursive: true });
const UA = { 'User-Agent': 'Waste2Cash-hackathon-demo/1.0 (educational demo)' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIN = 20000;
// [slug, curated Commons filenames to try first, search terms fallback]
const items = [
  ['tomate', ['Fresh red tomatoes.jpg'], 'fresh red tomatoes'],
  ['salade', ["Lactuca sativa 'Lollo Bionda'.jpg"], 'lettuce vegetable'],
  ['charcuterie', [], 'salami sliced sausage plate'],
  ['boeuf', ['Beef fillet steak with mushrooms.jpg'], 'raw beef steak'],
  ['patisserie', [], 'eclairs pastry bakery display'],
  ['pain', [], 'intitle:baguette bread'],
  ['poulet', [], 'raw chicken meat cutting'],
  ['fromage', ['NCI swiss cheese.jpg'], 'gouda cheese slices'],
  ['beurre', ['Western-pack-butter.jpg'], 'butter dish block'],
  ['mangue', ['Mangos - single and halved.jpg'], 'ripe mango fruit'],
  ['croissant', ['Croissant-Petr Kratochvil.jpg'], 'croissants bakery'],
  ['poisson', [], 'fresh fish market ice'],
  ['noix-cajou', [], 'cashew nuts'],
  ['conserves', [], 'canned food tins shelf'],
  ['yaourt', ['Joghurt.jpg'], 'intitle:yogurt plain'],
  ['orange', ['Orange-Fruit-Pieces.jpg'], 'orange fruit'],
  ['legumes-surgeles', [], 'frozen vegetables'],
  ['riz', [], 'intitle:rice uncooked grains'],
  ['viande-surgelee', [], 'frozen meat freezer'],
  ['pates', [], 'intitle:pasta dry'],
  ['lait', ['Milk glass.jpg'], 'milk glass bottle'],
  ['cereales', [], 'intitle:cornflakes bowl'],
  ['plats-surgeles', [], 'TV dinner tray meal']
];
const dl = async url => { const r = await fetch(url, { headers: UA, redirect: 'follow' }); if (!r.ok) return null; const b = Buffer.from(await r.arrayBuffer()); return b.length >= MIN ? b : null };
const searchApi = async term => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=5&gsrsearch=${encodeURIComponent('filetype:bitmap ' + term)}&prop=imageinfo&iiprop=url|mime&iiurlwidth=640`;
    const res = await fetch(api, { headers: UA }); const txt = await res.text();
    try { const j = JSON.parse(txt); return Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index).map(p => p.imageinfo?.[0]).filter(i => i && /jpeg|png/.test(i.mime)) } catch { console.log('  throttled, retry in 15 s…'); await sleep(15000) }
  }
  return [];
};
for (const [slug, curated, term] of items) {
  const file = new URL(slug + '.jpg', out);
  if (fs.existsSync(file) && fs.statSync(file).size >= MIN) { console.log('SKIP', slug, '(déjà ok)'); continue }
  let buf = null, src = '';
  for (const name of curated) {
    buf = await dl(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=640`);
    if (buf) { src = name; break }
    await sleep(800);
  }
  if (!buf) {
    for (const info of await searchApi(term)) {
      buf = await dl(info.thumburl) || await dl(info.url);
      if (buf) { src = decodeURIComponent(info.thumburl.split('/').pop()).slice(0, 55); break }
      await sleep(800);
    }
  }
  if (buf) { fs.writeFileSync(file, buf); console.log('OK  ', slug.padEnd(18), String(buf.length).padStart(7), src) }
  else console.log('MISS', slug);
  await sleep(2000);
}
