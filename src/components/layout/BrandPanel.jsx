import { BRAND_GREEN } from "../../constants/theme";
import Logo from "./Logo";

const features = [
  "Zero middlemen — full price to the farmer",
  "Live crop prices updated every hour",
  "Direct delivery from farm fields",
  "Verified producers across Karnataka",
];

export default function BrandPanel() {
  return (
    <div
      className="hidden md:flex md:w-1/2 flex-col justify-between p-12 lg:p-16 min-h-screen"
      style={{ background: BRAND_GREEN }}
    >
      {/* Top */}
      <Logo white size="lg" />

      {/* Center */}
      <div className="flex-1 flex flex-col justify-center py-12">
        <h2 className="text-white text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
          Farm-to-fork,<br />
          <span className="text-white/70">direct.</span>
        </h2>
        <p className="text-white/80 text-lg leading-relaxed max-w-sm mb-10">
          Connecting Karnataka's growers with every kitchen — fresh, fair, and fast.
        </p>

        <ul className="flex flex-col gap-4">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "rgba(255,255,255,0.2)" }}
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
              <span className="text-white/85 text-sm">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom */}
      <p className="text-white/40 text-xs">
        © {new Date().getFullYear()} Raithana Swarajya. Made with care in Karnataka.
      </p>
    </div>
  );
}