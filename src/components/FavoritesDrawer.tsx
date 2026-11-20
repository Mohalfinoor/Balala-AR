import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Star, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  culture: string;
  rating: number;
  description: string;
}

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  products: Product[];
  onToggleFavorite: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  products,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart
}: FavoritesDrawerProps) {
  if (!isOpen) return null;

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

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

      {/* Slide drawer */}
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
                <Heart size={18} className="fill-[#D7B463]" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#FAF8F3]">Koleksi Favorit</h2>
                <p className="text-[11px] text-[#D7B463]/85 font-medium tabular-nums">{favoriteProducts.length} warisan pusaka disukai</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup daftar favorit"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {favoriteProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 liquid-glass-pill rounded-full flex items-center justify-center text-[#9E3F44] mb-4">
                  <Heart size={24} />
                </div>
                <h3 className="text-sm font-bold text-[#162624] mb-1">Daftar Favorit Kosong</h3>
                <p className="text-[#5C6F6B] text-xs max-w-[220px] leading-relaxed">
                  Tandai produk budaya kesukaan Anda dengan mengetuk ikon hati agar tersimpan di katalog pribadi ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {favoriteProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group relative flex gap-3.5 p-3 liquid-glass-card rounded-2xl cursor-pointer"
                    onClick={() => { onSelectProduct(product); onClose(); }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-contain bg-[#FAF8F3]/90 p-1 flex-shrink-0 border border-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 pr-9">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#A87F2D] mb-0.5">
                        <span>{product.culture}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-0.5 text-[#445754] tabular-nums">
                          <Star size={10} className="fill-[#C59B42] text-[#C59B42]" />
                          {product.rating}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#162624] truncate mb-1 group-hover:text-[#13524D] transition-colors">{product.name}</h4>
                      <span className="text-xs font-extrabold text-[#10423E] tabular-nums">{product.price}</span>
                    </div>

                    {/* Quick actions */}
                    <div className="absolute right-3 top-3 flex flex-col gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product.id);
                        }}
                        className="w-8 h-8 liquid-glass-pill rounded-full flex items-center justify-center text-[#9E3F44] hover:text-[#7C3238] cursor-pointer transition-colors"
                        title="Hapus dari Favorit"
                      >
                        <Heart size={13} className="fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="w-8 h-8 liquid-glass-teal text-white rounded-full flex items-center justify-center cursor-pointer transition-all hover:brightness-110"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
