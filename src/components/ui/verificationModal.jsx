export default function VerificationModal({ accentColor, onDismiss }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-slide-up">
        {/* Mail icon with check */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: `${accentColor}14` }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect
              x="4"
              y="11"
              width="36"
              height="24"
              rx="4"
              stroke={accentColor}
              strokeWidth="2"
            />
            <path
              d="M4 16 L22 27 L40 16"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Check circle overlay */}
            <circle cx="34" cy="34" r="9" fill={accentColor} />
            <path
              d="M30 34 L33 37 L38 30"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-2">
          Verification Sent!
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
          We sent a secure handshake link to your email. Click it to unlock
          your profile dashboard before logging in.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm"
          style={{ background: accentColor }}
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}