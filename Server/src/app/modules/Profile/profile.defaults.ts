/*
 * Starting profile content. Only facts that are evidenced by your own code
 * are included (the technologies used across this repository and your demo
 * projects). Experience, education, certifications and testimonials are left
 * empty on purpose - add your real details in Admin -> Profile.
 */

export const DEFAULT_BIO = `I'm Sayedul, the developer behind SH Digital Studio. I design and build websites and web applications for businesses that want a stronger presence online — from restaurant sites that make it easy to browse a menu and book a table, to dashboards that keep day-to-day operations organized.

I work across the full stack with React, Next.js, Node.js and MongoDB. The person shaping your interface is the same person building the system behind it, so decisions about design, performance and functionality are made together rather than handed between teams.

Every project starts with understanding how your business actually works. The goal is never just a good-looking page — it's a site your customers find easy to use and you find easy to maintain.`;

const skill = (name: string, category: string, description?: string) => ({
  name,
  category,
  description,
});

export const DEFAULT_PROFILE = {
  key: "main" as const,
  name: "Sayedul",
  title: "Full-stack developer & founder of SH Digital Studio",
  shortIntro:
    "I design and build websites and web applications for businesses — pairing considered design with solid engineering.",
  bio: DEFAULT_BIO,
  location: "",
  availabilityStatus: "available" as const,
  availabilityNote: "Taking on new projects",
  specializations: [
    "Business & restaurant websites",
    "Web applications & dashboards",
    "Next.js & React front-ends",
    "Node.js & MongoDB back-ends",
    "Content management systems",
  ],
  workingArrangements: [
    "Remote collaboration with clients in any time zone",
    "Fixed-scope projects with clear milestones",
    "Ongoing support and improvements after launch",
  ],
  skillCategories: [
    "Frontend development",
    "Backend development",
    "Databases",
    "API development",
    "UI implementation",
    "Deployment & infrastructure",
    "Code quality",
  ],
  skills: [
    skill("React", "Frontend development"),
    skill("Next.js", "Frontend development", "App Router, server rendering and static generation"),
    skill("TypeScript", "Frontend development"),
    skill("JavaScript", "Frontend development"),
    skill("TanStack Query", "Frontend development", "Server-state caching and data fetching"),
    skill("Zustand", "Frontend development", "Lightweight client state"),
    skill("React Hook Form", "Frontend development"),
    skill("Node.js", "Backend development"),
    skill("Express", "Backend development"),
    skill("MongoDB", "Databases"),
    skill("Mongoose", "Databases", "Schemas, validation and indexes"),
    skill("REST API design", "API development"),
    skill("Zod validation", "API development", "Request and form validation"),
    skill("JWT authentication", "API development"),
    skill("Tailwind CSS", "UI implementation"),
    skill("Ant Design", "UI implementation", "Admin dashboards and data tables"),
    skill("Responsive layouts", "UI implementation"),
    skill("Vercel", "Deployment & infrastructure"),
    skill("AWS S3 & CloudFront", "Deployment & infrastructure", "Media storage and delivery"),
    skill("ESLint & Prettier", "Code quality"),
  ],
  experience: [],
  education: [],
  capabilities: [
    {
      title: "Problem-solving",
      description:
        "Breaking a business requirement down into a clear technical plan before writing code.",
    },
    {
      title: "Maintainable code",
      description:
        "Consistent structure, typed code and sensible abstractions that are easy to extend later.",
    },
    {
      title: "Responsive development",
      description: "Interfaces that adapt properly to phones, tablets and large screens.",
    },
    {
      title: "Clear communication",
      description:
        "Plain-language updates, honest timelines and quick answers to your questions.",
    },
  ],
  workingProcess: [
    {
      title: "Direct communication",
      description:
        "You have a direct line to me throughout the project, with regular updates at every milestone.",
    },
    {
      title: "Requirements in writing",
      description:
        "Before development starts, we agree the scope in writing — pages, features, content responsibilities and timeline.",
    },
    {
      title: "Milestones you can click",
      description:
        "Work is delivered in milestones with live previews, so you review real progress rather than screenshots.",
    },
    {
      title: "Structured revisions",
      description:
        "Feedback is collected in agreed rounds, which keeps the project focused and on schedule.",
    },
    {
      title: "Proper handover",
      description:
        "At launch you receive access to your accounts, a walkthrough of managing content and documentation where relevant.",
    },
  ],
  certifications: [],
  testimonials: [],
  featuredProjects: [] as string[],
  resumeUrl: "",
  seo: {
    title: "About Sayedul — the developer behind SH Digital Studio",
    description:
      "Meet Sayedul, the full-stack developer behind SH Digital Studio: skills, working process and selected projects.",
  },
};
