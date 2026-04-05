export type RoleType =
  | "data analyst"
  | "technical program manager"
  | "program manager"
  | "business analyst"
  | "data engineer"
  | "product manager"
  | "grants manager";

export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  role_type: RoleType;
  date_posted: string | null;
  fetchedAt: string;
  atsName: string;
}

export const ATS_PLATFORMS = [
  { name: "Greenhouse", domain: "boards.greenhouse.io" },
  { name: "Lever", domain: "jobs.lever.co" },
  { name: "SmartRecruiters", domain: "jobs.smartrecruiters.com" },
  { name: "Workday", domain: "wd1.myworkdayjobs.com" },
  { name: "iCIMS", domain: "careers.icims.com" },
  { name: "BambooHR", domain: "bamboohr.com" },
  { name: "JazzHR", domain: "applytojob.com" },
];

export type AtsDomain = typeof ATS_PLATFORMS[number]["domain"] | "all";

export interface AppliedMap {
  [jobId: string]: boolean;
}

export interface AppliedDatesMap {
  [jobId: string]: string;
}

export interface NotesMap {
  [jobId: string]: string;
}

export type FilterTab =
  | "all"
  | "data analyst"
  | "technical program manager"
  | "program manager"
  | "business analyst"
  | "data engineer"
  | "product manager"
  | "grants manager"
  | "applied";

export type SortOption =
  | "default"
  | "company_asc"
  | "company_desc"
  | "title_asc"
  | "role_type"
  | "applied_first"
  | "newest_first"
  | "oldest_first";

export interface SearchResult {
  jobs: Job[];
  searchedAt: string;
  error?: string;
}
