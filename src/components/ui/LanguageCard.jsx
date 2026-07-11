import { BRAND_GREEN } from "../../constants/theme";

export default function LanguageCard({ id, label, sub, selected, onSelect }) {
  const isActive = selected === id;

  return (
    <button
      onClick={() => onSelect(id)}
      className="relative flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer select-none focus:outline-none"
      style={{
        border: isActive ? `3px solid ${BRAND_GREEN}` : "2px solid #e2e8f0",
        background: isActive ? "#f0fdf4" : "white",
        transform: isActive ? "scale(1.04)" : "scale(1)",
        boxShadow: isActive ? `0 0 0 4px ${BRAND_GREEN}22` : "none",
        transition: "all 0.2s ease-out",
      }}
      aria-pressed={isActive}
    >
      {/* Checkmark badge */}
      {isActive && (
        <span
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center animate-fade-in"
          style={{ background: BRAND_GREEN }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
        {label}
      </span>
    </button>
  );
}