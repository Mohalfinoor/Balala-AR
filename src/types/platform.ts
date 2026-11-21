export const AUTHORIZED_PLATFORM_ADMIN_EMAIL = 'wirabuanamohalfinoor@gmail.com';

export const isAuthorizedPlatformAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_PLATFORM_ADMIN_EMAIL;
};

export type UserRole = 'user' | 'admin' | 'curator' | 'platform_admin';

export type ProductStatus =
  | 'pending'
  | 'needs_revision'
  | 'in_3d_process'
  | 'approved'
  | 'rejected';

export type CulturalClassification =
  | 'Tradisional'
  | 'Adaptasi Kontemporer'
  | 'Inspirasi Desain';

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  culture: string;
  rating: number;
  description: string;
  philosophy: string;
  status?: ProductStatus;
  glbUrl?: string;
  usdzUrl?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  material?: string;
  sellerUid?: string;
  sellerName?: string;
  sellerEmail?: string;
  revisionNote?: string;
  culturalClassification?: CulturalClassification;
  culturalSource?: string;
}

export interface MerchantApplication {
  id: string;
  applicantUid?: string;
  applicantName: string;
  applicantEmail: string;
  storeName: string;
  culture: string;
  address: string;
  bio: string;
  whatsapp?: string;
  nib?: string;
  commissionRate?: 1 | 2;
  submittedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type PlatformOrderStatus =
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'payout_settled';

export interface PlatformOrder {
  id: string;
  orderCode: string;
  productId: string;
  productName: string;
  productCulture: string;
  productImage: string;
  sellerUid?: string;
  sellerName: string;
  buyerUid?: string;
  buyerName: string;
  buyerPhone?: string;
  shippingAddress?: string;
  notes?: string;
  netPrice: number;
  shippingCost: number;
  commissionRate: 1 | 2;
  gatewayVariableFee: number;
  status: PlatformOrderStatus;
  trackingNumber?: string;
  createdAt: string;
}
