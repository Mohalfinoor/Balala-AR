import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Layers, ShieldCheck, Landmark } from 'lucide-react';

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
    name: "Ukir Garis Toraja (Passura')",
    motto: 'Mesa kada dipotuo, pantan kada dipomate',
    history: "Seni ukir Toraja (Passura') adalah sistem penulisan simbolik leluhur purba yang diukir pada dinding kayu jati rumah adat Tongkonan. Terdiri dari empat rumpun motif dasar melambangkan struktur kosmik, keadilan sosial, kemandirian hidup, dan kemakmuran abadi.",
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
    accentColor: 'from-[#13524D] to-[#0A2926]'
  },
  {
    id: 'bugis',
    name: 'Seni Sulur & Geometri Bugis',
    motto: "Siri' na Pesse, lempu' na Acca",
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
    accentColor: 'from-[#9D7326] to-[#5E4212]'
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
    accentColor: 'from-[#7C3238] to-[#4A1B1F]'
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
    accentColor: 'from-[#2C3E5A] to-[#172336]'
  }
];

const getTopicThemeClasses = (id: string) => {
  switch (id) {
    case 'toraja':
      return {
        bg: 'bg-[#E7F1EF] text-[#10423E] border-[#13524D]/20',
        text: 'text-[#13524D]',
        lightBg: 'bg-[#EFF6F5]/80 border-[#13524D]/15',
        activeBtn: 'bg-[#13524D] text-[#FAF8F3] shadow-sm',
        ctaBtn: 'bg-[#13524D] hover:bg-[#0E3E3A]',
      };
    case 'bugis':
      return {
        bg: 'bg-[#F7EFDB] text-[#6E4E15] border-[#C59B42]/30',
        text: 'text-[#9D7326]',
        lightBg: 'bg-[#FAF4E6]/85 border-[#C59B42]/25',
        activeBtn: 'bg-[#A87F2D] text-[#FAF8F3] shadow-sm',
        ctaBtn: 'bg-[#A87F2D] hover:bg-[#8E6A22]',
      };
    case 'makassar':
      return {
        bg: 'bg-[#F5E8E9] text-[#612328] border-[#7C3238]/20',
        text: 'text-[#7C3238]',
        lightBg: 'bg-[#F9EFF0]/80 border-[#7C3238]/15',
        activeBtn: 'bg-[#7C3238] text-[#FAF8F3] shadow-sm',
        ctaBtn: 'bg-[#7C3238] hover:bg-[#62262B]',
      };
    case 'mandar':
      return {
        bg: 'bg-[#E9EEF5] text-[#1F2D44] border-[#2C3E5A]/20',
        text: 'text-[#2C3E5A]',
        lightBg: 'bg-[#F0F4F9]/80 border-[#2C3E5A]/15',
        activeBtn: 'bg-[#2C3E5A] text-[#FAF8F3] shadow-sm',
        ctaBtn: 'bg-[#2C3E5A] hover:bg-[#1E2C42]',
      };
    default:
      return {
        bg: 'bg-[#EFF6F5] text-[#10423E] border-[#13524D]/20',
        text: 'text-[#13524D]',
        lightBg: 'bg-[#EFF6F5] border-[#13524D]/15',
        activeBtn: 'bg-[#13524D] text-white shadow-sm',
        ctaBtn: 'bg-[#13524D] hover:bg-[#0E3E3A]',
      };
  }
};

export default function HeritageModal({ isOpen, onClose }: HeritageModalProps) {
  const [activeTab, setActiveTab] = useState('toraja');

  if (!isOpen) return null;

  const currentTopic = HERITAGE_TOPICS.find(t => t.id === activeTab) || HERITAGE_TOPICS[0];
  const theme = getTopicThemeClasses(currentTopic.id);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A2926]/55 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative liquid-glass rounded-[28px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[86vh]"
      >
        {/* Banner with Accent */}
        <div className={`p-6 sm:p-7 bg-gradient-to-br ${currentTopic.accentColor} text-white relative z-20 transition-all duration-300 border-b border-[#D7B463]/25`}>
          <button
            onClick={onClose}
            aria-label="Tutup kamus budaya"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <p className="text-[11px] text-[#E6CD8A] font-medium mb-1.5">
            Kamus Budaya Sulawesi Selatan
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight pr-10 text-[#FAF8F3]">{currentTopic.name}</h2>
          <p className="text-xs text-white/85 italic mt-1.5 font-serif">"{currentTopic.motto}"</p>
        </div>

        {/* Tab Switch Row */}
        <div className="flex items-center justify-start sm:justify-center border-b border-white/50 overflow-x-auto no-scrollbar bg-[#FAF8F3]/55 backdrop-blur-md py-3 px-4 relative z-30 shrink-0">
          <div className="flex liquid-glass-subtle p-1 rounded-full gap-1 mx-auto max-w-full overflow-x-auto no-scrollbar">
            {HERITAGE_TOPICS.map((topic) => {
              const isActive = activeTab === topic.id;
              const topicTheme = getTopicThemeClasses(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTab(topic.id)}
                  className={`py-1.5 px-5 font-serif text-xs font-bold tracking-wide whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 rounded-full ${
                    isActive 
                      ? topicTheme.activeBtn
                      : 'text-[#445754] hover:text-[#162624] hover:bg-white/60'
                  }`}
                >
                  {topic.id.charAt(0).toUpperCase() + topic.id.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Grid Content Scroll area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar text-xs relative z-10 bg-[#FAF8F3]/50">
          
          {/* History */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#5C6F6B] flex items-center gap-1.5">
              <Landmark size={14} className={theme.text} /> Latar Belakang Sejarah &amp; Filosofi
            </h3>
            <p className="text-[#2C3D3A] leading-relaxed text-sm">
              {currentTopic.history}
            </p>
          </div>

          <div className="h-px bg-[#10423E]/10" />

          {/* Ornaments Detail List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#5C6F6B] flex items-center gap-1.5">
              <Layers size={14} className={theme.text} /> Detail Simbol &amp; Motif Ornamen
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTopic.ornaments.map((ornament, idx) => (
                <div key={idx} className="liquid-glass-card p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-xl ${theme.bg} border flex items-center justify-center font-bold text-sm shrink-0`}>
                      {ornament.symbol}
                    </span>
                    <span className="font-bold text-[#162624] text-sm font-serif">{ornament.name}</span>
                  </div>
                  <p className="text-[#445754] leading-relaxed text-xs pl-10">
                    {ornament.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#10423E]/10" />

          {/* Educational callout */}
          <div className={`${theme.lightBg} border backdrop-blur-md p-4 rounded-2xl flex items-start gap-3`}>
            <ShieldCheck size={18} className={`${theme.text} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`font-bold ${theme.text} text-xs mb-0.5`}>Komitmen Pelestarian Seniman Adat</p>
              <p className="text-[#445754] leading-relaxed text-[11px]">
                Seluruh ornamen ukiran dipahat manual oleh pengukir berdarah asli suku lokal. Pembelian perabot ini berkontribusi langsung sebesar 10% untuk keberlangsungan sanggar ukir di masing-masing daerah pedalaman Sulawesi Selatan.
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/60 bg-[#FAF8F3]/70 backdrop-blur-md flex justify-end">
          <button
            onClick={onClose}
            className={`cursor-pointer transition-all font-bold px-6 py-2.5 rounded-full text-xs shadow-sm text-white ${theme.ctaBtn}`}
          >
            Selesai Membaca
          </button>
        </div>

      </motion.div>
    </div>
  );
}
