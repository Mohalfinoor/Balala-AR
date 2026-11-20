import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  culture: string;
  rating: number;
  description: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

const parsePrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
};

const formatPrice = (num: number): string => {
  return "Rp " + num.toLocaleString('id-ID');
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'loading' | 'success'>('idle');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + parsePrice(item.product.price) * item.quantity;
  }, 0);

  const shippingCost = subtotal > 10000000 ? 0 : 350000;
  const grandTotal = subtotal + (cartItems.length > 0 ? shippingCost : 0);

  const handleSimulateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !address) return;
    
    setCheckoutStep('loading');
    setTimeout(() => {
      setCheckoutStep('success');
    }, 1800);
  };

  const handleWhatsAppCheckout = () => {
    const itemList = cartItems.map(item => `- ${item.product.name} (x${item.quantity}) @ ${item.product.price}`).join('%0A');
    const text = `Halo%20Balla%20AR!%0A%0ASaya%20tertarik%20untuk%20memesan%20furniture%20warisan%20kebudayaan%20berikut:%0A${itemList}%0A%0A*Total%20Order:*%20${formatPrice(grandTotal)}%0A*Alamat%20Pengiriman:*%20${encodeURIComponent(address)}%0A*Catatan:*%20${encodeURIComponent(notes || '-')}%0A%0AMohon%20konfirmasi%20pembayaran%20dan%20estimasi%20pengerjaannya.%20Terima%20kasih!`;
    window.open(`https://wa.me/628123456789?text=${text}`, '_blank');
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

      {/* Drawer Section */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-screen max-w-md liquid-glass border-l border-white/85 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#D7B463]/20 flex items-center justify-between liquid-glass-dark text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D7B463]/15 border border-[#D7B463]/30 flex items-center justify-center text-[#D7B463]">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold tracking-tight text-[#FAF8F3]">Keranjang Belanja</h2>
                <p className="text-[11px] text-[#D7B463]/85 font-medium tabular-nums">{cartItems.length} karya pilihan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup keranjang"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {checkoutStep === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-4"
              >
                <div className="w-16 h-16 liquid-glass-pill rounded-full flex items-center justify-center text-[#13524D] mb-4">
                  <CheckCircle2 size={34} />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#10423E] mb-2">Pesanan Diproses</h3>
                <p className="text-[#445754] text-xs leading-relaxed max-w-xs mb-6">
                  Terima kasih telah melestarikan warisan kebudayaan Sulawesi Selatan. Mitra pengrajin adat kami akan mulai memilah kayu jati terbaik untuk pesanan Anda.
                </p>
                <div className="liquid-glass-subtle p-4 rounded-2xl w-full text-left mb-6 space-y-1.5">
                  <p className="text-[11px] font-bold text-[#13524D]">Detail Pemesanan</p>
                  <p className="text-xs text-[#445754]"><span className="font-semibold text-[#162624]">Alamat:</span> {address}</p>
                  <p className="text-xs text-[#445754]"><span className="font-semibold text-[#162624]">Kontak:</span> {phone}</p>
                  <p className="text-xs text-[#445754]"><span className="font-semibold text-[#162624]">Pembayaran:</span> COD / Transfer Bank Langsung</p>
                </div>
                <div className="w-full space-y-2.5">
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full liquid-glass-teal hover:brightness-110 text-white py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Hubungkan ke WhatsApp Pengrajin</span>
                    <ExternalLink size={13} />
                  </button>
                  <button
                    onClick={() => {
                      onClearCart();
                      setCheckoutStep('idle');
                      onClose();
                    }}
                    className="w-full liquid-glass-pill hover:bg-white text-[#162624] py-3 rounded-full font-bold text-xs cursor-pointer transition-all"
                  >
                    Selesai &amp; Belanja Lagi
                  </button>
                </div>
              </motion.div>
            ) : cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center pt-10">
                <div className="w-16 h-16 liquid-glass-pill rounded-full flex items-center justify-center text-[#13524D]/60 mb-4">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-sm font-bold text-[#162624] mb-1">Keranjang Masih Kosong</h3>
                <p className="text-[#5C6F6B] text-xs max-w-[220px] leading-relaxed">
                  Jelajahi galeri furnitur kami dan tambahkan mahakarya ukiran favorit Anda ke keranjang.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items List */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#5C6F6B]">Daftar Karya Pilihan</span>
                    <button onClick={onClearCart} className="text-[11px] font-bold text-[#9E3F44] hover:underline flex items-center gap-1 cursor-pointer">
                      <Trash2 size={12} /> Bersihkan
                    </button>
                  </div>
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3.5 p-3 liquid-glass-card rounded-2xl">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-contain bg-[#FAF8F3]/90 p-1 flex-shrink-0 border border-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-[#A87F2D]">{item.product.culture}</span>
                        <h4 className="text-xs font-bold text-[#162624] truncate mb-0.5">{item.product.name}</h4>
                        <p className="text-xs font-extrabold text-[#10423E] tabular-nums mb-2">{item.product.price}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 liquid-glass-pill px-2.5 py-1 rounded-full">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="text-[#445754] hover:text-[#10423E] p-0.5 rounded-full cursor-pointer"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-bold text-[#162624] tabular-nums leading-none min-w-[14px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="text-[#445754] hover:text-[#10423E] p-0.5 rounded-full cursor-pointer"
                              aria-label="Tambah jumlah"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-[#9E3F44] hover:text-[#7C3238] p-2 bg-[#F9ECEC]/80 hover:bg-[#F4DFDF] rounded-xl transition-colors cursor-pointer"
                            aria-label="Hapus item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Checkout Form */}
                <form onSubmit={handleSimulateCheckout} className="border-t border-[#10423E]/10 pt-5 space-y-4">
                  <h3 className="text-xs font-bold text-[#445754]">Formulir Pengiriman Adat</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#445754] mb-1">Nomor WhatsApp Aktif</label>
                      <input
                        type="tel"
                        required
                        placeholder="contoh: 08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#445754] mb-1">Alamat Penerimaan Lengkap</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, kecamatan, kabupaten"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none resize-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#445754] mb-1">Catatan Kustom Pengrajin (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Ubah warna kain, jenis ukiran, dsb."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  {/* Summary math */}
                  <div className="liquid-glass-subtle rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex justify-between text-[#445754]">
                      <span>Subtotal</span>
                      <span className="font-bold tabular-nums text-[#162624]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#445754]">
                      <span>Pengiriman Kargo Jati</span>
                      {shippingCost === 0 ? (
                        <span className="text-[#13524D] font-bold">Gratis</span>
                      ) : (
                        <span className="font-bold tabular-nums text-[#162624]">{formatPrice(shippingCost)}</span>
                      )}
                    </div>
                    <div className="h-px bg-[#10423E]/10 my-1" />
                    <div className="flex justify-between text-[#162624] font-serif text-sm font-bold">
                      <span>Total Biaya</span>
                      <span className="text-[#10423E] tabular-nums">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutStep === 'loading'}
                    className="w-full liquid-glass-teal hover:brightness-110 text-white py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all group"
                  >
                    <span>{checkoutStep === 'loading' ? 'Membuat Faktur Pemesanan...' : 'Simulasikan Pembayaran Adat'}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
