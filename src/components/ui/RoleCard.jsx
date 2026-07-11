import { ROLE_CONFIG } from "../../constants/theme";

const ProducerIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="26" fill="#dcfce7" />
    <path
      d="M26 12 C22 19 15 21 15 28 C15 33.5 20 38 26 38 C32 38 37 33.5 37 28 C37 21 30 19 26 12Z"
      fill="#00B761"
      opacity="0.25"
    />
    <path
      d="M26 14 C26 14 19 22 19 28 C19 31.9 22.1 35 26 35 C29.9 35 33 31.9 33 28 C33 22 26 14 26 14Z"
      fill="#00B761"
    />
    <line x1="22" y1="40" x2="30" y2="40" stroke="#00B761" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="38" x2="26" y2="42" stroke="#00B761" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ConsumerIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="26" fill="#fff7ed" />
    <circle cx="20" cy="39" r="3" fill="#FF7A00" />
    <circle cx="33" cy="39" r="3" fill="#FF7A00" />
    <path
      d="M13 15 L18 15 L22 33 L31 33 L36 21 L19 21"
      stroke="#FF7A00"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 26 L27 26 M27 23 L27 30"
      stroke="#FF7A00"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const icons = { producer: <ProducerIcon />, consumer: <ConsumerIcon /> };

export default function RoleCard({ id, title, desc, selected, onSelect }) {
  const isActive = selected === id;
  const cfg = ROLE_CONFIG[id];

  return (
    <button
      onClick={() => onSelect(id)}
      className="rounded-3xl p-7 text-left cursor-pointer focus:outline-none w-full"
      style={{
        background: isActive ? cfg.bgTint : "white",
        border: isActive ? `2.5px solid ${cfg.color}` : "2px solid #e2e8f0",
        transform: isActive ? "scale(1.02)" : "scale(1)",
        boxShadow: isActive ? `0 8px 24px ${cfg.ringColor}` : "none",
        transition: "all 0.2s ease-out",
      }}
      aria-pressed={isActive}
    >
      <div className="mb-4">{icons[id]}</div>
      <h3
        className="font-bold text-xl mb-2 transition-colors duration-200"
        style={{ color: isActive ? cfg.color : "#1e293b" }}
      >
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
        {desc}
      </p>
    </button>
  );
}