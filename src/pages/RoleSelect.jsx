import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { ROLE_CONFIG, COPY } from "../constants/theme";
import Logo from "../components/layout/Logo";
import RoleCard from "../components/ui/RoleCard";
import BrandButton from "../components/ui/BrandButton";

export default function RoleSelect() {
  // Grab the unified state object and updater hook from updated context configuration
  const { onboardingData, updateOnboardingStep } = useOnboarding();
  
  // Safeguard against missing language parameter variables
  const currentLang = onboardingData?.language || "en";
  
  // Read existing role selection configuration parameters if navigating backwards
  const [selected, setSelected] = useState(onboardingData?.role || null);
  const navigate = useNavigate();
  
  const copy = COPY[currentLang];

  const roleTitles = {
    en: { producer: "Producer", consumer: "Consumer" },
    kn: { producer: "ರೈತ", consumer: "ಗ್ರಾಹಕ" },
    hi: { producer: "किसान", consumer: "उपभोक्ता" },
  };

  const roles = [
    {
      id: "producer",
      title: roleTitles[currentLang].producer,
      desc: copy.producerDesc,
    },
    {
      id: "consumer",
      title: roleTitles[currentLang].consumer,
      desc: copy.consumerDesc,
    },
  ];

  function handleContinue() {
    if (!selected) return;
    
    // Core Fix: Invoking unified step updater parameter values
    updateOnboardingStep("role", selected);
    navigate("/auth");
  }

  const cfg = selected ? ROLE_CONFIG[selected] : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="mb-10">
        <Logo />
      </div>

      <div className="animate-slide-up w-full max-w-2xl">
        <h2 className="text-slate-800 dark:text-slate-100 text-3xl font-bold text-center mb-2">
          {copy.whoAreYou}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 text-center">
          {copy.roleSubtitle}
        </p>

        {/* Dynamic Role Mapping Matrix Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {roles.map((r) => (
            <RoleCard
              key={r.id}
              id={r.id}
              title={r.title}
              desc={r.desc}
              selected={selected}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* CTA Interactivity Buttons */}
        <BrandButton
          onClick={handleContinue}
          disabled={!selected}
          color={cfg ? cfg.color : "#d1d5db"}
        >
          {selected
            ? `${copy.continueAs} ${
                selected === "producer" 
                  ? roleTitles[currentLang].producer 
                  : roleTitles[currentLang].consumer
              } →`
            : copy.selectRole}
        </BrandButton>
      </div>
    </div>
  );
}