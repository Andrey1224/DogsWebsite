import React, { useState } from 'react';
import {
  X,
  Save,
  Trash2,
  Lock,
  Calendar,
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

// --- КОМПОНЕНТ ПАНЕЛИ РЕДАКТИРОВАНИЯ (EditPuppyPanel) ---
const EditPuppyPanel = ({ isOpen, onClose, puppy }) => {
  if (!isOpen) return null;

  // Mock Data
  const [formData, setFormData] = useState({
    name: puppy?.name || 'Duddy',
    slug: puppy?.slug || 'duddy',
    price: puppy?.price || 4200,
    status: puppy?.status || 'Available',
    breed: 'French Bulldog',
    sex: 'Female',
    color: 'Blue',
    weight: '24',
    dob: '1999-12-19',
    description: 'My loved puppy i love his so much so yes just Love him so much!)))',
    sireName: 'Gohan',
    damName: 'Elizabeth',
  });

  // Mock Photos
  const [gallery, setGallery] = useState([
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  ]);
  const [sirePhoto, setSirePhoto] = useState(
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  );
  const [damPhoto, setDamPhoto] = useState(
    'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end text-left">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-2xl bg-[#0B1120] h-full shadow-2xl border-l border-slate-800 overflow-y-auto flex flex-col animate-slideInRight font-sans">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0B1120]/90 backdrop-blur-xl border-b border-slate-800 p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Edit Puppy</h2>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border border-slate-700">
                ID: {puppy?.id || '123'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Update details, pricing, and media.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10 flex-1">
          {/* Core Info */}
          <section className="space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  Slug (Read-only) <Lock size={10} />
                </label>
                <div className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-slate-500 text-sm font-mono flex items-center justify-between">
                  <span>{formData.slug}</span>
                  <Lock size={14} className="text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-600 ml-1">
                  Slug cannot be changed after creation to prevent SEO issues.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none appearance-none cursor-pointer"
                >
                  <option>Available</option>
                  <option>Reserved</option>
                  <option>Sold</option>
                  <option>Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Price (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all font-mono"
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-800" />

          {/* Physical Traits */}
          <section className="space-y-5">
            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[1px] bg-blue-500"></span> Physical Traits
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Birth Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none text-sm"
                  />
                  <Calendar
                    size={16}
                    className="absolute right-4 top-3.5 text-slate-500 pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Breed</label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none appearance-none text-sm"
                >
                  <option>French Bulldog</option>
                  <option>English Bulldog</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Sex</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none appearance-none text-sm"
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none text-sm"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Weight (oz)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1">Description</label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none resize-none text-sm leading-relaxed"
              />
            </div>
          </section>

          <div className="h-px bg-slate-800" />

          {/* Parents */}
          <section className="space-y-5">
            <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[1px] bg-purple-500"></span> Lineage & Parents
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Sire Name (Dad)</label>
                <input
                  type="text"
                  name="sireName"
                  value={formData.sireName}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Dam Name (Mom)</label>
                <input
                  type="text"
                  name="damName"
                  value={formData.damName}
                  onChange={handleChange}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Sire Photo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Sire Photo</label>
                {sirePhoto ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden group border border-slate-700">
                    <img src={sirePhoto} alt="Sire" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSirePhoto(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[10px] py-1 text-center backdrop-blur-sm">
                      Current Photo
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-xl h-40 flex flex-col items-center justify-center text-slate-500 hover:bg-[#1E293B] hover:border-slate-600 transition-colors cursor-pointer">
                    <UploadCloud size={24} className="mb-2" />
                    <span className="text-xs">Upload Sire</span>
                  </div>
                )}
              </div>

              {/* Dam Photo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-1">Dam Photo</label>
                {damPhoto ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden group border border-slate-700">
                    <img src={damPhoto} alt="Dam" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setDamPhoto(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[10px] py-1 text-center backdrop-blur-sm">
                      Current Photo
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-xl h-40 flex flex-col items-center justify-center text-slate-500 hover:bg-[#1E293B] hover:border-slate-600 transition-colors cursor-pointer">
                    <UploadCloud size={24} className="mb-2" />
                    <span className="text-xs">Upload Dam</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-800" />

          {/* Gallery */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                Puppy Gallery (Max 3)
              </label>
              <span className="text-xs text-slate-500">{gallery.length}/3 photos</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Existing Photos */}
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700"
                >
                  <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add Button */}
              {gallery.length < 3 && (
                <div className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-[#1E293B] hover:border-orange-500/50 hover:text-orange-500 transition-all cursor-pointer group">
                  <div className="bg-slate-800 p-3 rounded-full mb-2 group-hover:bg-orange-500/10 transition-colors">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-xs font-bold">Add Photo</span>
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-400 mt-0.5" />
              <p className="text-xs text-blue-300/80 leading-relaxed">
                Drag and drop photos to reorder (Coming Soon). First photo will be the main cover
                image.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-800 p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          >
            Cancel
          </button>
          <button className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ПРЕДПРОСМОТРА (APP) ---
export default function App() {
  const [isOpen, setIsOpen] = useState(true); // Панель открыта сразу

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center font-sans">
      <div className="text-center">
        <h1 className="text-2xl text-white mb-4">Admin Dashboard</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
        >
          Open Edit Panel
        </button>
      </div>

      {/* Рендерим панель поверх всего */}
      <EditPuppyPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
