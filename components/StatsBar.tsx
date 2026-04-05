"use client";

interface StatsBarProps {
  totalFound: number;
  appliedCount: number;
  thisSearchCount: number;
  lastSearched: string | null;
}

function formatTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function StatsBar({
  totalFound,
  appliedCount,
  thisSearchCount,
  lastSearched,
}: StatsBarProps) {
  return (
    <div className="stats-bar" role="status" aria-live="polite">
      <div className="stat">
        <span className="stat-value">{totalFound}</span>
        <span className="stat-label">Total Found</span>
      </div>
      <div className="stat-divider" aria-hidden="true" />
      <div className="stat">
        <span className="stat-value stat-value--green">{appliedCount}</span>
        <span className="stat-label">Applied</span>
      </div>
      <div className="stat-divider" aria-hidden="true" />
      <div className="stat">
        <span className="stat-value">{thisSearchCount}</span>
        <span className="stat-label">This Search</span>
      </div>
      <div className="stat-divider" aria-hidden="true" />
      <div className="stat">
        <span className="stat-value stat-value--dim">
          {formatTime(lastSearched)}
        </span>
        <span className="stat-label">Last Searched</span>
      </div>
    </div>
  );
}
