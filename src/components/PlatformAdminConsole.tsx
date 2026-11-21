import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Box,
  Store,
  Table2,
  Receipt,
  Search,
  Check,
  X,
  ArrowLeft,
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogIn,
  LogOut,
  Trash2,
  ExternalLink,
  Send,
  ChevronRight,
  Menu,
  Ruler
} from 'lucide-react';
import Logo from './Logo';
import {
  AUTHORIZED_PLATFORM_ADMIN_EMAIL,
  isAuthorizedPlatformAdmin,
  Product,
  ProductStatus,
  CulturalClassification,
  MerchantApplication,
  PlatformOrder,
  PlatformOrderStatus
} from '../types/platform';

const ModelViewer = 'model-viewer' as any;

type AdminSection = 'overview' | 'review_3d' | 'sellers' | 'catalog' | 'transactions';

interface PlatformAdminConsoleProps {
  googleUser: { name: string; email: string; avatar: string } | null;
  onSignInWithGoogle: () => Promise<void>;
  onLogout?: () => void;
  isGoogleLoading: boolean;
  onExitConsole: () => void;
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProductDirect: (productId: string) => void;
  onOpenAddProduct: () => void;
  applications: MerchantApplication[];
  onUpdateApplication: (appId: string, updates: Partial<MerchantApplication>) => void;
  onAddApplication: (newApp: MerchantApplication) => void;
  orders: PlatformOrder[];
  onUpdateOrder: (orderId: string, updates: Partial<PlatformOrder>) => void;
  onAddOrder: (newOrder: PlatformOrder) => void;
  onPushNotification: (notif: { tag: string; tagColor: string; title: string; desc: string }) => void;
}

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
      return 'Menunggu Review';
    case 'needs_revision':
      return 'Perlu Revisi';
    case 'in_3d_process':
      return 'Proses Model 3D';
    case 'rejected':
      return 'Ditolak';
    case 'approved':
    default:
      return 'Tayang';
  }
};

const getProductStatusColor = (status?: ProductStatus): string => {
  switch (status) {
    case 'pending':
      return 'text-amber-700';
    case 'needs_revision':
      return 'text-amber-600';
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
      return 'Menunggu Pembayaran';
    case 'paid':
      return 'Terbayar (Escrow)';
    case 'processing':
      return 'Diproses Seller';
    case 'shipped':
      return 'Dalam Pengiriman';
    case 'completed':
      return 'Selesai';
    case 'payout_settled':
      return 'Dana Cair';
  }
};

const SECTION_LABELS: Record<AdminSection, string> = {
  overview: 'Ringkasan',
  review_3d: 'Review & 3D',
  sellers: 'Mitra UMKM',
  catalog: 'Katalog Global',
  transactions: 'Transaksi'
};

export default function PlatformAdminConsole({
  googleUser,
  onSignInWithGoogle,
  onLogout,
  isGoogleLoading,
  onExitConsole,
  products,
  onUpdateProduct,
  onDeleteProductDirect,
  onOpenAddProduct,
  applications,
  onUpdateApplication,
  onAddApplication,
  orders,
  onUpdateOrder,
  onAddOrder,
  onPushNotification
}: PlatformAdminConsoleProps) {
  const isAuthorized = isAuthorizedPlatformAdmin(googleUser?.email);

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  // Review & 3D states
  const [reviewFilter, setReviewFilter] = useState<'all' | ProductStatus>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    const queueFirst = products.find(p => p.status && p.status !== 'approved');
    return queueFirst?.id || products[0]?.id || '';
  });

  const activeProduct = useMemo(
    () => products.find(p => p.id === selectedProductId) || products[0] || null,
    [products, selectedProductId]
  );

  const [draftGlbUrl, setDraftGlbUrl] = useState('');
  const [draftUsdzUrl, setDraftUsdzUrl] = useState('');
  const [draftLength, setDraftLength] = useState('');
  const [draftWidth, setDraftWidth] = useState('');
  const [draftHeight, setDraftHeight] = useState('');
  const [draftMaterial, setDraftMaterial] = useState('');
  const [draftClassification, setDraftClassification] = useState<CulturalClassification>('Tradisional');
  const [draftSource, setDraftSource] = useState('');
  const [draftRevisionNote, setDraftRevisionNote] = useState('');
  const [loadedPreviewId, setLoadedPreviewId] = useState<string>('');

  if (activeProduct && loadedPreviewId !== activeProduct.id) {
    setLoadedPreviewId(activeProduct.id);
    setDraftGlbUrl(activeProduct.glbUrl || '');
    setDraftUsdzUrl(activeProduct.usdzUrl || '');
    setDraftLength(activeProduct.dimensions?.length ? String(activeProduct.dimensions.length) : '');
    setDraftWidth(activeProduct.dimensions?.width ? String(activeProduct.dimensions.width) : '');
    setDraftHeight(activeProduct.dimensions?.height ? String(activeProduct.dimensions.height) : '');
    setDraftMaterial(activeProduct.material || '');
    setDraftClassification(activeProduct.culturalClassification || 'Tradisional');
    setDraftSource(activeProduct.culturalSource || '');
    setDraftRevisionNote(activeProduct.revisionNote || '');
  }

  // Sellers states
  const [sellerFilter, setSellerFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sellerSearch, setSellerSearch] = useState('');
  const [showNewSellerForm, setShowNewSellerForm] = useState(false);
  const [newSellerStore, setNewSellerStore] = useState('');
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerEmail, setNewSellerEmail] = useState('');
  const [newSellerCulture, setNewSellerCulture] = useState('Makassar');
  const [newSellerAddress, setNewSellerAddress] = useState('');
  const [newSellerWhatsapp, setNewSellerWhatsapp] = useState('');
  const [newSellerCommission, setNewSellerCommission] = useState<1 | 2>(2);

  // Catalog states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCulture, setCatalogCulture] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Transactions states
  const [defaultCommissionRate, setDefaultCommissionRate] = useState<1 | 2>(2);
  const [simProductId, setSimProductId] = useState(products[0]?.id || '');
  const [simBuyerName, setSimBuyerName] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setFeedbackToast({ type, text });
    setTimeout(() => {
      setFeedbackToast(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Strict Email Gate View
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] text-stone-900 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm bg-white border border-stone-200 rounded-xl p-7 space-y-6">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 shrink-0" />
            <div>
              <p className="text-xs font-medium text-stone-500">Tim BALALA · Akses Terbatas</p>
              <h1 className="text-base font-bold text-stone-900 tracking-tight">Console Admin Platform</h1>
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2 text-xs leading-relaxed text-stone-600">
            <div className="flex items-center gap-1.5 font-semibold text-red-700">
              <Lock size={14} className="shrink-0" />
              <span>Halaman Terkunci</span>
            </div>
            <p>
              Akses hanya diizinkan untuk akun Google{' '}
              <span className="font-mono font-medium text-stone-900">{AUTHORIZED_PLATFORM_ADMIN_EMAIL}</span>.
            </p>
            <p className="text-[11px] text-stone-500">
              Akun saat ini:{' '}
              <span className="font-medium text-stone-800">
                {googleUser ? googleUser.email : 'Belum masuk'}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={isGoogleLoading}
              className="w-full bg-[#10423E] hover:bg-[#0D3633] text-white py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <LogIn size={14} />
              <span>{isGoogleLoading ? 'Memverifikasi...' : 'Masuk dengan Google'}</span>
            </button>
            <button
              type="button"
              onClick={onExitConsole}
              className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Katalog</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Real computed metrics
  const approvedProductsCount = products.filter(p => !p.status || p.status === 'approved').length;
  const arReadyCount = products.filter(p => Boolean(p.glbUrl)).length;
  const queueProducts = products.filter(p => p.status && p.status !== 'approved');
  const pendingReviewCount = products.filter(
    p => p.status === 'pending' || p.status === 'needs_revision' || p.status === 'in_3d_process'
  ).length;

  const approvedSellersCount = applications.filter(a => a.status === 'approved').length;
  const pendingSellersCount = applications.filter(a => a.status === 'pending').length;

  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'payout_settled');
  const totalSalesNet = completedOrders.reduce((sum, o) => sum + o.netPrice, 0);
  const totalGrossCommission = completedOrders.reduce(
    (sum, o) => sum + Math.round((o.netPrice * o.commissionRate) / 100),
    0
  );
  const totalVariableFees = completedOrders.reduce((sum, o) => sum + o.gatewayVariableFee, 0);
  const netCommissionPool = totalGrossCommission - totalVariableFees;
  const activeOrdersCount = orders.filter(
    o =>
      o.status === 'awaiting_payment' ||
      o.status === 'paid' ||
      o.status === 'processing' ||
      o.status === 'shipped'
  ).length;

  const cultureDistribution = ['Toraja', 'Bugis', 'Makassar', 'Mandar'].map(culture => ({
    culture,
    total: products.filter(p => p.culture.toLowerCase() === culture.toLowerCase()).length,
    arReady: products.filter(p => p.culture.toLowerCase() === culture.toLowerCase() && Boolean(p.glbUrl)).length
  }));

  const filteredReviewProducts = products
    .filter(p => {
      const effectiveStatus: ProductStatus = p.status || 'approved';
      const matchesStatus = reviewFilter === 'all' ? true : effectiveStatus === reviewFilter;
      const matchesQuery =
        !reviewSearch.trim() ||
        p.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        p.culture.toLowerCase().includes(reviewSearch.toLowerCase());
      return matchesStatus && matchesQuery;
    })
    .sort((a, b) => {
      const rank = (s?: ProductStatus) => {
        if (s === 'pending') return 0;
        if (s === 'in_3d_process') return 1;
        if (s === 'needs_revision') return 2;
        if (s === 'rejected') return 4;
        return 3;
      };
      return rank(a.status) - rank(b.status);
    });

  const filteredApplications = applications.filter(app => {
    const matchesStatus = sellerFilter === 'all' || app.status === sellerFilter;
    const matchesQuery =
      !sellerSearch.trim() ||
      app.storeName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      app.culture.toLowerCase().includes(sellerSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredCatalog = products.filter(p => {
    const matchesCulture = catalogCulture === 'all' || p.culture.toLowerCase() === catalogCulture.toLowerCase();
    const matchesQuery =
      !catalogSearch.trim() ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.culture.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCulture && matchesQuery;
  });

  const handleLocal3DUpload = (e: React.ChangeEvent<HTMLInputElement>, format: 'glb' | 'usdz') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    if (format === 'glb') {
      setDraftGlbUrl(objectUrl);
      showToast(`File GLB "${file.name}" dimuat ke pratinjau.`);
    } else {
      setDraftUsdzUrl(objectUrl);
      showToast(`File USDZ "${file.name}" dimuat untuk iOS.`);
    }
  };

  const buildDraftUpdates = (nextStatus?: ProductStatus): Partial<Product> => {
    const parsedLength = parseInt(draftLength, 10) || 0;
    const parsedWidth = parseInt(draftWidth, 10) || 0;
    const parsedHeight = parseInt(draftHeight, 10) || 0;
    return {
      ...(nextStatus ? { status: nextStatus } : {}),
      glbUrl: draftGlbUrl.trim() || undefined,
      usdzUrl: draftUsdzUrl.trim() || undefined,
      dimensions:
        parsedLength > 0 && parsedWidth > 0 && parsedHeight > 0
          ? { length: parsedLength, width: parsedWidth, height: parsedHeight }
          : activeProduct?.dimensions,
      material: draftMaterial.trim() || undefined,
      culturalClassification: draftClassification,
      culturalSource: draftSource.trim() || undefined,
      revisionNote: draftRevisionNote.trim() || undefined
    };
  };

  const handleReviewDecision = (decision: ProductStatus) => {
    if (!activeProduct) return;
    if ((decision === 'needs_revision' || decision === 'rejected') && !draftRevisionNote.trim()) {
      showToast('Isi catatan perbaikan atau alasan penolakan terlebih dahulu.', 'warning');
      return;
    }

    onUpdateProduct(activeProduct.id, buildDraftUpdates(decision));

    if (decision === 'approved') {
      onPushNotification({
        tag: 'Publikasi Katalog 3D',
        tagColor: 'teal',
        title: `Tayang di Katalog: ${activeProduct.name}`,
        desc: `Produk "${activeProduct.name}" (${activeProduct.culture}) telah diverifikasi dan diterbitkan ke katalog.`
      });
      showToast(`"${activeProduct.name}" berhasil dipublikasikan.`);
    } else if (decision === 'in_3d_process') {
      onPushNotification({
        tag: 'Workshop 3D',
        tagColor: 'amber',
        title: `Masuk Proses 3D: ${activeProduct.name}`,
        desc: `Produk "${activeProduct.name}" sedang diproses menjadi aset 3D GLB/USDZ.`
      });
      showToast(`"${activeProduct.name}" dipindahkan ke Proses 3D.`);
    } else if (decision === 'needs_revision') {
      onPushNotification({
        tag: 'Perlu Revisi',
        tagColor: 'amber',
        title: `Revisi Diperlukan: ${activeProduct.name}`,
        desc: `Catatan: ${draftRevisionNote.trim()}`
      });
      showToast(`Catatan revisi disimpan untuk "${activeProduct.name}".`, 'warning');
    } else if (decision === 'rejected') {
      onPushNotification({
        tag: 'Pengajuan Ditolak',
        tagColor: 'rose',
        title: `Pengajuan Ditolak: ${activeProduct.name}`,
        desc: `Alasan: ${draftRevisionNote.trim()}`
      });
      showToast(`"${activeProduct.name}" ditolak.`, 'warning');
    }
  };

  const handleCreateManualSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerStore.trim() || !newSellerName.trim() || !newSellerEmail.trim() || !newSellerAddress.trim()) {
      showToast('Lengkapi nama sanggar, perajin, email, dan alamat.', 'warning');
      return;
    }
    const created: MerchantApplication = {
      id: `app-${Date.now()}`,
      storeName: newSellerStore.trim(),
      applicantName: newSellerName.trim(),
      applicantEmail: newSellerEmail.trim().toLowerCase(),
      culture: newSellerCulture,
      address: newSellerAddress.trim(),
      ...(newSellerWhatsapp.trim() ? { whatsapp: newSellerWhatsapp.trim() } : {}),
      bio: `Mitra pengrajin kriya kayu & furnitur tradisi ${newSellerCulture} (${newSellerAddress.trim()}).`,
      commissionRate: newSellerCommission,
      submittedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'approved'
    };
    onAddApplication(created);
    onPushNotification({
      tag: 'Mitra UMKM Baru',
      tagColor: 'teal',
      title: `Mitra Disetujui: ${created.storeName}`,
      desc: `${created.storeName} (${created.culture}) telah didaftarkan & disetujui oleh Admin Platform.`
    });
    setNewSellerStore('');
    setNewSellerName('');
    setNewSellerEmail('');
    setNewSellerAddress('');
    setNewSellerWhatsapp('');
    setShowNewSellerForm(false);
    showToast(`Mitra "${created.storeName}" berhasil ditambahkan.`);
  };

  const handleRecordManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const target = products.find(p => p.id === simProductId) || products[0];
    if (!target) return;
    if (!simBuyerName.trim()) {
      showToast('Masukkan nama pembeli yang sebenarnya.', 'warning');
      return;
    }
    const matchedSeller = applications.find(
      a => a.status === 'approved' && a.culture.toLowerCase() === target.culture.toLowerCase()
    );
    const resolvedSellerName = target.sellerName || matchedSeller?.storeName || `Sanggar ${target.culture}`;
    const resolvedRate: 1 | 2 = matchedSeller?.commissionRate || defaultCommissionRate;
    const netPrice = parsePriceNumber(target.price);
    const newOrder: PlatformOrder = {
      id: `ord-${Date.now()}`,
      orderCode: `BLR-${String(orders.length + 101)}`,
      productId: target.id,
      productName: target.name,
      productCulture: target.culture,
      productImage: target.image,
      sellerUid: target.sellerUid || matchedSeller?.applicantUid,
      sellerName: resolvedSellerName,
      buyerName: simBuyerName.trim(),
      netPrice,
      shippingCost: netPrice > 10000000 ? 0 : 350000,
      commissionRate: resolvedRate,
      gatewayVariableFee: 12000,
      status: 'awaiting_payment',
      createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    onAddOrder(newOrder);
    setSimBuyerName('');
    showToast(`Pesanan ${newOrder.orderCode} berhasil dicatat.`);
  };

  const navItems: { id: AdminSection; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={15} /> },
    { id: 'review_3d', label: 'Review & 3D', icon: <Box size={15} />, count: pendingReviewCount },
    { id: 'sellers', label: 'Mitra UMKM', icon: <Store size={15} />, count: pendingSellersCount },
    { id: 'catalog', label: 'Katalog', icon: <Table2 size={15} />, count: products.length },
    { id: 'transactions', label: 'Transaksi', icon: <Receipt size={15} />, count: orders.length }
  ];

  const openInspectorForProduct = (productId: string) => {
    setSelectedProductId(productId);
    setLoadedPreviewId('');
    setActiveSection('review_3d');
  };

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
          {/* Clean Brand Lockup */}
          <div className="flex items-center justify-between gap-2 px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo className="w-7 h-7 shrink-0" />
              <span className="text-sm font-bold text-[#10423E] tracking-tight truncate">Balla AR</span>
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

          {/* Primary Navigation */}
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

        {/* Bottom Operator Identity & Actions */}
        <div className="p-4 border-t border-stone-200 space-y-3">
          <div className="flex items-center gap-2.5 min-w-0 px-1">
            {googleUser?.avatar ? (
              <img
                src={googleUser.avatar}
                alt={googleUser.name || 'Admin'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#10423E] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {(googleUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-900 truncate">{googleUser?.name}</p>
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
              <span>Lihat Katalog Publik</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 px-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap"
              >
                <LogOut size={13} className="shrink-0" />
                <span>Keluar Akun</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Minimalist Top Bar (56px) */}
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
              <span className="hidden sm:inline whitespace-nowrap">Admin</span>
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

        {/* Minimal Toast Feedback */}
        {feedbackToast && (
          <div className="px-5 sm:px-8 pt-4 max-w-[1140px] w-full mx-auto">
            <div
              className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-3 ${
                feedbackToast.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span className="flex items-center gap-2">
                {feedbackToast.type === 'warning' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <span>{feedbackToast.text}</span>
              </span>
              <button
                type="button"
                onClick={() => setFeedbackToast(null)}
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
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">Ringkasan Operasional</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Status nyata katalog 3D/AR, pengajuan mitra UMKM, dan catatan transaksi Balla AR.
                </p>
              </div>

              {/* Unified Minimalist 4-Metric Bar */}
              <div className="bg-white border border-stone-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Produk Tayang</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">{approvedProductsCount}</p>
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    {products.length} total · {arReadyCount} siap 3D
                  </p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Antrean Review &amp; 3D</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">{pendingReviewCount}</p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('review_3d')}
                    className="text-[11px] font-medium text-[#10423E] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Buka Workshop</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Mitra UMKM Disetujui</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums">{approvedSellersCount}</p>
                  <button
                    type="button"
                    onClick={() => setActiveSection('sellers')}
                    className="text-[11px] font-medium text-[#10423E] hover:underline inline-flex items-center gap-0.5 cursor-pointer tabular-nums"
                  >
                    <span>{pendingSellersCount} menunggu verifikasi</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Komisi Bersih</p>
                  <p className="text-2xl font-bold text-stone-900 tabular-nums font-mono">
                    {formatRupiah(netCommissionPool)}
                  </p>
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    {completedOrders.length} selesai dari {orders.length} pesanan
                  </p>
                </div>
              </div>

              {/* 2-Column Clean Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Kesiapan Katalog per Suku */}
                <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-stone-900">Katalog per Suku</h2>
                      <p className="text-[11px] text-stone-500">Ketersediaan produk dan model 3D GLB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('catalog')}
                      className="text-xs font-medium text-[#10423E] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-stone-500 border-b border-stone-200 bg-stone-50/60">
                          <th className="py-2.5 px-5 font-medium">Suku</th>
                          <th className="py-2.5 px-4 font-medium text-right">Total</th>
                          <th className="py-2.5 px-4 font-medium text-right">Siap 3D</th>
                          <th className="py-2.5 px-5 font-medium text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {cultureDistribution.map(row => (
                          <tr key={row.culture} className="h-11 hover:bg-stone-50/80 transition-colors">
                            <td className="py-2.5 px-5 font-medium text-stone-900">{row.culture}</td>
                            <td className="py-2.5 px-4 text-right tabular-nums text-stone-700">{row.total}</td>
                            <td className="py-2.5 px-4 text-right tabular-nums font-medium text-[#10423E]">
                              {row.arReady}
                            </td>
                            <td className="py-2.5 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setCatalogCulture(row.culture.toLowerCase());
                                  setActiveSection('catalog');
                                }}
                                className="text-xs font-medium text-stone-600 hover:text-[#10423E] cursor-pointer"
                              >
                                Filter
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Antrean Tindak Lanjut */}
                <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-200">
                    <h2 className="text-sm font-semibold text-stone-900">Perlu Tindak Lanjut</h2>
                    <p className="text-[11px] text-stone-500">Produk &amp; pengajuan mitra yang menunggu</p>
                  </div>

                  {queueProducts.length === 0 && pendingSellersCount === 0 ? (
                    <div className="px-5 py-10 text-center space-y-1.5">
                      <CheckCircle2 size={20} className="mx-auto text-emerald-600" />
                      <p className="text-xs font-semibold text-stone-900">Semua antrean bersih</p>
                      <p className="text-[11px] text-stone-500">
                        Tidak ada produk atau mitra yang menunggu verifikasi saat ini.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {queueProducts.slice(0, 4).map(p => (
                        <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {p.culture} · <span className={getProductStatusColor(p.status)}>{getProductStatusLabel(p.status)}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openInspectorForProduct(p.id)}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Tinjau
                          </button>
                        </div>
                      ))}
                      {applications
                        .filter(a => a.status === 'pending')
                        .slice(0, 4)
                        .map(app => (
                          <div key={app.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-900 truncate">{app.storeName}</p>
                              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                                Mitra {app.culture} · {app.applicantName}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveSection('sellers')}
                              className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-[#10423E] cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Verifikasi
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. REVIEW & WORKSHOP 3D */}
          {activeSection === 'review_3d' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">Review Produk &amp; Aset 3D</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Periksa data produk, unggah model GLB/USDZ, sesuaikan dimensi AR, dan publikasikan ke katalog.
                </p>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'pending', label: 'Menunggu' },
                    { id: 'in_3d_process', label: 'Proses 3D' },
                    { id: 'needs_revision', label: 'Revisi' },
                    { id: 'approved', label: 'Tayang' },
                    { id: 'rejected', label: 'Ditolak' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReviewFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                        reviewFilter === tab.id
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
                    value={reviewSearch}
                    onChange={e => setReviewSearch(e.target.value)}
                    placeholder="Cari nama produk atau suku..."
                    className="w-full bg-white border border-stone-200 rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:border-[#10423E]"
                  />
                </div>
              </div>

              {/* Split Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Product List */}
                <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">Daftar Produk</span>
                    <span className="text-[11px] font-mono tabular-nums text-stone-500">
                      {filteredReviewProducts.length} item
                    </span>
                  </div>

                  {filteredReviewProducts.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                      <p>Tidak ada produk pada filter ini.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewFilter('all');
                          setReviewSearch('');
                        }}
                        className="text-[#10423E] font-medium hover:underline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 max-h-[620px] overflow-y-auto">
                      {filteredReviewProducts.map(item => {
                        const isSelected = activeProduct?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(item.id);
                              setLoadedPreviewId('');
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 cursor-pointer ${
                              isSelected ? 'bg-[#10423E]/6' : 'hover:bg-stone-50'
                            }`}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                                {item.culture} ·{' '}
                                <span className={getProductStatusColor(item.status)}>
                                  {getProductStatusLabel(item.status)}
                                </span>
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Product 3D Inspector */}
                <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-6 space-y-6">
                  {!activeProduct ? (
                    <div className="py-16 text-center text-xs text-stone-500">
                      Pilih produk di sebelah kiri untuk membuka Workshop 3D.
                    </div>
                  ) : (
                    <>
                      {/* Inspector Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={activeProduct.image}
                            alt={activeProduct.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] text-stone-500">
                              Suku {activeProduct.culture} ·{' '}
                              <span className="font-mono text-stone-800 tabular-nums">{activeProduct.price}</span> ·{' '}
                              <span className={`font-medium ${getProductStatusColor(activeProduct.status)}`}>
                                {getProductStatusLabel(activeProduct.status)}
                              </span>
                            </p>
                            <h2 className="text-base font-bold text-stone-900 truncate mt-0.5">
                              {activeProduct.name}
                            </h2>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateProduct(activeProduct.id, buildDraftUpdates());
                            showToast(`Draf teknis "${activeProduct.name}" disimpan.`);
                          }}
                          className="px-3.5 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Simpan Draf
                        </button>
                      </div>

                      {/* 3D Preview & Upload Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        <div className="md:col-span-6 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-stone-700">Pratinjau 3D</span>
                            <span className="text-[11px] font-mono text-stone-500">
                              {draftGlbUrl ? 'GLB aktif' : 'Kosong'}
                            </span>
                          </div>
                          <div className="w-full h-64 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
                            {draftGlbUrl ? (
                              <ModelViewer
                                src={draftGlbUrl}
                                ios-src={draftUsdzUrl || undefined}
                                alt={`Pratinjau 3D ${activeProduct.name}`}
                                camera-controls
                                auto-rotate
                                shadow-intensity="1"
                                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                              />
                            ) : (
                              <div className="text-center p-5 space-y-1.5">
                                <Box size={22} className="mx-auto text-stone-400" />
                                <p className="text-xs font-medium text-stone-700">Belum ada file .glb</p>
                                <p className="text-[11px] text-stone-500">
                                  Unggah berkas 3D di sebelah kanan untuk melihat pratinjau.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-6 space-y-4 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-medium text-stone-700">Model GLB (WebXR &amp; Android)</label>
                              <label className="text-[11px] font-medium text-[#10423E] hover:underline cursor-pointer inline-flex items-center gap-1">
                                <Upload size={12} />
                                <span>Pilih .glb</span>
                                <input
                                  type="file"
                                  accept=".glb"
                                  onChange={e => handleLocal3DUpload(e, 'glb')}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={draftGlbUrl}
                              onChange={e => setDraftGlbUrl(e.target.value)}
                              placeholder="Tautan atau file .glb..."
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#10423E]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-medium text-stone-700">Model USDZ (iOS)</label>
                              <label className="text-[11px] font-medium text-[#10423E] hover:underline cursor-pointer inline-flex items-center gap-1">
                                <Upload size={12} />
                                <span>Pilih .usdz</span>
                                <input
                                  type="file"
                                  accept=".usdz"
                                  onChange={e => handleLocal3DUpload(e, 'usdz')}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={draftUsdzUrl}
                              onChange={e => setDraftUsdzUrl(e.target.value)}
                              placeholder="Tautan atau file .usdz..."
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#10423E]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-medium text-stone-700 flex items-center gap-1.5">
                              <Ruler size={13} className="text-stone-400" />
                              <span>Dimensi Fisik (cm)</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-[11px] text-stone-500 block mb-1">Panjang</span>
                                <input
                                  type="number"
                                  value={draftLength}
                                  onChange={e => setDraftLength(e.target.value)}
                                  placeholder="0"
                                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs tabular-nums outline-none focus:border-[#10423E]"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block mb-1">Lebar</span>
                                <input
                                  type="number"
                                  value={draftWidth}
                                  onChange={e => setDraftWidth(e.target.value)}
                                  placeholder="0"
                                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs tabular-nums outline-none focus:border-[#10423E]"
                                />
                              </div>
                              <div>
                                <span className="text-[11px] text-stone-500 block mb-1">Tinggi</span>
                                <input
                                  type="number"
                                  value={draftHeight}
                                  onChange={e => setDraftHeight(e.target.value)}
                                  placeholder="0"
                                  className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs tabular-nums outline-none focus:border-[#10423E]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cultural Traceability */}
                      <div className="pt-5 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-medium text-stone-700 block">Klasifikasi Budaya</label>
                          <select
                            value={draftClassification}
                            onChange={e => setDraftClassification(e.target.value as CulturalClassification)}
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#10423E]"
                          >
                            <option value="Tradisional">Bentuk Tradisional</option>
                            <option value="Adaptasi Kontemporer">Adaptasi Kontemporer</option>
                            <option value="Inspirasi Desain">Inspirasi Desain</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-medium text-stone-700 block">Material &amp; Teknik</label>
                          <input
                            type="text"
                            value={draftMaterial}
                            onChange={e => setDraftMaterial(e.target.value)}
                            placeholder="Contoh: Kayu Jati · Ukir Manual"
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#10423E]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-medium text-stone-700 block">Sumber / Narasumber</label>
                          <input
                            type="text"
                            value={draftSource}
                            onChange={e => setDraftSource(e.target.value)}
                            placeholder="Narasumber sanggar / rujukan"
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#10423E]"
                          />
                        </div>
                      </div>

                      {/* Review Notes & Decision Bar */}
                      <div className="pt-5 border-t border-stone-200 space-y-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
                          <span className={draftGlbUrl ? 'text-emerald-700 font-medium' : ''}>
                            {draftGlbUrl ? '✓ GLB siap' : '○ GLB belum diisi'}
                          </span>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span className={draftUsdzUrl ? 'text-emerald-700 font-medium' : ''}>
                            {draftUsdzUrl ? '✓ USDZ siap' : '○ USDZ opsional'}
                          </span>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span
                            className={
                              parseInt(draftLength, 10) > 0 && parseInt(draftWidth, 10) > 0 && parseInt(draftHeight, 10) > 0
                                ? 'text-emerald-700 font-medium'
                                : 'text-amber-700 font-medium'
                            }
                          >
                            {parseInt(draftLength, 10) > 0 ? '✓ Dimensi lengkap' : '! Dimensi belum lengkap'}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-stone-700">
                            Catatan Peninjauan untuk Seller
                          </label>
                          <textarea
                            rows={2}
                            value={draftRevisionNote}
                            onChange={e => setDraftRevisionNote(e.target.value)}
                            placeholder="Catatan revisi foto, dimensi, atau keterangan budaya..."
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#10423E] resize-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleReviewDecision('rejected')}
                              className="px-3.5 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Tolak
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewDecision('needs_revision')}
                              className="px-3.5 py-2 rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Minta Revisi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewDecision('in_3d_process')}
                              className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Proses 3D
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleReviewDecision('approved')}
                            className="px-4 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Send size={13} />
                            <span>Publikasikan</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. MITRA UMKM */}
          {activeSection === 'sellers' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">Verifikasi Mitra UMKM</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Daftar pengajuan sanggar/perajin dan pengaturan tarif komisi 1–2%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewSellerForm(!showNewSellerForm)}
                  className="px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>{showNewSellerForm ? 'Tutup Form' : 'Daftarkan Mitra'}</span>
                </button>
              </div>

              {showNewSellerForm && (
                <form
                  onSubmit={handleCreateManualSeller}
                  className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 text-xs"
                >
                  <h2 className="text-sm font-semibold text-stone-900">Tambah Mitra Perajin Baru</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Nama Sanggar / UMKM</label>
                      <input
                        type="text"
                        required
                        value={newSellerStore}
                        onChange={e => setNewSellerStore(e.target.value)}
                        placeholder="Nama sanggar atau toko..."
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Nama Pemilik</label>
                      <input
                        type="text"
                        required
                        value={newSellerName}
                        onChange={e => setNewSellerName(e.target.value)}
                        placeholder="Nama lengkap..."
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Email Google</label>
                      <input
                        type="email"
                        required
                        value={newSellerEmail}
                        onChange={e => setNewSellerEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Suku / Budaya</label>
                      <select
                        value={newSellerCulture}
                        onChange={e => setNewSellerCulture(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      >
                        <option value="Toraja">Toraja</option>
                        <option value="Bugis">Bugis</option>
                        <option value="Makassar">Makassar</option>
                        <option value="Mandar">Mandar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Alamat Workshop</label>
                      <input
                        type="text"
                        required
                        value={newSellerAddress}
                        onChange={e => setNewSellerAddress(e.target.value)}
                        placeholder="Kota / Kabupaten"
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">WhatsApp &amp; Komisi</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSellerWhatsapp}
                          onChange={e => setNewSellerWhatsapp(e.target.value)}
                          placeholder="08xx..."
                          className="flex-1 min-w-0 bg-white border border-stone-200 rounded-lg px-3 py-2 tabular-nums outline-none focus:border-[#10423E]"
                        />
                        <select
                          value={newSellerCommission}
                          onChange={e => setNewSellerCommission(Number(e.target.value) as 1 | 2)}
                          className="bg-white border border-stone-200 rounded-lg px-2.5 py-2 font-medium tabular-nums outline-none"
                        >
                          <option value={1}>1%</option>
                          <option value={2}>2%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewSellerForm(false)}
                      className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white font-semibold cursor-pointer"
                    >
                      Simpan &amp; Setujui
                    </button>
                  </div>
                </form>
              )}

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'pending', label: 'Menunggu' },
                    { id: 'approved', label: 'Disetujui' },
                    { id: 'rejected', label: 'Ditolak' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSellerFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                        sellerFilter === tab.id
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={sellerSearch}
                    onChange={e => setSellerSearch(e.target.value)}
                    placeholder="Cari nama sanggar atau email..."
                    className="w-full bg-white border border-stone-200 rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:border-[#10423E]"
                  />
                </div>
              </div>

              {/* Applications List */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                {filteredApplications.length === 0 ? (
                  <div className="p-12 text-center space-y-1.5">
                    <Store size={20} className="mx-auto text-stone-300" />
                    <p className="text-xs font-semibold text-stone-900">Belum ada pengajuan mitra</p>
                    <p className="text-[11px] text-stone-500">
                      Pendaftaran UMKM nyata dari menu profil atau input manual akan tampil di sini.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {filteredApplications.map(app => (
                      <div key={app.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-sm text-stone-900">{app.storeName}</span>
                            <span aria-hidden="true" className="text-stone-300">·</span>
                            <span className="text-stone-500">Budaya {app.culture}</span>
                            <span aria-hidden="true" className="text-stone-300">·</span>
                            <span
                              className={`font-medium ${
                                app.status === 'approved'
                                  ? 'text-emerald-700'
                                  : app.status === 'rejected'
                                  ? 'text-red-600'
                                  : 'text-amber-700'
                              }`}
                            >
                              {app.status === 'approved'
                                ? 'Disetujui'
                                : app.status === 'rejected'
                                ? 'Ditolak'
                                : 'Menunggu Verifikasi'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600">
                            {app.applicantName} · <span className="font-mono text-[11px]">{app.applicantEmail}</span> · {app.address}
                            {app.whatsapp ? ` · WA ${app.whatsapp}` : ''}
                          </p>
                          {app.bio && <p className="text-[11px] text-stone-500 line-clamp-2">{app.bio}</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <label className="text-[11px] text-stone-500 flex items-center gap-1.5 mr-1">
                            <span>Komisi</span>
                            <select
                              value={app.commissionRate || 2}
                              onChange={e => {
                                const rate = Number(e.target.value) as 1 | 2;
                                onUpdateApplication(app.id, { commissionRate: rate });
                                showToast(`Komisi "${app.storeName}" diubah ke ${rate}%.`);
                              }}
                              className="bg-white border border-stone-200 rounded-md px-2 py-1 text-xs font-medium text-stone-800 tabular-nums outline-none"
                            >
                              <option value={1}>1%</option>
                              <option value={2}>2%</option>
                            </select>
                          </label>

                          {app.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateApplication(app.id, { status: 'approved' });
                                onPushNotification({
                                  tag: 'Verifikasi Mitra',
                                  tagColor: 'teal',
                                  title: `Mitra Disetujui: ${app.storeName}`,
                                  desc: `Pendaftaran ${app.storeName} telah disetujui.`
                                });
                                showToast(`Mitra "${app.storeName}" disetujui.`);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Setujui
                            </button>
                          )}

                          {app.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateApplication(app.id, { status: 'rejected' });
                                showToast(`Pengajuan "${app.storeName}" ditolak.`, 'warning');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Tolak
                            </button>
                          )}

                          {app.status !== 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateApplication(app.id, { status: 'pending' });
                                showToast(`"${app.storeName}" dikembalikan ke antrean.`);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer whitespace-nowrap"
                            >
                              Tinjau Ulang
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. KATALOG GLOBAL */}
          {activeSection === 'catalog' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">Katalog &amp; Aset Global</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Inventaris produk, dimensi fisik, kesiapan berkas 3D/AR, dan status tayang.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto no-scrollbar">
                  {['all', 'Toraja', 'Bugis', 'Makassar', 'Mandar'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCatalogCulture(cat.toLowerCase())}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                        catalogCulture === cat.toLowerCase()
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {cat === 'all' ? 'Semua' : cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="Cari nama produk..."
                    className="w-full bg-white border border-stone-200 rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:border-[#10423E]"
                  />
                </div>
              </div>

              {/* Minimalist Data Grid */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50/70 border-b border-stone-200 text-left text-stone-500">
                        <th className="py-3 px-4 font-medium">Produk</th>
                        <th className="py-3 px-3 font-medium">Suku</th>
                        <th className="py-3 px-3 font-medium text-right">Harga</th>
                        <th className="py-3 px-3 font-medium text-right">Dimensi (cm)</th>
                        <th className="py-3 px-3 font-medium">Aset 3D</th>
                        <th className="py-3 px-3 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredCatalog.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-stone-500">
                            Tidak ada produk yang cocok dengan filter ini.
                          </td>
                        </tr>
                      ) : (
                        filteredCatalog.map(prod => (
                          <tr key={prod.id} className="h-12 hover:bg-stone-50/70 transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2.5 min-w-[180px]">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-md object-cover border border-stone-200 shrink-0 bg-stone-100"
                                />
                                <span className="font-medium text-stone-900 truncate max-w-[200px]">{prod.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">{prod.culture}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-900 whitespace-nowrap">
                              {prod.price}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-stone-500 whitespace-nowrap">
                              {prod.dimensions
                                ? `${prod.dimensions.length}×${prod.dimensions.width}×${prod.dimensions.height}`
                                : '—'}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={prod.glbUrl ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                                {prod.glbUrl ? (prod.usdzUrl ? 'GLB + USDZ' : 'GLB') : 'Belum ada'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`font-medium ${getProductStatusColor(prod.status)}`}>
                                {getProductStatusLabel(prod.status)}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => openInspectorForProduct(prod.id)}
                                  className="text-xs font-medium text-[#10423E] hover:underline cursor-pointer"
                                >
                                  Edit 3D
                                </button>
                                <span aria-hidden="true" className="text-stone-200">|</span>
                                {prod.status === 'approved' || !prod.status ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProduct(prod.id, { status: 'in_3d_process' });
                                      showToast(`"${prod.name}" diarsipkan ke antrean 3D.`);
                                    }}
                                    className="text-xs font-medium text-stone-500 hover:text-stone-900 cursor-pointer"
                                  >
                                    Arsipkan
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProduct(prod.id, { status: 'approved' });
                                      showToast(`"${prod.name}" ditayangkan.`);
                                    }}
                                    className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
                                  >
                                    Tayangkan
                                  </button>
                                )}
                                <span aria-hidden="true" className="text-stone-200">|</span>
                                {confirmDeleteId === prod.id ? (
                                  <span className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onDeleteProductDirect(prod.id);
                                        setConfirmDeleteId(null);
                                        showToast(`"${prod.name}" dihapus.`, 'warning');
                                      }}
                                      className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                                    >
                                      Hapus
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
                                    className="text-stone-400 hover:text-red-600 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. TRANSAKSI & KOMISI */}
          {activeSection === 'transactions' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">Transaksi &amp; Komisi</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Pencatatan pesanan nyata, verifikasi pembayaran, dan pencairan hak mitra (komisi 1–2%).
                  </p>
                </div>

                {/* Default Tariff Selector */}
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs shrink-0 self-start sm:self-auto">
                  <span className="px-2 text-stone-500 text-[11px]">Tarif Default</span>
                  <button
                    type="button"
                    onClick={() => setDefaultCommissionRate(1)}
                    className={`px-3 py-1 rounded-md font-medium tabular-nums cursor-pointer transition-colors ${
                      defaultCommissionRate === 1 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    1%
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultCommissionRate(2)}
                    className={`px-3 py-1 rounded-md font-medium tabular-nums cursor-pointer transition-colors ${
                      defaultCommissionRate === 2 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    2%
                  </button>
                </div>
              </div>

              {/* Unified Minimalist 4-Metric Financial Bar */}
              <div className="bg-white border border-stone-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Penjualan Selesai</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-stone-900">{formatRupiah(totalSalesNet)}</p>
                  <p className="text-[11px] text-stone-500 tabular-nums">{completedOrders.length} transaksi</p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Komisi Kotor</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-stone-900">{formatRupiah(totalGrossCommission)}</p>
                  <p className="text-[11px] text-stone-500 tabular-nums">
                    Biaya gateway: {formatRupiah(totalVariableFees)}
                  </p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Komisi Bersih</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-stone-900">
                    {formatRupiah(netCommissionPool)}
                  </p>
                  <p className="text-[11px] text-stone-500">Setelah biaya transaksi</p>
                </div>

                <div className="p-5 space-y-1">
                  <p className="text-xs text-stone-500">Total Pesanan</p>
                  <p className="text-lg font-bold font-mono tabular-nums text-stone-900">{orders.length}</p>
                  <p className="text-[11px] text-stone-500 tabular-nums">{activeOrdersCount} aktif diproses</p>
                </div>
              </div>

              {/* Quick Manual Order Form */}
              <form
                onSubmit={handleRecordManualOrder}
                className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-end gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <label className="block font-medium text-stone-700 mb-1">Produk Dipesan</label>
                  <select
                    value={simProductId}
                    onChange={e => setSimProductId(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-60">
                  <label className="block font-medium text-stone-700 mb-1">Nama Pembeli</label>
                  <input
                    type="text"
                    required
                    value={simBuyerName}
                    onChange={e => setSimBuyerName(e.target.value)}
                    placeholder="Nama pembeli..."
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-[#10423E]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus size={14} />
                  <span>Catat Pesanan</span>
                </button>
              </form>

              {/* Orders Table */}
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50/70 border-b border-stone-200 text-left text-stone-500">
                        <th className="py-3 px-4 font-medium">ID</th>
                        <th className="py-3 px-3 font-medium">Produk &amp; Mitra</th>
                        <th className="py-3 px-3 font-medium text-right">Harga Neto</th>
                        <th className="py-3 px-3 font-medium text-right">Komisi</th>
                        <th className="py-3 px-3 font-medium text-right">Hak Seller</th>
                        <th className="py-3 px-3 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 px-4 text-center text-stone-500">
                            Belum ada transaksi masuk. Pesanan dari Keranjang Belanja atau input manual akan muncul di sini.
                          </td>
                        </tr>
                      ) : (
                        orders.map(order => {
                          const commissionAmt = Math.round((order.netPrice * order.commissionRate) / 100);
                          const sellerEntitlement = order.netPrice - commissionAmt;
                          return (
                            <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                              <td className="py-3 px-4 font-mono tabular-nums font-medium text-stone-900 whitespace-nowrap">
                                {order.orderCode}
                                <span className="block text-[11px] font-sans font-normal text-stone-400">
                                  {order.createdAt}
                                </span>
                              </td>
                              <td className="py-3 px-3 min-w-[180px]">
                                <p className="font-medium text-stone-900 truncate max-w-[200px]">{order.productName}</p>
                                <p className="text-[11px] text-stone-500">
                                  {order.sellerName} · {order.buyerName}
                                </p>
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-900 whitespace-nowrap">
                                {formatRupiah(order.netPrice)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700 whitespace-nowrap">
                                {formatRupiah(commissionAmt)} ({order.commissionRate}%)
                              </td>
                              <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-900 font-medium whitespace-nowrap">
                                {formatRupiah(sellerEntitlement)}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`font-medium ${
                                    order.status === 'payout_settled' || order.status === 'completed'
                                      ? 'text-emerald-700'
                                      : order.status === 'awaiting_payment'
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrder(order.id, { status: 'paid' });
                                      showToast(`Pembayaran ${order.orderCode} terkonfirmasi.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#10423E] hover:bg-[#0D3633] text-white text-[11px] font-medium cursor-pointer"
                                  >
                                    Verifikasi Bayar
                                  </button>
                                )}
                                {order.status === 'paid' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrder(order.id, { status: 'processing' });
                                      showToast(`${order.orderCode} diteruskan ke seller.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-[11px] font-medium cursor-pointer"
                                  >
                                    Teruskan Seller
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
                                      className="w-24 bg-white border border-stone-200 rounded-md px-2 py-1 text-[11px] font-mono outline-none focus:border-[#10423E]"
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
                                      className="px-3 py-1.5 rounded-lg bg-[#10423E] text-white text-[11px] font-medium cursor-pointer"
                                    >
                                      Kirim
                                    </button>
                                  </div>
                                )}
                                {order.status === 'shipped' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrder(order.id, { status: 'completed' });
                                      showToast(`${order.orderCode} selesai.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-[11px] font-medium cursor-pointer"
                                  >
                                    Selesaikan
                                  </button>
                                )}
                                {order.status === 'completed' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrder(order.id, { status: 'payout_settled' });
                                      showToast(`Dana ${formatRupiah(sellerEntitlement)} dicairkan.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-800 text-[11px] font-medium cursor-pointer"
                                  >
                                    Cairkan Dana
                                  </button>
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
        </main>
      </div>
    </div>
  );
}
