export const SITE_URL = "https://mytheon.dev";
export const SITE_TITLE = "Mytheon — Full Stack Engineer";
export const SITE_DESCRIPTION =
  "Full Stack Engineer with 10+ years designing scalable systems. Explore projects, experience, and NestJS writing by Mytheon.";
export const SITE_NAME = "Mytheon";
export const SITE_EMAIL = "hola@mytheon.dev";
export const GITHUB_USER = "mytheondev";
export const GITHUB_URL = "https://github.com/mytheondev";
export const LINKEDIN_URL = "https://www.linkedin.com/in/mytheon";

export const NAV_ITEMS = [
  { id: "about", label: "about", command: "$ about" },
  { id: "projects", label: "projects", command: "$ projects" },
  { id: "experience", label: "experience", command: "$ experience" },
  { id: "github", label: "github", command: "$ github" },
  { id: "blog", label: "blog", command: "$ blog" },
  { id: "contact", label: "contact", command: "$ contact" },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]["id"];
