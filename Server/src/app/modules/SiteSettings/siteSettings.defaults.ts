/*
 * Starting content for the site settings singleton. Everything here is
 * editable in Admin -> Site settings. Contact details are intentionally left
 * empty: they must be your real, public details (see LAUNCH_CHECKLIST.md).
 */

export const DEFAULT_PRIVACY_POLICY = `## Who we are

SH Digital Studio ("we", "us") designs and develops websites and web applications. This policy explains what personal information this website collects and how it is used.

## Information we collect

**When you send an inquiry**, we collect the details you enter in the form: your name, email address, and any optional details you choose to share (business name, phone number, country, website, project description, budget range, preferred launch date and preferred contact method). We also record the page you sent the inquiry from.

**Technical information.** To protect the form from abuse, we store a one-way (hashed) identifier derived from your IP address rather than the address itself. Our hosting providers may keep standard server logs for security and reliability.

We do not ask for, and you should not send, payment card details, passwords or other sensitive information through this website.

## How we use your information

We use inquiry details only to reply to you, discuss your project and keep a record of our conversation. We do not sell your information or use it for unrelated marketing.

## Cookies

This website does not use advertising or analytics cookies. A strictly necessary session cookie is used only when the site owner signs in to the private admin area.

## Embedded and external content

Some project pages link to live demo websites or embed videos (for example from YouTube or Vimeo). Those services have their own privacy policies and may set their own cookies when you choose to open or play them. Videos are only loaded after you press play.

## Service providers

The website and its database are hosted by third-party providers (such as Vercel and MongoDB Atlas) who process data on our behalf to run the service.

## How long we keep information

Inquiries are kept for as long as needed to respond and manage any resulting project, and then deleted or anonymized when no longer needed.

## Your rights

You can ask to see, correct or delete the information we hold about you at any time by contacting us using the details on the contact page.

## Changes

We may update this policy as the website changes. The date at the top of this page shows when it was last updated.`;

export const DEFAULT_TERMS = `## Using this website

This website presents the services and portfolio of SH Digital Studio. By using it you agree to these terms.

## Demo and concept projects

Many projects shown here are **concept demos** created to demonstrate design and development work. Unless a project is explicitly marked as client work, the businesses, menus, prices, reviews, awards and other details shown inside a demo are illustrative and do not describe a real business or a client relationship. Any trademarks or names of real places belong to their respective owners.

## External links

Project pages link to live demo websites and other external sites. We are not responsible for the content or availability of external websites.

## Intellectual property

The design, code and content of this website and of the demo projects remain the property of SH Digital Studio unless agreed otherwise in writing. Please contact us before reusing any part of them.

## No warranty

The information on this website is provided in good faith but without warranty. Project scopes, prices and timelines are only confirmed in a written agreement.

## Contact

Questions about these terms can be sent using the contact page.`;

export const DEFAULT_SITE_SETTINGS = {
  key: "main" as const,
  brand: {
    name: "SH Digital Studio",
    tagline: "Digital experiences built to move businesses forward.",
    description:
      "SH Digital Studio designs and develops distinctive websites, web applications and digital experiences tailored to the way your business works.",
    logoUrl: "",
    logoDarkUrl: "",
  },
  theme: { accent: "#C8F25C" },
  announcement: { enabled: false, text: "", linkLabel: "", linkHref: "" },
  home: {
    heroEyebrow: "Independent design & development studio",
    heroHeadline: "Your next website should move your business forward.",
    heroHighlight: "move your business forward",
    heroSubtext:
      "We design and develop distinctive websites, web applications and digital experiences tailored to the way your business works — from first conversation to launch and beyond.",
    primaryCta: { label: "Explore projects", href: "/work" },
    secondaryCta: { label: "Start a project", href: "/contact" },
    sections: {
      selectedWork: true,
      services: true,
      industries: true,
      process: true,
      capabilities: true,
      about: true,
      finalCta: true,
    },
    selectedWork: {
      heading: "Selected work",
      intro:
        "A selection of recent builds. Every project here is a live site you can open, explore and judge for yourself.",
      projects: [] as string[],
    },
    services: {
      heading: "What we build",
      intro:
        "From a focused landing page to a full web application — always scoped around what your business actually needs.",
      items: [] as string[],
    },
    industries: {
      heading: "Built around your industry",
      intro:
        "Browse demos by industry, or send the page that fits your business straight to your team.",
      items: [] as string[],
    },
    process: {
      heading: "How a project runs",
      intro:
        "A clear, collaborative process with no surprises — you always know what happens next.",
      steps: [
        {
          title: "Discover",
          description:
            "We start with a conversation about your business, your customers and what the website needs to achieve.",
        },
        {
          title: "Define the scope",
          description:
            "Together we agree the pages, features, content and timeline, so everything is clear before work begins.",
        },
        {
          title: "Design & develop",
          description:
            "Your project is designed and built in stages, with live previews you can click through as it takes shape.",
        },
        {
          title: "Review & refine",
          description:
            "You test everything on your own devices. Feedback is gathered in rounds and worked through methodically.",
        },
        {
          title: "Launch & support",
          description:
            "We handle deployment, domains and final checks — then stay available for updates and improvements.",
        },
      ],
    },
    capabilities: {
      heading: "Where craft meets engineering",
      intro:
        "Thoughtful design is only half the job. Every build is engineered to be fast, accessible and easy to maintain.",
      items: [
        {
          title: "Performance first",
          description:
            "Optimized images, lean code and modern hosting keep pages quick on every device.",
          icon: "gauge",
        },
        {
          title: "Responsive by default",
          description:
            "Layouts are designed for phones, tablets and wide screens from the start — not squeezed in afterwards.",
          icon: "devices",
        },
        {
          title: "Search-ready foundations",
          description:
            "Clean URLs, structured metadata and semantic markup help search engines and social platforms understand every page.",
          icon: "search",
        },
        {
          title: "Accessible interfaces",
          description:
            "Readable type, strong contrast and keyboard-friendly navigation, so more people can use what we build.",
          icon: "accessibility",
        },
        {
          title: "Content you control",
          description:
            "When you need it, an admin panel lets your team update text, images and listings without touching code.",
          icon: "layout",
        },
        {
          title: "Modern, maintained stack",
          description:
            "Built with widely used technologies and sensible security practices, so your site is easy to extend.",
          icon: "shield",
        },
      ],
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "Express",
        "MongoDB",
        "Tailwind CSS",
        "Vercel",
        "AWS S3",
      ],
    },
    about: {
      heading: "The developer behind the studio",
      text: "SH Digital Studio is led by Sayedul, a full-stack developer who designs and builds each project personally. You work directly with the person writing your code.",
      ctaLabel: "More about me",
    },
    finalCta: {
      heading: "Have a project in mind?",
      text: "Tell us about your business and what you want to achieve. You'll get a clear, honest reply about how we can help.",
      buttonLabel: "Start a project",
      buttonHref: "/contact",
    },
  },
  navigation: {
    header: [
      { label: "Work", href: "/work", visible: true },
      { label: "Industries", href: "/industries", visible: true },
      { label: "Services", href: "/services", visible: true },
      { label: "About", href: "/about", visible: true },
      { label: "Contact", href: "/contact", visible: true },
    ],
  },
  footer: {
    blurb:
      "An independent studio designing and building websites, web applications and digital products for businesses.",
    showServices: true,
    showIndustries: true,
  },
  contact: {
    email: "",
    phone: "",
    whatsappNumber: "",
    whatsappMessage:
      "Hi SH Digital Studio! I'd like to talk about a website for my business. I was looking at: {page}",
    location: "",
    responseTime: "",
  },
  socialLinks: [] as { platform: string; url: string; label?: string }[],
  seo: {
    titleTemplate: "%s — SH Digital Studio",
    defaultTitle: "SH Digital Studio — Websites & web apps for growing businesses",
    defaultDescription:
      "SH Digital Studio designs and builds fast, distinctive websites and web applications. Explore live demos for restaurants and other industries.",
    defaultOgImage: "",
    twitterHandle: "",
    keywords: [
      "web design studio",
      "website development",
      "restaurant website design",
      "web application development",
      "Next.js developer",
    ],
    googleSiteVerification: "",
  },
  legal: {
    privacyPolicy: DEFAULT_PRIVACY_POLICY,
    terms: DEFAULT_TERMS,
    updatedAt: new Date("2026-10-22T00:00:00.000Z"),
  },
  inquiry: {
    budgetRanges: [
      "Under $1,000",
      "$1,000 – $3,000",
      "$3,000 – $7,500",
      "$7,500 – $15,000",
      "$15,000+",
      "Not sure yet",
    ],
    successMessage:
      "Thank you — your inquiry has been received. We'll review the details and reply using your preferred contact method.",
    notificationEmail: "",
  },
};
