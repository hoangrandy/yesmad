"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import FilterTabs from "@/components/FilterTabs";
import Toolbar from "@/components/Toolbar";
import StatsBar from "@/components/StatsBar";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";
import {
  Job,
  FilterTab,
  SortOption,
  AppliedMap,
  AppliedDatesMap,
  NotesMap,
  AtsDomain,
} from "@/lib/types";
import {
  getJobs,
  setJobs,
  getApplied,
  setApplied,
  getAppliedDates,
  setAppliedDates,
  getNotes,
  setNotes,
  getLastSearched,
  setLastSearched,
} from "@/lib/storage";
import * as XLSX from "xlsx";

const FILTER_LABELS: Record<FilterTab, string> = {
  all: "All Roles",
  "data analyst": "Data Analyst",
  "technical program manager": "TPM",
  "program manager": "Program Manager",
  "business analyst": "Business Analyst",
  "data engineer": "Data Engineer",
  "product manager": "Product Manager",
  "grants manager": "Grants Manager",
  applied: "Applied",
};

function sortJobs(
  jobs: Job[],
  sort: SortOption,
  applied: AppliedMap
): Job[] {
  const copy = [...jobs];
  return copy.sort((a, b) => {
    // Unconditionally pin new jobs to the top
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;

    switch (sort) {
      case "company_asc":
        return a.company.localeCompare(b.company);
      case "company_desc":
        return b.company.localeCompare(a.company);
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "role_type":
        return a.role_type.localeCompare(b.role_type);
      case "applied_first": {
        const aA = applied[a.id] ? 1 : 0;
        const bA = applied[b.id] ? 1 : 0;
        return bA - aA;
      }
      case "newest_first":
        return new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime();
      case "oldest_first":
        return new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime();
      default:
        return 0;
    }
  });
}

function filterJobs(
  jobs: Job[],
  tab: FilterTab,
  applied: AppliedMap
): Job[] {
  if (tab === "applied") return jobs.filter((j) => applied[j.id]);
  
  // For all other tabs, exclude jobs that have been applied to
  const unappliedJobs = jobs.filter((j) => !applied[j.id]);
  
  if (tab === "all") return unappliedJobs;
  return unappliedJobs.filter((j) => j.role_type === tab);
}

export default function HomePage() {
  const [jobs, setJobsState] = useState<Job[]>([]);
  const [appliedMap, setAppliedMap] = useState<AppliedMap>({});
  const [appliedDatesMap, setAppliedDatesMap] = useState<AppliedDatesMap>({});
  const [notesMap, setNotesMap] = useState<NotesMap>({});
  const [lastSearched, setLastSearchedState] = useState<string | null>(null);
  const [thisSearchCount, setThisSearchCount] = useState(0);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [activeAts, setActiveAts] = useState<AtsDomain>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setJobsState(getJobs());
    setAppliedMap(getApplied());
    setAppliedDatesMap(getAppliedDates());
    setNotesMap(getNotes());
    setLastSearchedState(getLastSearched());
  }, []);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/search", { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Search failed");
      }
      
      const freshJobs: Job[] = data.jobs;
      const freshJobIds = new Set(freshJobs.map((j) => j.id));
      const previousJobIds = new Set(jobs.map((j) => j.id));
      
      const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
      const nowMs = new Date().getTime();

      const processedFreshJobs = freshJobs.map(j => ({
        ...j,
        isNew: !previousJobIds.has(j.id)
      }));

      // Accumulation: Preserve previously fetched jobs, prune if > 14 days old and not applied
      const retainedJobs = jobs.filter((j) => {
         if (freshJobIds.has(j.id)) return false; // Let the fresh version take precedence
         if (appliedMap[j.id]) return true; // Never prune applied jobs
         const fetchMs = new Date(j.fetchedAt).getTime();
         return (nowMs - fetchMs) < FOURTEEN_DAYS_MS;
      }).map(j => ({ ...j, isNew: false })); // Remove "new" flag from jobs seen in a previous search
      
      const newJobs = [...processedFreshJobs, ...retainedJobs];
      
      setJobsState(newJobs);
      setJobs(newJobs);
      setThisSearchCount(freshJobs.length);
      setLastSearchedState(data.searchedAt);
      setLastSearched(data.searchedAt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsSearching(false);
    }
  }, [jobs, appliedMap, activeAts]);

  const handleToggleApplied = useCallback(
    (jobId: string) => {
      const newApplied = { ...appliedMap };
      const newDates = { ...appliedDatesMap };
      if (newApplied[jobId]) {
        delete newApplied[jobId];
        delete newDates[jobId];
      } else {
        newApplied[jobId] = true;
        newDates[jobId] = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      setAppliedMap(newApplied);
      setApplied(newApplied);
      setAppliedDatesMap(newDates);
      setAppliedDates(newDates);
    },
    [appliedMap, appliedDatesMap]
  );

  const handleSaveNote = useCallback(
    (jobId: string, note: string) => {
      const newNotes = { ...notesMap, [jobId]: note };
      setNotesMap(newNotes);
      setNotes(newNotes);
    },
    [notesMap]
  );

  const handleExport = useCallback(() => {
    if (jobs.length === 0) return;
    const header = [
      "Title",
      "Company",
      "Role Type",
      "ATS Platform",
      "Date Posted",
      "Applied",
      "Applied Date",
      "Notes",
      "URL",
    ];

    const generateRows = (jobList: Job[]) => {
      return jobList.map((job) => [
        job.title,
        job.company,
        job.role_type,
        job.atsName || "Unknown",
        job.date_posted || "",
        appliedMap[job.id] ? "Yes" : "No",
        appliedDatesMap[job.id] || "",
        (notesMap[job.id] || "").replace(/\n/g, " "),
        job.url,
      ]);
    };

    const addHyperlinks = (ws: any, rowCount: number) => {
      for (let r = 1; r < rowCount; r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c: 8 }); // Column I
        if (ws[cellAddress]) {
          ws[cellAddress].l = { Target: ws[cellAddress].v };
        }
      }
    };

    const wb = XLSX.utils.book_new();

    // Sheet 1: All Jobs
    const allRows = [header, ...generateRows(jobs)];
    const wsAll = XLSX.utils.aoa_to_sheet(allRows);
    addHyperlinks(wsAll, allRows.length);
    XLSX.utils.book_append_sheet(wb, wsAll, "All Jobs");

    // Separate sheets by Position (Role Type)
    const positions = Array.from(new Set(jobs.map((j) => j.role_type || "Unknown")));
    for (const pos of positions) {
      const posJobs = jobs.filter((j) => (j.role_type || "Unknown") === pos);
      if (posJobs.length > 0) {
        const posRows = [header, ...generateRows(posJobs)];
        const wsPos = XLSX.utils.aoa_to_sheet(posRows);
        addHyperlinks(wsPos, posRows.length);
        const sheetName = pos.substring(0, 31).replace(/[\\/*?:\[\]]/g, "");
        XLSX.utils.book_append_sheet(wb, wsPos, sheetName);
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.style.display = "none";
    a.setAttribute("href", url);
    a.setAttribute("download", `greenhouse_jobs_${today}.xlsx`);
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }, [jobs, appliedMap, appliedDatesMap, notesMap]);

  // Compute derived state
  const networkFilteredJobs = activeAts === "all" ? jobs : jobs.filter(j => j.url.includes(activeAts));
  const sortedJobs = sortJobs(networkFilteredJobs, sortOption, appliedMap);
  const filteredJobs = filterJobs(sortedJobs, activeTab, appliedMap);
  const appliedCount = networkFilteredJobs.filter(j => appliedMap[j.id]).length;

  const unappliedJobsCount = networkFilteredJobs.filter((j) => !appliedMap[j.id]).length;
  const tabCounts: Record<FilterTab, number> = {
    all: unappliedJobsCount,
    "data analyst": networkFilteredJobs.filter((j) => j.role_type === "data analyst" && !appliedMap[j.id]).length,
    "technical program manager": networkFilteredJobs.filter(
      (j) => j.role_type === "technical program manager" && !appliedMap[j.id]
    ).length,
    "program manager": networkFilteredJobs.filter((j) => j.role_type === "program manager" && !appliedMap[j.id]).length,
    "business analyst": networkFilteredJobs.filter(
      (j) => j.role_type === "business analyst" && !appliedMap[j.id]
    ).length,
    "data engineer": networkFilteredJobs.filter((j) => j.role_type === "data engineer" && !appliedMap[j.id]).length,
    "product manager": networkFilteredJobs.filter((j) => j.role_type === "product manager" && !appliedMap[j.id]).length,
    "grants manager": networkFilteredJobs.filter((j) => j.role_type === "grants manager" && !appliedMap[j.id]).length,
    applied: appliedCount,
  };

  return (
    <div className="page">
      <Header />

      <main className="main" id="main-content">
        {errorMsg && (
          <div className="error-banner" role="alert" id="search-error-banner">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="#f87171"
                strokeWidth="1.5"
              />
              <path
                d="M8 5v3.5M8 10.5v.5"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>{errorMsg}</span>
            <button
              className="error-dismiss"
              onClick={() => setErrorMsg(null)}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <StatsBar
          totalFound={jobs.length}
          appliedCount={appliedCount}
          thisSearchCount={thisSearchCount}
          lastSearched={lastSearched}
        />

        <FilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />

        <Toolbar
          onSearch={handleSearch}
          isSearching={isSearching}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onExport={handleExport}
          hasJobs={jobs.length > 0}
          activeAts={activeAts}
          onAtsChange={setActiveAts}
        />

        <section className="jobs-list" aria-label="Job listings">
          {filteredJobs.length === 0 ? (
            <EmptyState
              hasJobs={jobs.length > 0}
              isFiltered={activeTab !== "all"}
              filterName={FILTER_LABELS[activeTab]}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isApplied={!!appliedMap[job.id]}
                appliedDate={appliedDatesMap[job.id]}
                note={notesMap[job.id] || ""}
                onToggleApplied={handleToggleApplied}
                onSaveNote={handleSaveNote}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
