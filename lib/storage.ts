import { Job, AppliedMap, AppliedDatesMap, NotesMap } from "./types";

const KEYS = {
  JOBS: "gh_jobs",
  APPLIED: "gh_applied",
  APPLIED_DATES: "gh_appliedDates",
  NOTES: "gh_notes",
  LAST_SEARCHED: "gh_lastSearched",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function getJobs(): Job[] {
  return safeGet<Job[]>(KEYS.JOBS, []);
}

export function setJobs(jobs: Job[]): void {
  safeSet(KEYS.JOBS, jobs);
}

export function getApplied(): AppliedMap {
  return safeGet<AppliedMap>(KEYS.APPLIED, {});
}

export function setApplied(applied: AppliedMap): void {
  safeSet(KEYS.APPLIED, applied);
}

export function getAppliedDates(): AppliedDatesMap {
  return safeGet<AppliedDatesMap>(KEYS.APPLIED_DATES, {});
}

export function setAppliedDates(dates: AppliedDatesMap): void {
  safeSet(KEYS.APPLIED_DATES, dates);
}

export function getNotes(): NotesMap {
  return safeGet<NotesMap>(KEYS.NOTES, {});
}

export function setNotes(notes: NotesMap): void {
  safeSet(KEYS.NOTES, notes);
}

export function getLastSearched(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.LAST_SEARCHED);
}

export function setLastSearched(iso: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.LAST_SEARCHED, iso);
}
