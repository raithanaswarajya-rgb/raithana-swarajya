import GoogleAdWidget from "./GoogleAdWidget";

export default function GoogleAdBanner({ className = "" }) {
  return <GoogleAdWidget className={className} label="Sponsored" type="banner" />;
}
