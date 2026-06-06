import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Plus, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminCulture: string;
  onAddProduct: (productData: {
    name: string;
    price: string;
    image: string;
    culture: string;
    description: string;
    philosophy: string;
  }) => void;
}

// Predefined beautiful heritage cover placeholders for quick selection
const PRESETS = [
  {
    name: 'Serat Ukir Jati Klasik',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Wastra Tenun Elegan',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Kayu Solid Nusantara',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mebel Premium Adat',
    url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
  }
];

export default function AddProductModal({
  isOpen,
  onClose,
  adminCulture,
  onAddProduct
}: AddProductModalProps) {
  const [name, setName] = useState('');
  const [productCulture, setProductCulture] = useState(() => {
    return adminCulture ? adminCulture.charAt(0).toUpperCase() + adminCulture.slice(1).toLowerCase() : 'Toraja';
  });
  const [priceNumber, setPriceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [philosophy, setPhilosophy] = useState('');
  const [imageSource, setImageSource] = useState<'upload' | 'preset' | 'url'>('preset');
  const [imageUrl, setImageUrl] = useState(PRESETS[0].url);
  const [uploadedBase64, setUploadedBase64] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Format the Indonesian Rupiah as they type
  const handlePriceChange = (value: string) => {
    const rawNum = value.replace(/[^0-9]/g, '');
    setPriceNumber(rawNum);
  };

  const getPriceFormatted = (): string => {
    if (!priceNumber) return 'Rp 0';
    return `Rp ${parseInt(priceNumber, 10).toLocaleString('id-ID')}`;
  };

  // Convert uploaded image to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran gambar melebihi 2MB. Silakan pilih gambar yang lebih kecil.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    if (!priceNumber || parseInt(priceNumber, 10) <= 0) {
      setError('Harga produk harus diisi dengan angka sah.');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi produk wajib diisi.');
      return;
    }
    if (!philosophy.trim()) {
      setError('Filosofi motif kebudayaan wajib diisi.');
      return;
    }

    let finalImage = '';
    if (imageSource === 'preset') {
      finalImage = imageUrl;
    } else if (imageSource === 'upload') {
      if (!uploadedBase64) {
        setError('Silakan unggah foto produk terlebih dahulu.');
        return;
      }
      finalImage = uploadedBase64;
    } else {
      if (!imageUrl.trim()) {
        setError('Tautan URL gambar wajib diisi.');
        return;
      }
      finalImage = imageUrl;
    }

    // Call callback to add product
    onAddProduct({
      name,
      price: getPriceFormatted(),
      image: finalImage,
      culture: productCulture,
      description,
      philosophy
    });

    // Reset Form
    setName('');
    setPriceNumber('');
    setDescription('');
    setPhilosophy('');
    setUploadedBase64('');
    setImageUrl(PRESETS[0].url);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto no-scrollbar flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-0"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
      >
        {/* Header (Gradient and stylized) */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase bg-teal-900/50 border border-teal-850 px-2.5 py-1 rounded-full">
            Fitur Tambah Produk Pengrajin
          </span>
          <h3 className="text-lg font-serif font-bold mt-2">Tambah Produk Warisan Baru</h3>
          <p className="text-[11px] text-zinc-300 mt-1">
            Isi detail produk untuk didaftarkan ke pameran digital Balla AR.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs select-none no-scrollbar">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-2 mb-2 animate-pulse font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Produk Jati / Kain</label>
            <input
              type="text"
              required
              placeholder="Contoh: Meja Hias Saqbe Saoraja"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
            />
          </div>

          {/* Suku Tradisi Dropdown */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Suku Tradisi Pusaka</label>
            <select
              value={productCulture}
              onChange={(e) => setProductCulture(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-teal-600/30 font-semibold text-slate-750 cursor-pointer"
            >
              <option value="Toraja">Suku Toraja</option>
              <option value="Bugis">Suku Bugis</option>
              <option value="Makassar">Suku Makassar</option>
              <option value="Mandar">Suku Mandar</option>
            </select>
          </div>

          {/* Product Price */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Harga Produk (Angka)</label>
              <input
                type="text"
                required
                placeholder="Contoh: 5450000"
                value={priceNumber}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs font-mono focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
              />
            </div>
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2.5 h-[38px] flex items-center justify-center font-bold text-teal-800 text-xs">
              {getPriceFormatted()}
            </div>
          </div>

          {/* Image Chooser & Preview */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Foto/Visual Produk</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-center">
              <button
                type="button"
                onClick={() => setImageSource('preset')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] shadow-xs cursor-pointer transition-all ${imageSource === 'preset' ? 'bg-white text-teal-950 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Pilihan Preset Budaya
              </button>
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] shadow-xs cursor-pointer transition-all ${imageSource === 'upload' ? 'bg-white text-teal-950 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Unggah File Sendiri
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] shadow-xs cursor-pointer transition-all ${imageSource === 'url' ? 'bg-white text-teal-950 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Salin Tautan URL
              </button>
            </div>

            {/* Sub fields for image selection */}
            {imageSource === 'preset' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setError('');
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all hover:bg-slate-50 cursor-pointer ${imageUrl === preset.url ? 'border-teal-600 bg-teal-50/20' : 'border-slate-150 bg-slate-50/40'}`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-10 h-10 object-cover rounded-md bg-zinc-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">{preset.name}</p>
                      <p className="text-[8px] text-slate-400">High Resolution</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {imageSource === 'upload' && (
              <div className="space-y-2 pt-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-teal-600/50 bg-slate-50 hover:bg-teal-50/10 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                >
                  <Upload size={20} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-600">Klik untuk pilih berkas gambar</p>
                  <p className="text-[8.5px] text-slate-400">Dimensi persegi dianjurkan, maks 2MB</p>
                </div>
                {uploadedBase64 && (
                  <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <img
                      src={uploadedBase64}
                      alt="Pratinjau unggah"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800">Berkas Foto Siap</p>
                      <p className="text-[8.5px] text-emerald-600">Berhasil dikompresi & dimuat lokal</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {imageSource === 'url' && (
              <input
                type="url"
                placeholder="Masukkan alamat URL foto: https://example.com/item.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none mt-1"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase">Deskripsi Nilai Fungsional / Bahan</label>
            <textarea
              required
              rows={3}
              placeholder="Deskripsikan material kayu, pengerjaan ukiran, dan kualitas finishing furnitur..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none resize-none"
            />
          </div>

          {/* Philosophy */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <span>Filosofi & Kisah Motif Tradisional</span>
                <Sparkles size={11} className="text-teal-600 animate-pulse" />
              </label>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Nilai kearifan lokal dibalik karya seni ukiran atau motif ornamen tenun..."
              value={philosophy}
              onChange={(e) => setPhilosophy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 py-3 rounded-full font-bold transition-all hover:text-slate-800 cursor-pointer text-center"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-full font-bold shadow-lg shadow-teal-600/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Simpan Produk</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
