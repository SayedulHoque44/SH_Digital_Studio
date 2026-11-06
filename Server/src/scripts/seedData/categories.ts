/*
 * Industry taxonomy. Top-level industries are shareable landing pages
 * (/demos/<slug>). Restaurant sub-categories let you send a more specific
 * link, e.g. /demos/pizzerias. Industries without demos yet are published
 * with an honest "demos in production" state so links such as /demos/gyms
 * already work. Everything is editable in Admin -> Categories.
 */

export type TSeedCategory = {
  name: string;
  slug: string;
  parentSlug?: string;
  icon?: string;
  shortDescription: string;
  introduction?: string;
  emailIntro?: string;
  highlights?: string[];
  faqs?: { question: string; answer: string }[];
  cta?: { heading: string; text: string; buttonLabel: string };
  seo?: { title: string; description: string };
  showOnHome?: boolean;
  status?: "draft" | "published";
  relatedServiceSlugs?: string[];
};

const genericFaqs = (industry: string) => [
  {
    question: `Can you build a website for my ${industry} business even though there are no demos here yet?`,
    answer:
      "Yes. Every website is designed around your business from the start - the demos simply show the level of design and engineering you can expect. Get in touch and we'll scope the right solution together.",
  },
  {
    question: "Will the website work well on phones?",
    answer:
      "Absolutely. Layouts are designed for phones, tablets and desktops from the start, and pages are optimized to load quickly on mobile connections.",
  },
];

export const SEED_CATEGORIES: TSeedCategory[] = [
  {
    name: "Restaurants & Hospitality",
    slug: "restaurants",
    icon: "restaurant",
    showOnHome: true,
    shortDescription:
      "Websites for restaurants, cafés, bakeries and food trucks — built to show off your food and make booking or ordering effortless.",
    introduction:
      "Most diners decide where to eat on their phone, often in a few seconds. A restaurant website has one job: make your food irresistible and make the next step — booking, ordering or visiting — obvious.\n\nThe demos below cover very different kinds of venue, from fine dining and tasting menus to bakeries, pizzerias, bowl bars and food trucks. Each one is a live, working concept you can open on your own phone.",
    emailIntro:
      "Here are a few restaurant website concepts I've designed and built. Each one is live, so you can open it on your phone and see exactly how it would feel for your guests.",
    highlights: [
      "Menus that are a pleasure to browse on a phone",
      "Clear booking, ordering and enquiry calls-to-action",
      "Opening hours, location and directions up front",
      "Deals, events, catering and private dining pages",
      "Allergen, dietary and nutrition information",
      "Fast, mobile-first pages that load in a moment",
    ],
    faqs: [
      {
        question: "Can my real menu, photos and prices replace the demo content?",
        answer:
          "Yes. Your menu, photography, opening hours and contact details replace everything you see in a demo. If you'd like to update the menu yourself later, a simple admin panel can be included in the scope.",
      },
      {
        question: "Do the demos include real online ordering or table booking?",
        answer:
          "The demos show booking and ordering calls-to-action. On your live site these can link to the reservation or delivery platform you already use, or a custom solution can be scoped for you.",
      },
      {
        question: "Can I have a design like one of these demos?",
        answer:
          "A demo is a starting point for the conversation, not a template you're locked into. Your site is designed around your brand, your food and your guests.",
      },
    ],
    cta: {
      heading: "Want a website like these for your restaurant?",
      text: "Tell me about your venue and I'll suggest the best starting point and a clear plan.",
      buttonLabel: "Request a restaurant website",
    },
    seo: {
      title: "Restaurant Website Design — Live Demos",
      description:
        "Explore live restaurant website demos: fine dining, cafés, pizzerias, fast food, bowl bars and food trucks. Mobile-first sites designed to win bookings and orders.",
    },
    relatedServiceSlugs: [
      "restaurant-website-development",
      "booking-and-inquiry-systems",
      "website-redesign",
    ],
  },
  // Restaurant sub-categories
  {
    name: "Fine Dining",
    slug: "fine-dining",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription:
      "Elegant, atmospheric websites for fine-dining and tasting-menu restaurants.",
    emailIntro:
      "Here are two fine-dining website concepts I've built — both are live, so you can see how they feel on your own phone.",
    seo: {
      title: "Fine Dining Restaurant Website Demos",
      description:
        "Live website concepts for fine-dining and tasting-menu restaurants: atmospheric design, menus, private dining and reservations.",
    },
  },
  {
    name: "Fast Food & QSR",
    slug: "fast-food",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription:
      "Bold, high-energy websites for burger joints, fried chicken and quick-service brands.",
    seo: {
      title: "Fast Food Restaurant Website Demo",
      description:
        "A live website concept for a quick-service burger restaurant: menu, deals, party packs, rewards and ordering calls-to-action.",
    },
  },
  {
    name: "Cafés & Bakeries",
    slug: "cafes-bakeries",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription: "Warm, inviting websites for bakeries, coffee shops and brunch spots.",
    seo: {
      title: "Café & Bakery Website Demo",
      description:
        "A live website concept for an artisan bakery and coffee shop: daily bakes, opening hours, workshops and pre-orders.",
    },
  },
  {
    name: "Pizzerias & Italian",
    slug: "pizzerias",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription:
      "Websites for pizzerias and Italian kitchens — from wood-fired slices to trattoria classics.",
    seo: {
      title: "Pizzeria & Italian Restaurant Website Demos",
      description:
        "Live website concepts for pizzerias and Italian restaurants, including an interactive build-your-own pizza tool.",
    },
  },
  {
    name: "Casual & Family Dining",
    slug: "casual-dining",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription:
      "Friendly, family-focused websites for grills, BBQ joints and neighborhood restaurants.",
    seo: {
      title: "Family Restaurant & Grill Website Demo",
      description:
        "A live website concept for a family grill and BBQ restaurant: tabbed menu with allergens, family deals and table bookings.",
    },
  },
  {
    name: "Food Trucks & Street Food",
    slug: "food-trucks",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription:
      "Websites for food trucks and street-food vendors — where to find you, today.",
    seo: {
      title: "Food Truck Website Demo",
      description:
        "A live website concept for a food truck: today's location, weekly schedule, specials and event bookings.",
    },
  },
  {
    name: "Healthy & Fast Casual",
    slug: "healthy-eating",
    parentSlug: "restaurants",
    icon: "restaurant",
    shortDescription:
      "Fresh, clean websites for bowl bars, salad spots and health-focused kitchens.",
    seo: {
      title: "Healthy Restaurant & Bowl Bar Website Demo",
      description:
        "A live website concept for a bowl bar: diet filters, per-item nutrition, build-your-own bowls and catering.",
    },
  },
  // Other industries (demos in production)
  {
    name: "Gyms & Fitness",
    slug: "gyms",
    icon: "fitness",
    showOnHome: true,
    shortDescription:
      "Websites for gyms, studios and personal trainers — with timetables, memberships and trial sign-ups front and center.",
    introduction:
      "A fitness website should do what a great front desk does: answer questions quickly and get people through the door. Timetables, memberships and trial offers should all be one tap away on a phone.\n\nGym and fitness demos are in production. In the meantime, the work below shows the level of design and performance you can expect — and your site can be planned around your studio from day one.",
    emailIntro:
      "I design and build websites for gyms and fitness studios. My fitness demos are still in production, but the projects on this page show the quality of design and build you can expect.",
    highlights: [
      "Class timetables and schedules",
      "Membership and pricing pages",
      "Free trial and enquiry forms",
      "Trainer and coach profiles",
      "Facilities, location and opening hours",
      "Member stories (shared with permission)",
    ],
    faqs: genericFaqs("fitness"),
    cta: {
      heading: "Planning a new website for your gym or studio?",
      text: "Tell me about your classes and members, and I'll suggest the right structure for your site.",
      buttonLabel: "Talk about your gym website",
    },
    seo: {
      title: "Gym & Fitness Website Design",
      description:
        "Websites for gyms, studios and personal trainers: class timetables, memberships, trial sign-ups and trainer profiles.",
    },
    relatedServiceSlugs: ["custom-website-development", "booking-and-inquiry-systems", "website-redesign"],
  },
  {
    name: "Travel & Tourism",
    slug: "travel",
    icon: "travel",
    showOnHome: true,
    shortDescription:
      "Websites for tour operators, travel agencies and guesthouses — showcasing destinations and turning browsers into enquiries.",
    introduction:
      "Travel is sold on feeling. A great travel website pairs immersive photography with clear itineraries, honest pricing and an easy way to ask a question.\n\nTravel demos are in production. The work below shows the level of design and build you can expect.",
    emailIntro:
      "I design and build websites for travel and tourism businesses. My travel demos are still in production, but the projects here show the quality you can expect.",
    highlights: [
      "Destination and tour pages",
      "Itineraries and package details",
      "Enquiry and booking request forms",
      "Immersive, fast-loading galleries",
      "Genuine guest reviews",
      "Clear pricing and availability information",
    ],
    faqs: genericFaqs("travel"),
    cta: {
      heading: "Need a website for your travel business?",
      text: "Share your destinations and how customers book with you — I'll propose a site structure that converts browsers into enquiries.",
      buttonLabel: "Talk about your travel website",
    },
    seo: {
      title: "Travel & Tourism Website Design",
      description:
        "Websites for tour operators, travel agencies and guesthouses: destinations, itineraries, galleries and enquiry forms.",
    },
    relatedServiceSlugs: ["custom-website-development", "booking-and-inquiry-systems"],
  },
  {
    name: "Wedding & Photography",
    slug: "photography",
    icon: "photography",
    showOnHome: true,
    shortDescription:
      "Portfolio websites for wedding photographers, videographers and creative studios — image-first, fast and built to book enquiries.",
    introduction:
      "For photographers, the website is the portfolio. It has to show your work beautifully, load quickly on a phone, and make it easy for couples to check availability.\n\nPhotography demos are in production. The work below shows the level of design and build you can expect.",
    emailIntro:
      "I design and build portfolio websites for photographers and creative studios. My photography demos are still in production, but these projects show the quality you can expect.",
    highlights: [
      "Full-screen galleries that load quickly",
      "Packages and pricing guides",
      "Availability and enquiry forms",
      "Featured weddings and client stories",
      "Video showreels",
      "Journal and blog pages",
    ],
    faqs: genericFaqs("photography"),
    cta: {
      heading: "Want a portfolio that books more enquiries?",
      text: "Tell me about your style and your clients, and I'll design a site around your work.",
      buttonLabel: "Talk about your portfolio",
    },
    seo: {
      title: "Wedding & Photography Website Design",
      description:
        "Image-first portfolio websites for wedding photographers, videographers and creative studios.",
    },
    relatedServiceSlugs: ["custom-website-development", "booking-and-inquiry-systems"],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty",
    icon: "beauty",
    shortDescription:
      "Websites for salons, spas, barbers and beauty professionals — showcasing services and making appointments easy.",
    introduction:
      "Beauty clients book on impulse and on mobile. Your website should show your work, make your services and prices clear, and put the booking link one tap away.\n\nBeauty demos are in production. The work below shows the level of design and build you can expect.",
    highlights: [
      "Service menus with pricing",
      "Online appointment links",
      "Stylist and therapist profiles",
      "Before-and-after galleries (with consent)",
      "Gift vouchers and offers",
      "Location and opening hours",
    ],
    faqs: genericFaqs("beauty"),
    seo: {
      title: "Salon & Beauty Website Design",
      description:
        "Websites for salons, spas, barbers and beauty professionals: service menus, pricing and easy appointment booking.",
    },
    relatedServiceSlugs: ["custom-website-development", "booking-and-inquiry-systems"],
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    icon: "realestate",
    shortDescription:
      "Websites for estate agents, developers and letting agencies — clear listings and lead capture that works.",
    introduction:
      "Property buyers and tenants compare options quickly. A real estate website needs fast, filterable listings, rich property pages and an effortless way to request a viewing.\n\nReal estate demos are in production. The work below shows the level of design and build you can expect.",
    highlights: [
      "Property listing and detail pages",
      "Search and filter interfaces",
      "Viewing request forms",
      "Agent profiles",
      "Development showcase pages",
      "Area and neighborhood guides",
    ],
    faqs: genericFaqs("real estate"),
    seo: {
      title: "Real Estate Website Design",
      description:
        "Websites for estate agents, developers and letting agencies: listings, search, property pages and viewing requests.",
    },
    relatedServiceSlugs: ["custom-website-development", "web-application-development"],
  },
  {
    name: "E-commerce & Retail",
    slug: "ecommerce",
    icon: "ecommerce",
    shortDescription:
      "Online stores and retail websites — product presentation, smooth checkout journeys and content that builds trust.",
    introduction:
      "Online shoppers expect speed and clarity. A good store makes products look their best, makes finding the right one easy and keeps checkout short.\n\nE-commerce demos are in production. The work below shows the level of design and build you can expect.",
    highlights: [
      "Product catalogs and collections",
      "Cart and checkout journeys",
      "Product search and filtering",
      "Promotions and featured collections",
      "Order and enquiry management",
      "Store locator and click-and-collect pages",
    ],
    faqs: genericFaqs("retail"),
    seo: {
      title: "E-commerce Website Development",
      description:
        "Online stores and retail websites with clear product presentation, search, and smooth checkout journeys.",
    },
    relatedServiceSlugs: ["ecommerce-development", "web-application-development"],
  },
  {
    name: "Education",
    slug: "education",
    icon: "education",
    shortDescription:
      "Websites and platforms for schools, tutors and course providers — programs, enrollment and learning tools.",
    introduction:
      "Students and parents want clear answers: what's offered, when it runs, what it costs and how to enroll. Education websites — and learning platforms — should make that simple.\n\nEducation demos are in production. The work below shows the level of design and build you can expect.",
    highlights: [
      "Course and program pages",
      "Enrollment and admission forms",
      "Tutor and staff profiles",
      "Timetables and term dates",
      "Student portals and learning platforms",
      "Resource libraries",
    ],
    faqs: genericFaqs("education"),
    seo: {
      title: "Education Website & Platform Development",
      description:
        "Websites and learning platforms for schools, tutors and course providers: programs, enrollment and student portals.",
    },
    relatedServiceSlugs: ["web-application-development", "custom-website-development"],
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    icon: "briefcase",
    shortDescription:
      "Websites for consultants, law firms, accountants and agencies — credibility, clarity and a clear path to getting in touch.",
    introduction:
      "Clients choose professional services on trust. Your website should explain what you do in plain language, show your expertise and make the first conversation easy to start.\n\nProfessional services demos are in production. The work below shows the level of design and build you can expect.",
    highlights: [
      "Service and practice-area pages",
      "Team and expertise profiles",
      "Case studies and insights",
      "Consultation booking forms",
      "Genuine accreditations and credentials",
      "Resources and downloads",
    ],
    faqs: genericFaqs("professional services"),
    seo: {
      title: "Professional Services Website Design",
      description:
        "Websites for consultants, law firms, accountants and agencies that build credibility and generate enquiries.",
    },
    relatedServiceSlugs: ["custom-website-development", "landing-page-development"],
  },
  {
    name: "SaaS & Business Applications",
    slug: "saas",
    icon: "dashboard",
    showOnHome: true,
    shortDescription:
      "Web applications, dashboards and SaaS products — from internal tools to customer-facing platforms.",
    introduction:
      "Good software disappears into the work. Business applications should make everyday tasks faster, keep data organized and be easy for your team to learn.\n\nApplication case studies are being prepared for this page. In the meantime, get in touch to talk through what you need to build.",
    highlights: [
      "Admin dashboards and reporting",
      "User accounts and role-based access",
      "Content and data management",
      "Workflow and approval tools",
      "Integrations with third-party APIs",
      "Marketing sites for software products",
    ],
    faqs: genericFaqs("software"),
    cta: {
      heading: "Have an application in mind?",
      text: "Describe the workflow you want to improve and I'll help you scope a practical first version.",
      buttonLabel: "Discuss your application",
    },
    seo: {
      title: "SaaS, Dashboard & Web Application Development",
      description:
        "Custom web applications, dashboards and SaaS products — secure, fast and designed around real workflows.",
    },
    relatedServiceSlugs: ["web-application-development", "saas-and-dashboard-development"],
  },
];
