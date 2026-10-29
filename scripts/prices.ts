// Retail price estimates. The export has no prices, so until data/prices.csv has real ones every product gets a
// believable price from its subcategory, the brand's price tier and the pack size. Estimates are marked
// priceConfirmed: false and the shop's order e-mail warns about them.

import { createHash } from "node:crypto";
import { type FactsOut, type Place, rx } from "./rules";

/** Typical price (euro) of a mid-market product of the subcategory, and its typical size in ml. */
const BASE: Record<string, [number, number?]> = {
  "fon-dyo-ten": [13.9, 30], "bb-i-cc-kremove": [12.9, 30], korektori: [9.4], pudri: [11.9], ruzh: [10.4], "bronzanti-i-kontur": [11.9],
  haylaytari: [11.4], "osnovi-i-fiksatori": [11.9, 30], spirali: [11.4], "ochni-linii": [8.9], "molivi-za-ochi": [6.9], "senki-za-ochi": [11.9],
  vezhdi: [8.4], migli: [7.9], chervila: [10.4], glantsove: [8.9], "molivi-za-ustni": [6.9], "balsami-za-ustni": [4.9], "komplekti-grim": [21.9],
  pochistvane: [11.9, 250], tonitsi: [13.9, 200], serumi: [21.9, 30], kremove: [19.9, 50], "okoloochen-kontur": [18.9, 15], maski: [4.9],
  eksfolianti: [16.9, 100], "masla-za-litse": [21.9, 30], "termalni-vodi": [10.9, 150], "komplekti-litse": [32.9],
  shampoani: [7.4, 250], balsami: [7.4, 200], "maski-za-kosa": [10.9, 250], "bez-otmivane": [11.9, 150], "serumi-i-olia": [13.9, 100],
  skalp: [16.9, 100], stilizirane: [8.4, 200], "boya-za-kosa": [8.9], "uredi-za-kosa": [54.9], "komplekti-kosa": [17.9],
  "dush-gelove": [5.4, 250], sapuni: [3.9, 100], skrabove: [9.9, 200], vana: [7.9], losioni: [9.9, 250], "masla-za-tyalo": [12.9, 100], "eterichni-masla": [8.9, 10],
  "ratse-i-kraka": [6.4, 75], dezodoranti: [6.4, 150], epilatsia: [8.9], "komplekti-tyalo": [18.9],
  lakove: [6.4], "gel-lakove": [10.4], "osnovi-i-top": [7.4], "grizha-za-nokti": [7.4], lakochistiteli: [4.9, 100], manikyur: [6.9],
  "za-litse": [18.9, 50], "za-tyalo": [16.9, 200], detska: [17.9, 150], "sled-slantse": [12.9, 200], avtobronzanti: [16.9, 150],
  brasnene: [10.9], aftarsheyv: [11.9, 100], brada: [13.9, 50], "grizha-za-mazhe": [16.9, 50], "komplekti-mazhe": [21.9],
  "pasti-za-zabi": [5.4, 75], "chetki-za-zabi": [4.4], "elektricheski-chetki": [44.9], "vodi-za-usta": [7.4, 500], interdentalni: [6.4],
  "damska-higiena": [4.4], "intimna-higiena": [6.4, 250], "mokri-karpichki": [2.9], pamuchni: [2.7],
  "chetki-za-grim": [9.9], "gabi-i-aplikatori": [6.4], "chetki-za-kosa": [8.4], "za-kosa": [4.4], instrumenti: [7.4], "za-banya": [5.4],
  neseseri: [13.9],
};

/** Perfume price of a 100 ml bottle by house tier. */
const PERFUME_100: Record<Tier, number> = { budget: 16, mass: 24, unknown: 34, mid: 52, premium: 78, luxury: 105, niche: 165 };

/** "mass" are drugstore brands (Nivea, Dove, Garnier); "budget" are inexpensive make-up and perfume lines. */
type Tier = "budget" | "mass" | "unknown" | "mid" | "premium" | "luxury" | "niche";
const TIER_FACTOR: Record<Tier, number> = { budget: 0.6, mass: 0.6, unknown: 0.72, mid: 0.95, premium: 1.45, luxury: 2.3, niche: 2.6 };

const TIERS: [Tier, string[]][] = [
  ["niche", [
    "nishane", "xerjoff", "olibanum", "carner barcelona", "essential parfums", "goldfield & banks", "tiziana terenzi", "the merchant of venice",
    "p. frapin & cie", "kayali", "parfums dusita", "blend oud", "new notes", "the house of oud", "house of thêom", "theodoros kalotinis perfumer",
  ]],
  ["luxury", [
    "chopard", "carven", "dolce&gabbana", "burberry", "versace", "prada", "givenchy", "dior", "chanel", "yves saint laurent", "armani",
    "giorgio armani", "gucci", "hermès", "boucheron", "jimmy choo", "roberto cavalli", "mugler", "lancôme", "estée lauder", "clinique",
    "shiseido", "sisley", "kérastase", "institut esthederm", "filorga", "rochas", "paco rabanne", "bvlgari", "montblanc", "lalique", "chloé",
    "valentino", "tom ford", "marc jacobs", "narciso rodriguez", "issey miyake", "jean paul gaultier", "carolina herrera", "oscar de la renta",
    "courrèges", "kenzo", "moschino", "trussardi", "salvatore ferragamo",
  ]],
  ["premium", [
    "hugo boss", "calvin klein", "davidoff", "azzaro", "cerruti", "dkny", "liu jo", "karl lagerfeld", "furla", "lierac", "nuxe", "caudalie",
    "vichy", "la roche-posay", "avène", "bioderma", "uriage", "eucerin", "svr", "ducray", "klorane", "a-derma", "apivita", "korres", "phyto",
    "rené furterer", "isdin", "cerave", "frezyderm", "wella professionals", "redken", "matrix", "l'oréal professionnel", "alfaparf milano",
    "chi", "olaplex", "moroccanoil", "real techniques", "philips", "oral-b", "braun", "mádara", "weleda", "dr. konopka's", "elizabeth arden",
    "lacoste", "guess", "elode", "antonio banderas", "christina aguilera", "sabrina carpenter", "the ordinary", "transparent lab", "medicube",
    "rituals", "sol de janeiro", "medi-peel", "beurer", "rowenta", "remington", "babyliss", "panasonic", "oclean", "curaprox", "tepe",
    "ahava", "jowaé", "topicrem", "noreva", "galenic", "skinceuticals", "kylie cosmetics", "milani", "artdeco", "max factor",
  ]],
  ["mass", [
    "nivea", "dove", "garnier", "pantene", "syoss", "gliss", "schauma", "head & shoulders", "palmolive", "colgate", "aquafresh", "lacalut",
    "rexona", "fa", "axe", "old spice", "balea", "ebelin", "alverde", "isana", "fructis", "timotei", "elseve", "always", "naturella",
    "libresse", "o.b.", "bella", "veet", "intesa", "cien", "nature box", "taft", "wellaflex", "gliss kur", "dontodent", "jordan", "trisa",
    "signal", "blend-a-med", "nivea men", "str8", "b.u.", "lycia", "malizia", "johnson's", "bochko", "бочко", "zdrave", "здраве", "aroma",
    "regal", "bilka", "biofresh", "ikarov", "rivana", "astera", "velnea", "llums", "victoria beauty", "nature of agiva", "bulgarian rose",
    "tesori d'oriente", "spuma di sciampagna", "fresh", "baby crema", "babylove", "sebamed baby",
  ]],
  ["mid", [
    "l'oréal paris", "maybelline new york", "rimmel", "bourjois", "revlon", "nyx professional makeup", "gosh copenhagen", "missha",
    "john frieda", "ogx", "tresemmé", "lee stafford", "neutrogena", "mixa",
    "sensodyne", "parodontax", "elmex", "listerine", "gillette", "wilkinson sword", "yves rocher",
    "farmstay", "mizon", "it's skin", "holika holika", "rom&nd", "peripera", "pierre cardin", "vivienne sabó", "lumene", "sebamed",
    "mustela", "babé", "ziaja", "lavera", "benecos", "speick",
    "pupa", "deborah", "kiko", "wet n wild", "essie", "opi", "schwarzkopf", "taft", "batiste", "palette", "tom tailor", "s.oliver", "nike",
    "adidas", "mexx", "betty barclay", "playboy", "lattafa", "maison alhambra", "armaf", "al haramain", "swiss arabian", "women'secret",
    "jacques zolty",
  ]],
  ["budget", [
    "golden rose", "wibo", "lovely", "essence", "catrice", "flormar", "aura", "bell", "eveline cosmetics", "revolution", "delia cosmetics",
    "idc institute", "vzk", "titania", "velnea", "llums", "la rive", "cuba", "coscentra", "verset", "jacques battini", "dorall collection",
    "chic'n glam", "côte d'azur", "nam", "trend !t up", "bel london", "profusion", "w7", "parsa beauty", "ebelin", "aroma", "regal",
    "bochko", "бочко", "здраве", "bilka", "biofresh", "ikarov", "rivana", "astera", "fitocosmetics", "cameleo", "marion", "lorenay",
    "malizia", "tesori d'oriente", "spuma di sciampagna", "lamis", "rue pergolese", "martinelia", "abc", "iv", "kent", "yesss", "andreia",
    "21 cosmetics", "pompea", "lip smacker", "crazy rumors", "nl beauty", "biobaza", "biobalance", "jordan", "trisa", "aquafresh",
    "pierrot", "nordics", "intesa", "top ten", "denim", "bilka", "farmona", "zoya goes pretty", "milva",
  ]],
];
const TIER_OF = new Map<string, Tier>();
for (const [tier, brands] of TIERS) for (const b of brands) if (b && !TIER_OF.has(b)) TIER_OF.set(b, tier);

function tierFor(brand: string, place: Place): Tier {
  const t = TIER_OF.get(brand.toLowerCase());
  if (t) return t;
  if (place.sub === "nishovi") return "niche";
  return "unknown";
}

/** Same SKU, same "random" number between 0 and 1. */
function unit(sku: string, salt = ""): number {
  const h = createHash("sha1").update(sku + salt).digest();
  return h.readUInt32BE(0) / 0xffffffff;
}

/** Retail-looking price: 4,49 / 7,90 / 12,99 / 34,90 / 89,00. */
function retail(value: number, sku: string): number {
  const v = Math.max(1.49, value);
  if (v >= 60) return Math.max(59, Math.round(v / 5) * 5 - (unit(sku, "e") < 0.5 ? 0.1 : 0));
  const whole = Math.floor(v);
  const endings = v < 10 ? [0.49, 0.79, 0.9, 0.99] : [0.49, 0.9, 0.99];
  const end = endings[Math.floor(unit(sku, "c") * endings.length)];
  return Math.round((whole + end) * 100) / 100;
}

export function estimatePrice(sku: string, name: string, brand: string, place: Place, facts: FactsOut): number {
  const tier = tierFor(brand, place);
  const jitter = 0.88 + unit(sku) * 0.26;
  const lower = name.toLowerCase();

  if (place.category === "parfyumi" && place.sub !== "mistove") {
    let base = PERFUME_100[tier];
    if (facts.conc === "edt" || facts.conc === "edc") base *= 0.86;
    if (facts.conc === "parfum") base *= 1.15;
    if (place.sub === "parfyumni-komplekti") base *= 1.25;
    if (place.sub === "detski-parfyumi") base = Math.min(base, 22);
    const ml = facts.ml && facts.ml >= 3 && facts.ml <= 250 ? facts.ml : 75;
    return retail(base * Math.pow(ml / 100, 0.72) * jitter, sku);
  }

  const [basePrice, typicalMl] = BASE[place.sub] ?? [9.9];
  let price = basePrice * TIER_FACTOR[tier];
  // Devices are priced by kind, not by the cosmetic subcategory.
  if (/епилатор|epilator|ipl/.test(lower)) price = 69 * (tier === "budget" ? 0.6 : 1);
  else if (/самобръсначка|shaver|тример|trimmer|машинка/.test(lower) && /(?:електр|electric|braun|philips|remington|series|oneblade)/.test(lower)) price = 59;
  else if (place.sub === "elektricheski-chetki" && /накрайни|глав|heads|наконечник/.test(lower)) price = 16.9 * (facts.pcs && facts.pcs > 2 ? 1.6 : 1);
  else if (place.sub === "brasnene" && /ножчета|blades|резервни/.test(lower)) price = 14.9 * TIER_FACTOR[tier];
  else if (place.sub === "senki-za-ochi" && /палитра|palette/.test(lower)) price *= 1.7;
  else if (place.sub === "maski" && (facts.ml ?? 0) >= 40) price = 13.9 * TIER_FACTOR[tier];

  if (typicalMl && facts.ml && facts.ml > 0) price *= Math.min(2.4, Math.max(0.55, Math.pow(facts.ml / typicalMl, 0.55)));
  if (facts.pcs && facts.pcs >= 3 && ["damska-higiena", "mokri-karpichki", "pamuchni", "maski", "chetki-za-zabi", "za-kosa"].includes(place.sub)) {
    price *= Math.min(2.2, Math.max(1, Math.pow(facts.pcs / 10, 0.35)));
  }
  return retail(price * jitter, sku);
}

// ── Pharmacy goods ──

/**
 * Typical price (euro) of a product of each pharmacy subcategory and the pack it is typical for: number of capsules or
 * tablets (`doses`), grams or millilitres. Bigger and smaller packs are priced from it.
 */
const HEALTH_BASE: Record<string, { price: number; doses?: number; g?: number; ml?: number }> = {
  "nastinka-i-grip": { price: 8.9, ml: 20 }, bolka: { price: 7.9 }, alergia: { price: 9.9 }, hranosmilane: { price: 9.4 },
  "san-i-stres": { price: 12.9, doses: 30 }, imunitet: { price: 13.9, doses: 30 }, "usta-i-garlo": { price: 8.4 },
  "kozhni-problemi": { price: 11.9, g: 30 }, "sartse-i-kravoobrashtenie": { price: 16.9, doses: 30 }, "hemoroidi-i-veni": { price: 13.9 },
  "stavi-i-kosti": { price: 19.9, doses: 60 }, "cheren-drob": { price: 14.9, doses: 30 }, "pikochen-trakt": { price: 12.9, doses: 30 },
  ochi: { price: 11.9, ml: 10 }, ushi: { price: 8.9 }, pamet: { price: 16.9, doses: 30 }, diabet: { price: 15.9, doses: 60 },
  "shtitovidna-zhleza": { price: 12.9, doses: 60 }, "zhensko-zdrave": { price: 17.9, doses: 30 }, "mazhko-zdrave": { price: 19.9, doses: 30 },
  "detsko-zdrave": { price: 9.9, ml: 100 }, probiotitsi: { price: 16.9, doses: 30 }, homeopatia: { price: 9.4 }, otslabvane: { price: 21.9, doses: 60 },
  "otkazvane-ot-tsigari": { price: 18.9 },
  aparati: { price: 44.9 }, testove: { price: 6.9 }, prevrazki: { price: 4.9 }, konsumativi: { price: 5.9 }, ortopedichni: { price: 22.9 },
  inkontinentsia: { price: 14.9 },
  "bebeshki-hrani": { price: 2.9 }, "peleni-i-karpi": { price: 15.9 }, hranene: { price: 9.9 }, karmene: { price: 14.9 }, ustroystva: { price: 49.9 },
  vitamini: { price: 11.9, doses: 60 }, minerali: { price: 10.9, doses: 60 }, multivitamini: { price: 16.9, doses: 60 }, omega: { price: 17.9, doses: 60 },
  kolagen: { price: 24.9, doses: 30 }, bilki: { price: 13.9, doses: 60 }, antioksidanti: { price: 21.9, doses: 60 }, "dobavki-za-detsa": { price: 12.9 },
  "drugi-dobavki": { price: 14.9, doses: 60 }, proteini: { price: 39.9, g: 1000 }, aminokiselini: { price: 24.9, g: 300 }, kreatin: { price: 22.9, g: 300 },
  predtrenirovachni: { price: 29.9, g: 300 }, gaineri: { price: 44.9, g: 3000 }, "izgaryane-na-mazchnini": { price: 24.9, doses: 90 }, "sportni-hrani": { price: 2.49 },
  vashki: { price: 14.9 }, "higienni-konsumativi": { price: 2.9 }, "damska-higiena": { price: 4.4 },
  "bio-dobavki": { price: 16.9, doses: 60 }, superhrani: { price: 6.9, g: 250 }, chayove: { price: 3.9 }, "eterichni-masla": { price: 8.9, ml: 10 },
  "pochistvane-na-doma": { price: 4.9 }, prane: { price: 12.9 }, sadove: { price: 4.9 }, hartia: { price: 3.9 }, aromatizatori: { price: 6.9 },
  nasekomi: { price: 7.9 }, kantselariya: { price: 2.9 },
};

/** Price level of supplement, medical and baby brands against the typical price (1 = typical). */
const HEALTH_TIER: Record<string, number> = {
  "life extension": 1.5, thorne: 1.8, "garden of life": 1.5, solgar: 1.35, "nature's way": 1.15, "nature’s way": 1.15, "now foods": 1.0, now: 1.0,
  swanson: 0.85, doppelherz: 0.7, "doppelherz aktiv": 0.7, "optimum nutrition": 1.25, myprotein: 0.95, "trec nutrition": 0.9, allnutrition: 0.75,
  ostrovit: 0.65, nutrend: 0.9, scitec: 0.95, "scitec nutrition": 0.95, "biotech usa": 0.95, amix: 0.95, "applied nutrition": 1.05, gymbeam: 0.75,
  "kevin levrone": 0.95, mutant: 1.0, weightworld: 0.85, nutricost: 0.85, "natural factors": 1.2, jamieson: 1.0, "doctor's best": 1.2,
  omron: 1.3, microlife: 1.15, medel: 0.8, beurer: 1.1, hartmann: 1.1, "paul hartmann": 1.1, urgo: 1.0, hansaplast: 1.0, medica: 0.7,
  "philips avent": 1.25, avent: 1.25, nuk: 1.05, "tommee tippee": 1.1, "dr. brown's": 1.15, mam: 1.1, chicco: 1.05, canpol: 0.8, "canpol babies": 0.8,
  babyono: 0.75, lovi: 0.85, hipp: 1.0, humana: 1.0, nestle: 0.95, pampers: 1.1, huggies: 1.05, libero: 0.95, bilka: 0.7,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Capsules, tablets or sachets in the pack ("60 капсули", "х30", "120 Count"). */
function doses(text: string): number | undefined {
  const m =
    text.match(
      rx("(\\d{1,4})\\s?(?:бр\\.?\\s)?(?:капсули|капс|таблетки|табл|tablets|tabs|caps|capsules|vcaps|veg caps|softgels|софтгел\\p{L}*|дражета|сашета|sachets|желирани|gummies|дъвчащи|ефервесцентни|count|ct|броя|бр)\\b"),
    ) ?? text.match(rx("[xх]\\s?(\\d{1,4})\\b(?!\\s?(?:мл|ml|г|g|гр|см|cm|mm|мм|kg|кг))"));
  if (!m) return undefined;
  const v = Number(m[1]);
  return v >= 5 && v <= 1000 ? v : undefined;
}

/** Net weight in grams, kilograms included ("2.27 kg", "500 грама"). Tiny values are sample sizes or typos. */
function grams(text: string): number | undefined {
  for (const m of text.matchAll(rx("(\\d+(?:[.,]\\d+)?)\\s?(kg|кг|g|гр|г|грама|grams?)\\b", "giu"))) {
    const v = Number(m[1].replace(",", ".")) * (/^(?:kg|кг)$/i.test(m[2]) ? 1000 : 1);
    if (v >= 20 && v <= 10000) return v;
  }
  return undefined;
}

export function estimateHealthPrice(sku: string, text: string, brand: string, place: Place, facts: FactsOut): number {
  const base = HEALTH_BASE[place.sub] ?? { price: 12.9 };
  let price = base.price;
  const n = doses(text);
  const g = grams(text);
  // Kinds whose price has little to do with the subcategory's typical product.
  if (place.sub === "bebeshki-hrani" && rx("мляко|formula").test(text)) price = 17.9 * clamp(Math.pow((g ?? 400) / 400, 0.85), 0.5, 2.2);
  else if (place.sub === "bebeshki-hrani") price = 2.9 * clamp(Math.pow((g ?? 125) / 125, 0.6), 0.7, 3);
  else if (place.sub === "aparati" && rx("термометър|thermometer").test(text)) price = 16.9;
  else if (place.sub === "aparati" && rx("пулсоксиметър|оксиметър|oximeter").test(text)) price = 26.9;
  else if (place.sub === "aparati" && rx("глюкомер").test(text)) price = 29.9;
  else if (place.sub === "testove" && rx("ленти|strips|ланцет").test(text)) price = 22.9;
  else if (place.sub === "prevrazki" && rx("\\bбинт").test(text)) price = 2.9;
  else if (place.sub === "sportni-hrani" && n && n > 1) price = 2.29 * Math.pow(n, 0.92);
  else if (place.sub === "sportni-hrani" && g && g >= 300) price = 11.9 * clamp(Math.pow(g / 500, 0.8), 0.6, 3);
  else if ((place.sub === "peleni-i-karpi" || place.sub === "inkontinentsia") && facts.pcs) price *= clamp(Math.pow(facts.pcs / 40, 0.75), 0.25, 3);
  else {
    if (base.doses && n) price *= clamp(Math.pow(n / base.doses, 0.6), 0.55, 2.4);
    if (base.g && g) price *= clamp(Math.pow(g / base.g, 0.8), 0.35, 3);
    if (base.ml && facts.ml) price *= clamp(Math.pow(facts.ml / base.ml, 0.55), 0.6, 2.2);
  }
  price *= HEALTH_TIER[brand.toLowerCase()] ?? 1;
  return retail(price * (0.88 + unit(sku) * 0.26), sku);
}
