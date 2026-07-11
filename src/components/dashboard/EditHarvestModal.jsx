import React, { useState } from "react";

export default function EditHarvestModal({ product, onClose, onUpdate, isLoading }) {
  const [formData, setFormData] = useState({
    name: product.name || product.crop_name || "",
    quantity: product.quantity || "",
    price_per_unit: product.price_per_unit || "",
    unit: product.unit || "Quintal",
    details: product.details || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product.image_url || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Parse price safely to numeric structure before passing up
    const updatedPayload = {
      ...formData,
      price_per_unit: Number(formData.price_per_unit),
    };
    onUpdate(product.id, updatedPayload, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
        <h3 className="text-lg font-black mb-4 text-[#00B761]">Edit Harvest Listing</h3>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Photo Upload/Preview Block */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Produce Photo</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-zinc-700" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00B761]/10 file:text-[#00B761] hover:file:bg-[#00B761]/20 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Crop Name</label>
            <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent outline-none focus:border-[#00B761]" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity</label>
              <input name="quantity" value={formData.quantity} onChange={handleInputChange} type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent outline-none focus:border-[#00B761]" placeholder="e.g., 40 Quintals" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price per Unit</label>
              <input name="price_per_unit" value={formData.price_per_unit} onChange={handleInputChange} type="number" step="any" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent outline-none focus:border-[#00B761]" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unit Type</label>
            <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:border-[#00B761]">
              <option value="Quintal">Quintal / ಕ್ವಿಂಟಲ್</option>
              <option value="KG">KG / ಕೆಜಿ</option>
              <option value="Ton">Ton / ಟನ್</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notes / Pickup Terms</label>
            <textarea name="details" value={formData.details} onChange={handleInputChange} rows="2" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-transparent outline-none focus:border-[#00B761]"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-slate-500 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-[#00B761] text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-50">
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}