export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionsResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

export const HEATMAP_API_URL = "https://github-contributions-api.jogruber.de/v4/mytheondev?y=last";

export const HEATMAP_LEVEL_OPACITY = [0, 0.15, 0.35, 0.6, 1] as const;

export function filterLastSixMonths(
  contributions: ContributionDay[],
  now = new Date(),
): ContributionDay[] {
  const start = new Date(now);
  start.setMonth(start.getMonth() - 6);
  start.setHours(0, 0, 0, 0);

  return contributions.filter((day) => new Date(day.date) >= start);
}

export function sumContributions(days: ContributionDay[]): number {
  return days.reduce((total, day) => total + day.count, 0);
}

export function bestStreak(days: ContributionDay[]): number {
  let current = 0;
  let best = 0;

  for (const day of days) {
    if (day.count > 0) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

export function weeksFromDays(days: ContributionDay[]): ContributionDay[][] {
  if (days.length === 0) {
    return [];
  }

  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];

  const first = new Date(`${days[0].date}T00:00:00`);
  const pad = first.getDay();

  for (let i = 0; i < pad; i += 1) {
    week.push({ date: "", count: 0, level: 0 });
  }

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ date: "", count: 0, level: 0 });
    }
    weeks.push(week);
  }

  return weeks;
}
