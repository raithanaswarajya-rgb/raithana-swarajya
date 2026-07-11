import { useEffect, useState } from "react";

const initialForm = {
  crop_name: "",
  category: "grains",
  quantity: "",
  unit: "kg",
  price_per_unit: "",
  location: "",
};

export default function AddHarvestModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function selectImage(event) {
    const file = event.target.files?.[0];
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Product image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit(
        {
          ...form,
          quantity: Number(form.quantity),
          price_per_unit: Number(form.price_per_unit),
        },
        imageFile,
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-[#00B761] focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Add new crop harvest</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Publish fresh inventory to the live market.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Close">×</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 sm:col-span-2">Crop name<input required value={form.crop_name} onChange={update("crop_name")} placeholder="Ragi, Rice, Tomato…" className={field} /></label>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Category<select value={form.category} onChange={update("category")} className={field}><option value="vegetables">Vegetables</option><option value="grains">Grains</option><option value="fruits">Fruits</option><option value="pulses">Pulses</option></select></label>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Unit<select value={form.unit} onChange={update("unit")} className={field}><option value="kg">KG</option><option value="quintal">Quintals</option></select></label>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Quantity available<input required min="0.01" step="0.01" type="number" value={form.quantity} onChange={update("quantity")} className={field} /></label>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Price per unit (₹)<input required min="0.01" step="0.01" type="number" value={form.price_per_unit} onChange={update("price_per_unit")} className={field} /></label>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 sm:col-span-2">Farm region / coordinates<input required value={form.location} onChange={update("location")} placeholder="Mandya, Karnataka or 12.52, 76.90" className={field} /></label>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 sm:col-span-2">
            Product image <span className="font-normal text-slate-500 dark:text-slate-400">(optional, up to 5 MB)</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} className="mt-1 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-bold file:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:file:bg-emerald-950 dark:file:text-emerald-300" />
          </label>
          {previewUrl && <img src={previewUrl} alt="Selected crop preview" className="h-44 w-full rounded-2xl object-cover sm:col-span-2" />}
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-[#00B761] px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{saving ? "Publishing…" : "Publish harvest"}</button>
        </div>
      </form>
    </div>
  );
}
