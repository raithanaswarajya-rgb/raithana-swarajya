import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { marketplaceApi } from "../lib/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ConsumerHeader from "../components/dashboard/ConsumerHeader";
import MarketplaceFeed from "../components/dashboard/MarketplaceFeed";
import MessagingDrawer from "../components/dashboard/MessagingDrawer";
import GoogleAdBanner from "../components/ui/GoogleAdBanner";
import GoogleAdWidget from "../components/ui/GoogleAdWidget";

export default function ConsumerDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactingId, setContactingId] = useState(null);
  const [showMessages, setShowMessages] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch data feed safely
  const load = useCallback(async () => {
    setLoading(true); 
    setError("");
    try {
      const data = await marketplaceApi.listProducts();
      setProducts(data || []);
    } catch (err) { 
      setError(err.message || "Failed to retrieve live farm harvests."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    void load(); 
  }, [load]);

  // Clean data key filtering to match marketplaceApi fields
  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      // Dynamic fallback handling for standard api payload keys
      const nameKey = product.name || product.crop_name || "";
      const farmerKey = product.farmer || product.farmer_name || "";
      const locationKey = product.location || "";
      
      const matchesQuery = !query || 
        `${nameKey} ${locationKey} ${farmerKey}`.toLowerCase().includes(query);
        
      return matchesCategory && matchesQuery;
    });
  }, [products, searchQuery, selectedCategory]);

  // Intelligently establish communication context layers
  async function contactProducer(product) {
    setContactingId(product.id); 
    setError("");
    try {
      const conversation = await marketplaceApi.startConversation(product.id);
      setConversationId(conversation.id);
      setShowMessages(true);
    } catch (err) { 
      setError(err.message || "Could not spin up contact session with producer."); 
    } finally { 
      setContactingId(null); 
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Structural Header Grid Navigation */}
      <DashboardHeader 
        name={user?.full_name || "Buyer"} 
        roleLabel="Consumer / ಗ್ರಾಹಕ" 
        isDark={isDark} 
        onTheme={toggleTheme} 
        onLogout={logout}
      >
        <button 
          onClick={() => { setConversationId(null); setShowMessages(true); }} 
          className="rounded-xl bg-[#FF7A00] px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 shadow-sm transition-all"
        >
          Messages
        </button>
      </DashboardHeader>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 space-y-8">
        {/* Marketplace Search Filtering Options */}
        <ConsumerHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />
        
        {/* Active Feed List Layout Section */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF7A00] dark:text-orange-400">
              Live market
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Today’s farm harvests
            </h2>
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40">
              <span>{error}</span>
              <button onClick={load} className="font-bold underline ml-4 hover:text-red-900 dark:hover:text-red-100">
                Retry
              </button>
            </div>
          )}

          {/* Marketing Integration Layers */}
          <div className="mb-6 space-y-4">
            <GoogleAdBanner />
            <GoogleAdWidget type="native" label="Native inline" />
          </div>

          {/* Primary Render Grid component */}
          <MarketplaceFeed 
            products={visibleProducts} 
            loading={loading} 
            contactingId={contactingId} 
            onContact={contactProducer} 
          />
        </section>
      </main>

      {/* 
        Key Fix: Passing key={conversationId} forces React to reset 
        the MessagingDrawer when transitioning between different conversations.
      */}
      <MessagingDrawer 
        key={conversationId || "global-drawer"}
        open={showMessages} 
        initialConversationId={conversationId} 
        onClose={() => setShowMessages(false)} 
      />
    </div>
  );
}