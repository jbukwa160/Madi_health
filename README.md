# Аптека Арфа 7 — онлайн аптека (ARFA7)

Online pharmacy for „АРФА ЕС“ ЕООД (arfa7.bg), laid out like madihealth.com: products without prescription, food
supplements and sports nutrition, dermocosmetics, mother & baby, medical devices, hygiene, bio products and household
goods. Next.js 16, no database, **no admin panel**. The catalog is generated from the company-wide product export.

| | |
| --- | --- |
| Shop | `http://localhost:3007/` in development (`npx next dev -p 3007`; 3000 is often used by the other shops) |
| Orders | `$DATA_DIR/orders.jsonl` (one JSON per line) + e-mail to `SHOP_EMAIL` when SMTP is set |
| Questions to the pharmacist | `$DATA_DIR/consultations.jsonl` + e-mail to `SHOP_EMAIL` when SMTP is set |
| Waybills | "Създай товарителница" button in the shop's order e-mail → `/tovaritelnitsa/<number>?k=…` |

Company, licence, pharmacy address and hours, regulators and the EU-project note come from arfa7.bg (general terms,
footer, "Нашите магазини") and live in `src/lib/site.ts`; the legal pages in `src/content/pages.tsx` are arfa7.bg's own
texts, cleaned up and adapted to this shop (cash on delivery, the four couriers, guest checkout, no tracking cookies).

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run import               # builds data/catalog.json from ../entire products_export (9).csv
npx next dev -p 3007
```

## Pages

| Page | Address |
| --- | --- |
| Home | `/` |
| All categories | `/kategorii` |
| Category / subcategory | `/zdrave`, `/zdrave/nastinka-i-grip` … (9 categories as on arfa7.bg) |
| Collections | `/kolektsii/novo`, `dermokozmetika`, `vegan`, `bez-zahar`, `balgarski`, `podaratsi`, `za-nego`, `detsa` |
| Brands | `/marki`, `/marki/<brand>` |
| Search | `/tarsene?q=…` (suggestions appear while typing in the header) |
| Product | `/produkt/<slug>` |
| Question to a pharmacist | `/konsultatsia` |
| Promotions / short-dated products | `/promotsii`, `/srochni-produkti` (empty until `data/promotions.csv` / `data/short-dated.csv` have rows) |
| Product comparison | `/sravnenie` (up to 4 products, kept in the browser; compare icon on every product) |
| Blog | `/blog`, `/blog/<slug>` (the 17 articles of arfa7.bg/blog, in `src/content/blog.json`, covers in `public/blog/`) |
| Favourites | `/lyubimi` (kept in the browser, no accounts) |
| Checkout | `/poruchka` → `/poruchka/blagodarim` |
| Information and legal pages | `/info/dostavka`, `vrashtane`, `kak-da-porucham`, `kontakti`, `za-nas`, `obshti-usloviya`, `poveritelnost`, `biskvitki`, `prava-na-potrebitelite`, `organi` |

## Catalog import (`npm run import`)

`scripts/import-catalog.ts` reads the ~438,000-row export and writes `data/catalog.json`. Two rule sets sort the rows:

1. **Cosmetics** (`scripts/rules.ts`, from the cosmetics shop in `../dilon_kosmetika`, checked there in three QA
   rounds): make-up, skin, hair and body care, perfume, oral and intimate hygiene. Their places are moved into this
   shop's tree by `cosmeticPlace()` in `scripts/health-rules.ts`: children's products go to "Мама и бебе", men's to
   "За мъжа", certified organic to "Био", pregnancy care to "Козметика за мама".
2. **Pharmacy goods** (`scripts/health-rules.ts`): rows the cosmetics rules turn down are offered to an ordered list of
   rules — the first that matches wins (lice shampoo before shampoo, nicotine patches before patches). Medicines
   without prescription by complaint, food supplements by nutrient, sports nutrition, medical devices, baby food and
   feeding, bio food, household and stationery. Guards: electronics, toys, clothes, furniture, pets and the adult range
   are never taken; make-up and hair-care names never go into a pharmacy category; rows from stationery sources only
   become stationery and appliance rows only devices.
3. **Prescription medicines are left out** (the export's "Prescription Drug" category and anything that looks like one:
   injections, film-coated tablets, a pharma maker together with a dose). Online sale of prescription medicines is not
   allowed (чл. 234 ЗЛПХМ); the shop says so and sends people to the pharmacy.
4. Brands, names, sizes, duplicates and picture checks work as in the cosmetics shop (`scripts/brands.ts`,
   `scripts/names.ts`, `scripts/images.ts`): every picture is downloaded once and checked (cached in
   `data/image-check.json`), broken, tiny and placeholder pictures are dropped, and only the 50 hosts with the most
   products are kept (a Next.js limit).

Result of the last run: **59,575 products** (37,794 in stock; 18,089 cosmetics, 9,860 supplements and sports, 8,237 hygiene, 6,476 health, 6,476 home and office, 5,249 mother and baby, 2,552 bio, 1,392 men, 1,244 medical). What was skipped and why:
`data/import-report.json`.

To check rule changes quickly: `npm run import -- --dump <file.json>` writes how every row was sorted (no pictures, no
catalog) in about 8 minutes.

Options: `--file <csv>`, `--prices <csv>` (default `data/prices.csv`), `--skip-images`, `--recheck-images`, `--dump`.
After an import, restart the dev server or run `npm run build` again.

## Descriptions and pictures

The cosmetics carry the descriptions written for the cosmetics shop (copied from `../dilon_kosmetika/data/descriptions`,
`moiata/`, `lilly/`) and its extra gallery pictures. **Pharmacy goods have no description yet** — the product page
shows the characteristics and, for supplements and medicines, the required notices. `npm run enrich` can write them with
the OpenAI API (`OPENAI_API_KEY` in `.env.local`), but its prompt is still the cosmetics shop's: adapt
`scripts/enrich-descriptions.ts` (shop name, no health claims beyond the label) before running it on medicines and
supplements.

## Prices

**The export has no prices.** The import estimates a retail price per product: cosmetics as in the cosmetics shop
(subcategory, brand tier, size); pharmacy goods from a typical price per subcategory, the pack size (capsules, grams,
millilitres, pieces) and a brand level (`scripts/prices.ts`). Every product has `priceConfirmed: false`, and the order
e-mail to the shop warns when an order contains estimated prices.

Real prices: put a CSV with the columns `SKU` and `Price` (euro, VAT included) at `data/prices.csv` — see
`data/prices.example.csv` — and run the import again.

## Promotions and short-dated products

Nothing is invented: without these files the pages say there are no offers.

- `data/promotions.csv` — `SKU,OldPrice,Price` (see `promotions.example.csv`). Under the Omnibus rules `OldPrice` must be
  the lowest price of the 30 days before the promotion.
- `data/short-dated.csv` — `SKU,Expiry,Price` with `Expiry` as `YYYY-MM-DD` (see `short-dated.example.csv`); expired rows
  are skipped. The card and the product page show "Срок до MM.YYYY".

Run `npm run import` after changing them.

## Orders

Checkout is cash on delivery: an office or locker of Speedy, Econt, BOX NOW or Pigeon Express (3,49 €) or Speedy / Econt
to an address (4,99 €), free from 40,90 € as on arfa7.bg (`src/lib/site.ts`). The server re-reads prices and stock from
the catalog, never from the browser. Order numbers look like `AF-261029-SC3D`. Each order is appended to
`$DATA_DIR/orders.jsonl` (default `../arfa7-data`, outside the project) and, when `SMTP_HOST` is set, e-mailed to
`SHOP_EMAIL` and to the customer. **Without SMTP the orders are only in that file** — back it up.

Spam protection: hidden honeypot field, max 30 attempts and 5 placed orders per IP per 15 minutes (5 questions to the
pharmacist).

## Couriers and waybills

The checkout uses each courier's own lists (`src/lib/shipping/`, ported from the Maggie Joyland shop): the customer
picks the place from the courier's list of places, then one of its offices or lockers there (searchable, offices first),
or types the street address. When the customer switches couriers, the place is found again in the new courier's list.
The server checks the chosen office against the courier's list and writes it the courier's way; a made-up office is
refused. If a courier's list cannot be loaded, the checkout falls back to plain text fields and the order still goes
through. The lists are cached for 24 hours in memory and in `$DATA_DIR/courier-cache/` (refreshed in the background).

| Courier | Offices at checkout | Waybills |
| --- | --- | --- |
| Speedy | offices + APT lockers | REST API v1, service 505, sender pays, cash on delivery, A6 label |
| Econt | offices + Еконтомати (public list, no login needed) | `LabelService.createLabel`; **off until a working Econt login is in `.env.local`** |
| BOX NOW | lockers only | partner API, start point `BOXNOW_WAREHOUSE_ID` (2 = hand in at any locker), compartment size on the waybill page |
| Pigeon Express | offices + lockers | REST API v1, collected from the sender's address unless `PIGEON_DROPOFF_OFFICE_ID` is set |

**Waybills without an admin panel.** The shop's order e-mail has a "Създай товарителница" button. It opens
`/tovaritelnitsa/<number>?k=<key>`, a page only for the shop (the key is an HMAC of the order number with
`WAYBILL_SECRET`; without the right key the page is a 404). Opening it creates nothing — mail scanners that open links
are harmless. On the page: the order, the parcel weight worked out from the product sizes (editable), number of parcels,
BOX NOW compartment, optional declared value, and "Създай товарителница". The cash-on-delivery amount is the order total.
After that the page shows the waybill number, "Отпечатай етикета" (PDF from the courier), tracking and "Анулирай"
(possible until the courier has the parcel). The customer gets an e-mail with the tracking link. Waybills are kept in
`$DATA_DIR/shipments.json` and every create / cancel is logged in `$DATA_DIR/shipments-log.jsonl`. Without SMTP the
waybill link of each order is printed in the server log.

Settings in `.env.local` (see `.env.example`): the courier logins (`SPEEDY_*`, `ECONT_*`, `BOXNOW_*`, `PIGEON_*`), the
sender on the waybills (`SENDER_NAME`, `SENDER_CONTACT`, `SENDER_PHONE`, `SENDER_EMAIL`, `SENDER_CITY`, `SENDER_POSTCODE`,
`SENDER_ADDRESS`), optional drop-off offices (`SPEEDY_DROPOFF_OFFICE_ID`, `ECONT_DROPOFF_OFFICE_CODE`,
`PIGEON_DROPOFF_OFFICE_ID`) and `WAYBILL_SECRET`. `npm run couriers` checks every login without creating anything.

## Where to change things

| What | File |
| --- | --- |
| Shop name, company, licence, pharmacy hours, contacts, delivery prices, free-delivery limit | `src/lib/site.ts` |
| Courier logins, sender on the waybills, waybill link key, SMTP | `.env.local` |
| Categories, subcategories, collections and their texts | `src/lib/taxonomy.ts` |
| Information and legal pages | `src/content/pages.tsx` |
| Which rows are pharmacy goods and where they go | `scripts/health-rules.ts` |
| Which rows are cosmetics | `scripts/rules.ts` |
| Brand spellings, product name clean-up | `scripts/brands.ts`, `scripts/names.ts` |
| Price estimates | `scripts/prices.ts` |
| Home page | `src/app/page.tsx`, `src/components/home/HomeSections.tsx` |
| Colours, fonts, motion | `src/app/globals.css`, `src/app/fonts.ts` |
| Logo, icons, share image | `src/components/Wordmark.tsx`, `src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/opengraph-image.png` |

## Before going live

- Real prices (`data/prices.csv`).
- The VAT number (`SITE.company.vat` in `src/lib/site.ts`) — arfa7.bg does not publish one.
- arfa7.bg's privacy policy names ЕИК 203244428 and phone +359 886 537 710, while its terms and footer say ЕИК 205173951
  and +359 877 900 982. This shop uses the latter everywhere; confirm which is right.
- "Консултация до 1 час" is arfa7.bg's own promise, repeated here: the team has to keep it. (The free-sample promise
  was removed on purpose — do not add it back unless samples really go into every parcel.)
- Notify the Executive Agency for Medicinal Products (ИАЛ) about online sale of medicines without prescription from
  this site, as required for pharmacies selling online, and add the EU common logo for online pharmacies if needed.
- `NEXT_PUBLIC_SITE_URL`, `DATA_DIR` and the SMTP settings in `.env.local` on the server.
- A working Econt login for Econt waybills; then `npm run couriers`.
- Have a lawyer review the legal pages.
- Product pictures are hot-linked from the suppliers (Amazon, lillydrogerie.bg, notino…): check that the shop may use
  them, or download and host them.

## Scripts

| Command | What it does |
| --- | --- |
| `npx next dev -p 3007` / `npm run build` / `npm start` | Development server / production build / production server |
| `npm run import` | Rebuild the catalog from the export |
| `npm run import -- --dump <file>` | Only write how every row was sorted |
| `npm run enrich` | Write product descriptions with the OpenAI API (adapt the prompt first, see above) |
| `npm run logos` | Download brand icons for the home page's brand wall (`data/brand-domains.json`: brand slug → website) into `public/brands/`; `-- --again` refreshes all |
| `npm run couriers` | Check the courier logins (read-only) |
| `npm run typecheck` / `npm run lint` | Type check / ESLint |
