"use client";

import { useState, useRef, useEffect } from "react";
import { Job, RoleType } from "@/lib/types";

interface JobCardProps {
  job: Job;
  isApplied: boolean;
  appliedDate: string | undefined;
  note: string;
  onToggleApplied: (jobId: string) => void;
  onSaveNote: (jobId: string, note: string) => void;
}

const ROLE_COLORS: Record<RoleType, string> = {
  "data analyst": "tag--blue",
  "technical program manager": "tag--purple",
  "business analyst": "tag--orange",
  "data engineer": "tag--teal",
  "product manager": "tag--blue", // Assuming blue or create new CSS class if needed
  "grants manager": "tag--purple",
};

const ROLE_LABELS: Record<RoleType, string> = {
  "data analyst": "Data Analyst",
  "technical program manager": "TPM",
  "business analyst": "Biz Analyst",
  "data engineer": "Data Engineer",
  "product manager": "Product Manager",
  "grants manager": "Grants Manager",
};

function formatDate(dateStr: string | null, fetchedAt: string): string {
  if (dateStr) return dateStr;
  const d = new Date(fetchedAt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobCard({
  job,
  isApplied,
  appliedDate,
  note,
  onToggleApplied,
  onSaveNote,
}: JobCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(note);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNoteText(note);
  }, [note]);

  useEffect(() => {
    if (showNotes && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showNotes]);

  function handleSaveNote() {
    onSaveNote(job.id, noteText);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasNote = note.trim().length > 0;

  return (
    <article
      className={`job-card ${isApplied ? "job-card--applied" : ""}`}
      id={`job-${job.id}`}
      aria-label={`${job.title} at ${job.company}`}
    >
      <div className="job-card-main">
        <div className="job-card-info">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="job-title-link"
            id={`link-${job.id}`}
          >
            {job.title}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className="external-icon"
            >
              <path
                d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M8 2h2v2M10 2L5.5 6.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <div className="job-company">
            <span className="company-name">{job.company}</span>
            <span style={{opacity: 0.5, margin: "0 6px"}}>·</span>
            <span className="ats-source" style={{color: "var(--foreground-muted)"}}>{job.atsName || "Greenhouse"}</span>
            {isApplied && appliedDate && (
              <>
                <span style={{opacity: 0.5, margin: "0 6px"}}>·</span>
                <span className="applied-date">Applied {appliedDate}</span>
              </>
            )}
          </div>
          <div className="job-date">
            {formatDate(job.date_posted, job.fetchedAt)}
          </div>
          <div className="job-tags">
            <span className={`tag ${ROLE_COLORS[job.role_type]}`}>
              {ROLE_LABELS[job.role_type]}
            </span>
            <span className="tag tag--remote">Remote</span>
            {isApplied && <span className="tag tag--applied-badge">✓ Applied</span>}
          </div>
        </div>

        <div className="job-card-actions">
          <button
            id={`btn-apply-${job.id}`}
            className={`btn-action ${isApplied ? "btn-action--applied" : "btn-action--mark"}`}
            onClick={() => onToggleApplied(job.id)}
            aria-pressed={isApplied}
            title={isApplied ? "Mark as not applied" : "Mark as applied"}
          >
            {isApplied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Applied
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Mark Applied
              </>
            )}
          </button>

          <button
            id={`btn-notes-${job.id}`}
            className={`btn-action btn-action--notes ${showNotes ? "btn-action--notes-open" : ""} ${hasNote ? "btn-action--has-note" : ""}`}
            onClick={() => setShowNotes((v) => !v)}
            aria-expanded={showNotes}
            title="Toggle notes"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 5h5M4.5 7.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              {hasNote && <circle cx="11" cy="3" r="2" fill="#22c55e" />}
            </svg>
            Notes
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="notes-panel" id={`notes-panel-${job.id}`}>
          <textarea
            ref={textareaRef}
            className="notes-textarea"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Interview stage, contacts, thoughts…"
            rows={3}
            aria-label={`Notes for ${job.title}`}
          />
          <div className="notes-footer">
            <button
              id={`btn-save-note-${job.id}`}
              className="btn btn--save"
              onClick={handleSaveNote}
            >
              {saved ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Saved
                </>
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
