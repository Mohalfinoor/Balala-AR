import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  signInWithGoogle,
  logout as firebaseLogout,
  updateMerchantApplicationInDb
} from '../firebase';
import Logo from './Logo';
import PWAInstallButton from './PWAInstallButton';
import { 
  X, 
  User, 
  Heart, 
  Gift, 
  ShieldAlert, 
  Globe, 
  BadgeCheck, 
  Volume2, 
  Check, 
  Lock, 
  Store, 
  LogOut,
  Sparkles
} from 'lucide-react';

import {
  UserRole,
  MerchantApplication,
  isAuthorizedPlatformAdmin
} from '../types/platform';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoritesCount: number;
  cartCount: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  adminCulture: string;
  setAdminCulture: (culture: string) => void;
  googleUser: { name: string; email: string; avatar: string; } | null;
  setGoogleUser: (user: { name: string; email: string; avatar: string; } | null) => void;
  applications?: MerchantApplication[];
  setApplications?: React.Dispatch<React.SetStateAction<MerchantApplication[]>>;
  onOpenPlatformAdmin?: (verifiedEmail?: string) => void;
  onOpenSellerDashboard?: (culture?: string) => void;
  onResetManualExit?: () => void;
  onOpenMerchantRegistration?: () => void;
}

// Store helper display
const getStoreName = (culture: string): string => {
  try {
    const savedCustomName = localStorage.getItem('ballaar_merchant_store_name');
    const savedMerchantStatus = localStorage.getItem('ballaar_merchant_status');
    if (savedMerchantStatus === 'approved' && savedCustomName) {
      return savedCustomName;
    }
  } catch (e) {
    // ignore
  }
  switch (culture.toLowerCase()) {
    case 'toraja':
      return 'Sanggar Seni Toraja';
    case 'bugis':
      return 'Griya Ukir Bugis';
    case 'makassar':
      return 'Phinisi Makassar Gallery';
    case 'mandar':
      return 'Sutra Mandar Home';
    default:
      return `Toko Adat ${culture}`;
  }
};

export default function ProfileDrawer({
  isOpen,
  onClose,
  favoritesCount,
  cartCount,
  userRole,
  setUserRole,
  adminCulture,
  setAdminCulture,
  googleUser,
  setGoogleUser,
  applications: externalApplications,
  setApplications: setExternalApplications,
  onOpenPlatformAdmin,
  onOpenSellerDashboard,
  onResetManualExit,
  onOpenMerchantRegistration
}: ProfileDrawerProps) {
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [audioGuide, setAudioGuide] = useState<boolean>(true);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Profile phone filled by real user
  const [customPhone, setCustomPhone] = useState(() => {
    const saved = localStorage.getItem('ballaar_profile_phone');
    return saved && saved !== '0852-4412-3392' ? saved : '';
  });

  // Fallback local applications state (starts empty—real applicants only)
  const [localApplications, setLocalApplications] = useState<MerchantApplication[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_global_merchant_applications');
      if (saved) {
        const parsed: MerchantApplication[] = JSON.parse(saved);
        return parsed.filter(
          a =>
            a.applicantEmail !== 'tamu.nusantara@gmail.com' &&
            a.applicantEmail !== 'cantika_toraja@gmail.com' &&
            a.applicantEmail !== 'sanggar.toraja@ballaar.id'
        );
      }
    } catch (e) {}
    return [];
  });

  const applications = externalApplications ?? localApplications;
  const setApplications = setExternalApplications ?? setLocalApplications;

  // Merchant Application Status (synced to show badge/label on compact button below logout)
  const [merchantStatus, setMerchantStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>(() => {
    return (localStorage.getItem('ballaar_merchant_status') as 'none' | 'pending' | 'approved' | 'rejected') || 'none';
  });
  const [merchantStoreName, setMerchantStoreName] = useState(() => {
    return localStorage.getItem('ballaar_merchant_store_name') || '';
  });

  const currentUserApp = googleUser
    ? applications.find(a => a.applicantEmail.toLowerCase() === googleUser.email.toLowerCase()) || null
    : null;

  // Sync current user's merchant status when googleUser changes or applications list updates
  useEffect(() => {
    if (!googleUser) return;
    const myApp = applications.find(
      a => a.applicantEmail.toLowerCase() === googleUser.email.toLowerCase()
    );
    if (myApp) {
      setMerchantStatus(myApp.status);
      localStorage.setItem('ballaar_merchant_status', myApp.status);
      if (myApp.status === 'approved' || myApp.status === 'pending') {
        setMerchantStoreName(myApp.storeName);
        localStorage.setItem('ballaar_merchant_store_name', myApp.storeName);
        localStorage.setItem('ballaar_merchant_store_culture', myApp.culture);
        localStorage.setItem('ballaar_merchant_address', myApp.address);
        localStorage.setItem('ballaar_merchant_bio', myApp.bio);
      }
    } else {
      const curStatus = (localStorage.getItem('ballaar_merchant_status') as 'none' | 'pending' | 'approved' | 'rejected') || 'none';
      setMerchantStatus(curStatus);
    }
  }, [googleUser, applications]);

  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  const handleSavePhone = (phone: string) => {
    setCustomPhone(phone);
    localStorage.setItem('ballaar_profile_phone', phone);
  };

  // Google Sign-In using Firebase Auth
  const handleGoogleSignInClick = async () => {
    setIsGoogleLoading(true);
    setActionNotice(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const loggedInUser = {
          name: user.displayName || 'Google User',
          email: user.email || '',
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Google User')}&background=13524D&color=FAF8F3&bold=true&size=150`
        };
        setGoogleUser(loggedInUser);
        onResetManualExit?.();
        
        // Strictly restrict Platform Admin & Tim BALALA access ONLY to wirabuanamohalfinoor@gmail.com
        if (isAuthorizedPlatformAdmin(loggedInUser.email)) {
          setUserRole('platform_admin');
          onClose();
          onOpenPlatformAdmin?.(loggedInUser.email);
        } else {
          const matchedApproved = applications.find(
            a =>
              a.applicantEmail.toLowerCase() === loggedInUser.email.toLowerCase() &&
              a.status === 'approved'
          );
          if (matchedApproved) {
            setUserRole('admin');
            setAdminCulture(matchedApproved.culture);
            onClose();
            onOpenSellerDashboard?.(matchedApproved.culture);
          } else {
            setUserRole('user');
          }
        }
      }
    } catch (err: any) {
      console.error("Login Error: ", err);
      const msg = err?.message && err.message.includes('auth/popup-blocked')
        ? 'Popup login Google diblokir peramban. Mohon izinkan popup untuk situs ini.'
        : `Gagal melakukan login Google: ${err?.message || 'Terjadi kendala koneksi.'}`;
      setActionNotice({ type: 'error', text: msg });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleApproveApplication = (appId: string) => {
    const target = applications.find(a => a.id === appId);
    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: 'approved' as const };
      }
      return app;
    });

    setApplications(updated);
    localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(updated));
    updateMerchantApplicationInDb(appId, { status: 'approved' });

    if (target) {
      if (googleUser && target.applicantEmail === googleUser.email) {
        setMerchantStatus('approved');
        localStorage.setItem('ballaar_merchant_status', 'approved');
        setMerchantStoreName(target.storeName);
        localStorage.setItem('ballaar_merchant_store_name', target.storeName);
        localStorage.setItem('ballaar_merchant_store_culture', target.culture);
        localStorage.setItem('ballaar_merchant_address', target.address);
        localStorage.setItem('ballaar_merchant_bio', target.bio);
        
        setUserRole('admin');
        setAdminCulture(target.culture);
      } else {
        setActionNotice({
          type: 'success',
          text: `Pendaftaran toko "${target.storeName}" (${target.applicantName}) disetujui.`
        });
      }
    }
  };

  const handleRejectApplication = (appId: string) => {
    const target = applications.find(a => a.id === appId);
    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: 'rejected' as const };
      }
      return app;
    });

    setApplications(updated);
    localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(updated));
    updateMerchantApplicationInDb(appId, { status: 'rejected' });

    if (target) {
      if (googleUser && target.applicantEmail.toLowerCase() === googleUser.email.toLowerCase()) {
        setMerchantStatus('rejected');
        localStorage.setItem('ballaar_merchant_status', 'rejected');
      } else {
        setActionNotice({
          type: 'info',
          text: `Pendaftaran toko "${target.storeName}" ditolak / ditangguhkan.`
        });
      }
    }
  };

  const handleLogoutEntirely = () => {
    firebaseLogout().catch(err => console.error("Error signing out: ", err));
    onResetManualExit?.();
    setGoogleUser(null);
    setUserRole('user');
    setMerchantStatus('none');
    setMerchantStoreName('');
    localStorage.removeItem('ballaar_google_user');
    localStorage.removeItem('ballaar_merchant_status');
    localStorage.removeItem('ballaar_merchant_store_name');
    localStorage.removeItem('ballaar_merchant_store_culture');
    localStorage.removeItem('ballaar_merchant_bio');
    localStorage.removeItem('ballaar_merchant_address');
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A2926]/45 backdrop-blur-md"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-screen max-w-md liquid-glass border-l border-white/85 shadow-2xl flex flex-col h-full"
        >
          {/* Header (Colored dynamically depending on Google Account & Admin state) */}
          <div className={`p-6 text-[#FAF8F3] relative transition-colors duration-300 backdrop-blur-xl ${
            !googleUser 
              ? 'bg-gradient-to-br from-[#10423E]/95 to-[#0A2926]/95 border-b border-[#D7B463]/20' 
              : userRole === 'platform_admin' || userRole === 'admin'
                ? 'bg-gradient-to-br from-[#4B3612]/95 to-[#1E180B]/95 border-b border-[#D7B463]/30' 
                : 'bg-gradient-to-br from-[#13524D]/95 to-[#0A2926]/95 border-b border-[#D7B463]/20'
          }`}>
            <button
              onClick={onClose}
              aria-label="Tutup panel profil"
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-[#FAF8F3]/85 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-4 mt-2">
              {!googleUser ? (
                // Unauthenticated State Header
                <>
                  <Logo className="w-14 h-14 border-[#D7B463]/40 bg-[#FAF8F3]/95" />
                  <div>
                    <h2 className="text-base font-bold font-serif text-[#FAF8F3]">Selamat Datang di Balla AR</h2>
                    <p className="text-[11px] text-[#D7B463]/90">Silakan Hubungkan Akun Google</p>
                  </div>
                </>
              ) : (
                // Authenticated State Header
                <>
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#13524D] via-[#C59B42] to-[#D7B463] shadow-md">
                    <img 
                      src={googleUser.avatar} 
                      alt="Google Avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-[#0A2926]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold font-serif leading-none text-[#FAF8F3]">
                        {googleUser.name}
                      </h2>
                      <BadgeCheck size={16} className="text-[#D7B463] shrink-0" />
                    </div>
                    <p className="text-[11px] text-[#E5EFED]/80 mt-1 truncate max-w-[220px]">
                      {googleUser.email}
                    </p>
                    <div className={`mt-2 inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      userRole === 'platform_admin' || userRole === 'admin'
                        ? 'bg-[#D7B463]/20 text-[#F7EFDB] border border-[#D7B463]/40' 
                        : userRole === 'curator'
                        ? 'bg-[#2C3E5A]/45 text-[#E5EFED] border border-[#D7B463]/30'
                        : 'bg-[#247B73]/30 text-[#E5EFED] border border-[#D7B463]/25'
                    }`}>
                      {userRole === 'platform_admin'
                        ? 'Admin Platform · Tim BALALA'
                        : userRole === 'admin' 
                        ? `Toko: ${getStoreName(adminCulture)}` 
                        : userRole === 'curator'
                        ? 'Kurator Adat'
                        : 'Kolektor Pusaka'
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">

            {/* IF NOT LOGGED IN WITH GOOGLE: SHOW ACCORDION GOOGLE LOGIN FLOW FIRST */}
            {!googleUser ? (
              <div className="space-y-4">
                <div className="liquid-glass-card rounded-3xl p-6 text-center space-y-5">
                  <div className="w-12 h-12 rounded-full bg-[#13524D]/10 border border-[#13524D]/20 flex items-center justify-center mx-auto text-[#13524D]">
                    <Lock size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[#10423E] font-serif">Verifikasi Akun Google Suku Warisan</h3>
                    <p className="text-xs text-[#445754] leading-relaxed px-1">
                      Untuk melihat galeri interaktif secara penuh, mengunggah produk kerajinan tradisi baru, atau menyinkronkan keranjang belanja, silakan hubungkan akun Google Anda terlebih dahulu.
                    </p>
                  </div>

                  {/* Google Sign-In Button */}
                  <button
                    onClick={handleGoogleSignInClick}
                    disabled={isGoogleLoading}
                    className="w-full liquid-glass-pill hover:bg-[#FAF8F3] text-[#10423E] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <div className="w-4 h-4 border-2 border-[#13524D] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.04-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                    )}
                    <span>{isGoogleLoading ? 'Menyambungkan...' : 'Masuk menggunakan Google'}</span>
                  </button>

                  <p className="text-[11px] text-[#5C6F6B]">
                    Layanan Otentikasi Balla AR Terenkripsi
                  </p>
                  {actionNotice && (
                    <div className="p-2.5 bg-[#9E3F44]/10 border border-[#9E3F44]/25 text-[#7C3238] rounded-xl text-[11px] font-medium text-left">
                      {actionNotice.text}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // IF LOGGED IN: SHOW MULTI-ROLE CONTAINER (Toko Penjual vs Kolektor Pembeli)
              <div className="space-y-5">
                {actionNotice && (
                  <div className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between gap-2 ${
                    actionNotice.type === 'error'
                      ? 'bg-[#9E3F44]/12 border-[#9E3F44]/30 text-[#7C3238]'
                      : actionNotice.type === 'info'
                      ? 'bg-[#F7EFDB] border-[#D7B463]/40 text-[#6E5118]'
                      : 'bg-[#13524D]/10 border-[#13524D]/25 text-[#10423E]'
                  }`}>
                    <span>{actionNotice.text}</span>
                    <button
                      type="button"
                      onClick={() => setActionNotice(null)}
                      aria-label="Tutup pemberitahuan"
                      className="opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Quick Favorites / Basket Counter summary */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-[#9E3F44]/10 border border-[#9E3F44]/20 w-9 h-9 rounded-xl flex items-center justify-center text-[#9E3F44]">
                      <Heart size={16} className="fill-[#9E3F44]/20" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#5C6F6B]">Favorit Koleksi</p>
                      <p className="text-sm font-bold text-[#10423E] tabular-nums">{favoritesCount} Barang</p>
                    </div>
                  </div>
                  <div className="liquid-glass-card p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-[#13524D]/10 border border-[#13524D]/20 w-9 h-9 rounded-xl flex items-center justify-center text-[#13524D]">
                      <Gift size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#5C6F6B]">Keranjang Belanja</p>
                      <p className="text-sm font-bold text-[#10423E] tabular-nums">{cartCount} Item</p>
                    </div>
                  </div>
                </div>

                {/* SUPER ADMIN & TIM BALALA 3D CONSOLE ENTRY - EXCLUSIVE FOR WIRABUANAMOHALFINOOR@GMAIL.COM */}
                {isAuthorizedPlatformAdmin(googleUser?.email) && (
                  <div className="liquid-glass-dark text-[#FAF8F3] rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D7B463]/15 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-[#D7B463]/20 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-extrabold text-[#D7B463] bg-[#D7B463]/12 px-2 py-0.5 rounded-md border border-[#D7B463]/30 uppercase tracking-widest block w-fit font-mono">
                          ADMIN PLATFORM · TIM BALALA
                        </span>
                        <h3 className="text-xs font-serif font-extrabold text-[#FAF8F3] flex items-center gap-1.5 mt-1.5">
                          Console Pengelola &amp; Workshop 3D
                        </h3>
                      </div>
                      <Store size={18} className="text-[#D7B463]" />
                    </div>

                    <p className="text-[10.5px] text-[#E5EFED]/80 leading-relaxed font-sans">
                      Akses eksklusif terverifikasi untuk akun utama pengelola Balla AR: kurasi aset 3D/AR (.glb &amp; .usdz), verifikasi UMKM mitra, kontrol katalog global, serta pelacakan komisi 1%–2% dan escrow transaksi.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setUserRole('platform_admin');
                        onClose();
                        onOpenPlatformAdmin?.();
                      }}
                      className="w-full liquid-glass-gold hover:brightness-105 text-[#0A2926] active:scale-[0.98] py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <Sparkles size={14} />
                      <span>Buka Console Admin Platform &amp; 3D (Tim BALALA)</span>
                    </button>

                    {/* Pending applicants quick list */}
                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-[9.5px] font-bold text-[#D7B463] uppercase tracking-wider font-mono">
                        Antrean Pengajuan Mitra ({applications.filter(a => a.status === 'pending').length})
                      </h4>

                      {applications.filter(a => a.status === 'pending').length === 0 ? (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                          <p className="text-[11px] text-[#E5EFED]/75 italic">Tidak ada pendaftaran mitra yang tertunda saat ini.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                          {applications.filter(a => a.status === 'pending').map((app) => (
                            <div 
                              key={app.id} 
                              className="p-3 bg-[#0A201E]/85 border border-[#D7B463]/20 rounded-xl space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[11px] text-[#FAF8F3] font-serif">{app.storeName}</span>
                                <span className="text-[10px] font-semibold text-[#D7B463]">
                                  {app.culture}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-[#E5EFED]/80 leading-normal">
                                <span className="font-bold text-[#D7B463]/85">Pemohon:</span> {app.applicantName} ({app.applicantEmail})
                              </div>
                              <div className="pt-1 flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRejectApplication(app.id)}
                                  className="flex-1 bg-[#7C3238]/30 hover:bg-[#7C3238]/50 border border-[#9E3F44]/40 text-[#F7DFDF] active:scale-95 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                                >
                                  Tolak
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveApplication(app.id)}
                                  className="flex-1 liquid-glass-gold hover:brightness-105 text-[#0A2926] active:scale-95 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer text-center"
                                >
                                  Setujui Mitra
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PROFILE INFORMATION EDIT AREA */}
                {userRole === 'user' && (
                  <div className="liquid-glass-card rounded-3xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-[#445754] flex items-center gap-1.5 mb-1">
                      <User size={13} className="text-[#13524D]" /> Informasi Pembeli Terdaftar
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5C6F6B] mb-1">Nama Pengguna Google</label>
                        <input
                          type="text"
                          disabled
                          value={googleUser.name}
                          className="w-full bg-[#EAE3D5]/55 border border-[#D7B463]/20 rounded-xl px-3 py-2 text-xs text-[#445754] outline-none cursor-not-allowed font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5C6F6B] mb-1">No. Kontak Penerima (WA)</label>
                        <input
                          type="text"
                          value={customPhone}
                          onChange={(e) => handleSavePhone(e.target.value)}
                          className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs tabular-nums outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIVE CULTURAL VOUCHERS */}
                {userRole === 'user' && (
                  <div className="liquid-glass-card rounded-3xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-[#445754] flex items-center gap-1.5 mb-1">
                      <Gift size={13} className="text-[#13524D]" /> Voucher Pelestari Kebudayaan
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="border border-dashed border-[#13524D]/35 bg-[#FAF8F3]/75 p-3 rounded-xl flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-[#10423E] truncate">Potongan Ongkir Adat</h4>
                          <p className="text-[10px] text-[#445754] mt-0.5 line-clamp-1">Diskon cargo kayu jatian sebesar Rp350Rb</p>
                        </div>
                        <button
                          onClick={() => handleCopyVoucher('KARYABUGIS10')}
                          className="text-[10px] font-bold liquid-glass-teal hover:brightness-110 text-[#FAF8F3] px-3 py-1.5 rounded-lg active:scale-95 transition-all text-center min-w-[76px] cursor-pointer"
                        >
                          {copiedVoucher === 'KARYABUGIS10' ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <Check size={11} /> Tersalin
                            </div>
                          ) : 'Salin Kode'}
                        </button>
                      </div>

                      <div className="border border-dashed border-[#A87F2D]/40 bg-[#F7EFDB]/65 p-3 rounded-xl flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-[#8C6820] truncate">Apresiasi Warisan 5%</h4>
                          <p className="text-[10px] text-[#445754] mt-0.5 line-clamp-1">Potongan 5% tanpa minimum pembelian</p>
                        </div>
                        <button
                          onClick={() => handleCopyVoucher('TORAJAWARISAN5')}
                          className="text-[10px] font-bold bg-[#A87F2D] hover:bg-[#8C6820] text-[#FAF8F3] px-3 py-1.5 rounded-lg active:scale-95 transition-all text-center min-w-[76px] cursor-pointer"
                        >
                          {copiedVoucher === 'TORAJAWARISAN5' ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <Check size={11} /> Tersalin
                            </div>
                          ) : 'Salin Kode'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DUAL PREFERENCES */}
                <div className="liquid-glass-card rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-[#445754] flex items-center gap-1.5 mb-1">
                    <Globe size={13} className="text-[#13524D]" /> Preferensi Akustik &amp; Bahasa
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-[#162624] block">Bahasa Aplikasi</span>
                        <span className="text-[10.5px] text-[#5C6F6B]">Atur deskripsi &amp; istilah adat</span>
                      </div>
                      <div className="flex liquid-glass-subtle p-0.5 rounded-lg">
                        <button
                          onClick={() => setLanguage('id')}
                          className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all cursor-pointer ${language === 'id' ? 'bg-[#FAF8F3] text-[#10423E] shadow-xs border border-[#D7B463]/20' : 'text-[#5C6F6B]'}`}
                        >
                          Indo
                        </button>
                        <button
                          onClick={() => setLanguage('en')}
                          className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all cursor-pointer ${language === 'en' ? 'bg-[#FAF8F3] text-[#10423E] shadow-xs border border-[#D7B463]/20' : 'text-[#5C6F6B]'}`}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-[#162624] block flex items-center gap-1">
                          <Volume2 size={13} className="text-[#13524D]" />
                          Narasi Filosofi Suara (Audio)
                        </span>
                        <span className="text-[10.5px] text-[#5C6F6B]">Bacakan deskripsi motif tradisi</span>
                      </div>
                      <button
                        onClick={() => setAudioGuide(!audioGuide)}
                        aria-label="Aktifkan narasi suara"
                        className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${audioGuide ? 'bg-[#13524D]' : 'bg-[#D6CFC2]'}`}
                      >
                        <div className={`w-4 h-4 bg-[#FAF8F3] rounded-full transition-transform ${audioGuide ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* LOG OUT BUTTON */}
                <button
                  onClick={handleLogoutEntirely}
                  className="w-full liquid-glass-pill hover:bg-[#9E3F44]/10 hover:text-[#9E3F44] text-[#445754] font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Keluar Akun Google Terhubung</span>
                </button>

                {/* COLLAPSED UMKM PARTNER REGISTRATION BUTTON (BELOW LOGOUT) */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMerchantRegistration?.();
                  }}
                  className="w-full liquid-glass-pill hover:bg-[#13524D]/10 hover:text-[#10423E] text-[#445754] font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Store size={14} className="shrink-0 text-[#13524D]" />
                  <span>
                    {merchantStatus === 'approved'
                      ? `Mitra Pengrajin UMKM (${currentUserApp?.storeName || merchantStoreName || 'Disetujui'})`
                      : merchantStatus === 'pending'
                      ? 'Pendaftaran Mitra UMKM (Menunggu ACC)'
                      : merchantStatus === 'rejected'
                      ? 'Daftar Mitra Pengrajin UMKM (Perbaiki)'
                      : 'Daftar Mitra Pengrajin UMKM'}
                  </span>
                </button>

              </div>
            )}

            <PWAInstallButton />

            {/* Creative Credit Footers */}
            <div className="liquid-glass-subtle p-4 rounded-2xl text-[11px] text-[#10423E] text-center leading-relaxed flex items-center justify-center gap-2">
              <ShieldAlert size={15} className="flex-shrink-0 text-[#A87F2D]" />
              <span>Aplikasi teruji di berbagai peranti seluler. Posisikan di pencahayaan seimbang saat mengkalibrasi AR.</span>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
