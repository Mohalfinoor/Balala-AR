import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Box,
  Receipt,
  Store,
  Plus,
  Search,
  Check,
  X,
  ExternalLink,
  LogOut,
  Menu,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Trash2,
  Truck,
  Package
} from 'lucide-react';
import Logo from './Logo';
import {
  Product,
  ProductStatus,
  MerchantApplication,
  PlatformOrder,
  PlatformOrderStatus
} from '../types/platform';

type SellerSection = 'overview' | 'products' | 'orders' | 'store';

interface SellerDashboardConsoleProps {
  googleUser: { name: string; email: string; avatar: string } | null;
  storeProfile: MerchantApplication | null;
  adminCulture: string;
  products: Product[];
  orders: PlatformOrder[];
  firebaseUid: string | null;
  onOpenAddProduct: () => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProductDirect: (productId: string) => void;
  onUpdateOrder: (orderId: string, updates: Partial<PlatformOrder>) => void;
  onExitConsole: () => void;
  onLogout: () => void;
}

const SECTION_LABELS: Record<SellerSection, string> = {
  overview: 'Ringkasan',
  products: 'Produk & 3D',
  orders: 'Pesanan',
  store: 'Profil Sanggar'
};

const parsePriceNumber = (priceStr: string): number => {
  const digits = priceStr.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

const formatRupiah = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(Math.round(amount)).toLocaleString('id-ID')}`;
};

const getProductStatusLabel = (status?: ProductStatus): string => {
  switch (status) {
    case 'pending':
      return 'Menunggu Kurasi';
    case 'needs_revision':
      return 'Perlu Revisi';
    case 'in_3d_process':
      return 'Proses Model 3D';
    case 'rejected':
      return 'Ditolak';
    case 'approved':
    default:
      return 'Tayang di Katalog';
  }
};

const getProductStatusColor = (status?: ProductStatus): string => {
  switch (status) {
    case 'pending':
      return 'text-amber-700';
    case 'needs_revision':
      return 'text-amber-700';
    case 'in_3d_process':
      return 'text-[#10423E]';
    case 'rejected':
      return 'text-red-600';
    case 'approved':
    default:
      return 'text-emerald-700';
  }
};

const getOrderStatusLabel = (status: PlatformOrderStatus): string => {
  switch (status) {
    case 'awaiting_payment':
      return 'Menunggu Bayar';
    case 'paid':
      return 'Perlu Diproses';
    case 'processing':
      return 'Siap Kirim';
    case 'shipped':
      return 'Dikirim';
    case 'completed':
      return 'Selesai';
    case 'payout_settled':
      return 'Dana Cair';
  }
};

export default function SellerDashboardConsole({
  googleUser,
  storeProfile,
  adminCulture,
  products,
  orders,
  firebaseUid,
  onOpenAddProduct,
  onUpdateProduct,
  onDeleteProductDirect,
  onUpdateOrder,
  onExitConsole,
  onLogout
}: SellerDashboardConsoleProps) {
  const [activeSection, setActiveSection] = useState<SellerSection>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  // Product list filters
  const [productFilter, setProductFilter] = useState<'all' | 'approved' | 'pending' | 'revision'>('all');
  const [productSearch, setProductSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Product edit form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPriceNum, setEditPriceNum] = useState('');
  const [editCulture, setEditCulture] = useState('Toraja');
  const [editMaterial, setEditMaterial] = useState('');
  const [editLength, setEditLength] = useState('');
  const [editWidth, setEditWidth] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhilosophy, setEditPhilosophy] = useState('');

  // Order filters & tracking input
  const [orderFilter, setOrderFilter] = useState<'all' | 'action' | 'shipped' | 'done'>('all');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const storeName = storeProfile?.storeName || `Sanggar ${adminCulture}`;
  const storeCulture = storeProfile?.culture || adminCulture || 'Toraja';
  const commissionRate: 1 | 2 = storeProfile?.commissionRate || 2;

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Seller's own products (matched by sellerUid or storeName; excludes seed platform items without sellerUid/sellerName)
  const myProducts = useMemo(() => {
    return products.filter(p => {
      if (firebaseUid && p.sellerUid) {
        return p.sellerUid === firebaseUid;
      }
      if (p.sellerName && storeName) {
        return p.sellerName.toLowerCase() === storeName.toLowerCase();
      }
      return false;
    });
  }, [products, firebaseUid, storeName]);

  // Seller's own orders
  const myOrders = useMemo(() => {
    return orders.filter(o => {
      if (firebaseUid && o.sellerUid) {
        return o.sellerUid === firebaseUid;
      }
      if (o.sellerName && storeName) {
        return o.sellerName.toLowerCase() === storeName.toLowerCase();
      }
      return false;
    });
  }, [orders, firebaseUid, storeName]);

  // Real computed KPI metrics
  const approvedProductsCount = myProducts.filter(p => !p.status || p.status === 'approved').length;
  const arReadyCount = myProducts.filter(p => Boolean(p.glbUrl)).length;
  const pendingOrIn3DCount = myProducts.filter(
    p => p.status === 'pending' || p.status === 'in_3d_process'
  ).length;
  const revisionProducts = myProducts.filter(
    p => p.status === 'needs_revision' || p.status === 'rejected'
  );

  const actionNeededOrders = myOrders.filter(
    o => o.status === 'paid' || o.status === 'processing'
  );
  const completedOrSettledOrders = myOrders.filter(
    o => o.status === 'completed' || o.status === 'payout_settled'
  );
  const netEarnings = completedOrSettledOrders.reduce((sum, o) => {
    const fee = Math.round((o.netPrice * o.commissionRate) / 100);
    return sum + (o.netPrice - fee);
  }, 0);
  const escrowAmount = myOrders
    .filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped')
    .reduce((sum, o) => {
      const fee = Math.round((o.netPrice * o.commissionRate) / 100);
      return sum + (o.netPrice - fee);
    }, 0);

  const filteredProducts = myProducts.filter(p => {
    const st: ProductStatus = p.status || 'approved';
    const matchesFilter =
      productFilter === 'all'
        ? true
        : productFilter === 'approved'
        ? st === 'approved'
        : productFilter === 'pending'
        ? st === 'pending' || st === 'in_3d_process'
        : st === 'needs_revision' || st === 'rejected';
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.culture.toLowerCase().includes(productSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredOrders = myOrders.filter(o => {
    if (orderFilter === 'action') return o.status === 'paid' || o.status === 'processing';
    if (orderFilter === 'shipped') return o.status === 'shipped';
    if (orderFilter === 'done') return o.status === 'completed' || o.status === 'payout_settled';
    return true;
  });

  const openEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditName(prod.name);
    setEditPriceNum(String(parsePriceNumber(prod.price) || ''));
    setEditCulture(prod.culture || storeCulture);
    setEditMaterial(prod.material || '');
    setEditLength(prod.dimensions?.length ? String(prod.dimensions.length) : '');
    setEditWidth(prod.dimensions?.width ? String(prod.dimensions.width) : '');
    setEditHeight(prod.dimensions?.height ? String(prod.dimensions.height) : '');
    setEditDescription(prod.description || '');
    setEditPhilosophy(prod.philosophy || '');
    setActiveSection('products');
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    const num = parseInt(editPriceNum.replace(/[^0-9]/g, ''), 10);
    if (!editName.trim() || !num || num <= 0 || !editDescription.trim() || !editPhilosophy.trim()) {
      showToast('Lengkapi nama, harga, deskripsi, dan filosofi produk.', 'warning');
      return;
    }

    const l = parseInt(editLength, 10) || 0;
    const w = parseInt(editWidth, 10) || 0;
    const h = parseInt(editHeight, 10) || 0;

    onUpdateProduct(editingProductId, {
      name: editName.trim(),
      price: `Rp ${num.toLocaleString('id-ID')}`,
      culture: editCulture,
      description: editDescription.trim(),
      philosophy: editPhilosophy.trim(),
      ...(editMaterial.trim() ? { material: editMaterial.trim() } : {}),
      ...(l > 0 && w > 0 && h > 0 ? { dimensions: { length: l, width: w, height: h } } : {}),
      status: 'pending'
    });

    setEditingProductId(null);
    showToast(`Perubahan "${editName.trim()}" disimpan dan diajukan ke Tim BALALA.`);
  };

  const navItems: { id: SellerSection; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={15} /> },
    {
      id: 'products',
      label: 'Produk & 3D',
      icon: <Box size={15} />,
      count: revisionProducts.length > 0 ? revisionProducts.length : myProducts.length
    },
    {
      id: 'orders',
      label: 'Pesanan',
      icon: <Receipt size={15} />,
      count: actionNeededOrders.length > 0 ? actionNeededOrders.length : myOrders.length
    },
    { id: 'store', label: 'Profil Sanggar', icon: <Store size={15} /> }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans antialiased flex">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-stone-950/25 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Left Sidebar (240px) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-60 shrink-0 bg-white border-r border-stone-200 flex flex-col justify-between transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between gap-2 px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo className="w-7 h-7 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-bold text-[#10423E] tracking-tight block truncate">
                  Balla AR
                </span>
                <span className="text-[10px] text-stone-500 block truncate">Mitra UMKM</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Tutup menu"
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#10423E]/8 text-[#10423E] font-semibold'
                      : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={active ? 'text-[#10423E]' : 'text-stone-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[11px] tabular-nums font-mono ${
                        active ? 'text-[#10423E] font-semibold' : 'text-stone-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-stone-200 space-y-3">
          <div className="flex items-center gap-2.5 min-w-0 px-1">
            {googleUser?.avatar ? (
              <img
                src={googleUser.avatar}
                alt={googleUser.name || 'Seller'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#10423E] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {(storeName || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-900 truncate">{storeName}</p>
              <p className="text-[11px] text-stone-500 truncate">{googleUser?.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={onExitConsole}
              className="w-full py-2 px-2.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap"
            >
              <ExternalLink size={13} className="text-stone-400 shrink-0" />
              <span>Kembali ke Katalog</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap"
            >
              <LogOut size={13} className="shrink-0" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-stone-200/80 px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Buka menu"
              className="lg:hidden w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-700 cursor-pointer shrink-0"
            >
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-500 min-w-0">
              <span className="hidden sm:inline whitespace-nowrap truncate max-w-[180px]">{storeName}</span>
              <span aria-hidden="true" className="hidden sm:inline text-stone-300">/</span>
              <span className="font-semibold text-stone-900 truncate">{SECTION_LABELS[activeSection]}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-xs font-semibold text-white transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={14} />
            <span>Tambah Produk</span>
          </button>
        </header>

        {/* Feedback Toast */}
        {toast && (
          <div className="px-5 sm:px-8 pt-4 max-w-[1140px] w-full mx-auto">
            <div
              className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-3 ${
                toast.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span className="flex items-center gap-2">
                {toast.type === 'warning' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <span>{toast.text}</span>
              </span>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Tutup notifikasi"
                className="opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Section Viewport */}
        <main className="flex-1 px-5 sm:px-8 py-7 max-w-[1140px] w-full mx-auto space-y-7">
          {/* 1. RINGKASAN */}
          {activeSection === 'overview' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  Dasbor {storeName}
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Kelola pengajuan produk kriya {storeCulture}, pantau progres 3D Tim BALALA, dan proses pengiriman pesanan.
                </p>
              </div>

              {/* 4-Metric Bar */}
              <div className="bg-white border border-stone-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Produk Tayang</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">{approvedProductsCount}</p>
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    {myProducts.length} diajukan · {arReadyCount} siap 3D
                  </p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Kurasi &amp; Revisi</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">
                    {pendingOrIn3DCount + revisionProducts.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('products')}
                    className="text-[11px] font-medium text-[#10423E] hover:underline inline-flex items-center gap-0.5 cursor-pointer tabular-nums"
                  >
                    <span>
                      {revisionProducts.length > 0
                        ? `${revisionProducts.length} perlu revisi`
                        : 'Lihat daftar produk'}
                    </span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Pesanan Perlu Proses</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">{actionNeededOrders.length}</p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('orders')}
                    className="text-[11px] font-medium text-[#10423E] hover:underline inline-flex items-center gap-0.5 cursor-pointer tabular-nums"
                  >
                    <span>{myOrders.length} total pesanan</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Pendapatan Bersih</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums font-mono">
                    {formatRupiah(netEarnings)}
                  </p>
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    Escrow aktif: {formatRupiah(escrowAmount)}
                  </p>
                </div>
              </div>

              {/* 2-Column Workspace Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Perlu Tindak Lanjut */}
                <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-stone-900">Perlu Tindak Lanjut</h2>
                      <p className="text-[11px] text-stone-500">Catatan revisi produk &amp; pesanan siap kirim</p>
                    </div>
                  </div>

                  {revisionProducts.length === 0 && actionNeededOrders.length === 0 ? (
                    <div className="px-5 py-10 text-center space-y-1.5">
                      <CheckCircle2 size={20} className="mx-auto text-emerald-600" />
                      <p className="text-xs font-semibold text-stone-900">Semua tugas selesai</p>
                      <p className="text-[11px] text-stone-500">
                        Tidak ada produk revisi atau pesanan tertunda saat ini.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {revisionProducts.map(prod => (
                        <div key={prod.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-900 truncate">{prod.name}</p>
                            <p className="text-[11px] text-amber-700 truncate mt-0.5">
                              {prod.revisionNote || getProductStatusLabel(prod.status)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditProduct(prod)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-[#10423E] cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Perbaiki
                          </button>
                        </div>
                      ))}

                      {actionNeededOrders.map(ord => (
                        <div key={ord.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-900 truncate">
                              {ord.orderCode} · {ord.productName}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">
                              {ord.buyerName} · {getOrderStatusLabel(ord.status)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSection('orders')}
                            className="px-3 py-1.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-medium cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Proses
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Daftar Produk Terbaru */}
                <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-stone-900">Koleksi Sanggar</h2>
                      <p className="text-[11px] text-stone-500">Status kurasi &amp; pemodelan 3D produk Anda</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('products')}
                      className="text-xs font-medium text-[#10423E] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Kelola Semua
                    </button>
                  </div>

                  {myProducts.length === 0 ? (
                    <div className="px-5 py-10 text-center space-y-3">
                      <Package size={20} className="mx-auto text-stone-400" />
                      <div>
                        <p className="text-xs font-semibold text-stone-900">Belum ada produk diajukan</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Ajukan produk kriya pertama Anda untuk dimodelkan 3D oleh Tim BALALA.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenAddProduct}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-medium cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Tambah Produk</span>
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {myProducts.slice(0, 5).map(prod => (
                        <div key={prod.id} className="px-5 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-900 truncate">{prod.name}</p>
                              <p className="text-[11px] text-stone-500 tabular-nums font-mono mt-0.5">
                                {prod.price}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[11px] font-medium whitespace-nowrap ${getProductStatusColor(prod.status)}`}>
                            {getProductStatusLabel(prod.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUK & 3D */}
          {activeSection === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">Produk &amp; Aset 3D</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Pantau status kurasi, lihat catatan revisi Tim BALALA, atau perbarui detail produk Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddProduct}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Ajukan Produk Baru</span>
                </button>
              </div>

              {/* Edit Product Form */}
              {editingProductId && (
                <form
                  onSubmit={handleSaveEditProduct}
                  className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-stone-900">Perbarui &amp; Ajukan Ulang Produk</h2>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Produk akan masuk kembali ke antrean kurasi Tim BALALA setelah disimpan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProductId(null)}
                      aria-label="Tutup form edit"
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Nama Produk</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Harga (Rp)</label>
                      <input
                        type="text"
                        required
                        value={editPriceNum}
                        onChange={e => setEditPriceNum(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-mono tabular-nums outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Suku Tradisi</label>
                      <select
                        value={editCulture}
                        onChange={e => setEditCulture(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      >
                        <option value="Toraja">Toraja</option>
                        <option value="Bugis">Bugis</option>
                        <option value="Makassar">Makassar</option>
                        <option value="Mandar">Mandar</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block font-medium text-stone-700 mb-1">Material Utama</label>
                      <input
                        type="text"
                        placeholder="contoh: Kayu Jati"
                        value={editMaterial}
                        onChange={e => setEditMaterial(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Panjang (cm)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="80"
                        value={editLength}
                        onChange={e => setEditLength(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-mono tabular-nums outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Lebar (cm)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="75"
                        value={editWidth}
                        onChange={e => setEditWidth(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-mono tabular-nums outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Tinggi (cm)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="85"
                        value={editHeight}
                        onChange={e => setEditHeight(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-mono tabular-nums outline-none focus:border-[#10423E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Deskripsi Produk</label>
                      <textarea
                        rows={3}
                        required
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Filosofi &amp; Motif Budaya</label>
                      <textarea
                        rows={3}
                        required
                        value={editPhilosophy}
                        onChange={e => setEditPhilosophy(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingProductId(null)}
                      className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white font-semibold cursor-pointer"
                    >
                      Simpan &amp; Ajukan Ulang
                    </button>
                  </div>
                </form>
              )}

              {/* Filter & Search Toolbar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'approved', label: 'Tayang' },
                    { id: 'pending', label: 'Antrean & 3D' },
                    { id: 'revision', label: 'Revisi / Ditolak' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setProductFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        productFilter === tab.id
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk..."
                    className="w-full bg-white border border-stone-200 rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:border-[#10423E]"
                  />
                </div>
              </div>

              {/* Products List */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-xl py-14 px-6 text-center space-y-2">
                  <p className="text-xs font-semibold text-stone-900">Tidak ada produk ditemukan</p>
                  <p className="text-xs text-stone-500">
                    {myProducts.length === 0
                      ? 'Belum ada karya yang Anda ajukan dari sanggar ini.'
                      : 'Ubah filter atau kata kunci pencarian untuk melihat produk lain.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-200 overflow-hidden">
                  {filteredProducts.map(prod => (
                    <div key={prod.id} className="p-5 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                              <h3 className="text-sm font-semibold text-stone-900">{prod.name}</h3>
                              <span className={`text-xs font-medium ${getProductStatusColor(prod.status)}`}>
                                · {getProductStatusLabel(prod.status)}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500">
                              Suku {prod.culture} ·{' '}
                              <span className="font-mono tabular-nums text-stone-900 font-medium">{prod.price}</span>
                              {prod.dimensions ? (
                                <span className="font-mono tabular-nums text-stone-500">
                                  {' '}
                                  · {prod.dimensions.length}×{prod.dimensions.width}×{prod.dimensions.height} cm
                                </span>
                              ) : null}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              Aset 3D:{' '}
                              <span className={prod.glbUrl ? 'text-emerald-700 font-medium' : 'text-stone-600'}>
                                {prod.glbUrl ? (prod.usdzUrl ? 'GLB + USDZ Siap' : 'GLB Siap') : 'Menunggu Tim BALALA'}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => openEditProduct(prod)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>

                          {confirmDeleteId === prod.id ? (
                            <span className="inline-flex items-center gap-2 pl-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProductDirect(prod.id);
                                  setConfirmDeleteId(null);
                                  showToast(`"${prod.name}" dihapus.`, 'warning');
                                }}
                                className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                              >
                                Konfirmasi Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
                              >
                                Batal
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(prod.id)}
                              aria-label={`Hapus ${prod.name}`}
                              className="p-2 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {prod.revisionNote && (prod.status === 'needs_revision' || prod.status === 'rejected') && (
                        <div
                          className={`px-3.5 py-2.5 rounded-lg border text-xs ${
                            prod.status === 'rejected'
                              ? 'bg-red-50 border-red-200 text-red-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <span className="font-semibold">Catatan Tim BALALA: </span>
                          <span>{prod.revisionNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PESANAN */}
          {activeSection === 'orders' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">Pesanan Masuk</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Proses pesanan terbayar, masukkan nomor resi pengiriman, dan pantau hak sanggar Anda.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg w-fit overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'action', label: 'Perlu Diproses' },
                  { id: 'shipped', label: 'Dikirim' },
                  { id: 'done', label: 'Selesai' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOrderFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      orderFilter === tab.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50/70 border-b border-stone-200 text-left text-stone-500">
                        <th className="py-3 px-4 font-medium">ID Pesanan</th>
                        <th className="py-3 px-3 font-medium">Produk &amp; Pembeli</th>
                        <th className="py-3 px-3 font-medium text-right">Harga Neto</th>
                        <th className="py-3 px-3 font-medium text-right">Komisi</th>
                        <th className="py-3 px-3 font-medium text-right">Hak Sanggar</th>
                        <th className="py-3 px-3 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 px-4 text-center text-stone-500">
                            Belum ada pesanan untuk sanggar Anda pada filter ini.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => {
                          const commissionAmt = Math.round((order.netPrice * order.commissionRate) / 100);
                          const sellerNet = order.netPrice - commissionAmt;
                          return (
                            <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3 px-4 font-mono tabular-nums font-medium text-stone-900 whitespace-nowrap">
                                {order.orderCode}
                                <span className="block text-[11px] font-sans font-normal text-stone-400">
                                  {order.createdAt}
                                </span>
                              </td>
                              <td className="py-3 px-3 min-w-[200px]">
                                <p className="font-medium text-stone-900 truncate max-w-[220px]">{order.productName}</p>
                                <p className="text-[11px] text-stone-500 truncate max-w-[240px]">
                                  {order.buyerName}
                                  {order.shippingAddress ? ` · ${order.shippingAddress}` : ''}
                                </p>
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-900 whitespace-nowrap">
                                {formatRupiah(order.netPrice)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-500 whitespace-nowrap">
                                {order.commissionRate}% ({formatRupiah(commissionAmt)})
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-stone-900 whitespace-nowrap">
                                {formatRupiah(sellerNet)}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`font-medium ${
                                    order.status === 'payout_settled' || order.status === 'completed'
                                      ? 'text-emerald-700'
                                      : order.status === 'paid' || order.status === 'processing'
                                      ? 'text-amber-700'
                                      : 'text-stone-700'
                                  }`}
                                >
                                  {getOrderStatusLabel(order.status)}
                                </span>
                                {order.trackingNumber && (
                                  <span className="block text-[10px] font-mono text-stone-400">
                                    Resi: {order.trackingNumber}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                {order.status === 'awaiting_payment' && (
                                  <span className="text-[11px] text-stone-400">Menunggu verifikasi admin</span>
                                )}
                                {order.status === 'paid' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrder(order.id, { status: 'processing' });
                                      showToast(`${order.orderCode} mulai diproses oleh sanggar.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-[11px] font-medium cursor-pointer"
                                  >
                                    Proses Pesanan
                                  </button>
                                )}
                                {order.status === 'processing' && (
                                  <div className="inline-flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={trackingInputs[order.id] ?? ''}
                                      onChange={e =>
                                        setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))
                                      }
                                      placeholder="No. Resi"
                                      className="w-28 bg-white border border-stone-200 rounded-md px-2 py-1 text-[11px] font-mono outline-none focus:border-[#10423E]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const resi = (
                                          trackingInputs[order.id] || `KRG-${Date.now().toString().slice(-4)}`
                                        ).trim();
                                        onUpdateOrder(order.id, { status: 'shipped', trackingNumber: resi });
                                        showToast(`${order.orderCode} dikirim (Resi: ${resi}).`);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Truck size={12} />
                                      <span>Kirim Barang</span>
                                    </button>
                                  </div>
                                )}
                                {order.status === 'shipped' && (
                                  <span className="text-[11px] text-stone-500">Dalam pengiriman</span>
                                )}
                                {order.status === 'completed' && (
                                  <span className="text-[11px] text-emerald-700 font-medium">Menunggu pencairan</span>
                                )}
                                {order.status === 'payout_settled' && (
                                  <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                                    <Check size={12} /> Lunas
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. PROFIL SANGGAR */}
          {activeSection === 'store' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">Profil Sanggar &amp; Kemitraan</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Informasi resmi UMKM perajin yang terdaftar dan disetujui oleh Admin Platform Balla AR.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-200">
                <div className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{storeName}</p>
                    <p className="text-xs text-stone-500 mt-0.5">Budaya {storeCulture} · Sulawesi Selatan</p>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 size={14} /> Mitra Terverifikasi
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-stone-500">Nama Perajin / Pemilik</p>
                    <p className="font-medium text-stone-900 mt-0.5">
                      {storeProfile?.applicantName || googleUser?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">Email Terhubung</p>
                    <p className="font-medium text-stone-900 mt-0.5">
                      {storeProfile?.applicantEmail || googleUser?.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">No. WhatsApp Workshop</p>
                    <p className="font-mono tabular-nums font-medium text-stone-900 mt-0.5">
                      {storeProfile?.whatsapp || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500">Skema Komisi Platform</p>
                    <p className="font-mono tabular-nums font-medium text-stone-900 mt-0.5">
                      {commissionRate}% per transaksi selesai
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-stone-500">Alamat Workshop / Sanggar</p>
                    <p className="font-medium text-stone-900 mt-0.5">{storeProfile?.address || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-stone-500">Deskripsi &amp; Spesialisasi Karya</p>
                    <p className="text-stone-700 mt-0.5 leading-relaxed">{storeProfile?.bio || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
