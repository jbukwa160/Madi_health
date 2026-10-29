// Categories, subcategories and collections of the shop. Ids are the URL slugs (Bulgarian, transliterated).
// The tree follows the pharmacy's own catalogue on arfa7.bg. The import (scripts/import-catalog.ts) sorts every product
// into exactly one category/subcategory; collections are cross-category groups computed from brand and name.

export type Sub = {
  id: string;
  name: string;
  /** Heading the subcategory is listed under in the menu. */
  group?: string;
};

export type Category = {
  id: string;
  name: string;
  /** Short name for tight places (tiles, mobile menu). */
  short?: string;
  /** One line under the title of the category page. */
  intro: string;
  subs: Sub[];
};

export const CATEGORIES: Category[] = [
  {
    id: "zdrave",
    name: "Фармация и здраве",
    short: "Здраве",
    intro: "Продукти без рецепта за всекидневните оплаквания — подредени по това, за което ви трябват. При съмнение попитайте нашия фармацевт.",
    subs: [
      { id: "nastinka-i-grip", name: "Настинка и грип", group: "Чести оплаквания" },
      { id: "bolka", name: "Болка и възпаление", group: "Чести оплаквания" },
      { id: "alergia", name: "Алергия", group: "Чести оплаквания" },
      { id: "hranosmilane", name: "Храносмилане", group: "Чести оплаквания" },
      { id: "san-i-stres", name: "Сън и стрес", group: "Чести оплаквания" },
      { id: "imunitet", name: "Имунитет", group: "Чести оплаквания" },
      { id: "usta-i-garlo", name: "Уста и гърло", group: "Чести оплаквания" },
      { id: "kozhni-problemi", name: "Кожни проблеми", group: "Чести оплаквания" },
      { id: "sartse-i-kravoobrashtenie", name: "Сърце и кръвообращение", group: "Органи и системи" },
      { id: "hemoroidi-i-veni", name: "Хемороиди и разширени вени", group: "Органи и системи" },
      { id: "stavi-i-kosti", name: "Стави и кости", group: "Органи и системи" },
      { id: "cheren-drob", name: "Черен дроб и детокс", group: "Органи и системи" },
      { id: "pikochen-trakt", name: "Пикочен тракт", group: "Органи и системи" },
      { id: "ochi", name: "Очи", group: "Органи и системи" },
      { id: "ushi", name: "Уши", group: "Органи и системи" },
      { id: "pamet", name: "Памет и концентрация", group: "Органи и системи" },
      { id: "diabet", name: "Кръвна захар", group: "Органи и системи" },
      { id: "shtitovidna-zhleza", name: "Щитовидна жлеза", group: "Органи и системи" },
      { id: "zhensko-zdrave", name: "Женско здраве", group: "За кого" },
      { id: "mazhko-zdrave", name: "Мъжко здраве", group: "За кого" },
      { id: "detsko-zdrave", name: "Детско здраве", group: "За кого" },
      { id: "probiotitsi", name: "Пробиотици", group: "Още" },
      { id: "homeopatia", name: "Хомеопатия", group: "Още" },
      { id: "otslabvane", name: "Отслабване", group: "Още" },
      { id: "otkazvane-ot-tsigari", name: "Отказване от цигари", group: "Още" },
    ],
  },
  {
    id: "kozmetika",
    name: "Козметика",
    intro: "Дермокозметика, грижа за лицето и тялото, грим и парфюми — от аптечните марки до любимите класики.",
    subs: [
      { id: "kremove-za-litse", name: "Кремове за лице", group: "Лице" },
      { id: "serumi", name: "Серуми и масла", group: "Лице" },
      { id: "pochistvane", name: "Почистване и тонизиране", group: "Лице" },
      { id: "okoloochen-kontur", name: "Околоочен контур", group: "Лице" },
      { id: "maski-i-pilingi", name: "Маски и пилинги", group: "Лице" },
      { id: "ustni", name: "Балсами за устни", group: "Лице" },
      { id: "losioni-za-tyalo", name: "Лосиони и масла за тяло", group: "Тяло" },
      { id: "ratse-i-kraka", name: "Ръце и крака", group: "Тяло" },
      { id: "slantsezashtita", name: "Слънцезащита", group: "Тяло" },
      { id: "grim-za-litse", name: "Грим за лице", group: "Грим" },
      { id: "grim-za-ochi", name: "Грим за очи", group: "Грим" },
      { id: "grim-za-ustni", name: "Грим за устни", group: "Грим" },
      { id: "nokti", name: "Нокти", group: "Грим" },
      { id: "aksesoari", name: "Четки и аксесоари", group: "Грим" },
      { id: "damski-parfyumi", name: "Дамски парфюми", group: "Парфюми" },
      { id: "uniseks-parfyumi", name: "Унисекс парфюми", group: "Парфюми" },
      { id: "parfyumni-komplekti", name: "Парфюмни комплекти", group: "Парфюми" },
      { id: "komplekti", name: "Козметични комплекти", group: "Парфюми" },
    ],
  },
  {
    id: "meditsinski-izdeliya",
    name: "Консумативи и медицински изделия",
    short: "Медицински изделия",
    intro: "Апарати за кръвно и термометри, превръзки, тестове и ортопедични помагала — всичко за домашната аптечка.",
    subs: [
      { id: "aparati", name: "Апарати и уреди" },
      { id: "testove", name: "Тестове" },
      { id: "prevrazki", name: "Пластири и превръзки" },
      { id: "konsumativi", name: "Медицински консумативи" },
      { id: "ortopedichni", name: "Ортопедични помагала" },
      { id: "inkontinentsia", name: "При инконтиненция" },
    ],
  },
  {
    id: "mama-i-bebe",
    name: "Мама и бебе",
    intro: "Бебешка козметика, храни, пелени и всичко за хранене — нежни формули и изпитани марки за първите години.",
    subs: [
      { id: "bebeshka-kozmetika", name: "Бебешка и детска козметика" },
      { id: "kozmetika-za-mama", name: "Козметика за мама" },
      { id: "bebeshki-hrani", name: "Бебешки храни и мляко" },
      { id: "peleni-i-karpi", name: "Пелени и мокри кърпи" },
      { id: "hranene", name: "Хранене и залъгалки" },
      { id: "karmene", name: "Кърмене" },
      { id: "ustroystva", name: "Уреди за бебето" },
    ],
  },
  {
    id: "dobavki-i-sport",
    name: "Хранителни добавки и спорт",
    short: "Добавки и спорт",
    intro: "Витамини, минерали, билки и спортно хранене — от ежедневната подкрепа до тренировката.",
    subs: [
      { id: "vitamini", name: "Витамини", group: "Добавки" },
      { id: "minerali", name: "Минерали", group: "Добавки" },
      { id: "multivitamini", name: "Мултивитамини", group: "Добавки" },
      { id: "omega", name: "Омега мастни киселини", group: "Добавки" },
      { id: "kolagen", name: "Колаген, коса и нокти", group: "Добавки" },
      { id: "bilki", name: "Билки и екстракти", group: "Добавки" },
      { id: "antioksidanti", name: "Антиоксиданти", group: "Добавки" },
      { id: "dobavki-za-detsa", name: "Добавки за деца", group: "Добавки" },
      { id: "drugi-dobavki", name: "Други добавки", group: "Добавки" },
      { id: "proteini", name: "Протеини", group: "Спорт" },
      { id: "aminokiselini", name: "Аминокиселини", group: "Спорт" },
      { id: "kreatin", name: "Креатин", group: "Спорт" },
      { id: "predtrenirovachni", name: "Предтренировъчни", group: "Спорт" },
      { id: "gaineri", name: "Гейнъри", group: "Спорт" },
      { id: "izgaryane-na-mazchnini", name: "Изгаряне на мазнини", group: "Спорт" },
      { id: "sportni-hrani", name: "Барове и спортни храни", group: "Спорт" },
    ],
  },
  {
    id: "higiena",
    name: "Хигиена",
    intro: "Устна хигиена, грижа за косата, душ и баня, интимна хигиена — всекидневното, което трябва да е под ръка.",
    subs: [
      { id: "pasti-za-zabi", name: "Пасти за зъби", group: "Устна хигиена" },
      { id: "chetki-za-zabi", name: "Четки за зъби", group: "Устна хигиена" },
      { id: "vodi-i-konci", name: "Води за уста и конци", group: "Устна хигиена" },
      { id: "shampoani", name: "Шампоани", group: "Коса" },
      { id: "balsami-i-maski", name: "Балсами, маски и серуми", group: "Коса" },
      { id: "kosopad", name: "Скалп и косопад", group: "Коса" },
      { id: "stilizirane", name: "Стилизиране", group: "Коса" },
      { id: "boya-za-kosa", name: "Боя за коса", group: "Коса" },
      { id: "uredi-za-kosa", name: "Сешоари и преси", group: "Коса" },
      { id: "aksesoari-za-kosa", name: "Четки и аксесоари за коса", group: "Коса" },
      { id: "dush-i-sapuni", name: "Душ гелове и сапуни", group: "Тяло" },
      { id: "vana", name: "Вана и скрабове", group: "Тяло" },
      { id: "dezodoranti", name: "Дезодоранти", group: "Тяло" },
      { id: "depilatsia", name: "Депилация", group: "Тяло" },
      { id: "damska-higiena", name: "Превръзки и тампони", group: "Лична хигиена" },
      { id: "intimna-higiena", name: "Интимна хигиена", group: "Лична хигиена" },
      { id: "higienni-konsumativi", name: "Памучни продукти и кърпички", group: "Лична хигиена" },
      { id: "vashki", name: "Против въшки", group: "Лична хигиена" },
    ],
  },
  {
    id: "za-mazha",
    name: "За мъжа",
    intro: "Бръснене, брада, парфюми и грижа за мъжката кожа — без излишни стъпки.",
    subs: [
      { id: "brasnene", name: "Бръснене" },
      { id: "brada", name: "Брада и мустаци" },
      { id: "parfyumi-za-mazhe", name: "Парфюми за мъже" },
      { id: "dezodoranti-za-mazhe", name: "Дезодоранти" },
      { id: "grizha-za-mazhe", name: "Грижа за лице и тяло" },
      { id: "kosa-za-mazhe", name: "Грижа за косата" },
    ],
  },
  {
    id: "bio",
    name: "Био и натурални продукти",
    short: "Био и натурални",
    intro: "Сертифицирана био козметика, суперхрани, билкови чайове и етерични масла.",
    subs: [
      { id: "bio-kozmetika", name: "Био козметика" },
      { id: "bio-dobavki", name: "Био хранителни добавки" },
      { id: "superhrani", name: "Био храни и суперхрани" },
      { id: "chayove", name: "Билкови чайове" },
      { id: "eterichni-masla", name: "Етерични масла" },
    ],
  },
  {
    id: "dom-i-ofis",
    name: "Продукти за дома и офиса",
    short: "Дом и офис",
    intro: "Почистване, пране, ароматизатори и канцеларски материали.",
    subs: [
      { id: "pochistvane-na-doma", name: "Почистващи препарати" },
      { id: "prane", name: "Перилни препарати" },
      { id: "sadove", name: "Препарати за съдове" },
      { id: "hartia", name: "Хартия и домакински консумативи" },
      { id: "aromatizatori", name: "Ароматизатори и свещи" },
      { id: "nasekomi", name: "Защита от насекоми" },
      { id: "kantselariya", name: "Канцеларски материали" },
    ],
  },
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export function findSub(category: string, sub: string): Sub | undefined {
  return CATEGORY_BY_ID.get(category)?.subs.find((s) => s.id === sub);
}

// ── Collections ──

export type CollectionId = "novo" | "dermokozmetika" | "bez-zahar" | "vegan" | "balgarski" | "podaratsi" | "za-nego" | "detsa";

export type Collection = { id: CollectionId; name: string; title: string; intro: string };

export const COLLECTIONS: Collection[] = [
  { id: "novo", name: "Ново", title: "Нови продукти", intro: "Последните попълнения в каталога на аптеката." },
  {
    id: "dermokozmetika",
    name: "Дермокозметика",
    title: "Дермокозметика",
    intro: "Аптечни марки, създадени с дерматолози — за чувствителна, суха и проблемна кожа.",
  },
  { id: "vegan", name: "Веган", title: "Веган продукти", intro: "Добавки, храни и козметика без съставки от животински произход." },
  { id: "bez-zahar", name: "Без захар", title: "Без захар и без глутен", intro: "Добавки и храни без добавена захар или без глутен." },
  { id: "balgarski", name: "Български", title: "Български марки", intro: "Розово масло, билки и мед — марки, родени в България." },
  { id: "podaratsi", name: "Подаръци", title: "Подаръчни комплекти", intro: "Готови комплекти, които не се нуждаят от опаковане." },
  { id: "za-nego", name: "За него", title: "За него", intro: "Бръснене, парфюми и грижа за мъже." },
  { id: "detsa", name: "Деца", title: "Деца и бебета", intro: "Нежни формули и добавки за най-малките." },
];

export const COLLECTION_BY_ID = new Map(COLLECTIONS.map((c) => [c.id, c]));
