import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { marketplaceApi } from "../lib/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ProducerMetrics from "../components/dashboard/ProducerMetrics";
import InventoryList from "../components/dashboard/InventoryList";
import AddHarvestModal from "../components/dashboard/AddHarvestModal";
import EditHarvestModal from "../components/dashboard/EditHarvestModal";
import MessagingDrawer from "../components/dashboard/MessagingDrawer";
import GoogleAdBanner from "../components/ui/GoogleAdBanner";
import GoogleAdWidget from "../components/ui/GoogleAdWidget";

export default function ProducerDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal/Overlay Layer Management States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showMessages, setShowMessages] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  // Load inventory from database backend API
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const productData = await marketplaceApi.listProducts({ mine: true });
      setProducts(productData || []);
    } catch (err) {
      setError(err.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Handle adding new crop harvest securely
  async function addHarvest(payload, imageFile) {
    setActionLoading(true);
    setError("");
    try {
      const imageUrl = imageFile ? await marketplaceApi.uploadProductImage(imageFile) : null;
      const created = await marketplaceApi.createProduct({ ...payload, image_url: imageUrl });
      setProducts((current) => [created, ...current]);
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || "Could not publish harvest listing.");
    } finally {
      setActionLoading(false);
    }
  }

  // Handle saving modified details (price, quantity, text details, and fresh photo assets)
  async function handleUpdateListing(productId, updatedFields, optionalNewImageFile) {
    setActionLoading(true);
    setError("");
    try {
      let finalImageUrl = editingProduct?.image_url || null;

      // Sync fresh photo upload step if interactive file target was updated
      if (optionalNewImageFile) {
        finalImageUrl = await marketplaceApi.uploadProductImage(optionalNewImageFile);
      }

      const compiledPayload = { 
        ...updatedFields, 
        image_url: finalImageUrl 
      };

      const updated = await marketplaceApi.updateProduct(productId, compiledPayload);

      // Reactively sync memory layout tree states cleanly
      setProducts((current) =>
        current.map((item) => (item.id === productId ? { ...item, ...updated } : item))
      );
      setEditingProduct(null);
    } catch (err) {
      setError(err.message || "Failed to update harvest modifications.");
    } finally {
      setActionLoading(false);
    }
  }

  // Soft delete / Archiving active harvest deals
  async function markSoldOut(product) {
    setError("");
    try {
      await marketplaceApi.updateProduct(product.id, { is_active: false });
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (err) {
      setError(err.message || "Failed to mark harvest listing as sold out.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Universal Workspace Header */}
      <DashboardHeader 
        name={user?.full_name || "Farmer"} 
        roleLabel="Producer / ರೈತ" 
        isDark={isDark} 
        onTheme={toggleTheme} 
        onLogout={logout}
      >
        <button 
          onClick={() => setShowMessages(true)} 
          className="rounded-xl bg-[#FF7A00] px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 shadow-sm transition-all"
        >
          Messages
        </button>
      </DashboardHeader>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Core Metrics Grid */}
        <section>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Farm overview
          </p>
          <ProducerMetrics products={products} />
        </section>

        {/* Live Active Inventory Segment Workspace */}
        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Active inventory</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage the harvests visible to interested consumers.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="rounded-xl bg-[#00B761] px-5 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              + Add new crop harvest
            </button>
          </div>

          {/* Interactive Dynamic Error Alert Banner Frame */}
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40">
              <span>{error}</span>
              <button onClick={loadDashboard} className="font-bold underline ml-4 hover:text-red-900 dark:hover:text-red-100">
                Retry
              </button>
            </div>
          )}

          {/* Monetized Ad Slots Integration Layout */}
          <div className="mb-6 space-y-4">
            <GoogleAdBanner />
            <GoogleAdWidget type="native" label="Native inline" />
          </div>

          {/* Core Visual Table Grid List Wrapper */}
          <InventoryList 
            products={products} 
            loading={loading} 
            onEditPrice={(product) => setEditingProduct(product)} 
            onSoldOut={markSoldOut} 
          />

          {/* Rewarded Monetization Interaction Card Container */}
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  Rewarded farmer tip
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Watch a quick update ad to unlock a custom seasonal farmer market tip.
                </p>
              </div>
              <button 
                onClick={() => setShowRewardedAd((value) => !value)} 
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                {showRewardedAd ? "Hide reward ad" : "Watch reward ad"}
              </button>
            </div>

            {showRewardedAd && (
              <div className="mt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 pt-4 animate-in fade-in duration-200">
                <GoogleAdWidget 
                  type="rewarded" 
                  label="Rewarded farmer" 
                  rewardDescription="Watch an ad to unlock a farmer reward tip." 
                  onRewardComplete={() => setRewardUnlocked(true)} 
                />
              </div>
            )}

            {rewardUnlocked && (
              <div className="mt-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  💡 Market Tip Unlocked: Sonamuri Paddy buyers are searching for direct pickups from Dharwad clusters this weekend. Keep your quantity metrics current!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Slide-out Add Overlay Modal Configuration */}
      {showAddModal && (
        <AddHarvestModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={addHarvest} 
          isLoading={actionLoading}
        />
      )}

      {/* Slide-out Edit Overlay Modal Configuration */}
      {editingProduct && (
        <EditHarvestModal
          product={editingProduct}
          isLoading={actionLoading}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateListing}
        />
      )}
      
      {/* Messages View Port Drawer Trigger Layer */}
      <MessagingDrawer 
        open={showMessages} 
        onClose={() => setShowMessages(false)} 
      />
    </div>
  );
}