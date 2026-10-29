// Rules for everything the pharmacy sells besides cosmetics: medicines without prescription, food supplements and sports
// nutrition, medical devices, mother & baby, bio food and household goods. Cosmetics are recognised by the older, much
// larger rule set in rules.ts (built for the cosmetics shop) and then moved into this shop's tree by `cosmeticPlace()`.
//
// Like there, the export's own categories only narrow down where a row may come from; the place comes from the name.
// Rules are tried in order and the first one that matches wins, so specific rules (lice shampoo, nicotine patches,
// pregnancy tests) come before broad ones (shampoo, patches, tests).

import { type CsvRow, matchText, type Place, rx } from "./rules";

const P = (category: string, sub: string): Place => ({ category, sub });

// ── Which rows may be pharmacy goods ──

/** Export categories that hold pharmacy, baby, food, household and stationery goods (with much else besides). */
const SOURCE = rx(
  "^$|health|supplement|аптека|dietary|medical|feminine|майка и бебе|baby feeding|baby gear|food|sports|personal care|skin ?care|cosmetic|make-?up|hair|oral care|cleaning|household|за дома|home & garden|stationery|пособия и подаръци|^other$|козм|косм|home appliances|малки електроуреди",
);
/** Sources of supplements: an unspecific "capsules, 60 pcs" row from here is still a food supplement. */
const SUPPLEMENT_SOURCE = rx("health|supplement|аптека|dietary|sports");
const FOOD_SOURCE = rx("food|health|supplement|аптека|dietary|^other$|^$");
const HOUSEHOLD_SOURCE = rx("cleaning|household|за дома|home & garden|^other$|^$|feminine|personal care");
const STATIONERY_SOURCE = rx("stationery|пособия и подаръци|за дома и офиса");
/** Export categories of school and office supplies only: their rows can only be stationery. */
const STATIONERY_ONLY = rx("stationery|пособия и подаръци");

/** Prescription medicines are not sold online (чл. 234 ЗЛПХМ): the whole source and anything that looks like one. */
const PRESCRIPTION_SOURCE = /^prescription drug$/i;
const RX_MAKERS =
  "teva|тева|sandoz|сандоз|actavis|актавис|zentiva|зентива|sopharma|софарма|tchaikapharma|чайкафарма|gedeon richter|рихтер|krka|кърка|egis|егис|pfizer|пфайзер|novartis|sanofi|санофи|merck|organon|astellas|alkaloid|алкалоид|servier|сервие|polpharma|полфарма|glaxosmithkline|\\bgsk\\b|\\bmsd\\b|angelini|menarini|berlin-chemie|stada|щада|medochemie|pharmaswiss|ratiopharm|mylan|viatris|accord|hexal|nobel pharma|ipsen|laboratoires thea|lek pharma|adipharm|адифарм|antibiotic-razgrad|антибиотик-разград|unipharm|унифарм|sun pharma|ranbaxy|zydus|bausch";
const RX_LIKE = rx(
  `инжекц|инфузион|за инжектиране|флакон(?=.*(?:прах|разтвор))|филм\\.?\\s?тб|филмирани таблетки|стомашно-устойчиви|с удължено освобождаване|по лекарско предписание|\\bрецептурн|(?:${RX_MAKERS})(?=.*\\d+(?:[.,]\\d+)?\\s?(?:мг|mg|мкг|mcg|µg)\\b)(?=.*(?:таблет|капсул|сироп|ампул|разтвор|супозитор|маз\\b|\\bтб\\.?\\b|\\bкапс\\.?\\b))`,
);

/** Never pharmacy goods, wherever the word appears. */
const NOT_PHARMACY = rx(
  [
    // toys, games and gifts
    "играчк", "\\bигра\\b", "\\bигри\\b", "кукл[аи]", "\\bпъзел", "конструктор", "\\blego\\b", "плюшен", "\\bфигурк", "дрънкалк", "активна гимнастика",
    "музикален прожектор", "\\bмобил(?:е|ът)?\\b", "проходилк(?!.*(?:ортопед|възрастн|ролатор))", "колело за баланс", "\\bтротинетк", "\\bшейна", "\\bплажен", "за пясък",
    "\\bбалон", "конфети", "тоалетка", "детск\\p{L}* дървен", "\\bginger home\\b", "shaker", "шейкър", "smartshake", "запалка", "\\bzippo\\b", "капан за сънища", "комплект за изработка", "портмоне", "\\bпортфейл", "книжка за", "\\bпоздравителн", "\\bкартичк", "стикер", "фосфоресц", "\\bвлакче", "\\bкамион", "\\bкораб\\b", "\\bкран\\b", "детски дървен", "\\bмашинк\\p{L}* (?:играчк|кола)", "сапунени балони", "\\bкостюм", "направи си сам", "творчески комплект", "оцветяв", "\\bрисуван", "пластилин", "\\bслайм",
    // clothes and textiles
    "\\bбоди\\b", "гащеризон", "\\bблуз", "тениск", "\\bрокл", "панталон", "\\bяке\\b", "\\bшапк", "\\bпижам", "\\bобувк", "\\bбуйки", "ританки",
    "(?<!ортопедични )(?<!компресивни )(?<!компресионни )\\bчорап(?!.*(?:компрес|разширени вени|диабет|ортопед|антиембол|варикоз))", "\\bбельо\\b",
    "ръкавичк\\p{L}* за (?:количка|новородено|бебе)", "\\bшал\\b", "\\bраница", "\\bчанта(?! за пелени)", "куфар",
    "\\bчаршаф(?!.*(?:непромокаем|еднократн|медицин|абсорб))", "спален комплект", "спално бельо", "чувалче", "\\bодеял", "\\bзавивк", "муселин", "\\bхавлия", "\\bхалат",
    "гнездо за сън", "\\bкърпа за (?:гушкане|баня)", "\\bвъзглав(?!.*(?:кърмене|бременни|ортопед|анатомич|шийн|за врат|медицин))",
    // furniture and baby gear the pharmacy does not stock
    "матрак(?!.*(?:антидекубит|противодекубит))", "\\bкошар", "\\bлегл[оа]", "\\bстолче", "стол за (?:кола|хранене)", "\\bisofix", "\\bколичк", "кош за кола",
    "\\bшезлонг", "\\bлюлк", "\\bпортиер", "преграда за", "ограда за", "\\bкомод", "повивалник(?! с)", "\\bвана за (?:къпане|бебе)", "\\bгърне\\b",
    "\\bпротектор за (?:количка|легло|стъклено шише)", "\\bманшон", "\\bсенник", "\\bдъждобран", "кенгуру за кола", "огледало за кола",
    // electronics, tools and car
    "\\busb\\b", "\\bкабел", "зарядн", "power supply", "захранван", "\\bdock\\b", "\\bhdmi", "\\bssd\\b", "\\bhdd\\b", "\\bлаптоп", "\\biphone", "\\bipad",
    "\\bgalaxy\\b", "\\bкалъф", "\\bкейс\\b", "слушалк", "\\bмишка\\b", "клавиатур", "\\bмонитор(?!.*(?:бебе|дишане|кръвно))", "\\bпринтер", "\\bтонер",
    "\\bмастил", "фитинг", "компресорно масло", "\\bвентилатор", "прахосмукач", "\\bтелевизор", "хладилник", "\\bфурна", "микровълн", "\\bтиган", "\\bтенджер",
    "кафемашин", "\\bчайник", "\\bблендер(?!.*(?:бебе|пара|baby))", "\\bмиксер", "\\bлампа(?!.*(?:инфрачерв|uv|солев))", "крушк", "\\bбатери(?:я|и)\\b(?!.*(?:слухов|апарат))",
    "\\bmah\\b", "power bank", "smart watch", "смарт часовник", "\\bgps\\b", "\\bавтомоб", "\\bгуми\\b", "\\bмотор", "\\bвелосипед", "обезвлажнител",
    // pets
    "за кучета", "за котки", "\\bкуче", "\\bкотк[аи]\\b", "\\bкотешк", "\\bкучешк", "friskies", "whiskas", "pedigree", "домашни любимци", "за птици",
    "аквариум", "\\bгризачи\\b(?!.*(?:против|срещу|капан))",
    // books, media
    "\\bкнига\\b", "\\bучебник", "енциклопедия", "\\bdvd\\b", "\\bcd\\b", "\\bроман\\b",
    // adult products are sold by the 18+ shop
    "презерватив", "\\bcondom", "лубрикант", "\\blubric", "вибратор", "дилдо", "мастурб", "\\bсекс", "\\bsex\\b", "феромон", "\\bеротич", "ерекци", "оргазъм",
    "интимна (?:играчка|помпа)", "вакуумна помпа",
    // drinks and sweets that are not health food
    "\\bбира\\b", "\\bвино\\b", "\\bводка", "\\bуиски", "\\bлокум", "\\bчипс(?!.*протеин)", "\\bсладолед", "\\bторта", "\\bгуми бонбони(?!.*витамин)",
    "енергийна напитка(?!.*(?:без захар|zero))", "\\bкока-кола", "\\bcoca-cola", "\\bpepsi",
  ].join("|"),
);

// ── Places ──

/** Words and brands that say a row is for babies, anywhere in the name ("5+м", "Holle", "NUK"). */
const BABY_HINT =
  "(?:\\d+\\s?(?:m|м)\\+|\\d+\\+\\s?(?:m|м)\\b|\\d+\\s?(?:месец|мес\\.)|\\bмесеца\\b|\\bбебе|\\bбебешк|\\bbaby\\b|\\bbebe\\b|кърмач|\\bдетск|\\bkids?\\b|\\bhipp\\b|\\bholle\\b|\\bgerber\\b|\\bbabybio\\b|\\bслънчо\\b|\\bbebivita\\b|\\bhumana\\b|\\bnestle\\b|\\bnuk\\b|\\bavent\\b|\\btommee|\\bcanpol|dr\\.? brown|\\bmam\\b|\\blovi\\b|\\bchicco\\b|\\bdifrax|\\bbabyono|\\bbibs\\b|\\bnuvita|\\bkiokids|\\bmedela|\\bbabylove|\\bnip\\b|\\btwistshake|\\bbeaba\\b|everyday baby|wee baby|bebe confort|vital baby|\\bbabyjem|sevi baby|\\blansinoh|\\bpigeon\\b|\\bnoby\\b|\\bmunchkin|\\bdooky|\\blorelli|\\bkikkaboo|\\bbebetto|\\bminiland|\\blassig|\\blässig|\\breer\\b)";
const KIDS = "(?:за деца|\\bдетск|\\bдеца\\b|\\bkids?\\b|\\bjunior\\b|\\bchildren|\\bбебе|\\bбебета\\b|\\bбебешк|\\bbaby\\b|\\binfant|за малки)";
/** Rows named after a nutrient go to the nutrient ("Магнезий за нервната система" is magnesium). */
const NUTRIENT = "витамин|vitamin|магнез|magnes|\\bцинк|\\bzinc|калций|calcium|\\bселен\\b|selenium|мултивит|multivit|омега|omega|рибено масло|fish oil|коензим|\\bq10\\b";
const DOSE_FORM = "(?:капсул|\\bкапс\\.?\\b|таблет|\\bтабл?\\.?\\b|\\bтб\\.?\\b|\\bcaps\\b|capsules|tablets|\\btabs\\b|softgels?|дражета|сашет|\\bsachets?\\b|желирани|\\bgummies\\b|дъвчащ|ефервесцент|\\bmg\\b|\\bмг\\b|\\bmcg\\b|\\bмкг\\b|µg|\\biu\\b|\\bме\\b|добавк|supplement|\\bсироп|\\bsyrup|капки|\\bdrops\\b|ампули|тинктура|tincture|\\bпрах\\b|powder|дози\\b|servings)";

type Rule = {
  place: Place;
  re: RegExp;
  /** The row is skipped by this rule when this matches. */
  not?: RegExp;
  /** The rule only applies to rows from these export categories. */
  from?: RegExp;
};

const R = (category: string, sub: string, pattern: string, extra: { not?: string; from?: RegExp } = {}): Rule => ({
  place: P(category, sub),
  re: rx(pattern),
  not: extra.not ? rx(extra.not) : undefined,
  from: extra.from,
});

const RULES: Rule[] = [
  // ── Specific before general ──
  R("higiena", "vashki", "въшки|гниди|\\blice\\b|паранит|paranit|хедрин|hedrin|full marks|\\bnyda\\b|педикулоцид"),
  R("zdrave", "otkazvane-ot-tsigari", "тютюнопушене|никотин|nicotine|nicorette|никорет|отказ(?:ване)? от (?:цигари|пушене)|\\btabex\\b|табекс|алкохолна зависимост|махмурлук|hangover|\\bантиалкохол"),
  R(
    "meditsinski-izdeliya",
    "testove",
    "тест(?:ове)? за (?:бременност|овулация|covid|ковид|грип|наркотици|алкохол|ph|урина|фертилитет|менопауза|стрептокок|helicobacter|хеликобактер|холестерол|кръв|инфекц|витамин|простат|скрита кръв)|антигенен тест|бърз тест|експрес тест|тест[- ]?ленти|test strips|\\bланцет|\\blancet|\\bclearblue\\b|\\bdiagnostic test\\b|\\bтест касета|алкохолтест|дрегер",
  ),

  // Baby devices, breastfeeding and feeding come before the general devices and medical rules.
  R("mama-i-bebe", "ustroystva", "стерилизатор|аспиратор|бебефон|видеобебефон|baby monitor|нагревател за (?:шишета|бебешка|храна|бутилки)|(?:уред за )?подгряване на (?:шишета|бебешка храна|храна)|bottle warmer|уред за (?:бебешка храна|готвене на пара)|бебешк\\p{L}* (?:везн|кантар)|монитор за дишане"),
  R(
    "mama-i-bebe",
    "karmene",
    "помпа за (?:кърма|изцеждане)|breast ?pump|(?:пликове|торбички|контейнери|бутилки) за (?:кърма|съхранение на кърма)|(?:протектор|шапк)\\p{L}* за зърна|nipple shield|подплънки за (?:кърм|гърди)|влошки за (?:кърм|гърди)|(?:сутиен|бюстие) за (?:кърм|бременни)|възглавница за (?:кърмене|бременни)|колан (?:за )?след раждане|следродилен колан|бандаж за бременни|\\bкенгуру\\b|\\bслинг|ерго раница|гащи (?:за|след) раждане|следродилни (?:превръзки|гащи)",
  ),
  R(
    "meditsinski-izdeliya",
    "inkontinentsia",
    "инконтиненц|incontinen|(?:пелени|памперси|гащи|подложки) за възрастни|за възрастни(?=.*(?:пелени|памперси|гащи|подложки))|\\bmolicare\\b|\\btena\\b|\\bseni\\b|abri-?form|\\bdepend\\b|подложки за легло|урологичн|урологически",
  ),
  R(
    "mama-i-bebe",
    "peleni-i-karpi",
    "\\bпелени\\b|памперс|pampers|huggies|\\blibero\\b(?=.*(?:пелен|размер|\\d+\\s?бр|pants|up ?& ?go|comfort|touch|newborn))|\\bpants\\b(?=.*(?:pampers|huggies|размер|size|\\d+\\s?бр))|гащички(?=.*(?:пелен|размер|pampers|huggies))|(?:бебешки|детски) (?:мокри|влажни) кърп|(?:мокри|влажни) (?:почистващи |бебешки )?кърп\\p{L}*(?=.*(?:бебе|baby|детск|деца|pampers|huggies|johnson))|подложки за повиване|еднократни подложки(?=.*(?:бебе|повиван))",
    { not: "муселин|текстил|пелена за повиване" },
  ),
  R(
    "mama-i-bebe",
    "hranene",
    `^(?=.*${BABY_HINT}).*(?:\\bшише|\\bшишета|\\bчаш|\\bприбор|\\bлъжичк|\\bвилиц|\\bчини|\\bкупичк|\\bконтейнер|\\bтермос|\\bкутия за (?:храна|залъгалк|снакс)|\\bсламк|\\bподложк\\p{L}* за хранене|\\bтермоопаковк|\\bмрежичка)|биберон|залъгалк|\\bсоска|неразливаща|\\bлигавни|\\bгризалк|чесалк\\p{L}* за зъби|комплект за хранене|четка за (?:шишета|биберони)|клипс за залъгалк|верижка за залъгалк|дозатор за (?:сухо )?мляко`,
    { not: "термо бутилка(?!.*(?:бебе|детск))|спортн|за вода(?!.*(?:бебе|детск))|шампоан|душ гел|крем\\b|лосион|тоалетна чиния|седалка|алуминиев" },
  ),
  R(
    "mama-i-bebe",
    "bebeshki-hrani",
    `^(?=.*${BABY_HINT}).*(?:\\bкаш[аи]\\b|\\bпюре\\b|\\bснакс|бисквит|\\bчай\\b|\\bсок\\b|\\bдесерт|\\bмакарон|\\bсупа\\b|\\bзърнен|\\bхрупкав|\\bпуканки|\\bкрекер|\\bгризини|\\bпудинг|\\bмюсли|\\bястие|\\bменю\\b)|(?:адаптирано|преходно|бебешко|растежно|детско) мляко|мляко за (?:кърмачета|деца|бебета)|\\bformula\\b(?=.*(?:\\d+\\s?(?:g|г|гр)\\b|месец))|за кърмачета|храна за бебета|\\b(?:aptamil|bebelac|novalac|nutrilon|bebivita|milupa|nan optipro|nan comfortis|nan ha|similac|enfamil|frisolac)\\b`,
    { not: "шампоан|душ гел|крем\\b|лосион|сапун|кърпи|пелени" },
  ),

  // Children's medicines and supplements: before the condition and nutrient rules.
  R("dobavki-i-sport", "dobavki-za-detsa", `${KIDS}(?=.*(?:витамин|vitamin|мултивитамин|омега|omega|рибено масло|fish oil|желирани|gummies|дъвчащ|желязо|магнези|калций|цинк|d3|пробиотик|probiotic))`, { not: "паста за зъби|шампоан|крем\\b|душ гел|сапун" }),
  R(
    "zdrave",
    "detsko-zdrave",
    `${KIDS}(?=.*(?:сироп|капки|спрей за (?:нос|гърло)|супозитор|колики|никнене|зъбки|температур|кашлиц|гел за венци|диария|запек|рехидрат|електролит))|колики|никнене на (?:зъби|зъбки)|прорязване на зъб|гел за венци(?=.*(?:бебе|деца|детск|зъбки))|\\bсаб симплекс|\\bsab simplex|\\bинфакол|\\binfacol|\\bespumisan baby`,
    { not: "паста за зъби|шампоан|душ гел|сапун|\\bкрем\\b(?!.*(?:за венци|колики))" },
  ),

  // Remedies with their own sections.
  R(
    "zdrave",
    "homeopatia",
    "хомеопат|homeopat|homöopath|\\bboiron\\b|буарон|\\bheel\\b|\\bхеел\\b|осцилококцинум|oscillococcinum|шуслер|schüssler|schussler|tissue salts|\\bcalc(?:area)? (?:sulph|phos|fluor)|\\bd(?:6|12)\\b(?=.*(?:таблет|dhu))|\\b(?:4|5|7|9|12|15|30)\\s?ch\\b(?!.*(?:kit|канал|camera|камера))|гранули(?=.*\\d+\\s?ch\\b)|(?:dr\\.?|д-р) (?:бах|bach)|цветн\\p{L}* есенци|flower essence|есенция (?:\\p{L}+ ){0,3}№|bach (?:flower|rescue|remedy)|rescue remedy|капки на бах|\\bguna\\b",
  ),
  R(
    "zdrave",
    "probiotitsi",
    "пробиоти|probiotic|пребиоти|prebiotic|синбиоти|лактобацил|lactobac|бифидо|bifido|\\bфлора\\b(?=.*(?:капс|сашет|чревна))|сахаромицес|saccharomyces|\\bbiogaia\\b|биогая|ентерогермина|enterogermina|ентерол\\b|enterol\\b|линекс|linex|\\bбиофлор|\\bfemiflor|\\bflorastor|\\bуртика(?!.*крем)|лактоферин|lactoferrin",
  ),

  // Patches that are not dressings.
  R("zdrave", "bolka", "пластир\\p{L}*(?=.*(?:болк|ментол|камфор|капсаицин|затопл|загрява|топлинн|thermacare|мускул|стави|гръб|кръст))|затоплящ\\p{L}* пластир|охлаждащ\\p{L}* пластир"),
  R("zdrave", "san-i-stres", "пластир\\p{L}*(?=.*(?:мелатонин|сън|спокоен))"),

  // ── Medical devices and supplies ──
  R(
    "meditsinski-izdeliya",
    "aparati",
    "апарат\\p{L}* за (?:измерване на )?(?:кръвно|кръвното|артериално)|кръвно налягане(?=.*(?:апарат|монитор|уред))|blood pressure monitor|сфигмоманометър|термометър|thermometer|пулсоксиметър|пулс ?оксиметър|\\bоксиметър|oximeter|глюкомер|glucometer|инхалатор|небулайзер|nebuli[sz]er|стетоскоп|stethoscope|\\btens\\b|електростимулатор|инфрачервена лампа|апарат за (?:магнитна|ултразвук|масаж)|кантар за (?:тяло|измерване)|телесно тегло(?=.*везн)|\\bвезна\\b(?=.*(?:тяло|телесн|медицин|персонал))|грейка(?=.*(?:електр|\\d+\\s?w\\b))|\\bomron\\b(?=.*(?:m\\d|апарат|инхалатор|термометър))|\\bmicrolife\\b|\\bmedel\\b(?=.*(?:апарат|инхалатор|термометър))|\\bdr\\.? frei\\b(?=.*(?:апарат|инхалатор|термометър))|bathroom scale|body fat|телесни мазнини|телесна маса|кантар за баня|диагностичен кантар|\\bscale\\b(?=.*(?:body|bathroom|weight|тегло))|пикфлоуметър|спейсър|камера за инхалиране|маска за инхалатор",
    { not: "кухненск|за багаж|багажен" },
  ),
  R(
    "meditsinski-izdeliya",
    "ortopedichni",
    "наколенк|наглезенк|налакътник|накитник(?!.*(?:фитнес|тренир|wrist ?wraps))|\\bортез|\\bбандаж(?! за бременни)|корсет(?=.*(?:лумбал|ортоп|медицин|гръб|кръст|бандаж))|лумбален колан|колан за (?:кръст|гръб|кръста|поясн)|коректор на стойката|коректор за стойка|posture corrector|шийна яка|яка за (?:врат|шия)|ортопедичн|\\bстелки\\b|стелка\\b|разделител(?:и)? за пръсти|коректор за (?:палец|пръсти)|hallux|халукс|бурсит|компресивн|компресионн|антиемболичн|патерица|бастун|ролатор|проходилка за възрастни|\\borthoteh\\b|ортотех|\\bmedi\\b(?=.*(?:бандаж|ортеза|чорап))|ортопедичен|възглавница (?:за врат|ортопедична|анатомична)|рамото|\\bшина за\\b|имобилизатор|epicondylitis|тенис лакът|\\bтейп\\b|kinesio",
    { not: "фитнес|тренировъч|wrist ?wraps|knee wraps|\\bbmx\\b|harbinger" },
  ),
  R(
    "meditsinski-izdeliya",
    "prevrazki",
    "пластир|plaster|лейкопласт|\\bбинт|марля|марли\\b|марлен|компрес(?!ор|ионн|ивн)|превръзк\\p{L}*(?!.*(?:дамск|ежедневн|always|libresse|bella|naturella|everyday|ultra|нощн|дневн))|wound|хидроколоид|hydrocolloid|\\bhansaplast\\b|\\burgo\\b|\\bnexcare\\b|\\bneoplast\\b|тубуларен|гипсов|самозалепващ\\p{L}* (?:бинт|лента)|фиксираща лента|медицинска лента|steri-?strip|\\bopsite\\b|\\bhartmann\\b(?=.*(?:превръзк|бинт|компрес|лента))|мехур(?:и)? (?:на|по) крака|пластири за мазоли|мазолни пластири",
    { not: "дамски превръзки|ежедневни превръзки|превръзки (?:always|libresse|bella|naturella|everyday)" },
  ),
  R(
    "meditsinski-izdeliya",
    "konsumativi",
    "спринцовк|\\bиглa?\\b|\\bигли\\b|ръкавици(?=.*(?:медицин|нитрил|латекс|винил|за еднократн|еднократни|диагностич|хирург|стерилн))|(?:медицинск|предпазн|хирургичн)\\p{L}* маск|\\bffp[123]\\b|\\bkn95\\b|етилов спирт|медицински спирт|\\bспирт\\b(?=.*(?:\\d+\\s?%|мл|ml))|кислородна вода|водороден пероксид|\\bйод(?:ова|ен)? (?:тинктура|разтвор)|повидон|бетадин|betadine|риванол|хлорхексидин|октенисепт|octenisept|дезинфекция на (?:рани|кожата)|антисептик(?! за ръце)|тапи за уши|\\bquies\\b|ear ?plugs|катетър|\\bсонда\\b|уринатор|уринаторн|торбичк\\p{L}* за урина|шпатул(?:а|и) за език|еднократн\\p{L}* (?:бръснач|подложк|престилк)|стерилн\\p{L}* (?:ръкавици|кърпи|тампони)|туба за (?:кръв|урина)|контейнер за (?:урина|изпражнения|проби)|чашка за урина|\\bабокат|системи за вливане|клизма|eнема|напръстни",
    { not: "за тяло|за лице|подаръч" },
  ),

  // Teas and essential oils go by what they are, not by the complaint they are for.
  R("bio", "chayove", "\\bчай\\b|\\bчая\\b|\\bчайове|\\bчаят\\b|\\btea\\b|\\bteas\\b|билкова смес(?=.*(?:запарк|пакетч|филтър))|\\bзапарка|инфузия|\\bматча\\b|\\bmatcha\\b|\\bройбос|rooibos|\\bмате\\b|yerba mate|\\bкукича|\\bсенча|\\bpu-?erh|\\bпу-?ер|\\bлайка\\b(?=.*(?:пакетч|\\d+\\s?(?:г|гр|g)\\b|филтър))|\\bмента\\b(?=.*(?:пакетч|филтър))", {
    not: "капсул|таблет|екстракт|caps|tablets|extract|\\bmg\\b|\\bмг\\b|колаген|collagen|\\bcarb|xpress|\\bbowl\\b|\\bкупа\\b|\\bwhisk|бъркалк|чаено дърво|tea tree|green tea (?:mask|cream|serum|toner)|зелен чай (?:маска|крем|серум|тоник|душ|сапун|шампоан)|душ гел|сапун|крем|шампоан|ароматизатор|свещ|чаша|термос|лъжичк|цедка|инфузер|чайник|сервиз|\\bice tea\\b|студен чай(?!.*(?:био|bio))",
    from: rx("food|health|supplement|аптека|dietary|^other$|^$|майка и бебе|baby feeding"),
  }),
  R("bio", "eterichni-masla", "етерично масло|етерични масла|essential oils?|ароматерапи|aromatherap|\\bмасло от (?:лавандула|чаено дърво|евкалипт|мента|розмарин|лимон|портокал|бергамот)(?=.*(?:\\d+\\s?(?:ml|мл)))"),

  // ── Conditions (medicines without prescription and targeted supplements) ──
  R(
    "zdrave",
    "nastinka-i-grip",
    "настинк|\\bгрип\\b|грипни|\\bflu\\b|\\bcold\\b(?=.*(?:flu|sore|сироп|таблет))|кашлиц|\\bcough|хрема|запушен нос|(?:спрей|капки|гел|мехлем) за (?:нос|носа)|назал|\\bnasal|синузит|sinus|гърло|\\bthroat|пастил|таблетки за смучене|ангина|температур|фебрил|морска вода(?=.*(?:нос|спрей))|физиологичен разтвор(?=.*(?:нос|спрей|ампул))|изотоничен разтвор|хипертоничен|\\bsterimar\\b|\\bmarimer\\b|naso libero|назо либеро|aqua maris|аква марис|otrivin|отривин|олинт|ксилометазолин|колдрекс|coldrex|theraflu|терафлу|фервекс|fervex|антигрипин|муколит|отхрачв|бронхи|бронхит|бръшлян|исландски лишей|\\bivy\\b(?=.*(?:сироп|leaf|лист))|инхалиране|инхалации|инхалационн|\\bvicks\\b|балсам за гърди|затоплящ балсам(?=.*(?:гърди|настинк))|\\bstrepsils\\b|стрепсилс|\\bfaringo|\\bпропосол|\\bproposol|\\bгрипоцитрон|\\bgrippostad|\\bаспирин c\\b|\\bnasic\\b",
  ),
  R("zdrave", "alergia", "алерги|allerg|антихистамин|antihistamin|цетиризин|cetirizin|лоратадин|loratadin|дезлоратадин|фексофенадин|сенна хрема|сенна треска|hay fever|поленов\\p{L}* алерг|\\bclaritine\\b|кларитин|\\bzyrtec\\b|зиртек|\\baerius\\b|ериус|\\bfenistil\\b|фенистил"),
  R(
    "zdrave",
    "hranosmilane",
    "храносмил|digest|стомах|stomach|киселини|heartburn|рефлукс|reflux|гастрит|диари|diarrh|запек|constipat|лаксатив|laxative|слабителн|разхлабит|газове|подуване|метеоризъм|flatulen|симетикон|simethicon|\\bензим|\\benzyme|панкреатин|pancreatin|смекта|smecta|активен въглен|activated charcoal|\\bвъглен\\b|медицински въглен|\\brennie\\b|рени\\b|гавискон|gaviscon|маалокс|maalox|дюфалак|duphalac|псилиум|psyllium|\\bфибри\\b|\\bfiber\\b|гадене|nausea|повръщане|морска болест|motion sickness|прилошаване|\\bdebridat|\\bбускопан|buscopan|\\bхилак|\\bhylak|\\bmezym|мезим|креон|creon|\\bespumisan|еспумизан|\\bиберогаст|iberogast|лактаза|lactase|\\bmotilium|\\bмотилиум|рехидрат|regidron|регидрон|\\bорс\\b|сена\\b(?=.*(?:лист|таблет|чай))|ленено семе(?=.*(?:запек|храносм))",
    { not: "за баня|душ|за лице|маска|паста за зъби|сапун|шампоан|\\bчетка|кърп" },
  ),
  R(
    "zdrave",
    "san-i-stres",
    "\\bсън\\b|\\bсъня\\b|за сън|заспиване|\\bsleep|безсъни|insomnia|мелатонин|melatonin|\\bстрес|\\bstress|тревожн|безпокойств|anxiety|нервна система|нервната система|\\bнерви\\b|нервно напрежение|успокоит|relax|релакс|валериана|valerian|маточина|lemon balm|пасифлора|passiflora|\\b5-htp\\b|\\bgaba\\b|л-теанин|l-theanine|theanine|настроение|\\bmood\\b|серотонин|serotonin|\\bкортизол|cortisol|\\bпаническ|раздразнителност|\\bсафран(?=.*(?:настроение|капс))|\\bнервен\\b",
    { not: `${NUTRIENT}|за коса|паста|за лице|\\bface\\b|\\bmask\\b|маска|\\blift\\b|грим` },
  ),
  R(
    "zdrave",
    "imunitet",
    "имун|immun|ехинацея|echinacea|elderberry|черен бъз|\\bбъз\\b|самбукол|sambucol|бета[- ]?глюкан|beta[- ]?glucan|колострум|colostrum|прополис|propolis|пчелно млечице|royal jelly|защитните сили|\\bimmuno|\\bимуно|\\bviru?s\\b|противовирус|\\bантивирус",
    { not: NUTRIENT },
  ),
  R(
    "zdrave",
    "usta-i-garlo",
    "херпес|herpes|\\bафти|\\bафта\\b|стоматит|гингивит|пародонт(?!ax)|венци(?=.*(?:гел|спрей|разтвор|капки|възпал))|сухота в устата|сухата уста|лош дъх|\\bзъбобол|toothache|\\bфиксиращ\\p{L}* (?:крем|паста|гел)(?=.*протез)|протез\\p{L}*(?=.*(?:фиксир|почиств|таблет))|\\bcorega\\b|корега|\\bprotefix\\b|\\bzovirax|зовиракс|\\bацикловир|aciclovir|acyclovir",
  ),
  R(
    "zdrave",
    "kozhni-problemi",
    "екзема|eczema|псориа|psoria|атопич(?=.*(?:дерматит|екзема|лечение|мехлем))|дерматит|dermatit|белези|\\bscars?\\b|брадавиц|\\bwarts?\\b|мазол|\\bcorns?\\b|кокоши трън|гъбични|гъбички|fungal|микоз|онихомикоз|\\bлишей|изгаряни|\\bburns?\\b|\\bрани\\b|\\bраната\\b|\\bрана\\b|\\bwound|пантенол|panthenol|бепантен|bepanthen|цинков\\p{L}* (?:паста|мехлем|крем)|ухапвания|ухапване|насекоми(?=.*(?:след|ухапв|сърбеж))|сърбеж|\\bitch|себорe|себоре|розацея|rosacea|витилиго|обриви|обрив\\b|подсичане(?!.*(?:бебе|бебешк))|\\bакне\\b(?=.*(?:лечение|гел|разтвор|таблет|капс))|\\bherpes\\b|\\bдермазин|\\bfucidin|фуцидин|\\bbetadine маз|\\bкалцинирана|\\bциндол|циндол|cicaplast(?=.*(?:рани|белези))|\\bdermatix|\\bcontractubex|контрактубекс|\\bmederma",
  ),
  R(
    "zdrave",
    "sartse-i-kravoobrashtenie",
    "\\bсърд|\\bсърце|\\bheart\\b|\\bcardio|кардио|кръвно налягане|кръвното налягане|артериално налягане|хипертон(?!ичен разтвор)|холестерол|cholesterol|кръвообращ|circulation|триглицерид|\\bглог\\b|hawthorn|омега(?=.*(?:сърд|сърце))|сърдечно-съдов|\\bкръвоносни съдове|\\bсъдове(?=.*(?:здрав|еластич))|\\bнаттокиназа|nattokinase|\\bчервен ориз|red yeast rice|\\bмонаколин",
    { not: `${NUTRIENT}|устни|\\blips?\\b|грим|heart revolution|рожден|книжка|часовник|гривна|\\bwatch\\b` },
  ),
  R(
    "zdrave",
    "hemoroidi-i-veni",
    "хемороид|hemorrhoid|haemorrhoid|анални|аналн\\p{L}* фисур|\\bвени\\b|\\bвените\\b|венозн|\\bveins?\\b|разширени вени|варикоз|капиляр|тежки крака|уморени крака|подути крака|диосмин|diosmin|детралекс|detralex|хесперидин|троксерутин|венорутон|конски кестен|horse chestnut|\\bruscus\\b|leg vein|флебо|phlebo|\\bproctoglyvenol|проктогливенол|\\bneofitoroid|\\bпроктен|\\bprocten|\\bаескулус|aesculus",
  ),
  R(
    "zdrave",
    "stavi-i-kosti",
    "\\bстави\\b|\\bставите\\b|\\barthro|\\bартро|\\bставн|\\bjoints?\\b|хрущял|cartilage|глюкозамин|glucosamine|хондроитин|chondroitin|\\bmsm\\b|\\bмсм\\b|колаген тип ii|колаген тип 2|type ii collagen|uc-ii|\\bкости\\b|\\bкостите\\b|\\bbones?\\b|остеопороз|osteopor|артрит|arthrit|артроз|сухожил|tendon|boswellia|босвелия|опорно-двигателн|мускулно-скелетн|хидраплениш|\\bartrolife|\\bartroflex|\\bсинарт|\\bартрофит|\\bkollagen|\\bмускули и стави",
    { not: NUTRIENT },
  ),
  R(
    "zdrave",
    "cheren-drob",
    "черен дроб|черния дроб|черният дроб|\\bliver|хепат|hepat|силимарин|silymarin|бял трън|milk thistle|\\bдетокс|\\bdetox|жлъчк|жлъчн|\\bартишок|artichoke|есенциале|essentiale|\\bкарсил|carsil|\\bхепатофалк|\\bлегалон|legalon|\\bорнитин",
  ),
  R(
    "zdrave",
    "pikochen-trakt",
    "пикоч|уринар|\\burinary|цистит|cystitis|\\bбъбре|\\bkidney|червена боровинка|\\bcranberr|d-?маноза|d-?mannose|\\bманоза|\\buro-?(?:vit|fit|ton|sept|care)|\\bуро-?(?:вит|фит|тон|септ)|\\bуринал|\\bfuragin|\\bфурагин|\\bуролесан|\\bканефрон|canephron|пикочния мехур|пикочен мехур|\\bмехур\\b",
  ),
  R(
    "zdrave",
    "ochi",
    "\\bочи\\b|\\bочите\\b|\\beyes?\\b|капки за очи|eye drops|изкуствени сълзи|\\bсълзи\\b|зрение|\\bvision|лутеин|lutein|зеаксантин|zeaxanthin|bilberry(?=.*(?:зрение|vision|eye))|боровинк\\p{L}*(?=.*зрение)|контактни лещи|разтвор за лещи|\\bлещи\\b|\\bочен\\b|\\bочна\\b|клепач|блефарит|конюнктивит|\\bхордеол|ечемик на окото|\\bhylo|\\bхило-|\\bsystane|\\bвизин|\\bvisine|\\bартелак|\\bartelac|\\boptive|\\bопти(?:в|кс)|\\bthealoz|\\bблефаст|\\bblephasteam|\\bocuvite|окувит|\\bpreservision",
    { not: "сенки за очи|очна линия|молив за очи|грим|спирала|околоочен|околоочна|крем за очи|eye ?cream|eye ?contour|serum|серум|маска за очи(?!.*(?:затопл|гел|лечеб))|патчове|пачове|очила за плуване|слънчеви очила|торбички|бръчки|тъмни кръгове|подпухнал|топер|брокат|глитер|glitter|мултивитамин|multivit|от а до я|тетрадк" },
  ),
  R("zdrave", "ushi", "\\bуши\\b|\\bушите\\b|\\bушна\\b|\\bушни\\b|\\bушен\\b|\\bears?\\b|ушна кал|ear ?wax|\\bотит|\\botitis|\\bauris|\\bauricularum|\\botinum|отинум|\\bremo-?wax|\\bcerumen|церумен|\\bушен спрей|спрей за уши", { not: "тапи за уши|клечки за уши|обеци|слушалк" }),
  R(
    "zdrave",
    "pamet",
    "\\bпамет|\\bmemory\\b|концентрац|\\bfocus\\b|когнитив|cognitive|\\bмозък|\\bмозъчн|\\bbrain|гинко|ginkgo|бакопа|bacopa|lion'?s mane|лъвска грива|ноотроп|nootrop|фосфатидилсерин|phosphatidylserine|\\bцитиколин|citicoline|\\balpha ?gpc|\\bвинпоцетин|vinpocetine|\\bбилобил|bilobil|\\bгинкофар|ginkofar|\\bпирацетам|умствена (?:дейност|умора|работоспособност)",
    { not: `${NUTRIENT}|протеин|protein` },
  ),
  R("zdrave", "diabet", "диабет|diabet|кръвна(?:та)? захар|blood sugar|нива(?:та)? на (?:кръвната )?захар|глюкоза в кръвта|инсулин|insulin|\\bgymnema|гимнема|гимнема|\\bканела(?=.*(?:захар|глюкоз))|хром(?=.*(?:захар|глюкоз|апетит))|глюкозен (?:метаболизъм|баланс)|метаболизма на глюкоза"),
  R("zdrave", "shtitovidna-zhleza", "щитовидн|thyroid|\\bйод\\b(?!.*(?:разтвор|тинктура))|\\biodine\\b|\\bkelp\\b|\\bкелп\\b|калиев йодид|\\bтирео|\\bthyreo"),
  R(
    "zdrave",
    "zhensko-zdrave",
    "менопауз|menopaus|климакс|менструа|menstru|\\bпмс\\b|\\bpms\\b|бременн|pregnan|фертилитет|fertility|зачеване|кърмещи|за жени(?=.*(?:добавк|капс|таблет|мултивит|витамин))|women'?s (?:health|multi|one|vitamin)|\\bfor women\\b(?=.*(?:caps|tablets|vitamin|мg|mg))|вагинал|vaginal|\\bвагина|интимна флора|интимн\\p{L}* (?:здраве|инфекц|сухота|дискомфорт)|кандид|candid|мио-?инозитол|myo-?inositol|\\bинозитол|\\binositol|фолиева киселина(?=.*(?:бремен|зачев))|\\bженско здраве|\\bженски хормон|хормонален баланс(?=.*(?:жени|женск))|поликистоз|\\bпкос\\b|\\bpcos\\b|\\bмастопат|\\bгърди(?=.*(?:болезнен|чувствителн))|\\bобилна менструация|\\bвагизан|vagisan|\\bгинеко|гинекол|\\bovaril|\\bfemibion|фемибион|\\bpregnacare|прегнакеър|\\belevit|\\bелевит|\\bfematon|вечерна иглика(?=.*(?:капс|жени))|\\bevening primrose",
    { not: "дамски превръзки|тампони|ежедневни превръзки|тест за" },
  ),
  R(
    "zdrave",
    "mazhko-zdrave",
    "простат|prostat|потентност|\\bпотенция|erectile|\\bмъжко здраве|мъжка сила|мъжка плодовитост|сперм|sperm|тестостерон|testosterone|\\bлибидо\\b(?=.*(?:мъже|мъжк|men|капс|таблет))|\\bmen'?s (?:health|multi|one|vitamin)|\\bfor men\\b(?=.*(?:caps|tablets|vitamin|mg))|за мъже(?=.*(?:добавк|капс|таблет|мултивит|витамин))|\\bсереноа|saw palmetto|\\bпросталамин|\\bпростатилен|\\bandrogen|\\bмака\\b(?=.*(?:мъже|либидо))",
  ),
  R(
    "zdrave",
    "otslabvane",
    "отслабв|\\bslim|weight loss|загуба на тегло|контрол на (?:теглото|апетита)|намаляване на (?:теглото|апетита)|\\bапетит|appetite|глюкоманан|glucomannan|хитозан|chitosan|\\bредукция на тегло|изгаряне на калории|блокер на (?:въглехидрати|мазнини)|carb blocker|fat binder|\\bзелено кафе|green coffee|\\bгарциния|garcinia|\\bсветрофит|\\bxls\\b|\\bxl-s\\b|\\bорлистат",
    { not: "крем|гел за тяло|масло за тяло|целулит|стрии|протеин|protein|whey" },
  ),

  R(
    "zdrave",
    "bolka",
    "болк|болезнен|болкоуспок|обезболява|главобол|мигрена|migraine|\\bpain\\b|мускулна треска|крампи|\\bспазм|схващан|ибупрофен|ibuprofen|нурофен|nurofen|парацетамол|paracetamol|аналгин|analgin|аспирин|aspirin|ацетизал|диклофенак|diclofenac|волтарен|voltaren|кетопрофен|ketoprofen|напроксен|naproxen|ментол и камфор|затоплящ\\p{L}* (?:гел|крем|балсам)|загряващ\\p{L}* (?:гел|крем|балсам)|охлаждащ\\p{L}* (?:гел|спрей)(?=.*(?:мускул|стави|контуз))|контузи|навяхван|синини|натъртван|\\bхепарин\\b(?=.*(?:гел|крем))|хепатромбин|\\blioton|лиотон|тигров балсам|tiger balm|\\bарника|arnica|\\bбадяга",
    { not: "тест за" },
  ),

  // ── Sports nutrition ──
  R(
    "dobavki-i-sport",
    "sportni-hrani",
    "протеинов\\p{L}* (?:бар|вафл|крем|чипс|палачинк|бисквит|кекс|брауни|пудинг|шоколад|мюсли|гранол|паста|снакс|десерт|напитк)|protein (?:bar|wafer|pancake|cookie|chips|spread|cream|crisp|brownie|pudding|snack|chocolate|muffin|ice cream|shake\\b)|\\bbars?\\b(?=.*(?:protein|протеин|energy|енерг))|\\bбаров\\p{L}*(?=.*(?:протеин|енерг))|енергийн\\p{L}* (?:бар|гел|желе|дъвк)|energy (?:gel|bar|chew)|изотонич|isotonic|\\bелектролит|\\belectrolyte|\\bendurosnack|\\bpancakes?\\b|овесен\\p{L}* (?:каша|ядки)(?=.*(?:protein|протеин))|\\bоризов\\p{L}* (?:каша|крем)(?=.*(?:protein|протеин|cream of rice))|cream of rice|\\bzero (?:syrup|sauce)|\\bfit sauce|\\bнискокалоричен сос|\\bmaple syrup zero|\\bpeanut butter(?=.*(?:protein|fit))|\\bфъстъчено масло(?=.*(?:протеин|fit))",
    { from: rx("health|supplement|аптека|dietary|sports|food|^other$|^$") },
  ),
  R("dobavki-i-sport", "gaineri", "\\bgainer|гейнър|\\b(?:serious|hyper|profi|mega|true|super|anabolic|game changer|monster|real|pro) mass\\b|\\bmass gain|\\bmagnum 8000\\b|\\bmass (?:xxl|tech|builder|maker)\\b|\\bmass\\b(?=.*\\d+\\s?(?:g|г|гр|kg|кг|lbs)\\b)|за покачване на тегло|качване на (?:маса|тегло)"),
  R(
    "dobavki-i-sport",
    "kreatin",
    "креатин|creatine|kre-?alkalyn|креалкалин",
    { from: rx("health|supplement|аптека|dietary|sports|^other$|^$") },
  ),
  R(
    "dobavki-i-sport",
    "predtrenirovachni",
    "pre[- ]?workout|предтренировъч|азотен бустер|nitric oxide|\\bno booster|\\bpump\\b(?=.*(?:\\d+\\s?(?:g|г|гр|caps)|powder|прах|дози))|\\babe\\b(?=.*(?:applied|energy|performance))|\\bc4\\b(?=.*(?:energy|original|ultimate))|\\bnox\\b|стимулант",
  ),
  R(
    "dobavki-i-sport",
    "aminokiselini",
    "\\bbcaas?\\b|\\beaas?\\b|\\bеаа\\b|глутамин|glutamine|аргинин|arginine|цитрулин|citrulline|аминокиселин|amino acids?|\\bamino\\b|бета-?аланин|beta-?alanine|таурин|taurine|\\bhmb\\b|\\bлизин|lysine|\\bглицин|glycine|\\bтирозин|tyrosine|\\bорнитин|ornithine|\\bметионин|\\bлевцин|leucine|\\bl-[a-zа-я]+\\b(?=.*(?:\\d+\\s?(?:g|г|гр|caps|капс|таблет|mg|мг)))",
    { not: "l-?carnitine|л-?карнитин|карнитин" },
  ),
  R(
    "dobavki-i-sport",
    "izgaryane-na-mazchnini",
    "fat ?burner|фет ?бърнър|изгаряне на мазнини|изгаряне на мастн|термоген|thermogen|\\bthermo\\b|l-?carnitine|л-?карнитин|карнитин|carnitine|\\bcla\\b|\\bкла\\b|конюгирана линолова|\\blipo\\b|\\blipo-|\\bcutting|\\bshred|\\bketo(?:ne)?s?\\b(?=.*(?:caps|капс|salts|соли))|\\bкетони\\b|\\byohimbin|йохимбин|\\bsynephrine|синефрин|\\bcaffeine\\b(?=.*(?:caps|tablets|таблет|капс))|кофеин(?=.*(?:таблет|капс))|\\bтонален cla|\\btonalin",
  ),
  R(
    "dobavki-i-sport",
    "proteini",
    "протеин|protein|\\bwhey\\b|суроватъчен|казеин|casein|\\bизолат|\\bisolate|хидролизат(?=.*(?:протеин|beef|говежд))|beef-?xp|растителен протеин|\\bвеган протеин|vegan protein|\\bсоев протеин|\\bграхов протеин|pea protein|\\bконопен протеин|hemp protein|\\bmass\\b(?=.*(?:\\d+\\s?(?:g|kg|кг)))",
    { not: "колаген|collagen|протеинови? (?:шампоан|маска|балсам|крем за|серум)|за коса|hair|\\bкрем за|cream for" },
  ),

  // ── Food supplements by nutrient ──
  R("dobavki-i-sport", "kolagen", "колаген|collagen|биотин|biotin|кератин(?=.*(?:капс|таблет|добавк))|коса,? кожа и нокти|коса и кожа|кожа и коса|кожа,? коса и нокти|коса и нокти|hair,? skin (?:and|&) nails|skin,? hair (?:and|&) nails|\\bхиалуронова киселина\\b(?=.*(?:капс|таблет|caps|tablets|\\bmg\\b|\\bмг\\b))|hyaluronic acid(?=.*(?:caps|tablets|\\bmg\\b))|\\bпантовигар|\\bperfectil|перфектил|\\bвитабиотикс", { not: "крем|серум|serum|маска|шампоан|балсам|лосион|гел за|мляко за тяло|\\bspf\\b" }),
  R("dobavki-i-sport", "omega", "омега|omega|рибено масло|рибеното масло|fish oil|\\bkrill|\\bкрил\\b|\\bdha\\b|\\bepa\\b|черен дроб от треска|cod liver|масло от черен дроб|\\bленено масло(?=.*(?:капс|softgel|caps))|\\bflaxseed oil|\\bвечерна иглика|evening primrose|\\bпорест|\\bborage oil|\\bмасло от пореч", { not: "крем|серум|serum|шампоан|балсам|лосион|за тяло|за лице|за коса" }),
  R(
    "dobavki-i-sport",
    "multivitamini",
    "мултивитамин|multivitamin|multi-?vitamin|\\bmulti\\b(?=.*(?:caps|tablets|капс|таблет|vitamin|витамин))|\\ba-?z\\b(?=.*(?:komplett|depot|витамин|vitamin|таблет|tablets))|\\ba - z\\b|витамини и минерали|vitamins? (?:&|and) minerals|\\bcentrum\\b|\\bцентрум\\b|\\bsupradyn|супрадин|\\bpharmaton|фарматон|\\bvitaday|\\bvigantol|\\bвитамини за (?:жени|мъже|възрастни)|\\bdaily (?:one|vitamins?)\\b|\\bone a day|\\bopti-?men|\\bopti-?women|\\banimal pak|\\bvita[- ]?min multiple|\\bмулти (?:витамин|комплекс)|витаминно-минерален|витаминен комплекс|\\bкомплекс от витамини",
  ),
  R(
    "dobavki-i-sport",
    "vitamini",
    "витамин|vitamin|\\bвит\\.?\\s?[abcdekавсдек]\\d*\\b|b-?complex|б-?комплекс|в-?комплекс|\\bb12\\b|\\bв12\\b|\\bb6\\b|\\bв6\\b|\\bd3\\b|\\bд3\\b|\\bk2\\b|\\bк2\\b|фолиева|folic acid|folate|фолат|ниацин|niacin|тиамин|thiamin|рибофлавин|riboflavin|кобаламин|cobalamin|метилкобаламин|аскорбин|ascorb|бета-?каротин|beta-?carotene|\\bретинол\\b(?=.*(?:капс|caps|softgel))|токоферол|tocopherol|\\bпантотенова|pantothenic|\\bбенфотиамин|benfotiamine|\\bp-?5-?p\\b|\\bмилгама|milgamma",
    { not: "крем|серум|serum|маска|шампоан|балсам за|лосион|гел за лице|гел за тяло|тоник|мляко за|душ|сапун|\\bspf\\b|ампули за лице|за лице|за коса|за кожата(?!.*(?:капс|таблет))" },
  ),
  R(
    "dobavki-i-sport",
    "minerali",
    "магнези|magnesium|\\bцинк\\b|\\bzinc\\b|желязо|\\biron\\b|ferrous|ферум|калций|calcium|\\bселен\\b|selenium|\\bкалий\\b|potassium|\\bхром\\b|chromium|\\bманган|manganese|\\bбор\\b(?=.*(?:капс|таблет|mg|мг))|\\bboron\\b|силиций|\\bsilica\\b|\\bsilicon\\b(?!e)|\\bминерал(?!на вода)|\\bmineral(?! water)|бикарбонат|bicarbonate|\\bмед\\b(?=.*(?:\\bmg\\b|\\bмг\\b|таблет|капс))|\\bcopper\\b(?=.*(?:\\bmg\\b|\\bмг\\b|caps|tablets|таблет|капс))|молибден|molybdenum|\\bлитий|\\bшуслерова сол|\\bелектролит",
    { not: "крем|серум|serum|маска|шампоан|балсам за|лосион|гел за лице|гел за тяло|тоник|мляко за|душ|сапун|\\bspf\\b|за лице|за коса|соли за вана|масло за тяло" },
  ),
  R(
    "dobavki-i-sport",
    "antioksidanti",
    "\\bq10\\b|\\bq-10\\b|\\bco-?q-?10\\b|коензим|coenzyme|убихинол|ubiquinol|ресвератрол|resveratrol|кверцетин|quercetin|антиоксидант|antioxidant|алфа-?липоева|alpha-?lipoic|глутатион|glutathione|\\bnac\\b|n-?ацетил|n-?acetyl|астаксантин|astaxanthin|\\bpqq\\b|\\bnad\\+|\\bnmn\\b|спермидин|spermidine|ликопен|lycopene|\\bopc\\b|гроздови семки|grape seed|пикногенол|pycnogenol|\\bсулфорафан|sulforaphane|\\bфизетин|fisetin|\\bberry mitoactive|\\bматча(?=.*(?:капс|caps))|anti-?aging(?=.*(?:caps|капс|таблет))|\\bпротив стареене(?=.*(?:капс|таблет))",
    { not: "крем|серум|serum|маска|шампоан|балсам за|лосион|гел за лице|гел за тяло|тоник|мляко за|душ|сапун|\\bspf\\b|за лице|за коса|околоочен" },
  ),

  // ── Hygiene left out by the cosmetics rules ──
  R(
    "higiena",
    "higienni-konsumativi",
    "носни кърп|кутия кърпички|\\bвата\\b|памучни (?:тампони|дискове|клечки)|клечки за уши|дезинфектант за ръце|антибактериален гел|антисептичен гел|гел за ръце(?=.*(?:антибакт|дезинф|алкохол))|дезинфекциращи кърпи|антибактериални кърпи|мокри кърпи(?!.*(?:бебе|baby|детск))",
    { from: rx("feminine|personal care|cleaning|household|health|medical|^other$|^$|cosmetic|skin") },
  ),
  R(
    "higiena",
    "damska-higiena",
    "дамски превръзки|ежедневни превръзки|\\bпревръзки\\b(?=.*(?:always|libresse|bella|naturella|everyday|ultra|нощни|дневни|normal|super|maxi))|\\bтампони\\b(?!.*(?:стерилен|епруветка|памучни))|менструалн\\p{L}* (?:чашка|чаша|бельо|гащи)|\\bmenstrual cup|\\bменструална",
    { from: rx("feminine|personal care|health|^other$|^$|cosmetic|skin|medical") },
  ),

  // ── Bio and natural ──
  R(
    "dobavki-i-sport",
    "bilki",
    "\\bбилк|\\bherb|екстракт|extract|куркума|curcumin|turmeric|ашваганда|ashwagandha|женшен|ginseng|\\bмака\\b|\\bmaca\\b|трибулус|tribulus|спирулина|spirulina|хлорела|chlorella|джинджифил|ginger|\\bканела\\b(?=.*(?:капс|caps|экстр|таблет))|\\bчесън|\\bgarlic|black seed|черен кимион|черно кимион|nigella|родиола|rhodiola|моринга|moringa|шилажит|shilajit|\\bмумийо|\\bчага\\b|\\bchaga\\b|рейши|reishi|\\bгъби\\b(?=.*(?:капс|caps|екстракт|extract|прах))|\\bmushroom|кордицепс|cordyceps|\\bмайтаке|maitake|\\bшийтаке(?=.*(?:капс|caps|екстракт))|берберин|berberine|\\bневен(?=.*(?:капс|тинкт))|\\bбял равнец|\\bжълт кантарион|st\\.? john'?s wort|\\bбрахми|\\bгуарана|guarana|\\bарония|aronia|\\bшипк|rose hip|\\bгодж|\\bgoji|\\bячемичена трева|barley grass|\\bпшенична трева|wheatgrass|\\bаюрвед|ayurved|\\bтрифала|triphala|\\bнийм\\b|\\bneem\\b|\\bсмирна|\\bmyrrh|\\bдевисил|\\bлапад|oregano oil|масло от риган|\\bмаслинови листа|olive leaf|\\bкотешки нокът|cat'?s claw|\\bастрагал|astragalus|\\bгинко\\b|\\bготу кола|gotu kola|\\bсладък корен|licorice|\\bбиле|\\bтинктура|tincture|\\bблатно кокиче|\\bбабини зъби|\\bсамобайка|\\bбрезови|\\bбреза\\b(?=.*(?:сок|листа))|\\balpenkraft|\\bсалус\\b|\\bsalus\\b(?=.*(?:тоник|tonikum|floradix))|\\bfloradix|\\bхерба|\\bherbamedica",
    {
      not: "крем|серум|serum|маска|шампоан|балсам за|лосион|гел за лице|гел за тяло|тоник за|мляко за|душ|сапун|\\bspf\\b|за лице|за коса|за тяло|паста за зъби|вода за уста|дезодорант|чай\\b|\\btea\\b|бонбони|ароматизатор|свещ|пюре|подправк|\\bсос\\b|олио за|масло за (?:тяло|коса|лице|масаж)",
      from: rx("health|supplement|аптека|dietary|sports|food|^other$|^$|medical|personal care"),
    },
  ),
  R(
    "bio",
    "superhrani",
    "суперхран|superfood|\\bсемена\\b|\\bсеме\\b|\\bчиа\\b|\\bchia\\b|киноа|quinoa|\\bелда\\b|\\bамарант|\\bядки\\b|\\bбадеми\\b|\\bкашу\\b|\\bорехи\\b|\\bфурми\\b|\\bсушени (?:плодове|боровинки|череши|сливи|кайсии|смокини)|\\bгоджи|\\bgoji\\b|\\bмед\\b(?=.*(?:\\d+\\s?(?:г|гр|g)\\b|буркан|пчел))|\\bпчелен|\\bпрашец|\\bтахан|кокосово масло|ленено масло|масло от (?:черен кимион|тиквено семе|конопено семе|чиа)|\\bмюсли|\\bгранола|\\bовесени ядки|\\bстевия|stevia|\\bеритритол|erythritol|\\bксилитол|xylitol|\\bподсладител|\\bкакао на прах|\\bсурово какао|какаови зърна|кокосова захар|ябълков оцет|apple cider vinegar|\\bморинга|\\bспирулина|\\bхлорела|\\bмака на прах|\\bматча на прах|\\bбаобаб|\\bасаи\\b|\\bacai\\b|\\bкероб|\\bрожков|\\bпсилиум|\\bленено семе|\\bсусам|\\bконопен (?:протеин|семена)|хранителна мая|\\bбрашно\\b(?=.*(?:без глутен|gluten|бадем|кокос|елда|овес|нахут|био|bio))",
    {
      not: "йогурт|кисело мляко|тофу|сирен|кашкавал|\\bмесо|\\bриба|сардин|херинг|скумри|вурст|колбас|бургер|кренвирш|\\bпиле|\\bгъби\\b|зеленчуц|цвекло|домат|картоф|\\bябълки\\b|банан|\\bлимони\\b|вермут|ракия|\\bвино|\\bбира|алкохол|\\d+\\s?% ?(?:vol|об)|ликьор|\\bджин\\b|уиски|водка|\\bсладко\\b|конфитюр|\\bсос\\b|чипс|бонбон|шоколад(?!.*(?:био|bio|без захар|суров))|бисквит(?!.*(?:био|bio|без захар|без глутен))|вафл(?!.*(?:био|bio|без захар))|кафе\\b|филе|херинга|\\bриба|\\bмесо|\\bколбас|\\bсирен|\\bкашкавал|\\bкисело мляко|\\bнапитк(?!.*(?:био|bio))|\\bсок\\b(?!.*(?:био|bio))|бира|вино|котка|куче|играчк|покълване|за разсад|семена за (?:сеитба|засаждане|градина|цветя)|\\bкрем\\b|шампоан|душ гел|сапун|лосион|\\bгрим|серум|паста за зъби|дезодорант|за коса|за лице|за тяло|пелени|кърпи|протеин|protein|whey|креатин",
      from: FOOD_SOURCE,
    },
  ),

  // ── Household ──
  R("dom-i-ofis", "nasekomi", "\\bкомар|mosquito|репелент|repell?ent|\\bмравк|хлебарк|\\bмолец|\\bмолци|против гризачи|срещу гризачи|капан за (?:гризачи|мишки|плъхове|насекоми)|\\bмухи\\b|\\bмуха\\b|инсектицид|insecticid|фумигатор|\\braid\\b|\\bautan\\b|\\boff!|против кърлежи|срещу кърлежи|\\bvape\\b|\\bbros\\b(?=.*(?:против|срещу|спрей|капан))|\\bzanza\\b|против насекоми|срещу насекоми"),
  R("dom-i-ofis", "aromatizatori", "ароматизатор|освежител|\\bсвещ|\\bcandle|дифузер|diffuser|ароматни пръчици|ароматни пръчки|air ?wick|\\bglade\\b|ambi ?pur|ароматно саше|ароматна торбичка|благовони|\\bтамян|ароматна лампа|ароматерапевтична лампа", {
    not: "за коса|за тяло|за лице|за дрехи(?!.*(?:саше|торбич))|етерично масло",
  }),
  R("dom-i-ofis", "prane", "\\bпране\\b|за пране|перилен|перилни|омекотител|кондиционер за (?:пране|дрехи|тъкани)|\\bariel\\b|\\bpersil\\b|\\blenor\\b|perwoll|\\bsilan\\b|\\bvanish\\b|\\bпетна\\b|петновадител|кърпички (?:за|против) (?:цвят|оцветяване)|колор кърпички|\\bдреха\\b|\\bтоплинни капсули|\\bсапун за пране|\\bдуди\\b|\\bteo\\b(?=.*(?:прах|гел|пране))|\\bbonux|\\bdixan|\\bsurf\\b|\\bwoolite|\\bворсичк|\\bкалгон|\\bcalgon", {
    not: "\\bкрем\\b|душ гел|шампоан|за тяло|за ръце",
  }),
  R("dom-i-ofis", "sadove", "\\bсъдове\\b|съдомиял|dishwasher|\\bfairy\\b|\\bfinish\\b|\\bsomat\\b|\\bpril\\b|\\bpur\\b(?=.*(?:съдове|препарат))|гъба за съдове|гъби за съдове|\\bтелена гъба|\\bбрилянтин(?=.*съдомиял)|сол за съдомиял|\\bведро\\b(?=.*съдове)", { not: "\\bкрем\\b|за ръце" }),
  R(
    "dom-i-ofis",
    "pochistvane-na-doma",
    "почистващ\\p{L}* (?:препарат|спрей|гел|пяна|паста|прах|кърп\\p{L}*|таблетк\\p{L}*|течност)(?=.*(?:тоалетн|\\bwc\\b|баня|кухн|\\bпод\\b|стъкл|прозор|повърхн|фурн|котлон|плочк|фаянс|мебел|килим|\\bдом|уред|ютия|ютии|кафемашин|съдомиял|перал|канал|маратонк|обувк|котлен|универсал|\\bоцет|обезмасл))|почистване на (?:баня|кухня|под|стъкла|прозорци|повърхности|фурна|котлон|тоалетна|wc|мебели|килим|дом|плочки|фаянс|уреди)|препарат\\p{L}* за (?:баня|кухня|под|стъкла|прозорци|повърхности|тоалетна|wc|мебели|килими|котлон|фурна|отпушване|канали|плочки|вар|котлен камък)|\\bбелина|\\bwc\\b|тоалетн\\p{L}* (?:блок|гел|чиния|ароматизатор|препарат)|дезинфектант(?! за ръце)|дезинфектант за повърхности|\\bcif\\b|domestos|доместос|\\bajax\\b|\\bsavo\\b|mr\\.? ?proper|\\bduck\\b|\\bbref\\b|\\bharpic|\\bfrosch\\b|\\bsanytol|\\bзатлачване|отпушвач|\\bкотлен камък|\\bпрепарат\\b|\\bмоп\\b|\\bмопове|\\bпарцал|\\bбърсалк|кърп\\p{L}* за (?:почистване|прах|под|стъкла|кухня|бърсане)|микрофибърн\\p{L}* кърп|гъба (?:за баня|за почистване|магическа|меламинова)|меламинова гъба|четка за (?:wc|тоалетна|под|баня|почистване)|домакински ръкавици|ръкавици за (?:почистване|домакинство|миене)|\\bметла\\b|\\bлопатк\\p{L}* за смет|\\b(?:sano|medix|astonish|cif|domestos|ajax|savo|bref|harpic|sanytol|frosch|biolu|tri-bio|cillit bang|vanish|mr\\.? ?proper)\\b(?=.*(?:препарат|спрей|гел|пяна|почист|дезинф|wc|тоалетн|баня|кухн|под|стъкл|универсал))",
    { from: HOUSEHOLD_SOURCE, not: "\\bкрем\\b|душ гел|шампоан|за лице|за тяло|за ръце(?!.*(?:ръкавици))|грим|паста за зъби|протези|интимн|седалка|гъба за баня" },
  ),
  R(
    "dom-i-ofis",
    "hartia",
    "тоалетна хартия|кухненск\\p{L}* (?:ролк|хартия)|\\bсалфетк|торби(?:чки)? за (?:смет|боклук|кошче|отпадъци)|чували за (?:смет|боклук)|алуминиево фолио|прозрачно фолио|фолио за (?:храна|печене)|хартия за печене|хартиени (?:кърпи|кърпички|чаши|чинии|ролки)|\\bzewa\\b|еднократни (?:чаши|чинии|прибори)|кутии за храна(?=.*(?:еднократн|хартиен))|\\bплик\\p{L}* за (?:сандвичи|замразяване)|\\bклечки за (?:зъби|шашлик)\\b",
    { from: HOUSEHOLD_SOURCE },
  ),
  R(
    "dom-i-ofis",
    "kantselariya",
    "химикалк|химикал\\b|\\bписалк|\\bролер\\b|\\bгел химикал|\\bавтоматичен молив|графитен молив|\\bмолив hb|\\bмоливи\\b(?!.*(?:за очи|за устни|за вежди))|\\bмолив\\b(?!.*(?:за очи|за устни|за вежди|грим))|тетрадк|\\bпапк|класьор|джоб(?:ове)? за документи|копирна хартия|хартия (?:за принтер|a4|а4|за копиране|за ксерокс)|\\ba4\\b(?=.*(?:хартия|листа|папка))|\\bтиксо|лепяща лента|\\bлепило\\b|сухо лепило|коригираща лента|коректор(?:на|ен)? лента|коректор писалка|\\bмаркер|текст ?маркер|\\bфлумастер|\\bножица(?! за (?:нокти|кожички))|\\bлиния\\b|\\bтриъгълник|\\bпергел|\\bгума\\b(?=.*(?:молив|изтриване))|\\bкламер|\\bтелбод|\\bперфоратор|бележник|\\bтефтер|\\bпланер|\\bкалендар|самозалепващи (?:листчета|бележки)|\\bpost-?it|\\bиндекси\\b|\\bетикети\\b|\\bскоби за телбод|\\bкалкулатор|\\bострилк|\\bпишещ|\\bмастило за (?:писалка|пълнител)|\\bпълнител(?:и)? за (?:химикал|писалка)|\\bподложка за (?:писане|бюро)|\\bорганайзер за бюро|\\bкутия за документи|\\bархивна кутия|\\bплик\\p{L}*(?!.* за (?:сандвичи|замразяване|кърма))|\\bпощенски плик",
    { from: STATIONERY_SOURCE, not: "направи си сам|творчески|комплект за рисуване|рисуван|оцветяв|пъзел|играчк|стикери за деца|гоблен|акварел|темпера|пластилин|\\bраница|ученическа чанта|несесер|\\bкутия за храна|бутилка|термос|\\bфигур|\\blego|\\bmarvel|\\bdisney|\\bbarbie|frozen|spider|harry potter|minecraft|pokemon|\\bsonic\\b|paw patrol" },
  ),

  // ── Unspecific supplements, last ──
  R("dobavki-i-sport", "drugi-dobavki", DOSE_FORM, {
    from: SUPPLEMENT_SOURCE,
    not: "крем|серум|serum|маска за|шампоан|балсам за|лосион|гел за лице|гел за тяло|тоник за|мляко за тяло|душ|сапун|\\bspf\\b|за лице|за коса|паста за зъби|вода за уста|дезодорант|бутилка|шейкър|shaker|колан|ръкавици|постелка|ластик|накитници|въже|\\bтопка|дъмбел|гира|\\bмат\\b|\\bmat\\b|\\bbelt\\b|gloves|\\bstraps\\b|\\bbag\\b|сак\\b|торба",
  }),
];

/** Electronics and gadgets. Medical devices with an app or Bluetooth stay (MEDICAL_DEVICE). */
const ELECTRONICS = rx(
  "\\bwi-?fi\\b|bluetooth|\\b4k\\b|ultra hd|\\buhd\\b|\\bqled|\\bdled|\\boled|\\bhdr\\b|\\bsmart tv|\\bandroid\\b|\\bios\\b|карта памет|\\bsdxc|\\bsdhc|\\bmicro ?sd|\\d+\\s?(?:gb|tb)\\b|\\bapple watch|\\bкаишка|\\bремък за часовник|\\bhomepod|\\bairpods|\\bmacbook|\\bmac\\b|темперирано стъкло|tempered glass|защитно (?:стъкло|покритие)|\\bдисплей|\\bекран(?:а|ът)?\\b|\\bрадио|тонколон|\\bуред за пържене|фритюрник|air ?fryer|\\bfry\\b|\\bdvb|\\bhdmi|\\bvideo kit|\\bnvr\\b|\\bdvr\\b|камера за (?:наблюдение|видеонаблюдение)|\\bрутер|\\brouter|\\bсуич|\\bswitch\\b|\\bпроектор|\\bконзола|\\bгейминг|\\bgaming|apple pencil|pencil grip|\\bstylus|стилус|\\bradio\\b|\\bclock\\b|\\bairtag|tumble dryer|washer-?dryer|washing machine|перална машина|сушилня за дрехи|recirculation kit|\\bгривна\\b(?=.*(?:фитнес|смарт|smart|сърдечн))|фитнес гривна|смарт гривна",
);
const MEDICAL_DEVICE = rx("апарат за (?:измерване на )?кръвно|кръвно налягане|термометър|thermometer|инхалатор|пулсоксиметър|оксиметър|глюкомер|кантар|везна|\\bscale\\b|бебефон|baby monitor");
/** Export categories of appliances: only medical and baby devices and a few household goods are taken from them. */
const APPLIANCE_SOURCE = rx("home appliances|малки електроуреди|kitchen appliances");
const APPLIANCE_PLACES = new Set(["aparati", "ustroystva", "karmene", "hranene", "nasekomi", "aromatizatori", "ortopedichni"]);

/** Row-level check for the pharmacy rules: the row's source may hold such goods and nothing rules it out. */
export function selectHealthRow(r: CsvRow, text: string): "prescription" | "not-pharmacy" | null {
  const source = (r.Category ?? "").trim();
  if (PRESCRIPTION_SOURCE.test(source) || RX_LIKE.test(text)) return "prescription";
  if (!SOURCE.test(source) || NOT_PHARMACY.test(text)) return "not-pharmacy";
  if (ELECTRONICS.test(text) && !MEDICAL_DEVICE.test(text)) return "not-pharmacy";
  return null;
}

/** The place of a non-cosmetic row (text: matchText of brand and name), or null when no rule fits. */
export function classifyHealth(text: string, source: string): Place | null {
  // School and office supplies only ever go to stationery; appliance listings only to devices.
  const stationery = STATIONERY_ONLY.test(source);
  const appliance = APPLIANCE_SOURCE.test(source);
  const beauty = BEAUTY.test(text) && !TAKEN.test(text);
  for (const rule of RULES) {
    if (stationery && rule.place.sub !== "kantselariya") continue;
    if (appliance && !APPLIANCE_PLACES.has(rule.place.sub)) continue;
    // Stationery has its own "спирала" (spiral notebooks) and "палитра" (pencil sets); household rules ask for a household
    // context themselves ("почистващ гел за тоалетна").
    if (beauty && rule.place.sub !== "vashki" && rule.place.category !== "dom-i-ofis") continue;
    if (rule.from && !rule.from.test(source)) continue;
    if (!rule.re.test(text)) continue;
    if (rule.not?.test(text)) continue;
    // Supplements that say they are organic belong with the bio products.
    if (rule.place.category === "dobavki-i-sport" && BIO.test(text) && !SPORT_SUBS.has(rule.place.sub)) return P("bio", "bio-dobavki");
    return rule.place;
  }
  return null;
}

const BIO = rx("\\bбио\\b|\\bbio\\b|\\borganic\\b|органичн|\\bбиологичн");

/**
 * Make-up, hair care and beauty accessories. The cosmetics rules decide about those; when they leave such a row out,
 * the pharmacy rules must not take it in ("Коректор за под очи" is not eye care, "Ластик за коса сърце" not heart health).
 */
const BEAUTY = rx(
  "\\bкоректор\\b(?! (?:за палец|за пръсти|на стойката|за стойка|на пръсти))|concealer|\\bпудра\\b(?! захар)|палитра|palette|сенки за очи|eyeshadow|\\bспирала\\b(?! за)|mascara|очна линия|eyeliner|молив за (?:очи|устни|вежди)|червило|lipstick|\\bгланц\\b|lip ?gloss|\\bруж\\b|\\bblush|хайлайт|highlighter|bronzer|бронзант|фон дьо тен|\\bfoundation\\b|праймър|\\bprimer\\b|база за (?:грим|лице|под очи|очи)|основа за грим|изсветлител|brightener|\\bгрим\\b|make-?up|ластик\\p{L}* за коса|scrunchie|\\bшнол|\\bфиби\\b|диадема|четка за коса|\\bгребен|лак за нокти|nail polish|гел лак|изкуствени мигли|\\bмигли\\b|боя за коса|hair colou?r|шампоан|балсам за коса|маска за коса|серум за коса|под очи|под очите|under ?eye|" +
    // skin care and toiletries
    "серум|\\bserum|\\bтоник|\\btoner|мицелар|почистващ\\p{L}* (?:гел|пяна|мляко)|поч\\.\\s?гел|маска за лице|sheet mask|крем за лице|дневен крем|нощен крем|околоочен|eye cream|face cream|лосион за тяло|душ гел|дезодорант|deodorant|антиперспирант|озаряващ|eye (?:styler|maker|shadow|liner|brow)|стик за очи|" +
    // make-up and beauty houses without pharmacy goods
    "\\b(?:artdeco|dermacol|rom&nd|nl beauty|gosh|essence|catrice|revolution|wibo|golden rose|rimmel|max factor|kiko|nyx|flormar|maybelline|bourjois|pupa|deborah|lovely|eveline|delia|l'oréal|loreal|garnier|farmona|medi-peel|velnea)\\b",
);
/** Supplement forms: a capsule "for hair" is a supplement, not hair care. */
const TAKEN = rx("капсул|таблет|сашет|\\bcaps\\b|capsules|tablets|softgels?|желирани|gummies|дражета|\\bmg\\b|\\bмг\\b|за пиене|добавк|supplement");
const SPORT_SUBS = new Set(["proteini", "aminokiselini", "kreatin", "predtrenirovachni", "gaineri", "izgaryane-na-mazchnini", "sportni-hrani"]);

// ── Cosmetics: the cosmetics shop's places in this shop's tree ──

const COSMETIC_MAP: Record<string, string> = {
  "grim/fon-dyo-ten": "kozmetika/grim-za-litse",
  "grim/bb-i-cc-kremove": "kozmetika/grim-za-litse",
  "grim/korektori": "kozmetika/grim-za-litse",
  "grim/pudri": "kozmetika/grim-za-litse",
  "grim/ruzh": "kozmetika/grim-za-litse",
  "grim/bronzanti-i-kontur": "kozmetika/grim-za-litse",
  "grim/haylaytari": "kozmetika/grim-za-litse",
  "grim/osnovi-i-fiksatori": "kozmetika/grim-za-litse",
  "grim/spirali": "kozmetika/grim-za-ochi",
  "grim/ochni-linii": "kozmetika/grim-za-ochi",
  "grim/molivi-za-ochi": "kozmetika/grim-za-ochi",
  "grim/senki-za-ochi": "kozmetika/grim-za-ochi",
  "grim/vezhdi": "kozmetika/grim-za-ochi",
  "grim/migli": "kozmetika/grim-za-ochi",
  "grim/chervila": "kozmetika/grim-za-ustni",
  "grim/glantsove": "kozmetika/grim-za-ustni",
  "grim/molivi-za-ustni": "kozmetika/grim-za-ustni",
  "grim/balsami-za-ustni": "kozmetika/ustni",
  "grim/komplekti-grim": "kozmetika/komplekti",
  "litse/pochistvane": "kozmetika/pochistvane",
  "litse/tonitsi": "kozmetika/pochistvane",
  "litse/termalni-vodi": "kozmetika/pochistvane",
  "litse/serumi": "kozmetika/serumi",
  "litse/masla-za-litse": "kozmetika/serumi",
  "litse/kremove": "kozmetika/kremove-za-litse",
  "litse/okoloochen-kontur": "kozmetika/okoloochen-kontur",
  "litse/maski": "kozmetika/maski-i-pilingi",
  "litse/eksfolianti": "kozmetika/maski-i-pilingi",
  "litse/komplekti-litse": "kozmetika/komplekti",
  "parfyumi/damski": "kozmetika/damski-parfyumi",
  "parfyumi/mazhki": "za-mazha/parfyumi-za-mazhe",
  "parfyumi/uniseks": "kozmetika/uniseks-parfyumi",
  "parfyumi/nishovi": "kozmetika/uniseks-parfyumi",
  "parfyumi/parfyumni-komplekti": "kozmetika/parfyumni-komplekti",
  "parfyumi/mistove": "kozmetika/damski-parfyumi",
  "parfyumi/detski-parfyumi": "mama-i-bebe/bebeshka-kozmetika",
  "kosa/shampoani": "higiena/shampoani",
  "kosa/balsami": "higiena/balsami-i-maski",
  "kosa/maski-za-kosa": "higiena/balsami-i-maski",
  "kosa/bez-otmivane": "higiena/balsami-i-maski",
  "kosa/serumi-i-olia": "higiena/balsami-i-maski",
  "kosa/komplekti-kosa": "higiena/balsami-i-maski",
  "kosa/skalp": "higiena/kosopad",
  "kosa/stilizirane": "higiena/stilizirane",
  "kosa/boya-za-kosa": "higiena/boya-za-kosa",
  "kosa/uredi-za-kosa": "higiena/uredi-za-kosa",
  "tyalo/dush-gelove": "higiena/dush-i-sapuni",
  "tyalo/sapuni": "higiena/dush-i-sapuni",
  "tyalo/skrabove": "higiena/vana",
  "tyalo/vana": "higiena/vana",
  "tyalo/losioni": "kozmetika/losioni-za-tyalo",
  "tyalo/masla-za-tyalo": "kozmetika/losioni-za-tyalo",
  "tyalo/eterichni-masla": "bio/eterichni-masla",
  "tyalo/ratse-i-kraka": "kozmetika/ratse-i-kraka",
  "tyalo/dezodoranti": "higiena/dezodoranti",
  "tyalo/epilatsia": "higiena/depilatsia",
  "tyalo/komplekti-tyalo": "kozmetika/komplekti",
  "nokti/lakove": "kozmetika/nokti",
  "nokti/gel-lakove": "kozmetika/nokti",
  "nokti/osnovi-i-top": "kozmetika/nokti",
  "nokti/grizha-za-nokti": "kozmetika/nokti",
  "nokti/lakochistiteli": "kozmetika/nokti",
  "nokti/manikyur": "kozmetika/nokti",
  "slantse/za-litse": "kozmetika/slantsezashtita",
  "slantse/za-tyalo": "kozmetika/slantsezashtita",
  "slantse/detska": "kozmetika/slantsezashtita",
  "slantse/sled-slantse": "kozmetika/slantsezashtita",
  "slantse/avtobronzanti": "kozmetika/slantsezashtita",
  "mazhe/brasnene": "za-mazha/brasnene",
  "mazhe/aftarsheyv": "za-mazha/brasnene",
  "mazhe/brada": "za-mazha/brada",
  "mazhe/grizha-za-mazhe": "za-mazha/grizha-za-mazhe",
  "mazhe/komplekti-mazhe": "za-mazha/grizha-za-mazhe",
  "higiena/pasti-za-zabi": "higiena/pasti-za-zabi",
  "higiena/chetki-za-zabi": "higiena/chetki-za-zabi",
  "higiena/elektricheski-chetki": "higiena/chetki-za-zabi",
  "higiena/vodi-za-usta": "higiena/vodi-i-konci",
  "higiena/interdentalni": "higiena/vodi-i-konci",
  "higiena/damska-higiena": "higiena/damska-higiena",
  "higiena/intimna-higiena": "higiena/intimna-higiena",
  "higiena/mokri-karpichki": "higiena/higienni-konsumativi",
  "higiena/pamuchni": "higiena/higienni-konsumativi",
  "aksesoari/chetki-za-grim": "kozmetika/aksesoari",
  "aksesoari/gabi-i-aplikatori": "kozmetika/aksesoari",
  "aksesoari/instrumenti": "kozmetika/aksesoari",
  "aksesoari/neseseri": "kozmetika/aksesoari",
  "aksesoari/chetki-za-kosa": "higiena/aksesoari-za-kosa",
  "aksesoari/za-kosa": "higiena/aksesoari-za-kosa",
  "aksesoari/za-banya": "higiena/vana",
};

const MAMA = rx("бремен|pregnan|maternit|матерните|за майк|кърмачк|след раждане|стрии(?=.*(?:бремен|майк|раждане))|\\bmama\\b|\\bмама\\b|\\bmom\\b|\\bmommy\\b|\\bmum\\b");
const NIPPLE = rx("\\bзърна(?:та)?\\b|nipple|ланолин|lanolin|\\blansinoh");
/** Bio cosmetics: certified organic or "bio" in the name. Brand names with "bio" in them ("Bioderma") do not count. */
const BIO_COSMETIC = rx("\\bбио\\b|\\bbio\\b|\\borganic\\b|органичн|\\bcosmos (?:organic|natural)\\b|\\becocert\\b|\\bnatrue\\b|\\bbdih\\b");
const KIDS_CARE = new Set(["litse", "tyalo", "kosa", "slantse", "parfyumi"]);
const MEN_MOVES: Record<string, string> = {
  "tyalo/dezodoranti": "za-mazha/dezodoranti-za-mazhe",
  "tyalo/dush-gelove": "za-mazha/grizha-za-mazhe",
  "tyalo/losioni": "za-mazha/grizha-za-mazhe",
  "litse/kremove": "za-mazha/grizha-za-mazhe",
  "litse/pochistvane": "za-mazha/grizha-za-mazhe",
  "litse/serumi": "za-mazha/grizha-za-mazhe",
  "litse/okoloochen-kontur": "za-mazha/grizha-za-mazhe",
  "kosa/shampoani": "za-mazha/kosa-za-mazhe",
  "kosa/stilizirane": "za-mazha/kosa-za-mazhe",
  "kosa/skalp": "za-mazha/kosa-za-mazhe",
  "kosa/balsami": "za-mazha/kosa-za-mazhe",
  "parfyumi/uniseks": "kozmetika/uniseks-parfyumi",
};

/**
 * This shop's place for a product the cosmetics rules recognised. `tags` are the cosmetics shop's collections for it
 * (children's and men's products move to "Мама и бебе" and "За мъжа").
 */
export function cosmeticPlace(place: Place, tags: string[], text: string): Place {
  const key = `${place.category}/${place.sub}`;
  const kids = tags.includes("detsa");
  const men = tags.includes("za-nego") && !kids;
  if (kids && KIDS_CARE.has(place.category)) return P("mama-i-bebe", "bebeshka-kozmetika");
  if (kids && key === "higiena/mokri-karpichki") return P("mama-i-bebe", "peleni-i-karpi");
  if (kids && key === "higiena/intimna-higiena") return P("mama-i-bebe", "bebeshka-kozmetika");
  if (NIPPLE.test(text) && ["litse", "tyalo"].includes(place.category)) return P("mama-i-bebe", "karmene");
  if (MAMA.test(text) && ["litse", "tyalo"].includes(place.category)) return P("mama-i-bebe", "kozmetika-za-mama");
  if (men && MEN_MOVES[key]) {
    const [category, sub] = MEN_MOVES[key].split("/");
    return P(category, sub);
  }
  if (BIO_COSMETIC.test(text) && ["litse", "tyalo", "kosa", "slantse", "mazhe"].includes(place.category) && key !== "kosa/uredi-za-kosa" && key !== "tyalo/epilatsia" && key !== "tyalo/eterichni-masla") {
    return P("bio", "bio-kozmetika");
  }
  const target = COSMETIC_MAP[key];
  if (!target) throw new Error(`No place for the cosmetics subcategory ${key}`);
  const [category, sub] = target.split("/");
  return P(category, sub);
}

export { matchText };
