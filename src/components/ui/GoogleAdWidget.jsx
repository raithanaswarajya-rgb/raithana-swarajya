import { useEffect, useMemo, useRef, useState } from "react";

const ADSENSE_SCRIPT_ID = "adsbygoogle-script";

function normalizeClientId(value) {
  const clientId = value?.trim();
  if (!clientId) return undefined;

  if (/^ca-pub-\d+$/.test(clientId)) return clientId;

  console.warn(
    "Google AdSense requires a web publisher id like ca-pub-1234567890."
  );
  return undefined;
}

function normalizeSlot(value) {
  const slot = value?.trim();
  if (!slot) return undefined;

  const lastSegment = slot.includes("/") ? slot.split("/").pop() : slot;
  return /^\d+$/.test(lastSegment) ? lastSegment : undefined;
}

function ensureAdsenseScript(clientId, onReady, onError) {
  const existing = document.getElementById(ADSENSE_SCRIPT_ID);

  if (existing) {
    if (existing.dataset.loaded === "true") {
      onReady();
      return () => {};
    }

    existing.addEventListener("load", onReady);
    existing.addEventListener("error", onError);

    return () => {
      existing.removeEventListener("load", onReady);
      existing.removeEventListener("error", onError);
    };
  }

  window.adsbygoogle = window.adsbygoogle || [];

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.addEventListener("load", () => {
    script.dataset.loaded = "true";
    onReady();
  });
  script.addEventListener("error", onError);
  document.head.appendChild(script);

  return () => {
    script.removeEventListener("load", onReady);
    script.removeEventListener("error", onError);
  };
}

export default function GoogleAdWidget({
  type = "banner",
  className = "",
  label = "Sponsored",
  rewardDescription = "Unlock a seasonal market tip.",
  onRewardComplete,
}) {
  const adRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  const clientId = useMemo(
    () => normalizeClientId(import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT),
    []
  );

  const bannerSlot = useMemo(
    () => normalizeSlot(import.meta.env.VITE_GOOGLE_ADSENSE_SLOT),
    []
  );
  const nativeSlot = useMemo(
    () => normalizeSlot(import.meta.env.VITE_GOOGLE_ADSENSE_NATIVE_INLINE_SLOT),
    []
  );

  const slotId = type === "native" ? nativeSlot : bannerSlot;
  const isNative = type === "native";
  const isRewarded = type === "rewarded";

  useEffect(() => {
    if (!clientId || !slotId || isRewarded) {
      setStatus("idle");
      return undefined;
    }

    let cancelled = false;

    const renderAd = () => {
      if (cancelled || !adRef.current) return;

      if (adRef.current.dataset.adsbygoogleStatus === "done") {
        setStatus("loaded");
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setStatus("loaded");
      } catch (error) {
        console.warn("Google AdSense slot registration failed:", error);
        setStatus("error");
      }
    };

    setStatus("loading");
    const cleanup = ensureAdsenseScript(
      clientId,
      renderAd,
      () => !cancelled && setStatus("error")
    );

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [clientId, isRewarded, slotId]);

  if (!clientId || !slotId) {
    return (
      <div className={`rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200 ${className}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">{label}</p>
        <p className="mt-1 font-semibold">Local market spotlight</p>
        <p className="mt-1 text-xs opacity-80">Add valid Vercel AdSense variables to enable live ads.</p>
      </div>
    );
  }

  if (isRewarded) {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm transition-all dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200 ${className}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{label}</p>
        <p className="mt-1 font-semibold">{rewardDescription}</p>
        <p className="mt-2 text-xs opacity-75">Web AdSense does not support this rewarded-ad format directly, so this card keeps the reward flow separate from ad delivery.</p>
        <button
          type="button"
          onClick={() => {
            setRewardUnlocked(true);
            onRewardComplete?.();
          }}
          className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
        >
          {rewardUnlocked ? "Reward unlocked" : "Unlock market tip"}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {label} - {isNative ? "Native" : "Banner"}
      </p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={isNative ? "fluid" : "auto"}
        data-ad-layout={isNative ? "in-article" : undefined}
        data-full-width-responsive={isNative ? undefined : "true"}
      />
      {status === "loading" && (
        <p className="mt-2 text-xs text-slate-400">Loading ad slot...</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-slate-400">Ad slot unavailable.</p>
      )}
    </div>
  );
}
