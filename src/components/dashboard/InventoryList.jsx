const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export default function InventoryList({ products, loading, onEditPrice, onSoldOut }) {
  if (loading) return <p className="py-12 text-center text-slate-600 dark:text-slate-400">Loading inventory…</p>;
  if (!products.length) return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">No harvests listed yet. Add your first crop above.</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr><th className="px-5 py-4">Crop</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Region</th><th className="px-5 py-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {products.map((product) => (
              <tr key={product.id} className="text-sm text-slate-700 dark:text-slate-200">
                <td className="px-5 py-4"><div className="flex items-center gap-3">{product.image_url ? <img src={product.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-950">🌾</div>}<div><p className="font-bold text-slate-900 dark:text-slate-100">{product.crop_name}</p><p className="text-xs capitalize text-slate-500 dark:text-slate-400">{product.category}</p></div></div></td>
                <td className="px-5 py-4">{product.quantity} {product.unit}</td>
                <td className="px-5 py-4 font-bold text-emerald-700 dark:text-emerald-400">{currency.format(product.price_per_unit)} / {product.unit}</td>
                <td className="px-5 py-4">{product.location}</td>
                <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => onEditPrice(product)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">Edit price</button><button onClick={() => onSoldOut(product)} className="rounded-lg bg-orange-600 px-3 py-2 font-semibold text-white hover:bg-orange-700">Mark sold out</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
