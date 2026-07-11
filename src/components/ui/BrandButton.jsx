export default function BrandButton({
  onClick,
  disabled = false,
  loading = false,
  color,
  children,
  fullWidth = true,
  size = "md",
}) {
  const sizes = {
    sm: "py-2.5 text-sm",
    md: "py-4 text-sm",
    lg: "py-5 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${fullWidth ? "w-full" : ""} ${sizes[size]} rounded-2xl text-white font-bold tracking-wide flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2`}
      style={{
        background: disabled && !loading ? "#d1d5db" : color,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.88 : 1,
        transition: "opacity 0.2s, transform 0.1s",
        focusVisibleRingColor: color,
      }}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
            <path
              d="M12 2 a10 10 0 0 1 10 10"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}