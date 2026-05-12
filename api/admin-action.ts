import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const db = admin.firestore();
const ADMIN_EMAIL = 'olucasalveszx@gmail.com';

async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.email?.toLowerCase() === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !(await verifyAdmin(token))) {
    return res.status(403).json({ error: 'Não autorizado' });
  }

  const { action, proId } = req.body;

  try {
    if (action === 'approve') {
      const batch = db.batch();
      batch.update(db.doc(`professionals/${proId}`), {
        verificationStatus: 'verified',
        professionalStatus: 'active',
        isVerified: true,
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(db.doc(`users/${proId}`), {
        isVerified: true,
        role: 'pro',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await batch.commit();
      return res.json({ ok: true });
    }

    if (action === 'reject') {
      const batch = db.batch();
      batch.update(db.doc(`professionals/${proId}`), {
        verificationStatus: 'rejected',
        professionalStatus: 'suspended',
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(db.doc(`users/${proId}`), {
        isVerified: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await batch.commit();
      return res.json({ ok: true });
    }

    if (action === 'revoke_unpaid') {
      const usersSnap = await db.collection('users').where('role', '==', 'pro').get();
      let count = 0;
      const batch = db.batch();
      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        if (data.email?.toLowerCase() === ADMIN_EMAIL) continue;
        const proSnap = await db.doc(`professionals/${userDoc.id}`).get();
        const hasPaid = proSnap.exists && proSnap.data()?.subscriptionStatus === 'active';
        if (hasPaid) continue;
        batch.update(db.doc(`users/${userDoc.id}`), { role: 'client', hasActiveSubscription: false });
        if (proSnap.exists) {
          batch.update(db.doc(`professionals/${userDoc.id}`), { subscriptionStatus: 'inactive', professionalStatus: 'suspended', isActive: false });
        }
        count++;
      }
      await batch.commit();
      return res.json({ ok: true, count });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
