import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return;
  try {
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { recipientId, title, body, data } = req.body as {
    recipientId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  };

  if (!recipientId || !title) return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return res.status(200).json({ skipped: 'no_config' });

  try {
    initAdmin();
    const db = getFirestore();
    const userSnap = await db.collection('users').doc(recipientId).get();
    const fcmToken: string | undefined = userSnap.data()?.fcmToken;

    if (!fcmToken) return res.status(200).json({ skipped: 'no_token' });

    await getMessaging().send({
      token: fcmToken,
      notification: { title, body },
      data: data ?? {},
      webpush: {
        notification: {
          title,
          body,
          icon: '/logo1.png',
          badge: '/logo1.png',
        },
        fcmOptions: { link: '/' },
      },
    });

    return res.status(200).json({ sent: true });
  } catch (err: any) {
    console.error('FCM error:', err?.message);
    return res.status(200).json({ error: err?.message });
  }
}
