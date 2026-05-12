import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let adminApp: App;
if (getApps().length === 0) {
  adminApp = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0252520614' });
} else {
  adminApp = getApps()[0];
}
const firestore = getFirestore(adminApp);

const PRO_PRODUCT_ID = process.env.KIRVANO_PRO_PRODUCT_ID || 'a9e4a8e1-a4c3-43de-933e-21cff8f3f8a3';
const VERIFIED_PRODUCT_ID = process.env.KIRVANO_VERIFIED_PRODUCT_ID || 'b76e028d-396a-4393-87fb-6c77c0dd71a1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const token = req.headers['x-kirvano-token'] || req.headers['authorization'];
  const expectedSecret = process.env.KIRVANO_WEBHOOK_SECRET;
  if (expectedSecret && token !== expectedSecret) {
    console.warn('Webhook negado: Token inválido.');
    return res.status(401).send('Unauthorized');
  }

  const payload = req.body;
  console.log('Kirvano Webhook:', JSON.stringify(payload, null, 2));

  try {
    const eventType = payload.event || payload.type;
    const status = payload.status || payload.data?.status;
    const externalId = payload.external_id || payload.data?.external_id;
    const productId = payload.product?.id || payload.data?.product_id;

    if (eventType === 'order.approved' || status === 'approved' || status === 'paid') {
      if (!externalId) return res.status(200).send('No external_id');

      const updates: Record<string, any> = { subscriptionUpdatedAt: FieldValue.serverTimestamp() };
      const proUpdates: Record<string, any> = { lastActiveAt: FieldValue.serverTimestamp() };

      if (productId === PRO_PRODUCT_ID || !productId) {
        updates.role = 'pro';
        updates.hasActiveSubscription = true;
        proUpdates.subscriptionStatus = 'active';
        proUpdates.subscriptionType = 'monthly_pro';
      }

      if (productId === VERIFIED_PRODUCT_ID) {
        updates.isVerified = true;
        proUpdates.isVerified = true;
        proUpdates.verificationStatus = 'verified';
      }

      await firestore.collection('users').doc(externalId).update(updates);

      const proRef = firestore.collection('professionals').doc(externalId);
      const proDoc = await proRef.get();
      if (proDoc.exists) await proRef.update(proUpdates);

      return res.status(200).send('Success');
    }

    res.status(200).send('Event ignored');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
}
