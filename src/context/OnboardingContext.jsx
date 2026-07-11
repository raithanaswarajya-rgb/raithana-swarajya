import { createContext, useContext, useState, useCallback } from "react";

const OnboardingContext = createContext(null);

/**
 * OnboardingProvider: Manages the localized configuration parameters
 * (Language selection and User Type role) chosen during the onboarding wizard
 * before account creation.
 */
export function OnboardingProvider({ children }) {
  const [onboardingData, setOnboardingData] = useState({
    language: null, // "en" | "kn" | "hi"
    role: null,     // "producer" | "consumer"
  });

  // Consolidated updater function to minimize unnecessary child re-renders
  const updateOnboardingStep = useCallback((key, value) => {
    setOnboardingData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Structural method to clear steps if a user backs out or resets the wizard
  const resetOnboarding = useCallback(() => {
    setOnboardingData({
      language: null,
      role: null,
    });
  }, []);

  return (
    <OnboardingContext.Provider 
      value={{ 
        onboardingData, 
        updateOnboardingStep, 
        resetOnboarding 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an active OnboardingProvider instance.");
  }
  return ctx;
}