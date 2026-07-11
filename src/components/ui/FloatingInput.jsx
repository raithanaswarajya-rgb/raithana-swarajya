import { useState } from "react";

export default function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  accentColor,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isLifted = focused || hasValue;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="absolute pointer-events-none font-medium select-none"
        style={{
          left: "14px",
          top: isLifted ? "7px" : "50%",
          transform: isLifted ? "none" : "translateY(-50%)",
          fontSize: isLifted ? "11px" : "14px",
          color: focused ? accentColor : "#94a3b8",
          transition: "all 0.15s ease-out",
          zIndex: 1,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl border bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
        style={{
          padding: "22px 14px 8px",
          borderColor: focused ? accentColor : "#e2e8f0",
          boxShadow: focused ? `0 0 0 3px ${accentColor}18` : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      />
    </div>
  );
}