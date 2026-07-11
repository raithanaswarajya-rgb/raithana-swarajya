const categories = ["all", "vegetables", "grains", "fruits", "pulses"];

export default function ConsumerHeader({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 shadow-xl shadow-emerald-900/10 sm:p-7">
      <h2 className="text-2xl font-black text-white">Fresh from farms near you</h2>
      <p className="mt-1 text-sm text-emerald-50">Search by crop or growing region, no middlemen in the way.</p>
      <label className="mt-5 block"><span className="sr-only">Search crops or regions</span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search ragi, tomato, Mandya…" className="w-full rounded-2xl border-0 bg-white px-5 py-4 text-slate-900 shadow-md outline-none ring-2 ring-transparent placeholder:text-slate-500 focus:ring-orange-400" /></label>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Crop categories">
        {categories.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold capitalize ${selectedCategory === category ? "bg-[#FF7A00] text-white" : "bg-white/15 text-white hover:bg-white/25"}`}>{category === "all" ? "All fresh produce" : category}</button>)}
      </div>
    </section>
  );
}
