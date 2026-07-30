/**
 * Real CashKaro data — NOTHING here is invented. Two sources:
 *  1. The Cashkaro-Search-2026 "Real Data Cases" (Figma key 0O2eU4S1vipmvXFT2eeJ9h):
 *     store names, cashback %/₹, product names/prices/discounts, deal banners.
 *  2. The cards data API (Great Cards): card fees (incl. GST), fee waivers, the
 *     cards' own reward structures, star ratings, and card-art CDN images.
 *
 * The ONLY remaining un-sourced figures are loan APRs and savings interest rates
 * (no real source available yet) — those stay as loud PLACEHOLDER flags (§7).
 */
import { ResultItem, SerpModel } from './dataContract';
import { allStoreTileItems, storeTilesByKeys, storeTileByKey } from './storeTiles';

const PLACEHOLDER = true; // greppable marker for un-sourced values (§7)

/**
 * Real brand logos via Clearbit's public logo CDN (real assets served by an
 * existing CDN — §14 item 4 "auto" path; never a fabricated URL). `bg` is the
 * brand tint behind each logo — brand data, not a UI token.
 */
const brandLogo = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
// Crisp brand logos exported from the CashKaro design system (Figma) where
// available; favicon CDN for the long tail.
export const BRAND: Record<string, { logo: string | number | null; bg: string }> = {
  flipkart: { logo: require('../../assets/brands/flipkart.png'), bg: '#ffe11b22' },
  nykaa: { logo: require('../../assets/brands/nykaa.png'), bg: '#fce7f0' },
  axisBank: { logo: brandLogo('axisbank.com'), bg: '#97144d1a' },
  pharmeasy: { logo: require('../../assets/brands/pharmeasy.png'), bg: '#10847e1a' },
  beyoung: { logo: require('../../assets/brands/beyoung.png'), bg: '#fde68a55' },
  cleartrip: { logo: require('../../assets/brands/cleartrip.png'), bg: '#ff6d1d1a' },
  // Symbol only. The full lockup (`myntra.png`, kept as provenance) put the word
  // "Myntra" beside the mark, which repeated the store name printed next to the
  // tile and left the mark off-centre in it — the wide art filled the box's width,
  // so `contain` had nothing left to centre (D066).
  myntra: { logo: require('../../assets/brands/myntra-mark.png'), bg: '#ff3f6c1a' },
  amazon: { logo: require('../../assets/brands/amazon.png'), bg: '#ff990022' },
  bodyshop: { logo: brandLogo('thebodyshop.com'), bg: '#00423614' },
  // Body Cupid: no reliable favicon found — honest initial-letter fallback.
  bodycupid: { logo: null as string | null, bg: '#c9a86a1f' },
  bebodywise: { logo: brandLogo('bebodywise.com'), bg: '#3a6ff11a' },
  lotus: { logo: brandLogo('lotusbotanicals.com'), bg: '#2e7d3217' },
  mobikwik: { logo: brandLogo('mobikwik.com'), bg: '#2f9bff1a' },
  tira: { logo: require('../../assets/brands/tira.png'), bg: '#e5326617' },
  croma: { logo: brandLogo('croma.com'), bg: '#12daa81f' },
  samsung: { logo: brandLogo('samsung.com'), bg: '#1428a01a' },
  portronics: { logo: brandLogo('portronics.com'), bg: '#ff3f3f14' },
  myfitness: { logo: brandLogo('myfitness.in'), bg: '#00b3e61a' },
  myfitfuel: { logo: brandLogo('myfitfuel.in'), bg: '#f7a80020' },
  sbiCard: { logo: brandLogo('sbicard.com'), bg: '#00b5ef1a' },
  federal: { logo: brandLogo('scapia.cards'), bg: '#6a3df51a' },
  muscleblaze: { logo: brandLogo('muscleblaze.com'), bg: '#ff640014' },
  optimum: { logo: brandLogo('optimumnutrition.com'), bg: '#c8102e14' },
  snitch: { logo: brandLogo('snitch.com'), bg: '#26262614' },
  nike: { logo: brandLogo('nike.com'), bg: '#26262610' },
  apple: { logo: brandLogo('apple.com'), bg: '#26262610' },

  // ── Expanded catalog brands (favicon CDN) — showcase coverage across categories
  ajio: { logo: brandLogo('ajio.com'), bg: '#2b2b2b12' },
  relianceDigital: { logo: brandLogo('reliancedigital.in'), bg: '#e6111712' },
  tatacliq: { logo: brandLogo('tatacliq.com'), bg: '#e0115f12' },
  meesho: { logo: brandLogo('meesho.com'), bg: '#570e6314' },
  snapdeal: { logo: brandLogo('snapdeal.com'), bg: '#e4022514' },
  jiomart: { logo: brandLogo('jiomart.com'), bg: '#0a8f4c14' },
  hm: { logo: brandLogo('hm.com'), bg: '#e5000014' },
  maxfashion: { logo: brandLogo('maxfashion.in'), bg: '#0033a014' },
  bewakoof: { logo: brandLogo('bewakoof.com'), bg: '#ffd60022' },
  souledstore: { logo: brandLogo('thesouledstore.com'), bg: '#26262612' },
  westside: { logo: brandLogo('westside.com'), bg: '#c2185b14' },
  levis: { logo: brandLogo('levi.in'), bg: '#c4122314' },
  puma: { logo: brandLogo('puma.com'), bg: '#26262612' },
  adidas: { logo: brandLogo('adidas.co.in'), bg: '#26262612' },
  sephora: { logo: brandLogo('sephora.nnnow.com'), bg: '#26262612' },
  myglamm: { logo: brandLogo('myglamm.com'), bg: '#e91e6314' },
  sugar: { logo: brandLogo('sugarcosmetics.com'), bg: '#26262612' },
  mamaearth: { logo: brandLogo('mamaearth.in'), bg: '#7cb34222' },
  purplle: { logo: brandLogo('purplle.com'), bg: '#7b1fa214' },
  plum: { logo: brandLogo('plumgoodness.com'), bg: '#2e7d3214' },
  boat: { logo: brandLogo('boat-lifestyle.com'), bg: '#e5323214' },
  noise: { logo: brandLogo('gonoise.com'), bg: '#26262612' },
  vijaysales: { logo: brandLogo('vijaysales.com'), bg: '#e4141414' },
  netmeds: { logo: brandLogo('netmeds.com'), bg: '#0a9e6e14' },
  tata1mg: { logo: brandLogo('1mg.com'), bg: '#ff672014' },
  apollo: { logo: brandLogo('apollopharmacy.in'), bg: '#0d735014' },
  healthkart: { logo: brandLogo('healthkart.com'), bg: '#f7941d14' },
  myprotein: { logo: brandLogo('myprotein.co.in'), bg: '#26262612' },
  makemytrip: { logo: brandLogo('makemytrip.com'), bg: '#e5322914' },
  goibibo: { logo: brandLogo('goibibo.com'), bg: '#0a63c914' },
  easemytrip: { logo: brandLogo('easemytrip.com'), bg: '#0a8f4c14' },
  ixigo: { logo: brandLogo('ixigo.com'), bg: '#ff670014' },
  redbus: { logo: brandLogo('redbus.in'), bg: '#d8412014' },
  swiggy: { logo: brandLogo('swiggy.com'), bg: '#fc801922' },
  zomato: { logo: brandLogo('zomato.com'), bg: '#e2334414' },
  bigbasket: { logo: brandLogo('bigbasket.com'), bg: '#84c22522' },
  blinkit: { logo: brandLogo('blinkit.com'), bg: '#f8cb2722' },
  zepto: { logo: brandLogo('zeptonow.com'), bg: '#4b0e9d14' },
  licious: { logo: brandLogo('licious.in'), bg: '#c1272d14' },
  paytm: { logo: brandLogo('paytm.com'), bg: '#00baf214' },
  pepperfry: { logo: brandLogo('pepperfry.com'), bg: '#f5821f14' },
  urbanladder: { logo: brandLogo('urbanladder.com'), bg: '#26262612' },
  wakefit: { logo: brandLogo('wakefit.co'), bg: '#f7941d14' },
  hostinger: { logo: brandLogo('hostinger.in'), bg: '#673de614' },
  godaddy: { logo: brandLogo('godaddy.com'), bg: '#1bdbdb14' },
  coursera: { logo: brandLogo('coursera.org'), bg: '#0056d214' },
  udemy: { logo: brandLogo('udemy.com'), bg: '#a435f014' },
};

/**
 * Real product photos — HQ images fetched from Wikimedia Commons (real, openly
 * licensed assets served by an existing CDN; downloaded into the bundle so they
 * load offline). Rendered full-bleed on product cards. Category-representative
 * where an exact SKU photo isn't on Commons (§14 item 4 "real asset" path).
 */
export const PRODUCT_IMG = {
  galaxyS24: require('../../assets/products/galaxy-s24.png'),
  magnesium: require('../../assets/products/magnesium-chloride.jpg'),
  hairOil: require('../../assets/products/hair-oil.jpg'),
  myfitnessWhey: require('../../assets/products/myfitness-whey.jpg'),
  myfitfuelWhey: require('../../assets/products/myfitfuel-whey.jpg'),
  phoneStand: require('../../assets/products/phone-stand.jpg'),
  carMount: require('../../assets/products/car-phone-mount.jpg'),
  phoneTripod: require('../../assets/products/phone-tripod.jpg'),
  iphone15: require('../../assets/products/iphone-15.jpg'),
  oneplus12: require('../../assets/products/oneplus-12.jpg'),
  sonyXm5: require('../../assets/products/sony-wh1000xm5.jpg'),
  airpodsPro: require('../../assets/products/airpods-pro.jpg'),
  earbuds: require('../../assets/products/wireless-earbuds.jpg'),
  appleWatch: require('../../assets/products/apple-watch.jpg'),
  ps5: require('../../assets/products/playstation-5.png'),
  kindle: require('../../assets/products/kindle-paperwhite.jpg'),
  logiMouse: require('../../assets/products/logitech-mouse.jpg'),
  jblSpeaker: require('../../assets/products/jbl-speaker.jpg'),
  nikeAf1: require('../../assets/products/nike-air-force-1.jpg'),
  adidas: require('../../assets/products/adidas-shoes.jpg'),
  levis: require('../../assets/products/levis-jeans.jpg'),
  rayban: require('../../assets/products/rayban-sunglasses.jpg'),
  casio: require('../../assets/products/casio-watch.jpg'),
  lipstick: require('../../assets/products/lipstick.jpg'),
  perfume: require('../../assets/products/perfume.jpg'),
  faceCream: require('../../assets/products/face-cream.jpg'),
  muscleblazeWhey: require('../../assets/products/muscleblaze-whey.jpg'),
  optimumWhey: require('../../assets/products/optimum-whey.jpg'),
  // Web-result SKUs (Expand Search) — merchants CashKaro doesn't map, so these
  // exist only in the "found on the web" rail. White-background product photos
  // from the merchant listing (nutrabay.com CDN), resized to 800px like the rest.
  isopureWhey: require('../../assets/products/isopure-whey.jpg'),
  myproteinWhey: require('../../assets/products/myprotein-whey.jpg'),
  nikeRevolution: require('../../assets/products/nike-revolution.jpg'),
  // Catalog-coverage product photos (every catalog product shows a real image,
  // never a brand-logo fallback).
  iphone15pro: require('../../assets/products/iphone-15-pro.jpg'),
  redmiNote13: require('../../assets/products/redmi-note-13.jpg'),
  noiseBuds: require('../../assets/products/noise-earbuds.jpg'),
  noiseWatch: require('../../assets/products/smartwatch-noise.jpg'),
  boatWatch: require('../../assets/products/smartwatch-boat.jpg'),
  pumaShoes: require('../../assets/products/puma-shoes.jpg'),
  tshirt: require('../../assets/products/tshirt.jpg'),
  peanutButter: require('../../assets/products/peanut-butter.jpg'),
  faceSerum: require('../../assets/products/face-serum.jpg'),
  sunscreen: require('../../assets/products/sunscreen.jpg'),
  foundation: require('../../assets/products/foundation.jpg'),
  mattress: require('../../assets/products/mattress.jpg'),
  rawChicken: require('../../assets/products/raw-chicken.jpg'),
} as const;

/**
 * Loan lender logos — the real BankKaro "Lenders" asset set exported from the
 * design system (Figma aDUj08AzHTpZdeIeuproAS, node 1879:6737, 40×40 @3x).
 * Each PNG is a self-contained rounded badge (brand background baked in), so it
 * sits on a neutral tile — no brand tint behind it (bg: 'transparent').
 */
export const LENDER: Record<string, { logo: number; bg: string }> = {
  tataCapital: { logo: require('../../assets/lenders/tata-capital.png'), bg: 'transparent' },
  bajajFinserv: { logo: require('../../assets/lenders/bajaj-finserv.png'), bg: 'transparent' },
  cashe: { logo: require('../../assets/lenders/cashe.png'), bg: 'transparent' },
  lnt: { logo: require('../../assets/lenders/lnt.png'), bg: 'transparent' },
  hsbc: { logo: require('../../assets/lenders/hsbc.png'), bg: 'transparent' },
  fibe: { logo: require('../../assets/lenders/fibe.png'), bg: 'transparent' },
  zype: { logo: require('../../assets/lenders/zype.png'), bg: 'transparent' },
  incred: { logo: require('../../assets/lenders/incred.png'), bg: 'transparent' },
  indusind: { logo: require('../../assets/lenders/indusind.png'), bg: 'transparent' },
  adityaBirla: { logo: require('../../assets/lenders/aditya-birla.png'), bg: 'transparent' },
  moneyview: { logo: require('../../assets/lenders/moneyview.png'), bg: 'transparent' },
  kreditbee: { logo: require('../../assets/lenders/kreditbee.png'), bg: 'transparent' },
  mpokket: { logo: require('../../assets/lenders/mpokket.png'), bg: 'transparent' },
  idfc: { logo: require('../../assets/lenders/idfc.png'), bg: 'transparent' },
  axis: { logo: require('../../assets/lenders/axis.png'), bg: 'transparent' },
  axisV2: { logo: require('../../assets/lenders/axis-v2.png'), bg: 'transparent' },
  axisV3: { logo: require('../../assets/lenders/axis-v3.png'), bg: 'transparent' },
  heroFincorp: { logo: require('../../assets/lenders/hero-fincorp.png'), bg: 'transparent' },
  kotak: { logo: require('../../assets/lenders/kotak.png'), bg: 'transparent' },
  yesBank: { logo: require('../../assets/lenders/yesbank.png'), bg: 'transparent' },
  prefr: { logo: require('../../assets/lenders/prefr.png'), bg: 'transparent' },
  hdfc: { logo: require('../../assets/lenders/hdfc.png'), bg: 'transparent' },
  poonawalla: { logo: require('../../assets/lenders/poonawalla.png'), bg: 'transparent' },
  olyv: { logo: require('../../assets/lenders/olyv.png'), bg: 'transparent' },
};

// Card artwork — real card renders exported from the CashKaro design system
// (Figma "Cards" library 877:37871, 132×84 ratio 1.58).
const ART = {
  sbiCashback: require('../../assets/cards/sbi-cashback.png'),
  axisFlipkart: require('../../assets/cards/axis-flipkart.png'),
  scapia: require('../../assets/cards/federal-scapia.png'),
  // The three cards the card-TILE frame shows that the catalog didn't have (D105).
  // Each render is that frame's own export (1696:5271) — and each card is named off
  // the art itself, never guessed: "Elite" and "Live+" are printed on the plastic.
  sbiElite: require('../../assets/cards/sbi-elite.png'),
  hsbcLivePlus: require('../../assets/cards/hsbc-liveplus.png'),
  axisSwirl: require('../../assets/cards/axis-swirl.png'),
  // The SBI shelf's own renders, exported at 3× from the great.cards design system
  // (`Q7235KVU3sU3HOTiibOXhv`, `CreditCards/SBI` 1189:167083 — sixteen 132×84 variants,
  // D107). Same 398×252 as `sbiCashback`, so the artwork slot is pixel-matched. That
  // frame is where any further card art comes from: IRCTC, Prime, Octane, BPCL, Miles,
  // AURUM, Pulse, Club Vistara and ELITE RuPay are all in it.
  sbiSimplyClick: require('../../assets/cards/sbi-simplyclick.png'),
  sbiSimplySave: require('../../assets/cards/sbi-simplysave.png'),
};

// Issuer wordmarks for the credit-card TILE's white chip (D105) — the card-tile
// frame's OWN exports (Figma Cashkaro-Search-2026 1696:5271, pulled with the MCP and
// saved under assets/cards/figma/), trimmed of their transparent margin and scaled to
// 360px wide. Figma crops the same assets with `object-cover` inside each chip, so a
// trim is what it already renders — and the favicon in `logo` would be a blurry mark
// on a 77×26 white plate.
const ISSUER = {
  sbiCard: require('../../assets/cards/figma/issuer-sbi-card.png'),
  axisBank: require('../../assets/cards/figma/issuer-axis-bank.png'),
  scapia: require('../../assets/cards/figma/issuer-scapia.png'),
  hsbc: require('../../assets/cards/figma/issuer-hsbc.png'),
};

// ── Real deal banner creatives (exported from the Figma design file) ──────────
// Full pre-rendered campaign artwork; rendered full-bleed (CK strip + CTA baked in).
const deal = (id: string, img: number, aspect: number, tint: string): ResultItem => ({
  id,
  archetype: '13_campaign',
  source: 'internal',
  title: '',
  logo: null,
  cashback: { type: 'none' },
  bannerImage: img,
  bannerAspect: aspect,
  bannerTint: tint,
});

const WIDE = 984 / 354; // real wide banner aspect (from Downloads)
// `bannerTint` is the dominant field colour of each creative, MEASURED from the
// asset by `node scripts/sample-banner-tint.mjs` — never eyeballed. It drives the
// glow behind the deals rail, so the glow always matches the artwork on screen.
const dealCroma = deal('deal-croma', require('../../assets/banners/w_0128.png'), WIDE, '#335fd0');
const dealAmazon = deal('deal-amazon', require('../../assets/banners/w_0207.png'), WIDE, '#c0e9fa');
const dealAjio = deal('deal-ajio', require('../../assets/banners/w_0153.png'), WIDE, '#738991');
const dealKlook = deal('deal-klook', require('../../assets/banners/w_4409.png'), WIDE, '#c21c2a');
const dealS3Beauty = deal('deal-s3beauty', require('../../assets/banners/w_0220.png'), WIDE, '#5ec0ed');
export const ALL_DEALS = [dealCroma, dealAmazon, dealAjio, dealS3Beauty, dealKlook];

// ═════════════════════════════════════════════════════════════════════════════
// Real products (from the design cases' product grids)
// ═════════════════════════════════════════════════════════════════════════════
const prodGalaxyS24: ResultItem = {
  id: 'prod-galaxy-s24',
  archetype: '02_product',
  source: 'internal',
  title: 'Samsung Galaxy S24 5G Gold',
  subtitle: 'Samsung',
  logo: BRAND.samsung.logo, logoBg: BRAND.samsung.bg,
  productImage: PRODUCT_IMG.galaxyS24,
  cashback: { type: 'flat_inr', value: 480, prefix: 'flat' },
  originalPrice: '₹74,999',
  discount: '36% OFF',
  badge: { label: 'After Cashback of ₹480', tone: 'cashback' },
  ctaLabel: '₹47,999',
};

const prodHsnMagnesium: ResultItem = {
  id: 'p-hsn-mag',
  archetype: '02_product',
  source: 'internal',
  title: 'Hollywood Secrets Natural Magnesium Chloride',
  subtitle: 'HSN',
  logo: null,
  productImage: PRODUCT_IMG.magnesium,
  cashback: { type: 'flat_inr', value: 8, prefix: 'flat' },
  badge: { label: 'After Cashback of ₹8', tone: 'cashback' },
  ctaLabel: '₹295',
};

const prodMahabhringraj: ResultItem = {
  id: 'p-maha',
  archetype: '02_product',
  source: 'internal',
  title: 'Oil Scalp Massaging Oil Ramakrishna Pharma',
  subtitle: 'Mahabhringraj',
  logo: null,
  productImage: PRODUCT_IMG.hairOil,
  cashback: { type: 'flat_inr', value: 5, prefix: 'flat' },
  originalPrice: '₹249',
  badge: { label: 'After Cashback of ₹5', tone: 'cashback' },
  ctaLabel: '₹240',
};

const prodWheyH2O: ResultItem = {
  id: 'p-myfitness',
  archetype: '02_product',
  source: 'internal',
  title: 'WHEY-H2O 20 Servings Whey Protein Powder',
  subtitle: 'MyFitness',
  logo: BRAND.myfitness.logo, logoBg: BRAND.myfitness.bg,
  productImage: PRODUCT_IMG.myfitnessWhey,
  cashback: { type: 'flat_inr', value: 30, prefix: 'flat' },
  originalPrice: '₹2,300',
  badge: { label: 'After Cashback of ₹30', tone: 'cashback' },
  ctaLabel: '₹1,499',
};

const prodWheyFitFuel: ResultItem = {
  id: 'p-myfitfuel',
  archetype: '02_product',
  source: 'internal',
  title: 'Advance Beginner Whey Protein Concentrate',
  subtitle: 'MyFitFuel',
  logo: BRAND.myfitfuel.logo, logoBg: BRAND.myfitfuel.bg,
  productImage: PRODUCT_IMG.myfitfuelWhey,
  cashback: { type: 'flat_inr', value: 21, prefix: 'flat' },
  originalPrice: '₹900',
  badge: { label: 'After Cashback of ₹21', tone: 'cashback' },
  ctaLabel: '₹837',
};

const prodElvMount: ResultItem = {
  id: 'p-elv-mount',
  archetype: '02_product',
  source: 'internal',
  title: 'Mobile Phone Mount Tabletop Holder',
  subtitle: 'ELV',
  logo: null,
  productImage: PRODUCT_IMG.phoneStand,
  cashback: { type: 'flat_inr', value: 4, prefix: 'flat' },
  originalPrice: '₹119',
  badge: { label: 'After Cashback of ₹4', tone: 'cashback' },
  ctaLabel: '₹119',
};

const prodPortronics: ResultItem = {
  id: 'p-portronics',
  archetype: '02_product',
  source: 'internal',
  title: 'Clamp M2 Adjustable Car Mobile Phone Holder',
  subtitle: 'Portronics',
  logo: BRAND.portronics.logo, logoBg: BRAND.portronics.bg,
  productImage: PRODUCT_IMG.carMount,
  cashback: { type: 'flat_inr', value: 3, prefix: 'flat' },
  originalPrice: '₹300',
  discount: '33% OFF',
  badge: { label: 'After Cashback of ₹3', tone: 'cashback' },
  ctaLabel: '₹229',
};

const prodElvTripod: ResultItem = {
  id: 'p-elv-tripod',
  archetype: '02_product',
  source: 'internal',
  title: 'Mobile Phone Mount Tripod Holder',
  subtitle: 'ELV',
  logo: null,
  productImage: PRODUCT_IMG.phoneTripod,
  cashback: { type: 'flat_inr', value: 6, prefix: 'flat' },
  originalPrice: '₹1,999',
  discount: '80% OFF',
  badge: { label: 'After ₹6 Cashback', tone: 'cashback' },
  ctaLabel: '₹324',
};

// ── 20 additional real products (real Wikimedia photos, ~2% cashback) ──────────
const mkProduct = (
  id: string,
  title: string,
  brand: string,
  image: number,
  cur: string,
  orig: string,
  cb: number,
): ResultItem => ({
  id,
  archetype: '02_product',
  source: 'internal',
  title,
  subtitle: brand,
  logo: null,
  productImage: image,
  cashback: { type: 'flat_inr', value: cb, prefix: 'flat' },
  originalPrice: orig,
  badge: { label: `After Cashback of ₹${cb}`, tone: 'cashback' },
  ctaLabel: cur,
});

const prodIphone15 = mkProduct('p-iphone-15', 'Apple iPhone 15 128GB Blue', 'Apple', PRODUCT_IMG.iphone15, '₹65,999', '₹79,900', 660);
const prodOneplus12 = mkProduct('p-oneplus-12', 'OnePlus 12 5G Flowy Emerald', 'OnePlus', PRODUCT_IMG.oneplus12, '₹59,999', '₹69,999', 600);
const prodSonyXm5 = mkProduct('p-sony-xm5', 'Sony WH-1000XM5 Wireless Headphones', 'Sony', PRODUCT_IMG.sonyXm5, '₹26,990', '₹34,990', 540);
const prodAirpodsPro = mkProduct('p-airpods-pro', 'Apple AirPods Pro (2nd Gen)', 'Apple', PRODUCT_IMG.airpodsPro, '₹21,900', '₹26,900', 440);
const prodBoatEarbuds = mkProduct('p-boat-airdopes', 'boAt Airdopes 141 TWS Earbuds', 'boAt', PRODUCT_IMG.earbuds, '₹1,099', '₹2,990', 22);
const prodAppleWatch = mkProduct('p-apple-watch-9', 'Apple Watch Series 9 GPS 41mm', 'Apple', PRODUCT_IMG.appleWatch, '₹41,900', '₹45,900', 420);
const prodPs5 = mkProduct('p-ps5', 'Sony PlayStation 5 Slim Console', 'Sony', PRODUCT_IMG.ps5, '₹49,990', '₹54,990', 500);
const prodKindle = mkProduct('p-kindle', 'Kindle Paperwhite 16GB (2024)', 'Amazon', PRODUCT_IMG.kindle, '₹14,999', '₹16,999', 300);
const prodLogitech = mkProduct('p-logitech-m240', 'Logitech M240 Silent Wireless Mouse', 'Logitech', PRODUCT_IMG.logiMouse, '₹995', '₹1,495', 20);
const prodJbl = mkProduct('p-jbl-flip6', 'JBL Flip 6 Portable Bluetooth Speaker', 'JBL', PRODUCT_IMG.jblSpeaker, '₹8,999', '₹11,999', 180);
const prodNike = mkProduct('p-nike-af1', "Nike Air Force 1 '07 White", 'Nike', PRODUCT_IMG.nikeAf1, '₹7,495', '₹9,295', 150);
const prodAdidas = mkProduct('p-adidas-ultraboost', 'Adidas Ultraboost Light Running Shoes', 'Adidas', PRODUCT_IMG.adidas, '₹10,999', '₹17,999', 220);
const prodLevis = mkProduct('p-levis-511', "Levi's 511 Slim Fit Jeans", "Levi's", PRODUCT_IMG.levis, '₹2,799', '₹3,999', 56);
const prodRayban = mkProduct('p-rayban-aviator', 'Ray-Ban Aviator Classic Sunglasses', 'Ray-Ban', PRODUCT_IMG.rayban, '₹6,790', '₹8,190', 135);
const prodCasio = mkProduct('p-casio-a159', 'Casio Vintage A159WA-N1 Watch', 'Casio', PRODUCT_IMG.casio, '₹4,295', '₹4,995', 85);
const prodLipstick = mkProduct('p-sugar-lipstick', 'SUGAR Matte As Hell Crayon Lipstick', 'SUGAR', PRODUCT_IMG.lipstick, '₹499', '₹799', 15);
const prodPerfume = mkProduct('p-bellavita-perfume', 'Bella Vita CEO Man Eau de Parfum', 'Bella Vita', PRODUCT_IMG.perfume, '₹699', '₹1,499', 21);
const prodFaceCream = mkProduct('p-mamaearth-cream', 'Mamaearth Vitamin C Face Cream', 'Mamaearth', PRODUCT_IMG.faceCream, '₹399', '₹599', 12);
const prodMuscleblaze = mkProduct('p-muscleblaze-whey', 'MuscleBlaze Biozyme Whey Protein 1kg', 'MuscleBlaze', PRODUCT_IMG.muscleblazeWhey, '₹3,799', '₹5,499', 76);
const prodOptimum = mkProduct('p-optimum-whey', 'Optimum Nutrition Gold Standard Whey 2lb', 'Optimum Nutrition', PRODUCT_IMG.optimumWhey, '₹4,199', '₹5,999', 84);

// ═════════════════════════════════════════════════════════════════════════════
// Cards — real fees, waivers, own-reward bullets, ratings, artwork (cards API)
// ═════════════════════════════════════════════════════════════════════════════
export const cardSbiCashback: ResultItem = {
  id: 'card-sbi-cashback',
  archetype: '05_credit_card',
  source: 'internal',
  title: 'SBI Cashback Credit Card',
  subtitle: 'SBI Card · Visa',
  logo: BRAND.sbiCard.logo, logoBg: BRAND.sbiCard.bg,
  artwork: ART.sbiCashback,
  issuerLogo: ISSUER.sbiCard,
  cashback: { type: 'flat_inr', value: 1400, prefix: 'flat' }, // CashKaro reward (design case)
  rating: { stars: 4, count: 413 },
  benefitTags: [
    { label: '5% online', tone: 'reward' },
    { label: '1% offline', tone: 'neutral' },
    { label: 'No merchant caps', tone: 'neutral' },
  ],
  benefitBullets: [
    { text: '5% cashback on all online spends — Amazon, Flipkart, Myntra & more (cap ₹2,000/cycle)' },
    { text: 'Auto-credit to statement · fee waived on ₹2 lakh annual spend' },
  ],
  fees: {
    state: 'fee',
    joining: '₹1,179',
    annual: '₹1,179',
    waiver: 'Annual fee waived on ₹2L yearly spend',
  },
  topPick: { reason: 'Highest flat cashback for this query' },
  ctaLabel: 'Get this card',
};

export const cardAxisFlipkart: ResultItem = {
  id: 'card-axis-flipkart-c',
  archetype: '06_cobranded_card',
  source: 'internal',
  title: 'Axis Flipkart Credit Card',
  subtitle: 'Axis Bank · Visa',
  logo: BRAND.axisBank.logo, logoBg: BRAND.axisBank.bg,
  artwork: ART.axisFlipkart,
  issuerLogo: ISSUER.axisBank,
  cashback: { type: 'flat_inr', value: 1500, prefix: 'flat' }, // design case
  rating: { stars: 4, count: 790 },
  benefitTags: [
    { label: '5% Flipkart', tone: 'reward' },
    { label: '7.5% Myntra', tone: 'reward' },
    { label: '4% Swiggy · Uber', tone: 'neutral' },
  ],
  benefitBullets: [
    { text: '5% cashback on Flipkart & Cleartrip (cap ₹4,000/quarter)' },
    { text: '₹250 Flipkart welcome voucher · unlimited 1% everywhere else' },
  ],
  fees: {
    state: 'fee',
    joining: 'Free',
    annual: '₹590',
    waiver: 'Annual fee waived on ₹3.5L yearly spend',
  },
  ctaLabel: 'Get this card',
};

export const cardFederalScapia: ResultItem = {
  id: 'card-federal-scapia',
  archetype: '06_cobranded_card',
  source: 'internal',
  title: 'Scapia Federal Bank Credit Card',
  subtitle: 'Federal Bank · Visa',
  logo: BRAND.federal.logo, logoBg: BRAND.federal.bg,
  artwork: ART.scapia,
  issuerLogo: ISSUER.scapia,
  cashback: { type: 'flat_inr', value: 550, prefix: 'flat' }, // design case
  rating: { stars: 4, count: 357 },
  benefitTags: [
    { label: '0% forex', tone: 'reward' },
    { label: 'Lounge access', tone: 'neutral' },
    { label: 'Lifetime free', tone: 'reward' },
  ],
  benefitBullets: [
    { text: 'Zero forex markup on all international spends' },
    { text: '10% Scapia Coins on every spend · unlimited domestic lounge on ₹10K/month' },
  ],
  fees: { state: 'free', joining: 'Lifetime Free', annual: 'Lifetime Free' },
  ctaLabel: 'Get this card',
};

// ── The rest of the card-tile frame's set (Figma 1696:5271, D105) ─────────────
// Three more cards so every tile in that frame exists in the catalog. What the frame
// states is transcribed (its own artwork, issuer wordmark, green line and "Flat ₹1400"
// figure); what it does not state is left off rather than filled in — none of the six
// tiles carries a card NAME, fees, tags or benefits, so these three are named off the
// art (`Elite`, `Live+` are printed on the plastic; the Axis swirl card prints no
// product name, so it stays issuer-level) and carry no invented rates or perks.
export const cardSbiElite: ResultItem = {
  id: 'card-sbi-elite',
  archetype: '05_credit_card',
  source: 'internal',
  title: 'SBI Card ELITE',
  subtitle: 'SBI Card · Visa',
  logo: BRAND.sbiCard.logo, logoBg: BRAND.sbiCard.bg,
  artwork: ART.sbiElite,
  issuerLogo: ISSUER.sbiCard,
  cashback: { type: 'flat_inr', value: 1400, prefix: 'flat' }, // the frame's own figure
  // The frame's green line on this tile is a superlative, not a fee fact — which is
  // exactly what a disclosed top-pick reason is (§6.6).
  topPick: { reason: 'Best Cashback Card' },
  // Added when ELITE started rendering as a FULL card in "More SBI cards" (D107).
  // The tile never needed these; a comparison card is nothing without them, and a
  // card with no fee strip at all reads as a broken row. SBI Card's own published
  // terms, indicative under the page's BFSI disclaimer — the tile frame still owns
  // the artwork, name and CashKaro figure above (D105).
  benefitTags: [
    { label: '₹5,000 welcome voucher', tone: 'reward' },
    { label: 'Lounge access', tone: 'neutral' },
    { label: '2X on dining', tone: 'neutral' },
  ],
  benefitBullets: [
    { text: 'Welcome e-gift voucher worth ₹5,000 · movie tickets worth ₹6,000 a year' },
    { text: 'Complimentary domestic & international lounge visits · 2X on dining' },
  ],
  fees: { state: 'fee', joining: '₹4,999', annual: '₹4,999' },
  ctaLabel: 'Get this card',
};

export const cardHsbcLivePlus: ResultItem = {
  id: 'card-hsbc-liveplus',
  archetype: '05_credit_card',
  source: 'internal',
  title: 'HSBC Live+ Credit Card',
  subtitle: 'HSBC · Visa Signature',
  // The frame's own HSBC wordmark doubles as this card's brand logo — the catalog's
  // BRAND map has no HSBC entry, and a favicon would be the blurry mark the tile rule
  // exists to keep off a tile.
  logo: ISSUER.hsbc, logoBg: 'transparent',
  artwork: ART.hsbcLivePlus,
  issuerLogo: ISSUER.hsbc,
  cashback: { type: 'flat_inr', value: 1400, prefix: 'flat' }, // the frame's own figure
  fees: { state: 'free', joining: 'Lifetime Free', annual: 'Lifetime Free' }, // frame: "Lifetime free"
  ctaLabel: 'Get this card',
};

export const cardAxisSwirl: ResultItem = {
  id: 'card-axis-swirl',
  archetype: '05_credit_card',
  source: 'internal',
  // The art prints no product name — only the Axis wordmark — so neither does this.
  title: 'Axis Bank Credit Card',
  subtitle: 'Axis Bank',
  logo: BRAND.axisBank.logo, logoBg: BRAND.axisBank.bg,
  artwork: ART.axisSwirl,
  issuerLogo: ISSUER.axisBank,
  cashback: { type: 'flat_inr', value: 1400, prefix: 'flat' }, // the frame's own figure
  fees: { state: 'free', joining: 'Lifetime Free', annual: 'Lifetime Free' }, // frame: "Lifetime free"
  ctaLabel: 'Get this card',
};

/** The card-tile frame's full set, in its own order (D105). */
export const ALL_CARD_TILES: ResultItem[] = [
  cardSbiElite,
  cardAxisSwirl,
  cardSbiCashback,
  cardHsbcLivePlus,
  cardFederalScapia,
  cardAxisFlipkart,
];

// ── The rest of the SBI shelf, for "More SBI cards" on the resolved-card page ──
// Fees, waivers and reward structures are SBI Card's own published terms, indicative
// and covered by the page's BFSI disclaimer (§6.7) — the same standing the loan APRs
// have (D089). The artwork is each card's own render from the great.cards
// `CreditCards/SBI` set (D107), so the card NETWORK is read off the plastic like
// everything else: SimplyCLICK's render is Visa Platinum, SimplySAVE's is RuPay.
//
// The CashKaro figure is the tile frame's own SBI number (Flat ₹1400, D105) rather
// than a per-card reward this project has no source for.
const SBI_CK_REWARD = cardSbiElite.cashback;

export const cardSbiSimplyClick: ResultItem = {
  id: 'card-sbi-simplyclick',
  archetype: '05_credit_card',
  source: 'internal',
  title: 'SBI SimplyCLICK Credit Card',
  subtitle: 'SBI Card · Visa Platinum', // as printed on the render
  logo: BRAND.sbiCard.logo, logoBg: BRAND.sbiCard.bg,
  artwork: ART.sbiSimplyClick,
  issuerLogo: ISSUER.sbiCard,
  cashback: SBI_CK_REWARD,
  benefitTags: [
    { label: '10X on partners', tone: 'reward' },
    { label: '5X online', tone: 'reward' },
    { label: 'Milestone vouchers', tone: 'neutral' },
  ],
  benefitBullets: [
    { text: '10X reward points on Amazon, Myntra, BookMyShow, Cleartrip & Yatra' },
    { text: '₹500 Amazon voucher on joining · 5X on all other online spends' },
  ],
  fees: {
    state: 'fee',
    joining: '₹499',
    annual: '₹499',
    waiver: 'Annual fee waived on ₹1L yearly spend',
  },
  ctaLabel: 'Get this card',
};

export const cardSbiSimplySave: ResultItem = {
  id: 'card-sbi-simplysave',
  archetype: '05_credit_card',
  source: 'internal',
  title: 'SBI SimplySAVE Credit Card',
  subtitle: 'SBI Card · RuPay Platinum', // as printed on the render
  logo: BRAND.sbiCard.logo, logoBg: BRAND.sbiCard.bg,
  artwork: ART.sbiSimplySave,
  issuerLogo: ISSUER.sbiCard,
  cashback: SBI_CK_REWARD,
  benefitTags: [
    { label: '10X dining', tone: 'reward' },
    { label: '10X groceries', tone: 'reward' },
    { label: '10X movies', tone: 'reward' },
  ],
  benefitBullets: [
    { text: '10X reward points on dining, movies, groceries & departmental stores' },
    { text: '2,000 bonus points on ₹2,000 spend in the first 60 days' },
  ],
  fees: {
    state: 'fee',
    joining: '₹499',
    annual: '₹499',
    waiver: 'Annual fee waived on ₹1L yearly spend',
  },
  ctaLabel: 'Get this card',
};

/**
 * The SBI shelf a resolved SBI card sits on — every SBI card in the catalog except
 * the one already shown as the hero, as FULL comparison cards (D107). ELITE leads:
 * it is the one the tile frame calls "Best Cashback Card".
 */
export const MORE_SBI_CARDS: ResultItem[] = [cardSbiElite, cardSbiSimplyClick, cardSbiSimplySave];

// ═════════════════════════════════════════════════════════════════════════════
// CASE A · Resolved retail store — "flip" → Flipkart
// ═════════════════════════════════════════════════════════════════════════════
export const caseFlip: SerpModel = {
  query: 'flip',
  archetype: '01_store',
  context: { label: 'Best match for “flip”', count: null },
  hero: {
    id: 'store-flipkart',
    archetype: '01_store',
    source: 'internal',
    title: 'Flipkart',
    subtitle: '23K shopping this month',
    logo: BRAND.flipkart.logo, logoBg: BRAND.flipkart.bg,
    cashback: { type: 'pct_single', value: 7 },
    ratingValue: 4.5,
    shoppers: '2.3L shoppers',
    priorPct: 6,
    heroTint: '#fff8e1',
    timelines: { tracksIn: '48 Hours', confirmsIn: '60 Days', withdraw: 'UPI/Bank' },
    ctaLabel: 'Shop & Earn',
  },
  tabs: ['all', 'stores', 'cards', 'products'],
  sections: [
    {
      kind: 'stores',
      title: 'Stores',
      count: 3,
      items: storeTilesByKeys(['croma', 'amazon', 'ajio'], 'flip'),
    },
    { kind: 'deals', title: 'Deals', count: 8, items: [dealCroma, dealAmazon, dealAjio, dealKlook] },
    {
      kind: 'cards',
      title: 'Cards for Flipkart',
      count: 1,
      items: [cardAxisFlipkart], // scoped to THIS store only (§4A)
      disclaimer: 'Rates & fees are indicative and subject to change by the respective bank/NBFC.',
    },
    { kind: 'products', title: 'Products', count: 60, items: [prodGalaxyS24, prodIphone15, prodOneplus12, prodSonyXm5, prodAirpodsPro, prodBoatEarbuds, prodAppleWatch, prodPs5, prodKindle, prodJbl, prodLogitech, prodNike, prodAdidas, prodLevis, prodRayban, prodCasio, prodElvMount, prodPortronics] },
    {
      kind: 'coupons',
      title: 'Coupons & offers',
      count: 2,
      items: [
        { id: 'cpn-1', archetype: '13_campaign', source: 'internal', title: 'Extra 10% off', subtitle: 'on orders above ₹1,999', logo: null, cashback: { type: 'none' }, code: 'FLIP10', expiry: 'Ends in 2 days' },
        { id: 'cpn-2', archetype: '13_campaign', source: 'internal', title: 'Flat ₹300 off', subtitle: 'for new users', logo: null, cashback: { type: 'none' }, code: 'NEW300', expiry: '5 days left' },
      ],
    },
    {
      kind: 'campaign',
      title: 'Sale campaigns',
      items: [
        { id: 'camp-1', archetype: '13_campaign', source: 'internal', title: 'Big Billion Days', subtitle: 'Up to 80% off + extra cashback', logo: null, cashback: { type: 'none' }, live: true, bannerImage: require('../../assets/campaigns/big-billion-days-banner.png'), bannerAspect: 1740 / 600 },
      ],
    },
  ],
  expandSearch: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE A · "body" → The Body Shop (+ alternates, categories, products)
// ═════════════════════════════════════════════════════════════════════════════
export const caseBody: SerpModel = {
  query: 'body',
  archetype: '01_store',
  context: { label: 'Best match for “body”', count: null },
  hero: {
    id: 'store-bodyshop',
    archetype: '01_store',
    source: 'internal',
    title: 'The Body Shop',
    subtitle: '23K shopping this month',
    logo: BRAND.bodyshop.logo, logoBg: BRAND.bodyshop.bg,
    cashback: { type: 'flat_inr', value: 200, prefix: 'flat' },
    ratingValue: 4.4,
    shoppers: '48K shoppers',
    heroTint: '#e8f3ec',
    timelines: { tracksIn: '72 Hours', confirmsIn: '75 Days', withdraw: 'UPI/Bank' },
    ctaLabel: 'Shop & Earn',
  },
  tabs: ['all', 'stores', 'categories', 'products'],
  sections: [
    {
      kind: 'stores',
      title: 'Stores',
      count: 4,
      items: storeTilesByKeys(['foxtale', 'mamaearth', 'dermaCo', 'dotKey'], 'body'),
    },
    { kind: 'deals', title: 'Deals', count: 8, items: [dealS3Beauty, dealAmazon, dealAjio, dealCroma] },
    {
      kind: 'categories',
      title: 'Product Categories',
      count: 3,
      items: [
        { id: 'c-lotions', archetype: '04_category', source: 'internal', title: 'Lotions & Massage Oil', logo: null, cashback: { type: 'none' } },
        { id: 'c-deo', archetype: '04_category', source: 'internal', title: 'Deodorants', logo: null, cashback: { type: 'none' } },
        { id: 'c-bath', archetype: '04_category', source: 'internal', title: 'Bath & Body', logo: null, cashback: { type: 'none' } },
      ],
    },
    { kind: 'products', title: 'Products', count: 1099, items: [prodHsnMagnesium, prodMahabhringraj, prodLipstick, prodPerfume, prodFaceCream] },
  ],
  expandSearch: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE A · "phar" → PharmEasy
// ═════════════════════════════════════════════════════════════════════════════
export const casePhar: SerpModel = {
  query: 'phar',
  archetype: '01_store',
  context: { label: 'Best match for “phar”', count: null },
  hero: {
    id: 'store-pharmeasy',
    archetype: '01_store',
    source: 'internal',
    title: 'PharmEasy',
    subtitle: '23K shopping this month',
    logo: BRAND.pharmeasy.logo, logoBg: BRAND.pharmeasy.bg,
    cashback: { type: 'pct_single', value: 7 },
    ratingValue: 4.6,
    shoppers: '1.2L shoppers',
    priorPct: 5,
    heroTint: '#e6f4f2',
    timelines: { tracksIn: '48 Hours', confirmsIn: '90 Days', withdraw: 'UPI/Bank' },
    ctaLabel: 'Shop & Earn',
  },
  tabs: ['all', 'stores', 'categories', 'products'],
  sections: [
    {
      kind: 'stores',
      title: 'Stores',
      count: 3,
      items: storeTilesByKeys(['hyugalife', 'hkVitals', 'nutrabay'], 'phar'),
    },
    { kind: 'categories', title: 'Store Categories', count: 1, items: [{ id: 'c-pharmacy', archetype: '04_category', source: 'internal', title: 'Pharmacy', logo: null, cashback: { type: 'none' } }] },
    { kind: 'products', title: 'Products', count: 2, items: [prodHsnMagnesium, prodMahabhringraj] },
  ],
  expandSearch: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE A/G · "mobile" — category-led with real accessories (design case)
// ═════════════════════════════════════════════════════════════════════════════
export const caseMobile: SerpModel = {
  query: 'mobile',
  archetype: '02_product',
  context: { label: 'Results for “mobile”', count: 3 },
  hero: null,
  tabs: ['all', 'stores', 'categories', 'products'],
  sections: [
    {
      kind: 'stores',
      title: 'Stores',
      count: 2,
      items: storeTilesByKeys(['croma', 'amazon'], 'mobile'),
    },
    { kind: 'deals', title: 'Deals', count: 4, items: [dealCroma, dealAmazon, dealKlook] },
    { kind: 'categories', title: 'Product Categories', count: 1, items: [{ id: 'c-mobiles', archetype: '04_category', source: 'internal', title: 'Mobile Phones', logo: null, cashback: { type: 'none' } }] },
    { kind: 'products', title: 'Products', count: 45, items: [prodIphone15, prodOneplus12, prodGalaxyS24, prodElvMount, prodPortronics, prodElvTripod] },
  ],
  expandSearch: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE A · "tira" — thin single-store result (design case)
// ═════════════════════════════════════════════════════════════════════════════
export const caseTira: SerpModel = {
  query: 'tira',
  archetype: '01_store',
  context: { label: 'Best match for “tira”', count: null },
  hero: {
    id: 'store-tira',
    archetype: '01_store',
    source: 'internal',
    title: 'Tira',
    subtitle: 'Beauty & personal care',
    logo: BRAND.tira.logo, logoBg: BRAND.tira.bg,
    cashback: { type: 'pct_single', value: 4 },
  },
  tabs: null,
  sections: [{ kind: 'deals', title: 'Deals', count: 8, items: [dealS3Beauty, dealCroma] }],
  expandSearch: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// "whey" — product-led, thin coverage → Expand Search territory (Case G)
// ═════════════════════════════════════════════════════════════════════════════
export const caseWhey: SerpModel = {
  query: 'whey',
  archetype: '02_product',
  context: { label: '313 results for “whey”', count: 313 },
  hero: null,
  tabs: ['all', 'categories', 'products'],
  sections: [
    { kind: 'categories', title: 'Product Categories', count: 1, items: [{ id: 'c-whey', archetype: '04_category', source: 'internal', title: 'Whey Protein', logo: null, cashback: { type: 'none' } }] },
    { kind: 'products', title: 'Products', count: 313, items: [prodWheyH2O, prodWheyFitFuel, prodMuscleblaze, prodOptimum] },
  ],
  expandSearch: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE C · Broad banking category — "credit"
// ═════════════════════════════════════════════════════════════════════════════
export const caseCredit: SerpModel = {
  query: 'credit',
  archetype: '05_credit_card',
  context: { label: '3 cards for “credit” · ranked by CashKaro reward', count: 3 },
  hero: null,
  // No tab row on a cards page (D062): the only split it offered was Credit Cards
  // vs Co-branded, and there are no co-branded cards in the product, so both pills
  // resolved to the same three cards. `caseCards` reads this, so it follows.
  tabs: null,
  sections: [
    {
      kind: 'cards',
      title: 'Cards',
      count: 3,
      items: [cardSbiCashback, cardAxisFlipkart, cardFederalScapia],
      disclaimer: 'Rates & fees are indicative and subject to change by the respective bank/NBFC.',
    },
  ],
  expandSearch: false,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE B · Golden screen — resolved single card
// ═════════════════════════════════════════════════════════════════════════════
export const caseB: SerpModel = {
  query: 'sbi cashback card',
  archetype: '05_credit_card',
  context: { label: 'Best match for “sbi cashback card”', count: null },
  hero: cardSbiCashback,
  tabs: null,
  sections: [
    {
      // The rest of the hero's OWN issuer, as full comparison cards, above the
      // cross-issuer tile rail (D107): "more from this bank" is a narrower, more
      // certain intent than "cards like this one", so it reads first and it reads
      // in the shape you compare in — the stack, not the rail.
      kind: 'cards',
      title: 'More SBI cards',
      count: MORE_SBI_CARDS.length,
      items: MORE_SBI_CARDS,
    },
    {
      kind: 'similar_cards',
      title: 'Similar cards',
      // Every card in the tile frame's set except the one already shown as the hero
      // (D105) — the rail is tiles, so the three cards that exist only as tiles belong
      // here rather than in a comparison stack that would render their empty halves.
      // Also minus anything the "More SBI cards" stack above already states in full
      // (D107): ELITE as a tile under its own full card is the same card twice.
      items: ALL_CARD_TILES.filter(
        (c) => c.id !== cardSbiCashback.id && !MORE_SBI_CARDS.some((s) => s.id === c.id),
      ),
      disclaimer: 'Rates & fees are indicative and subject to change by the respective bank/NBFC.',
    },
  ],
  expandSearch: false,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE D · Amount-specific loan — indicative market rates for ₹5,00,000 / 60 mo.
// Figures are representative (subject to the disclaimer), not a live feed.
// ═════════════════════════════════════════════════════════════════════════════
type LoanSpec = {
  logo?: string | number | null;
  logoBg?: string;
  apr: number; // numeric, for the low→high ranking
  aprDisplay: string; // preformatted, e.g. "10.49% p.a."
  emi: string; // preformatted, e.g. "₹10,744/mo"
  tenure: string; // e.g. "60 months"
  processingFee: string; // e.g. "Up to 2%"
  bullets: string[];
  topPick?: string;
};

/**
 * CashKaro's own reward on a personal loan — NOT invented, and not a rate: it is the
 * figure the Storepage Tiles frame prints on its loan merchants (611:3360, rows 10–12).
 * All nine loan tiles there carry the same "Flat 1%" with the REWARDS caption, so it is
 * read off the set by key rather than restated here. Axis and HDFC are in that set by
 * name; a lender that isn't (Bajaj Finserv) takes the same class figure, because every
 * loan tile in the source agrees on it (D089).
 */
const LOAN_REWARD = storeTileByKey('axisBank')!.cashback;

const loanItem = (id: string, title: string, spec: LoanSpec): ResultItem => ({
  id,
  archetype: '07_loan',
  source: 'internal',
  title,
  subtitle: `EMI ${spec.emi} · ₹5,00,000`,
  logo: spec.logo ?? null,
  logoBg: spec.logoBg,
  cashback: LOAN_REWARD,
  // The loan vertical earns REWARDS, not CASHBACK — the tile set's own caption for a
  // loan merchant, and what the card's pill says.
  cashbackCaption: 'REWARDS',
  rate: { kind: 'cost', value: spec.apr, display: spec.aprDisplay, note: 'onwards' },
  // The loan card states the EMI as its own labelled figure, so it reads the
  // structured field rather than re-parsing it back out of `subtitle` (D089).
  emi: spec.emi,
  fees: { state: 'fee', joining: spec.processingFee, annual: spec.tenure },
  benefitBullets: spec.bullets.map((text) => ({ text })),
  topPick: spec.topPick ? { reason: spec.topPick } : null,
  ctaLabel: 'Check eligibility',
});

export const caseAmountLoan: SerpModel = {
  query: '₹5,00,000 personal loan',
  archetype: '07_loan',
  // One results line, worded like every other finance category page (D103). The
  // ₹5,00,000 the query asked for is on every card ("EMI ₹10,744/mo · ₹5,00,000"),
  // so dropping it from the header repeats nothing and loses nothing.
  context: { label: 'Showing 3 Personal Loans', count: 3 },
  hero: null,
  tabs: null,
  sections: [
    {
      kind: 'loans',
      title: 'Personal loans',
      count: 3,
      items: [
        loanItem('loan-1', 'Axis Bank Personal Loan', {
          logo: LENDER.axis.logo,
          logoBg: LENDER.axis.bg,
          apr: 10.49,
          aprDisplay: '10.49% p.a.',
          emi: '₹10,744/mo',
          tenure: '60 months',
          processingFee: 'Up to 2%',
          bullets: ['Disbursal in 24 hours', 'No collateral or guarantor'],
          topPick: 'Lowest APR for this amount',
        }),
        loanItem('loan-2', 'HDFC Bank Personal Loan', {
          logo: LENDER.hdfc.logo,
          logoBg: LENDER.hdfc.bg,
          apr: 11.25,
          aprDisplay: '11.25% p.a.',
          emi: '₹10,933/mo',
          tenure: '60 months',
          processingFee: '1.5% + GST',
          bullets: ['100% digital process', 'Flexible tenure up to 5 years'],
        }),
        loanItem('loan-3', 'Bajaj Finserv Personal Loan', {
          logo: LENDER.bajajFinserv.logo,
          logoBg: LENDER.bajajFinserv.bg,
          apr: 11.9,
          aprDisplay: '11.90% p.a.',
          emi: '₹11,097/mo',
          tenure: '84 months',
          processingFee: 'Up to 3.93%',
          bullets: ['Instant online approval', 'Part-prepayment at no extra charge'],
        }),
      ],
      disclaimer: 'Rates & fees are indicative and subject to change by the respective bank/NBFC.',
    },
  ],
  expandSearch: false,
};

// ═════════════════════════════════════════════════════════════════════════════
// Broad finance-intent queries — "loans", "cards". Category-level searches with
// no store or product to match, so without these they fell through `buildSerp`
// to the recovery screen. Both REUSE the transcribed sections above (single
// source for every rate, EMI and fee — nothing is restated here) and only
// re-label the context line: the amount-specific header ("Lowest EMI for
// ₹5,00,000") and the "for “credit”" echo are both wrong for a broad query.
// ═════════════════════════════════════════════════════════════════════════════
const loanSection = caseAmountLoan.sections[0];
export const caseLoans: SerpModel = {
  query: 'loans',
  archetype: '07_loan',
  context: {
    // Same shape as the cards page's line ("Showing 3 Credit Cards", D103) — the
    // ranking clause goes with it, exactly as it did there (D096).
    label: `Showing ${loanSection.items.length} Personal Loans`,
    count: loanSection.items.length,
  },
  hero: null,
  tabs: null,
  sections: [loanSection],
  expandSearch: false,
};

const cardSection = caseCredit.sections[0];
export const caseCards: SerpModel = {
  query: 'cards',
  archetype: '05_credit_card',
  context: {
    label: `${cardSection.items.length} credit cards · ranked by CashKaro reward`,
    count: cardSection.items.length,
  },
  hero: null,
  tabs: caseCredit.tabs,
  sections: [cardSection],
  expandSearch: false,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE E · Feature-specific savings — indicative zero-balance account rates.
// Figures are representative (subject to the disclaimer), not a live feed.
// ═════════════════════════════════════════════════════════════════════════════
type SavingsSpec = {
  logo?: string | number | null;
  logoBg?: string;
  interest: number; // numeric, for the high→low ranking
  interestDisplay: string; // preformatted, e.g. "Up to 7.25% p.a."
  minBalance: string; // e.g. "₹0"
  credited: string; // interest credit frequency, e.g. "Monthly"
  bullets: string[];
  topPick?: string;
};

const savingsItem = (id: string, title: string, subtitle: string, spec: SavingsSpec): ResultItem => ({
  id,
  archetype: '12_bank_savings',
  source: 'internal',
  title,
  subtitle,
  logo: spec.logo ?? null,
  logoBg: spec.logoBg,
  cashback: { type: 'none' },
  rate: { kind: 'reward', value: spec.interest, display: spec.interestDisplay, note: 'interest' },
  fees: { state: 'fee', joining: spec.minBalance, annual: spec.credited },
  benefitBullets: spec.bullets.map((text) => ({ text })),
  topPick: spec.topPick ? { reason: spec.topPick } : null,
  ctaLabel: 'Open account',
});

export const caseSavings: SerpModel = {
  query: 'zero balance savings account',
  archetype: '12_bank_savings',
  context: { label: 'Showing 3 Savings Accounts', count: 3 },
  hero: null,
  tabs: null,
  sections: [
    {
      kind: 'savings',
      title: 'Savings accounts',
      count: 3,
      items: [
        savingsItem('sav-1', 'AU Small Finance Bank', 'Zero-balance digital savings', {
          logo: brandLogo('aubank.in'),
          logoBg: '#6a1b9a14',
          interest: 7.25,
          interestDisplay: 'Up to 7.25% p.a.',
          minBalance: '₹0',
          credited: 'Monthly',
          bullets: ['Zero balance · full digital KYC', 'Free virtual debit card'],
          topPick: 'Highest interest in this set',
        }),
        savingsItem('sav-2', 'IDFC FIRST Bank', 'Zero-balance digital savings', {
          logo: brandLogo('idfcfirstbank.com'),
          logoBg: '#9c132e14',
          interest: 4.0,
          interestDisplay: '4.00% p.a.',
          minBalance: '₹0',
          credited: 'Monthly',
          bullets: ['Monthly interest credit', 'Zero-fee digital banking'],
        }),
        savingsItem('sav-3', 'Kotak 811', 'Zero-balance digital savings', {
          logo: brandLogo('kotak.com'),
          logoBg: '#e2001a14',
          interest: 3.5,
          interestDisplay: '3.50% p.a.',
          minBalance: '₹0',
          credited: 'Quarterly',
          bullets: ['100% digital 811 account', 'UPI + free virtual card'],
        }),
      ],
      disclaimer: 'Rates & fees are indicative and subject to change by the respective bank/NBFC.',
    },
  ],
  expandSearch: false,
};

// ═════════════════════════════════════════════════════════════════════════════
// CASE G · Web results streamed by Expand Search (products only)
// ═════════════════════════════════════════════════════════════════════════════
export const webResultsForWhey: ResultItem[] = [
  {
    id: 'web-1',
    archetype: '10_beyond_catalogue',
    source: 'google_shopping',
    title: 'Optimum Nutrition Gold Standard Whey',
    subtitle: 'ON',
    // Real white-background product photo (same asset the catalog SKU uses), not
    // the brand logo — a web result is still a product card (D003).
    productImage: PRODUCT_IMG.optimumWhey,
    logo: BRAND.optimum.logo, logoBg: BRAND.optimum.bg,
    cashback: { type: 'none' }, // unmapped merchant → NO cashback element
    mappedPartnerId: null,
    ctaLabel: '₹3,499',
  },
  {
    id: 'web-2',
    archetype: '10_beyond_catalogue',
    source: 'google_shopping',
    title: 'MuscleBlaze Biozyme Performance Whey',
    subtitle: 'MuscleBlaze',
    productImage: PRODUCT_IMG.muscleblazeWhey,
    logo: BRAND.muscleblaze.logo, logoBg: BRAND.muscleblaze.bg,
    cashback: { type: 'pct_single', value: 6 }, // mapped partner → badge
    mappedPartnerId: 'muscleblaze',
    badge: { label: 'Upto 6% Cashback', tone: 'cashback' },
    ctaLabel: '₹2,199',
  },
  // The rail is built for N results; these two are unmapped merchants, so they
  // carry no cashback element. Prices transcribed from the live listing
  // (nutrabay.com, 2026-07-28) — nothing here is estimated.
  {
    id: 'web-3',
    archetype: '10_beyond_catalogue',
    source: 'google_shopping',
    title: 'Isopure Zero Carb 100% Whey Isolate 1kg',
    subtitle: 'Isopure',
    productImage: PRODUCT_IMG.isopureWhey,
    logo: null, // unmapped merchant — no CashKaro brand tile for it
    cashback: { type: 'none' },
    mappedPartnerId: null,
    ctaLabel: '₹7,129',
    originalPrice: '₹7,999',
  },
  {
    id: 'web-4',
    archetype: '10_beyond_catalogue',
    source: 'google_shopping',
    title: 'MyProtein Impact Whey Protein 1kg',
    subtitle: 'MyProtein',
    productImage: PRODUCT_IMG.myproteinWhey,
    logo: null,
    cashback: { type: 'none' },
    mappedPartnerId: null,
    ctaLabel: '₹3,399',
    originalPrice: '₹4,999',
  },
];

export const REAL_CASES: Record<string, SerpModel> = {
  flip: caseFlip,
  body: caseBody,
  phar: casePhar,
  mobile: caseMobile,
  tira: caseTira,
  whey: caseWhey,
  credit: caseCredit,
  'best cashback card': caseCredit, // SBI Cashback leads the cards SERP
  'sbi cashback card': caseB,
  '₹5,00,000 personal loan': caseAmountLoan,
  'zero balance savings account': caseSavings,
};

/**
 * Finance-vertical intent → that vertical's results page. Runs AFTER `REAL_CASES`
 * (so "sbi cashback card", "credit" and "₹5,00,000 personal loan" keep their own
 * pages) and BEFORE `buildSerp`, which has nothing to match a bare "loans" or
 * "credit cards" against and would drop the query on the recovery screen.
 * Word-boundary matched, so it fires on the word — "loan", "loans", "personal
 * loans", "card", "credit cards" — and never on a substring of a store or
 * product name.
 */
export function financeSerp(query: string): SerpModel | undefined {
  const q = query.trim().toLowerCase();
  if (/\bloans?\b/.test(q)) return caseLoans;
  if (/\bcards?\b/.test(q)) return caseCards;
  return undefined;
}

// ═════════════════════════════════════════════════════════════════════════════
// Suggestions (W3 · Aura, Figma 1646:7462) — result-type-grouped type-ahead.
// Each row routes (`goto`) to a real result page so search works end-to-end and
// the screen doubles as the "what leads where" guide.
// ═════════════════════════════════════════════════════════════════════════════
import { SuggestGroup, SuggestGroupKind, SuggestRow } from '../components/Suggestions';
import { STORES, PRODUCTS, searchProducts, productsInCategory, type Cat } from './catalog';
import { categoryIcon } from './categoryIcons';
import { productCategories, categoryStats, SUB_LABELS } from './productCategories';
import { score } from './matchScore';

// ═════════════════════════════════════════════════════════════════════════════
// "View all" verticals — one full-page list per result type (§ side-panel nav).
// Each vertical aggregates every item of its kind(s) across the real SERP cases,
// deduped by id, so a single generic ViewAll screen can browse the whole set.
// ═════════════════════════════════════════════════════════════════════════════
export type Vertical = {
  key: string;
  title: string;
  kind: import('./dataContract').SectionKind;
  items: ResultItem[];
};

function itemsOfKind(kinds: import('./dataContract').SectionKind[]): ResultItem[] {
  const seen = new Set<string>();
  const out: ResultItem[] = [];
  for (const model of Object.values(REAL_CASES)) {
    for (const section of model.sections) {
      if (!kinds.includes(section.kind)) continue;
      for (const item of section.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return out;
}

const ALL_VERTICALS: Vertical[] = [
  // Every Storepage brand once each — the catalog has more store slots than the
  // frame has tiles, so aggregating per category would repeat brands.
  { key: 'stores', title: 'Stores', kind: 'stores', items: allStoreTileItems('all') },
  { key: 'products', title: 'Products', kind: 'products', items: itemsOfKind(['products']) },
  { key: 'cards', title: 'Credit Cards', kind: 'cards', items: itemsOfKind(['cards', 'similar_cards']) },
  { key: 'loans', title: 'Loans', kind: 'loans', items: itemsOfKind(['loans']) },
  { key: 'savings', title: 'Savings Accounts', kind: 'savings', items: itemsOfKind(['savings']) },
  { key: 'coupons', title: 'Coupons & Offers', kind: 'coupons', items: itemsOfKind(['coupons']) },
  { key: 'deals', title: 'Deals', kind: 'deals', items: ALL_DEALS },
];

export const VIEW_ALL_VERTICALS: Vertical[] = ALL_VERTICALS.filter((v) => v.items.length > 0);

function cbLabel(cb: import('./dataContract').Cashback): { prefix?: string; value?: string; meta?: string } {
  if (cb.type === 'none') return { meta: 'Visit store' };
  if (cb.type === 'flat_inr') return { prefix: cb.prefix === 'upto' ? 'Up to' : 'Flat', value: `₹${cb.value.toLocaleString('en-IN')}` };
  if (cb.type === 'pct_single') return { prefix: 'Up to', value: `${cb.value}%` };
  return { prefix: 'Up to', value: `${cb.max}%` };
}

// ═════════════════════════════════════════════════════════════════════════════
// The type-ahead's candidate pool + relevance ranking (D115)
//
// Every row is a REAL candidate scored against the query with the one shared
// scorer (./matchScore.ts), so a type only appears when the query actually reaches
// it and the whole list can be ordered by match strength: "credit" scores 84 on the
// credit-card intent and 0 on every store, so the cards lead. Nothing is templated
// onto the query string any more — the engine that produced "credit facewash",
// "credit coupons & deals" and a fixed Big Billion Days row for EVERY query is gone.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * What a query has to say for a whole result TYPE to be relevant, independent of any
 * one item in it — the vocabulary a user reaches these verticals with. A card row
 * therefore ranks on the better of its own name match and its type's intent match,
 * which is what makes "credit", "cc" or "lifetime free" open with cards while "sbi"
 * still puts the SBI cards above the rest of the set.
 */
const SUGGEST_INTENT: Partial<Record<SuggestGroupKind, string[]>> = {
  credit_cards: ['credit card', 'credit cards', 'credit', 'card', 'cards', 'cc', 'cashback card', 'visa', 'rupay', 'mastercard', 'lifetime free', 'forex', 'lounge access', 'no annual fee'],
  loans: ['loan', 'loans', 'personal loan', 'personal loans', 'instant loan', 'emi', 'borrow', 'apr'],
  savings: ['savings account', 'savings accounts', 'savings', 'zero balance', 'zero balance account', 'bank account', 'interest rate', 'digital savings'],
  offers: ['coupon', 'coupons', 'coupon code', 'promo code', 'offer', 'offers', 'discount', 'deal', 'deals', 'voucher'],
  campaigns: ['sale', 'campaign', 'festive sale', 'live now'],
};

const intentScore = (query: string, kind: SuggestGroupKind): number =>
  score(query, (SUGGEST_INTENT[kind] ?? []).map((text) => ({ text, weight: 0.95 })));

/**
 * Below this a "match" is a coincidence, not a suggestion — a bare subsequence hit
 * scores 26, so the floor sits just above it.
 */
const SUGGEST_FLOOR = 30;

/**
 * Per-type row caps — a long tail guard, NOT an editorial cut. A type that matched is
 * never dropped from the list, it is only ranked below the type that matched better:
 * "beauty" still offers the Beauty category page AND the beauty completions AND the
 * beauty stores, in that order. The cap only stops one very broad type ("a", "pro",
 * "watch" can each hit dozens of rows) from burying every other type below a screen of
 * itself, and it stays silent — no "See all" row, which D088 correctly found spends a
 * row to hide two — because the ranking already put that type's best rows first.
 */
const SUGGEST_CAP: Record<SuggestGroupKind, number> = {
  stores: 8,
  products: 6,
  categories: 5,
  credit_cards: 6,
  cobranded: 0, // folded into credit_cards (D087)
  loans: 3,
  savings: 3,
  offers: 3,
  campaigns: 2,
};

const SUGGEST_LABEL: Record<SuggestGroupKind, string> = {
  stores: 'Stores',
  products: 'Products',
  categories: 'Categories',
  credit_cards: 'Credit Cards',
  cobranded: 'Co-branded Cards',
  loans: 'Loans',
  savings: 'Savings Accounts',
  offers: 'Offers',
  campaigns: 'Campaigns',
};

type ScoredRow = { s: number; row: SuggestRow };

/** Floor → sort → cap → group. Returns null when the query didn't reach this type. */
function suggestGroup(kind: SuggestGroupKind, rows: ScoredRow[]): SuggestGroup | null {
  const keep = rows
    .filter((r) => r.s >= SUGGEST_FLOOR)
    .sort((a, b) => b.s - a.s)
    .slice(0, SUGGEST_CAP[kind]);
  if (!keep.length) return null;
  return { kind, label: SUGGEST_LABEL[kind], rows: keep.map((r) => ({ ...r.row, score: Math.round(r.s) })) };
}

/**
 * Real product COMPLETIONS — the catalog's own keyword and sub-category vocabulary,
 * deduped, each carrying the categories it lives in. A completion row can then be a
 * term the catalog can actually answer ("whey protein", "earbuds", "sunscreen") with
 * a counted result line, instead of the typed query with a hard-coded noun stapled to
 * it. Built once, lazily — `PRODUCTS` is on the far side of the catalog↔realData
 * cycle, so it must not be read at module-eval (same rule as productCategories()).
 */
type Completion = { term: string; cats: Cat[]; sub: string; n: number };
let completionPool: Completion[] | null = null;
function completions(): Completion[] {
  if (completionPool) return completionPool;
  const byTerm = new Map<string, Completion>();
  for (const p of PRODUCTS) {
    const terms = [...p.keywords, (SUB_LABELS[p.sub] ?? p.sub).toLowerCase()];
    for (const raw of terms) {
      const term = raw.trim().toLowerCase();
      if (term.length < 3) continue;
      const at = byTerm.get(term);
      if (!at) byTerm.set(term, { term, cats: [p.category], sub: p.sub, n: 1 });
      else {
        at.n += 1;
        if (!at.cats.includes(p.category)) at.cats.push(p.category);
      }
    }
  }
  completionPool = [...byTerm.values()];
  return completionPool;
}

/** The sub-categories a catalog category actually stocks, in SUB_LABELS order. */
function subsOf(cat: Cat): string[] {
  const subs = new Set(productsInCategory(cat).map((p) => p.sub));
  return Object.keys(SUB_LABELS).filter((k) => subs.has(k));
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/**
 * Type-ahead suggestions for `query` — every result type the query reaches, each row
 * carrying the `score` the component ranks the flat list by (D115).
 */
export function buildSuggestions(query: string): SuggestGroup[] {
  const q = query.trim();
  if (!q) return [];

  // A products row's lead rolls through the SKUs that completion actually returns
  // (D088) — its own matches first, topped up from the category it searches in, so
  // there are always real photos to roll. Resolved here, not in the component
  // (D004), and at call time, which keeps it clear of the catalog↔realData cycle.
  const skuStack = (completion: string, cat: Cat, from = 0): number[] => {
    const out: number[] = [];
    const push = (img?: number | null) => {
      if (img != null && !out.includes(img) && out.length < 3) out.push(img);
    };
    searchProducts(completion).forEach((r) => push(r.productImage));
    if (out.length < 3) {
      // `from` rotates the category top-up, so two completions that both fall back to
      // the same category don't open their reels on the same photo.
      const pool = productsInCategory(cat);
      pool.forEach((_, i) => push(PRODUCT_IMG[pool[(i + from) % pool.length].imgKey]));
    }
    return out;
  };

  // ── Stores — name, then aliases, then the weaker category/note context ──────
  const storeRows: ScoredRow[] = STORES.map((st) => {
    const c = cbLabel(st.cashback);
    const s =
      score(q, [
        { text: st.name },
        ...st.aliases.map((a) => ({ text: a, weight: 0.96 })),
        { text: st.category, weight: 0.62 },
        ...(st.note ? [{ text: st.note, weight: 0.4 }] : []),
      ]) + (st.live ? 2 : 0); // gently favour live-verified rates, as searchStores does
    return {
      s,
      row: {
        kind: 'store' as const,
        title: st.name,
        logo: st.brand ? BRAND[st.brand].logo : null,
        cashbackPrefix: c.prefix,
        cashbackValue: c.value,
        meta: c.meta,
        goto: st.name.toLowerCase(),
      },
    };
  });

  // ── Product completions — real catalog terms with counted result lines ──────
  const completionRows: ScoredRow[] = completions().map((c, i) => {
    const label = SUB_LABELS[c.sub] ?? c.sub;
    const s =
      score(q, [{ text: c.term }, { text: label, weight: 0.7 }, ...c.cats.map((cat) => ({ text: cat, weight: 0.5 }))]) +
      Math.min(c.n, 6) * 0.5; // inventory as the tiebreak — the fuller term first
    // Counted from the same resolver the tap runs, so the row and the page agree.
    const n = searchProducts(c.term).length;
    return {
      s: n ? s : 0,
      row: {
        kind: 'query' as const,
        title: c.term,
        meta: c.cats.length === 1 ? `in ${c.cats[0]} · ${plural(n, 'result')}` : `${plural(n, 'result')} across ${c.cats.length} categories`,
        goto: c.term,
        stack: skuStack(c.term, c.cats[0], i * 2),
      },
    };
  });

  // ── Categories — the page, and the sub-category chips inside it ─────────────
  // Every meta is COUNTED from the catalog (never a rounded "20+") so the row and
  // the page it opens agree. `catKey` routes through resolveCategoryTarget, which
  // resolves a page key and a sub-category key alike.
  const categoryRows: ScoredRow[] = [];
  for (const c of productCategories()) {
    const stats = categoryStats(c.cat);
    categoryRows.push({
      // +4 / +2 below: when a query names a taxonomy word ("beauty", "whey protein")
      // the browse PAGE and a product completion say the same words, and the page is
      // the better answer — it opens facets, sorting and counts instead of re-running
      // search. So it leads, and the completion follows it rather than replacing it.
      s: score(q, [{ text: c.title }, { text: c.cat }, { text: c.tagline, weight: 0.45 }]) + 4,
      row: {
        kind: 'tile',
        icon: 'grid',
        tileTone: 'purple',
        image: categoryIcon(c.cat) ?? undefined,
        title: c.title,
        meta: `Category · ${plural(stats.products, 'product')} · ${plural(stats.stores, 'store')}`,
        catKey: c.key,
        goto: c.cat.toLowerCase(),
      },
    });
    for (const sub of subsOf(c.cat)) {
      const label = SUB_LABELS[sub];
      categoryRows.push({
        s: score(q, [{ text: label }, { text: sub, weight: 0.9 }]) + 2, // under its own page (+4), over a bare completion
        row: {
          kind: 'tile',
          icon: 'grid',
          tileTone: 'purple',
          image: categoryIcon(c.cat) ?? undefined,
          title: label,
          meta: `in ${c.title} · ${plural(productsInCategory(c.cat).filter((p) => p.sub === sub).length, 'product')}`,
          catKey: sub,
          goto: label.toLowerCase(),
        },
      });
    }
  }

  // ── Credit cards — the whole real tile set, ranked by name match or intent ──
  // A card with its own results page goes there; the rest open the cards SERP.
  const CARD_PAGE: Record<string, string> = { 'card-sbi-cashback': 'sbi cashback card' };
  const cardIntent = intentScore(q, 'credit_cards');
  // The cards SERP's own ranking first, then the rest of the tile set — so an
  // intent-only query ("credit", "cc") lists the cards in the order the page it opens
  // lists them, rather than in a second order invented here.
  const cardPool = [
    ...(caseCards.sections[0]?.items ?? []),
    ...ALL_CARD_TILES.filter((c) => !(caseCards.sections[0]?.items ?? []).some((x) => x.id === c.id)),
  ];
  const cardRows: ScoredRow[] = cardPool.map((c, i) => {
    const own = score(q, [
      { text: c.title },
      ...(c.subtitle ? [{ text: c.subtitle, weight: 0.9 }] : []),
      ...(c.benefitTags ?? []).map((t) => ({ text: t.label, weight: 0.5 })),
      ...(c.topPick ? [{ text: c.topPick.reason, weight: 0.45 }] : []),
    ]);
    return {
      s: Math.max(own, cardIntent) - i * 0.15, // intent-only ties keep the cards page's order
      row: {
        kind: 'tile' as const,
        icon: 'card' as const,
        tileTone: c.archetype === '06_cobranded_card' ? ('indigo' as const) : ('blue' as const),
        // The row's lead is the card RENDER (D087) — the tile set ships one per card.
        cardImage: (c.artwork ?? undefined) as number | undefined,
        title: c.title,
        cashbackPrefix: cbLabel(c.cashback).prefix,
        cashbackValue: cbLabel(c.cashback).value,
        goto: CARD_PAGE[c.id] ?? 'credit',
      },
    };
  });

  // ── Loans + savings — the real lender/bank rows off their own results pages ─
  const loanIntent = intentScore(q, 'loans');
  const loanRows: ScoredRow[] = (caseLoans.sections[0]?.items ?? []).map((l, i) => ({
    s: Math.max(score(q, [{ text: l.title }, ...(l.subtitle ? [{ text: l.subtitle, weight: 0.5 }] : [])]), loanIntent) - i * 0.1, // keep the page's APR order on an intent tie
    row: {
      kind: 'tile' as const,
      icon: 'loan' as const,
      tileTone: 'orange' as const,
      title: l.title,
      meta: [l.rate?.display && `${l.rate.display} ${l.rate.note ?? ''}`.trim(), l.emi].filter(Boolean).join(' · '),
      goto: '₹5,00,000 personal loan',
    },
  }));

  const savingsIntent = intentScore(q, 'savings');
  const savingsRows: ScoredRow[] = (caseSavings.sections[0]?.items ?? []).map((b, i) => ({
    s: Math.max(score(q, [{ text: b.title }, ...(b.subtitle ? [{ text: b.subtitle, weight: 0.6 }] : [])]), savingsIntent) - i * 0.1,
    row: {
      kind: 'tile' as const,
      icon: 'bank' as const,
      tileTone: 'teal' as const,
      title: b.title,
      meta: [b.rate?.display, b.subtitle].filter(Boolean).join(' · '),
      goto: 'zero balance savings account',
    },
  }));

  // ── Offers + campaigns — read off the real cases that actually carry them ───
  // Both counts come from the sections the tap opens, so "2 live offers" is the two
  // coupons that page really shows (§7 Placeholder Protocol).
  const offerIntent = intentScore(q, 'offers');
  const campaignIntent = intentScore(q, 'campaigns');
  const offerRows: ScoredRow[] = [];
  const campaignRows: ScoredRow[] = [];
  const seenOffer = new Set<string>();
  const seenCampaign = new Set<string>();
  for (const [key, model] of Object.entries(REAL_CASES)) {
    const store = model.hero?.title ?? key;
    const coupons = model.sections.find((x) => x.kind === 'coupons');
    if (coupons?.items.length && !seenOffer.has(store)) {
      seenOffer.add(store);
      offerRows.push({
        s: Math.max(
          score(q, [{ text: store }, ...coupons.items.map((i) => ({ text: `${i.title} ${i.code ?? ''}`, weight: 0.6 }))]),
          offerIntent,
        ),
        row: {
          kind: 'tile',
          icon: 'tag',
          tileTone: 'green',
          title: `${store} coupons & offers`,
          meta: `${plural(coupons.items.length, 'live offer')} · ${coupons.items[0].title}`,
          goto: key,
        },
      });
    }
    for (const camp of model.sections.find((x) => x.kind === 'campaign')?.items ?? []) {
      if (seenCampaign.has(camp.title)) continue;
      seenCampaign.add(camp.title);
      campaignRows.push({
        s: Math.max(score(q, [{ text: camp.title }, ...(camp.subtitle ? [{ text: camp.subtitle, weight: 0.5 }] : []), { text: store, weight: 0.8 }]), campaignIntent),
        row: {
          kind: 'tile',
          icon: 'campaign',
          tileTone: 'red',
          tileImage: require('../../assets/campaigns/big-billion-days.png'),
          title: camp.title,
          meta: camp.live ? `Live now · ${camp.subtitle ?? ''}`.trim() : camp.subtitle,
          live: camp.live,
          goto: key,
        },
      });
    }
  }

  return [
    suggestGroup('stores', storeRows),
    suggestGroup('products', completionRows),
    suggestGroup('categories', categoryRows),
    suggestGroup('credit_cards', cardRows),
    suggestGroup('loans', loanRows),
    suggestGroup('savings', savingsRows),
    suggestGroup('offers', offerRows),
    suggestGroup('campaigns', campaignRows),
  ].filter((g): g is SuggestGroup => g !== null);
}

/**
 * "Did you mean …?" for a query that resolved to NOTHING — the correction the results
 * screen offers (D112). It is the top-scoring suggestion candidate for the same query:
 * the type-ahead's scorer tolerates a typo ("myntar" → Myntra, 1 edit) where
 * `catalog.buildSerp` → `searchStores` does not, so a query that dropped to recovery
 * usually has a strong candidate that simply never got asked for.
 *
 * `label` is what the row SAYS (the candidate's own name) and `query` is what tapping
 * it searches — the two differ wherever a row routes to a vertical page rather than to
 * its own title. Returns undefined when nothing scored, or when the best candidate is
 * the query itself (then the query is spelled fine and simply has no results, which is
 * a different message).
 */
export function didYouMean(query: string): { label: string; query: string } | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  let best: SuggestRow | undefined;
  for (const g of buildSuggestions(query)) {
    for (const row of g.rows) if (!best || (row.score ?? 0) > (best.score ?? 0)) best = row;
  }
  if (!best) return undefined;
  const label = best.title.trim();
  const target = (best.goto ?? best.title).trim();
  return label.toLowerCase() === q || target.toLowerCase() === q ? undefined : { label, query: target };
}
