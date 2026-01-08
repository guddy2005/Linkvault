import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, userId, customAlias, password } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Generate or use custom slug
    let slug = customAlias || nanoid(6);

    // Check if slug already exists
    const existingLink = await adminDb.collection('links').doc(slug).get();
    if (existingLink.exists) {
      if (customAlias) {
        return NextResponse.json({ error: 'Alias already taken' }, { status: 400 });
      }
      // Generate a new slug
      slug = nanoid(8);
    }

    // Create the link
    await adminDb.collection('links').doc(slug).set({
      originalUrl: url,
      shortSlug: slug,
      customAlias: customAlias || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      clickCount: 0,
      userId: userId || 'guest',
      isPasswordProtected: !!password,
      password: password || null,
      isActive: true,
      expiresAt: userId ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({ slug, success: true });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
