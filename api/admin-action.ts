import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

let _initialized = false;

function initFirebase() {
  if (_initialized) return;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) throw new Error('FIREBASE_PRIVATE_KEY não definida');

  const formattedKey = privateKey.includes('\\n')
    ? privateKey.replace(/\\n/g, '\n')
    : privateKey;

  const projectId = 'gen-lang-client-0252520614';
  const databaseId = 'ai-studio-0ab7346e-f08e-4124-904f-eb67451d0ece';
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    }),
    projectId,
  });
  admin.firestore().settings({ databaseId });
  _initialized = true;
}

const ADMIN_EMAIL = 'olucasalveszx@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    initFirebase();
  } catch (e: any) {
    console.error('Firebase init error:', e.message);
    return res.status(500).json({ error: `Erro init: ${e.message}` });
  }

  const db = admin.firestore();
  const ts = admin.firestore.FieldValue.serverTimestamp();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(403).json({ error: 'Token não fornecido' });

  let isAdmin = false;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    isAdmin = decoded.email?.toLowerCase() === ADMIN_EMAIL;
  } catch (e) {
    console.error('verifyIdToken error:', e);
    return res.status(403).json({ error: 'Token inválido' });
  }

  if (!isAdmin) return res.status(403).json({ error: 'Não autorizado' });

  const { action, proId } = req.body;

  try {
    if (action === 'approve') {
      await db.doc(`professionals/${proId}`).set({ verificationStatus: 'verified', professionalStatus: 'active', isVerified: true, isActive: true, updatedAt: ts }, { merge: true });
      await db.doc(`users/${proId}`).set({ isVerified: true, role: 'pro', updatedAt: ts }, { merge: true });
      return res.json({ ok: true });
    }

    if (action === 'reject') {
      await db.doc(`professionals/${proId}`).set({ verificationStatus: 'rejected', professionalStatus: 'suspended', isActive: false, updatedAt: ts }, { merge: true });
      await db.doc(`users/${proId}`).set({ isVerified: false, updatedAt: ts }, { merge: true });
      return res.json({ ok: true });
    }

    if (action === 'delete_pro') {
      await db.doc(`professionals/${proId}`).delete();
      return res.json({ ok: true });
    }

    if (action === 'set_pro') {
      await db.doc(`users/${proId}`).set({ role: 'pro', hasActiveSubscription: true, isVerified: true, updatedAt: ts }, { merge: true });

      // Pull user data to seed the professional profile if it's missing basic info
      const userSnap = await db.doc(`users/${proId}`).get();
      const userData = userSnap.data() || {};
      const proSnap = await db.doc(`professionals/${proId}`).get();
      const existingPro = proSnap.exists ? proSnap.data() : {};

      await db.doc(`professionals/${proId}`).set({
        id: proId,
        userId: proId,
        name: existingPro?.name || userData.name || 'Profissional',
        photoURL: existingPro?.photoURL || userData.photoURL || '',
        email: userData.email || '',
        whatsapp: existingPro?.whatsapp || userData.whatsapp || '',
        location: existingPro?.location || userData.location || '',
        category: existingPro?.category || 'Outros',
        description: existingPro?.description || userData.bio || '',
        rating: existingPro?.rating ?? 5.0,
        reviewCount: existingPro?.reviewCount ?? 0,
        status: 'online',
        isActive: true,
        isVerified: true,
        professionalStatus: 'active',
        subscriptionStatus: 'active',
        subscriptionType: existingPro?.subscriptionType || 'monthly_pro',
        onboardingCompleted: true,
        updatedAt: ts,
      }, { merge: true });

      return res.json({ ok: true });
    }

    if (action === 'set_client') {
      await db.doc(`users/${proId}`).set({ role: 'client', hasActiveSubscription: false, updatedAt: ts }, { merge: true });
      await db.doc(`professionals/${proId}`).set({ subscriptionStatus: 'inactive', professionalStatus: 'suspended', isActive: false, updatedAt: ts }, { merge: true });
      return res.json({ ok: true });
    }

    if (action === 'delete_user') {
      await db.doc(`users/${proId}`).delete().catch(() => null);
      await db.doc(`professionals/${proId}`).delete().catch(() => null);
      try { await admin.auth().deleteUser(proId); } catch {}
      return res.json({ ok: true });
    }

    if (action === 'revoke_unpaid') {
      const usersSnap = await db.collection('users').where('role', '==', 'pro').get();
      let count = 0;
      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        if (data.email?.toLowerCase() === ADMIN_EMAIL) continue;
        const proSnap = await db.doc(`professionals/${userDoc.id}`).get();
        const hasPaid = proSnap.exists && proSnap.data()?.subscriptionStatus === 'active';
        if (hasPaid) continue;
        await db.doc(`users/${userDoc.id}`).set({ role: 'client', hasActiveSubscription: false }, { merge: true });
        if (proSnap.exists) {
          await db.doc(`professionals/${userDoc.id}`).set({ subscriptionStatus: 'inactive', professionalStatus: 'suspended', isActive: false }, { merge: true });
        }
        count++;
      }
      return res.json({ ok: true, count });
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (e: any) {
    console.error('Admin action error:', action, proId, e);
    return res.status(500).json({ error: e.message || 'Erro interno' });
  }
}
