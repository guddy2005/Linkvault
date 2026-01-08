import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  increment,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ShortLink, UserProfile, LinkClick } from '@/types';
import { nanoid } from 'nanoid';

// ============================================
// USER OPERATIONS
// ============================================

export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', uid);
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    totalXP: 0,
    level: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as UserProfile;
};

export const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void
) => {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile);
  });
};

// ============================================
// LINK OPERATIONS
// ============================================

const generateUniqueSlug = async (): Promise<string> => {
  let slug = nanoid(6);
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existingLink = await getDoc(doc(db, 'links', slug));
    if (!existingLink.exists()) {
      return slug;
    }
    slug = nanoid(6);
    attempts++;
  }
  return nanoid(8);
};

export const isAliasAvailable = async (alias: string): Promise<boolean> => {
  const linkRef = doc(db, 'links', alias);
  const linkSnap = await getDoc(linkRef);
  return !linkSnap.exists();
};

export const createShortLink = async (
  originalUrl: string,
  userId: string,
  options?: {
    customAlias?: string;
    password?: string;
    expiresAt?: Date;
  }
): Promise<ShortLink> => {
  const slug = options?.customAlias || (await generateUniqueSlug());

  if (options?.customAlias) {
    const available = await isAliasAvailable(options.customAlias);
    if (!available) {
      throw new Error('This custom alias is already taken');
    }
  }

  const linkRef = doc(db, 'links', slug);
  const linkData: Omit<ShortLink, 'id'> = {
    originalUrl,
    shortSlug: slug,
    customAlias: options?.customAlias,
    createdAt: new Date(),
    updatedAt: new Date(),
    clickCount: 0,
    userId,
    isPasswordProtected: !!options?.password,
    password: options?.password,
    expiresAt: options?.expiresAt,
    isActive: true,
  };

  await setDoc(linkRef, {
    ...linkData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: options?.expiresAt ? Timestamp.fromDate(options.expiresAt) : null,
  });

  return { id: slug, ...linkData };
};

export const getUserLinks = async (userId: string): Promise<ShortLink[]> => {
  const linksQuery = query(
    collection(db, 'links'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(linksQuery);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate(),
    } as ShortLink;
  });
};

export const subscribeToUserLinks = (
  userId: string,
  callback: (links: ShortLink[]) => void
) => {
  const linksQuery = query(
    collection(db, 'links'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(linksQuery, (snapshot) => {
    const links = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate(),
      } as ShortLink;
    });
    callback(links);
  });
};

export const getLinkBySlug = async (slug: string): Promise<ShortLink | null> => {
  const linkRef = doc(db, 'links', slug);
  const linkSnap = await getDoc(linkRef);

  if (!linkSnap.exists()) return null;

  const data = linkSnap.data();
  return {
    id: linkSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate(),
  } as ShortLink;
};

export const deleteLink = async (slug: string): Promise<void> => {
  const linkRef = doc(db, 'links', slug);
  await deleteDoc(linkRef);
};

// ============================================
// CLICK TRACKING WITH ATOMIC XP INCREMENT
// ============================================

/**
 * CRITICAL FUNCTION: Records a click and increments XP atomically
 * Uses Firestore Transaction to ensure consistency
 */
export const recordClickAndIncrementXP = async (
  slug: string,
  clickData: {
    userAgent: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    referrer: string | null;
  }
): Promise<{ success: boolean; destinationUrl: string | null }> => {
  const linkRef = doc(db, 'links', slug);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const linkDoc = await transaction.get(linkRef);

      if (!linkDoc.exists()) {
        throw new Error('Link not found');
      }

      const linkData = linkDoc.data();

      if (!linkData.isActive) {
        throw new Error('Link is inactive');
      }

      if (linkData.expiresAt && linkData.expiresAt.toDate() < new Date()) {
        throw new Error('Link has expired');
      }

      const userId = linkData.userId;
      
      // Only update XP for non-guest links
      if (userId !== 'guest') {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists()) {
          transaction.update(userRef, {
            totalXP: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
      }

      transaction.update(linkRef, {
        clickCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      const clickRef = doc(collection(db, 'links', slug, 'clicks'));
      transaction.set(clickRef, {
        timestamp: serverTimestamp(),
        userAgent: clickData.userAgent,
        deviceType: clickData.deviceType,
        referrer: clickData.referrer,
      });

      return linkData.originalUrl;
    });

    return { success: true, destinationUrl: result };
  } catch (error) {
    console.error('Error recording click:', error);
    return { success: false, destinationUrl: null };
  }
};

// ============================================
// ANALYTICS & GUEST OPERATIONS
// ============================================

export const getRecentClicks = async (
  slug: string,
  limitCount: number = 20
): Promise<LinkClick[]> => {
  const clicksQuery = query(
    collection(db, 'links', slug, 'clicks'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(clicksQuery);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      linkId: slug,
      timestamp: data.timestamp?.toDate() || new Date(),
      userAgent: data.userAgent,
      deviceType: data.deviceType,
      referrer: data.referrer,
    } as LinkClick;
  });
};

export const getUserStats = async (userId: string) => {
  const links = await getUserLinks(userId);
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const topLink = links.reduce(
    (top, link) => (link.clickCount > (top?.clickCount || 0) ? link : top),
    null as ShortLink | null
  );

  return {
    totalLinks: links.length,
    totalClicks,
    topLink,
  };
};

export const createGuestLink = async (originalUrl: string): Promise<string> => {
  const slug = await generateUniqueSlug();
  const linkRef = doc(db, 'links', slug);

  await setDoc(linkRef, {
    originalUrl,
    shortSlug: slug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    clickCount: 0,
    userId: 'guest',
    isPasswordProtected: false,
    isActive: true,
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  });

  return slug;
};
