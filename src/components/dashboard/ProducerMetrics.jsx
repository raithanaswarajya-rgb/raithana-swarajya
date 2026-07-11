export default function ProducerMetrics({ products }) {
  const activeListings = products.filter((item) => item.is_active).length;
  return (
    <article className="max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Active listings</p>
      <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{activeListings}</p>
    </article>
  );
}
