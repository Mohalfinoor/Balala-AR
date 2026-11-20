import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, logout as firebaseLogout } from '../firebase';
import Logo from './Logo';
import { 
  X, 
  User, 
  Heart, 
  Gift, 
  ShieldAlert, 
  Globe, 
  MapPin, 
  BadgeCheck, 
  Volume2, 
  Check, 
  Lock, 
  Store, 
  Briefcase, 
  LogIn, 
  LogOut,
  Sparkles
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoritesCount: number;
  cartCount: number;
  userRole: 'user' | 'admin' | 'curator';
  setUserRole: (role: 'user' | 'admin' | 'curator') => void;
  adminCulture: string;
  setAdminCulture: (culture: string) => void;
  googleUser: { name: string; email: string; avatar: string; } | null;
  setGoogleUser: (user: { name: string; email: string; avatar: string; } | null) => void;
}

interface MerchantApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  storeName: string;
  culture: string;
  address: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
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
  setGoogleUser
}: ProfileDrawerProps) {
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [audioGuide, setAudioGuide] = useState<boolean>(true);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Profile fields filled automatically from Google
  const [customPhone, setCustomPhone] = useState(() => {
    return localStorage.getItem('ballaar_profile_phone') || '0852-4412-3392';
  });

  // Register requests list with auto mock-ups for review
  const [applications, setApplications] = useState<MerchantApplication[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_global_merchant_applications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const defaults: MerchantApplication[] = [
      {
        id: 'app-1',
        applicantName: 'Tamu Nusantara',
        applicantEmail: 'tamu.nusantara@gmail.com',
        storeName: 'Sutra Mandar Cantika',
        culture: 'Mandar',
        address: 'Polman, Sulawesi Barat',
        bio: 'Penenun sutera Mandar tradisional bermotif Sureq Marasa klasik kelas premium.',
        status: 'pending'
      },
      {
        id: 'app-2',
        applicantName: 'Nenek Cantika Toraja',
        applicantEmail: 'cantika_toraja@gmail.com',
        storeName: 'Ukir Toraja Lemo',
        culture: 'Toraja',
        address: 'Lemo, Kabupaten Tana Toraja',
        bio: 'Pemahat miniatur tongkonan, kerajinan ukiran perisai kayu Lemo asli.',
        status: 'pending'
      }
    ];
    try {
      localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  });

  // Sync current user's merchant status when googleUser changes or applications list updates
  useEffect(() => {
    if (googleUser) {
      const myApp = applications.find(a => a.applicantEmail === googleUser.email);
      if (myApp) {
        const correspondingStatus = myApp.status === 'approved' ? 'approved' : myApp.status === 'rejected' ? 'none' : 'pending';
        setMerchantStatus(correspondingStatus);
        localStorage.setItem('ballaar_merchant_status', correspondingStatus);
        if (myApp.status === 'approved') {
          setMerchantStoreName(myApp.storeName);
          setMerchantStoreCulture(myApp.culture);
          setMerchantAddress(myApp.address);
          setMerchantBio(myApp.bio);
          localStorage.setItem('ballaar_merchant_store_name', myApp.storeName);
          localStorage.setItem('ballaar_merchant_store_culture', myApp.culture);
          localStorage.setItem('ballaar_merchant_address', myApp.address);
          localStorage.setItem('ballaar_merchant_bio', myApp.bio);
        }
      } else {
        // Fallback if no application found
        const curStatus = (localStorage.getItem('ballaar_merchant_status') as 'none' | 'pending' | 'approved') || 'none';
        setMerchantStatus(curStatus);
      }
    }
  }, [googleUser, applications]);

  // Merchant Application States (mendaftar ke perusahaan agar dikonfirmasi menjadi penjual)
  const [merchantStatus, setMerchantStatus] = useState<'none' | 'pending' | 'approved'>(() => {
    return (localStorage.getItem('ballaar_merchant_status') as 'none' | 'pending' | 'approved') || 'none';
  });
  const [merchantStoreName, setMerchantStoreName] = useState(() => {
    return localStorage.getItem('ballaar_merchant_store_name') || '';
  });
  const [merchantStoreCulture, setMerchantStoreCulture] = useState(() => {
    return localStorage.getItem('ballaar_merchant_store_culture') || 'Toraja';
  });
  const [merchantBio, setMerchantBio] = useState(() => {
    return localStorage.getItem('ballaar_merchant_bio') || '';
  });
  const [merchantAddress, setMerchantAddress] = useState(() => {
    return localStorage.getItem('ballaar_merchant_address') || '';
  });

  // Role selections
  const [selectedLoginRole, setSelectedLoginRole] = useState<'user' | 'admin' | 'curator'>(userRole);
  const [loginError, setLoginError] = useState('');
  const [isLoginSuccessMsg, setIsLoginSuccessMsg] = useState(false);

  // Sync role selector when userRole changes from parent
  useEffect(() => {
    setSelectedLoginRole(userRole);
  }, [userRole]);




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
    try {
      const user = await signInWithGoogle();
      if (user) {
        const loggedInUser = {
          name: user.displayName || 'Google User',
          email: user.email || '',
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Google User')}&background=13524D&color=FAF8F3&bold=true&size=150`
        };
        setGoogleUser(loggedInUser);
        
        // Auto initialize user role based on email context
        if (loggedInUser.email === 'wirabuanamohalfinoor@gmail.com' || loggedInUser.email === 'mohalfinoorw@gmail.com') {
          setUserRole('admin');
          setSelectedLoginRole('admin');
        } else {
          setUserRole('user');
          setSelectedLoginRole('user');
        }
      }
    } catch (err: any) {
      console.error("Login Error: ", err);
      if (err.message && err.message.includes('auth/popup-blocked')) {
        alert("Gagal melakukan login Google: Popup diblokir oleh peramban Anda. Mohon izinkan popup untuk situs ini.");
      } else {
        alert("Gagal melakukan login Google: " + (err.message || err));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePerformRoleSwitch = (role: 'user' | 'admin' | 'curator') => {
    setLoginError('');
    if (role === 'admin') {
      if (merchantStatus !== 'approved') {
        setLoginError('Sandi admin dilewati. Anda harus mendaftarkan diri dahulu & dikonfirmasi oleh perusahaan.');
        setSelectedLoginRole('admin');
        return;
      }
      setUserRole('admin');
      setAdminCulture(merchantStoreCulture);
    } else if (role === 'curator') {
      setUserRole('curator');
    } else {
      setUserRole('user');
    }

    setIsLoginSuccessMsg(true);
    setTimeout(() => {
      setIsLoginSuccessMsg(false);
    }, 1500);
  };

  const handleRegisterMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!merchantStoreName.trim()) {
      setLoginError('Nama Sanggar Adat / Toko wajib diisi.');
      return;
    }
    if (!merchantAddress.trim()) {
      setLoginError('Alamat Workshop / Sanggar wajib diisi.');
      return;
    }

    setMerchantStatus('pending');
    localStorage.setItem('ballaar_merchant_status', 'pending');
    localStorage.setItem('ballaar_merchant_store_name', merchantStoreName);
    localStorage.setItem('ballaar_merchant_store_culture', merchantStoreCulture);
    localStorage.setItem('ballaar_merchant_bio', merchantBio);
    localStorage.setItem('ballaar_merchant_address', merchantAddress);

    // Save into shared database list as a pending request!
    const newApp: MerchantApplication = {
      id: 'app-' + Date.now(),
      applicantName: googleUser?.name || 'Tamu Nusantara',
      applicantEmail: googleUser?.email || 'tamu.nusantara@gmail.com',
      storeName: merchantStoreName,
      culture: merchantStoreCulture,
      address: merchantAddress,
      bio: merchantBio || 'Produksi benda hias nilai tinggi khas nusantara.',
      status: 'pending'
    };

    const currentApps = [...applications.filter(a => a.applicantEmail !== newApp.applicantEmail), newApp];
    setApplications(currentApps);
    localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(currentApps));

    setIsLoginSuccessMsg(true);
    setTimeout(() => {
      setIsLoginSuccessMsg(false);
    }, 1500);
  };

  const handleSimulateCompanyApproval = () => {
    setLoginError('');
    setMerchantStatus('approved');
    localStorage.setItem('ballaar_merchant_status', 'approved');
    
    // Set active parent role configurations
    setUserRole('admin');
    setAdminCulture(merchantStoreCulture);
    setSelectedLoginRole('admin');

    // Also update/sync the global applications list
    const newApp: MerchantApplication = {
      id: 'app-' + Date.now(),
      applicantName: googleUser?.name || 'Tamu Nusantara',
      applicantEmail: googleUser?.email || 'tamu.nusantara@gmail.com',
      storeName: merchantStoreName || getStoreName(merchantStoreCulture),
      culture: merchantStoreCulture,
      address: merchantAddress || 'Makassar, Sulawesi Selatan',
      bio: merchantBio || 'Eksportir & Pengrajin terverifikasi',
      status: 'approved'
    };

    const currentApps = [...applications.filter(a => a.applicantEmail !== newApp.applicantEmail), newApp];
    setApplications(currentApps);
    localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(currentApps));
    
    setIsLoginSuccessMsg(true);
    setTimeout(() => {
      setIsLoginSuccessMsg(false);
    }, 1500);
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

    if (target) {
      // If the approved user's email matches currently logged in user, apply it live!
      if (googleUser && target.applicantEmail === googleUser.email) {
        setMerchantStatus('approved');
        localStorage.setItem('ballaar_merchant_status', 'approved');
        setMerchantStoreName(target.storeName);
        setMerchantStoreCulture(target.culture);
        setMerchantAddress(target.address);
        setMerchantBio(target.bio);
        localStorage.setItem('ballaar_merchant_store_name', target.storeName);
        localStorage.setItem('ballaar_merchant_store_culture', target.culture);
        localStorage.setItem('ballaar_merchant_address', target.address);
        localStorage.setItem('ballaar_merchant_bio', target.bio);
        
        setUserRole('admin');
        setAdminCulture(target.culture);
        setSelectedLoginRole('admin');
      } else {
        alert(`SUKSES: Pendaftaran toko "${target.storeName}" oleh ${target.applicantName} (${target.applicantEmail}) telah berhasil Anda ACC / SETUJUI.`);
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

    if (target) {
      if (googleUser && target.applicantEmail === googleUser.email) {
        setMerchantStatus('none');
        localStorage.setItem('ballaar_merchant_status', 'none');
      } else {
        alert(`INFO: Pendaftaran toko ${target.storeName} telah ditangguhkan/ditolak.`);
      }
    }
  };

  const handleLogoutEntirely = () => {
    firebaseLogout().catch(err => console.error("Error signing out: ", err));
    setGoogleUser(null);
    setUserRole('user');
    setSelectedLoginRole('user');
    setIsLoginSuccessMsg(false);
    setLoginError('');
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
              : userRole === 'admin' 
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
                      userRole === 'admin' 
                        ? 'bg-[#D7B463]/20 text-[#F7EFDB] border border-[#D7B463]/40' 
                        : userRole === 'curator'
                        ? 'bg-[#2C3E5A]/45 text-[#E5EFED] border border-[#D7B463]/30'
                        : 'bg-[#247B73]/30 text-[#E5EFED] border border-[#D7B463]/25'
                    }`}>
                      {userRole === 'admin' 
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
                </div>
              </div>
            ) : (
              // IF LOGGED IN: SHOW MULTI-ROLE CONTAINER (Toko Penjual vs Kolektor Pembeli)
              <div className="space-y-5">

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

                {/* SUPER ADMIN APPROVAL HUB - EXCLUSIVE FOR WIRABUANAMOHALFINOOR@GMAIL.COM */}
                {googleUser?.email === 'wirabuanamohalfinoor@gmail.com' && (
                  <div className="liquid-glass-dark text-[#FAF8F3] rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D7B463]/15 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-[#D7B463]/20 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-extrabold text-[#D7B463] bg-[#D7B463]/12 px-2 py-0.5 rounded-md border border-[#D7B463]/30 uppercase tracking-widest block w-fit font-mono">
                          SUPER PLATFORM MANAGER
                        </span>
                        <h3 className="text-xs font-serif font-extrabold text-[#FAF8F3] flex items-center gap-1.5 mt-1.5">
                          Pusat Persetujuan Adat (Wirabuana)
                        </h3>
                      </div>
                      <Store size={18} className="text-[#D7B463]" />
                    </div>

                    <p className="text-[10px] text-[#E5EFED]/75 leading-relaxed font-sans">
                      Sebagai perwakilan resmi Komite Penasihat Balla AR tingkat pusat, Anda memegang hak prerogatif penuh untuk menyetujui atau menolak pendaftaran pengrajin Sanggar Suku baru sebelum mereka diizinkan berdagang.
                    </p>

                    {/* Pending applicants list */}
                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-[9.5px] font-bold text-[#D7B463] uppercase tracking-wider font-mono">
                        Daftar Pengajuan Masuk ({applications.filter(a => a.status === 'pending').length})
                      </h4>

                      {applications.filter(a => a.status === 'pending').length === 0 ? (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                          <p className="text-[11px] text-[#E5EFED]/75 italic">Tidak ada pendaftaran mitra yang tertunda saat ini.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
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
                              <div className="text-[10px] bg-[#071816]/80 p-2 rounded-lg text-[#E5EFED]/75 italic font-medium leading-relaxed border border-white/5">
                                "{app.bio}"
                              </div>
                              <div className="pt-1.5 flex gap-1.5">
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

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-[10.5px] text-[#E5EFED]/85 font-medium">
                      Suku Teraktif saat ini: <strong className="text-[#D7B463]">Toraja &amp; Sutra Mandar</strong>. Pendaftaran yang disetujui meluncurkan notifikasi instan.
                    </div>
                  </div>
                )}

                {/* ROLE MANAGEMENT & ACCESS ASSIGNMENT SECTION */}
                <div className="liquid-glass-card rounded-3xl p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-[#10423E] flex items-center gap-1.5">
                      <Lock size={13} className="text-[#13524D]" /> Otorisasi Akses Mitra
                    </h3>
                  </div>

                  {/* Tab Selector Inside Role Section */}
                  <div className="grid grid-cols-3 gap-1 p-1 liquid-glass-subtle rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('user')}
                      className={`py-2 rounded-lg font-bold text-[9px] sm:text-[9.5px] transition-all cursor-pointer ${selectedLoginRole === 'user' ? 'bg-[#FAF8F3] text-[#10423E] shadow-xs border border-[#D7B463]/25' : 'text-[#5C6F6B] hover:text-[#10423E]'}`}
                    >
                      Pembeli
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('admin')}
                      className={`py-2 rounded-lg font-bold text-[9px] sm:text-[9.5px] transition-all cursor-pointer ${selectedLoginRole === 'admin' ? 'bg-[#FAF8F3] text-[#10423E] shadow-xs border border-[#D7B463]/25' : 'text-[#5C6F6B] hover:text-[#10423E]'}`}
                    >
                      Penjual
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('curator')}
                      className={`py-2 rounded-lg font-bold text-[9px] sm:text-[9.5px] transition-all cursor-pointer ${selectedLoginRole === 'curator' ? 'bg-[#FAF8F3] text-[#10423E] shadow-xs border border-[#D7B463]/25' : 'text-[#5C6F6B] hover:text-[#10423E]'}`}
                    >
                      Kurator
                    </button>
                  </div>

                  {loginError && (
                    <div className="p-2.5 bg-[#9E3F44]/10 border border-[#9E3F44]/25 text-[#7C3238] rounded-xl text-[10.5px] font-medium flex items-center gap-1.5">
                      <ShieldAlert size={12} className="shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {selectedLoginRole === 'user' ? (
                      /* USER TAB CONTENT */
                      <motion.div
                        key="user-tab-panel"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        {userRole === 'user' ? (
                          <div className="bg-[#FAF8F3]/75 border border-[#D7B463]/25 p-3.5 rounded-2xl text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#162624]">Status Akses: Aktif</span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#13524D]/12 text-[#10423E] border border-[#13524D]/25">
                                Kolektor / User
                              </span>
                            </div>

                            <div className="bg-[#FAF8F3] p-2.5 rounded-xl border border-[#13524D]/10 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-[#10423E] leading-tight">Pelestari &amp; Pembeli</h4>
                                <p className="text-[9.5px] text-[#5C6F6B] mt-0.5">Melihat galeri &amp; Simulasi Checkout Pusaka</p>
                              </div>
                              <User size={16} className="text-[#13524D]" />
                            </div>
                            <p className="text-[9.5px] text-[#5C6F6B] italic">
                              Anda masuk otomatis menggunakan Akun Google dengan peran Pembeli Budaya Nusantara.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-[#13524D]/8 border border-[#13524D]/20 rounded-xl text-xs space-y-1">
                              <p className="font-extrabold text-[#10423E]">Akses Pembeli Instan</p>
                              <p className="text-[10px] text-[#445754] leading-snug">
                                Beralih kembali ke peran Kolektor &amp; Pembeli umum untuk melihat galeri secara utuh &amp; melakukan checkout pelanggan.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePerformRoleSwitch('user')}
                              className="w-full liquid-glass-teal hover:brightness-110 text-[#FAF8F3] font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              <LogIn size={13} />
                              <span>Ganti Peran ke Mode Pembeli</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ) : selectedLoginRole === 'admin' ? (
                      /* ADMIN/MERCHANT TAB CONTENT depending on merchantStatus */
                      <motion.div
                        key="admin-tab-panel"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        {merchantStatus === 'approved' ? (
                          /* MITRA SUDAH DISETUJUI PERUSAHAAN */
                          <div className="space-y-3">
                            {userRole === 'admin' ? (
                              <div className="bg-[#FAF8F3]/75 border border-[#D7B463]/30 p-3.5 rounded-2xl text-xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-[#162624]">Status Akses: Aktif</span>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F7EFDB] text-[#A87F2D] border border-[#D7B463]/40">
                                    Mitra Penjual
                                  </span>
                                </div>

                                <div className="bg-[#FAF8F3] p-2.5 rounded-xl border border-[#D7B463]/20 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-[#A87F2D] leading-tight">{getStoreName(adminCulture)}</h4>
                                    <p className="text-[9.5px] text-[#5C6F6B] mt-0.5">Pemilik Hak Sanggar Suku {adminCulture}</p>
                                  </div>
                                  <Store size={16} className="text-[#A87F2D]" />
                                </div>
                                <p className="text-[9.5px] text-[#A87F2D] leading-relaxed italic">
                                  Pendaftaran akun Google Anda telah dikonfirmasi oleh Perusahaan. Menu "Tambah Produk Baru" kini aktif di panel atas galeri utama.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-3 bg-[#F7EFDB]/65 border border-[#D7B463]/35 rounded-xl text-xs">
                                  <p className="font-semibold text-[#6E5118]">Akun Mitra Telah Verifikasi</p>
                                  <p className="text-[10px] text-[#445754] mt-1 leading-snug">
                                    Pendaftaran akun Anda sudah dikonfirmasi. Aktifkan peran Toko untuk mulai melestarikan &amp; mengunggah pusaka baru.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePerformRoleSwitch('admin')}
                                  className="w-full liquid-glass-gold hover:brightness-105 text-[#0A2926] font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                >
                                  <LogIn size={13} />
                                  <span>Ganti Peran ke Mode Penjual</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : merchantStatus === 'pending' ? (
                          /* PROSES PENDAFTARAN MENUNGGU KONFIRMASI */
                          <div className="space-y-4">
                            <div className="bg-[#F7EFDB]/75 border border-[#D7B463]/40 p-4 rounded-2xl text-xs space-y-3">
                              <div className="flex items-center gap-2 text-[#8C6820] font-bold">
                                <div className="w-2 h-2 rounded-full bg-[#C59B42] shrink-0" />
                                <span>Menunggu Konfirmasi Perusahaan</span>
                              </div>
                              <p className="text-[11px] text-[#445754] leading-relaxed">
                                Halo <strong>{googleUser.name}</strong>, formulir pendaftaran <strong>"{merchantStoreName}"</strong> telah diterima oleh tim pusat kami. Kami sedang menyeleksi kelayakan dokumen izin adat Anda.
                              </p>

                              <div className="bg-[#FAF8F3] p-2.5 rounded-xl border border-[#D7B463]/25 space-y-1 text-[10px]">
                                <div className="flex justify-between"><span className="text-[#5C6F6B]">Toko Adat:</span> <span className="font-semibold text-[#162624]">{merchantStoreName}</span></div>
                                <div className="flex justify-between truncate"><span className="text-[#5C6F6B]">Alamat:</span> <span className="font-semibold text-[#162624]">{merchantAddress}</span></div>
                              </div>
                            </div>

                            {/* SIMULATION ADMIN CONFIRMATION TRIGGER */}
                            <div className="liquid-glass-dark text-[#FAF8F3] p-4 rounded-2xl space-y-3">
                              <div className="flex items-center gap-1.5 text-[#D7B463] font-extrabold text-[10px] uppercase tracking-wider">
                                <Sparkles size={12} />
                                <span>Simulasi Admin Perusahaan</span>
                              </div>
                              <p className="text-[10px] text-[#E5EFED]/75 leading-snug">
                                Untuk menyimulasikan persetujuan instan dari pihak perusahaan Balla AR selaku pemilik platform, klik tombol konfirmasi di bawah ini:
                              </p>
                              <button
                                type="button"
                                onClick={handleSimulateCompanyApproval}
                                className="w-full liquid-glass-gold hover:brightness-105 text-[#0A2926] font-extrabold py-2 rounded-xl text-[11px] shadow-md transition-all active:scale-[0.98] cursor-pointer"
                              >
                                Konfirmasi Akun Google Menjadi Penjual
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* FORM PENDAFTARAN (merchantStatus === 'none') */
                          <form onSubmit={handleRegisterMerchantSubmit} className="space-y-3">
                            <div className="p-3 liquid-glass-subtle rounded-2xl text-[11px] text-[#445754] leading-relaxed">
                              Anda masuk otomatis sebagai pembeli. Jika ingin menjadi Penjual (Pengrajin), daftarkan sanggar Anda terlebih dahulu untuk konfirmasi.
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="space-y-1">
                                <label className="block text-[10.5px] font-semibold text-[#445754]">Nama Sanggar Adat / Toko</label>
                                <input
                                  type="text"
                                  placeholder="contoh: Sanggar Pusaka Somba Opu"
                                  value={merchantStoreName}
                                  onChange={(e) => setMerchantStoreName(e.target.value)}
                                  className="w-full liquid-glass-input rounded-xl px-3 py-2 outline-none"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10.5px] font-semibold text-[#445754]">Kontak Darurat</label>
                                <input
                                  type="text"
                                  disabled
                                  value={customPhone}
                                  className="w-full bg-[#EAE3D5]/55 border border-[#D7B463]/20 rounded-xl px-3 py-2 text-[#5C6F6B] cursor-not-allowed text-xs tabular-nums"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10.5px] font-semibold text-[#445754]">Alamat Workshop / Sanggar Adat</label>
                                <input
                                  type="text"
                                  placeholder="Nama Jalan, Kec., Kabupaten, Sulawesi Selatan"
                                  value={merchantAddress}
                                  onChange={(e) => setMerchantAddress(e.target.value)}
                                  className="w-full liquid-glass-input rounded-xl px-3 py-2 outline-none"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10.5px] font-semibold text-[#445754]">Rencana Karya Seni (Bio Toko)</label>
                                <textarea
                                  placeholder="Terangkan karya ukiran logam/kayu atau kain sutra yang diproduksi..."
                                  rows={2}
                                  value={merchantBio}
                                  onChange={(e) => setMerchantBio(e.target.value)}
                                  className="w-full liquid-glass-input rounded-xl px-3 py-2 outline-none resize-none"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full liquid-glass-gold hover:brightness-105 text-[#0A2926] font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              <Briefcase size={13} className="shrink-0" />
                              <span>Kirim Pendaftaran ke Perusahaan</span>
                            </button>
                          </form>
                        )}
                      </motion.div>
                    ) : (
                      /* CURATOR TAB CONTENT */
                      <motion.div
                        key="curator-tab-panel"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3"
                      >
                        {userRole === 'curator' ? (
                          <div className="bg-[#FAF8F3]/75 border border-[#D7B463]/25 p-3.5 rounded-2xl text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#162624]">Status Akses: Aktif</span>
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#0A2926] border border-[#D7B463]/40 text-[#D7B463]">
                                KURATOR PLATFORM
                              </span>
                            </div>

                            <div className="bg-[#FAF8F3] p-2.5 rounded-xl border border-[#13524D]/10 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-[#10423E] leading-tight">Komite Evaluasi Adat</h4>
                                <p className="text-[9.5px] text-[#5C6F6B] mt-0.5">Memasang &amp; mendaftar status kurasi produk global</p>
                              </div>
                              <BadgeCheck size={18} className="text-[#13524D]" />
                            </div>
                            <p className="text-[9.5px] text-[#5C6F6B] italic">
                              Anda masuk otomatis sebagai Kurator Balla AR. Panel Kurasi Khusus kini aktif di halaman utama untuk menyeleksi produk baru dari para pengrajin.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-[#2C3E5A]/8 border border-[#2C3E5A]/20 rounded-xl text-xs">
                              <p className="font-semibold text-[#1E2E46]">Ujicoba Mode Kurator</p>
                              <p className="text-[10px] text-[#445754] mt-1 leading-snug">
                                Beralih peran menjadi perwakilan Admin/Komite Kurator Balla AR untuk menyaring produk baru yang diajukan oleh sanggar.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePerformRoleSwitch('curator')}
                              className="w-full liquid-glass-dark hover:brightness-110 text-[#FAF8F3] font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              <LogIn size={13} />
                              <span>Aktifkan Mode Kurator</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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

              </div>
            )}

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
