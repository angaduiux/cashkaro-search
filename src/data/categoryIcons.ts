/**
 * Category icons — retina PNGs (3×, 159–168px) exported from Figma 1674:13000,
 * each an illustrated glyph on the brand lavender circle. `categoryIcon(name)`
 * resolves a free-text category/title to its asset via keyword aliases, so the
 * suggestions type-ahead and the SERP category rows can render the real artwork.
 */
export const CATEGORY_ICONS = {
  'new-on-cashkaro': require('../../assets/categories/new-on-cashkaro.png'),
  loans: require('../../assets/categories/loans.png'),
  'credit-cards': require('../../assets/categories/credit-cards.png'),
  banking: require('../../assets/categories/banking.png'),
  fashion: require('../../assets/categories/fashion.png'),
  pharmacy: require('../../assets/categories/pharmacy.png'),
  mobiles: require('../../assets/categories/mobiles.png'),
  'food-grocery': require('../../assets/categories/food-grocery.png'),
  electronics: require('../../assets/categories/electronics.png'),
  beauty: require('../../assets/categories/beauty.png'),
  'hotel-flights': require('../../assets/categories/hotel-flights.png'),
  'health-wellness': require('../../assets/categories/health-wellness.png'),
  'home-kitchen': require('../../assets/categories/home-kitchen.png'),
  hosting: require('../../assets/categories/hosting.png'),
  education: require('../../assets/categories/education.png'),
  departmental: require('../../assets/categories/departmental.png'),
} as const;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

// Ordered keyword → icon aliases (first match wins — put specific before generic).
const ALIASES: [RegExp, CategoryIconKey][] = [
  [/new on|new store/i, 'new-on-cashkaro'],
  [/loan|lending|credit line/i, 'loans'],
  [/credit card|debit card|co-?brand|\bcard/i, 'credit-cards'],
  [/bank|savings|account|upi|wallet/i, 'banking'],
  [/beaut|cosmetic|grooming|makeup|skincare|skin care|fragrance|perfume|lotion|massage|deodorant|bath|shower|shampoo|hair care|\bserum\b|moisturi/i, 'beauty'],
  [/pharmac|medicine|chemist|wellness store|healthcare/i, 'pharmacy'],
  [/mobile|smartphone|\bphone/i, 'mobiles'],
  [/food|grocery|grocer|supermarket|dining|restaurant/i, 'food-grocery'],
  [/electronic|gadget|appliance|laptop|tv|camera/i, 'electronics'],
  [/hotel|flight|travel|trip|holiday|vacation|airline/i, 'hotel-flights'],
  [/wellness|fitness|supplement|protein|nutrition|gym/i, 'health-wellness'],
  [/home|kitchen|furnitur|decor|appliances/i, 'home-kitchen'],
  [/hosting|domain|web host|server|cloud/i, 'hosting'],
  [/education|course|learn|book|exam|study|edtech/i, 'education'],
  [/department|general store|hypermarket/i, 'departmental'],
  [/fashion|clothing|apparel|footwear|shoes|lifestyle/i, 'fashion'],
];

/** Resolve a category title/query to its icon asset (require id), or null. */
export function categoryIcon(name: string): number | null {
  const s = (name || '').trim();
  if (!s) return null;
  if (s.toLowerCase() in CATEGORY_ICONS) return CATEGORY_ICONS[s.toLowerCase() as CategoryIconKey];
  for (const [re, key] of ALIASES) if (re.test(s)) return CATEGORY_ICONS[key];
  return null;
}
