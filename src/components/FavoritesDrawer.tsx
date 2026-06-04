import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Star, ShoppingBag, Eye } from 'lucide-react';

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Slide drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-teal-905 text-slate-800 border-t-4 border-teal-600">
            <div className="flex items-center gap-2.5">
              <Heart size={20} className="text-teal-600 fill-teal-600 animate-pulse" />
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">Koleksi Favorit</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{favoriteProducts.length} warisan pusaka disukai</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {favoriteProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-85">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mb-4">
                  <Heart size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Daftar Favorit Kosong</h3>
                <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
                  Tandai produk budaya kesukaan Anda dengan mengetuk ikon hati agar tersimpan di katalog pribadi ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group relative flex gap-4 p-3 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer shadow-xs"
                    onClick={() => { onSelectProduct(product); onClose(); }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest">{product.culture}</span>
                      <h4 className="text-xs font-semibold text-slate-800 truncate mb-1 group-hover:text-teal-700 transition-colors">{product.name}</h4>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-slate-500">{product.rating}</span>
                      </div>
                      
                      <span className="text-xs font-bold text-teal-900">{product.price}</span>
                    </div>

                    {/* Left overlay buttons */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product.id);
                        }}
                        className="w-7 h-7 bg-white hover:bg-rose-50 border border-slate-100 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-700 shadow-xs cursor-pointer transition-colors"
                        title="Hapus dari Favorit"
                      >
                        <Heart size={12} className="fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="w-7 h-7 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag size={12} />
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
