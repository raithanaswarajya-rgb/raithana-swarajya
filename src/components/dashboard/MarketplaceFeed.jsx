const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function MarketplaceFeed({ products, loading, contactingId, onContact }) {
  if (loading) return <div className="py-16 text-center text-slate-600 dark:text-slate-400">Loading today’s harvests…</div>;
  if (!products.length) return <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">No crops match this search. Try another region or category.</div>;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {product.image_url ? <img src={product.image_url} alt={product.crop_name} className="h-48 w-full object-cover" loading="lazy" /> : <div className="flex h-40 items-center justify-center bg-gradient-to-br from-emerald-100 to-orange-100 text-6xl dark:from-emerald-950 dark:to-orange-950">🌾</div>}
          <div className="p-6">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{product.category}</span>
            <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-slate-100">{product.crop_name}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Offered by <span className="font-bold text-slate-800 dark:text-slate-200">{product.farmer_name || "Local producer"}</span></p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{product.location}</p>
            <div className="mt-5"><p className="text-2xl font-black text-[#00B761]">{currency.format(product.price_per_unit)}</p><p className="text-xs text-slate-500 dark:text-slate-400">listed per {product.unit} · {product.quantity} available</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Final price and fulfillment are agreed directly in chat.</p></div>
            <button disabled={contactingId === product.id} onClick={() => onContact(product)} className="mt-6 w-full rounded-xl bg-[#FF7A00] px-4 py-3 font-black text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-60">{contactingId === product.id ? "OPENING CHAT…" : "MESSAGE PRODUCER / ಸಂದೇಶ"}</button>
          </div>
        </article>
      ))}
    </div>
  );
}
