import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Camera,
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { CapturedSnapshotResult, SnapshotProductInfo } from '../utils/arSnapshot';

interface ARSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: CapturedSnapshotResult | null;
  product: SnapshotProductInfo | null;
  onRetake: () => void;
}

export default function ARSnapshotModal({
  isOpen,
  onClose,
  snapshot,
  product,
  onRetake
}: ARSnapshotModalProps) {
  const [includeFrame, setIncludeFrame] = useState(true);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    setCopiedImage(false);
    setCopiedCaption(false);
    setShareFeedback(null);
  }, [snapshot]);

  if (!isOpen || !snapshot || !product) return null;

  const activeUrl = includeFrame ? snapshot.brandedUrl : snapshot.rawUrl;
  const activeBlob = includeFrame ? snapshot.brandedBlob : snapshot.rawBlob;
  const fileSlug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = `balla-ar-snapshot-${fileSlug}.png`;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = `Meninjau ${product.name} (Warisan ${product.culture} · ${product.price}) langsung lewat mode AR di Balla AR!`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = activeUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShareFeedback('Foto snapshot berhasil disimpan ke perangkat Anda.');
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const handleCopyImage = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': activeBlob })
        ]);
        setCopiedImage(true);
        setShareFeedback('Gambar tersalin ke clipboard! Siap ditempel ke WhatsApp, Instagram, atau media sosial.');
        setTimeout(() => {
          setCopiedImage(false);
          setShareFeedback(null);
        }, 3000);
        return;
      }
      setShareFeedback('Clipboard gambar belum didukung peramban ini. Gunakan tombol Unduh Foto.');
      setTimeout(() => setShareFeedback(null), 3500);
    } catch {
      setShareFeedback('Gagal menyalin gambar ke clipboard. Gunakan tombol Unduh Foto.');
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${appUrl}`.trim());
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      handleDownload();
      return;
    }

    try {
      const file = new File([activeBlob], fileName, { type: 'image/png' });
      const canShareFiles =
        typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

      if (canShareFiles) {
        await navigator.share({
          files: [file],
          title: `${product.name} — Balla AR Snapshot`,
          text: shareText,
        });
        setShareFeedback('Snapshot AR berhasil dibagikan.');
      } else {
        await navigator.share({
          title: `${product.name} — Balla AR Snapshot`,
          text: shareText,
          url: appUrl,
        });
        setShareFeedback('Tautan dibagikan. Gunakan "Unduh Foto" untuk melampirkan gambar PNG.');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setShareFeedback('Berbagi langsung tidak tersedia di peramban ini. Silakan Unduh Foto atau Salin Gambar.');
      }
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${appUrl}`)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0A2926]/70 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl liquid-glass rounded-[28px] overflow-hidden shadow-2xl border border-white/85 z-10 my-auto"
      >
        {/* Dark Jade Header */}
        <div className="px-5 sm:px-6 py-4 liquid-glass-dark text-[#FAF8F3] border-b border-[#D7B463]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#D7B463]/15 border border-[#D7B463]/35 flex items-center justify-center text-[#D7B463] shrink-0">
              <Camera size={17} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#FAF8F3] truncate">
                AR Snapshot Siap Dibagikan
              </h2>
              <p className="text-[11px] text-[#D7B463]/90 truncate">
                {product.name} · Warisan {product.culture}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup pratinjau snapshot"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-[#FAF8F3] transition-colors cursor-pointer shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 bg-[#FAF8F3]/75 max-h-[82vh] overflow-y-auto no-scrollbar">
          {/* Captured Image Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-[#061311] border border-[#D7B463]/30 shadow-inner flex items-center justify-center max-h-[42vh]">
            <img
              src={activeUrl}
              alt={`AR Snapshot ${product.name}`}
              className="w-full h-full max-h-[42vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Frame Toggle & Retake Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 liquid-glass-subtle p-3 rounded-2xl">
            <button
              type="button"
              onClick={() => setIncludeFrame(!includeFrame)}
              className="flex items-center gap-2.5 text-xs font-semibold text-[#10423E] cursor-pointer"
            >
              <span
                className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  includeFrame ? 'bg-[#13524D]' : 'bg-[#D6CFC2]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-[#FAF8F3] transition-transform ${
                    includeFrame ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#A87F2D]" />
                Bingkai Galeri Balla AR
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onRetake();
              }}
              className="text-xs font-bold text-[#13524D] hover:text-[#10423E] px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#D7B463]/30 transition-all cursor-pointer active:scale-95"
            >
              Ambil Ulang Foto
            </button>
          </div>

          {/* Feedback banner */}
          {shareFeedback && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#13524D]/12 border border-[#13524D]/25 text-[#10423E] text-xs font-semibold">
              {shareFeedback}
            </div>
          )}

          {/* Primary Actions: Native Share + Save + Copy Image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleNativeShare}
              className="liquid-glass-teal hover:brightness-110 text-[#FAF8F3] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Share2 size={15} />
              <span>Bagikan Langsung</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="liquid-glass-gold hover:brightness-105 text-[#0A2926] font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Download size={15} />
              <span>Unduh Foto PNG</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              className="liquid-glass-pill hover:bg-[#FAF8F3] text-[#10423E] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              {copiedImage ? <Check size={15} className="text-[#13524D]" /> : <Copy size={15} />}
              <span>{copiedImage ? 'Gambar Tersalin' : 'Salin Gambar'}</span>
            </button>
          </div>

          {/* Social Media Direct Channels */}
          <div className="space-y-2.5 pt-1 border-t border-[#D7B463]/20">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-[#5C6F6B]">Bagikan ke Media Sosial</p>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="text-[11px] font-bold text-[#13524D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCaption ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCaption ? 'Teks Tersalin' : 'Salin Teks Caption'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#13524D]/10 hover:bg-[#13524D]/18 border border-[#13524D]/25 text-[#10423E] text-xs font-bold transition-colors whitespace-nowrap"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>

              <a
                href={twitterHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#10423E]/8 hover:bg-[#10423E]/15 border border-[#10423E]/20 text-[#10423E] text-xs font-bold transition-colors whitespace-nowrap"
              >
                <ExternalLink size={13} />
                <span>X / Twitter</span>
              </a>

              <a
                href={facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2C3E5A]/10 hover:bg-[#2C3E5A]/18 border border-[#2C3E5A]/25 text-[#2C3E5A] text-xs font-bold transition-colors whitespace-nowrap"
              >
                <ExternalLink size={13} />
                <span>Facebook</span>
              </a>
            </div>

            <p className="text-[10.5px] text-[#5C6F6B] leading-relaxed">
              Tip: Untuk Instagram Stories atau Facebook post dengan foto, gunakan <strong>Bagikan Langsung</strong> di ponsel atau <strong>Unduh Foto PNG / Salin Gambar</strong> di desktop.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
