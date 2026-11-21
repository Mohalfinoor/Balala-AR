/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Menu, 
  Bell, 
  Home, 
  Heart, 
  ShoppingBag, 
  User, 
  Maximize2, 
  ChevronRight, 
  Star, 
  ArrowLeft, 
  Scan, 
  BookOpen, 
  RotateCcw, 
  Share2,
  ExternalLink,
  ChevronLeft,
  X,
  Check,
  CheckCircle2,
  Shield,
  Trash2,
  Plus,
  Sparkles,
  Move,
  Ruler,
  Hammer,
  Camera,
  Video,
  VideoOff,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Product Asset Imports ---
import heroBallaShowcase from './assets/images/hero_balla_showcase_1794804419592.jpg';
import torajaChairImage from './assets/images/toraja_chair_1781263138778.jpg';
import bugisWardrobeImage from './assets/images/bugis_wardrobe_1781263155490.jpg';
import torajaTableImage from './assets/images/toraja_table_1781263167340.jpg';
import makassarCabinetImage from './assets/images/makassar_cabinet_truly_clean_1781266903181.jpg';
import mandarSofaImage from './assets/images/mandar_sofa_1781263192650.jpg';
import bugisBuffetImage from './assets/images/bugis_buffet_1781263208294.jpg';
import pareppoGlb from './assets/images/Kursi-Tamu-Pareppo-v1.glb';
import pareppoUsdz from './assets/images/Kursi-Tamu-Pareppo-v1.usdz';
import lemariBugisGlb from './assets/images/Lemari-Ukir-Sulur-Bugis-v1.glb';
import lemariBugisUsdz from './assets/images/Lemari-Ukir-Sulur-Bugis-v1.usdz';
import mejaPassuraGlb from './assets/images/Meja-Makan-Passura-v1.glb';
import mejaPassuraUsdz from './assets/images/Meja-Makan-Passura-v1.usdz';
import phinisiGlb from './assets/images/Lemari-Ukir-Phinisi-v1.glb';
import phinisiUsdz from './assets/images/Lemari-Ukir-Phinisi-v1.usdz';
import buffetBugisGlb from './assets/images/Buffet-Ukir-Kaligrafi-v1.glb';
import buffetBugisUsdz from './assets/images/Buffet-Ukir-Kaligrafi-v1.usdz';

// --- Custom Modular Drawers & Lazy Consoles ---
import Logo from './components/Logo';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import { captureARSnapshot, CapturedSnapshotResult } from './utils/arSnapshot';

const HeritageModal = React.lazy(() => import('./components/HeritageModal'));
const AddProductModal = React.lazy(() => import('./components/AddProductModal'));
const ARSnapshotModal = React.lazy(() => import('./components/ARSnapshotModal'));
const PlatformAdminConsole = React.lazy(() => import('./components/PlatformAdminConsole'));
const SellerDashboardConsole = React.lazy(() => import('./components/SellerDashboardConsole'));
const MerchantRegistrationPage = React.lazy(() => import('./components/MerchantRegistrationPage'));
import {
  auth,
  signInWithGoogle,
  logout as firebaseLogout,
  subscribeAuthState,
  subscribeMerchantApplications,
  saveMerchantApplicationToDb,
  updateMerchantApplicationInDb,
  subscribeCatalogProducts,
  saveCatalogProductToDb,
  upsertCatalogProductInDb,
  deleteCatalogProductInDb,
  subscribePlatformOrders,
  savePlatformOrderToDb,
  updatePlatformOrderInDb
} from './firebase';
import {
  UserRole,
  Product,
  MerchantApplication,
  PlatformOrder,
  isAuthorizedPlatformAdmin
} from './types/platform';

// --- Types ---
type View = 'home' | 'ar' | 'details' | 'platform_admin' | 'seller_console' | 'merchant_register';

interface Culture {
  id: string;
  name: string;
  icon: React.ReactNode;
  pattern: string;
}

// --- Mock Data ---
const CULTURES: Culture[] = [
  { 
    id: 'toraja', 
    name: 'Toraja', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          {/* Curved Tongkonan boat-shaped roof */}
          <path d="M2 8C6.5 10.5 17.5 10.5 22 8V5C17.5 7.5 6.5 7.5 2 5V8Z" fill="currentColor" fillOpacity="0.25" />
          {/* Front support columns and center beam */}
          <path d="M6 8v9M18 8v9M12 9v8" strokeWidth="1.5" />
          {/* Decorative Toraja traditional horizontal planks */}
          <path d="M10 12h4M10 14h4" strokeWidth="1" />
          <path d="M4 17h16" />
        </svg>
      </div>
    ),
    pattern: 'bg-[#13524D]'
  },
  { 
    id: 'bugis', 
    name: 'Bugis', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          {/* Diamond badge shape representing standard geometric Lipaq Sabbe pattern */}
          <rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(45 12 12)" fill="currentColor" fillOpacity="0.25" />
          {/* Intersecting weaving lines (woven silk checks) */}
          <path d="M12 2v20M2 12h22" strokeWidth="1.5" strokeDasharray="1 1" />
          {/* Star symbol representation in the center */}
          <path d="M12 9v6M9 12h6" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    pattern: 'bg-[#A87F2D]'
  },
  { 
    id: 'makassar', 
    name: 'Makassar', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          {/* Majestic multi-sailed Phinisi schooner with its seven sails */}
          <path d="M8 3v8H3l5-8ZM15 2v9h-4l4-9ZM15 4v7l4-7h-4Z" fill="currentColor" fillOpacity="0.25" />
          {/* Solid hull of the vessel */}
          <path d="M21 11.5c-3 1-15 1-18 0l2 2.5h14l2-2.5Z" fill="currentColor" />
          {/* ocean wave ripples underneath */}
          <path d="M1 16.5c3-1 5 1 8 0c3-1 5 1 8 0c3-1 5 1 6 0" strokeWidth="1.2" />
        </svg>
      </div>
    ),
    pattern: 'bg-[#7C3238]'
  },
  { 
    id: 'mandar', 
    name: 'Mandar', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          {/* Slender single triangular lateen sail of the Sandeq outrigger */}
          <path d="M11 2L4 12h7V2Z" fill="currentColor" fillOpacity="0.25" />
          {/* Extremely sleek hull of the boat */}
          <path d="M2 13h18l-2 1.5H4L2 13Z" fill="currentColor" />
          {/* Floating bamboo outrigger stabilizers (CADIK) */}
          <path d="M5 13v2.5M17 13v2.5" />
          <path d="M1 17h21" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    pattern: 'bg-[#2C3E5A]'
  },
];

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Kursi Tamu Pa'reppo",
    price: "Rp 4.500.000",
    image: torajaChairImage,
    culture: "Toraja",
    rating: 4.8,
    description: "Kursi tamu premium yang dibuat dari kayu jati pilihan, didesain dengan ukiran khas Toraja yang dipahat manual oleh pengrajin lokal berpengalaman.",
    philosophy: "Motif Pa'reppo pada kursi ini melambangkan keteguhan hati, kemantapan berfikir, dan kemapanan dalam jenjang kehidupan masyarakat adat Toraja.",
    glbUrl: pareppoGlb,
    usdzUrl: pareppoUsdz,
    dimensions: { length: 80, width: 75, height: 85 }
  },
  {
    id: '2',
    name: "Lemari Ukir Sulur Bugis",
    price: "Rp 7.200.000",
    image: bugisWardrobeImage,
    culture: "Bugis",
    rating: 4.9,
    description: "Lemari pakaian mahakarya seni ukir Bugis dengan garis sulur organik yang elegan, sangat luas dan memperindah interior kamar tidur mewah Anda.",
    philosophy: "Motif 'sulur' pada lemari ini merepresentasikan pertumbuhan berkelanjutan, kemakmuran, dan keterhubungan segala lini kehidupan dalam falsafah adat suku Bugis.",
    glbUrl: lemariBugisGlb,
    usdzUrl: lemariBugisUsdz,
    dimensions: { length: 160, width: 60, height: 210 }
  },
  {
    id: '3',
    name: "Meja Makan Passura'",
    price: "Rp 8.500.000",
    image: torajaTableImage,
    culture: "Toraja",
    rating: 4.7,
    description: "Meja makan kayu jati solid yang dihiasi ukiran geometris Toraja penuh detail presisi, cocok untuk perjamuan keluarga yang hangat.",
    philosophy: "Passura' melambangkan kearifan lokal Toraja yang dituangkan dalam ukiran geometris presisi, mengajarkan ketelitian serta keteraturan hukum semesta.",
    glbUrl: mejaPassuraGlb,
    usdzUrl: mejaPassuraUsdz,
    dimensions: { length: 200, width: 100, height: 78 }
  },
  {
    id: '4',
    name: "Lemari Ukir Phinisi",
    price: "Rp 12.000.000",
    image: makassarCabinetImage,
    culture: "Makassar",
    rating: 4.7,
    description: "Lemari pajangan luxury dengan ukiran relief epik penjelajahan kapal legendaris Phinisi Bugis-Makassar yang mengarungi samudera luas.",
    philosophy: "Ukiran kapal Phinisi yang legendaris melambangkan keteguhan berjuang, tekad pantang menyerah, keberanian, dan jiwa pelaut sejati masyarakat Makassar.",
    glbUrl: phinisiGlb,
    usdzUrl: phinisiUsdz,
    dimensions: { length: 120, width: 45, height: 180 }
  },
  {
    id: '5',
    name: "Sofa Minimalis Saqbe",
    price: "Rp 5.800.000",
    image: mandarSofaImage,
    culture: "Mandar",
    rating: 4.6,
    description: "Sofa santai dengan bantalan empuk berlapis tenun motif sutra Saqbe Mandar asli, memadukan modernitas furnitur dengan sentuhan kerajinan wastra nusantara.",
    philosophy: "Terinspirasi dari tenun Saqbe Mandar, melambangkan kerapian tatanan kebersamaan, kehangatan rasa, dan kelembutan tradisi leluhur dalam harmoni kontemporer.",
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb",
    usdzUrl: "https://developer.apple.com/augmented-reality/quick-look/models/drummer/toy_drummer.usdz",
    dimensions: { length: 210, width: 85, height: 80 }
  },
  {
    id: '6',
    name: "Buffet Ukir Kaligrafi",
    price: "Rp 6.400.000",
    image: bugisBuffetImage,
    culture: "Bugis",
    rating: 4.5,
    description: "Meja buffet serbaguna yang anggun, mengkolaborasikan aksen kaligrafi bermakna spiritual dengan ornamen geometris lokal tanah Bugis.",
    philosophy: "Perpaduan seni kaligrafi dengan motif sakral tradisional Bugis yang melambangkan berkah spiritualitas, ketenangan batin, serta perlindungan Ilahi.",
    glbUrl: buffetBugisGlb,
    usdzUrl: buffetBugisUsdz,
    dimensions: { length: 150, width: 50, height: 85 }
  }
];

// --- ARLinkOrButton ---
const ARLinkOrButton = ({ 
  product, 
  className, 
  children,
  onClickDesktop 
}: { 
  product: Product; 
  className: string; 
  children: React.ReactNode;
  onClickDesktop: (e: React.MouseEvent) => void;
}) => {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClickDesktop(e);
      }}
      className={className}
      style={{ border: 'none' }}
    >
      {children}
    </button>
  );
};

const getAbsoluteUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Convert relative assets (e.g., '/src/assets/...', '/assets/...') to fully qualified URLs
  let cleanUrl = url;
  if (cleanUrl.startsWith('./')) cleanUrl = cleanUrl.substring(2);
  if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.substring(1);
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/${cleanUrl}`;
};

const prefetchedModels = new Set<string>();
const prefetchModelUrl = (rawUrl?: string) => {
  if (typeof document === 'undefined' || !rawUrl) return;
  const url = getAbsoluteUrl(rawUrl);
  if (!url || url.startsWith('blob:') || prefetchedModels.has(url)) return;
  prefetchedModels.add(url);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'fetch';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// --- ProductDetailView ---
const ProductDetailView = ({ 
  product, 
  onBack, 
  onAR,
  isFavorite,
  onToggleFavorite,
  onAddToCart
}: { 
  product: Product; 
  onBack: () => void; 
  onAR: () => void; 
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  key?: string;
}) => {
  const ModelViewer = 'model-viewer' as any;
  const modelViewerRef = useRef<any>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [snapshotResult, setSnapshotResult] = useState<CapturedSnapshotResult | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

  const revokeSnapshotUrls = (snap: CapturedSnapshotResult | null) => {
    if (!snap) return;
    URL.revokeObjectURL(snap.rawUrl);
    URL.revokeObjectURL(snap.brandedUrl);
  };

  useEffect(() => {
    return () => {
      revokeSnapshotUrls(snapshotResult);
    };
  }, [snapshotResult]);

  useEffect(() => {
    setModelLoaded(false);
    setModelProgress(0);
    setModelError(null);
    const el = modelViewerRef.current;
    if (!el) return;
    if (el.loaded) {
      setModelLoaded(true);
      setModelProgress(100);
      return;
    }
    const handleProgress = (e: any) => {
      const pct = Math.round((e?.detail?.totalProgress || 0) * 100);
      setModelProgress(pct);
    };
    const handleLoad = () => {
      setModelLoaded(true);
      setModelProgress(100);
      setModelError(null);
    };
    const handleError = () => {
      setModelError('Gagal memuat model 3D. Periksa koneksi internet Anda.');
    };
    el.addEventListener('progress', handleProgress);
    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);
    return () => {
      el.removeEventListener('progress', handleProgress);
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
    };
  }, [product.id, product.glbUrl]);

  const handleCaptureSnapshot = async () => {
    if (!modelViewerRef.current || isCapturing) return;
    setIsCapturing(true);
    setSnapshotError(null);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 180);

    try {
      const captured = await captureARSnapshot(modelViewerRef.current, product, {
        isLightStage: true,
      });
      setSnapshotResult((prev) => {
        revokeSnapshotUrls(prev);
        return captured;
      });
      setIsSnapshotOpen(true);
    } catch (err: any) {
      setSnapshotError(err?.message || 'Gagal mengambil tangkapan layar model 3D.');
      setTimeout(() => setSnapshotError(null), 3500);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-[#0A2926]/40 backdrop-blur-xl overflow-y-auto no-scrollbar flex items-center justify-center p-0 md:p-6 lg:p-10"
    >
      <div className="w-full max-w-5xl liquid-glass min-h-screen md:min-h-0 md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Pane: Interactive 3D Showcase */}
        <div className="relative h-[44vh] md:h-[620px] md:w-1/2 w-full bg-gradient-to-br from-[#EFECE4]/85 via-[#FAF8F3]/75 to-[#E5EFED]/70 flex-shrink-0 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/60">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(19,82,77,0.09),transparent_68%)]" />
          <div className="w-full h-full relative" id="threeDContainer">
            <ModelViewer
              ref={modelViewerRef}
              src={getAbsoluteUrl(product.glbUrl || '')}
              ios-src={getAbsoluteUrl(product.usdzUrl || '')}
              poster={product.image}
              loading="eager"
              reveal="auto"
              alt={product.name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              auto-rotate-delay="1500"
              interaction-prompt="auto"
              shadow-intensity="1.5"
              shadow-softness="1"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
              className="w-full h-full outline-hidden"
            >
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isCapturing}
                aria-label="Capture AR Snapshot"
                className="absolute bottom-4 left-4 liquid-glass-pill hover:bg-[#FAF8F3] active:scale-95 text-[#10423E] font-bold text-xs py-2.5 px-4 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer z-50 transition-all whitespace-nowrap disabled:opacity-60"
              >
                <Camera size={14} className="text-[#A87F2D]" />
                <span>{isCapturing ? 'Memotret...' : 'Snapshot AR'}</span>
              </button>

              <button 
                slot="ar-button" 
                className="absolute bottom-4 right-4 liquid-glass-teal hover:brightness-110 active:scale-95 text-[#FAF8F3] font-bold text-xs py-3 px-5 rounded-full shadow-lg flex items-center gap-2 cursor-pointer border-none z-50 transition-all whitespace-nowrap"
              >
                <Maximize2 size={14} />
                <span>Lihat di Ruangan (AR)</span>
              </button>
              <div slot="poster" className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 opacity-85"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F3]/35 backdrop-blur-[2px]">
                  <div className="liquid-glass-pill px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-md">
                    <div className="w-4 h-4 rounded-full border-2 border-[#13524D] border-t-transparent animate-spin shrink-0" />
                    <span className="text-[11px] font-bold text-[#10423E] tabular-nums">
                      {modelProgress > 0 ? `Menyiapkan Model 3D... ${modelProgress}%` : 'Menyiapkan Model 3D...'}
                    </span>
                  </div>
                </div>
              </div>
            </ModelViewer>

            {!modelLoaded && product.glbUrl && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <div className="liquid-glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#13524D] border-t-transparent animate-spin shrink-0" />
                  <span className="text-[11px] font-semibold text-[#10423E] tabular-nums whitespace-nowrap">
                    {modelError
                      ? modelError
                      : modelProgress > 0
                      ? `Memuat 3D ${modelProgress}%`
                      : 'Menyiapkan Model 3D...'}
                  </span>
                </div>
              </div>
            )}

            <AnimatePresence>
              {showFlash && (
                <motion.div
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 bg-[#FAF8F3] pointer-events-none z-50"
                />
              )}
            </AnimatePresence>

            {snapshotError && (
              <div className="absolute top-16 left-4 right-4 z-50 px-3 py-2 rounded-xl bg-[#7C3238]/90 text-[#FAF8F3] text-[11px] font-semibold text-center shadow-lg">
                {snapshotError}
              </div>
            )}
          </div>
          
          {/* Back/Favorite button Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <button 
              onClick={onBack}
              aria-label="Kembali ke galeri"
              className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#10423E] hover:bg-[#FAF8F3] transition-all cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <button 
              onClick={onToggleFavorite}
              aria-label="Tandai favorit"
              className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#445754] hover:bg-[#FAF8F3] transition-all cursor-pointer"
            >
              <Heart size={18} className={isFavorite ? "fill-[#9E3F44] text-[#9E3F44]" : "hover:text-[#9E3F44] transition-colors"} />
            </button>
          </div>
        </div>

      {/* Right Pane: Detailed Content */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[56vh] md:max-h-[620px] no-scrollbar pb-44 md:pb-10 bg-[#FAF8F3]/55">
        <div>
          <div className="flex justify-between items-start gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A87F2D]">
                <span>Warisan {product.culture}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#445754] tabular-nums">
                  <Star size={12} className="fill-[#C59B42] text-[#C59B42]" />
                  {product.rating}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#10423E] leading-tight mt-1">{product.name}</h2>
            </div>
          </div>

          <p className="text-2xl font-extrabold text-[#13524D] tabular-nums mb-6">{product.price}</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-[#5C6F6B] mb-2">Deskripsi Produk</h3>
              <p className="text-[#445754] leading-relaxed text-sm">
                {product.description}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-bold text-[#5C6F6B] mb-2.5">Filosofi &amp; Nilai Seni</h3>
              <div className="liquid-glass-subtle p-4 rounded-2xl">
                <p className="text-[#162624] leading-relaxed italic font-serif text-sm">
                  "{product.philosophy}"
                </p>
              </div>
            </section>

            <section className="pb-4">
              <h3 className="text-xs font-bold text-[#5C6F6B] mb-3">Spesifikasi Detail</h3>
              <div className="space-y-3.5">
                {/* Material & Konstruksi Card */}
                <div className="liquid-glass-subtle p-4 rounded-2xl flex items-start gap-3">
                  <div className="p-2.5 bg-[#FAF8F3]/90 rounded-xl shadow-xs text-[#13524D] shrink-0 border border-[#D7B463]/25">
                    <Hammer size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#5C6F6B] font-semibold mb-0.5">Material Utama</p>
                    <p className="text-xs font-bold text-[#10423E]">Kayu Jati Perhutani Grade A</p>
                    <p className="text-[11px] text-[#445754] mt-0.5">Dipahat tangan oleh pengrajin lokal dengan standar ekspor</p>
                  </div>
                </div>

                {/* Dimensi Card */}
                <div className="liquid-glass-subtle p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-[#FAF8F3]/90 rounded-xl shadow-xs text-[#13524D] shrink-0 border border-[#D7B463]/25">
                      <Ruler size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#5C6F6B] font-semibold">Dimensi Fisik</p>
                      <p className="text-[11px] text-[#445754]">Proporsi presisi untuk tata ruang modern</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                    <div className="bg-[#FAF8F3]/85 p-2.5 rounded-xl border border-[#D7B463]/20">
                      <p className="text-[10px] font-semibold text-[#5C6F6B]">Panjang</p>
                      <p className="text-sm font-extrabold text-[#10423E] mt-0.5 tabular-nums">{(product.dimensions || { length: 120 }).length} <span className="text-[10px] font-normal text-[#5C6F6B]">cm</span></p>
                    </div>
                    <div className="bg-[#FAF8F3]/85 p-2.5 rounded-xl border border-[#D7B463]/20">
                      <p className="text-[10px] font-semibold text-[#5C6F6B]">Lebar</p>
                      <p className="text-sm font-extrabold text-[#10423E] mt-0.5 tabular-nums">{(product.dimensions || { width: 45 }).width} <span className="text-[10px] font-normal text-[#5C6F6B]">cm</span></p>
                    </div>
                    <div className="bg-[#FAF8F3]/85 p-2.5 rounded-xl border border-[#D7B463]/20">
                      <p className="text-[10px] font-semibold text-[#5C6F6B]">Tinggi</p>
                      <p className="text-sm font-extrabold text-[#10423E] mt-0.5 tabular-nums">{(product.dimensions || { height: 180 }).height} <span className="text-[10px] font-normal text-[#5C6F6B]">cm</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Panel for Desktop Detail View */}
        <div className="hidden md:flex flex-col gap-3 mt-6 pt-6 border-t border-[#D7B463]/20">
          <motion.button 
            onClick={onAddToCart}
            whileTap={{ scale: 0.98 }}
            className="w-full liquid-glass-teal hover:brightness-110 text-[#FAF8F3] py-3.5 rounded-full font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag size={17} />
            <span>Masukkan ke Keranjang</span>
          </motion.button>
          
          <ARLinkOrButton 
            product={product}
            onClickDesktop={onAR}
            className="w-full liquid-glass-pill hover:bg-[#FAF8F3] text-[#10423E] py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Maximize2 size={14} />
            <span>Posisikan di Ruangan Anda (AR)</span>
          </ARLinkOrButton>
        </div>
      </div>
    </div>

    {/* Mobile Only Fixed Bottom Action Dock */}
    <div className="fixed bottom-0 left-0 right-0 md:hidden liquid-glass border-t border-white/80 px-5 py-4 flex flex-col gap-2.5 z-50">
      <motion.button 
        onClick={onAddToCart}
        whileTap={{ scale: 0.98 }}
        className="w-full liquid-glass-teal text-[#FAF8F3] py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShoppingBag size={16} />
        <span>Masukkan ke Keranjang</span>
      </motion.button>
      
      <ARLinkOrButton 
        product={product}
        onClickDesktop={onAR}
        className="w-full liquid-glass-pill text-[#10423E] py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <Maximize2 size={14} />
        <span>Posisikan di Ruangan Anda (AR)</span>
      </ARLinkOrButton>
    </div>

    <Suspense fallback={null}>
      {isSnapshotOpen && (
        <ARSnapshotModal
          isOpen={isSnapshotOpen}
          onClose={() => setIsSnapshotOpen(false)}
          snapshot={snapshotResult}
          product={product}
          onRetake={() => setIsSnapshotOpen(false)}
        />
      )}
    </Suspense>
  </motion.div>
 );
};

/// --- ARView ---
const ARView = ({ product, onBack }: { product: Product | null; onBack: () => void; key?: string }) => {
  const ModelViewer = 'model-viewer' as any;
  const modelViewerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isWebXRActive, setIsWebXRActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [snapshotResult, setSnapshotResult] = useState<CapturedSnapshotResult | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);

  const revokeSnapshotUrls = (snap: CapturedSnapshotResult | null) => {
    if (!snap) return;
    URL.revokeObjectURL(snap.rawUrl);
    URL.revokeObjectURL(snap.brandedUrl);
  };

  useEffect(() => {
    return () => {
      revokeSnapshotUrls(snapshotResult);
    };
  }, [snapshotResult]);

  // Listen for WebXR AR status, load, progress & error inside <model-viewer>
  useEffect(() => {
    setModelLoaded(false);
    setModelProgress(0);
    const el = modelViewerRef.current;
    if (!el) return;
    if (el.loaded) {
      setModelLoaded(true);
      setModelProgress(100);
    }
    const handleArStatus = (event: any) => {
      const status = event?.detail?.status;
      setIsWebXRActive(status === 'session-started' || status === 'object-placed');
    };
    const handleProgress = (event: any) => {
      setModelProgress(Math.round((event?.detail?.totalProgress || 0) * 100));
    };
    const handleLoad = () => {
      setModelLoaded(true);
      setModelProgress(100);
    };
    const handleError = () => {
      setCameraError('Gagal mengunduh model 3D. Periksa koneksi internet Anda.');
    };
    el.addEventListener('ar-status', handleArStatus);
    el.addEventListener('progress', handleProgress);
    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);
    return () => {
      el.removeEventListener('ar-status', handleArStatus);
      el.removeEventListener('progress', handleProgress);
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
    };
  }, [product?.id, product?.glbUrl]);

  // Clean up camera stream on unmount
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleToggleCamera = async () => {
    setCameraError(null);
    if (isCameraActive) {
      stopCameraStream();
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Akses kamera langsung tidak didukung pada peramban ini.');
      setTimeout(() => setCameraError(null), 4000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError('Izin kamera ditolak atau tidak tersedia. Mode Studio AR tetap siap digunakan.');
      setTimeout(() => setCameraError(null), 4000);
    }
  };

  if (!product) return null;

  const handleCaptureSnapshot = async () => {
    if (!modelViewerRef.current || isCapturing) return;
    setIsCapturing(true);
    setCameraError(null);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 180);

    try {
      const captured = await captureARSnapshot(modelViewerRef.current, product, {
        videoEl: isCameraActive ? videoRef.current : null,
        isLightStage: false,
      });
      setSnapshotResult((prev) => {
        revokeSnapshotUrls(prev);
        return captured;
      });
      setIsSnapshotOpen(true);
    } catch (err: any) {
      setCameraError(err?.message || 'Gagal mengambil tangkapan layar AR.');
      setTimeout(() => setCameraError(null), 4000);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 w-full h-screen z-[200] bg-[#061311] overflow-hidden flex flex-col"
    >
      {/* Live Camera AR Feed OR Virtual Studio Stage */}
      {isCameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0D2B28] via-[#091E1C] to-[#061311] pointer-events-none">
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#1B6861]/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-[20%] w-[250px] h-[250px] bg-[#C59B42]/10 rounded-full blur-[90px]" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-radial from-[#FAF8F3]/5 to-transparent blur-[40px] opacity-20" />
        </div>
      )}

      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-50 p-4 sm:p-5 flex items-center justify-between gap-2 pointer-events-none">
        <button 
          onClick={() => {
            stopCameraStream();
            onBack();
          }}
          aria-label="Kembali"
          className="w-10 h-10 rounded-full liquid-glass-dark flex items-center justify-center text-[#FAF8F3] hover:bg-white/15 transition-colors cursor-pointer pointer-events-auto shrink-0"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="liquid-glass-dark px-4 sm:px-5 py-2 rounded-full text-center pointer-events-auto min-w-0 max-w-[55vw] sm:max-w-md">
          <p className="text-[#FAF8F3] text-xs font-serif font-bold leading-tight truncate">{product.name}</p>
          <p className="text-[#D7B463] text-[10px] font-medium truncate">
            {isWebXRActive
              ? `Mode WebXR AR · ${product.culture}`
              : isCameraActive
              ? `Kamera AR Langsung · ${product.culture}`
              : `Studio 3D & AR · ${product.culture}`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleCamera}
          aria-label={isCameraActive ? 'Matikan kamera langsung' : 'Aktifkan kamera langsung AR'}
          title={isCameraActive ? 'Kembali ke Studio AR' : 'Buka Kamera Ruangan Langsung'}
          className={`h-10 px-3 sm:px-3.5 rounded-full liquid-glass-dark flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer pointer-events-auto shrink-0 whitespace-nowrap ${
            isCameraActive ? 'text-[#D7B463] border-[#D7B463]/45' : 'text-[#FAF8F3] hover:bg-white/15'
          }`}
        >
          {isCameraActive ? <VideoOff size={15} /> : <Video size={15} />}
          <span className="hidden sm:inline">{isCameraActive ? 'Studio' : 'Kamera AR'}</span>
        </button>
      </div>

      {/* Inline Camera / Snapshot Notification */}
      {cameraError && (
        <div className="absolute top-20 inset-x-4 mx-auto max-w-md z-50 px-4 py-2.5 rounded-2xl liquid-glass-dark border border-[#D7B463]/35 text-[#F7EFDB] text-xs font-medium text-center shadow-xl">
          {cameraError}
        </div>
      )}

      {/* Main Interactive 3D & AR Canvas */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center z-10 pt-16">
        <ModelViewer
          ref={modelViewerRef}
          src={getAbsoluteUrl(product.glbUrl)}
          ios-src={getAbsoluteUrl(product.usdzUrl)}
          poster={product.image}
          loading="eager"
          reveal="auto"
          alt={product.name}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate={false}
          interaction-prompt="none"
          shadow-intensity="2.8"
          shadow-softness="0.3"
          exposure="1.2"
          environment-image="neutral"
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          className="w-full h-full outline-hidden"
        >
          {/* Capture AR Snapshot Shutter Button (rendered inside model-viewer DOM overlay too) */}
          {modelLoaded && (
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              disabled={isCapturing}
              aria-label="Capture AR Snapshot"
              className="absolute bottom-5 left-4 sm:bottom-6 sm:left-6 liquid-glass-gold active:scale-95 text-[#0A2926] font-extrabold text-xs py-3 sm:py-3.5 px-4 sm:px-5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer z-50 transition-all hover:brightness-105 whitespace-nowrap disabled:opacity-60"
            >
              <Camera size={15} />
              <span className="sm:hidden">{isCapturing ? 'Memotret...' : 'Snapshot AR'}</span>
              <span className="hidden sm:inline">{isCapturing ? 'Memotret...' : 'Capture AR Snapshot'}</span>
            </button>
          )}

          {/* Custom AR Button Slot */}
          <button 
            slot="ar-button" 
            className="absolute bottom-5 right-4 sm:bottom-6 sm:right-6 liquid-glass-teal active:scale-95 text-[#FAF8F3] font-bold text-xs py-3 sm:py-3.5 px-4 sm:px-6 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer border-none z-50 transition-all hover:brightness-110 whitespace-nowrap"
          >
            <Maximize2 size={15} />
            <span className="sm:hidden">Mode AR</span>
            <span className="hidden sm:inline">Lihat di Ruangan Anda (AR)</span>
          </button>

          {modelLoaded && !isWebXRActive && (
            <div className="absolute bottom-20 inset-x-0 mx-auto w-fit text-center pointer-events-none z-40">
              <span className="text-[11px] font-medium text-[#FAF8F3]/90 liquid-glass-dark px-4 py-2 rounded-full">
                Seret untuk memutar · Cubit untuk memperbesar
              </span>
            </div>
          )}

          {!modelLoaded && (
            <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#061311]/55 text-[#FAF8F3] z-20">
              <div className="w-9 h-9 rounded-full border-2 border-[#D7B463] border-t-transparent animate-spin" />
              <span className="text-xs font-medium text-[#E5EFED] tabular-nums">
                {modelProgress > 0
                  ? `Menyiapkan Model Seni 3D ${product.culture}... ${modelProgress}%`
                  : `Menyiapkan Model Seni 3D ${product.culture}...`}
              </span>
            </div>
          )}
        </ModelViewer>

        {/* Visual Camera Shutter Flash */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-[#FAF8F3] pointer-events-none z-[240]"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Snapshot Preview & Social Media Share Modal */}
      <Suspense fallback={null}>
        {isSnapshotOpen && (
          <ARSnapshotModal
            isOpen={isSnapshotOpen}
            onClose={() => setIsSnapshotOpen(false)}
            snapshot={snapshotResult}
            product={product}
            onRetake={() => setIsSnapshotOpen(false)}
          />
        )}
      </Suspense>
    </motion.div>
  );
};

// --- Home Header ----
const Header = ({ 
  searchQuery, 
  setSearchQuery, 
  onProfileClick, 
  onNotificationClick,
  onFavoritesClick,
  onCartClick,
  onHomeClick,
  onOpenPlatformAdmin,
  onOpenSellerDashboard,
  cartCount,
  favoritesCount,
  unreadCount,
  googleUser,
  userRole,
  hasActiveOverlay = false
}: { 
  searchQuery: string; 
  setSearchQuery: (q: string) => void; 
  onProfileClick: () => void;
  onNotificationClick: () => void;
  onFavoritesClick: () => void;
  onCartClick: () => void;
  onHomeClick: () => void;
  onOpenPlatformAdmin?: () => void;
  onOpenSellerDashboard?: () => void;
  cartCount: number;
  favoritesCount: number;
  unreadCount: number;
  googleUser: { name: string; email: string; avatar: string; } | null;
  userRole: UserRole;
  hasActiveOverlay?: boolean;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNavbarFocused, setIsNavbarFocused] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  const hasActiveSearch = searchQuery.trim().length > 0;
  const isNavbarActive =
    isDropdownOpen ||
    isSearchFocused ||
    isNavbarFocused ||
    hasActiveSearch ||
    hasActiveOverlay;

  // Keep header visible immediately whenever any navbar feature is active
  useEffect(() => {
    if (isNavbarActive) {
      setIsHeaderVisible(true);
    }
  }, [isNavbarActive]);

  // Follow on scroll down, hide when scrolling up (never hide while navbar is active)
  useEffect(() => {
    lastScrollYRef.current = typeof window !== 'undefined' ? Math.max(0, window.scrollY) : 0;

    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastScrollYRef.current;

      if (isNavbarActive || currentY <= 24) {
        setIsHeaderVisible(true);
      } else if (delta > 6) {
        setIsHeaderVisible(true);
      } else if (delta < -6 && currentY > 48) {
        setIsHeaderVisible(false);
      }

      if (Math.abs(delta) > 2) {
        lastScrollYRef.current = currentY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isNavbarActive]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalBadges = cartCount + favoritesCount + (unreadCount > 0 ? 1 : 0);
  const showHeader = isHeaderVisible || isNavbarActive;

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-1 pointer-events-none">
      <div
        ref={dropdownRef}
        onFocusCapture={() => {
          setIsNavbarFocused(true);
          setIsHeaderVisible(true);
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsNavbarFocused(false);
          }
        }}
        className={`max-w-7xl mx-auto liquid-glass rounded-full md:rounded-3xl px-2.5 sm:px-6 py-2 md:py-3 flex flex-row items-center justify-between gap-2 sm:gap-3 relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showHeader
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-[calc(100%+16px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* Brand Logo (text hidden on mobile for compact single-row navbar) */}
        <button
          onClick={onHomeClick}
          aria-label="Balla AR Beranda"
          className="flex items-center gap-3 text-left cursor-pointer shrink-0"
        >
          <Logo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold tracking-tight text-[#10423E] font-serif leading-none whitespace-nowrap">Balla AR</h1>
            <p className="text-[10px] text-[#5C6F6B] font-medium mt-0.5 whitespace-nowrap">South Sulawesi Heritage Interiors</p>
          </div>
        </button>

        {/* Inline Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 md:max-w-xl md:ml-auto">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-[#445754] pointer-events-none z-10" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                setIsHeaderVisible(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Cari perabot adat..."
              className="w-full liquid-glass-input rounded-full md:rounded-2xl py-2 md:py-2.5 pl-9 sm:pl-10 pr-8 sm:pr-9 text-xs text-[#162624] placeholder:text-[#5C6F6B]/85 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[#5C6F6B] hover:text-[#10423E] text-sm font-bold transition-colors cursor-pointer z-10"
              >
                ×
              </button>
            )}
          </div>

          {/* Desktop Quick Glass Action Icons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={onFavoritesClick}
              aria-label="Favorit Saya"
              title="Favorit Saya"
              className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#445754] hover:text-[#9E3F44] transition-colors cursor-pointer relative"
            >
              <Heart size={17} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9E3F44] border-2 border-[#FAF8F3] text-[#FAF8F3] text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center tabular-nums">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onCartClick}
              aria-label="Keranjang Belanja"
              title="Keranjang Belanja"
              className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#445754] hover:text-[#13524D] transition-colors cursor-pointer relative"
            >
              <ShoppingBag size={17} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#13524D] border-2 border-[#FAF8F3] text-[#FAF8F3] text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={onNotificationClick}
              aria-label="Pusat Informasi"
              title="Pusat Informasi"
              className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-[#445754] hover:text-[#A87F2D] transition-colors cursor-pointer relative"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C59B42] border-2 border-[#FAF8F3] text-[#0A2926] text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Unified Profile & Quick Menu Trigger (includes Cart on mobile) */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Buka menu akun dan keranjang"
            className={`flex w-9 h-9 sm:w-10 sm:h-10 rounded-full ${googleUser ? 'bg-gradient-to-tr from-[#13524D] to-[#C59B42] p-0.5 shadow-sm hover:brightness-105' : 'liquid-glass-pill items-center justify-center text-[#445754] hover:text-[#10423E]'} active:scale-95 transition-all cursor-pointer relative shrink-0`}
          >
            {googleUser ? (
              <img
                src={googleUser.avatar}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border border-white/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={18} />
            )}
            {totalBadges > 0 && (
              <span className="md:hidden absolute -top-1 -right-1 bg-[#9E3F44] border-2 border-[#FAF8F3] text-[#FAF8F3] text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center tabular-nums">
                {totalBadges}
              </span>
            )}
          </button>
        </div>

        {/* Unified Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-2 sm:right-5 top-[58px] md:top-[66px] w-72 bg-[linear-gradient(155deg,rgba(255,254,251,0.97)_0%,rgba(247,243,235,0.94)_100%)] backdrop-blur-2xl backdrop-saturate-150 border border-[#D7B463]/35 rounded-2xl p-3 z-50 flex flex-col gap-1.5 shadow-[0_20px_48px_-12px_rgba(10,41,38,0.28),inset_0_1px_1px_rgba(255,255,255,0.98)]"
            >
                  <div className="px-2.5 py-2 border-b border-[#D7B463]/20 mb-1">
                    {googleUser ? (
                      <>
                        <p className="text-xs font-bold text-[#10423E] truncate">{googleUser.name}</p>
                        <p className="text-[10.5px] text-[#5C6F6B] truncate">{googleUser.email}</p>
                        <p className="mt-1 text-[10px] font-bold text-[#A87F2D]">
                          {userRole === 'platform_admin'
                            ? 'Admin Platform · Tim BALALA'
                            : userRole === 'admin' 
                            ? 'Mitra Penjual' 
                            : userRole === 'curator' 
                            ? 'Kurator Adat' 
                            : 'Kolektor Pusaka Adat'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-[#10423E]">Tamu Nusantara</p>
                        <p className="text-[10.5px] text-[#5C6F6B]">Belum tersambung Google · Mode Tamu</p>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { onFavoritesClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-[#445754] hover:bg-[#FAF8F3]/75 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#9E3F44]/10 flex items-center justify-center text-[#9E3F44] relative flex-shrink-0">
                      <Heart size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#162624]">Favorit Saya</h4>
                      <p className="text-[10px] text-[#5C6F6B] leading-none tabular-nums">{favoritesCount} perabot tersimpan</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onCartClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-[#445754] hover:bg-[#FAF8F3]/75 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#C59B42]/15 flex items-center justify-center text-[#A87F2D] relative flex-shrink-0">
                      <ShoppingBag size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#162624]">Keranjang Belanja</h4>
                      <p className="text-[10px] text-[#5C6F6B] leading-none tabular-nums">{cartCount} item di keranjang</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNotificationClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-[#445754] hover:bg-[#FAF8F3]/75 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#13524D]/10 flex items-center justify-center text-[#13524D] relative flex-shrink-0">
                      <Bell size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#162624]">Pusat Informasi</h4>
                      <p className="text-[10px] text-[#5C6F6B] leading-none tabular-nums">{unreadCount} info belum dibaca</p>
                    </div>
                  </button>

                  {isAuthorizedPlatformAdmin(googleUser?.email) && onOpenPlatformAdmin && (
                    <button
                      onClick={() => { onOpenPlatformAdmin(); setIsDropdownOpen(false); }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#10423E] hover:bg-[#0A2926] text-left transition-colors cursor-pointer w-full mt-0.5 shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#D7B463]/20 border border-[#D7B463]/40 flex items-center justify-center text-[#D7B463] flex-shrink-0">
                        <Shield size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#FAF8F3]">Console Admin &amp; 3D</h4>
                        <p className="text-[10px] text-[#D7B463] leading-none">Tim BALALA · Akses Terverifikasi</p>
                      </div>
                    </button>
                  )}

                  {userRole === 'admin' && onOpenSellerDashboard && (
                    <button
                      onClick={() => { onOpenSellerDashboard(); setIsDropdownOpen(false); }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7EFDB] hover:bg-[#EFE2C1] border border-[#D7B463]/40 text-left transition-colors cursor-pointer w-full mt-0.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#10423E] flex items-center justify-center text-[#FAF8F3] flex-shrink-0">
                        <Store size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#10423E]">Dasbor Penjual / UMKM</h4>
                        <p className="text-[10px] text-[#8C6820] leading-none">Kelola produk 3D &amp; pesanan masuk</p>
                      </div>
                    </button>
                  )}

                  <button 
                    onClick={() => { onProfileClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-[#445754] hover:bg-[#FAF8F3]/75 text-left transition-colors border-t border-[#D7B463]/20 pt-2.5 mt-1 cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#10423E]/10 flex items-center justify-center text-[#10423E] flex-shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#162624]">{googleUser ? 'Profil, Peran & Kupon' : 'Hubungkan Akun Google'}</h4>
                      <p className="text-[10px] text-[#5C6F6B] leading-none">
                        {googleUser ? 'Atur peran mitra, kontak & bahasa' : 'Masuk cepat dengan Google'}
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

      </div>
    </header>
  );
};

// --- Hero Banner ---
const HeroBanner = ({ onLearnMore }: { onLearnMore: () => void }) => (
  <div className="mb-8">
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-[32px] p-1.5 sm:p-2"
    >
      <div className="relative h-56 sm:h-72 md:h-80 lg:h-[360px] rounded-[26px] overflow-hidden group">
        <img 
          src={heroBallaShowcase} 
          alt="Interior Modern dengan Furnitur Ukir Adat Sulawesi Selatan" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2926]/90 via-[#10423E]/52 to-transparent flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <p className="text-[#E6CD8A] text-xs font-semibold mb-2 tracking-wide">
            Edisi Warisan Sulawesi Selatan
          </p>
          <h2 className="text-[#FAF8F3] text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight max-w-md sm:max-w-lg [text-wrap:balance]">
            Ukir Nusantara di Ruang Modern <span className="italic font-normal text-[#F7EFDB]">Seni Falsafah Hidup</span>
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <motion.button 
              onClick={onLearnMore}
              whileTap={{ scale: 0.96 }}
              className="liquid-glass-pill text-[#10423E] hover:bg-[#FAF8F3] px-5 py-2.5 rounded-full text-xs font-bold w-fit transition-all cursor-pointer whitespace-nowrap"
            >
              Pelajari Warisan Ukir
            </motion.button>
            <a 
              href="#katalog-pilihan"
              className="text-[#FAF8F3]/95 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-[#D7B463]/35 transition-all whitespace-nowrap"
            >
              Lihat Koleksi
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// --- Culture Categories ---
const CultureCategories = ({ 
  activeCategory, 
  onSelectCategory 
}: { 
  activeCategory: string; 
  onSelectCategory: (id: string) => void; 
}) => {
  const handleSelect = (id: string) => {
    onSelectCategory(id);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#10423E] font-serif">Pilih Adat Kebudayaan</h3>
          <p className="text-xs text-[#5C6F6B]">Jelajahi nilai filosofis unik setiap suku</p>
        </div>
        <button 
          onClick={() => handleSelect('all')}
          className={`text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            activeCategory === 'all' ? 'text-[#10423E] underline' : 'text-[#13524D]'
          }`}
        >
          Semua Koleksi <ChevronRight size={14} />
        </button>
      </div>
      
      <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar liquid-glass p-2.5 sm:p-3 rounded-3xl">
        {CULTURES.map((culture) => {
          const isActive = activeCategory === culture.id;
          return (
            <motion.button
              key={culture.id}
              onClick={() => handleSelect(culture.id)}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-2 rounded-2xl transition-all cursor-pointer shrink-0 ${
                isActive ? 'bg-[#FAF8F3]/85 shadow-sm border border-[#D7B463]/35' : 'hover:bg-[#FAF8F3]/45'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? `${culture.pattern} text-[#FAF8F3] shadow-md scale-105` 
                  : 'bg-[#FAF8F3]/85 text-[#5C6F6B] border border-white/80'
              }`}>
                {culture.icon}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap transition-colors ${isActive ? 'text-[#10423E]' : 'text-[#445754]'}`}>
                {culture.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// --- ProductCard ---
function ProductCard({ 
  product, 
  index, 
  onARClick, 
  onClick,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  userRole,
  adminCulture,
  onDelete
}: { 
  product: Product; 
  index: number; 
  onARClick: (e: React.MouseEvent) => void; 
  onClick: () => void; 
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  userRole: UserRole;
  adminCulture: string;
  onDelete: () => void;
  key?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => prefetchModelUrl(product.glbUrl)}
      onTouchStart={() => prefetchModelUrl(product.glbUrl)}
      className="liquid-glass-card rounded-3xl p-3 sm:p-3.5 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-[#FAF8F3]/85 border border-[#D7B463]/20">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {product.status && product.status !== 'approved' && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${
                product.status === 'pending' ? 'bg-[#A87F2D] text-[#FAF8F3]' : 'bg-[#7C3238] text-[#FAF8F3]'
              }`}>
                {product.status === 'pending' ? 'Kurasi' : 'Ditolak'}
              </span>
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              aria-label="Simpan ke favorit"
              className="w-8 h-8 rounded-full liquid-glass-pill flex items-center justify-center text-[#5C6F6B] cursor-pointer hover:text-[#9E3F44] transition-colors"
            >
              <Heart size={14} className={isFavorite ? "fill-[#9E3F44] text-[#9E3F44]" : ""} />
            </button>
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <ARLinkOrButton 
              product={product}
              onClickDesktop={(e) => { e.stopPropagation(); onARClick(e); }}
              className="liquid-glass-teal hover:brightness-110 text-[#FAF8F3] px-2.5 py-1 rounded-full flex items-center gap-1 active:scale-95 transition-transform cursor-pointer whitespace-nowrap"
            >
              <Maximize2 size={10} />
              <span className="text-[10px] font-bold tracking-wide">AR</span>
            </ARLinkOrButton>
          </div>
        </div>
        
        <div className="px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5C6F6B] mb-1">
            <span className="text-[#A87F2D] font-semibold">{product.culture}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-0.5 tabular-nums text-[#445754]">
              <Star size={11} className="fill-[#C59B42] text-[#C59B42]" />
              {product.rating}
            </span>
          </div>
          <h4 className="text-sm font-serif font-bold text-[#162624] leading-snug mb-2 group-hover:text-[#13524D] transition-colors line-clamp-1">{product.name}</h4>
        </div>
      </div>

      <div className="px-1 mt-auto">
        <div className="flex justify-between items-center pt-2.5 border-t border-[#D7B463]/20 gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-[#10423E] tabular-nums truncate">{product.price}</span>
          
          {userRole === 'admin' ? (
            product.culture.toLowerCase() === adminCulture.toLowerCase() ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="px-2.5 py-1.5 rounded-xl bg-[#9E3F44]/10 hover:bg-[#9E3F44]/20 text-[#9E3F44] border border-[#9E3F44]/25 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                title="Hapus Produk dari Toko Anda"
              >
                <Trash2 size={11} />
                <span>Hapus</span>
              </button>
            ) : (
              <span 
                className="text-[10px] text-[#5C6F6B] font-medium select-none shrink-0"
                title="Produk ini milik sanggar adat lain"
              >
                Sanggar lain
              </span>
            )
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              aria-label="Tambah ke keranjang"
              className="w-8 h-8 rounded-full liquid-glass-teal hover:brightness-110 text-[#FAF8F3] flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0"
              title="Tambah ke Keranjang"
            >
              <ShoppingBag size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}



// Helpers for store display
const getStoreName = (culture: string): string => {
  try {
    const savedCustomName = localStorage.getItem('ballaar_merchant_store_name');
    const savedMerchantStatus = localStorage.getItem('ballaar_merchant_status');
    if (savedMerchantStatus === 'approved' && savedCustomName) {
      return savedCustomName;
    }
  } catch (e) {
    // disregard
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

const readStoredGoogleUser = (): { name: string; email: string; avatar: string } | null => {
  try {
    const saved = localStorage.getItem('ballaar_google_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.avatar === 'string' && (parsed.avatar.includes('unsplash.com') || parsed.avatar.includes('photo-'))) {
        parsed.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.name || 'Pengguna')}&background=13524D&color=FAF8F3&bold=true&size=150`;
        localStorage.setItem('ballaar_google_user', JSON.stringify(parsed));
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

// --- MAIN APPLICATION ENTRY ---
export default function App() {
  const initialStoredUser = readStoredGoogleUser();
  const initialIsPlatformAdmin = isAuthorizedPlatformAdmin(initialStoredUser?.email);
  const initialIsApprovedSeller = (() => {
    if (initialIsPlatformAdmin || !initialStoredUser) return false;
    try {
      return localStorage.getItem('ballaar_merchant_status') === 'approved';
    } catch {
      return false;
    }
  })();

  const [showSplash, setShowSplash] = useState(!initialIsPlatformAdmin && !initialIsApprovedSeller);
  const [view, setView] = useState<View>(
    initialIsPlatformAdmin ? 'platform_admin' : initialIsApprovedSeller ? 'seller_console' : 'home'
  );
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const hasManualCatalogExitRef = useRef(false);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [showSplash]);

  // --- Dynamic local states ---
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_products');
      if (saved) {
        let parsed: Product[] = JSON.parse(saved);
        // Exclude the ID '7' duplicate AR Quick-look test item
        parsed = parsed.filter(p => p.id !== '7');
        
        // Force update default products' details (including premium 3D models) to latest configuration
        const updatedParsed = parsed.map((p) => {
          const defaultProd = PRODUCTS.find((dp) => dp.id === p.id);
          if (defaultProd) {
            return {
              ...p,
              image: defaultProd.image,
              name: defaultProd.name,
              description: defaultProd.description,
              philosophy: defaultProd.philosophy,
              glbUrl: defaultProd.glbUrl,
              usdzUrl: defaultProd.usdzUrl
            };
          }
          return p;
        });

        // Auto-merge any newly added default products that aren't in cached stored items
        const missingDefaults = PRODUCTS.filter(
          (dp) => !updatedParsed.some((up) => up.id === dp.id)
        );

        return [...updatedParsed, ...missingDefaults];
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    if (initialIsPlatformAdmin) {
      return 'platform_admin';
    }
    if (initialIsApprovedSeller) {
      return 'admin';
    }
    try {
      const saved = localStorage.getItem('ballaar_user_role');
      return (saved as UserRole) || 'user';
    } catch {
      return 'user';
    }
  });

  const [adminCulture, setAdminCulture] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ballaar_admin_culture');
      return saved || 'Toraja';
    } catch {
      return 'Toraja';
    }
  });

  // Lifted UMKM Merchant Applications (real submissions only, synced with Cloud Firestore)
  const [applications, setApplications] = useState<MerchantApplication[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_global_merchant_applications');
      if (saved) {
        const parsed: MerchantApplication[] = JSON.parse(saved);
        const realOnly = parsed.filter(
          a =>
            a.applicantEmail !== 'tamu.nusantara@gmail.com' &&
            a.applicantEmail !== 'cantika_toraja@gmail.com' &&
            a.applicantEmail !== 'sanggar.toraja@ballaar.id'
        );
        if (realOnly.length !== parsed.length) {
          localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(realOnly));
        }
        return realOnly;
      }
    } catch {}
    return [];
  });

  // Lifted Platform Orders (real checkouts & manual recordings only, synced with Cloud Firestore)
  const [orders, setOrders] = useState<PlatformOrder[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_platform_orders');
      if (saved) {
        const parsed: PlatformOrder[] = JSON.parse(saved);
        const realOnly = parsed.filter(
          o =>
            o.orderCode !== 'BAL-2026-014' &&
            o.orderCode !== 'BAL-2026-015' &&
            o.buyerName !== 'Andi Mappanyukki' &&
            o.buyerName !== 'Siti Rahmawati'
        );
        if (realOnly.length !== parsed.length) {
          localStorage.setItem('ballaar_platform_orders', JSON.stringify(realOnly));
        }
        return realOnly;
      }
    } catch {}
    return [];
  });

  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdminGoogleLoading, setIsAdminGoogleLoading] = useState(false);
  const [curatorTab, setCuratorTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    localStorage.setItem('ballaar_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ballaar_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('ballaar_admin_culture', adminCulture);
  }, [adminCulture]);

  useEffect(() => {
    try {
      localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(applications));
    } catch {}
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem('ballaar_platform_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const handleAddProduct = (productData: {
    name: string;
    price: string;
    image: string;
    culture: string;
    description: string;
    philosophy: string;
    material?: string;
    dimensions?: { length: number; width: number; height: number };
  }) => {
    const newId = String(Date.now());
    const approvedApp = googleUser
      ? applications.find(
          a =>
            a.applicantEmail.toLowerCase() === googleUser.email.toLowerCase() &&
            a.status === 'approved'
        )
      : undefined;
    let sellerStoreName = approvedApp?.storeName || getStoreName(productData.culture);
    if (!approvedApp) {
      try {
        const savedStore = localStorage.getItem('ballaar_merchant_store_name');
        if (savedStore && savedStore.trim()) {
          sellerStoreName = savedStore.trim();
        }
      } catch {}
    }
    const newProduct: Product = {
      id: newId,
      ...productData,
      rating: 5.0,
      status: 'pending',
      sellerUid: auth.currentUser?.uid,
      sellerName: sellerStoreName
    };
    setProducts(prev => [newProduct, ...prev]);
    saveCatalogProductToDb(newProduct);
    handlePushNotification({
      tag: 'Pengajuan Produk Baru',
      tagColor: 'amber',
      title: `Diajukan: ${newProduct.name}`,
      desc: `Produk "${newProduct.name}" dari ${sellerStoreName} masuk antrean kurasi & pemodelan 3D Tim BALALA.`
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk pusaka adat ini dari toko Anda?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFavorites(prev => prev.filter(id => id !== productId));
      setCart(prev => prev.filter(item => item.product.id !== productId));
      deleteCatalogProductInDb(productId);
      if (selectedProduct?.id === productId) {
        setView('home');
        setSelectedProduct(null);
      }
    }
  };

  const handleDeleteProductDirect = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setFavorites(prev => prev.filter(id => id !== productId));
    setCart(prev => prev.filter(item => item.product.id !== productId));
    deleteCatalogProductInDb(productId);
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    const existing = products.find(p => p.id === productId);
    if (existing) {
      upsertCatalogProductInDb({ ...existing, ...updates });
    }
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...updates } : p)));
    if (selectedProduct?.id === productId) {
      setSelectedProduct(prev => (prev ? { ...prev, ...updates } : prev));
    }
  };

  const handleUpdateApplication = (appId: string, updates: Partial<MerchantApplication>) => {
    setApplications(prev => prev.map(a => (a.id === appId ? { ...a, ...updates } : a)));
    updateMerchantApplicationInDb(appId, updates);
  };

  const handleAddApplication = (newApp: MerchantApplication) => {
    setApplications(prev => [newApp, ...prev]);
    saveMerchantApplicationToDb(newApp);
  };

  const handleUpdateOrder = (orderId: string, updates: Partial<PlatformOrder>) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...updates } : o)));
    updatePlatformOrderInDb(orderId, updates);
  };

  const handleAddOrder = (newOrder: PlatformOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    savePlatformOrderToDb(newOrder);
  };

  const handlePushNotification = (notif: { tag: string; tagColor: string; title: string; desc: string }) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        ...notif,
        unread: true
      },
      ...prev
    ]);
  };

  const handleRecordCheckout = (payload: {
    items: { product: Product; quantity: number }[];
    phone: string;
    address: string;
    notes: string;
    shippingCost: number;
  }) => {
    const newOrders: PlatformOrder[] = payload.items.map((item, idx) => {
      const unitPrice = parseInt(item.product.price.replace(/[^0-9]/g, ''), 10) || 0;
      const netPrice = unitPrice * item.quantity;
      const matchedSeller =
        applications.find(
          a =>
            a.status === 'approved' &&
            ((item.product.sellerUid && a.applicantUid === item.product.sellerUid) ||
              (item.product.sellerName &&
                a.storeName.toLowerCase() === item.product.sellerName.toLowerCase()))
        ) ||
        applications.find(
          a => a.status === 'approved' && a.culture.toLowerCase() === item.product.culture.toLowerCase()
        );
      const commissionRate: 1 | 2 = matchedSeller?.commissionRate || 2;
      return {
        id: `ord-${Date.now()}-${idx}`,
        orderCode: `BLR-${String(orders.length + idx + 101)}`,
        productId: item.product.id,
        productName: item.quantity > 1 ? `${item.product.name} (x${item.quantity})` : item.product.name,
        productCulture: item.product.culture,
        productImage: item.product.image,
        sellerUid: item.product.sellerUid || matchedSeller?.applicantUid,
        sellerName: item.product.sellerName || matchedSeller?.storeName || getStoreName(item.product.culture),
        buyerUid: auth.currentUser?.uid,
        buyerName: googleUser?.name || `Pelanggan (${payload.phone})`,
        buyerPhone: payload.phone,
        shippingAddress: payload.address,
        notes: payload.notes || undefined,
        netPrice,
        shippingCost: idx === 0 ? payload.shippingCost : 0,
        commissionRate,
        gatewayVariableFee: 12000,
        status: 'awaiting_payment',
        createdAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };
    });

    setOrders(prev => [...newOrders, ...prev]);
    newOrders.forEach(order => {
      savePlatformOrderToDb(order);
    });

    if (newOrders.length > 0) {
      handlePushNotification({
        tag: 'Pesanan Baru',
        tagColor: 'teal',
        title: `Pesanan Masuk (${newOrders.length} item)`,
        desc: `Checkout dari ${newOrders[0].buyerName} menunggu verifikasi pembayaran oleh Admin Platform.`
      });
    }
  };

  const handleCurateProduct = (productId: string, action: 'approve' | 'reject') => {
    const nextStatus = action === 'approve' ? ('approved' as const) : ('rejected' as const);
    const targetProduct = products.find(p => p.id === productId);
    if (targetProduct) {
      upsertCatalogProductInDb({ ...targetProduct, status: nextStatus });
    }
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, status: nextStatus } : p))
    );

    if (targetProduct) {
      const newNotif = {
        id: Date.now(),
        tag: action === 'approve' ? 'Kurasi Adat ✔' : 'Kurasi Adat ✕',
        tagColor: action === 'approve' ? 'teal' : 'rose',
        title: action === 'approve' ? `Karya Disetujui: ${targetProduct.name}` : `Karya Ditangguhkan: ${targetProduct.name}`,
        desc: action === 'approve' 
          ? `Produk seni hias "${targetProduct.name}" dari Suku ${targetProduct.culture} dinyatakan OTENTIK oleh Kurasi Adat Balla AR & resmi dirilis ke galeri publik.` 
          : `Produk "${targetProduct.name}" Suku ${targetProduct.culture} ditangguhkan oleh komite kurator untuk revisi nilai filosofisnya.`,
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Google account sync state lifted from ProfileDrawer
  const [googleUser, setGoogleUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(initialStoredUser);

  useEffect(() => {
    if (googleUser) {
      localStorage.setItem('ballaar_google_user', JSON.stringify(googleUser));
    } else {
      localStorage.removeItem('ballaar_google_user');
    }
  }, [googleUser]);

  // Sync active Firebase auth session and directly open Admin Console if authorized
  useEffect(() => {
    const unsubscribe = subscribeAuthState((fbUser) => {
      if (fbUser) {
        setFirebaseUid(fbUser.uid);
        const syncedUser = {
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'Google User')}&background=13524D&color=FAF8F3&bold=true&size=150`
        };
        setGoogleUser(syncedUser);
        if (isAuthorizedPlatformAdmin(syncedUser.email) && !hasManualCatalogExitRef.current) {
          setUserRole('platform_admin');
          setShowSplash(false);
          setView('platform_admin');
        }
      } else {
        setFirebaseUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Cloud Firestore subscriptions (only real records)
  useEffect(() => {
    if (!firebaseUid) return;
    const isAdmin = isAuthorizedPlatformAdmin(googleUser?.email);
    const unsub = subscribeMerchantApplications(
      isAdmin,
      firebaseUid,
      (dbApps) => {
        setApplications(dbApps);
      },
      googleUser?.email
    );
    return () => unsub();
  }, [firebaseUid, googleUser?.email]);

  useEffect(() => {
    const isAdmin = Boolean(firebaseUid) && isAuthorizedPlatformAdmin(googleUser?.email);
    const isRemoteAssetUrl = (url?: string) =>
      Boolean(url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('data:')));

    const unsub = subscribeCatalogProducts(isAdmin, firebaseUid, (dbProds) => {
      setProducts(() => {
        const dbMap = new Map(dbProds.map(p => [p.id, p]));
        const mergedBase = PRODUCTS.map(dp => {
          const dbItem = dbMap.get(dp.id);
          if (!dbItem) return dp;
          return {
            ...dp,
            ...dbItem,
            image: dp.image,
            glbUrl: isRemoteAssetUrl(dbItem.glbUrl) ? dbItem.glbUrl : dp.glbUrl,
            usdzUrl: isRemoteAssetUrl(dbItem.usdzUrl) ? dbItem.usdzUrl : dp.usdzUrl
          };
        });
        const extraFromDb = dbProds.filter(p => !PRODUCTS.some(dp => dp.id === p.id));
        return [...extraFromDb, ...mergedBase];
      });
    });
    return () => unsub();
  }, [firebaseUid, googleUser?.email]);

  useEffect(() => {
    if (!firebaseUid) return;
    const isAdmin = isAuthorizedPlatformAdmin(googleUser?.email);
    const unsub = subscribePlatformOrders(isAdmin, firebaseUid, (dbOrders) => {
      setOrders(dbOrders);
    });
    return () => unsub();
  }, [firebaseUid, googleUser?.email]);

  // Strict email guard for Platform Admin & Tim BALALA role
  useEffect(() => {
    if (!isAuthorizedPlatformAdmin(googleUser?.email) && userRole === 'platform_admin') {
      setUserRole('user');
    }
  }, [googleUser, userRole]);

  // Automatically direct official approved UMKM partner accounts straight to Seller Dashboard
  useEffect(() => {
    if (!googleUser || isAuthorizedPlatformAdmin(googleUser.email)) return;
    const approvedApp = applications.find(
      a =>
        a.applicantEmail.toLowerCase() === googleUser.email.toLowerCase() &&
        a.status === 'approved'
    );
    if (approvedApp) {
      localStorage.setItem('ballaar_merchant_status', 'approved');
      localStorage.setItem('ballaar_merchant_store_name', approvedApp.storeName);
      localStorage.setItem('ballaar_merchant_store_culture', approvedApp.culture);
      localStorage.setItem('ballaar_merchant_address', approvedApp.address);
      localStorage.setItem('ballaar_merchant_bio', approvedApp.bio);
      if (!hasManualCatalogExitRef.current && view === 'home') {
        setIsProfileOpen(false);
        setUserRole('admin');
        setAdminCulture(approvedApp.culture);
        setShowSplash(false);
        setView('seller_console');
      }
    }
  }, [googleUser, applications, view]);

  const handleAdminGoogleSignIn = async () => {
    setIsAdminGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        hasManualCatalogExitRef.current = false;
        const loggedInUser = {
          name: user.displayName || 'Google User',
          email: user.email || '',
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Google User')}&background=13524D&color=FAF8F3&bold=true&size=150`
        };
        setGoogleUser(loggedInUser);
        if (isAuthorizedPlatformAdmin(loggedInUser.email)) {
          setUserRole('platform_admin');
          setShowSplash(false);
          setView('platform_admin');
        }
      }
    } catch (err) {
      console.error('Google Admin Sign-In Error:', err);
    } finally {
      setIsAdminGoogleLoading(false);
    }
  };

  const currentSellerApplication = googleUser
    ? applications.find(
        a =>
          a.applicantEmail.toLowerCase() === googleUser.email.toLowerCase() &&
          a.status === 'approved'
      ) || null
    : null;

  const myMerchantApplication = googleUser
    ? applications.find(
        a => a.applicantEmail.toLowerCase() === googleUser.email.toLowerCase()
      ) || null
    : null;

  const handleSubmitMerchantApplication = (data: {
    storeName: string;
    culture: string;
    whatsapp: string;
    address: string;
    bio: string;
  }) => {
    if (!googleUser) return;
    const normalizedEmail = googleUser.email.trim().toLowerCase();
    const existingApp = applications.find(
      a => a.applicantEmail.toLowerCase() === normalizedEmail
    );
    const newApp: MerchantApplication = {
      id: existingApp?.id || `app-${Date.now()}`,
      applicantUid: existingApp?.applicantUid || auth.currentUser?.uid,
      applicantName: googleUser.name,
      applicantEmail: normalizedEmail,
      storeName: data.storeName,
      culture: data.culture,
      address: data.address,
      bio: data.bio || '-',
      whatsapp: data.whatsapp || undefined,
      commissionRate: existingApp?.commissionRate || 2,
      submittedAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      status: 'pending'
    };

    const nextApps = [
      ...applications.filter(a => a.applicantEmail.toLowerCase() !== normalizedEmail),
      newApp
    ];
    setApplications(nextApps);
    localStorage.setItem('ballaar_global_merchant_applications', JSON.stringify(nextApps));
    localStorage.setItem('ballaar_merchant_status', 'pending');
    localStorage.setItem('ballaar_merchant_store_name', newApp.storeName);
    localStorage.setItem('ballaar_merchant_store_culture', newApp.culture);
    localStorage.setItem('ballaar_merchant_address', newApp.address);
    localStorage.setItem('ballaar_merchant_bio', newApp.bio);
    saveMerchantApplicationToDb(newApp);

    handlePushNotification({
      tag: 'Pendaftaran Mitra',
      tagColor: 'amber',
      title: `Pengajuan Sanggar: ${newApp.storeName}`,
      desc: `Pendaftaran mitra UMKM "${newApp.storeName}" telah dikirim ke Admin Platform untuk ditinjau.`
    });
  };

  const handleAdminLogout = () => {
    firebaseLogout().catch((err) => console.error('Error signing out:', err));
    hasManualCatalogExitRef.current = false;
    setGoogleUser(null);
    setUserRole('user');
    setApplications([]);
    setOrders([]);
    setView('home');
    localStorage.removeItem('ballaar_google_user');
    localStorage.removeItem('ballaar_merchant_status');
    localStorage.removeItem('ballaar_merchant_store_name');
    localStorage.removeItem('ballaar_merchant_store_culture');
    localStorage.removeItem('ballaar_merchant_bio');
    localStorage.removeItem('ballaar_merchant_address');
  };

  // Drawers open state togglers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHeritageModalOpen, setIsHeritageModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);

  // Dynamic notifications list with read/unread statuses
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      tag: 'Sistem AR Aktif',
      tagColor: 'teal',
      title: 'Uji Coba Kamera Real-time!',
      desc: 'Layanan visualisasi AR kami kini bekerja optimal. Klik "Open in new tab" jika Anda membukanya langsung dari dalam iframe lingkungan kerja AI Studio untuk melewatkan pencekalan izin browser.',
      unread: true
    },
    {
      id: 2,
      tag: 'Voucher Terbuka',
      tagColor: 'amber',
      title: 'Gratis Ongkir Cargo Jati',
      desc: 'Layanan pengantaran kargo tebal jaminan selamat sampai alamat Anda disubsidi Rp 350.000 (menjadi Gratis) jika total pemesanan Anda melampaui Rp10.000.050.',
      unread: true
    },
    {
      id: 3,
      tag: 'Informasi Sanggar',
      tagColor: 'slate',
      title: 'Pembaruan Sanggar Toraja',
      desc: 'Ketua Sanggar Ukir Tana Toraja memperbarui kesepakatan jalinan kustomisasi serat tenun sutra pilihan untuk bantal sofa minimalis modern.',
      unread: true
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Auto persist storage in background
  useEffect(() => {
    localStorage.setItem('ballaar_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ballaar_cart', JSON.stringify(cart));
  }, [cart]);

  // Operations
  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.product.id === productId) {
          const qty = item.quantity + delta;
          return qty > 0 ? { ...item, quantity: qty } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setPreviousView(view);
    setView('details');
  };

  const handleARClick = (e: React.MouseEvent | null, product: Product) => {
    if (e) {
      e.stopPropagation();
    }

    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      const isAndroidDevice = /Android/.test(ua);
      
      const glbUrl = getAbsoluteUrl(product.glbUrl);
      const usdzUrl = getAbsoluteUrl(product.usdzUrl);

      if (isIOSDevice && usdzUrl) {
        console.log("Directly launching iOS AR Quick Look...");
        const anchor = document.createElement('a');
        anchor.setAttribute('rel', 'ar');
        anchor.setAttribute('href', usdzUrl);
        const img = document.createElement('img');
        img.src = product.image;
        anchor.appendChild(img);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        return;
      } else if (isAndroidDevice && glbUrl) {
        console.log("Directly launching Android Scene Viewer...");
        const titleEnc = encodeURIComponent(product.name);
        const fallbackUrl = window.location.href;
        const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&title=${titleEnc}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end;`;
        window.location.href = sceneViewerUrl;
        return;
      }
    }

    setSelectedProduct(product);
    setPreviousView(view);
    setView('ar');
  };

  const handleBack = () => {
    if (view === 'ar' && previousView === 'details') {
      setView('details');
    } else {
      setView('home');
    }
  };

  // Filtered listing based on interactive tab and search query text
  const filteredProducts = products.filter(p => {
    const isApproved = !p.status || p.status === 'approved';
    const isMyProductUnderEvaluation =
      userRole === 'admin' &&
      ((firebaseUid && p.sellerUid === firebaseUid) ||
        p.culture.toLowerCase() === adminCulture.toLowerCase()) &&
      (p.status === 'pending' || p.status === 'needs_revision' || p.status === 'in_3d_process' || p.status === 'rejected');
    
    if (!isApproved && !isMyProductUnderEvaluation) {
      return false;
    }

    const matchesCategory = categoryFilter === 'all' || p.culture.toLowerCase() === categoryFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.culture.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen liquid-canvas text-[#162624] font-sans antialiased relative overflow-x-clip">
      {/* Ambient Liquid Glass Light Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-16 w-[440px] h-[440px] bg-[#1B6861]/14 rounded-full blur-[90px] animate-liquid-drift" />
        <div className="absolute top-[42%] -left-24 w-[380px] h-[380px] bg-[#C59B42]/14 rounded-full blur-[90px]" />
        <div className="absolute -bottom-24 right-[20%] w-[420px] h-[420px] bg-[#13524D]/10 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-[10000] liquid-canvas backdrop-blur-xl flex flex-col items-center justify-between py-20 px-6"
          >
            <div className="h-10" />

            <div className="flex flex-col items-center gap-5 liquid-glass rounded-3xl px-10 py-8">
              <div className="flex items-center gap-4 sm:gap-5">
                <Logo className="w-14 h-14 sm:w-16 sm:h-16 shadow-md" />
                <div className="flex flex-col select-none">
                  <h1 className="text-[40px] sm:text-[48px] font-bold font-serif text-[#10423E] leading-[0.9] tracking-tight">
                    Balla
                  </h1>
                  <p className="text-[14px] sm:text-[16px] font-extrabold text-[#A87F2D] tracking-[0.45em] uppercase text-left pl-0.5">
                    AR
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#13524D]/75 tracking-[0.3em] uppercase text-center mt-1 max-w-xs leading-relaxed">
                South Sulawesi Heritage Interiors
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#13524D]/20 border-t-[#13524D] animate-spin" />
              <span className="text-xs font-semibold text-[#10423E]/75">
                Memuat Galeri Karya
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col min-h-screen"
          >
            <Header 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onProfileClick={() => setIsProfileOpen(true)}
              onNotificationClick={() => setIsNotificationsOpen(true)}
              onFavoritesClick={() => setIsFavoritesOpen(true)}
              onCartClick={() => setIsCartOpen(true)}
              onHomeClick={() => { setView('home'); setCategoryFilter('all'); setSearchQuery(''); }}
              onOpenPlatformAdmin={() => {
                if (isAuthorizedPlatformAdmin(googleUser?.email)) {
                  setUserRole('platform_admin');
                  setView('platform_admin');
                }
              }}
              onOpenSellerDashboard={() => {
                if (currentSellerApplication || userRole === 'admin') {
                  setUserRole('admin');
                  if (currentSellerApplication) {
                    setAdminCulture(currentSellerApplication.culture);
                  }
                  setView('seller_console');
                }
              }}
              cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
              favoritesCount={favorites.length}
              unreadCount={unreadCount}
              googleUser={googleUser}
              userRole={userRole}
              hasActiveOverlay={isCartOpen || isFavoritesOpen || isProfileOpen || isNotificationsOpen}
            />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 pb-14">
              <HeroBanner onLearnMore={() => setIsHeritageModalOpen(true)} />

              {/* Platform Admin & Tim BALALA Quick Entry Card on Home (Restricted to wirabuanamohalfinoor@gmail.com) */}
              {isAuthorizedPlatformAdmin(googleUser?.email) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass-dark text-[#FAF8F3] rounded-3xl p-5 sm:p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#D7B463]/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#D7B463] font-semibold">
                      <Shield size={14} />
                      <span>Admin Platform &amp; Tim Teknis 3D (Tim BALALA)</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-[#FAF8F3]">
                      Operasional Pusat, Workshop 3D/AR &amp; Transaksi Balla AR
                    </h2>
                    <p className="text-xs text-[#E5EFED]/80 max-w-2xl leading-relaxed">
                      Akses khusus terverifikasi untuk {googleUser?.email}. Kelola antrean aset 3D (.glb/.usdz), verifikasi UMKM, katalog global, dan komisi 1%–2%.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserRole('platform_admin');
                      setView('platform_admin');
                    }}
                    className="liquid-glass-gold hover:brightness-105 active:scale-95 text-[#0A2926] font-extrabold px-5 py-3 rounded-full text-xs flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center transition-all shrink-0 whitespace-nowrap"
                  >
                    <Sparkles size={14} />
                    <span>Buka Console Admin &amp; 3D</span>
                  </button>
                </motion.div>
              )}

              {/* Seller / UMKM Dashboard Quick Control Card */}
              {userRole === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass-dark text-[#FAF8F3] rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#D7B463] font-semibold">
                      <span>Dasbor Penjual / UMKM Pengrajin</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#F7EFDB]">{currentSellerApplication?.culture || adminCulture}</span>
                    </div>
                    <h2 className="text-xl font-serif font-bold tracking-tight text-[#FAF8F3]">
                      Panel {currentSellerApplication?.storeName || getStoreName(adminCulture)}
                    </h2>
                    <p className="text-xs text-[#E5EFED]/80 max-w-2xl leading-relaxed">
                      Kelola karya seni kerajinan Anda. Ajukan produk pusaka baru untuk dimodelkan 3D oleh Tim BALALA serta proses pesanan masuk.
                    </p>
                    
                    <div className="flex gap-6 mt-4 pt-4 border-t border-[#D7B463]/20">
                      <div>
                        <p className="text-[11px] text-[#E5EFED]/70 font-medium">Produk Sanggar</p>
                        <p className="text-base font-extrabold tabular-nums text-[#D7B463] mt-0.5">
                          {products.filter(p => (firebaseUid && p.sellerUid ? p.sellerUid === firebaseUid : p.sellerName === (currentSellerApplication?.storeName || getStoreName(adminCulture)))).length} <span className="text-xs font-sans text-[#E5EFED]/80 font-normal">Karya Adat</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#E5EFED]/70 font-medium">Status Mitra</p>
                        <p className="text-xs font-bold text-[#9ED4C8] mt-1">Terverifikasi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 self-stretch md:self-auto shrink-0">
                    <button
                      onClick={() => setView('seller_console')}
                      className="liquid-glass-pill hover:bg-[#FAF8F3] active:scale-95 text-[#10423E] font-bold px-5 py-3 rounded-full text-xs flex items-center gap-2 cursor-pointer justify-center transition-all whitespace-nowrap"
                    >
                      <Store size={15} />
                      <span>Buka Dasbor Penjual</span>
                    </button>
                    <button
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="liquid-glass-gold hover:brightness-105 active:scale-95 text-[#0A2926] font-extrabold px-6 py-3 rounded-full text-xs flex items-center gap-2 cursor-pointer justify-center transition-all whitespace-nowrap"
                    >
                      <Plus size={15} className="stroke-[2.5]" />
                      <span>Tambah Produk Baru</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Curator Dashboard Panel */}
              {userRole === 'curator' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass-dark text-[#FAF8F3] rounded-3xl p-6 mb-8 space-y-6 overflow-hidden relative"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D7B463]/20 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#D7B463] font-semibold">
                        <CheckCircle2 size={13} />
                        <span>Komite Evaluasi Adat</span>
                      </div>
                      <h2 className="text-xl font-serif font-bold tracking-tight text-[#FAF8F3]">
                        Persetujuan &amp; Otentisitas Karya Adat Serumpun
                      </h2>
                      <p className="text-xs text-[#E5EFED]/80 max-w-3xl leading-relaxed">
                        Tinjau kiriman produk pusaka budaya terbaru dari sanggar kerajinan adat Sulawesi Selatan sebelum dirilis ke galeri publik.
                      </p>
                    </div>

                    {/* Curator Toggles */}
                    <div className="flex bg-white/10 p-1 rounded-xl text-xs font-semibold gap-1 shrink-0 self-stretch md:self-auto border border-[#D7B463]/25">
                      <button
                        onClick={() => setCuratorTab('pending')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-[11px] whitespace-nowrap ${curatorTab === 'pending' ? 'bg-[#D7B463] text-[#0A2926] shadow-sm font-bold' : 'text-[#E5EFED]/80 hover:text-white'}`}
                      >
                        Menunggu ({products.filter(p => p.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setCuratorTab('history')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-[11px] whitespace-nowrap ${curatorTab === 'history' ? 'bg-[#D7B463] text-[#0A2926] shadow-sm font-bold' : 'text-[#E5EFED]/80 hover:text-white'}`}
                      >
                        Riwayat ({products.filter(p => p.status === 'approved' || p.status === 'rejected').length})
                      </button>
                    </div>
                  </div>

                  {/* Curator Table/List */}
                  <div>
                    {curatorTab === 'pending' ? (
                      <div>
                        {products.filter(p => p.status === 'pending').length === 0 ? (
                          <div className="py-10 text-center bg-white/5 rounded-2xl border border-white/10 p-4">
                            <h4 className="text-xs font-bold text-[#FAF8F3] font-serif">Semua Kiriman Karya Sudah Terkurasi</h4>
                            <p className="text-[11px] text-[#E5EFED]/70 mt-1 max-w-md mx-auto leading-relaxed">
                              Tidak ada antrean pengajuan produk saat ini dari para pengrajin suku Toraja, Makassar, Bugis, maupun Mandar.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {products.filter(p => p.status === 'pending').map((p, idx) => (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#0A201E]/80 p-4 rounded-2xl border border-[#D7B463]/20 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
                              >
                                <div className="flex gap-4 items-start flex-1 min-w-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-16 h-16 rounded-xl object-cover border border-[#D7B463]/25 shrink-0 shadow-md"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-bold text-[#D7B463]">Suku {p.culture}</span>
                                      <span aria-hidden="true" className="text-[#E5EFED]/40">·</span>
                                      <span className="tabular-nums text-[#9ED4C8] font-extrabold">{p.price}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-[#FAF8F3] font-serif leading-tight">{p.name}</h4>
                                    <p className="text-xs text-[#E5EFED]/80 leading-normal line-clamp-2">{p.description}</p>
                                    <div className="bg-[#071816]/80 p-2.5 rounded-xl text-[11px] border border-white/10 text-[#F7EFDB]/90 leading-relaxed mt-1">
                                      <span className="font-bold text-[#D7B463]">Filosofi Adat: </span>
                                      <span className="italic">{p.philosophy || "Belum dicantumkan kesaksian sejarah kerajinan."}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
                                  <button
                                    onClick={() => handleCurateProduct(p.id, 'reject')}
                                    className="flex-1 sm:flex-none text-[11px] font-bold border border-[#9E3F44]/40 text-[#F7DFDF] bg-[#7C3238]/30 hover:bg-[#7C3238]/50 px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                                  >
                                    Tolak
                                  </button>
                                  <button
                                    onClick={() => handleCurateProduct(p.id, 'approve')}
                                    className="flex-1 sm:flex-none text-[11px] font-extrabold text-[#0A2926] liquid-glass-gold hover:brightness-105 px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer active:scale-95 text-center"
                                  >
                                    Setujui Produk
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {products.filter(p => p.status === 'approved' || p.status === 'rejected').length === 0 ? (
                          <div className="py-10 text-center bg-white/5 rounded-2xl border border-white/10 p-4">
                            <p className="text-xs text-[#E5EFED]/70">Belum ada karya seni yang dinilai sejauh ini.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {products.filter(p => p.status === 'approved' || p.status === 'rejected').map(p => (
                              <div
                                key={p.id}
                                className="bg-[#0A201E]/80 p-3 rounded-2xl border border-[#D7B463]/20 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-white/20 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-[#FAF8F3] truncate leading-tight font-serif">{p.name}</h5>
                                    <span className="text-[10px] text-[#E5EFED]/70">Suku {p.culture}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[10px] font-bold ${
                                    p.status === 'approved' ? 'text-[#9ED4C8]' : 'text-[#F0B3B6]'
                                  }`}>
                                    {p.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      handleUpdateProduct(p.id, { status: 'pending' });
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-[#FAF8F3] transition-colors cursor-pointer text-[10px] font-bold"
                                    title="Evaluasi Ulang"
                                  >
                                    Review
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <CultureCategories activeCategory={categoryFilter} onSelectCategory={setCategoryFilter} />
              
              {/* Product Grid Area */}
              <div id="katalog-pilihan" className="mb-10 scroll-mt-24">
                {/* Responsive Liquid Glass Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center liquid-glass rounded-3xl p-6">
                    <p className="text-[#445754] text-sm font-semibold">Tidak ada produk warisan yang cocok dengan "{searchQuery}"</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                      className="mt-4 liquid-glass-teal font-bold px-5 py-2.5 rounded-full text-[#FAF8F3] text-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                      Buka Semua Koleksi
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((product, index) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        index={index} 
                        onARClick={(e) => handleARClick(e, product)}
                        onClick={() => handleProductClick(product)}
                        isFavorite={favorites.includes(product.id)}
                        onToggleFavorite={() => handleToggleFavorite(product.id)}
                        onAddToCart={() => handleAddToCart(product)}
                        userRole={userRole}
                        adminCulture={adminCulture}
                        onDelete={() => handleDeleteProduct(product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </motion.div>
        )}

        {view === 'ar' && (
          <ARView key="ar" product={selectedProduct} onBack={handleBack} />
        )}

        {view === 'details' && selectedProduct && (
          <ProductDetailView 
            key="details" 
            product={selectedProduct} 
            onBack={() => setView('home')} 
            onAR={() => {
              handleARClick(null, selectedProduct);
            }}
            isFavorite={favorites.includes(selectedProduct.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedProduct.id)}
            onAddToCart={() => handleAddToCart(selectedProduct)}
          />
        )}

        {view === 'platform_admin' && (
          <motion.div
            key="platform_admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center text-xs text-stone-500">
                  Memuat Console Admin Platform...
                </div>
              }
            >
              <PlatformAdminConsole
                googleUser={googleUser}
                onSignInWithGoogle={handleAdminGoogleSignIn}
                onLogout={handleAdminLogout}
                isGoogleLoading={isAdminGoogleLoading}
                onExitConsole={() => {
                  hasManualCatalogExitRef.current = true;
                  setView('home');
                }}
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProductDirect={handleDeleteProductDirect}
                onOpenAddProduct={() => setIsAddProductModalOpen(true)}
                applications={applications}
                onUpdateApplication={handleUpdateApplication}
                onAddApplication={handleAddApplication}
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
                onAddOrder={handleAddOrder}
                onPushNotification={handlePushNotification}
              />
            </Suspense>
          </motion.div>
        )}
        
        {view === 'seller_console' && (
          <motion.div
            key="seller_console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center text-xs text-stone-500">
                  Memuat Dasbor Mitra UMKM...
                </div>
              }
            >
              <SellerDashboardConsole
                googleUser={googleUser}
                storeProfile={currentSellerApplication}
                adminCulture={currentSellerApplication?.culture || adminCulture}
                products={products}
                orders={orders}
                firebaseUid={firebaseUid}
                onOpenAddProduct={() => setIsAddProductModalOpen(true)}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProductDirect={handleDeleteProductDirect}
                onUpdateOrder={handleUpdateOrder}
                onExitConsole={() => {
                  hasManualCatalogExitRef.current = true;
                  setView('home');
                }}
                onLogout={handleAdminLogout}
              />
            </Suspense>
          </motion.div>
        )}

        {view === 'merchant_register' && (
          <motion.div
            key="merchant_register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center text-xs text-stone-500">
                  Memuat Halaman Pendaftaran Mitra...
                </div>
              }
            >
              <MerchantRegistrationPage
                googleUser={googleUser}
                existingApplication={myMerchantApplication}
                onSubmitApplication={handleSubmitMerchantApplication}
                onOpenSellerDashboard={() => {
                  hasManualCatalogExitRef.current = false;
                  setUserRole('admin');
                  if (myMerchantApplication) {
                    setAdminCulture(myMerchantApplication.culture);
                  }
                  setView('seller_console');
                }}
                onBackToHome={() => setView('home')}
                onSignInWithGoogle={handleAdminGoogleSignIn}
                isGoogleLoading={isAdminGoogleLoading}
              />
            </Suspense>
          </motion.div>
        )}
        
      </AnimatePresence>

      {/* --- Drawers and Modals Overlays --- */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onRecordCheckout={handleRecordCheckout}
          />
        )}

        {isFavoritesOpen && (
          <FavoritesDrawer 
            isOpen={isFavoritesOpen}
            onClose={() => setIsFavoritesOpen(false)}
            favorites={favorites}
            products={products}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={handleProductClick}
            onAddToCart={handleAddToCart}
          />
        )}

        {isProfileOpen && (
          <ProfileDrawer 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            favoritesCount={favorites.length}
            cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
            userRole={userRole}
            setUserRole={setUserRole}
            adminCulture={adminCulture}
            setAdminCulture={setAdminCulture}
            googleUser={googleUser}
            setGoogleUser={setGoogleUser}
            applications={applications}
            setApplications={setApplications}
            onOpenPlatformAdmin={(verifiedEmail) => {
              if (isAuthorizedPlatformAdmin(verifiedEmail ?? googleUser?.email)) {
                hasManualCatalogExitRef.current = false;
                setUserRole('platform_admin');
                setShowSplash(false);
                setView('platform_admin');
              }
            }}
            onOpenSellerDashboard={(culture) => {
              hasManualCatalogExitRef.current = false;
              setUserRole('admin');
              if (culture) setAdminCulture(culture);
              setShowSplash(false);
              setView('seller_console');
            }}
            onResetManualExit={() => {
              hasManualCatalogExitRef.current = false;
            }}
            onOpenMerchantRegistration={() => {
              setIsProfileOpen(false);
              setView('merchant_register');
            }}
          />
        )}

        <Suspense fallback={null}>
          {isHeritageModalOpen && (
            <HeritageModal 
              isOpen={isHeritageModalOpen}
              onClose={() => setIsHeritageModalOpen(false)}
            />
          )}
        </Suspense>

        {/* Notifications Modal/Drawer Overlay */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[200] overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-[#0A2926]/45 backdrop-blur-md"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="w-screen max-w-sm liquid-glass border-l border-white/85 shadow-2xl flex flex-col h-full"
              >
                <div className="p-6 border-b border-[#D7B463]/20 flex items-center justify-between liquid-glass-dark text-[#FAF8F3]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D7B463]/15 border border-[#D7B463]/30 flex items-center justify-center text-[#D7B463]">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold font-serif text-[#FAF8F3]">Pusat Informasi</h2>
                      <p className="text-[11px] text-[#D7B463]/85">Pembaruan &amp; Diskon</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    aria-label="Tutup pusat informasi"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-[#FAF8F3] cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Filter Tabs for Notifications Center */}
                <div className="flex gap-2 p-3 bg-[#FAF8F3]/60 backdrop-blur-md border-b border-[#D7B463]/20 shrink-0">
                  <button 
                    onClick={() => setShowOnlyUnread(true)}
                    className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer tabular-nums ${
                      showOnlyUnread 
                        ? 'liquid-glass-teal text-[#FAF8F3] shadow-sm' 
                        : 'liquid-glass-pill text-[#445754] hover:text-[#10423E]'
                    }`}
                  >
                    Belum Dibaca ({unreadCount})
                  </button>
                  <button 
                    onClick={() => setShowOnlyUnread(false)}
                    className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer tabular-nums ${
                      !showOnlyUnread 
                        ? 'liquid-glass-teal text-[#FAF8F3] shadow-sm' 
                        : 'liquid-glass-pill text-[#445754] hover:text-[#10423E]'
                    }`}
                  >
                    Semua ({notifications.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3.5 no-scrollbar">
                  {showOnlyUnread && unreadCount > 0 && (
                    <p className="text-[10.5px] text-[#5C6F6B] text-center pb-1">
                      Menampilkan info baru. Tandai sudah dibaca untuk mengarsipkan.
                    </p>
                  )}
                  
                  {((showOnlyUnread ? notifications.filter(n => n.unread) : notifications).length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-[#5C6F6B] space-y-3.5">
                      <div className="w-12 h-12 rounded-full liquid-glass-pill flex items-center justify-center text-[#13524D]">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#10423E]">Semua Informasi Selesai Dibaca</h4>
                        <p className="text-[11px] text-[#5C6F6B] mt-1 leading-relaxed max-w-[210px] mx-auto">
                          Tidak ada notifikasi baru. Tekan opsi "Semua" untuk melihat riwayat informasi.
                        </p>
                      </div>
                    </div>
                  ) : (
                    (showOnlyUnread ? notifications.filter(n => n.unread) : notifications).map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-4 rounded-2xl transition-all relative overflow-hidden liquid-glass-card ${
                          notif.unread 
                            ? 'opacity-100' 
                            : 'opacity-65'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-bold block ${
                            notif.unread 
                              ? notif.tagColor === 'teal' ? 'text-[#13524D]' : notif.tagColor === 'amber' ? 'text-[#A87F2D]' : notif.tagColor === 'rose' ? 'text-[#9E3F44]' : 'text-[#445754]'
                              : 'text-[#5C6F6B]'
                          }`}>
                            {notif.tag}
                          </span>
                        </div>
                        
                        <h4 className={`text-xs font-bold mt-1 ${notif.unread ? 'text-[#10423E]' : 'text-[#445754]'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-[11px] leading-relaxed mt-1 text-[#445754]">
                          {notif.desc}
                        </p>

                        <div className="mt-3 flex gap-2">
                          {notif.unread ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                              }}
                              className="text-[10.5px] font-bold text-[#10423E] bg-[#13524D]/10 hover:bg-[#13524D]/18 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-[#13524D]/20 flex items-center gap-1.5 active:scale-95"
                            >
                              <Check size={11} />
                              <span>Tandai Sudah Dibaca</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: true } : n));
                              }}
                              className="text-[10.5px] font-bold text-[#445754] hover:text-[#10423E] liquid-glass-pill px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <span>Tandai Belum Dibaca</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-[#FAF8F3]/65 backdrop-blur-md border-t border-[#D7B463]/20 text-center">
                  <button 
                    disabled={unreadCount === 0}
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                    }}
                    className="w-full py-2.5 liquid-glass-teal text-[#FAF8F3] disabled:opacity-40 font-bold transition-all text-xs rounded-full pointer-events-auto cursor-pointer"
                  >
                    Tandai Semua Sudah Dibaca
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          {isAddProductModalOpen && (
            <AddProductModal
              isOpen={isAddProductModalOpen}
              onClose={() => setIsAddProductModalOpen(false)}
              adminCulture={adminCulture}
              onAddProduct={handleAddProduct}
            />
          )}
        </Suspense>
      </AnimatePresence>
    </div>
  );
}
