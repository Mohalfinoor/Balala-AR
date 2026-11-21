import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Store,
  CheckCircle2,
  Clock,
  AlertCircle,
  BadgeCheck,
  Send
} from 'lucide-react';
import Logo from './Logo';
import { MerchantApplication } from '../types/platform';

interface MerchantRegistrationPageProps {
  googleUser: { name: string; email: string; avatar: string } | null;
  existingApplication: MerchantApplication | null;
  onSubmitApplication: (data: {
    storeName: string;
    culture: string;
    whatsapp: string;
    address: string;
    bio: string;
  }) => void;
  onOpenSellerDashboard: () => void;
  onBackToHome: () => void;
  onSignInWithGoogle: () => Promise<void>;
  isGoogleLoading?: boolean;
}

export default function MerchantRegistrationPage({
  googleUser,
  existingApplication,
  onSubmitApplication,
  onOpenSellerDashboard,
  onBackToHome,
  onSignInWithGoogle,
  isGoogleLoading = false
}: MerchantRegistrationPageProps) {
  const [storeName, setStoreName] = useState(
    () => existingApplication?.storeName || localStorage.getItem('ballaar_merchant_store_name') || ''
  );
  const [culture, setCulture] = useState(
    () => existingApplication?.culture || localStorage.getItem('ballaar_merchant_store_culture') || 'Toraja'
  );
  const [whatsapp, setWhatsapp] = useState(
    () => existingApplication?.whatsapp || localStorage.getItem('ballaar_profile_phone') || ''
  );
  const [address, setAddress] = useState(
    () => existingApplication?.address || localStorage.getItem('ballaar_merchant_address') || ''
  );
  const [bio, setBio] = useState(
    () => existingApplication?.bio || localStorage.getItem('ballaar_merchant_bio') || ''
  );
  const [isEditingRejected, setIsEditingRejected] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    if (existingApplication) {
      setStoreName(existingApplication.storeName);
      setCulture(existingApplication.culture);
      setAddress(existingApplication.address);
      setBio(existingApplication.bio === '-' ? '' : existingApplication.bio);
      if (existingApplication.whatsapp) {
        setWhatsapp(existingApplication.whatsapp);
      }
      if (existingApplication.status !== 'rejected') {
        setIsEditingRejected(false);
      }
    }
  }, [existingApplication]);

  const status = existingApplication?.status || 'none';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!googleUser) {
      setFormError('Silakan masuk dengan akun Google terlebih dahulu.');
      return;
    }
    if (!storeName.trim()) {
      setFormError('Nama Sanggar Adat / Toko wajib diisi.');
      return;
    }
    if (!whatsapp.trim()) {
      setFormError('No. WhatsApp Workshop wajib diisi.');
      return;
    }
    if (!address.trim()) {
      setFormError('Alamat Workshop / Sanggar wajib diisi.');
      return;
    }

    localStorage.setItem('ballaar_profile_phone', whatsapp.trim());
    onSubmitApplication({
      storeName: storeName.trim(),
      culture,
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      bio: bio.trim() || '-'
    });
    setIsEditingRejected(false);
    setSubmittedNotice(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans antialiased flex flex-col">
      {/* Minimalist Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-stone-200/80 px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>
          <span aria-hidden="true" className="text-stone-300">|</span>
          <div className="flex items-center gap-2 min-w-0">
            <Logo className="w-6 h-6 shrink-0" />
            <span className="text-xs font-semibold text-stone-900 truncate">
              Pendaftaran Mitra Pengrajin UMKM
            </span>
          </div>
        </div>
      </header>

      {/* Main Centered Page Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Gabung Mitra Pengrajin Balla AR
          </h1>
          <p className="text-xs sm:text-[13px] text-stone-500 leading-relaxed">
            Daftarkan sanggar atau usaha kriya furnitur Sulawesi Selatan Anda. Pengajuan akan ditinjau dan di-ACC oleh Admin Platform sebelum produk Anda dimodelkan 3D/AR oleh Tim BALALA.
          </p>
        </div>

        {!googleUser ? (
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-center">
            <Store size={24} className="mx-auto text-[#10423E]" />
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-stone-900">Hubungkan Akun Google</h2>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Masuk dengan akun Google Anda untuk mendaftarkan sanggar dan memantau persetujuan Admin Platform.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={isGoogleLoading}
              className="px-5 py-2.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
            >
              {isGoogleLoading ? 'Menyambungkan...' : 'Masuk dengan Google'}
            </button>
          </div>
        ) : (
          <>
            {/* Verified Applicant Header Strip */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={googleUser.avatar}
                  alt={googleUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900 truncate">{googleUser.name}</p>
                  <p className="text-[11px] text-stone-500 truncate">{googleUser.email}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 inline-flex items-center gap-1 shrink-0">
                <BadgeCheck size={14} /> Akun Terhubung
              </span>
            </div>

            {submittedNotice && status === 'pending' && (
              <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>
                  Pendaftaran sanggar berhasil dikirim ke Admin Platform untuk diverifikasi (ACC).
                </span>
              </div>
            )}

            {/* State-based Content */}
            {status === 'approved' ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={15} />
                      <span>Mitra UMKM Disetujui</span>
                    </div>
                    <h2 className="text-lg font-bold text-stone-900">{existingApplication?.storeName}</h2>
                    <p className="text-xs text-stone-500">
                      Suku {existingApplication?.culture} · Komisi Platform {existingApplication?.commissionRate || 2}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-stone-500">No. WhatsApp Workshop</p>
                    <p className="font-mono tabular-nums font-medium text-stone-900 mt-0.5">
                      {existingApplication?.whatsapp || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">Tanggal Pengajuan</p>
                    <p className="font-medium text-stone-900 mt-0.5">
                      {existingApplication?.submittedAt || '-'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-stone-500">Alamat Workshop</p>
                    <p className="font-medium text-stone-900 mt-0.5">{existingApplication?.address}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onOpenSellerDashboard}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Store size={14} />
                    <span>Buka Dasbor Penjual / UMKM</span>
                  </button>
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-4 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Kembali ke Galeri
                  </button>
                </div>
              </div>
            ) : status === 'pending' ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-stone-900">
                      Menunggu ACC Admin Platform
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Data pendaftaran Anda sudah masuk ke daftar antrean verifikasi Admin Platform &amp; Tim BALALA. Setelah di-ACC, akses Dasbor Penjual akan terbuka otomatis pada akun Anda.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-stone-500">Nama Sanggar</p>
                    <p className="font-semibold text-stone-900 mt-0.5">{existingApplication?.storeName}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Kategori Adat</p>
                    <p className="font-semibold text-stone-900 mt-0.5">{existingApplication?.culture}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">No. WhatsApp</p>
                    <p className="font-mono tabular-nums text-stone-900 mt-0.5">
                      {existingApplication?.whatsapp || whatsapp || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">Diajukan Pada</p>
                    <p className="text-stone-900 mt-0.5">{existingApplication?.submittedAt || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-stone-500">Alamat Workshop</p>
                    <p className="text-stone-900 mt-0.5">{existingApplication?.address}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-4 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  Kembali ke Galeri
                </button>
              </div>
            ) : status === 'rejected' && !isEditingRejected ? (
              <div className="bg-white border border-red-200 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-stone-900">
                      Pengajuan Mitra Belum Disetujui
                    </h2>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Pengajuan sanggar <strong>"{existingApplication?.storeName}"</strong> ditangguhkan oleh Admin Platform. Anda dapat memperbarui detail workshop dan mengajukan ulang.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingRejected(true)}
                    className="px-4 py-2.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Perbaiki &amp; Ajukan Ulang
                  </button>
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-4 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-stone-200 rounded-xl p-6 space-y-5 text-xs"
              >
                <div className="border-b border-stone-200 pb-3">
                  <h2 className="text-sm font-semibold text-stone-900">Formulir Pengajuan Mitra UMKM</h2>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Lengkapi informasi workshop Anda di bawah ini untuk ditinjau oleh Admin Platform.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Nama Sanggar Adat / Toko
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: Sanggar Pusaka Somba Opu"
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#10423E]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Kategori Adat Kebudayaan
                    </label>
                    <select
                      value={culture}
                      onChange={e => setCulture(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#10423E]"
                    >
                      <option value="Toraja">Toraja</option>
                      <option value="Bugis">Bugis</option>
                      <option value="Makassar">Makassar</option>
                      <option value="Mandar">Mandar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      No. WhatsApp Workshop
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="contoh: 0812..."
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 font-mono tabular-nums outline-none focus:border-[#10423E]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Alamat Workshop / Sanggar Adat
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Jalan, Kec., Kabupaten, Sulawesi Selatan"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#10423E]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-stone-700 mb-1">
                      Rencana Karya Seni &amp; Spesialisasi (Bio Sanggar)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Terangkan jenis karya ukiran kayu, furnitur adat, atau wastra sutra yang diproduksi..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#10423E]"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
                  Pembuatan aset 3D/AR (.glb &amp; .usdz) dibantu oleh Tim Teknis BALALA. Skema komisi platform sebesar 1%–2% hanya dikenakan saat pesanan berhasil diselesaikan.
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-4 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium cursor-pointer transition-colors"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Send size={13} />
                    <span>Kirim Pengajuan Mitra</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
