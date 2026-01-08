import { redirect, notFound } from "next/navigation";
import { adminDb } from "@/config/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getDeviceType } from "@/lib/utils";

interface RedirectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string; ua?: string }>;
}

async function recordClickAndGetDestination(
  slug: string,
  userAgent: string,
  referrer: string,
): Promise<string | null> {
  try {
    const linkRef = adminDb.collection("links").doc(slug);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) {
      console.log(`Link not found: ${slug}`);
      return null;
    }

    const linkData = linkDoc.data();
    if (!linkData) {
      console.log(`Link data is empty: ${slug}`);
      return null;
    }

    // Check if link is active
    if (!linkData.isActive) {
      console.log(`Link is inactive: ${slug}`);
      return null;
    }

    // Check expiration
    if (linkData.expiresAt && linkData.expiresAt.toDate() < new Date()) {
      console.log(`Link has expired: ${slug}`);
      return null;
    }

    const deviceType = getDeviceType(userAgent);
    const batch = adminDb.batch();

    // Increment click count on link
    batch.update(linkRef, {
      clickCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Increment XP for non-guest users
    if (linkData.userId && linkData.userId !== "guest") {
      const userRef = adminDb.collection("users").doc(linkData.userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        batch.update(userRef, {
          totalXP: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    // Record click in subcollection
    const clickRef = linkRef.collection("clicks").doc();
    batch.set(clickRef, {
      timestamp: FieldValue.serverTimestamp(),
      userAgent: userAgent ? userAgent.substring(0, 500) : "unknown",
      deviceType,
      referrer: referrer ? referrer.substring(0, 500) : null,
    });

    await batch.commit();
    console.log(`Click recorded successfully for: ${slug}`);

    return linkData.originalUrl;
  } catch (error) {
    console.error("Error in redirect:", error);
    // Even if tracking fails, try to get the destination URL
    try {
      const linkRef = adminDb.collection("links").doc(slug);
      const linkDoc = await linkRef.get();
      if (linkDoc.exists) {
        const data = linkDoc.data();
        return data?.originalUrl || null;
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
    return null;
  }
}

export default async function RedirectPage({
  params,
  searchParams,
}: RedirectPageProps) {
  // Await params and searchParams (required in Next.js 14+)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { slug } = resolvedParams;
  const userAgent = resolvedSearchParams.ua || "";
  const referrer = resolvedSearchParams.ref || "";

  console.log(`Processing redirect for slug: ${slug}`);

  const destinationUrl = await recordClickAndGetDestination(
    slug,
    userAgent,
    referrer,
  );

  if (!destinationUrl) {
    notFound();
  }

  redirect(destinationUrl);
}
