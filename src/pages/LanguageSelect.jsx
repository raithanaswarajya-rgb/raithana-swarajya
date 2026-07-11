import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { BRAND_ORANGE, LANGUAGE_CONFIG, COPY } from "../constants/theme";
import BrandPanel from "../components/layout/BrandPanel";
import LanguageCard from "../components/ui/LanguageCard";
import BrandButton from "../components/ui/BrandButton";
import GoogleAdBanner from "../components/ui/GoogleAdBanner";

export default function LanguageSelect() {
  // Grab unified step updater function from upgraded context configuration
  const { onboardingData, updateOnboardingStep } = useOnboarding();
  
  // Initialize dynamic state using existing selection if returning to this page
  const [selected, setSelected] = useState(onboardingData?.language || null);
  const navigate = useNavigate();
  
  // Fallback to English dynamic layout properties if no selection layer is live
  const copy = COPY[selected || "en"];

  function handleContinue() {
    if (!selected) return;
    
    // Core Fix: Invoking unified state mapper to persist selection parameter values
    updateOnboardingStep("language", selected);
    navigate("/user-type");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Brand Visual Identity Display Wing */}
      <BrandPanel />

      {/* Right interaction panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo (hidden on md+) */}
          <div className="md:hidden mb-8 text-center">
            <span className="font-extrabold text-xl text-brand-green">
              Raithana Swarajya
            </span>
          </div>

          <h2 className="text-slate-800 dark:text-slate-100 text-2xl font-bold mb-1">
            {copy.chooseLanguageTitle}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {copy.chooseLanguageSubtitle}
          </p>

          {/* Render Language Option Matrix Layout */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {Object.entries(LANGUAGE_CONFIG).map(([id, cfg]) => (
              <LanguageCard
                key={id}
                id={id}
                label={cfg.label}
                selected={selected}
                onSelect={setSelected}
              />
            ))}
          </div>

          {/* CTA Validation Submission Control */}
          <BrandButton
            onClick={handleContinue}
            disabled={!selected}
            color={BRAND_ORANGE}
          >
            {copy.continue}
          </BrandButton>

          {/* Integrated Monetization Banner Overlay Placement */}
          <div className="mt-6">
            <GoogleAdBanner />
          </div>
        </div>
      </div>
    </div>
  );
}