import { useEffect, useMemo, useState } from "react";

export default function GoogleAdWidget({
  type = "banner",
  className = "",
  label = "Sponsored",
  rewardDescription = "Earn a reward for watching this ad.",
  onRewardComplete,
}) {
  const rawAppId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT?.trim();
  const rawBannerSlot = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT?.trim();
  const rawNativeInlineSlot = import.meta.env.VITE_GOOGLE_ADSENSE_NATIVE_INLINE_SLOT?.trim();
  const rawRewardedSlot = import.meta.env.VITE_GOOGLE_ADSENSE_REWARDED_SLOT?.trim();

  // Normalize appId so both AdMob-style and AdSense-style values work perfectly
  const appId = useMemo(() => {
    if (!rawAppId) return undefined;
    let id = rawAppId;
    if (id.includes("~")) id = id.split("~")[0];
    id = id.replace("ca-app-pub-", "ca-pub-");
    if (!id.startsWith("ca-pub-")) {
      console.warn("Unexpected Ad client id format:", rawAppId);
    }
    return id;
  }, [rawAppId]);

  const normalizeSlot = (s) => {
    if (!s) return undefined;
    if (s.includes("/")) return s.split("/").pop();
    return s;
  };

  const bannerSlot = useMemo(() => normalizeSlot(rawBannerSlot), [rawBannerSlot]);
  const nativeInlineSlot = useMemo(() => normalizeSlot(rawNativeInlineSlot), [rawNativeInlineSlot]);
  const rewardedSlot = useMemo(() => normalizeSlot(rawRewardedSlot), [rawRewardedSlot]);
  
  const [loaded, setLoaded] = useState(false);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  const slotId = useMemo(() => {
    if (type === "native") return nativeInlineSlot;
    if (type === "rewarded") return rewardedSlot;
    return bannerSlot;
  }, [bannerSlot, nativeInlineSlot, rewardedSlot, type]);

  useEffect(() => {
    if (!appId || !slotId) {
      setLoaded(false);
      return;
    }

    // 1. Inject script tag globally if it doesn't exist yet
    const scriptId = "adsbygoogle-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${appId}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // 2. Core Fix: Push the initialization object specifically for THIS instance slot container
    let isMounted = true;
    const checkAndPush = () => {
      if (window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          if (isMounted) setLoaded(true);
        } catch (error) {
          console.warn("Google Ads instance registration delayed:", error.message || error);
        }
        return true;
      }
      return false;
    };

    // Run immediately if window object is ready, otherwise start interval polling
    if (!checkAndPush()) {
      const interval = window.setInterval(() => {
        if (checkAndPush()) {
          window.clearInterval(interval);
        }
      }, 200);

      return () => {
        isMounted = false;
        window.clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [appId, slotId]);

  // Fallback HUD when parameters are missing or incorrect
  if (!appId || !slotId) {
    return (
      <div className={`rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-200 ${className}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">{label}</p>
        <p className="mt-1 font-semibold">Local market spotlight</p>
        <p className="mt-1 text-xs opacity-80">Provide configuration key variables to enable ad delivery loops.</p>
      </div>
    );
  }

  if (type === "native") {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors ${className}`}>
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label} • Native</p>
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center" }}
          data-ad-client={appId}
          data-ad-slot={slotId}
          data-ad-format="autorelaxed"
        />
        {!loaded && <p className="mt-2 text-xs text-slate-400 animate-pulse">Loading native feed asset…</p>}
      </div>
    );
  }

  if (type === "rewarded") {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200 transition-all ${className}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{label} • Rewarded</p>
        <p className="mt-1 font-semibold">{rewardDescription}</p>
        
        <div className="my-2 min-h-[60px] relative">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={appId}
            data-ad-slot={slotId}
            data-ad-format="rewarded"
          />
          {!loaded && <p className="text-xs opacity-75 animate-pulse">Connecting to reward ad pool…</p>}
        </div>

        <button
          type="button"
          onClick={() => {
            setRewardUnlocked(true);
            onRewardComplete?.();
          }}
          className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-xs"
        >
          {rewardUnlocked ? "✓ Reward unlocked" : "Claim reward tip"}
        </button>
        
        {rewardUnlocked && (
          <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-t border-emerald-200/60 dark:border-emerald-900/40 pt-2 animate-in slide-in-from-top-2">
            💡 Reward unlocked — seasonal regional tip updated on dashboard parameters!
          </p>
        )}
      </div>
    );
  }

  // Fallback to standard banner rendering framework configuration
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors ${className}`}>
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label} • Banner</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={appId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {!loaded && <p className="mt-2 text-xs text-slate-400 animate-pulse">Loading ad banner framing…</p>}
    </div>
  );
}