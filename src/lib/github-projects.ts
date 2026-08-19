export type ProjectStatus = "stable" | "updated";

export interface Project {
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  status: ProjectStatus;
  version?: string;
}

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6",
  JavaScript: "#eab308",
  Go: "#22d3ee",
  Astro: "#cd5c5c",
};

const GITHUB_USER = "mytheondev";
const UPDATED_WITHIN_MS = 60 * 24 * 60 * 60 * 1000;

const FEATURED_REPOS = [
  "env-trace",
  "culqi-nodejs",
  "tw-animations",
  "chrono-ms",
  "quick-scripts-runner",
] as const;

const FALLBACK_PROJECTS: Project[] = [
  {
    name: "env-trace",
    description:
      "Lightweight utility for tracking, validating, and debugging environment variable usage across your application.",
    language: "TypeScript",
    stars: 1,
    url: `https://github.com/${GITHUB_USER}/env-trace`,
    status: "updated",
  },
  {
    name: "culqi-nodejs",
    description: "Culqi SDK for Node.js (zero runtime deps)",
    language: "TypeScript",
    stars: 2,
    url: `https://github.com/${GITHUB_USER}/culqi-nodejs`,
    status: "stable",
  },
  {
    name: "tw-animations",
    description: "Extended animation utilities for Tailwind CSS",
    language: "JavaScript",
    stars: 4,
    url: `https://github.com/${GITHUB_USER}/tw-animations`,
    status: "stable",
  },
  {
    name: "chrono-ms",
    description:
      "A lightweight, TypeScript-first library for parsing and formatting time durations with human-readable strings",
    language: "JavaScript",
    stars: 1,
    url: `https://github.com/${GITHUB_USER}/chrono-ms`,
    status: "stable",
  },
  {
    name: "quick-scripts-runner",
    description: "Execute package.json scripts with automatic package manager detection",
    language: "JavaScript",
    stars: 2,
    url: `https://github.com/${GITHUB_USER}/quick-scripts-runner`,
    status: "stable",
  },
];

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  pushed_at: string;
}

interface GitHubRelease {
  tag_name?: string;
}

function projectStatus(pushedAt?: string): ProjectStatus {
  if (!pushedAt) return "stable";
  return Date.now() - new Date(pushedAt).valueOf() < UPDATED_WITHIN_MS ? "updated" : "stable";
}

function toProject(repo: GitHubRepo, fallback: Project, version?: string): Project {
  return {
    name: repo.name,
    description: repo.description ?? fallback.description,
    language: repo.language ?? fallback.language,
    stars: repo.stargazers_count,
    url: repo.html_url,
    status: projectStatus(repo.pushed_at),
    version,
  };
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

export async function getFeaturedProjects(): Promise<Project[]> {
  const token = import.meta.env.GITHUB_TOKEN as string | undefined;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mytheon.dev",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const results = await Promise.all(
      FEATURED_REPOS.map(async (name, index) => {
        const fallback = FALLBACK_PROJECTS[index] ?? FALLBACK_PROJECTS[0];
        const [repoResponse, version] = await Promise.all([
          fetch(`https://api.github.com/repos/${GITHUB_USER}/${name}`, { headers }),
          latestVersion(name, headers),
        ]);

        if (!repoResponse.ok) {
          throw new Error(`GitHub ${repoResponse.status}`);
        }

        const repo = (await repoResponse.json()) as GitHubRepo;
        return toProject(repo, fallback, version);
      }),
    );

    return results;
  } catch {
    return FALLBACK_PROJECTS;
  }
}
