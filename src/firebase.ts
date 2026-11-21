import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { MerchantApplication, PlatformOrder, Product } from './types/platform';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Custom signIn helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google: ', error);
    throw error;
  }
};

export const subscribeAuthState = (callback: (user: FirebaseUser | null) => void) =>
  onAuthStateChanged(auth, callback);

export const logout = () => signOut(auth);

const sanitizeDocId = (id: string) => {
  const clean = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return (clean || `doc-${Date.now()}`).slice(0, 128);
};

const formatTimestampDisplay = (val: unknown, fallback?: string): string => {
  if (val instanceof Timestamp) {
    return val.toDate().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  if (typeof val === 'string' && val.trim()) {
    return val;
  }
  return fallback || new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// --- 1. Merchant Applications Firestore Operations ---
const mapMerchantAppDoc = (d: any): MerchantApplication => {
  const data = d.data() as any;
  return {
    id: data.id || d.id,
    applicantUid: data.applicantUid,
    applicantName: data.applicantName || '',
    applicantEmail: data.applicantEmail || '',
    storeName: data.storeName || '',
    culture: data.culture || 'Toraja',
    address: data.address || '',
    bio: data.bio || '',
    whatsapp: data.whatsapp,
    commissionRate: data.commissionRate === 1 ? 1 : 2,
    submittedAt: data.submittedAt || formatTimestampDisplay(data.createdAt),
    status: data.status || 'pending'
  };
};

export function subscribeMerchantApplications(
  isAdmin: boolean,
  uid: string | null,
  onData: (apps: MerchantApplication[]) => void,
  userEmail?: string | null
) {
  const path = 'merchantApplications';
  if (!uid) {
    onData([]);
    return () => {};
  }

  if (isAdmin) {
    return onSnapshot(
      collection(db, path),
      snapshot => {
        const byId = new Map<string, MerchantApplication>();
        snapshot.docs.map(mapMerchantAppDoc).forEach(a => byId.set(a.id, a));
        onData(Array.from(byId.values()));
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  let byUidList: MerchantApplication[] = [];
  let byEmailList: MerchantApplication[] = [];

  const emitMerged = () => {
    const byId = new Map<string, MerchantApplication>();
    byUidList.forEach(a => byId.set(a.id, a));
    byEmailList.forEach(a => byId.set(a.id, a));
    onData(Array.from(byId.values()));
  };

  const unsubUid = onSnapshot(
    query(collection(db, path), where('applicantUid', '==', uid)),
    snapshot => {
      byUidList = snapshot.docs.map(mapMerchantAppDoc);
      emitMerged();
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  let unsubEmail = () => {};
  const normalizedEmail = userEmail?.trim().toLowerCase();
  if (normalizedEmail) {
    unsubEmail = onSnapshot(
      query(collection(db, path), where('applicantEmail', '==', normalizedEmail)),
      snapshot => {
        byEmailList = snapshot.docs.map(mapMerchantAppDoc);
        emitMerged();
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  return () => {
    unsubUid();
    unsubEmail();
  };
}

export async function saveMerchantApplicationToDb(appData: MerchantApplication) {
  const path = 'merchantApplications';
  const docId = sanitizeDocId(appData.id);
  const currentUid = auth.currentUser?.uid || appData.applicantUid;
  if (!currentUid) return;

  const normalizedCulture = ['Toraja', 'Bugis', 'Makassar', 'Mandar'].includes(appData.culture)
    ? appData.culture
    : 'Toraja';
  const normalizedSubmittedAt = (appData.submittedAt || formatTimestampDisplay(null)).slice(0, 40);

  try {
    const docRef = doc(db, path, docId);
    const snap = await getDocFromServer(docRef).catch(() => null);

    if (snap && snap.exists()) {
      const updatePayload: Record<string, any> = {
        storeName: appData.storeName.slice(0, 140),
        culture: normalizedCulture,
        address: appData.address.slice(0, 250),
        bio: (appData.bio || '').slice(0, 600),
        submittedAt: normalizedSubmittedAt,
        status: appData.status,
        updatedAt: serverTimestamp()
      };
      if (appData.whatsapp && appData.whatsapp.trim()) {
        updatePayload.whatsapp = appData.whatsapp.trim().slice(0, 30);
      }
      await updateDoc(docRef, updatePayload);
      return;
    }

    const createPayload: Record<string, any> = {
      id: docId,
      applicantUid: currentUid.slice(0, 128),
      applicantName: appData.applicantName.slice(0, 120),
      applicantEmail: appData.applicantEmail.trim().toLowerCase().slice(0, 160),
      storeName: appData.storeName.slice(0, 140),
      culture: normalizedCulture,
      address: appData.address.slice(0, 250),
      bio: (appData.bio || '').slice(0, 600),
      status: appData.status,
      commissionRate: appData.commissionRate === 1 ? 1 : 2,
      submittedAt: normalizedSubmittedAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (appData.whatsapp && appData.whatsapp.trim()) {
      createPayload.whatsapp = appData.whatsapp.trim().slice(0, 30);
    }

    await setDoc(docRef, createPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${docId}`);
  }
}

export async function updateMerchantApplicationInDb(
  appId: string,
  updates: Partial<MerchantApplication>
) {
  const path = 'merchantApplications';
  const docId = sanitizeDocId(appId);
  const payload: Record<string, any> = {
    updatedAt: serverTimestamp()
  };
  if (updates.status) payload.status = updates.status;
  if (updates.commissionRate === 1 || updates.commissionRate === 2) {
    payload.commissionRate = updates.commissionRate;
  }
  if (typeof updates.storeName === 'string') payload.storeName = updates.storeName.slice(0, 140);
  if (typeof updates.culture === 'string' && ['Toraja', 'Bugis', 'Makassar', 'Mandar'].includes(updates.culture)) {
    payload.culture = updates.culture;
  }
  if (typeof updates.address === 'string') payload.address = updates.address.slice(0, 250);
  if (typeof updates.bio === 'string') payload.bio = updates.bio.slice(0, 600);
  if (typeof updates.whatsapp === 'string') payload.whatsapp = updates.whatsapp.slice(0, 30);

  try {
    await updateDoc(doc(db, path, docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${docId}`);
  }
}

// --- 2. Catalog Products Firestore Operations ---
export function subscribeCatalogProducts(
  isAdmin: boolean,
  uid: string | null,
  onData: (products: Product[]) => void
) {
  const path = 'catalogProducts';

  const mapDoc = (d: any): Product => {
    const data = d.data();
    return {
      id: data.id || d.id,
      name: data.name || '',
      price: data.price || 'Rp 0',
      image: data.image || '',
      culture: data.culture || 'Toraja',
      rating: typeof data.rating === 'number' ? data.rating : 5.0,
      description: data.description || '',
      philosophy: data.philosophy || '',
      status: data.status || 'approved',
      glbUrl: data.glbUrl,
      usdzUrl: data.usdzUrl,
      dimensions: data.dimensions,
      material: data.material,
      sellerUid: data.sellerUid,
      sellerName: data.sellerName,
      revisionNote: data.revisionNote,
      culturalClassification: data.culturalClassification,
      culturalSource: data.culturalSource
    };
  };

  if (isAdmin) {
    return onSnapshot(
      collection(db, path),
      snapshot => {
        const byId = new Map<string, Product>();
        snapshot.docs.map(mapDoc).forEach(p => byId.set(p.id, p));
        onData(Array.from(byId.values()));
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  let approvedList: Product[] = [];
  let myList: Product[] = [];

  const emitMerged = () => {
    const byId = new Map<string, Product>();
    approvedList.forEach(p => byId.set(p.id, p));
    myList.forEach(p => byId.set(p.id, p));
    onData(Array.from(byId.values()));
  };

  const unsubApproved = onSnapshot(
    query(collection(db, path), where('status', '==', 'approved')),
    snapshot => {
      approvedList = snapshot.docs.map(mapDoc);
      emitMerged();
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  let unsubMine = () => {};
  if (uid) {
    unsubMine = onSnapshot(
      query(collection(db, path), where('sellerUid', '==', uid)),
      snapshot => {
        myList = snapshot.docs.map(mapDoc);
        emitMerged();
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  return () => {
    unsubApproved();
    unsubMine();
  };
}

const buildProductFirestorePayload = (prod: Product, isNew: boolean): Record<string, any> => {
  const docId = sanitizeDocId(prod.id);
  const sellerUid = (prod.sellerUid || auth.currentUser?.uid || 'platform').slice(0, 128);
  const payload: Record<string, any> = {
    id: docId,
    name: prod.name.slice(0, 140),
    price: prod.price.slice(0, 40),
    image: (prod.image || '').slice(0, 599000),
    culture: prod.culture.slice(0, 40),
    rating: typeof prod.rating === 'number' ? Math.min(5, Math.max(0, prod.rating)) : 5,
    description: (prod.description || '').slice(0, 1500),
    philosophy: (prod.philosophy || '').slice(0, 1500),
    status: prod.status || 'approved',
    sellerUid,
    updatedAt: serverTimestamp()
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
  }
  if (prod.glbUrl && prod.glbUrl.trim()) payload.glbUrl = prod.glbUrl.trim().slice(0, 2000);
  if (prod.usdzUrl && prod.usdzUrl.trim()) payload.usdzUrl = prod.usdzUrl.trim().slice(0, 2000);
  if (
    prod.dimensions &&
    typeof prod.dimensions.length === 'number' &&
    typeof prod.dimensions.width === 'number' &&
    typeof prod.dimensions.height === 'number'
  ) {
    payload.dimensions = {
      length: prod.dimensions.length,
      width: prod.dimensions.width,
      height: prod.dimensions.height
    };
  }
  if (prod.material && prod.material.trim()) payload.material = prod.material.trim().slice(0, 140);
  if (prod.sellerName && prod.sellerName.trim()) payload.sellerName = prod.sellerName.trim().slice(0, 140);
  if (prod.revisionNote && prod.revisionNote.trim()) payload.revisionNote = prod.revisionNote.trim().slice(0, 600);
  if (prod.culturalClassification) payload.culturalClassification = prod.culturalClassification;
  if (prod.culturalSource && prod.culturalSource.trim()) {
    payload.culturalSource = prod.culturalSource.trim().slice(0, 240);
  }

  return payload;
};

export async function saveCatalogProductToDb(prod: Product) {
  const path = 'catalogProducts';
  const docId = sanitizeDocId(prod.id);
  if (!auth.currentUser?.uid) return;
  const payload = buildProductFirestorePayload(prod, true);

  try {
    await setDoc(doc(db, path, docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${docId}`);
  }
}

export async function upsertCatalogProductInDb(mergedProduct: Product) {
  const path = 'catalogProducts';
  const docId = sanitizeDocId(mergedProduct.id);
  if (!auth.currentUser?.uid) return;

  try {
    const ref = doc(db, path, docId);
    const snap = await getDocFromServer(ref).catch(() => null);
    if (snap && snap.exists()) {
      const existingData = snap.data() as any;
      const updatePayload = buildProductFirestorePayload(
        {
          ...mergedProduct,
          sellerUid: existingData.sellerUid,
          rating: typeof existingData.rating === 'number' ? existingData.rating : mergedProduct.rating
        },
        false
      );
      await updateDoc(ref, updatePayload);
    } else {
      const createPayload = buildProductFirestorePayload(mergedProduct, true);
      await setDoc(ref, createPayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${docId}`);
  }
}

export async function deleteCatalogProductInDb(productId: string) {
  const path = 'catalogProducts';
  const docId = sanitizeDocId(productId);
  if (!auth.currentUser?.uid) return;
  try {
    await deleteDoc(doc(db, path, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${docId}`);
  }
}

// --- 3. Platform Orders Firestore Operations ---
const mapPlatformOrderDoc = (d: any): PlatformOrder => {
  const data = d.data() as any;
  return {
    id: data.id || d.id,
    orderCode: data.orderCode || '',
    productId: data.productId || '',
    productName: data.productName || '',
    productCulture: data.productCulture || '',
    productImage: data.productImage || '',
    sellerUid: data.sellerUid,
    sellerName: data.sellerName || '',
    buyerUid: data.buyerUid,
    buyerName: data.buyerName || '',
    buyerPhone: data.buyerPhone,
    shippingAddress: data.shippingAddress,
    notes: data.notes,
    netPrice: typeof data.netPrice === 'number' ? data.netPrice : 0,
    shippingCost: typeof data.shippingCost === 'number' ? data.shippingCost : 0,
    commissionRate: data.commissionRate === 1 ? 1 : 2,
    gatewayVariableFee: typeof data.gatewayVariableFee === 'number' ? data.gatewayVariableFee : 12000,
    status: data.status || 'awaiting_payment',
    trackingNumber: data.trackingNumber,
    createdAt: formatTimestampDisplay(data.createdAt)
  };
};

export function subscribePlatformOrders(
  isAdmin: boolean,
  uid: string | null,
  onData: (orders: PlatformOrder[]) => void
) {
  const path = 'platformOrders';
  if (!uid) {
    onData([]);
    return () => {};
  }

  if (isAdmin) {
    return onSnapshot(
      collection(db, path),
      snapshot => {
        const byId = new Map<string, PlatformOrder>();
        snapshot.docs.map(mapPlatformOrderDoc).forEach(o => byId.set(o.id, o));
        onData(Array.from(byId.values()));
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  let buyerOrders: PlatformOrder[] = [];
  let sellerOrders: PlatformOrder[] = [];

  const emitMerged = () => {
    const byId = new Map<string, PlatformOrder>();
    buyerOrders.forEach(o => byId.set(o.id, o));
    sellerOrders.forEach(o => byId.set(o.id, o));
    onData(Array.from(byId.values()));
  };

  const unsubBuyer = onSnapshot(
    query(collection(db, path), where('buyerUid', '==', uid)),
    snapshot => {
      buyerOrders = snapshot.docs.map(mapPlatformOrderDoc);
      emitMerged();
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  const unsubSeller = onSnapshot(
    query(collection(db, path), where('sellerUid', '==', uid)),
    snapshot => {
      sellerOrders = snapshot.docs.map(mapPlatformOrderDoc);
      emitMerged();
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return () => {
    unsubBuyer();
    unsubSeller();
  };
}

export async function savePlatformOrderToDb(order: PlatformOrder) {
  const path = 'platformOrders';
  const docId = sanitizeDocId(order.id);
  const currentUid = auth.currentUser?.uid || order.buyerUid;
  if (!currentUid) return;

  const payload: Record<string, any> = {
    id: docId,
    orderCode: order.orderCode.slice(0, 40),
    productId: sanitizeDocId(order.productId),
    productName: order.productName.slice(0, 140),
    productCulture: order.productCulture.slice(0, 40),
    productImage: (order.productImage || '').slice(0, 599000),
    sellerName: order.sellerName.slice(0, 140),
    buyerUid: currentUid.slice(0, 128),
    buyerName: order.buyerName.slice(0, 140),
    netPrice: Number(order.netPrice) || 0,
    shippingCost: Number(order.shippingCost) || 0,
    commissionRate: order.commissionRate === 1 ? 1 : 2,
    gatewayVariableFee: Number(order.gatewayVariableFee) || 12000,
    status: order.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  if (order.sellerUid && order.sellerUid.trim()) {
    payload.sellerUid = order.sellerUid.trim().slice(0, 128);
  }
  if (order.buyerPhone && order.buyerPhone.trim()) payload.buyerPhone = order.buyerPhone.trim().slice(0, 30);
  if (order.shippingAddress && order.shippingAddress.trim()) {
    payload.shippingAddress = order.shippingAddress.trim().slice(0, 300);
  }
  if (order.notes && order.notes.trim()) payload.notes = order.notes.trim().slice(0, 300);
  if (order.trackingNumber && order.trackingNumber.trim()) {
    payload.trackingNumber = order.trackingNumber.trim().slice(0, 80);
  }

  try {
    await setDoc(doc(db, path, docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${docId}`);
  }
}

export async function updatePlatformOrderInDb(orderId: string, updates: Partial<PlatformOrder>) {
  const path = 'platformOrders';
  const docId = sanitizeDocId(orderId);
  if (!auth.currentUser?.uid) return;

  const payload: Record<string, any> = {
    updatedAt: serverTimestamp()
  };
  if (updates.status) payload.status = updates.status;
  if (typeof updates.trackingNumber === 'string' && updates.trackingNumber.trim()) {
    payload.trackingNumber = updates.trackingNumber.trim().slice(0, 80);
  }

  try {
    await updateDoc(doc(db, path, docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${docId}`);
  }
}
