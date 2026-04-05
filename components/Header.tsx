"use client";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <div className="logo-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
              <path
                d="M8 14 C8 10 11 7 14 7 C17 7 19 9 19 9 L15 9 C15 9 14 9 14 11 L14 14"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M14 14 L14 17 C14 19 15 19 15 19 L19 19 C19 19 17 21 14 21 C11 21 8 18 8 14"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="19" cy="14" r="3.5" fill="#fff" fillOpacity="0.95" />
              <circle cx="19" cy="14" r="1.5" fill="url(#logoGrad)" />
              <defs>
                <linearGradient
                  id="logoGrad"
                  x1="0"
                  y1="0"
                  x2="28"
                  y2="28"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#a8a5f0" />
                  <stop offset="1" stopColor="#908ceb" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="header-title">yesmad</h1>
            <p className="header-subtitle">
              Universal ATS job tracker powered by Google Search
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
