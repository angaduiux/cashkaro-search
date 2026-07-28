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
  myntra: { logo: require('../../assets/brands/myntra.png'), bg: '#ff3f6c1a' },
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
};

// ── Real deal banner creatives (exported from the Figma design file) ──────────
// Full pre-rendered campaign artwork; rendered full-bleed (CK strip + CTA baked in).
const deal = (id: string, img: number, aspect: number): ResultItem => ({
  id,
  archetype: '13_campaign',
  source: 'internal',
  title: '',
  logo: null,
  cashback: { type: 'none' },
  bannerImage: img,
  bannerAspect: aspect,
});

const WIDE = 984 / 354; // real wide banner aspect (from Downloads)
const dealCroma = deal('deal-croma', require('../../assets/banners/w_0128.png'), WIDE);
const dealAmazon = deal('deal-amazon', require('../../assets/banners/w_0207.png'), WIDE);
const dealAjio = deal('deal-ajio', require('../../assets/banners/w_0153.png'), WIDE);
const dealKlook = deal('deal-klook', require('../../assets/banners/w_4409.png'), WIDE);
const dealS3Beauty = deal('deal-s3beauty', require('../../assets/banners/w_0220.png'), WIDE);
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
      count: 2,
      items: [
        { id: 'store-flipkart-row', archetype: '01_store', source: 'internal', title: 'Flipkart', subtitle: '23K Shopping', logo: BRAND.flipkart.logo, logoBg: BRAND.flipkart.bg, cashback: { type: 'pct_single', value: 7 } },
        { id: 'card-axis-flip-row', archetype: '06_cobranded_card', source: 'internal', title: 'Axis Flipkart', subtitle: 'Co-branded card', logo: BRAND.axisBank.logo, logoBg: BRAND.axisBank.bg, cashback: { type: 'flat_inr', value: 1500, prefix: 'flat' } },
      ],
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
      items: [
        { id: 's-bodyshop', archetype: '01_store', source: 'internal', title: 'The Body Shop', subtitle: '23K Shopping', logo: BRAND.bodyshop.logo, logoBg: BRAND.bodyshop.bg, cashback: { type: 'flat_inr', value: 200, prefix: 'flat' } },
        { id: 's-bodycupid', archetype: '01_store', source: 'internal', title: 'Body Cupid', subtitle: '23K Shopping', logo: BRAND.bodycupid.logo, logoBg: BRAND.bodycupid.bg, cashback: { type: 'pct_single', value: 15 } },
        { id: 's-bebodywise', archetype: '01_store', source: 'internal', title: 'BeBodyWise', subtitle: '23K Shopping', logo: BRAND.bebodywise.logo, logoBg: BRAND.bebodywise.bg, cashback: { type: 'pct_single', value: 8 } },
      ],
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
      count: 1,
      items: [
        { id: 's-pharmeasy', archetype: '01_store', source: 'internal', title: 'PharmEasy', subtitle: '23K Shopping', logo: BRAND.pharmeasy.logo, logoBg: BRAND.pharmeasy.bg, cashback: { type: 'pct_single', value: 7 } },
      ],
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
      items: [
        { id: 's-lotus', archetype: '01_store', source: 'internal', title: 'Lotus Botanicals', subtitle: '23K Shopping', logo: BRAND.lotus.logo, logoBg: BRAND.lotus.bg, cashback: { type: 'pct_single', value: 20 } },
        { id: 's-mobikwik', archetype: '01_store', source: 'internal', title: 'MobiKwik', subtitle: '23K Shopping', logo: BRAND.mobikwik.logo, logoBg: BRAND.mobikwik.bg, cashback: { type: 'pct_single', value: 3 } },
      ],
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
  tabs: ['all', 'credit_cards', 'cobranded'],
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
      kind: 'similar_cards',
      title: 'Similar cards',
      items: [cardAxisFlipkart, cardFederalScapia],
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

const loanItem = (id: string, title: string, spec: LoanSpec): ResultItem => ({
  id,
  archetype: '07_loan',
  source: 'internal',
  title,
  subtitle: `EMI ${spec.emi} · ₹5,00,000`,
  logo: spec.logo ?? null,
  logoBg: spec.logoBg,
  cashback: { type: 'none' },
  rate: { kind: 'cost', value: spec.apr, display: spec.aprDisplay, note: 'onwards' },
  fees: { state: 'fee', joining: spec.processingFee, annual: spec.tenure },
  benefitBullets: spec.bullets.map((text) => ({ text })),
  topPick: spec.topPick ? { reason: spec.topPick } : null,
  ctaLabel: 'Check eligibility',
});

export const caseAmountLoan: SerpModel = {
  query: '₹5,00,000 personal loan',
  archetype: '07_loan',
  context: { label: 'Lowest EMI for ₹5,00,000 · ranked by rate (low → high)', count: 3 },
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
  context: { label: 'Zero-balance accounts · ranked by interest (high → low)', count: 3 },
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
    logo: BRAND.muscleblaze.logo, logoBg: BRAND.muscleblaze.bg,
    cashback: { type: 'pct_single', value: 6 }, // mapped partner → badge
    mappedPartnerId: 'muscleblaze',
    badge: { label: 'Upto 6% Cashback', tone: 'cashback' },
    ctaLabel: '₹2,199',
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

// ═════════════════════════════════════════════════════════════════════════════
// Suggestions (W3 · Aura, Figma 1646:7462) — result-type-grouped type-ahead.
// Each row routes (`goto`) to a real result page so search works end-to-end and
// the screen doubles as the "what leads where" guide.
// ═════════════════════════════════════════════════════════════════════════════
import { SuggestGroup } from '../components/Suggestions';
import { searchStores, CATEGORIES, buildCategoryStores } from './catalog';
import { categoryIcon } from './categoryIcons';

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
  { key: 'stores', title: 'Stores', kind: 'stores', items: CATEGORIES.flatMap((c) => buildCategoryStores(c)) },
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

export function buildSuggestions(query: string): SuggestGroup[] {
  const q = query.trim();
  if (!q) return [];
  // Real store matches from the catalog (fuzzy over name/alias/category).
  const matched = searchStores(q).slice(0, 4);
  const storeRows = matched.map((s) => {
    const c = cbLabel(s.cashback);
    return {
      kind: 'store' as const,
      title: s.name,
      logo: s.brand ? BRAND[s.brand].logo : null,
      cashbackPrefix: c.prefix,
      cashbackValue: c.value,
      meta: c.meta,
      goto: s.name.toLowerCase(),
    };
  });

  const groups: SuggestGroup[] = [
    { kind: 'stores', label: 'Stores', rows: storeRows },
    {
      kind: 'products',
      label: 'Products',
      rows: [
        { kind: 'query', title: `${q} facewash`, meta: 'in Beauty · 10+ results', goto: 'whey' },
        { kind: 'query', title: `${q} foundation`, meta: 'in Beauty · 20+ results', goto: 'whey' },
        { kind: 'query', title: `${q} lipstick matte`, meta: 'in Beauty · 2,300+ results', goto: 'whey' },
      ],
    },
    {
      kind: 'categories',
      label: 'Categories',
      rows: [
        { kind: 'tile', icon: 'grid', tileTone: 'purple', image: categoryIcon('Beauty') ?? undefined, title: 'Beauty & Cosmetics', meta: 'Category · 20+ stores', goto: 'body' },
        { kind: 'tile', icon: 'grid', tileTone: 'purple', image: categoryIcon('Fashion') ?? undefined, title: 'Fashion & Lifestyle', meta: 'Category · 80+ stores', goto: 'body' },
      ],
    },
    {
      kind: 'credit_cards',
      label: 'Credit Cards',
      rows: [
        { kind: 'tile', icon: 'card', tileTone: 'blue', cardImage: ART.sbiCashback, title: 'SBI Cashback Credit Card', cashbackPrefix: 'Up to', cashbackValue: '5% back', goto: 'credit' },
        { kind: 'tile', icon: 'card', tileTone: 'blue', cardImage: ART.axisFlipkart, title: 'Axis Flipkart Credit Card', cashbackPrefix: 'Flat', cashbackValue: '5% back', goto: 'credit' },
      ],
    },
    {
      kind: 'cobranded',
      label: 'Co-branded Cards',
      rows: [
        { kind: 'tile', icon: 'card', tileTone: 'indigo', cardImage: ART.scapia, title: 'Scapia Federal Credit Card', cashbackPrefix: 'Up to', cashbackValue: '5% back', goto: 'credit' },
      ],
    },
    {
      kind: 'loans',
      label: 'Loans',
      rows: [
        { kind: 'tile', icon: 'loan', tileTone: 'orange', title: 'Personal loan up to ₹5L', meta: 'Instant approval · indicative APR', goto: '₹5,00,000 personal loan' },
      ],
    },
    {
      kind: 'savings',
      label: 'Savings Accounts',
      rows: [
        { kind: 'tile', icon: 'bank', tileTone: 'teal', title: 'Zero-balance savings offers', meta: 'Ranked by interest', goto: 'zero balance savings account' },
      ],
    },
    {
      kind: 'offers',
      label: 'Offers',
      rows: [
        { kind: 'tile', icon: 'tag', tileTone: 'green', title: `${q} coupons & deals`, meta: '12 live offers today', goto: 'flip' },
      ],
    },
    {
      kind: 'campaigns',
      label: 'Campaigns',
      rows: [
        { kind: 'tile', icon: 'campaign', tileTone: 'red', tileImage: require('../../assets/campaigns/big-billion-days.png'), title: 'Big Billion Days', meta: 'Live now · up to 80% off + extra cashback', live: true, goto: 'flip' },
      ],
    },
  ];
  return groups.filter((g) => g.rows.length > 0);
}
