/*
 * Service catalog. Prices and timelines are intentionally empty - add only
 * figures you have confirmed (Admin -> Services). "Mobile Application
 * Development" is seeded as a DRAFT: publish it once you confirm you offer it.
 */
import { TProjectType } from "../../app/modules/Project/project.interface";

export type TSeedService = {
  title: string;
  slug: string;
  icon: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  features: { title: string; description: string }[];
  deliverables: string[];
  projectTypes: TProjectType[];
  industrySlugs?: string[];
  relatedProjectSlugs?: string[];
  faqs?: { question: string; answer: string }[];
  status?: "draft" | "published";
  seo: { title: string; description: string };
};

const timelineFaq = {
  question: "How long will my project take?",
  answer:
    "It depends on the number of pages, the features involved and how quickly content is ready. A clear timeline is agreed during scoping, before any work begins — and you'll see progress at every milestone.",
};

const contentFaq = {
  question: "Will I be able to update the content myself?",
  answer:
    "If you need to edit content regularly, a simple admin panel can be included in the scope so you can update text, images and listings without a developer.",
};

export const SEED_SERVICES: TSeedService[] = [
  {
    title: "Custom Website Development",
    slug: "custom-website-development",
    icon: "website",
    shortDescription:
      "Bespoke websites designed around your brand and built for speed, search visibility and enquiries.",
    description:
      "A custom website starts with your business, not a template. We map out what your visitors need to find, how you want them to act and how the site should feel — then design and build it to match.\n\nEvery site is responsive, fast-loading and structured for search engines from day one, with clean, maintainable code that is straightforward to extend as your business grows.",
    benefits: [
      "Designed around your brand, customers and goals",
      "Fast, responsive and search-friendly from day one",
      "Clear calls-to-action that turn visitors into enquiries",
      "Built on modern, maintainable technology",
    ],
    features: [
      { title: "Strategy & sitemap", description: "Pages and user journeys are planned before design starts." },
      { title: "Custom design", description: "A visual identity for your site, not a reskinned template." },
      { title: "Responsive development", description: "Layouts that work beautifully on phones, tablets and desktops." },
      { title: "SEO foundations", description: "Titles, descriptions, social previews, sitemap and clean URLs." },
      { title: "Content management (optional)", description: "An admin panel when you need to update content yourself." },
      { title: "Launch support", description: "Deployment, domain setup and post-launch checks." },
    ],
    deliverables: [
      "Sitemap and page plan",
      "Custom responsive design",
      "Developed and tested website",
      "On-page SEO setup (titles, descriptions, social previews)",
      "Deployment to your domain",
      "Handover walkthrough",
    ],
    projectTypes: ["website"],
    faqs: [timelineFaq, contentFaq],
    seo: {
      title: "Custom Website Development",
      description:
        "Bespoke, fast and search-friendly websites designed around your brand and built with modern, maintainable technology.",
    },
  },
  {
    title: "Website Redesign",
    slug: "website-redesign",
    icon: "redesign",
    shortDescription:
      "Turn an outdated or underperforming site into a modern, fast website that reflects your business today.",
    description:
      "If your current site looks dated, loads slowly or no longer reflects what you offer, a redesign brings it up to date without losing what already works.\n\nWe review your existing site, keep the content and URLs that matter, and rebuild it with a modern design, better structure and faster performance — with redirects in place so existing links keep working.",
    benefits: [
      "A modern look that matches your brand today",
      "Faster pages and a better mobile experience",
      "Clearer structure and messaging",
      "Existing links preserved or redirected where practical",
    ],
    features: [
      { title: "Site review", description: "What works, what doesn't and what visitors actually need." },
      { title: "Content restructure", description: "Clearer navigation and page hierarchy." },
      { title: "New design & build", description: "A modern, responsive rebuild of your site." },
      { title: "Redirect plan", description: "Changed URLs redirect to their new home." },
    ],
    deliverables: [
      "Review of your current website",
      "Updated structure and design",
      "Rebuilt responsive website",
      "Redirect plan for changed URLs",
      "Launch and post-launch checks",
    ],
    projectTypes: ["website"],
    faqs: [timelineFaq],
    seo: {
      title: "Website Redesign",
      description:
        "Modernize an outdated website: new design, better structure, faster performance and redirects that keep existing links working.",
    },
  },
  {
    title: "Restaurant Website Development",
    slug: "restaurant-website-development",
    icon: "restaurant",
    shortDescription:
      "Websites for restaurants, cafés and food businesses that make your menu irresistible and booking effortless.",
    description:
      "Restaurant websites are visited on phones, often minutes before a decision is made. Yours should load instantly, show your food at its best and make booking, ordering or finding you effortless.\n\nThe restaurant demos on this site show the range — from candlelit fine dining to playful burger brands and food trucks. Your site is designed around your venue, your menu and your guests.",
    benefits: [
      "Menus that are easy to browse on a phone",
      "Booking, ordering and enquiry calls-to-action that stand out",
      "Opening hours, location and directions always one tap away",
      "A design that captures the atmosphere of your venue",
    ],
    features: [
      { title: "Menu presentation", description: "Clear, appetizing menus with dietary and allergen details." },
      { title: "Booking & ordering links", description: "Calls-to-action connected to the platforms you use." },
      { title: "Location & hours", description: "Opening hours, map directions and contact details." },
      { title: "Events & private dining", description: "Pages for celebrations, catering and group bookings." },
      { title: "Photo galleries", description: "Fast-loading food and venue photography." },
      { title: "Mobile-first build", description: "Designed for the phone first, then scaled up." },
    ],
    deliverables: [
      "Menu pages designed for easy browsing",
      "Booking, ordering or enquiry calls-to-action",
      "Location, opening hours and directions",
      "Photo galleries",
      "Search and social sharing setup",
      "Launch on your domain",
    ],
    projectTypes: ["website"],
    industrySlugs: ["restaurants"],
    relatedProjectSlugs: [
      "aurum-menu",
      "fizzaria-and-italian",
      "smoke-and-bao",
      "orbit-bowl-bar",
      "crumb-and-kettle",
      "fast-food-qsr",
    ],
    faqs: [
      {
        question: "Can you connect my website to my reservation or delivery platform?",
        answer:
          "Yes — booking and ordering buttons can link to the reservation or delivery service you already use, or we can discuss a custom solution as part of the scope.",
      },
      contentFaq,
    ],
    seo: {
      title: "Restaurant Website Development",
      description:
        "Fast, mobile-first restaurant websites with beautiful menus, booking and ordering calls-to-action, and location details. See live demos.",
    },
  },
  {
    title: "Landing Page Development",
    slug: "landing-page-development",
    icon: "landing",
    shortDescription:
      "Focused, high-converting landing pages for launches, campaigns and lead generation.",
    description:
      "A landing page has a single goal: get the right visitor to take one action. We plan the message, structure and calls-to-action around that goal, then build a fast page that works well with your ads, email or social campaigns.",
    benefits: [
      "One clear message and one clear action",
      "Fast loading for paid and social traffic",
      "Easy to adapt for new campaigns",
      "Built-in social sharing previews",
    ],
    features: [
      { title: "Message & structure", description: "Copy hierarchy planned around a single goal." },
      { title: "Lead capture", description: "Forms and calls-to-action that are easy to complete." },
      { title: "Performance", description: "Lean pages that load quickly on mobile." },
    ],
    deliverables: [
      "Page structure and copy guidance",
      "Responsive landing page",
      "Lead capture form or call-to-action",
      "Social sharing setup",
    ],
    projectTypes: ["website"],
    faqs: [timelineFaq],
    seo: {
      title: "Landing Page Development",
      description:
        "Focused, fast-loading landing pages for product launches, campaigns and lead generation.",
    },
  },
  {
    title: "Web Application Development",
    slug: "web-application-development",
    icon: "webapp",
    shortDescription:
      "Custom web applications that streamline how your business works — from customer portals to internal tools.",
    description:
      "When spreadsheets and off-the-shelf tools stop fitting the way you work, a custom web application can. We start from your real workflow, define a focused first version and build it with secure authentication, validated data and an interface your team will actually enjoy using.",
    benefits: [
      "Built around your real workflow",
      "Secure accounts and role-based access",
      "Clean, maintainable codebase you own",
      "A focused first version you can grow over time",
    ],
    features: [
      { title: "Workflow mapping", description: "We define users, roles and the key tasks first." },
      { title: "Secure authentication", description: "Hashed passwords, protected sessions and authorization." },
      { title: "Data management", description: "Validated forms, search, filters and reporting." },
      { title: "Admin dashboards", description: "Manage content, users and records in one place." },
    ],
    deliverables: [
      "Requirements and scope document",
      "Interface design for key screens",
      "Developed and tested application",
      "Deployment and environment setup",
      "Handover documentation",
    ],
    projectTypes: ["web-app", "saas"],
    industrySlugs: ["saas"],
    faqs: [timelineFaq],
    seo: {
      title: "Web Application Development",
      description:
        "Custom web applications, customer portals and internal tools built around your workflow with secure, maintainable code.",
    },
  },
  {
    title: "SaaS & Dashboard Development",
    slug: "saas-and-dashboard-development",
    icon: "dashboard",
    shortDescription:
      "Admin dashboards, reporting tools and SaaS platforms with secure accounts and clear, usable interfaces.",
    description:
      "Dashboards and SaaS products live or die on clarity. We design interfaces that surface the right information, keep common tasks fast and scale as your data and users grow — backed by a well-structured API and database.",
    benefits: [
      "Clear, usable interfaces for data-heavy work",
      "Role-based access and secure sessions",
      "Structured APIs that are easy to extend",
      "Performance that holds up as data grows",
    ],
    features: [
      { title: "Dashboards & reporting", description: "Key metrics and records at a glance." },
      { title: "User management", description: "Accounts, roles and permissions." },
      { title: "APIs & integrations", description: "Connect to the services you already use." },
    ],
    deliverables: [
      "Product scope and user roles",
      "Dashboard and key screen designs",
      "Developed application and API",
      "Deployment and handover",
    ],
    projectTypes: ["saas", "web-app"],
    industrySlugs: ["saas"],
    faqs: [timelineFaq],
    seo: {
      title: "SaaS & Dashboard Development",
      description:
        "Admin dashboards, reporting tools and SaaS platforms with secure accounts, clear interfaces and scalable APIs.",
    },
  },
  {
    title: "Mobile Application Development",
    slug: "mobile-application-development",
    icon: "mobile",
    status: "draft",
    shortDescription: "Mobile apps planned around real user workflows.",
    description:
      "Draft service - review the scope you offer for mobile applications, then publish this page from Admin -> Services.",
    benefits: [],
    features: [],
    deliverables: [],
    projectTypes: ["mobile-app"],
    seo: {
      title: "Mobile Application Development",
      description: "Mobile applications planned around real user workflows.",
    },
  },
  {
    title: "E-commerce Development",
    slug: "ecommerce-development",
    icon: "ecommerce",
    shortDescription:
      "Online stores with clear product presentation, easy search and smooth checkout journeys.",
    description:
      "An online store has to build trust quickly and remove friction everywhere. We focus on clear product pages, fast search and filtering, and a checkout journey with as few steps as possible — integrated with the payment provider that suits your business.",
    benefits: [
      "Product pages that sell",
      "Fast search and filtering",
      "Short, clear checkout journeys",
      "Integrations with established payment providers",
    ],
    features: [
      { title: "Catalog & collections", description: "Organized products and promotions." },
      { title: "Search & filters", description: "Help customers find the right product quickly." },
      { title: "Checkout", description: "A streamlined path from cart to confirmation." },
    ],
    deliverables: [
      "Store structure and catalog plan",
      "Responsive storefront design",
      "Developed and tested store",
      "Payment provider integration",
      "Launch support",
    ],
    projectTypes: ["website", "web-app"],
    industrySlugs: ["ecommerce"],
    faqs: [timelineFaq, contentFaq],
    seo: {
      title: "E-commerce Development",
      description:
        "Online stores with clear product presentation, fast search and streamlined checkout journeys.",
    },
  },
  {
    title: "Booking & Inquiry Systems",
    slug: "booking-and-inquiry-systems",
    icon: "booking",
    shortDescription:
      "Booking requests, enquiry forms and lead management that make sure no opportunity slips through.",
    description:
      "Every missed enquiry is a missed customer. We build booking request flows and enquiry forms that are quick to complete on a phone, protected against spam, and backed by a simple dashboard where you can track every lead from first message to confirmed booking.",
    benefits: [
      "Forms that are quick to complete on mobile",
      "Spam protection without annoying your customers",
      "Every enquiry stored and easy to follow up",
      "Optional e-mail notifications",
    ],
    features: [
      { title: "Smart forms", description: "Only the questions you need, with helpful validation." },
      { title: "Lead dashboard", description: "Statuses, notes and filters for every enquiry." },
      { title: "Notifications", description: "E-mail alerts when a new enquiry arrives." },
    ],
    deliverables: [
      "Form and booking flow design",
      "Developed forms with spam protection",
      "Lead management dashboard",
      "E-mail notification setup",
    ],
    projectTypes: ["website", "web-app"],
    industrySlugs: ["restaurants", "gyms", "beauty", "travel", "photography"],
    faqs: [timelineFaq],
    seo: {
      title: "Booking & Inquiry Systems",
      description:
        "Booking request flows, enquiry forms and lead dashboards that capture and organize every opportunity.",
    },
  },
  {
    title: "Website Maintenance & Optimization",
    slug: "website-maintenance-and-optimization",
    icon: "maintenance",
    shortDescription:
      "Keep your website fast, secure and up to date with ongoing care and performance improvements.",
    description:
      "A website is never really finished. Ongoing maintenance keeps dependencies updated, fixes issues before visitors notice them and gradually improves speed, accessibility and search visibility.",
    benefits: [
      "Updates and fixes handled for you",
      "Faster pages over time",
      "Accessibility and SEO improvements",
      "A developer who already knows your site",
    ],
    features: [
      { title: "Updates & monitoring", description: "Dependencies and hosting kept current." },
      { title: "Performance tuning", description: "Images, code and caching improvements." },
      { title: "Content changes", description: "Help with new pages and updates." },
    ],
    deliverables: [
      "Initial site health review",
      "Agreed maintenance tasks",
      "Performance and accessibility improvements",
      "Regular update summary",
    ],
    projectTypes: ["website", "web-app"],
    faqs: [
      {
        question: "Can you maintain a website you didn't build?",
        answer:
          "Often, yes. We start with a review of the existing site and its hosting, then agree what can be maintained and improved.",
      },
    ],
    seo: {
      title: "Website Maintenance & Optimization",
      description:
        "Ongoing website care: updates, fixes, performance tuning, accessibility and SEO improvements.",
    },
  },
];
