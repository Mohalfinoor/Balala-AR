import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Plus, AlertCircle, Sparkles } from 'lucide-react';
import presetUkirJati from '../assets/images/preset_ukir_jati_1794804419385.jpg';
import presetTenunSaqbe from '../assets/images/preset_tenun_saqbe_1794804420200.jpg';
import torajaChairImage from '../assets/images/toraja_chair_1781263138778.jpg';
import mandarSofaImage from '../assets/images/mandar_sofa_1781263192650.jpg';

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

const PRESETS = [
  {
    name: 'Serat Ukir Jati Klasik',
    url: presetUkirJati,
  },
  {
    name: 'Wastra Tenun Saqbe',
    url: presetTenunSaqbe,
  },
  {
    name: 'Kursi Ukir Toraja',
    url: torajaChairImage,
  },
  {
    name: 'Sofa Tenun Mandar',
    url: mandarSofaImage,
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

  const handlePriceChange = (value: string) => {
    const rawNum = value.replace(/[^0-9]/g, '');
    setPriceNumber(rawNum);
  };

  const getPriceFormatted = (): string => {
    if (!priceNumber) return 'Rp 0';
    return `Rp ${parseInt(priceNumber, 10).toLocaleString('id-ID')}`;
  };

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

    onAddProduct({
      name,
      price: getPriceFormatted(),
      image: finalImage,
      culture: productCulture,
      description,
      philosophy
    });

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
        className="fixed inset-0 bg-[#0A2926]/55 backdrop-blur-md z-0"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative liquid-glass w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
      >
        {/* Header */}
        <div className="liquid-glass-dark text-white p-6 relative border-b border-[#D7B463]/20">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal tambah produk"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/85 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <p className="text-[11px] font-medium text-[#D7B463]">
            Studio Pengrajin Balla AR
          </p>
          <h3 className="text-lg font-serif font-bold mt-1 text-[#FAF8F3]">Tambah Produk Warisan Baru</h3>
          <p className="text-xs text-white/75 mt-1">
            Isi detail produk untuk didaftarkan ke pameran digital Balla AR.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs no-scrollbar bg-[#FAF8F3]/60">
          {error && (
            <div className="p-3 bg-[#F9ECEC]/90 border border-[#7C3238]/25 text-[#7C3238] rounded-xl flex items-center gap-2 mb-2 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#445754]">Nama Produk Jati / Kain</label>
            <input
              type="text"
              required
              placeholder="Contoh: Meja Hias Saqbe Saoraja"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
            />
          </div>

          {/* Suku Tradisi Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#445754]">Suku Tradisi Pusaka</label>
            <select
              value={productCulture}
              onChange={(e) => setProductCulture(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#162624] cursor-pointer outline-none"
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
              <label className="block text-[11px] font-semibold text-[#445754]">Harga Produk (Angka)</label>
              <input
                type="text"
                required
                placeholder="Contoh: 5450000"
                value={priceNumber}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs tabular-nums outline-none transition-all"
              />
            </div>
            <div className="liquid-glass-subtle rounded-xl p-2.5 h-[38px] flex items-center justify-center font-bold text-[#10423E] text-xs tabular-nums">
              {getPriceFormatted()}
            </div>
          </div>

          {/* Image Chooser & Preview */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-[#445754]">Foto Produk</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 liquid-glass-subtle rounded-xl text-center">
              <button
                type="button"
                onClick={() => setImageSource('preset')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] cursor-pointer transition-all whitespace-nowrap ${imageSource === 'preset' ? 'bg-white text-[#10423E] shadow-xs' : 'text-[#5C6F6B] hover:text-[#162624]'}`}
              >
                Preset Budaya
              </button>
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] cursor-pointer transition-all whitespace-nowrap ${imageSource === 'upload' ? 'bg-white text-[#10423E] shadow-xs' : 'text-[#5C6F6B] hover:text-[#162624]'}`}
              >
                Unggah File
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[10px] cursor-pointer transition-all whitespace-nowrap ${imageSource === 'url' ? 'bg-white text-[#10423E] shadow-xs' : 'text-[#5C6F6B] hover:text-[#162624]'}`}
              >
                Tautan URL
              </button>
            </div>

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
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${imageUrl === preset.url ? 'border-[#13524D] bg-[#E7F1EF]/70 shadow-xs' : 'border-white bg-white/60 hover:bg-white/90'}`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-10 h-10 object-cover rounded-lg bg-[#EAE3D5] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-[#162624] truncate leading-tight">{preset.name}</p>
                      <p className="text-[9px] text-[#5C6F6B]">Resolusi Tinggi</p>
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
                  className="border-2 border-dashed border-[#13524D]/25 hover:border-[#13524D]/55 bg-white/55 hover:bg-[#E7F1EF]/35 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                >
                  <Upload size={20} className="text-[#13524D]/70" />
                  <p className="text-[11px] font-bold text-[#162624]">Klik untuk pilih berkas gambar</p>
                  <p className="text-[9.5px] text-[#5C6F6B]">Dimensi persegi dianjurkan, maks 2MB</p>
                </div>
                {uploadedBase64 && (
                  <div className="flex items-center gap-3 p-2.5 bg-[#E7F1EF]/90 rounded-xl border border-[#13524D]/20">
                    <img
                      src={uploadedBase64}
                      alt="Pratinjau unggah"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-[#10423E]">Berkas Foto Siap</p>
                      <p className="text-[9.5px] text-[#13524D]">Berhasil dimuat secara lokal</p>
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
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none mt-1"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#445754]">Deskripsi Nilai Fungsional &amp; Bahan</label>
            <textarea
              required
              rows={3}
              placeholder="Deskripsikan material kayu, pengerjaan ukiran, dan kualitas finishing furnitur..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none resize-none"
            />
          </div>

          {/* Philosophy */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#445754] flex items-center gap-1">
              <span>Filosofi &amp; Kisah Motif Tradisional</span>
              <Sparkles size={12} className="text-[#C59B42]" />
            </label>
            <textarea
              required
              rows={3}
              placeholder="Nilai kearifan lokal di balik karya seni ukiran atau motif ornamen tenun..."
              value={philosophy}
              onChange={(e) => setPhilosophy(e.target.value)}
              className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 liquid-glass-pill text-[#445754] hover:text-[#162624] py-3 rounded-full font-bold transition-all cursor-pointer text-center"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="flex-1 liquid-glass-teal hover:brightness-110 text-white py-3 rounded-full font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
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
