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
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-2.5 h-2.5 bg-current opacity-85" />
          <div className="w-2.5 h-2.5 bg-current opacity-40" />
          <div className="w-2.5 h-2.5 bg-current opacity-40" />
          <div className="w-2.5 h-2.5 bg-current opacity-85" />
        </div>
      </div>
    ),
    pattern: 'bg-teal-700'
  },
  { 
    id: 'bugis', 
    name: 'Bugis', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-current rounded-full border-t-transparent animate-spin-slow" />
      </div>
    ),
    pattern: 'bg-amber-600'
  },
  { 
    id: 'makassar', 
    name: 'Makassar', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-current" />
      </div>
    ),
    pattern: 'bg-red-700'
  },
  { 
    id: 'mandar', 
    name: 'Mandar', 
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="w-6 h-4 border-2 border-current flex flex-col justify-between">
          <div className="w-full h-0.5 bg-current" />
          <div className="w-full h-0.5 bg-current" />
        </div>
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
    image: "https://picsum.photos/seed/chair1/600/600",
    culture: "Toraja",
    rating: 4.8,
    description: "Kursi tamu premium yang dibuat dari kayu jati pilihan, didesain dengan ukiran khas Toraja yang dipahat manual oleh pengrajin lokal berpengalaman.",
    philosophy: "Motif Pa'reppo pada kursi ini melambangkan keteguhan hati, kemantapan berfikir, dan kemapanan dalam jenjang kehidupan masyarakat adat Toraja."
  },
  {
    id: '2',
    name: "Lemari Ukir Sulur Bugis",
    price: "Rp 7.200.000",
    image: "https://picsum.photos/seed/cabinet2/600/600",
    culture: "Bugis",
    rating: 4.9,
    description: "Lemari pakaian mahakarya seni ukir Bugis dengan garis sulur organik yang elegan, sangat luas dan memperindah interior kamar tidur mewah Anda.",
    philosophy: "Motif 'sulur' pada lemari ini merepresentasikan pertumbuhan berkelanjutan, kemakmuran, dan keterhubungan segala lini kehidupan dalam falsafah adat suku Bugis."
  },
  {
    id: '3',
    name: "Meja Makan Passura'",
    price: "Rp 8.500.000",
    image: "https://picsum.photos/seed/table1/400/400",
    culture: "Toraja",
    rating: 4.7,
    description: "Meja makan kayu jati solid yang dihiasi ukiran geometris Toraja penuh detail presisi, cocok untuk perjamuan keluarga yang hangat.",
    philosophy: "Passura' melambangkan kearifan lokal Toraja yang dituangkan dalam ukiran geometris presisi, mengajarkan ketelitian serta keteraturan hukum semesta."
  },
  {
    id: '4',
    name: "Lemari Ukir Phinisi",
    price: "Rp 12.000.000",
    image: "https://picsum.photos/seed/cabinet1/400/400",
    culture: "Makassar",
    rating: 4.7,
    description: "Lemari pajangan luxury dengan ukiran relief epik penjelajahan kapal legendaris Phinisi Bugis-Makassar yang mengarungi samudera luas.",
    philosophy: "Ukiran kapal Phinisi yang legendaris melambangkan keteguhan berjuang, tekad pantang menyerah, keberanian, dan jiwa pelaut sejati masyarakat Makassar."
  },
  {
    id: '5',
    name: "Sofa Minimalis Saqbe",
    price: "Rp 5.800.000",
    image: "https://picsum.photos/seed/sofa1/400/400",
    culture: "Mandar",
    rating: 4.6,
    description: "Sofa santai dengan bantalan empuk berlapis tenun motif sutra Saqbe Mandar asli, memadukan modernitas furnitur dengan sentuhan kerajinan wastra nusantara.",
    philosophy: "Terinspirasi dari tenun Saqbe Mandar, melambangkan kerapian tatanan kebersamaan, kehangatan rasa, dan kelembutan tradisi leluhur dalam harmoni kontemporer."
  },
  {
    id: '6',
    name: "Buffet Ukir Kaligrafi",
    price: "Rp 6.400.000",
    image: "https://picsum.photos/seed/buffet1/400/400",
    culture: "Bugis",
    rating: 4.5,
    description: "Meja buffet serbaguna yang anggun, mengkolaborasikan aksen kaligrafi bermakna spiritual dengan ornamen geometris lokal tanah Bugis.",
    philosophy: "Perpaduan seni kaligrafi dengan motif sakral tradisional Bugis yang melambangkan berkah spiritualitas, ketenangan batin, serta perlindungan Ilahi."
  }
];

// --- ProductDetailView ---
const ProductDetailView = ({ product, onBack, onAR }: { product: Product; onBack: () => void; onAR: () => void; key?: string }) => (
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
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/40 transition-colors cursor-pointer">
            <Heart size={20} className="hover:fill-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Right Pane: Detailed Content */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-[600px] no-scrollbar pb-32 md:pb-10">
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 cursor-pointer transition-colors"
          >
            <ShoppingBag size={18} />
            <span>Beli Sekarang di Tokopedia</span>
            <ExternalLink size={14} />
          </motion.button>
          
          <button 
            onClick={onAR}
            className="w-full bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
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
        whileTap={{ scale: 0.98 }}
        className="w-full bg-[#25D366] text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-md shadow-green-500/10 cursor-pointer"
      >
        <ShoppingBag size={18} />
        <span>Beli Sekarang di Tokopedia</span>
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
  
  // Real-time target offsets in refs to bypass high frequency state sets
  const targetGyroXRef = useRef<number>(0);
  const targetGyroYRef = useRef<number>(0);

  // Smooth visual state to prevent jittering/shaking
  const [smoothGyro, setSmoothGyro] = useState<{ x: number; y: number; tiltX: number; tiltY: number }>({
    x: 0,
    y: 0,
    tiltX: 0,
    tiltY: 0
  });

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

  // 4. Orientation listener logic (populates target offsets in refs to bypass high-frequency react state re-renders)
  useEffect(() => {
    if (!gyroEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null) return;

      if (!initialOrientationRef.current) {
        // Log original anchor point
        initialOrientationRef.current = { alpha: e.alpha, beta: e.beta, gamma: e.gamma || 0 };
      }

      let dAlpha = e.alpha - initialOrientationRef.current.alpha;
      if (dAlpha > 180) dAlpha -= 360;
      if (dAlpha < -180) dAlpha += 360;

      let dBeta = e.beta - initialOrientationRef.current.beta;
      if (dBeta > 180) dBeta -= 360;
      if (dBeta < -180) dBeta += 360;

      // Pixel per degree coefficients
      const sensitivityX = 18;
      const sensitivityY = 22;

      // Save instantly into refs. This prevents 60+ Hz state re-render drops and avoids micro-jitter from native sensor fluctuations
      targetGyroXRef.current = dAlpha * sensitivityX;
      targetGyroYRef.current = dBeta * sensitivityY;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [gyroEnabled]);

  // 5. Cinematic requestAnimationFrame loop for ultra-smooth Lerp interpolation/damping
  useEffect(() => {
    if (!gyroEnabled) return;

    let rAFId: number;
    
    const updateSmoothPosition = () => {
      setSmoothGyro((prev) => {
        // Calculate the difference between current visual state and target ref
        const diffX = targetGyroXRef.current - prev.x;
        const diffY = targetGyroYRef.current - prev.y;

        // Apply visual damping (take 10% of distance every frame for maximum buttery smoothness)
        const lerpFactor = 0.10;

        // Snapping thresholds to avoid infinite microscopic floating calculations
        const nextX = Math.abs(diffX) < 0.05 ? targetGyroXRef.current : prev.x + diffX * lerpFactor;
        const nextY = Math.abs(diffY) < 0.05 ? targetGyroYRef.current : prev.y + diffY * lerpFactor;

        // Calculate subtle wall-adherence 3D perspective tilts based on current visual coordinate offsets
        const rawTiltX = -targetGyroYRef.current * 0.06;
        const rawTiltY = -targetGyroXRef.current * 0.06;

        // Clamp tilts between -22 and 22 degrees to prevent extreme artwork inversion
        const targetTiltX = Math.max(-22, Math.min(22, rawTiltX));
        const targetTiltY = Math.max(-22, Math.min(22, rawTiltY));

        const diffTiltX = targetTiltX - prev.tiltX;
        const diffTiltY = targetTiltY - prev.tiltY;

        const nextTiltX = Math.abs(diffTiltX) < 0.05 ? targetTiltX : prev.tiltX + diffTiltX * lerpFactor;
        const nextTiltY = Math.abs(diffTiltY) < 0.05 ? targetTiltY : prev.tiltY + diffTiltY * lerpFactor;

        // Skip render updates if change is virtually imperceptible
        if (
          Math.abs(prev.x - nextX) < 0.01 && 
          Math.abs(prev.y - nextY) < 0.01 &&
          Math.abs(prev.tiltX - nextTiltX) < 0.01 &&
          Math.abs(prev.tiltY - nextTiltY) < 0.01
        ) {
          return prev;
        }

        return {
          x: nextX,
          y: nextY,
          tiltX: nextTiltX,
          tiltY: nextTiltY
        };
      });

      rAFId = requestAnimationFrame(updateSmoothPosition);
    };

    rAFId = requestAnimationFrame(updateSmoothPosition);
    return () => {
      cancelAnimationFrame(rAFId);
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
    targetGyroXRef.current = 0;
    targetGyroYRef.current = 0;
    setSmoothGyro({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
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
  const gyroX = gyroEnabled ? smoothGyro.x : 0;
  const gyroY = gyroEnabled ? smoothGyro.y : 0;

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
              className="relative group"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale}) perspective(1200px) rotateX(${gyroEnabled ? smoothGyro.tiltX : 0}deg) rotateY(${gyroEnabled ? smoothGyro.tiltY : 0}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
const Header = () => (
  <div className="bg-white sticky top-0 z-40 py-4 px-6 border-b border-slate-100">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      
      {/* Brand Profile section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-serif text-lg font-bold">
            B
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-teal-900 font-serif">Balla-AR</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">South Sulawesi Heritage Interiors</p>
          </div>
        </div>
        <div className="relative md:hidden flex items-center">
          <div className="w-2 h-2 bg-red-500 border border-white rounded-full absolute top-1 right-1" />
          <Bell size={22} className="text-slate-400" />
        </div>
      </div>
      
      {/* Unified Search & Desktop notification */}
      <div className="flex items-center gap-4 flex-1 max-w-lg md:ml-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari perabot adat Toraja, Bugis..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
          />
        </div>
        <div className="hidden md:flex relative cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
          <span className="absolute top-2 right-2 w-2 h-2 bg-teal-600 rounded-full" />
          <Bell size={20} className="text-slate-400" />
        </div>
      </div>

    </div>
  </div>
);

// --- Hero Banner ---
const HeroBanner = () => (
  <div className="mb-8">
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-48 sm:h-60 md:h-72 lg:h-80 rounded-3xl overflow-hidden shadow-md group"
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
  onClick 
}: { 
  product: Product; 
  index: number; 
  onARClick: (e: React.MouseEvent) => void; 
  onClick: () => void; 
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
          <div className="absolute top-2 right-2 flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); }}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-500 shadow-xs cursor-pointer hover:text-red-500 transition-colors"
            >
              <Heart size={13} />
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
          <span className="text-xs font-bold text-teal-900">{product.price}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="w-7 h-7 rounded-full bg-teal-900 hover:bg-teal-950 text-white flex items-center justify-center shadow-xs cursor-pointer"
          >
            <ShoppingBag size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Floating BottomNav Dock ---
const BottomNav = () => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-100 shadow-xl shadow-teal-950/5 px-6 py-3 flex justify-between items-center rounded-[24px] z-40">
    <button className="text-teal-600 flex flex-col items-center gap-0.5 cursor-pointer">
      <Home size={20} />
      <span className="text-[9px] font-bold">Koleksi</span>
    </button>
    <button className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-0.5 cursor-pointer">
      <Heart size={20} />
      <span className="text-[9px] font-bold">Favorit</span>
    </button>
    <button className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-0.5 cursor-pointer">
      <ShoppingBag size={20} />
      <span className="text-[9px] font-bold">Keranjang</span>
    </button>
    <button className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-0.5 cursor-pointer">
      <User size={20} />
      <span className="text-[9px] font-bold">Profil</span>
    </button>
  </div>
);

// --- MAIN APPLICATION ENTRY ---
export default function App() {
  const [view, setView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  // Filtered listing based on interactive tab
  const filteredProducts = categoryFilter === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.culture.toLowerCase() === categoryFilter);

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
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl -z-10" />
            <div className="absolute bottom-10 left-0 w-96 h-96 bg-amber-50 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl -z-10" />

            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 pb-28">
              <HeroBanner />
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
                
                {/* Fully Fluid Responsive Grid (No rigid max-w constraints) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={index} 
                      onARClick={(e) => handleARClick(e, product)}
                      onClick={() => handleProductClick(product)}
                    />
                  ))}
                </div>
              </div>
            </main>

            {/* Seamless, centered bottom floating navbar */}
            <BottomNav />
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
          />
        )}
        
      </AnimatePresence>
    </div>
  );
}
