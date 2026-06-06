/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Product Asset Imports ---
import torajaChairImage from './assets/images/toraja_chair_pareppo_1780513206751.png';
import bugisWardrobeImage from './assets/images/bugis_wardrobe_sulur_1780513220910.png';
import torajaTableImage from './assets/images/toraja_table_passura_1780513234957.png';
import makassarCabinetImage from './assets/images/makassar_cabinet_phinisi_1780513248734.png';
import mandarSofaImage from './assets/images/mandar_sofa_saqbe_1780513263910.png';
import bugisBuffetImage from './assets/images/bugis_buffet_kaligrafi_1780513278698.png';

// --- Custom Modular Drawers & Modals ---
import Logo from './components/Logo';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import HeritageModal from './components/HeritageModal';
import AddProductModal from './components/AddProductModal';

// --- Types ---
type View = 'home' | 'ar' | 'details';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  culture: string;
  rating: number;
  description: string;
  philosophy: string;
  status?: 'pending' | 'approved' | 'rejected';
}

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
    pattern: 'bg-teal-700'
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
    pattern: 'bg-amber-600'
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
    pattern: 'bg-red-700'
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
    pattern: 'bg-indigo-800'
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
    philosophy: "Motif Pa'reppo pada kursi ini melambangkan keteguhan hati, kemantapan berfikir, dan kemapanan dalam jenjang kehidupan masyarakat adat Toraja."
  },
  {
    id: '2',
    name: "Lemari Ukir Sulur Bugis",
    price: "Rp 7.200.000",
    image: bugisWardrobeImage,
    culture: "Bugis",
    rating: 4.9,
    description: "Lemari pakaian mahakarya seni ukir Bugis dengan garis sulur organik yang elegan, sangat luas dan memperindah interior kamar tidur mewah Anda.",
    philosophy: "Motif 'sulur' pada lemari ini merepresentasikan pertumbuhan berkelanjutan, kemakmuran, dan keterhubungan segala lini kehidupan dalam falsafah adat suku Bugis."
  },
  {
    id: '3',
    name: "Meja Makan Passura'",
    price: "Rp 8.500.000",
    image: torajaTableImage,
    culture: "Toraja",
    rating: 4.7,
    description: "Meja makan kayu jati solid yang dihiasi ukiran geometris Toraja penuh detail presisi, cocok untuk perjamuan keluarga yang hangat.",
    philosophy: "Passura' melambangkan kearifan lokal Toraja yang dituangkan dalam ukiran geometris presisi, mengajarkan ketelitian serta keteraturan hukum semesta."
  },
  {
    id: '4',
    name: "Lemari Ukir Phinisi",
    price: "Rp 12.000.000",
    image: makassarCabinetImage,
    culture: "Makassar",
    rating: 4.7,
    description: "Lemari pajangan luxury dengan ukiran relief epik penjelajahan kapal legendaris Phinisi Bugis-Makassar yang mengarungi samudera luas.",
    philosophy: "Ukiran kapal Phinisi yang legendaris melambangkan keteguhan berjuang, tekad pantang menyerah, keberanian, dan jiwa pelaut sejati masyarakat Makassar."
  },
  {
    id: '5',
    name: "Sofa Minimalis Saqbe",
    price: "Rp 5.800.000",
    image: mandarSofaImage,
    culture: "Mandar",
    rating: 4.6,
    description: "Sofa santai dengan bantalan empuk berlapis tenun motif sutra Saqbe Mandar asli, memadukan modernitas furnitur dengan sentuhan kerajinan wastra nusantara.",
    philosophy: "Terinspirasi dari tenun Saqbe Mandar, melambangkan kerapian tatanan kebersamaan, kehangatan rasa, dan kelembutan tradisi leluhur dalam harmoni kontemporer."
  },
  {
    id: '6',
    name: "Buffet Ukir Kaligrafi",
    price: "Rp 6.400.000",
    image: bugisBuffetImage,
    culture: "Bugis",
    rating: 4.5,
    description: "Meja buffet serbaguna yang anggun, mengkolaborasikan aksen kaligrafi bermakna spiritual dengan ornamen geometris lokal tanah Bugis.",
    philosophy: "Perpaduan seni kaligrafi dengan motif sakral tradisional Bugis yang melambangkan berkah spiritualitas, ketenangan batin, serta perlindungan Ilahi."
  }
];

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
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    className="fixed inset-0 z-[100] bg-slate-50/95 backdrop-blur-md overflow-y-auto no-scrollbar flex items-center justify-center p-0 md:p-6 lg:p-12"
  >
    <div className="w-full max-w-5xl bg-white min-h-screen md:min-h-0 md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
      
      {/* Left Pane: Image Showcase */}
      <div className="relative h-[45vh] md:h-[600px] md:w-1/2 w-full bg-slate-100 flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/40 transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={onToggleFavorite}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/40 transition-colors cursor-pointer"
          >
            <Heart size={20} className={isFavorite ? "fill-rose-500 text-rose-500 animate-pulse" : "hover:fill-rose-500 transition-colors"} />
          </button>
        </div>
      </div>

      {/* Right Pane: Detailed Content */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[600px] no-scrollbar pb-48 md:pb-10">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{product.culture} Heritage</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-tight mt-1">{product.name}</h2>
            </div>
            <div className="bg-teal-50 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 h-fit">
              <Star size={14} className="fill-teal-600 text-teal-600" />
              <span className="text-sm font-bold text-teal-800">{product.rating}</span>
            </div>
          </div>

          <p className="text-2xl font-bold text-teal-800 mb-6">{product.price}</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Deskripsi Produk</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Filosofi & Nilai Seni</h3>
              <div className="bg-teal-50/50 border-l-4 border-teal-600 p-4 rounded-r-2xl">
                <p className="text-slate-700 leading-relaxed italic font-serif text-sm">
                  "{product.philosophy}"
                </p>
              </div>
            </section>

            <section className="pb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Spesifikasi Detail</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Material Utama</p>
                  <p className="text-xs font-bold text-slate-800">Kayu Jati Perhutani Grade A</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Dimensi Fisik</p>
                  <p className="text-xs font-bold text-slate-800">P: 120cm, L: 45cm, T: 180cm</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Panel for Desktop Detail View */}
        <div className="hidden md:flex flex-col gap-3 mt-6 pt-6 border-t border-slate-100">
          <motion.button 
            onClick={onAddToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/15 cursor-pointer transition-colors"
          >
            <ShoppingBag size={18} />
            <span>Masukkan ke Keranjang Belanja</span>
            <ExternalLink size={14} />
          </motion.button>
          
          <button 
            onClick={onAR}
            className="w-full bg-slate-50 hover:bg-teal-600 hover:text-white text-teal-800 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Maximize2 size={14} />
            <span>Posisikan di Ruangan Anda (AR)</span>
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Only Fixed Bottom Action Dock (Doesn't hide detail specs as we increased pb-32 padding in content pane) */}
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 p-5 flex flex-col gap-3.5 z-50">
      <motion.button 
        onClick={onAddToCart}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-teal-600 text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-500/15 cursor-pointer"
      >
        <ShoppingBag size={18} />
        <span>Masukkan ke Keranjang Belanja</span>
        <ExternalLink size={14} />
      </motion.button>
      
      <button 
        onClick={onAR}
        className="w-full bg-teal-50 text-teal-800 py-3 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <Maximize2 size={14} />
        <span>Posisikan di Ruangan Anda (AR)</span>
      </button>
    </div>
  </motion.div>
);

/// --- ARView ---
const ARView = ({ product, onBack }: { product: Product | null; onBack: () => void; key?: string }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [showStory, setShowStory] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Video Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Gyroscope tracking parameters
  const [gyroEnabled, setGyroEnabled] = useState<boolean>(false);
  const [gyroPermission, setGyroPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  
  const initialOrientationRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);
  const [currentOrientation, setCurrentOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);

  // Position, scale, rotation of the item
  const [basePosition, setBasePosition] = useState({ x: 0, y: 40 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);

  // Pointer drag trackers
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // 1. Activate Device Camera on Mount
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err: any) {
        console.warn("Camera streaming failed, falling back to static interior preview:", err);
        setCameraError(err.message || 'Izin kamera ditolak');
        setHasCamera(false);
      }
    }
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Scan completion simulate
  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // 3. Setup device orientation detectors
  useEffect(() => {
    // Detect iOS API presence
    const requestPermissionExists = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    if (requestPermissionExists) {
      setGyroPermission('prompt');
    } else if (window.DeviceOrientationEvent) {
      setGyroPermission('granted');
      setGyroEnabled(true);
    } else {
      setGyroPermission('unsupported');
    }
  }, []);

  // 4. Orientation listener logic
  useEffect(() => {
    if (!gyroEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null) return;

      if (!initialOrientationRef.current) {
        // Log original anchor point
        initialOrientationRef.current = { alpha: e.alpha, beta: e.beta, gamma: e.gamma || 0 };
      }

      setCurrentOrientation({
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma || 0
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [gyroEnabled]);

  // Request explicit permission for iOS Safari
  const requestPermission = async () => {
    const api = (DeviceOrientationEvent as any).requestPermission;
    if (typeof api === 'function') {
      try {
        const res = await api();
        if (res === 'granted') {
          setGyroPermission('granted');
          setGyroEnabled(true);
          calibrateAnchor();
        } else {
          setGyroPermission('denied');
          setGyroEnabled(false);
        }
      } catch (err) {
        console.error("Sensor orientation permission error:", err);
        setGyroPermission('denied');
      }
    } else {
      setGyroEnabled(true);
      calibrateAnchor();
    }
  };

  // Re-pin baseline and capture orientation angles
  const calibrateAnchor = () => {
    initialOrientationRef.current = null;
    setCurrentOrientation(null);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
  };

  // Drag listeners
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isScanning) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos(basePosition);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isScanning) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setBasePosition({
      x: initialPos.x + dx,
      y: initialPos.y + dy
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Compute calculated anchor displacement coordinates
  let gyroX = 0;
  let gyroY = 0;

  if (gyroEnabled && initialOrientationRef.current && currentOrientation) {
    let dAlpha = currentOrientation.alpha - initialOrientationRef.current.alpha;
    if (dAlpha > 180) dAlpha -= 360;
    if (dAlpha < -180) dAlpha += 360;

    let dBeta = currentOrientation.beta - initialOrientationRef.current.beta;
    if (dBeta > 180) dBeta -= 360;
    if (dBeta < -180) dBeta += 360;

    // Pixel per degree coefficients
    const sensitivityX = 18;
    const sensitivityY = 22;

    // Invert so the model stays in place in 3D scene relative to phone movement
    gyroX = -dAlpha * sensitivityX;
    gyroY = dBeta * sensitivityY;
  }

  const posX = basePosition.x + gyroX;
  const posY = basePosition.y + gyroY;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 w-full h-screen z-[100] bg-black overflow-hidden flex flex-col select-none touch-none"
    >
      {/* Absolute Background Camera Stream */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <video 
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${hasCamera ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
        
        {!hasCamera && (
          <div className="w-full h-full relative">
            <img 
              src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1974&auto=format&fit=crop" 
              alt="Fallback Living Room Feed" 
              className="w-full h-full object-cover brightness-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-4 top-24 mx-auto max-w-sm bg-black/85 backdrop-blur-md px-5 py-4 rounded-3xl border border-teal-500/30 text-white text-xs text-center z-10 font-sans flex flex-col gap-2.5 shadow-2xl">
              <span className="font-bold text-teal-300 text-[13px] tracking-wide flex items-center justify-center gap-1.5 uppercase font-serif">
                {isInIframe ? "🎥 Kamera Dibatasi oleh Iframe" : "🎥 Izin Kamera Diperlukan"}
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {isInIframe 
                  ? "Kebijakan keamanan browser melarang akses kamera secara langsung dari dalam bingkai (iframe) AI Studio." 
                  : "Aplikasi membutuhkan izin kamera Anda untuk memproyeksikan produk seni warisan budaya langsung ke dimensi ruangan Anda."}
              </p>
              
              {isInIframe ? (
                <div className="text-left bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/10 text-[10px] space-y-1">
                  <span className="font-bold text-teal-400">Langkah Pengaktifan:</span>
                  <ol className="list-decimal list-inside text-slate-300 space-y-0.5">
                    <li>Ketuk tombol <strong className="text-white">"Open in new tab"</strong> di sudut kanan atas layar pratinjau.</li>
                    <li>Sembulan izin kamera akan muncul di tab baru tersebut.</li>
                  </ol>
                </div>
              ) : (
                <div className="text-left bg-teal-950/40 p-2.5 rounded-xl border border-teal-500/10 text-[10px] space-y-1">
                  <span className="font-bold text-teal-400">Langkah Pengaktifan:</span>
                  <ol className="list-decimal list-inside text-slate-300 space-y-0.5">
                    <li>Segarkan halaman ini atau ketuk kembali ikon kamera.</li>
                    <li>Saat browser menanyakan akses kamera, pilih <strong className="text-white">Izinkan (Allow)</strong>.</li>
                  </ol>
                </div>
              )}

              {cameraError && (
                <div className="text-[9px] text-rose-300 bg-rose-950/30 p-2 rounded-lg font-mono text-left break-all opacity-80">
                  Sebab detail: {cameraError}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modern Interactive Grid Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', 
               backgroundSize: '36px 36px',
               transform: 'perspective(600px) rotateX(60deg) translateY(50px) scale(1.6)',
               transformOrigin: 'bottom center'
             }} 
        />

        {/* 3D Model Simulated Interactive Module */}
        {!isScanning && product && (
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute z-10 w-80 h-80 touch-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center select-none"
            style={{
              left: `calc(50% + ${posX}px)`,
              top: `calc(50% + ${posY}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Holographic Anchor Ground Target */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 pointer-events-none flex flex-col items-center">
              <div className="w-32 h-10 border-2 border-dashed border-teal-400/40 rounded-full scale-y-40 animate-pulse flex items-center justify-center">
                <div className="w-16 h-5 bg-teal-400/10 rounded-full" />
              </div>
              <div className="w-0.5 h-16 bg-gradient-to-t from-teal-400/65 to-transparent border-l border-dashed border-teal-400/40 -mt-5" />
            </div>

            <div 
              className="relative group transition-transform duration-100"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
              }}
            >
              {/* Product Frame Shadow */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/45 blur-lg rounded-full scale-y-50" />
              
              {/* Product Render Image */}
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full max-h-60 object-contain drop-shadow-[0_25px_20px_rgba(0,0,0,0.55)] select-none pointer-events-none"
                draggable={false}
                referrerPolicy="no-referrer"
              />
              
              {/* Interactive Target Outlines */}
              <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-teal-400 rounded-tl opacity-75 group-hover:scale-105 transition-transform" />
              <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-teal-400 rounded-tr opacity-75 group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-teal-400 rounded-bl opacity-75 group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-teal-400 rounded-br opacity-75 group-hover:scale-105 transition-transform" />
            </div>
          </div>
        )}

        {/* Plane Search Pulse Indicator */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]"
            >
              <div className="relative w-64 h-64 flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.35, 0.7, 0.35]
                  }}
                  transition={{ repeat: Infinity, duration: 2.0 }}
                  className="absolute inset-0 border-2 border-teal-400/60 rounded-3xl"
                />
                <motion.div 
                  animate={{ top: ['4%', '96%', '4%'] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                  className="absolute left-4 right-4 h-0.5 bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.95)]"
                />
                <div className="bg-black/75 backdrop-blur-md px-6 py-3 rounded-full border border-teal-500/20 shadow-xl text-center">
                  <p className="text-teal-300 text-xs font-bold tracking-widest uppercase animate-pulse">
                    Mencari Bidang Datar...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AR HUD Display Controls overlay */}
      <div className="relative z-50 flex flex-col h-full pointer-events-none">
        
        {/* HUD Header Strip */}
        <div className="px-6 py-5 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
          <button 
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-colors pointer-events-auto cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <div className="bg-black/55 backdrop-blur-md px-4 py-2 rounded-full border border-teal-500/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping" />
              <span className="text-white text-[10px] sm:text-xs font-bold tracking-wider uppercase">Live Camera AR</span>
            </div>
            
            {gyroEnabled ? (
              <span className="text-[9px] font-bold text-teal-400 bg-teal-950/70 border border-teal-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                ⚓ Sensor Jangkar Gyroscope Aktif
              </span>
            ) : gyroPermission === 'prompt' ? (
              <button 
                onClick={requestPermission}
                className="text-[9px] font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 cursor-pointer pointer-events-auto"
              >
                🔐 Klik Aktifkan Sensor Jangkar Ruang
              </button>
            ) : (
              <span className="text-[9px] font-bold text-slate-400 bg-slate-900/70 border border-slate-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                Mode Peletakan Manual (Touch & Drag)
              </span>
            )}
          </div>
          
          <button className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/10 cursor-pointer pointer-events-auto">
            <Share2 size={18} />
          </button>
        </div>

        {/* HUD Footer details and fine orientation calibration drawers */}
        <div className="mt-auto pb-6 px-6 pointer-events-auto max-w-md mx-auto w-full bg-gradient-to-t from-black/50 via-black/25 to-transparent">
          
          {/* Virtual Target Furniture Info Cover */}
          {!isScanning && product && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-[24px] p-3 mb-4 flex items-center gap-3.5 shadow-2xl border border-white/80"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800 leading-tight">{product.name}</h4>
                <p className="text-[11px] text-teal-600 font-bold mt-0.5">{product.price}</p>
              </div>
              <div className="bg-teal-50 px-2 py-1 rounded-lg text-[9px] text-teal-800 font-bold flex flex-col items-center">
                <span>{product.culture}</span>
                <span>Heritage</span>
              </div>
            </motion.div>
          )}

          {/* Luxury calibration control bay */}
          <div className="bg-black/65 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex flex-col gap-3">
            
            {/* Drag translation parameters */}
            {!isScanning && (
              <div className="space-y-2.5 pb-2 border-b border-white/5 text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-white text-[10px] font-bold w-12 opacity-85">Putar</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={rotation} 
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1 accent-teal-400 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-teal-300 text-[10px] font-mono w-8 text-right">{rotation}°</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white text-[10px] font-bold w-12 opacity-85">Ukuran</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1.8" 
                    step="0.05"
                    value={scale} 
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="flex-1 accent-teal-400 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-teal-300 text-[10px] font-mono w-8 text-right">{Math.round(scale * 100)}%</span>
                </div>
              </div>
            )}

            {/* Calibration trigger row */}
            <div className="flex items-center justify-between gap-3">
              <button 
                onClick={() => { setBasePosition({ x: 0, y: 40 }); setRotation(0); setScale(1.0); if (gyroEnabled) calibrateAnchor(); }}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 transition-colors flex items-center justify-center text-white border border-white/10 cursor-pointer"
                title="Atur Ulang Peletakan"
              >
                <RotateCcw size={18} />
              </button>
              
              <button 
                onClick={calibrateAnchor}
                className="flex-1 bg-teal-600 hover:bg-teal-500 active:scale-95 transition-all text-white py-3.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Scan size={16} />
                <span>Tekan untuk Kalibrasi / Gantung</span>
              </button>

              <button 
                onClick={() => setShowStory(true)}
                className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 text-teal-950 flex flex-col items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <BookOpen size={16} />
                <span className="text-[7px] font-extrabold mt-0.5">Filosofi</span>
              </button>
            </div>

            {/* Instruction tip */}
            <div className="text-[10px] text-center text-slate-400 italic">
              💡 {gyroEnabled ? "Gesper hp Anda: Obyek menempel di ruangan dan memantulkan pergerakan Anda!" : "Sentuh & geser untuk memindahkan obyek di layar."}
            </div>

          </div>
          
        </div>
      </div>

      {/* Philosophy stories dialogue */}
      <AnimatePresence>
        {showStory && product && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="relative h-48 sm:h-52">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <button 
                  onClick={() => setShowStory(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                >
                  <ChevronLeft className="rotate-90" size={18} />
                </button>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Filosofi & Nilai Seni</span>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{product.name}</h3>
                <p className="text-slate-600 leading-relaxed font-serif italic text-sm">
                  "{product.philosophy}"
                </p>
                <button 
                  onClick={() => setShowStory(false)}
                  className="mt-6 w-full bg-teal-950 hover:bg-teal-900 transition-colors text-white py-3 rounded-full font-bold text-xs"
                >
                  Tutup Filosofi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  cartCount,
  favoritesCount,
  unreadCount,
  googleUser,
  userRole
}: { 
  searchQuery: string; 
  setSearchQuery: (q: string) => void; 
  onProfileClick: () => void;
  onNotificationClick: () => void;
  onFavoritesClick: () => void;
  onCartClick: () => void;
  onHomeClick: () => void;
  cartCount: number;
  favoritesCount: number;
  unreadCount: number;
  googleUser: { name: string; email: string; avatar: string; } | null;
  userRole: 'user' | 'admin' | 'curator';
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-white sticky top-0 z-40 py-4 px-6 border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Profile section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo 
              onClick={onHomeClick}
              className="w-10 h-10 cursor-pointer active:scale-95 hover:brightness-105"
            />
            <div onClick={onHomeClick} className="cursor-pointer">
              <h1 className="text-xl font-bold tracking-tight text-teal-900 font-serif hover:text-teal-700 transition-colors">Balla AR</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">South Sulawesi Heritage Interiors</p>
            </div>
          </div>
          
          {/* Mobile Profile Logo Trigger - In the notification / top-right area */}
          <div className="relative md:hidden flex items-center" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-10 h-10 rounded-full ${googleUser ? 'bg-gradient-to-tr from-teal-500 to-amber-500 p-0.5 shadow-md hover:brightness-105' : 'bg-slate-100 hover:bg-slate-205 border border-slate-200/80 flex items-center justify-center text-slate-450'} active:scale-95 transition-all cursor-pointer relative`}
            >
              {googleUser ? (
                <img 
                  src={googleUser.avatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover border border-white/25"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={18} />
              )}
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 border-2 border-white text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {totalBadges}
                </span>
              )}
            </button>

            {/* Mobile Dropdown content */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-64 bg-white border border-slate-150 shadow-2xl rounded-2xl p-3 z-50 flex flex-col gap-1.5"
                >
                  {googleUser ? (
                    <div className="px-2.5 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{googleUser.name}</p>
                      <p className="text-[9.5px] text-slate-450 truncate">{googleUser.email}</p>
                    </div>
                  ) : (
                    <div className="px-2.5 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-800">Menunggu Masuk</p>
                      <p className="text-[9.5px] text-slate-400 font-medium">Balla AR Guest Mode</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => { onFavoritesClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 relative flex-shrink-0">
                      <Heart size={16} />
                      {favoritesCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                          {favoritesCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Favorit Saya</h4>
                      <p className="text-[9px] text-slate-450 leading-none">Pusaka tersimpan</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onCartClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 relative flex-shrink-0">
                      <ShoppingBag size={16} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Keranjang Belanja</h4>
                      <p className="text-[9px] text-slate-450 leading-none">Total {cartCount} item</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNotificationClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 relative flex-shrink-0">
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Pusat Informasi</h4>
                      <p className="text-[9px] text-slate-450 leading-none">Info AR & Promo</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onProfileClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors border-t border-slate-50 pt-3 mt-1 cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Edit Profil</h4>
                      <p className="text-[9px] text-slate-450 leading-none">Nama Lengkap & Kontak</p>
                    </div>
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Unified Search & Desktop notification */}
        <div className="flex items-center gap-4 flex-1 max-w-lg md:ml-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perabot adat Toraja, Bugis..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-10 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold font-mono transition-colors cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Desktop Profile Logo Trigger - Replacing/Integrating Bell and Profile */}
          <div className="hidden md:flex relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-10 h-10 rounded-full ${googleUser ? 'bg-gradient-to-tr from-teal-500 to-amber-500 p-0.5 shadow-md hover:brightness-105' : 'bg-slate-100 hover:bg-slate-205 border border-slate-200/80 flex items-center justify-center text-slate-455'} active:scale-95 transition-all cursor-pointer relative`}
            >
              {googleUser ? (
                <img 
                  src={googleUser.avatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover border border-white/25"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={18} />
              )}
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 border-2 border-white text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {totalBadges}
                </span>
              )}
            </button>

            {/* Desktop Dropdown content */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-3 z-50 flex flex-col gap-1.5"
                >
                  <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                    {googleUser ? (
                      <>
                        <p className="text-xs font-bold text-slate-800 truncate">{googleUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{googleUser.email}</p>
                        <span className="mt-1.5 inline-flex items-center gap-1 bg-teal-500/10 text-teal-700 border border-teal-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {userRole === 'admin' 
                            ? 'Mitra Penjual' 
                            : userRole === 'curator' 
                            ? 'Kurator Adat' 
                            : 'Kolektor Pusaka Adat'}
                        </span>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-800">Tamu Nusantara</p>
                        <p className="text-[10px] text-slate-400">Belum tersambung Google</p>
                        <span className="mt-1.5 inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-205 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Mode Tamu / Offline
                        </span>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { onFavoritesClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 relative flex-shrink-0">
                      <Heart size={16} />
                      {favoritesCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                          {favoritesCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Favorit Saya</h4>
                      <p className="text-[9.5px] text-slate-400 leading-none">Daftar perabot tersimpan ({favoritesCount})</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onCartClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 relative flex-shrink-0">
                      <ShoppingBag size={16} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-805">Keranjang Belanja</h4>
                      <p className="text-[9.5px] text-slate-400 leading-none">Daftar perabot di keranjang ({cartCount})</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onNotificationClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 relative flex-shrink-0">
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold font-mono w-4 h-4 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Pusat Informasi</h4>
                      <p className="text-[9.5px] text-slate-400 leading-none">Berita, instruksi AR & diskon</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => { onProfileClick(); setIsDropdownOpen(false); }}
                    className="flex items-center gap-3 p-2 rounded-xl text-slate-700 hover:bg-slate-50 text-left transition-colors border-t border-slate-100 pt-3 mt-1 cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{googleUser ? 'Edit Profil & Kupon' : 'Hubungkan Akun Google'}</h4>
                      <p className="text-[9.5px] text-slate-400 leading-none">
                        {googleUser ? 'Atur kontak, bahasa & suara narasi' : 'Hubungkan akun dengan cepat di sini'}
                      </p>
                    </div>
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Hero Banner ---
const HeroBanner = ({ onLearnMore }: { onLearnMore: () => void }) => (
  <div className="mb-8">
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-48 sm:h-60 md:h-72 lg:h-80 rounded-3xl overflow-hidden shadow-md group animate-fade-in"
    >
      <img 
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop" 
        alt="Toraja Carved Heritage Showcase" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-teal-950/45 to-transparent flex flex-col justify-center p-6 sm:p-10">
        <span className="text-teal-200 text-[9px] sm:text-xs uppercase tracking-[0.25em] font-bold mb-2">
          Edisi Warisan Bangsa
        </span>
        <h2 className="text-white text-xl sm:text-3xl font-serif font-bold leading-tight max-w-xs sm:max-w-md">
          Ukir Nusantara di Ruang Modern <span className="italic font-normal">Seni Falsafah Hidup</span>
        </h2>
        <motion.button 
          onClick={onLearnMore}
          whileTap={{ scale: 0.95 }}
          className="mt-5 bg-white text-teal-950 hover:bg-slate-50 px-5 py-2.5 rounded-full text-xs font-bold w-fit shadow-md transition-colors cursor-pointer"
        >
          Pelajari Warisan Ukir
        </motion.button>
      </div>
    </motion.div>
  </div>
);

// --- Culture Categories ---
const CultureCategories = ({ onSelectCategory }: { onSelectCategory: (id: string) => void }) => {
  const [active, setActive] = useState('toraja');

  const handleSelect = (id: string) => {
    setActive(id);
    onSelectCategory(id);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-serif">Pilih Adat Kebudayaan</h3>
          <p className="text-[11px] text-slate-400">Jelajahi nilai filosofis unik setiap suku</p>
        </div>
        <button 
          onClick={() => handleSelect('all')}
          className="text-teal-600 text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          Semua <ChevronRight size={14} />
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        {CULTURES.map((culture) => (
          <motion.button
            key={culture.id}
            onClick={() => handleSelect(culture.id)}
            whileTap={{ scale: 0.96 }}
            className="flex flex-col items-center gap-2 min-w-[76px] transition-all cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${active === culture.id ? `${culture.pattern} text-white shadow-lg` : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
              {culture.icon}
            </div>
            <span className={`text-xs font-bold ${active === culture.id ? 'text-teal-950' : 'text-slate-400'}`}>
              {culture.name}
            </span>
          </motion.button>
        ))}
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
  userRole: 'user' | 'admin' | 'curator';
  adminCulture: string;
  onDelete: () => void;
  key?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {product.status && product.status !== 'approved' && (
            <div className="absolute top-2 left-2 animate-fade-in z-10">
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase shadow-md ${
                product.status === 'pending' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {product.status === 'pending' ? '🕒 Kurasi' : '❌ Ditolak'}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1 animate-fade-in">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-500 shadow-xs cursor-pointer hover:text-rose-500 transition-colors"
            >
              <Heart size={13} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2">
            <button 
              onClick={onARClick}
              className="bg-teal-600/90 hover:bg-teal-600 backdrop-blur-xs text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <Maximize2 size={10} />
              <span className="text-[9px] font-bold tracking-wider">AR</span>
            </button>
          </div>
        </div>
        
        <div className="px-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">{product.culture}</span>
            <div className="flex items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-[9px] font-bold text-slate-500">{product.rating}</span>
            </div>
          </div>
          <h4 className="text-xs font-bold text-slate-800 leading-tight mb-2 group-hover:text-teal-800 transition-colors line-clamp-1">{product.name}</h4>
        </div>
      </div>

      <div className="px-1 mt-auto">
        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
          <span className="text-xs font-bold text-teal-900 font-mono">{product.price}</span>
          
          {userRole === 'admin' ? (
            product.culture.toLowerCase() === adminCulture.toLowerCase() ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[9px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                title="Hapus Produk dari Toko Anda"
              >
                <Trash2 size={10} />
                <span>Hapus</span>
              </button>
            ) : (
              <span 
                className="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-150 text-slate-400 text-[8.5px] font-semibold flex items-center gap-0.5 select-none"
                title="Produk ini milik sanggar adat lain"
              >
                <span>🔒</span> Toko Lain
              </span>
            )
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              className="w-7 h-7 rounded-full bg-teal-900 hover:bg-teal-950 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90 transition-transform shrink-0"
              title="Tambah ke Keranjang"
            >
              <ShoppingBag size={12} />
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

// --- MAIN APPLICATION ENTRY ---
export default function App() {
  const [view, setView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // --- Dynamic local states ---
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ballaar_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const [userRole, setUserRole] = useState<'user' | 'admin' | 'curator'>(() => {
    try {
      const saved = localStorage.getItem('ballaar_user_role');
      return (saved as 'user' | 'admin' | 'curator') || 'user';
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

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
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

  const handleAddProduct = (productData: {
    name: string;
    price: string;
    image: string;
    culture: string;
    description: string;
    philosophy: string;
  }) => {
    const newId = String(Date.now());
    const newProduct: Product = {
      id: newId,
      ...productData,
      rating: 5.0,
      status: 'pending'
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk pusaka adat ini dari toko Anda?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFavorites(prev => prev.filter(id => id !== productId));
      setCart(prev => prev.filter(item => item.product.id !== productId));
      if (selectedProduct?.id === productId) {
        setView('home');
        setSelectedProduct(null);
      }
    }
  };

  const handleCurateProduct = (productId: string, action: 'approve' | 'reject') => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          status: action === 'approve' ? 'approved' : 'rejected'
        };
      }
      return p;
    }));

    const targetProduct = products.find(p => p.id === productId);
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
  } | null>(() => {
    try {
      const saved = localStorage.getItem('ballaar_google_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.avatar === 'string' && (parsed.avatar.includes('unsplash.com') || parsed.avatar.includes('photo-'))) {
          if (parsed.email === 'wirabuanamohalfinoor@gmail.com') {
            parsed.avatar = 'https://ui-avatars.com/api/?name=Wirabuana+Mohalfinoor&background=0d9488&color=fff&bold=true&size=150';
          } else {
            parsed.avatar = 'https://ui-avatars.com/api/?name=Tamu+Nusantara&background=4f46e5&color=fff&bold=true&size=150';
          }
          localStorage.setItem('ballaar_google_user', JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (googleUser) {
      localStorage.setItem('ballaar_google_user', JSON.stringify(googleUser));
    } else {
      localStorage.removeItem('ballaar_google_user');
    }
  }, [googleUser]);

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

  const handleARClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
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
    const isMyProductUnderEvaluation = userRole === 'admin' && p.culture.toLowerCase() === adminCulture.toLowerCase() && (p.status === 'pending' || p.status === 'rejected');
    
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
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased relative">
      <AnimatePresence mode="wait">
        
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col min-h-screen"
          >
            {/* Dynamic Background Circle Accents */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <div className="absolute bottom-10 left-0 w-96 h-96 bg-amber-50 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
            </div>



            <Header 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onProfileClick={() => setIsProfileOpen(true)}
              onNotificationClick={() => setIsNotificationsOpen(true)}
              onFavoritesClick={() => setIsFavoritesOpen(true)}
              onCartClick={() => setIsCartOpen(true)}
              onHomeClick={() => { setView('home'); setCategoryFilter('all'); setSearchQuery(''); }}
              cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
              favoritesCount={favorites.length}
              unreadCount={unreadCount}
              googleUser={googleUser}
              userRole={userRole}
            />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 pb-12">
              <HeroBanner onLearnMore={() => setIsHeritageModalOpen(true)} />

              {/* Admin Dashboard Control Card */}
              {userRole === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-teal-950 via-slate-905 to-teal-980 text-white rounded-3xl p-6 shadow-xl border border-teal-900/30 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.5 bg-amber-500/15 border border-amber-500/25 text-amber-300 font-extrabold rounded-full text-[9px] uppercase tracking-wider font-sans">
                        🛠️ Dasbor Pengrajin Aktif
                      </div>
                      <span className="text-[10px] text-teal-355/60 font-semibold font-mono">ID: {adminCulture.toUpperCase()}-ADMIN</span>
                    </div>
                    <h2 className="text-xl font-serif font-bold tracking-tight">
                      Selamat Datang di Panel {getStoreName(adminCulture)}
                    </h2>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Kelola karya seni kerajinan berkualitas premium Anda. Sebagai admin dari toko ini, Anda dapat menambahkan produk pusaka baru, serta memilah/menghapus produk asli yang terdaftar di bawah nama toko Anda.
                    </p>
                    
                    {/* Quick Stats Row */}
                    <div className="flex gap-6 mt-4 pt-4 border-t border-slate-800">
                      <div>
                        <p className="text-[9.5px] text-slate-450 uppercase tracking-widest leading-none font-bold">Koleksi Terdaftar</p>
                        <p className="text-base font-extrabold font-mono text-amber-300 mt-1">
                          {products.filter(p => p.culture.toLowerCase() === adminCulture.toLowerCase()).length} <span className="text-xs font-sans text-slate-400 font-normal">Karya Adat</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] text-slate-450 uppercase tracking-widest leading-none font-bold">Status Layanan</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-400">Sanggar Terbuka (Live)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-6 py-3.5 rounded-full text-xs flex items-center gap-2 shadow-lg shadow-teal-900/10 cursor-pointer self-stretch md:self-auto justify-center transition-all shrink-0"
                  >
                    <Plus size={15} className="stroke-[3]" />
                    <span>Tambah Produk Baru</span>
                  </button>
                </motion.div>
              )}

              {/* Curator Dashboard Panel */}
              {userRole === 'curator' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 mb-8 space-y-6 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/5 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1 px-2.5 bg-indigo-500/15 border border-indigo-500/25 text-amber-300 font-extrabold rounded-full text-[9px] uppercase tracking-wider font-sans">
                          🛡️ Panel Kurator Adat Balla AR
                        </div>
                        <span className="text-[10px] text-zinc-400 font-semibold font-mono flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-teal-400" /> KOMITE EVALUASI ADAT
                        </span>
                      </div>
                      <h2 className="text-xl font-serif font-bold tracking-tight">
                        Persetujuan & Otentisitas Karya Adat Serumpun
                      </h2>
                      <p className="text-xs text-slate-405 max-w-3xl leading-relaxed">
                        Tinjau kiriman produk pusaka budaya terbaru dari sanggar kerajinan adat Sulawesi Selatan. Pastikan keaslian nilai fisik, ornamen tradisi, serta korelasi filosofi sebelum disetujui tampil di galeri publik.
                      </p>
                    </div>

                    {/* Curator Toggles */}
                    <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-1 shrink-0 self-stretch md:self-auto">
                      <button
                        onClick={() => setCuratorTab('pending')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-[10.5px] ${curatorTab === 'pending' ? 'bg-teal-700 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        🕒 Menunggu ({products.filter(p => p.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setCuratorTab('history')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-[10.5px] ${curatorTab === 'history' ? 'bg-teal-700 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        ⭐ Riwayat ({products.filter(p => p.status === 'approved' || p.status === 'rejected').length})
                      </button>
                    </div>
                  </div>

                  {/* Curator Table/List */}
                  <div>
                    {curatorTab === 'pending' ? (
                      <div>
                        {products.filter(p => p.status === 'pending').length === 0 ? (
                          <div className="py-10 text-center bg-slate-850/30 rounded-2xl border border-slate-800/60 p-4">
                            <span className="text-2xl">🎉</span>
                            <h4 className="text-xs font-bold text-slate-350 mt-2 font-serif">Semua Kiriman Karya Bersih & Terkurasi</h4>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
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
                                className="bg-slate-850/80 p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
                              >
                                <div className="flex gap-4 items-start flex-1 min-w-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/25 uppercase tracking-wider font-mono">
                                        Suku {p.culture}
                                      </span>
                                      <span className="text-[11px] font-mono text-teal-450 font-extrabold">{p.price}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-100 font-serif leading-tight">{p.name}</h4>
                                    <p className="text-[11.5px] text-slate-300 leading-normal line-clamp-2">{p.description}</p>
                                    <div className="bg-slate-900/60 p-2.5 rounded-xl text-[10.5px] border border-slate-800 text-amber-100/90 leading-relaxed mt-1 flex items-start gap-1.5">
                                      <span className="font-bold shrink-0 text-amber-400">📜 Filosofi Adat:</span>
                                      <span className="italic font-sans">{p.philosophy || "Belum dicantumkan kesaksian sejarah kerajinan."}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Decision Actions Container */}
                                <div className="flex sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
                                  <button
                                    onClick={() => handleCurateProduct(p.id, 'reject')}
                                    className="flex-1 sm:flex-none uppercase tracking-widest text-[10px] font-bold border border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                                  >
                                    ✕ Tolak
                                  </button>
                                  <button
                                    onClick={() => handleCurateProduct(p.id, 'approve')}
                                    className="flex-1 sm:flex-none uppercase tracking-widest text-[10px] font-extrabold text-slate-950 bg-teal-400 hover:bg-teal-350 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-900/20 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1"
                                  >
                                    ✔ Setujui Produk
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
                          <div className="py-10 text-center bg-slate-850/30 rounded-2xl border border-slate-800/60 p-4">
                            <p className="text-xs text-slate-500">Belum ada karya seni yang dinilai sejauh ini.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {products.filter(p => p.status === 'approved' || p.status === 'rejected').map(p => (
                              <div
                                key={p.id}
                                className="bg-slate-850/40 p-3 rounded-2xl border border-slate-805 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <h5 className="text-[11.5px] font-bold text-slate-200 truncate leading-tight font-serif">{p.name}</h5>
                                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Suku {p.culture}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                                    p.status === 'approved' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {p.status === 'approved' ? '✔ Disetujui' : '✕ Ditolak'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: 'pending' } : item));
                                    }}
                                    className="px-2 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-405 hover:text-white transition-colors cursor-pointer text-[9.5px] font-bold font-mono"
                                    title="Evaluasi Ulang"
                                  >
                                    🔄 Review
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

              <CultureCategories onSelectCategory={setCategoryFilter} />
              
              {/* Product Grid Area */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-serif">
                      Koleksi Pilihan {categoryFilter !== 'all' ? `Adat ${categoryFilter.toUpperCase()}` : ''}
                    </h3>
                    <p className="text-[11px] text-slate-400">Warisan peradaban dengan kualitas konstruksi modern premium</p>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{filteredProducts.length} Produk</span>
                </div>
                
                {/* Fully Fluid Responsive Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-3xl border border-slate-100 p-6">
                    <p className="text-slate-400 text-sm font-semibold">Tidak ada produk warisan yang cocok dengan "{searchQuery}"</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                      className="mt-3 bg-teal-600 font-bold px-4 py-2 rounded-full text-white text-xs hover:bg-teal-700 transition-colors"
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
              setPreviousView('details');
              setView('ar');
            }}
            isFavorite={favorites.includes(selectedProduct.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedProduct.id)}
            onAddToCart={() => handleAddToCart(selectedProduct)}
          />
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
          />
        )}

        {isHeritageModalOpen && (
          <HeritageModal 
            isOpen={isHeritageModalOpen}
            onClose={() => setIsHeritageModalOpen(false)}
          />
        )}

        {/* Notifications Modal/Drawer Overlay */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[200] overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-sm bg-white shadow-2xl flex flex-col h-full"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-950 text-white">
                  <div className="flex items-center gap-2">
                    <Bell size={20} className="text-teal-400" />
                    <div>
                      <h2 className="text-sm font-bold font-serif text-white">Pusat Informasi</h2>
                      <p className="text-[10px] text-teal-300">Pembaruan & Diskon</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-white pointer-events-auto cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Filter Tabs for Notifications Center */}
                <div className="flex gap-2 p-3 bg-slate-100/50 border-b border-slate-100 shrink-0">
                  <button 
                    onClick={() => setShowOnlyUnread(true)}
                    className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      showOnlyUnread 
                        ? 'bg-teal-900 text-white shadow-sm' 
                        : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-100'
                    }`}
                  >
                    Belum Dibaca ({unreadCount})
                  </button>
                  <button 
                    onClick={() => setShowOnlyUnread(false)}
                    className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      !showOnlyUnread 
                        ? 'bg-teal-900 text-white shadow-sm' 
                        : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-100'
                    }`}
                  >
                    Semua ({notifications.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-slate-50">
                  {showOnlyUnread && unreadCount > 0 && (
                    <p className="text-[9px] text-slate-400 italic text-center pb-1">
                      Menampilkan info baru. Klik "Tandai Sudah Dibaca" untuk mengarsipkannya.
                    </p>
                  )}
                  
                  {((showOnlyUnread ? notifications.filter(n => n.unread) : notifications).length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3.5">
                      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Semua Informasi Selesai Dibaca</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed max-w-[200px] mx-auto">
                          Tidak ada notifikasi baru. Tekan opsi "Semua" untuk melihat kembali riwayat informasi.
                        </p>
                      </div>
                    </div>
                  ) : (
                    (showOnlyUnread ? notifications.filter(n => n.unread) : notifications).map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden bg-white ${
                          notif.unread 
                            ? 'border-slate-100 shadow-sm hover:border-slate-150' 
                            : 'border-transparent opacity-60'
                        }`}
                      >
                        {notif.unread && (
                          <span className={`absolute top-0 left-0 bottom-0 w-1 ${
                            notif.tagColor === 'teal' ? 'bg-teal-600' : notif.tagColor === 'amber' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                        )}
                        
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-widest block ${
                            notif.unread 
                              ? notif.tagColor === 'teal' ? 'text-teal-600' : notif.tagColor === 'amber' ? 'text-amber-600' : 'text-slate-500'
                              : 'text-slate-400'
                          }`}>
                            {notif.tag}
                          </span>
                          {notif.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                          )}
                        </div>
                        
                        <h4 className={`text-xs font-bold mt-1 ${notif.unread ? 'text-slate-800' : 'text-slate-500'}`}>
                          {notif.title}
                        </h4>
                        <p className={`text-[11px] leading-relaxed mt-1 ${notif.unread ? 'text-slate-500' : 'text-slate-450'}`}>
                          {notif.desc}
                        </p>

                        <div className="mt-3 flex gap-2">
                          {notif.unread ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                              }}
                              className="text-[10px] font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-teal-100 flex items-center gap-1.5 active:scale-95"
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
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-100 flex items-center gap-1.5 active:scale-95"
                            >
                              <span>Belum Dibaca</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    disabled={unreadCount === 0}
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                    }}
                    className="w-full py-2.5 bg-teal-950 hover:bg-teal-900 text-white disabled:bg-slate-200 disabled:text-slate-400 font-bold transition-all text-xs rounded-full pointer-events-auto cursor-pointer"
                  >
                    Tandai Semua Sudah Dibaca
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {isAddProductModalOpen && (
          <AddProductModal
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            adminCulture={adminCulture}
            onAddProduct={handleAddProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
