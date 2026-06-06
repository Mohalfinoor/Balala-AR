import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Star, HelpCircle, Layers, ShieldCheck, Landmark } from 'lucide-react';

interface HeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CultureTopic {
  id: string;
  name: string;
  motto: string;
  ornaments: { name: string; meaning: string; symbol: string }[];
  history: string;
  accentColor: string;
}

const HERITAGE_TOPICS: CultureTopic[] = [
  {
    id: 'toraja',
    name: 'Ukir Garis Toraja (Passura\')',
    motto: 'Mesa kada dipotuo, pantan kada dipomate',
    history: 'Seni ukir Toraja (Passura\') adalah sistem penulisan simbolik leluhur purba yang diukir pada dinding kayu jati rumah adat Tongkonan. Terdiri dari empat rumpun motif dasar melambangkan struktur kosmik, keadilan sosial, kemandirian hidup, dan kemakmuran abadi.',
    ornaments: [
      {
        name: "Pa'reppo",
        symbol: "❖",
        meaning: "Ukiran berbentuk barisan persegi bersilang melambangkan keteguhan iman, kekokohan prinsip, serta kemapanan ekonomi keluarga."
      },
      {
        name: "Pa'tedong",
        symbol: "♉",
        meaning: "Simbol kepala kerbau sakral melambangkan kesejahteraan, kemakmuran strata sosial, serta tanda penghormatan terdalam pada leluhur."
      },
      {
        name: "Pa'sulan Sangbua",
        symbol: "✥",
        meaning: "Menyerupai lipatan sirih emas melambangkan kerukunan, keterbukaan hati dalam bermusyawarah, serta tali kebersamaan warga adat."
      }
    ],
    accentColor: 'from-teal-600 to-teal-850'
  },
  {
    id: 'bugis',
    name: 'Seni Sulur & Geometri Bugis',
    motto: 'Siri\' na Pesse, lempu\' na Acca',
    history: 'Ukiran adat Bugis banyak dipengaruhi oleh filosofi alam laut dan garis pertumbuhan tanaman menjalar (sulur) yang organik, merepresentasikan falsafah penyebaran kemakmuran tanpa batas. Dipadukan dengan aksen geometris belah ketupat (Sullapa Eppa) yang merepresentasikan batas penciptaan manusia.',
    ornaments: [
      {
        name: "Ukir Sulur Organik (Pucu' Rebung)",
        symbol: "♨",
        meaning: "Melambangkan pertumbuhan spiritual tanpa henti, fleksibilitas dalam hidup bersosialisasi, serta keharmonisan batin."
      },
      {
        name: "Sullapa Eppa (Segi Empat)",
        symbol: "◆",
        meaning: "Filosofi asal mula kehidupan alam semesta: unsur tanah, air, api, dan udara. Mengajarkan keseimbangan hidup manusia."
      },
      {
        name: "Kaligrafi Khath Lontara",
        symbol: "✍",
        meaning: "Perpaduan doa spiritual keagamaan Islam dengan aksara Lontara kuno Bugis sebagai berkah perlindungan rumah."
      }
    ],
    accentColor: 'from-amber-600 to-amber-800'
  },
  {
    id: 'makassar',
    name: 'Keberanian & Relief Makassar',
    motto: 'Sekali Layar Terkembang, Surut Kita Berpantang',
    history: 'Estetika Makassar memadukan ukiran dekoratif istana kerajaan Balla Lompo dengan narasi bahari. Kapal Phinisi, penjelajah tangguh penakluk samudera, digambarkan dalam ukiran relief timbul untuk mentransmisikan jiwa kepemimpinan dan ketabahan menghadapi rintangan.',
    ornaments: [
      {
        name: "Relief Phinisi Nusantara",
        symbol: "⛵",
        meaning: "Simbol keteguhan berjuang, perjuangan bernilai tak terhingga, keberanian mengarungi tantangan zaman, serta kebebasan jiwa."
      },
      {
        name: "Ukiran Bunga Laleng Istana",
        symbol: "✿",
        meaning: "Motif kelopak bunga istana emas melambangkan kemurnian akhlak, kehormatan keluarga bangsawan, serta keramahtamahan sejati."
      }
    ],
    accentColor: 'from-red-650 to-red-800'
  },
  {
    id: 'mandar',
    name: 'Tenun Sutra & Geometri Mandar',
    motto: 'Mesa penaa mappatuju',
    history: 'Mandar memiliki reputasi tinggi atas wastra tenun sutra kebanggaannya, Saqbe Mandar. Pola garis tebal warna-warni yang beririsan membentuk anyaman geometris yang dinamis, kini diadaptasikan menjadi pelapis jok, ornamen panel kayu, dan furnitur minimalis modern.',
    ornaments: [
      {
        name: "Saqbe Sure' (Garis Silang)",
        symbol: "▤",
        meaning: "Motif anyaman tenun presisi melambangkan kekuatan ikatan keluarga, kesepakatan mufakat, serta kehangatan silaturahmi."
      },
      {
        name: "Motif Pannyapu (Lancang)",
        symbol: "⛛",
        meaning: "Berbentuk segitiga pelindung melambangkan pagar pertahanan moralitas dilingkungan generasi penerus adat."
      }
    ],
    accentColor: 'from-indigo-600 to-indigo-800'
  }
];

export default function HeritageModal({ isOpen, onClose }: HeritageModalProps) {
  const [activeTab, setActiveTab] = useState('toraja');

  if (!isOpen) return null;

  const currentTopic = HERITAGE_TOPICS.find(t => t.id === activeTab) || HERITAGE_TOPICS[0];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
      >
        {/* Banner with Accent */}
        <div className={`p-6 bg-gradient-to-r ${currentTopic.accentColor} text-white relative z-25 transition-all duration-500`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold mb-2 inline-block">
            Kamus Budaya Balla AR
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">{currentTopic.name}</h2>
          <p className="text-[11px] text-teal-100/80 italic mt-1 font-serif">"{currentTopic.motto}"</p>
        </div>

        {/* Tab Switch Row */}
        <div className="flex items-center justify-start sm:justify-center gap-2 border-b border-slate-100 overflow-x-auto no-scrollbar bg-white py-3 px-4 relative z-30 shadow-sm shrink-0">
          {HERITAGE_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTab(topic.id)}
              className={`py-2 px-4 font-serif text-xs font-bold whitespace-nowrap cursor-pointer transition-all rounded-full border ${
                activeTab === topic.id 
                  ? 'border-teal-700 text-teal-900 bg-teal-50/50 shadow-xs font-extrabold' 
                  : 'border-transparent text-slate-500 hover:text-slate-750 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              {topic.id.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Info Grid Content Scroll area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar text-xs relative z-10 bg-white">
          
          {/* History */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1">
              <Landmark size={12} className="text-teal-600" /> Latar Belakang Sejarah & Filosofi
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-justify">
              {currentTopic.history}
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Ornaments Detail List */}
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1">
              <Layers size={12} className="text-teal-600" /> Detail Simbol & Motif Ornamen
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTopic.ornaments.map((ornament, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 transition-all hover:bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-teal-800 text-sm">
                      {ornament.symbol}
                    </span>
                    <span className="font-bold text-slate-800 text-sm font-serif">{ornament.name}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px] pl-8">
                    {ornament.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Educational callout */}
          <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-teal-900 text-xs mb-0.5">Komitmen Pelestarian Seniman Adat</p>
              <p className="text-teal-800/80 leading-relaxed text-[10px]">
                Seluruh ornamen ukiran dipahat manual oleh pengukir berdarah asli suku lokal. Pembelian perabot ini berkontribusi langsung sebesar 10% untuk keberlangsungan sanggar ukir di masing-masing daerah pedalaman Sulawesi Selatan.
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-teal-950 hover:bg-teal-900 text-white font-bold px-6 py-2.5 rounded-full text-xs cursor-pointer transition-colors"
          >
            Selesai Membaca
          </button>
        </div>

      </motion.div>
    </div>
  );
}
