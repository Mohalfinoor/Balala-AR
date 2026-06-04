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
    // Generate pre-filled message detailing order for artisan
    const itemList = cartItems.map(item => `- ${item.product.name} (x${item.quantity}) @ ${item.product.price}`).join('%0A');
    const text = `Halo%20Balala%20AR!%0A%0ASaya%20tertarik%20untuk%20memesan%20furniture%20warisan%20kebudayaan%20berikut:%0A${itemList}%0A%0A*Total%20Order:*%20${formatPrice(grandTotal)}%0A*Alamat%20Pengiriman:*%20${encodeURIComponent(address)}%0A*Catatan:*%20${encodeURIComponent(notes || '-')}%0A%0AMohon%20konfirmasi%20pembayaran%20dan%20estimasi%20pengerjaannya.%20Terima%20kasih!`;
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer Section */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-950 text-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={20} className="text-teal-400" />
              <div>
                <h2 className="text-lg font-serif font-bold">Keranjang Belanja</h2>
                <p className="text-[10px] text-teal-300 uppercase tracking-widest font-semibold">{cartItems.length} barang pilihan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {checkoutStep === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-4"
              >
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Pesanan Diproses!</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-xs mb-6">
                  Terima kasih telah melestarikan warisan kebudayaan Sulawesi Selatan. Mitra pengrajin adat kami akan mulai memilah kayu jati terbaik untuk pesanan Anda.
                </p>
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl w-full text-left mb-6 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">Detail Pemesanan:</p>
                  <p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Alamat:</span> {address}</p>
                  <p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Hp:</span> {phone}</p>
                  <p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Pembayaran:</span> COD / Direct Bank Transfer</p>
                </div>
                <div className="w-full space-y-2.5">
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-500/10"
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
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-full font-bold text-xs cursor-pointer transition-colors"
                  >
                    Selesai & Belanja Lagi
                  </button>
                </div>
              </motion.div>
            ) : cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-80 pt-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Keranjang Masih Kosong</h3>
                <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
                  Jelajahi galeri furnitur kami dan tambahkan mahakarya ukiran favorit Anda ke keranjang.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Item</span>
                    <button onClick={onClearCart} className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer">
                      <Trash2 size={11} /> Bersihkan Keranjang
                    </button>
                  </div>
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-white flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">{item.product.culture}</span>
                        <h4 className="text-xs font-semibold text-slate-800 truncate mb-1">{item.product.name}</h4>
                        <p className="text-xs font-extrabold text-teal-900 mb-2">{item.product.price}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5 rounded-full cursor-pointer"
                              title="Kurang"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-bold text-slate-800 font-mono leading-none">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="text-slate-500 hover:text-slate-800 p-0.5 rounded-full cursor-pointer"
                              title="Tambah"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 bg-rose-50 hover:bg-rose-100/60 rounded-xl transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Checkout Form */}
                <form onSubmit={handleSimulateCheckout} className="border-t border-slate-100 pt-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Form Pengiriman Adat</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp Aktif</label>
                      <input
                        type="tel"
                        required
                        placeholder="contoh: 08123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Penerimaan Lengkap</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, kecamatan, kabupaten"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Catatan Kustom Pengrajin (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Ubah warna kain, jenis ukiran, dsb."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-teal-600/30 transition-all outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Summary math */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Harga Subtotal:</span>
                      <span className="font-bold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Ongkos Kirim Jati Cargo:</span>
                      {shippingCost === 0 ? (
                        <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">Gratis Ongkir Adat</span>
                      ) : (
                        <span className="font-bold">{formatPrice(shippingCost)}</span>
                      )}
                    </div>
                    <div className="h-px bg-slate-200/50 my-1" />
                    <div className="flex justify-between text-slate-900 font-serif text-sm font-bold">
                      <span>Total Biaya:</span>
                      <span className="text-teal-900">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutStep === 'loading'}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/15 group"
                  >
                    <span>{checkoutStep === 'loading' ? 'Membuat Faktur Pemesanan...' : 'Simulasikan Pembayaran Adat'}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
