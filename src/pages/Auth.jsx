import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useSupabaseAuth } from "../hooks/Usesupabaseauth";
import { ROLE_CONFIG, COPY } from "../constants/theme";
import Logo from "../components/layout/Logo";
import FloatingInput from "../components/ui/FloatingInput";
import BrandButton from "../components/ui/BrandButton";
import VerificationModal from "../components/ui/verificationModal";

export default function Auth() {
  // Core Fix: Destructure onboardingData from your unified wizard context engine
  const { onboardingData } = useOnboarding();
  const { signUp, signIn, loading, error, setError } = useSupabaseAuth();
  const navigate = useNavigate();

  // Safeguard values against undefined configurations
  const currentLang = onboardingData?.language || "en";
  const currentRole = onboardingData?.role || "consumer";

  const [isLogin, setIsLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const copy = COPY[currentLang];
  const cfg = onboardingData?.role ? ROLE_CONFIG[currentRole] : ROLE_CONFIG.consumer;
  const accentColor = cfg.color;

  function updateField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (error) setError(null);
  }

  async function handleSubmit() {
    if (isLogin) {
      const result = await signIn({ email: form.email, password: form.password });
      if (result.success) {
        navigate("/dashboard", { replace: true });
      }
    } else {
      const result = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.name,
        language: currentLang,
        role: currentRole,
      });
      if (result.success) {
        setShowModal(true);
      }
    }
  }

  function handleModalDismiss() {
    setShowModal(false);
    setIsLogin(true);
    setForm({ name: "", email: "", password: "" });
  }

  const submitLabel = isLogin
    ? loading ? copy.signingIn : copy.signInArrow
    : loading ? copy.creatingAccount : copy.createAccountArrow;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      {showModal && (
        <VerificationModal
          accentColor={accentColor}
          onDismiss={handleModalDismiss}
        />
      )}

      <div className="w-full max-w-md animate-slide-up">
        {/* Workspace Layout Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-slate-800 dark:text-slate-100 text-2xl font-bold mt-2">
            {isLogin ? copy.welcomeBack : copy.createAccount}
          </h2>
          {onboardingData?.role && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {copy.joiningAs}{" "}
              <span className="font-semibold" style={{ color: accentColor }}>
                {cfg.label}
              </span>
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-100 dark:border-zinc-800 shadow-sm transition-colors">
          {/* Tab Selection Matrix Switcher Layout */}
          <div className="flex mb-6 rounded-xl p-1 bg-slate-100 dark:bg-zinc-800">
            {[
              { label: copy.signUp, login: false },
              { label: copy.logIn, login: true }
            ].map(({ label, login }) => {
              const isActive = isLogin === login;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setIsLogin(login);
                    setError(null);
                  }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? (document.documentElement.classList.contains('dark') ? '#27272a' : 'white') : "transparent",
                    color: isActive ? accentColor : "#64748b",
                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Core Entry Form Input Fields */}
          <div className="flex flex-col gap-4 mb-5">
            {!isLogin && (
              <FloatingInput
                id="name"
                label={copy.fullName}
                type="text"
                value={form.name}
                onChange={(v) => updateField("name", v)}
                accentColor={accentColor}
                autoComplete="name"
              />
            )}
            <FloatingInput
              id="email"
              label={copy.emailAddress}
              type="email"
              value={form.email}
              onChange={(v) => updateField("email", v)}
              accentColor={accentColor}
              autoComplete="email"
            />
            <FloatingInput
              id="password"
              label={isLogin ? copy.password : copy.createPassword}
              type="password"
              value={form.password}
              onChange={(v) => updateField("password", v)}
              accentColor={accentColor}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {/* Interactive Error Feedback Dialog Component */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40">
              <p className="text-red-600 dark:text-red-400 text-xs font-semibold">⚠️ {error}</p>
            </div>
          )}

          {/* Secure Operations Verification Control Trigger */}
          <BrandButton
            onClick={handleSubmit}
            loading={loading}
            color={accentColor}
          >
            {submitLabel}
          </BrandButton>

          {!isLogin && (
            <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed">
              {copy.terms}
            </p>
          )}

          {isLogin && (
            <p className="text-center text-xs mt-4">
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium hover:underline transition-colors">
                {copy.forgotPassword}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}