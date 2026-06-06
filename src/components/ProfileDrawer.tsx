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
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Google User')}&background=0d9488&color=fff&bold=true&size=150`
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-slate-50 shadow-2xl flex flex-col h-full"
        >
          {/* Header (Colored dynamically depending on Google Account & Admin state) */}
          <div className={`p-6 text-white relative transition-colors duration-300 ${
            !googleUser 
              ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800' 
              : userRole === 'admin' 
                ? 'bg-gradient-to-r from-amber-950 to-slate-900 border-b border-amber-500/20' 
                : 'bg-teal-955'
          }`}>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-4 mt-2">
              {!googleUser ? (
                // Unauthenticated State Header
                <>
                  <Logo className="w-14 h-14 border-slate-700 bg-slate-800" />
                  <div>
                    <h2 className="text-base font-bold font-serif">Selamat Datang di Balla AR</h2>
                    <p className="text-[11px] text-slate-400">Silakan Hubungkan Akun Google</p>
                  </div>
                </>
              ) : (
                // Authenticated State Header
                <>
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-teal-500 via-amber-500 to-rose-500 shadow-md">
                    <img 
                      src={googleUser.avatar} 
                      alt="Google Avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold font-serif leading-none">
                        {googleUser.name}
                      </h2>
                      <BadgeCheck size={16} className="text-sky-400 fill-sky-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1 truncate max-w-[220px]">
                      {googleUser.email}
                    </p>
                    <div className={`mt-2 inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      userRole === 'admin' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : userRole === 'curator'
                        ? 'bg-indigo-500/20 text-indigo-350 border border-indigo-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {userRole === 'admin' 
                        ? `🛠️ Toko: ${getStoreName(adminCulture)}` 
                        : userRole === 'curator'
                        ? '🛡️ Kurator Adat'
                        : '👤 Kolektor Pusaka'
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">

            {/* IF NOT LOGGED IN WITH GOOGLE: SHOW ACCORDION GOOGLE LOGIN FLOW FIRST */}
            {!googleUser ? (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-md text-center space-y-5">
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-600">
                    <Lock size={22} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-sans font-extrabold text-slate-800">Verifikasi Akun Google Suku Warisan</h3>
                    <p className="text-xs text-slate-500 leading-relaxed px-1">
                      Untuk melihat galeri interaktif secara penuh, mengunggah produk kerajinan tradisi baru, atau menyinkronkan keranjang belanja, silakan hubungkan akun Google Anda terlebih dahulu.
                    </p>
                  </div>

                  {/* Simulated Google Button */}
                  <button
                    onClick={handleGoogleSignInClick}
                    disabled={isGoogleLoading}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
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

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Layanan Otentikasi Balla AR Terenkripsi</span>
                  </div>
                </div>
              </div>
            ) : (
              // IF LOGGED IN: SHOW MULTI-ROLE CONTAINER (Toko Penjual vs Kolektor Pembeli)
              <div className="space-y-6">

                {/* Quick Favorites / Basket Counter summary */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xs">
                    <div className="bg-teal-50 w-8 h-8 rounded-xl flex items-center justify-center text-teal-600">
                      <Heart size={16} className="fill-teal-100" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Favorit Koleksi</p>
                      <p className="text-sm font-bold text-teal-950">{favoritesCount} Barang</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-xs">
                    <div className="bg-teal-50 w-8 h-8 rounded-xl flex items-center justify-center text-teal-600">
                      <Gift size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Keranjang Belanja</p>
                      <p className="text-sm font-bold text-teal-950">{cartCount} Item</p>
                    </div>
                  </div>
                </div>

                {/* SUPER ADMIN APPROVAL HUB - EXCLUSIVE FOR WIRABUANAMOHALFINOOR@GMAIL.COM */}
                {googleUser?.email === 'wirabuanamohalfinoor@gmail.com' && (
                  <div className="bg-gradient-to-br from-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-indigo-500/35 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-indigo-900/40 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/25 uppercase tracking-widest block w-fit font-mono">
                          👑 SUPER PLATFORM MANAGER
                        </span>
                        <h3 className="text-xs font-serif font-extrabold text-indigo-100 flex items-center gap-1.5 mt-1.5">
                          Pusat Persetujuan Adat (Wirabuana)
                        </h3>
                      </div>
                      <span className="text-xl">🛡️</span>
                    </div>

                    <p className="text-[10px] text-slate-350 leading-relaxed font-sans">
                      Sebagai perwakilan resmi Komite Penasihat Balla AR tingkat pusat, Anda memegang hak prerogatif penuh untuk menyetujui atau menolak pendaftaran pengrajin Sanggar Suku baru sebelum mereka diizinkan berdagang.
                    </p>

                    {/* Pending applicants list */}
                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-[9.5px] font-bold text-indigo-300 uppercase tracking-wider font-mono">
                        Daftar Pengajuan Masuk ({applications.filter(a => a.status === 'pending').length})
                      </h4>

                      {applications.filter(a => a.status === 'pending').length === 0 ? (
                        <div className="p-3 bg-indigo-950/45 rounded-xl border border-indigo-900/30 text-center">
                          <p className="text-[10px] text-indigo-305 italic">Tidak ada pendaftaran mitra yang tertunda saat ini.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                          {applications.filter(a => a.status === 'pending').map((app) => (
                            <div 
                              key={app.id} 
                              className="p-3 bg-slate-900/90 border border-indigo-900/40 rounded-xl space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[11px] text-indigo-200 font-serif">{app.storeName}</span>
                                <span className="text-[9px] font-semibold bg-indigo-950 border border-indigo-700 font-mono text-indigo-300 px-1.5 py-0.5 rounded-md uppercase">
                                  {app.culture}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-300 leading-normal">
                                <span className="font-bold text-slate-400">Pemohon:</span> {app.applicantName} ({app.applicantEmail})
                              </div>
                              <div className="text-[10px] bg-slate-950 p-2 rounded-lg text-slate-400 italic font-medium leading-relaxed">
                                "{app.bio}"
                              </div>
                              <div className="pt-1.5 flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRejectApplication(app.id)}
                                  className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 active:scale-95 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                                >
                                  ✕ Tolak
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveApplication(app.id)}
                                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-550 text-slate-950 active:scale-95 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer text-center"
                                >
                                  ✔ ACC Mitra
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Promotion Option */}
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-indigo-950 text-[10px] text-indigo-300 font-medium font-sans">
                      💡 Suku Teraktif saat ini: <strong className="text-white">Toraja & Sutra Mandar</strong>. Pendaftaran yang disetujui akan meluncurkan notifikasi instan.
                    </div>
                  </div>
                )}

                {/* ROLE MANAGEMENT & ACCESS ASSIGNMENT SECTION */}
                <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full translate-x-4 -translate-y-4 pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={13} className="text-teal-700" /> Otorisasi Akses Mitra
                    </h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Tab Selector Inside Role Section */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('user')}
                      className={`py-2 rounded-lg font-bold text-[9px] sm:text-[9.5px] transition-all cursor-pointer ${selectedLoginRole === 'user' ? 'bg-white text-teal-950 shadow-xs' : 'text-slate-500 hover:text-slate-805'}`}
                    >
                      👤 Pembeli
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('admin')}
                      className={`py-2 rounded-lg font-bold text-[9px] sm:text-[9.5px] transition-all cursor-pointer ${selectedLoginRole === 'admin' ? 'bg-white text-teal-950 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
                    >
                      🛠️ Penjual
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLoginRole('curator')}
                      className={`py-2 rounded-lg font-bold text-[9px] sm:text-[9.5px] transition-all cursor-pointer ${selectedLoginRole === 'curator' ? 'bg-white text-teal-950 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
                    >
                      🛡️ Kurator
                    </button>
                  </div>

                  {loginError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10.5px] font-medium flex items-center gap-1.5">
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
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800">Status Akses: Aktif</span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-150">
                                Kolektor / User
                              </span>
                            </div>

                            <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-teal-950 leading-tight">Pelestari & Pembeli</h4>
                                <p className="text-[9.5px] text-slate-450 mt-0.5">Melihat galeri & Simulasi Checkout Pusaka</p>
                              </div>
                              <span className="text-lg">🛍️</span>
                            </div>
                            <p className="text-[9.5px] text-slate-400 italic">
                              ✓ Anda masuk otomatis menggunakan Akun Google dengan peran Pembeli Budaya Nusantara.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-teal-50/40 border border-teal-100/50 rounded-xl text-xs space-y-1">
                              <p className="font-extrabold text-teal-950">Akses Pembeli Instan</p>
                              <p className="text-[10px] text-slate-500 leading-snug">
                                Beralih kembali ke peran Kolektor & Pembeli umum untuk melihat galeri secara utuh & melakukan checkout pelanggan.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePerformRoleSwitch('user')}
                              className="w-full bg-teal-900 hover:bg-teal-950 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
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
                              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-slate-800">Status Akses: Aktif</span>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                    Mitra Penjual
                                  </span>
                                </div>

                                <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-bold text-amber-900 leading-tight">{getStoreName(adminCulture)}</h4>
                                    <p className="text-[9.5px] text-slate-450 mt-0.5">Pemilik Hak Sanggar Suku {adminCulture}</p>
                                  </div>
                                  <span className="text-lg">🏛️</span>
                                </div>
                                <p className="text-[9.5px] text-amber-800/80 leading-relaxed italic">
                                  ✓ Pendaftaran akun Google Anda telah dikonfirmasi oleh Perusahaan. Menu "Tambah Produk Baru" kini aktif di panel atas galeri utama.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-3 bg-amber-50/45 border border-amber-100 rounded-xl text-xs">
                                  <p className="font-semibold text-amber-950">Akun Mitra Telah Verifikasi</p>
                                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                    Pendaftaran akun Anda sudah dikonfirmasi. Aktifkan peran Toko untuk mulai melestarikan & mengunggah pusaka baru.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePerformRoleSwitch('admin')}
                                  className="w-full bg-amber-600 hover:bg-amber-700 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
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
                            <div className="bg-amber-50/70 border border-amber-200/60 p-4 rounded-2xl text-xs space-y-3">
                              <div className="flex items-center gap-2 text-amber-850 font-bold">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span>Menunggu Konfirmasi Perusahaan</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Halo <strong>{googleUser.name}</strong>, formulir pendaftaran <strong>"{merchantStoreName}"</strong> telah diterima oleh tim pusat kami. Kami sedang menyeleksi kelayakan dokumen izin adat Anda.
                              </p>

                              <div className="bg-white p-2.5 rounded-xl border border-amber-100 space-y-1 text-[10px]">
                                <div className="flex justify-between"><span className="text-slate-450">Toko Adat:</span> <span className="font-semibold text-slate-700">{merchantStoreName}</span></div>
                                <div className="flex justify-between truncate"><span className="text-slate-450">Alamat:</span> <span className="font-semibold text-slate-700">{merchantAddress}</span></div>
                              </div>
                            </div>

                            {/* SIMULATION ADMIN CONFIRMATION TRIGGER (CRITICAL FOR USER TESTABILITY) */}
                            <div className="bg-slate-900 text-zinc-100 p-4 rounded-2xl border border-slate-800 space-y-3">
                              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider">
                                <Sparkles size={12} />
                                <span>Simulasi Admin Perusahaan</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-snug">
                                Untuk menyimulasikan persetujuan instan dari pihak perusahaan Balla AR selaku pemilik platform, klik tombol konfirmasi di bawah ini:
                              </p>
                              <button
                                type="button"
                                onClick={handleSimulateCompanyApproval}
                                className="w-full bg-gradient-to-r from-amber-550 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-2 rounded-xl text-[11px] shadow-md transition-all active:scale-97 cursor-pointer"
                              >
                                ✓ Konfirmasi Akun Google Menjadi Penjual
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* FORM PENDAFTARAN (merchantStatus === 'none') */
                          <form onSubmit={handleRegisterMerchantSubmit} className="space-y-3">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                              ⚠️ Anda masuk otomatis dengan Akun Google sebagai pembeli. Jika ingin menjadi Penjual (Pengrajin), Anda diharuskan mendaftarkan sanggar Anda terlebih dahulu ke perusahaan untuk dikonfirmasi.
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Nama Sanggar Adat / Toko</label>
                                <input
                                  type="text"
                                  placeholder="contoh: Sanggar Pusaka Somba Opu"
                                  value={merchantStoreName}
                                  onChange={(e) => setMerchantStoreName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500 outline-none"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Kontak Darurat</label>
                                <input
                                  type="text"
                                  disabled
                                  value={customPhone}
                                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-zinc-450 cursor-not-allowed text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Alamat Workshop / Sanggar Adat</label>
                                <input
                                  type="text"
                                  placeholder="Nama Jalan, Kec., Kabupaten, Sulawesi Selatan"
                                  value={merchantAddress}
                                  onChange={(e) => setMerchantAddress(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500 outline-none"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Rencana Karya Seni (Bio Toko)</label>
                                <textarea
                                  placeholder="Terangkan karya ukiran logam/kayu atau kain sutra yang diproduksi..."
                                  rows={2}
                                  value={merchantBio}
                                  onChange={(e) => setMerchantBio(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-amber-600 hover:bg-amber-700 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              <Briefcase size={13} className="shrink-0" />
                              <span>Kirim Pendaftaran ke Perusahaan kita</span>
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
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800">Status Akses: Aktif</span>
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-amber-400">
                                ⭐ KURATOR PLATFORM
                              </span>
                            </div>

                            <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-teal-950 leading-tight">Komite Evaluasi Adat</h4>
                                <p className="text-[9.5px] text-slate-450 mt-0.5">Memasang & mendaftar status kurasi produk global</p>
                              </div>
                              <span className="text-xl">🛡️</span>
                            </div>
                            <p className="text-[9.5px] text-slate-400 italic">
                              ✓ Anda masuk otomatis sebagai Kurator Balla AR. Panel Kurasi Khusus kini aktif di halaman utama untuk menyeleksi produk baru dari para pengrajin.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-indigo-50/45 border border-indigo-100 rounded-xl text-xs">
                              <p className="font-semibold text-indigo-950">Ujicoba Mode Kurator</p>
                              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                                Beralih peran menjadi perwakilan Admin/Komite Kurator Balla AR untuk menyaring produk baru yang diajukan oleh sanggar.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePerformRoleSwitch('curator')}
                              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
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
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <User size={13} /> Informasi Pembeli Terdaftar
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Pengguna Google</label>
                        <input
                          type="text"
                          disabled
                          value={googleUser.name}
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 outline-none cursor-not-allowed font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">No. Kontak Penerima (WA)</label>
                        <input
                          type="text"
                          value={customPhone}
                          onChange={(e) => handleSavePhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIVE CULTURAL VOUCHERS */}
                {userRole === 'user' && (
                  <div className="bg-white rounded-3xl p-5 border border-slate-105 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Gift size={13} /> Voucher Pelestari Kebudayaan
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="border border-dashed border-teal-500/30 bg-teal-50/40 p-3 rounded-xl flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-teal-900 truncate">Potongan Ongkir Adat</h4>
                          <p className="text-[9.5px] text-slate-450 mt-0.5 line-clamp-1">Diskon cargo kayu jatian sebesar Rp350Rb</p>
                        </div>
                        <button
                          onClick={() => handleCopyVoucher('KARYABUGIS10')}
                          className="text-[10px] font-bold bg-teal-600 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all text-center min-w-[76px] cursor-pointer"
                        >
                          {copiedVoucher === 'KARYABUGIS10' ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <Check size={11} /> Copied
                            </div>
                          ) : 'Salin Ko'}
                        </button>
                      </div>

                      <div className="border border-dashed border-amber-500/30 bg-amber-50/40 p-3 rounded-xl flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-bold text-amber-900 truncate">Apresiasi Warisan 5%</h4>
                          <p className="text-[9.5px] text-slate-450 mt-0.5 line-clamp-1">Potongan 5% tanpa minimum pembelian</p>
                        </div>
                        <button
                          onClick={() => handleCopyVoucher('TORAJAWARISAN5')}
                          className="text-[10px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all text-center min-w-[76px] cursor-pointer"
                        >
                          {copiedVoucher === 'TORAJAWARISAN5' ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <Check size={11} /> Copied
                            </div>
                          ) : 'Salin Ko'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DUAL PREFERENCES */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Globe size={13} /> Preferensi Akustik & Bahasa
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-805 block">Bahasa Aplikasi</span>
                        <span className="text-[10px] text-slate-400">Atur deskripsi & istilah adat</span>
                      </div>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          onClick={() => setLanguage('id')}
                          className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all cursor-pointer ${language === 'id' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-400'}`}
                        >
                          Indo
                        </button>
                        <button
                          onClick={() => setLanguage('en')}
                          className={`px-3 py-1 rounded-md font-bold text-[10px] transition-all cursor-pointer ${language === 'en' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-400'}`}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-805 block flex items-center gap-1">
                          <Volume2 size={13} className="text-teal-650" />
                          Narasi Filosofi Suara (Audio)
                        </span>
                        <span className="text-[10px] text-slate-400">Bacakan deskripsi motif tradisi</span>
                      </div>
                      <button
                        onClick={() => setAudioGuide(!audioGuide)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${audioGuide ? 'bg-teal-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${audioGuide ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* LOG OUT BUTTON (Keluari dari akun Google sepenuhnya) */}
                <button
                  onClick={handleLogoutEntirely}
                  className="w-full bg-slate-200 hover:bg-slate-300 hover:text-rose-600 text-slate-700 font-extrabold py-3.5 rounded-2xl text-[11px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Keluar Akun Google Terhubung</span>
                </button>

              </div>
            )}

            {/* Creative Credit Footers */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-500/10 text-[10px] text-teal-800 text-center leading-relaxed flex items-center justify-center gap-2">
              <ShieldAlert size={15} className="flex-shrink-0 text-teal-600" />
              <span>Aplikasi teruji di berbagai peranti seluler. Posisikan di pencahayaan seimbang saat mengkalibrasi AR.</span>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
