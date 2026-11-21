import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="w-full liquid-glass-pill hover:bg-[#13524D]/10 hover:text-[#10423E] text-[#445754] font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Download size={14} className="shrink-0 text-[#13524D]" />
        <span>Pasang Aplikasi Balla AR (Web App)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="w-full liquid-glass-pill hover:bg-[#13524D]/10 hover:text-[#10423E] text-[#445754] font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Smartphone size={14} className="shrink-0 text-[#13524D]" />
          <span>Tambahkan ke Layar Utama (iPhone)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0A2926]/65 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#FAF8F3] border border-[#D7B463]/35 p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold text-[#10423E]">
                  Pasang Balla AR di iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Tutup panduan"
                  className="w-8 h-8 rounded-full bg-[#EFECE4] flex items-center justify-center text-[#10423E] cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-[#445754] leading-relaxed">
                1. Ketuk ikon <strong className="inline-flex items-center gap-1 text-[#10423E]"><Share size={12} /> Bagikan (Share)</strong> pada bilah Safari.<br />
                2. Gulir ke bawah lalu pilih <strong className="text-[#10423E]">Tambahkan ke Layar Utama (Add to Home Screen)</strong> agar aplikasi tampil dengan ikon logo asli Balla AR.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full liquid-glass-teal text-[#FAF8F3] py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default PWAInstallButton;
