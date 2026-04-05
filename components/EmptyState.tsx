"use client";

interface EmptyStateProps {
  hasJobs: boolean;
  isFiltered: boolean;
  filterName: string;
  onSearch: () => void;
  isSearching: boolean;
}

export default function EmptyState({
  hasJobs,
  isFiltered,
  filterName,
  onSearch,
  isSearching,
}: EmptyStateProps) {
  if (!hasJobs) {
    return (
      <div className="empty-state" id="empty-state-no-jobs">
        <div className="empty-state-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="rgba(34,197,94,0.08)" />
            <circle
              cx="26"
              cy="25"
              r="11"
              stroke="#22c55e"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
            <path
              d="M34 33l7 7"
              stroke="#22c55e"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
            <path
              d="M22 25h8M26 21v8"
              stroke="#22c55e"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
        <h2 className="empty-state-title">No jobs loaded yet</h2>
        <p className="empty-state-desc">
          Click <strong>Search Jobs</strong> to fetch remote roles from{" "}
          <span className="mono">boards.greenhouse.io</span>
        </p>
        <button
          id="btn-empty-search"
          className={`btn btn--primary ${isSearching ? "btn--loading" : ""}`}
          onClick={onSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Searching…
            </>
          ) : (
            "Search Jobs Now"
          )}
        </button>
      </div>
    );
  }

  if (isFiltered) {
    return (
      <div className="empty-state" id="empty-state-filtered">
        <div className="empty-state-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="rgba(34,197,94,0.08)" />
            <path
              d="M18 20h20M21 28h14M24 36h8"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
          </svg>
        </div>
        <h2 className="empty-state-title">No {filterName} jobs</h2>
        <p className="empty-state-desc">
          No jobs match this filter in the current result set. Try a different
          tab or run a new search.
        </p>
      </div>
    );
  }

  return null;
}
