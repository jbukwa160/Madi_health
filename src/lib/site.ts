// Shop details shown on the site, in e-mails and on the legal pages. Company, licence and pharmacy details are the
// ones published on arfa7.bg (general terms, footer, "Нашите магазини") as of 2026-10-29.

export const SITE = {
  name: "Аптека Арфа 7",
  /** Short brand name used in running text and the logo. */
  brand: "ARFA7",
  nameLatin: "ARFA7",
  tagline: "онлайн аптека за здраве и красота",
  description:
    "Онлайн аптека ARFA7 — продукти без рецепта, хранителни добавки, дермокозметика, мама и бебе и медицински изделия с доставка до цяла България и плащане при получаване.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  email: "office@arfa7.com",
  phone: "+359 877 900 982",
  hours: "понеделник – петък 8:00 – 21:00, събота и неделя 9:00 – 20:00",
  company: {
    name: "„АРФА ЕС“ ЕООД",
    eik: "205173951",
    /** Not published on arfa7.bg — fill in to show it on invoices and the legal pages. */
    vat: "",
    address: "гр. София 1756, ул. „Инж. Стоимен Сарафов“ № 3",
    manager: "Мариус Красимиров Иванов",
  },
  pharmacy: {
    name: "Аптека Арфа 7",
    address: "гр. София 1700, кв. Витоша, ул. „Георги Райчев“ № 21 Д",
    /** Opening hours of the pharmacy, Monday first. */
    hours: [
      { days: "Понеделник – петък", time: "8:00 – 21:00" },
      { days: "Събота и неделя", time: "9:00 – 20:00" },
    ],
    licence: "Разрешение за търговия на дребно с лекарствени продукти № АП-2202007004 от 01.11.2023 г., издадено от Изпълнителната агенция по лекарствата",
    licenceNo: "№ АП-2202007004 от 01.11.2023 г.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%D1%83%D0%BB.+%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8+%D0%A0%D0%B0%D0%B9%D1%87%D0%B5%D0%B2+21%2C+%D0%A1%D0%BE%D1%84%D0%B8%D1%8F",
  },
  social: {
    facebook: "https://www.facebook.com/arfa7.bg/",
    instagram: "https://www.instagram.com/arfa7__pharmacy/",
    youtube: "https://www.youtube.com/@Arfa7-uv4is",
  },
  /** EU co-financing note required by the grant (shown in the footer, as on arfa7.bg). */
  euProject: {
    number: "BG16RFPR001-1.012-0665",
    procedure: "BG16RFPR001-1.012 „Дигитализация на предприятията“",
    programme: "„Конкурентоспособност и иновации в предприятията“ 2021–2027",
  },
};

export const CARRIERS = {
  speedy: "Speedy",
  econt: "Еконт",
  boxnow: "BOX NOW",
  pigeon: "Pigeon Express",
} as const;

export type CarrierId = keyof typeof CARRIERS;

export const SHIPPING = {
  /** Order total (with VAT) from which delivery is free. */
  freeFrom: 40.9,
  /** `needs: "office"` covers offices and lockers alike (BOX NOW has lockers only). */
  methods: [
    { id: "speedy-office", carrier: "speedy", needs: "office", label: "До офис или автомат на Speedy", detail: "офис или автомат", price: 3.49 },
    { id: "econt-office", carrier: "econt", needs: "office", label: "До офис или Еконтомат на Еконт", detail: "офис или Еконтомат", price: 3.49 },
    { id: "boxnow-locker", carrier: "boxnow", needs: "office", label: "До автомат на BOX NOW", detail: "автомат, 24/7", price: 3.49 },
    { id: "pigeon-office", carrier: "pigeon", needs: "office", label: "До офис или автомат на Pigeon Express", detail: "офис или автомат", price: 3.49 },
    { id: "speedy-address", carrier: "speedy", needs: "address", label: "До адрес със Speedy", detail: "до вратата", price: 4.99 },
    { id: "econt-address", carrier: "econt", needs: "address", label: "До адрес с Еконт", detail: "до вратата", price: 4.99 },
  ],
  /** Working days from order to delivery. */
  days: "1–2",
  /** Days to return an unopened product. */
  returnDays: 14,
} as const;

export type ShippingMethod = (typeof SHIPPING.methods)[number];
export type ShippingMethodId = ShippingMethod["id"];

/** Lowest delivery price to an office and to an address (for texts like "от 3,49 €"). */
export const OFFICE_PRICE = Math.min(...SHIPPING.methods.filter((m) => m.needs === "office").map((m) => m.price));
export const ADDRESS_PRICE = Math.min(...SHIPPING.methods.filter((m) => m.needs === "address").map((m) => m.price));

export function shippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING.methods.find((m) => m.id === id);
}

export function shippingPrice(methodId: ShippingMethodId, subtotal: number): number {
  if (subtotal >= SHIPPING.freeFrom) return 0;
  return shippingMethod(methodId)?.price ?? SHIPPING.methods[0].price;
}

/**
 * "Перфектни заедно": discount on a product bought together with the products its page pairs with it, by the number
 * of products in the set (2 → 10 %, 3 → 12 %, 4 → 15 %).
 */
export const BUNDLE_DISCOUNT: Record<number, number> = { 2: 0.1, 3: 0.12, 4: 0.15 };
export const bundleDiscount = (count: number): number => BUNDLE_DISCOUNT[Math.min(count, 4)] ?? 0;
export const MAX_BUNDLE_DISCOUNT = Math.max(...Object.values(BUNDLE_DISCOUNT));

export const CART_KEY = "af_cart_v1";
export const CART_BUNDLES_KEY = "af_cart_bundles_v1";
export const FAVORITES_KEY = "af_fav_v1";
export const COMPARE_KEY = "af_compare_v1";
/** Products that can be compared side by side at /sravnenie. */
export const COMPARE_MAX = 4;
export const ORDER_KEY = "af_last_order";
