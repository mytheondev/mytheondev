import { GITHUB_USER } from "./site";

export type ProjectStatus = "active" | "archived";

export interface ProjectSource {
  name: string;
  description: string;
  technologies: string[];
  publishedAt: Date;
  liveUrl?: string;
  docsUrl?: string;
  status?: ProjectStatus;
}

export interface Project extends ProjectSource {
  githubUrl: string;
  stars: number;
  version?: string;
}

export interface ProjectLoad {
  projects: Project[];
  unavailable: boolean;
}

const PROJECTS: ProjectSource[] = [
  {
    name: "env-trace",
    description:
      "Lightweight utility for tracking, validating, and debugging environment variable usage across your application.",
    technologies: ["TypeScript", "Node.js"],
    publishedAt: new Date("2026-08-16T15:33:44Z"),
  },
  {
    name: "culqi-nodejs",
    description: "Culqi SDK for Node.js (zero runtime deps).",
    technologies: ["TypeScript", "Node.js"],
    publishedAt: new Date("2025-07-22T12:46:20Z"),
    docsUrl: "https://apidocs.culqi.com",
  },
  {
    name: "tw-animations",
    description: "Extended animation utilities for Tailwind CSS.",
    technologies: ["Astro", "Tailwind CSS"],
    publishedAt: new Date("2025-09-01T03:38:11Z"),
    liveUrl: "https://tailwindcss-animate.vercel.app",
  },
  {
    name: "chrono-ms",
    description:
      "A lightweight, TypeScript-first library for parsing and formatting time durations with human-readable strings.",
    technologies: ["TypeScript"],
    publishedAt: new Date("2025-09-19T03:57:43Z"),
  },
  {
    name: "quick-scripts-runner",
    description: "Execute package.json scripts with automatic package manager detection.",
    technologies: ["TypeScript", "VS Code"],
    publishedAt: new Date("2026-01-11T14:01:05Z"),
    liveUrl: "https://open-vsx.org/extension/alckordev/quick-scripts-runner",
  },
];

const LATEST_COUNT = 4;

interface GitHubRepo {
  html_url: string;
  stargazers_count: number;
}

interface GitHubRelease {
  tag_name?: string;
}

let cached: Promise<ProjectLoad> | undefined;

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mytheon.dev",
  };

  const token = import.meta.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function latestVersion(name: string, headers: HeadersInit) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_USER}/${name}/releases/latest`,
    { headers },
  );
  if (!response.ok) return undefined;
  const release = (await response.json()) as GitHubRelease;
  return release.tag_name || undefined;
}

async function fetchProject(source: ProjectSource, headers: HeadersInit): Promise<Project | null> {
  try {
    const [repoResponse, version] = await Promise.all([
      fetch(`https://api.github.com/repos/${GITHUB_USER}/${source.name}`, { headers }),
      latestVersion(source.name, headers),
    ]);

    if (!repoResponse.ok) {
      console.error(`GitHub ${repoResponse.status} for ${source.name}`);
      return null;
    }

    const repo = (await repoResponse.json()) as GitHubRepo;
    return {
      ...source,
      githubUrl: repo.html_url,
      stars: repo.stargazers_count,
      version,
    };
  } catch (error) {
    console.error(`GitHub fetch failed for ${source.name}`, error);
    return null;
  }
}

async function loadProjects(): Promise<ProjectLoad> {
  const headers = githubHeaders();
  const results = await Promise.all(PROJECTS.map((source) => fetchProject(source, headers)));
  const projects = results
    .filter((project): project is Project => project !== null)
    .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());

  const unavailable = projects.length === 0;
  if (unavailable) {
    console.error("Unable to load projects from GitHub");
  }

  return { projects, unavailable };
}

function projectsLoad() {
  cached ??= loadProjects();
  return cached;
}

export async function getProjects() {
  const { projects } = await projectsLoad();
  return projects;
}

export async function getLatestProjects(count = LATEST_COUNT) {
  const projects = await getProjects();
  return projects.slice(0, count);
}

export async function projectsUnavailable() {
  const { unavailable } = await projectsLoad();
  return unavailable;
}

export function projectTechnologies(projects: Project[]) {
  return [...new Set(projects.flatMap((project) => project.technologies))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function techHref(tech: string) {
  return `/projects/?tech=${encodeURIComponent(tech)}`;
}

export function projectYear(project: Project) {
  return project.publishedAt.getUTCFullYear();
}
