type BrainBrandProps = {
  compact?: boolean;
  showTagline?: boolean;
  subtitle?: string;
};

export function BrainBrand({
  compact = false,
  showTagline = false,
  subtitle = "Managed AI devices",
}: BrainBrandProps) {
  return (
    <span
      className={`brain-brand-lockup ${compact ? "brain-brand-lockup-compact" : ""}`}
      translate="no"
    >
      <span className="brain-brand-mark" aria-hidden="true">
        <svg
          className="brain-brand-mark-svg"
          viewBox="0 0 92 92"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="brainBrandCircuit" x1="18" x2="78" y1="10" y2="82">
              <stop offset="0%" stopColor="#24c7ff" />
              <stop offset="60%" stopColor="#4b6bff" />
              <stop offset="100%" stopColor="#b941ff" />
            </linearGradient>
            <linearGradient id="brainBrandChip" x1="30" x2="62" y1="30" y2="62">
              <stop offset="0%" stopColor="#0d1730" />
              <stop offset="100%" stopColor="#172754" />
            </linearGradient>
          </defs>

          <path
            d="M43 12C35 12 29 16 26 22C18 23 12 30 12 39C12 44 14 49 18 53C16 57 15 60 15 64C15 76 25 84 37 84C49 84 57 76 57 64V28C57 19 51 12 43 12Z"
            fill="#0d1730"
          />
          <path
            d="M35 24C29 24 25 28 24 34"
            fill="none"
            stroke="#f8fbff"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
          <path
            d="M28 50C34 50 39 45 39 39"
            fill="none"
            stroke="#f8fbff"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
          <path
            d="M29 67C35 65 39 59 39 53"
            fill="none"
            stroke="#f8fbff"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
          <path
            d="M49 15C62 15 73 25 73 38C79 42 82 49 82 56C82 71 70 82 56 82"
            fill="none"
            stroke="url(#brainBrandCircuit)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.5"
          />
          <path
            d="M50 29H63L70 22"
            fill="none"
            stroke="url(#brainBrandCircuit)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <path
            d="M50 43H70"
            fill="none"
            stroke="url(#brainBrandCircuit)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <path
            d="M50 57H63L72 65"
            fill="none"
            stroke="url(#brainBrandCircuit)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <path
            d="M50 70H59L66 77"
            fill="none"
            stroke="url(#brainBrandCircuit)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <circle cx="70" cy="22" fill="#ffffff" r="4.8" stroke="url(#brainBrandCircuit)" strokeWidth="3" />
          <circle cx="72" cy="43" fill="#ffffff" r="4.8" stroke="url(#brainBrandCircuit)" strokeWidth="3" />
          <circle cx="72" cy="65" fill="#ffffff" r="4.8" stroke="url(#brainBrandCircuit)" strokeWidth="3" />
          <circle cx="66" cy="77" fill="#ffffff" r="4.8" stroke="url(#brainBrandCircuit)" strokeWidth="3" />
          <rect
            x="31"
            y="31"
            width="30"
            height="30"
            rx="9"
            fill="url(#brainBrandChip)"
            stroke="url(#brainBrandCircuit)"
            strokeWidth="3"
          />
          <text
            x="46"
            y="51"
            fill="#ffffff"
            fontFamily="Manrope, Arial, sans-serif"
            fontSize="13"
            fontWeight="800"
            textAnchor="middle"
          >
            AI
          </text>
        </svg>
      </span>

      <span className="brain-brand-text-block">
        <span className="brain-brand-wordmark notranslate">
          <span className="brain-brand-word brain-brand-word-dark">br</span>
          <span className="brain-brand-word brain-brand-word-accent-a">A</span>
          <span className="brain-brand-word brain-brand-word-accent-i">I</span>
          <span className="brain-brand-word brain-brand-word-dark">n</span>
        </span>
        <span className="brain-brand-subtitle">{subtitle}</span>
        {showTagline ? (
          <span className="brain-brand-tagline">Your business brain. Powered by AI.</span>
        ) : null}
      </span>
    </span>
  );
}
