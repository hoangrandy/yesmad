"use client";

import { FilterTab } from "@/lib/types";

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Roles" },
  { id: "data analyst", label: "Data Analyst" },
  { id: "technical program manager", label: "TPM" },
  { id: "program manager", label: "Program Manager" },
  { id: "business analyst", label: "Business Analyst" },
  { id: "data engineer", label: "Data Engineer" },
  { id: "product manager", label: "Product Manager" },
  { id: "grants manager", label: "Grants Manager" },
  { id: "applied", label: "Applied" },
];

export default function FilterTabs({
  activeTab,
  onTabChange,
  counts,
}: FilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter jobs by role">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          id={`tab-${tab.id.replace(/\s+/g, "-")}`}
          className={`filter-tab ${activeTab === tab.id ? "filter-tab--active" : ""} ${tab.id === "applied" ? "filter-tab--applied" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {counts[tab.id] > 0 && (
            <span className="filter-tab-count">{counts[tab.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
