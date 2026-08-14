export interface Project {
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
}

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6",
  JavaScript: "#eab308",
  Go: "#22d3ee",
};

const GITHUB_USER = "mytheondev";

const FEATURED_REPOS = [
  "culqi-nodejs",
  "tw-animations",
  "chrono-ms",
  "quick-scripts-runner",
] as const;

const FALLBACK_PROJECTS: Project[] = [
  {
    name: "culqi-nodejs",
    description: "Culqi SDK for Node.js (zero runtime deps)",
    language: "TypeScript",
    stars: 2,
    url: `https://github.com/${GITHUB_USER}/culqi-nodejs`,
  },
  {
    name: "tw-animations",
    description: "Extended animation utilities for Tailwind CSS",
    language: "JavaScript",
    stars: 4,
    url: `https://github.com/${GITHUB_USER}/tw-animations`,
  },
  {
    name: "chrono-ms",
    description:
      "A lightweight, TypeScript-first library for parsing and formatting time durations with human-readable strings",
    language: "JavaScript",
    stars: 1,
    url: `https://github.com/${GITHUB_USER}/chrono-ms`,
  },
  {
    name: "quick-scripts-runner",
    description: "Execute package.json scripts with automatic package manager detection",
    language: "JavaScript",
    stars: 2,
    url: `https://github.com/${GITHUB_USER}/quick-scripts-runner`,
  },
];

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
}

function toProject(repo: GitHubRepo, fallback: Project): Project {
  return {
    name: repo.name,
    description: repo.description ?? fallback.description,
    language: repo.language ?? fallback.language,
    stars: repo.stargazers_count,
    url: repo.html_url,
  };
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
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${name}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error(`GitHub ${response.status}`);
        }

        const repo = (await response.json()) as GitHubRepo;
        return toProject(repo, FALLBACK_PROJECTS[index]);
      }),
    );

    return results;
  } catch {
    return FALLBACK_PROJECTS;
  }
}
