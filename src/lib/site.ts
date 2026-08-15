export const SITE_URL = "https://www.mytheon.dev";
export const SITE_TITLE = "Mytheon — Software Engineer";
export const SITE_DESCRIPTION =
  "Software Engineer with 10+ years building APIs and web apps. NestJS, Go, Vue, TypeScript — projects, experience, and production notes.";
export const SITE_NAME = "Mytheon";
export const SITE_EMAIL = "hola@mytheon.dev";
export const GITHUB_USER = "mytheondev";
export const GITHUB_URL = "https://github.com/mytheondev";
export const LINKEDIN_URL = "https://www.linkedin.com/in/mytheon";
export const INSTAGRAM_URL = "https://www.instagram.com/mytheon.dev";

export const NAV_ITEMS = [
  { id: "about", label: "about", command: "$ about" },
  { id: "projects", label: "projects", command: "$ projects" },
  { id: "experience", label: "experience", command: "$ experience" },
  { id: "github", label: "github", command: "$ github" },
  { id: "blog", label: "blog", command: "$ blog" },
  { id: "contact", label: "contact", command: "$ contact" },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]["id"];

export function navHref(id: NavItemId, home: boolean) {
  if (id === "blog") return "/blog/";
  return home ? `#${id}` : `/#${id}`;
}
