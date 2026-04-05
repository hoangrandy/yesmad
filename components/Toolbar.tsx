"use client";

import { SortOption, AtsDomain, ATS_PLATFORMS } from "@/lib/types";

interface ToolbarProps {
  onSearch: () => void;
  isSearching: boolean;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onExport: () => void;
  hasJobs: boolean;
  activeAts: AtsDomain;
  onAtsChange: (ats: AtsDomain) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "company_asc", label: "Company A→Z" },
  { value: "company_desc", label: "Company Z→A" },
  { value: "title_asc", label: "Title A→Z" },
  { value: "role_type", label: "Role Type" },
  { value: "applied_first", label: "Applied First" },
  { value: "newest_first", label: "Newest First" },
  { value: "oldest_first", label: "Oldest First" },
];

export default function Toolbar({
  onSearch,
  isSearching,
  sortOption,
  onSortChange,
  onExport,
  hasJobs,
  activeAts,
  onAtsChange,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <button
        id="btn-search-jobs"
        className={`btn btn--primary ${isSearching ? "btn--loading" : ""}`}
        onClick={onSearch}
        disabled={isSearching}
        aria-busy={isSearching}
      >
        {isSearching ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Searching…
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 11L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Search Jobs
          </>
        )}
      </button>

      <div className="toolbar-right">
        <div className="select-wrapper">
          <label htmlFor="ats-select" className="sr-only">
            ATS Platform
          </label>
          <select
            id="ats-select"
            className="select"
            value={activeAts}
            onChange={(e) => onAtsChange(e.target.value as AtsDomain)}
          >
            <option value="all">All ATS Networks</option>
            {ATS_PLATFORMS.map((opt) => (
              <option key={opt.domain} value={opt.domain}>
                {opt.name}
              </option>
            ))}
          </select>
          <svg className="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="select-wrapper">
          <label htmlFor="sort-select" className="sr-only">
            Sort jobs
          </label>
          <select
            id="sort-select"
            className="select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="select-arrow"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          id="btn-export-csv"
          className="btn btn--secondary"
          onClick={onExport}
          disabled={!hasJobs}
          title="Export to Excel"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 2v8M5 7l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Export Excel
        </button>
      </div>
    </div>
  );
}
