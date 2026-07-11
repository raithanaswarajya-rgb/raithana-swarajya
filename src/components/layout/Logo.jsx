import { BRAND_GREEN } from "../../constants/theme";

export default function Logo({ white = false, size = "md" }) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
  return (
    <div className="flex flex-col items-start">
      <span
        className={`font-extrabold leading-tight ${sizes[size]}`}
        style={{ color: white ? "white" : BRAND_GREEN }}
      >
        Raithana Swarajya
      </span>
      <span
        className="text-xs tracking-widest uppercase font-semibold mt-0.5"
        style={{ color: white ? "rgba(255,255,255,0.6)" : "#64748b" }}
      >
        ರೈತನ ಸ್ವರಾಜ್ಯ
      </span>
    </div>
  );
}