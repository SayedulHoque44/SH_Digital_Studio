/*
 * The nine deployed restaurant demos. Descriptions only state what is
 * visible on each live site (checked against the deployed pages and the
 * screenshots captured from them). Screenshots are authentic captures stored
 * in Client/public/media/demos/<slug>/. Brand names inside the demos are
 * fictional unless noted; none of these are presented as client work.
 * Tech stack (Next.js + Tailwind CSS on Vercel) was verified from each
 * site's build output.
 */

export type TSeedProject = {
  title: string;
  slug: string;
  brandName: string;
  subtitle: string;
  summary: string;
  overview: string;
  subcategory: string;
  categorySlugs: string[];
  tags: string[];
  liveUrl: string;
  designHighlights: string[];
  features: { title: string; description: string }[];
  corePages: string[];
  limitations: string;
  seo: { title: string; description: string };
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
};

const FICTIONAL_LIMITATION =
  "Concept demo for a fictional business. The names, menu items, prices, reviews and other details shown on the live site are illustrative and do not describe a real restaurant or a client relationship. Booking and ordering buttons demonstrate the user journey; they are not connected to a live reservation or ordering system.";

export const DEMO_TECH_STACK = ["Next.js", "React", "Tailwind CSS", "Vercel"];

// Paths of the captured screenshots for a demo folder
export const demoMedia = (slug: string, title: string) => {
  const base = `/media/demos/${slug}`;
  return {
    coverImage: {
      url: `${base}/desktop-1.webp`,
      alt: `${title} website — desktop homepage hero`,
      width: 1440,
      height: 900,
    },
    fullPageScreenshot: {
      url: `${base}/fullpage.webp`,
      alt: `${title} website — full homepage scroll`,
      width: 1200,
      height: 7500,
    },
    desktopScreenshots: [
      { url: `${base}/desktop-1.webp`, alt: `${title} — homepage hero on desktop`, width: 1440, height: 900 },
      { url: `${base}/desktop-2.webp`, alt: `${title} — content section on desktop`, width: 1440, height: 900 },
      { url: `${base}/desktop-3.webp`, alt: `${title} — further section on desktop`, width: 1440, height: 900 },
    ],
    tabletScreenshots: [
      { url: `${base}/tablet-1.webp`, alt: `${title} — homepage on tablet`, width: 834, height: 1194 },
    ],
    mobileScreenshots: [
      { url: `${base}/mobile-1.webp`, alt: `${title} — homepage on mobile`, width: 780, height: 1688 },
      { url: `${base}/mobile-2.webp`, alt: `${title} — content section on mobile`, width: 780, height: 1688 },
    ],
    gallery: [],
  };
};

export const SEED_PROJECTS: TSeedProject[] = [
  {
    title: "Aurum Menu",
    slug: "aurum-menu",
    brandName: "Aurum",
    subtitle: "A candlelit, editorial website concept for a modern British fine-dining restaurant.",
    summary:
      "Concept site for a fictional Mayfair tasting-menu restaurant — dark, gold-accented and photography-led, with reservations always one tap away.",
    overview:
      "Aurum is a concept website for a fictional fine-dining restaurant in Mayfair, London. The aim was to make an evening feel special before guests arrive: a dark, candlelit palette, restrained gold accents and large editorial serif typography over full-bleed food photography.\n\nThe page walks visitors through the restaurant's story, the seasonal tasting menu, the kitchen, private dining and how to visit — with a reservation button kept in the navigation and a \"Reserve a table\" call-to-action in the hero.",
    subcategory: "Fine Dining Restaurant",
    categorySlugs: ["restaurants", "fine-dining"],
    tags: ["Fine dining", "Tasting menu", "Reservations", "Editorial design"],
    liveUrl: "https://aurum-menu-web.vercel.app/",
    designHighlights: [
      "Dark, candlelit palette with restrained gold accents",
      "Large editorial serif headlines with italic emphasis",
      "Full-bleed food photography",
      "Rotating circular badge as a decorative motif",
      "Key facts highlighted beneath the hero on mobile",
    ],
    features: [
      { title: "Seasonal tasting menu", description: "A dedicated section presenting the courses of the evening." },
      { title: "Reservation calls-to-action", description: "\"Reserve\" in the navigation and \"Reserve a table\" in the hero." },
      { title: "Private dining", description: "A section introducing private dining for groups and events." },
      { title: "Visit details", description: "Address and directions with a link to Google Maps." },
      { title: "Questions answered", description: "A frequently-asked-questions section for first-time guests." },
    ],
    corePages: ["Home (single-page experience)", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Aurum — Fine Dining Restaurant Website Concept",
      description:
        "A dark, editorial website concept for a fine-dining restaurant: tasting menu, private dining and reservations. Open the live demo.",
    },
    featured: true,
    featuredOrder: 1,
    sortOrder: 1,
  },
  {
    title: "Fast Food QSR",
    slug: "fast-food-qsr",
    brandName: "Bun Run",
    subtitle: "A loud, illustrated website concept for a smash-burger and fried-chicken brand.",
    summary:
      "High-energy concept site for a fictional Austin burger joint — comic-style illustration, chunky type and an order button that never leaves the screen.",
    overview:
      "Bun Run is a concept website for a fictional quick-service restaurant serving smash burgers, fried chicken and pizza in Austin, Texas. The design leans into personality: hand-drawn illustration, chunky outlined type, sticker-style badges and a red-and-yellow palette built for appetite.\n\nThe site covers the menu, daily deals, party packs, a rewards program and a store finder, explains the ordering process in three illustrated steps, and keeps an \"Order now\" button anchored in the header. A separate nutrition page lists nutritional information.",
    subcategory: "Fast Food / Burger Restaurant",
    categorySlugs: ["restaurants", "fast-food"],
    tags: ["Fast food", "Quick service", "Illustration", "Ordering"],
    liveUrl: "https://fast-food-qsr.vercel.app/",
    designHighlights: [
      "Comic-style illustration and sticker badges",
      "Chunky display typography with heavy outlines",
      "Bold red, yellow and cream palette",
      "Illustrated three-step \"how it works\" section",
    ],
    features: [
      { title: "Menu and deals", description: "Menu highlights alongside current deals and pricing." },
      { title: "Party packs", description: "A section for group and party orders." },
      { title: "Rewards", description: "A section presenting a loyalty rewards program." },
      { title: "Store finder", description: "A \"Find us\" section for nearby locations." },
      { title: "Nutrition page", description: "A dedicated page with nutritional information." },
      { title: "Persistent ordering CTA", description: "\"Order now\" stays visible in the header." },
    ],
    corePages: ["Home", "Nutrition", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Bun Run — Fast Food Restaurant Website Concept",
      description:
        "A bold, illustrated website concept for a burger and fried-chicken brand: menu, deals, party packs, rewards and ordering CTAs.",
    },
    featured: true,
    featuredOrder: 7,
    sortOrder: 2,
  },
  {
    title: "Crumb & Kettle",
    slug: "crumb-and-kettle",
    brandName: "Crumb & Kettle",
    subtitle: "A warm, hand-crafted website concept for a neighborhood bakery and coffee shop.",
    summary:
      "Concept site for a fictional Bristol bakery — warm tones, a live open/closed indicator and a \"what's warm right now\" board with bake times.",
    overview:
      "Crumb & Kettle is a concept website for a fictional artisan bakery and coffee shop on Gloucester Road, Bristol. It is designed to feel like the shop itself: warm cream and toffee tones, soft serif headlines and handwritten notes.\n\nUseful details sit up front — an open/closed indicator with today's closing time, and a \"what's warm right now\" board showing when each bake comes out of the oven, with \"last few\" and \"sold out\" labels. The site also covers the menu, the bakery's story, baking workshops and pre-orders.",
    subcategory: "Bakery & Coffee Shop",
    categorySlugs: ["restaurants", "cafes-bakeries"],
    tags: ["Bakery", "Café", "Coffee", "Pre-orders"],
    liveUrl: "https://crumbandkettle.vercel.app/",
    designHighlights: [
      "Warm cream and toffee palette",
      "Soft serif display type with handwritten accents",
      "Arched photo frames and illustrated details",
      "Floating, rounded navigation bar",
    ],
    features: [
      { title: "Open/closed indicator", description: "Shows whether the shop is open and today's closing time." },
      { title: "Daily bake board", description: "Bake times with \"last few\" and \"sold out\" labels." },
      { title: "Menu", description: "Breads, pastries and coffee with prices." },
      { title: "Workshops", description: "A section promoting baking workshops." },
      { title: "Pre-orders", description: "A \"Pre-order\" call-to-action in the navigation." },
    ],
    corePages: ["Home", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Crumb & Kettle — Bakery & Café Website Concept",
      description:
        "A warm website concept for an artisan bakery and coffee shop: daily bake board, opening status, menu, workshops and pre-orders.",
    },
    featured: true,
    featuredOrder: 5,
    sortOrder: 3,
  },
  {
    title: "Fizzaria & Italian",
    slug: "fizzaria-and-italian",
    brandName: "Fizzaria",
    subtitle: "A retro, playful website concept for a wood-fired pizzeria — with a build-your-own pizza tool.",
    summary:
      "Concept site for a fictional Brooklyn pizzeria — retro lettering, awning details and an interactive pizza builder with live pricing.",
    overview:
      "Fizzaria is a concept website for a fictional, family-run pizzeria in Carroll Gardens, Brooklyn. The look borrows from classic Italian-American pizzerias: striped awnings, script lettering and bold reds and greens.\n\nThe highlight is an interactive pizza builder: visitors choose a size, base, crust and up to six toppings, and the illustrated pizza and the price update as they go. The site also covers the menu, deals, the family story, parties and visiting, with \"Order now\" and \"Book a table\" calls-to-action.",
    subcategory: "Pizzeria & Italian Restaurant",
    categorySlugs: ["restaurants", "pizzerias"],
    tags: ["Pizzeria", "Italian", "Interactive", "Ordering"],
    liveUrl: "https://fizzaria-and-italian.vercel.app/",
    designHighlights: [
      "Retro Italian-American palette and awning motif",
      "Script and heavy display lettering",
      "Illustrated pizza that updates with each choice",
      "Sticker-style price badges",
    ],
    features: [
      { title: "Build-your-own pizza", description: "Size, base, crust and toppings with a live price." },
      { title: "Menu and deals", description: "Pizzas, pasta and current deals." },
      { title: "Parties", description: "A section for celebrations and group bookings." },
      { title: "Order and book CTAs", description: "\"Order now\" and \"Book a table\" calls-to-action." },
      { title: "Story and visit", description: "The family story, location and opening times." },
    ],
    corePages: ["Home", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Fizzaria — Pizzeria Website Concept",
      description:
        "A retro pizzeria website concept with an interactive build-your-own pizza tool, menu, deals, parties and table booking.",
    },
    featured: true,
    featuredOrder: 2,
    sortOrder: 4,
  },
  {
    title: "Vesper Flame",
    slug: "vesper-flame",
    brandName: "Vesper",
    subtitle: "A cinematic, minimal website concept for an intimate tasting-menu restaurant.",
    summary:
      "Concept site for a fictional Mayfair tasting-menu restaurant — a near-black canvas, classical serif type and a slow, course-by-course scroll.",
    overview:
      "Vesper is a concept website for a fictional tasting-menu restaurant in Mayfair. Where many restaurant sites show everything at once, Vesper slows down: one menu, presented course by course on a near-black canvas with classical serif typography and generous space.\n\nThe experience covers signature plates, the seasonal tasting menus (with tabs for each menu), the chef, private dining and visit details, with reservation buttons throughout. The wine list lives on its own page.",
    subcategory: "Tasting Menu Restaurant",
    categorySlugs: ["restaurants", "fine-dining"],
    tags: ["Tasting menu", "Fine dining", "Minimal", "Wine"],
    liveUrl: "https://vesper-flame.vercel.app/",
    designHighlights: [
      "Near-black canvas with fine gold details",
      "Classical high-contrast serif typography",
      "Course-by-course scrolling presentation",
      "Wide letter-spaced navigation",
    ],
    features: [
      { title: "Signature plates", description: "Courses presented one at a time with photography." },
      { title: "Tasting menus", description: "Seasonal menus organized in tabs." },
      { title: "Wine page", description: "A dedicated page for the wine list." },
      { title: "Chef and private dining", description: "Sections introducing the chef and private events." },
      { title: "Reservations", description: "\"Reserve\" calls-to-action throughout the page." },
    ],
    corePages: ["Home", "Wine", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Vesper — Tasting Menu Restaurant Website Concept",
      description:
        "A cinematic, minimal website concept for a tasting-menu restaurant: signature courses, seasonal menus, wine page and reservations.",
    },
    featured: true,
    featuredOrder: 6,
    sortOrder: 5,
  },
  {
    title: "Smoke and Bao",
    slug: "smoke-and-bao",
    brandName: "Smoke & Bao",
    subtitle: "A neon night-market website concept for a Korean BBQ food truck.",
    summary:
      "Concept site for a fictional Austin food truck — neon type, string lights and a \"where's the truck right now?\" section, plus specials, schedule and event bookings.",
    overview:
      "Smoke & Bao is a concept website for a fictional Korean BBQ bao truck in Austin, Texas. A food truck's most important question is \"where are you today?\", so the site answers it first: today's location and opening time sit in the hero, with a dedicated section for finding the truck.\n\nThe night-market styling — string lights, a striped awning and neon pink headlines — carries through today's specials and deals, the markets the truck visits, event and catering bookings, the team's story and an alerts sign-up. The full menu has its own page.",
    subcategory: "Food Truck / Korean BBQ",
    categorySlugs: ["restaurants", "food-trucks"],
    tags: ["Food truck", "Street food", "Events", "Neon"],
    liveUrl: "https://smoke-and-bao.vercel.app/",
    designHighlights: [
      "Night-market palette with neon glow headlines",
      "Illustrated truck and string-light details",
      "Ticket-style deal cards",
      "Condensed signage typography in the navigation",
    ],
    features: [
      { title: "Today's location", description: "Where the truck is parked and when it opens." },
      { title: "Markets and schedule", description: "The markets and events the truck visits." },
      { title: "Specials and deals", description: "This week's special and recurring deals." },
      { title: "Book the truck", description: "Event and catering booking section." },
      { title: "Alerts", description: "A sign-up section so fans never miss the truck." },
      { title: "Menu page", description: "A dedicated page for the full menu." },
    ],
    corePages: ["Home", "Menu", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Smoke & Bao — Food Truck Website Concept",
      description:
        "A neon night-market website concept for a Korean BBQ food truck: today's location, schedule, specials and event bookings.",
    },
    featured: true,
    featuredOrder: 3,
    sortOrder: 6,
  },
  {
    title: "Family Grill & BBQ",
    slug: "family-grill-and-bbq",
    brandName: "Hickory & Hearth",
    subtitle: "A warm, rustic website concept for a family-owned grill and BBQ restaurant.",
    summary:
      "Concept site for a fictional Manchester grill — wood and ember textures, a tabbed chalkboard menu with allergen details, family deals and celebrations.",
    overview:
      "Hickory & Hearth is a concept website for a fictional family-owned grill on Wilmslow Road, Manchester. It is built around warmth and generosity: wood and ember textures, chalkboard lettering and big, appetizing photography.\n\nThe menu is presented as a tabbed chalkboard — starters, grills, burgers, sharing platters, the kids' menu and more — with prices, serving sizes, spice levels and allergen information. The site also highlights family deals, celebrations, the restaurant's story, an open/closed indicator, a click-to-call phone number and a prominent \"Book a table\" button.",
    subcategory: "Family Grill & BBQ Restaurant",
    categorySlugs: ["restaurants", "casual-dining"],
    tags: ["Family dining", "Grill", "BBQ", "Allergen info"],
    liveUrl: "https://casual-dining-and-family-grill.vercel.app/",
    designHighlights: [
      "Wood, ember and chalkboard textures",
      "Slab-serif headlines with handwritten accents",
      "Price-tag style deal cards",
      "Warm orange calls-to-action",
    ],
    features: [
      { title: "Tabbed menu", description: "Menu categories with prices, spice levels and allergens." },
      { title: "Family deals", description: "Deals presented on price-tag style cards." },
      { title: "Celebrations", description: "A section for birthdays, Eid and group celebrations." },
      { title: "Open/closed indicator", description: "Shows whether the restaurant is open right now." },
      { title: "Click-to-call", description: "Phone number in the header for quick bookings." },
      { title: "Table bookings", description: "\"Book a table\" calls-to-action in the header and hero." },
    ],
    corePages: ["Home", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Hickory & Hearth — Family Grill Website Concept",
      description:
        "A warm website concept for a family grill and BBQ restaurant: tabbed menu with allergens, family deals, celebrations and bookings.",
    },
    featured: false,
    featuredOrder: 8,
    sortOrder: 7,
  },
  {
    title: "Orbit Bowl Bar",
    slug: "orbit-bowl-bar",
    brandName: "Orbit",
    subtitle: "A fresh, minimal website concept for a build-your-own bowl restaurant.",
    summary:
      "Concept site for a fictional Austin bowl bar — clean layouts, diet filters, per-item nutrition and a build-your-own bowl flow.",
    overview:
      "Orbit is a concept website for a fictional bowl bar serving poke, grain, salad and noodle bowls in Austin. The design is clean and bright — soft greens, generous white space and friendly rounded type — so the food and the nutrition information stay easy to read.\n\nThe menu can be filtered by diet (vegan, vegetarian, gluten-free, halal and more), each item shows calories and macros, and a dedicated page holds the full nutrition and allergen table. Visitors can also build their own bowl, browse deals and office catering, and find locations.",
    subcategory: "Bowl Bar / Healthy Restaurant",
    categorySlugs: ["restaurants", "healthy-eating"],
    tags: ["Healthy food", "Nutrition", "Filters", "Catering"],
    liveUrl: "https://orbit-bowl-bar.vercel.app/",
    designHighlights: [
      "Fresh green palette with plenty of white space",
      "Rounded, friendly sans-serif typography",
      "Illustrated bowls and ingredients",
      "Pill-shaped filters and buttons",
    ],
    features: [
      { title: "Diet filters", description: "Filter the menu by vegan, gluten-free, halal and more." },
      { title: "Per-item nutrition", description: "Calories and macros shown on every menu card." },
      { title: "Build your bowl", description: "A step-by-step bowl builder." },
      { title: "Nutrition page", description: "Full nutrition and allergen table on its own page." },
      { title: "Catering", description: "A section for office and team catering." },
      { title: "Locations", description: "Location details with an open/closed status." },
    ],
    corePages: ["Home", "Nutrition", "Privacy policy", "Terms"],
    limitations: FICTIONAL_LIMITATION,
    seo: {
      title: "Orbit — Bowl Bar Website Concept",
      description:
        "A fresh website concept for a healthy bowl bar: diet filters, per-item nutrition, build-your-own bowls, catering and locations.",
    },
    featured: true,
    featuredOrder: 4,
    sortOrder: 8,
  },
  {
    title: "Ristorante L'Uva Tardiva",
    slug: "ristorante-luva-tardiva",
    brandName: "Ristorante L'uva Tardiva",
    subtitle: "A modern, photo-led website concept for an Italian restaurant and steakhouse.",
    summary:
      "Website concept for an Italian restaurant and steakhouse in Somma Lombardo — a dark, photo-led layout with menu, gallery and reservations.",
    overview:
      "Ristorante L'Uva Tardiva is a website concept for an Italian restaurant and steakhouse on Via Giuseppe Giusti in Somma Lombardo, Italy. The design pairs a dark, atmospheric palette with large food and venue photography and clean, modern type.\n\nThe single-page layout covers the restaurant's story, the dining experience, the menu by course (antipasti, primi, fish and meat mains, desserts), a photo gallery, opening times, reservations and contact details.",
    subcategory: "Italian Restaurant & Steakhouse",
    categorySlugs: ["restaurants", "pizzerias"],
    tags: ["Italian", "Steakhouse", "Photography", "Reservations"],
    liveUrl: "https://ristorante-l-uva-tardiva.vercel.app/",
    designHighlights: [
      "Dark, atmospheric palette with warm gradients",
      "Large food and venue photography",
      "Clean geometric headlines with serif accents",
      "Signature-dish card in the hero",
    ],
    features: [
      { title: "Story and experience", description: "Sections introducing the restaurant and its dining room." },
      { title: "Menu by course", description: "Antipasti, primi, mains and desserts." },
      { title: "Gallery", description: "A swipeable gallery of dishes." },
      { title: "Opening times and reservations", description: "Lunch and dinner times with reservation calls-to-action." },
      { title: "Contact and location", description: "Address and contact details." },
    ],
    corePages: ["Home (single page)"],
    limitations:
      "Concept website created for demonstration. It is not presented as commissioned client work; the business name, ratings and details shown belong to their respective owners.",
    seo: {
      title: "L'Uva Tardiva — Italian Restaurant Website Concept",
      description:
        "A dark, photo-led website concept for an Italian restaurant and steakhouse: story, menu by course, gallery and reservations.",
    },
    featured: false,
    featuredOrder: 9,
    sortOrder: 9,
  },
];
