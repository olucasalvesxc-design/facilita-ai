import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return;
  try {
    initializeApp({ credential: cert(JSON.parse(raw)) });
  } catch (e) {
    console.error('Failed to init Firebase Admin:', e);
  }
}

// Map Kirvano product IDs to plan keys
const PLAN_MAP: Record<string, 'start' | 'pro' | 'ultra'> = {
  [process.env.KIRVANO_PRODUCT_START || 'start']: 'start',
  [process.env.KIRVANO_PRODUCT_PRO || process.env.KIRVANO_PRO_PRODUCT_ID || 'pro']: 'pro',
  [process.env.KIRVANO_PRODUCT_ULTRA || 'ultra']: 'ultra',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify Kirvano secret token
  const secret = process.env.KIRVANO_WEBHOOK_SECRET;
  if (secret) {
    const incoming = req.headers['x-kirvano-signature'] || req.headers['authorization'];
    if (incoming !== secret && incoming !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(200).json({ skipped: 'no_config' });
  }

  try {
    initAdmin();
    const db = getFirestore();

    const body = req.body as any;

    // Kirvano payload reference: https://docs.kirvano.com/webhooks
    const status: string = body.status ?? body.payment_status ?? '';
    const customerEmail: string = (body.customer?.email ?? body.email ?? '').toLowerCase().trim();
    const productId: string = body.product?.id ?? body.product_id ?? '';

    if (!customerEmail) {
      return res.status(400).json({ error: 'Missing customer email' });
    }

    // Only process approved/completed payments
    if (!['approved', 'paid', 'completed', 'active'].includes(status.toLowerCase())) {
      return res.status(200).json({ ignored: `status=${status}` });
    }

    // Resolve plan from product ID, fallback to pro
    const plan: 'start' | 'pro' | 'ultra' = PLAN_MAP[productId] ?? 'pro';

    // Calculate expiry: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Find user by email
    const usersSnap = await db.collection('users')
      .where('email', '==', customerEmail)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      console.warn('No user found for email:', customerEmail);
      return res.status(200).json({ skipped: 'user_not_found', email: customerEmail });
    }

    const userId = usersSnap.docs[0].id;

    // Update professional document (id == userId)
    const proRef = db.collection('professionals').doc(userId);
    const proSnap = await proRef.get();

    if (!proSnap.exists) {
      console.warn('No professional document for uid:', userId);
      return res.status(200).json({ skipped: 'pro_not_found', userId });
    }

    await proRef.update({
      subscriptionType: plan,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: expiresAt,
      updatedAt: new Date(),
    });

    // Send Firestore notification to user
    await db.collection('notifications').add({
      userId,
      title: '🎉 Assinatura Ativada!',
      type: 'subscription',
      message: `Seu Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} foi ativado com sucesso.`,
      time: new Date().toISOString(),
      read: false,
      createdAt: new Date(),
    });

    console.log(`Plan ${plan} activated for user ${userId} (${customerEmail})`);
    return res.status(200).json({ ok: true, userId, plan });
  } catch (err: any) {
    console.error('Kirvano webhook error:', err?.message);
    return res.status(500).json({ error: err?.message });
  }
}
