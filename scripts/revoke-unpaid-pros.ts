/**
 * Desativa contas Pro que não possuem assinatura ativa confirmada pela Kirvano.
 * Critério: professionals com subscriptionStatus != 'active' OU users com role='pro'
 * mas sem hasActiveSubscription=true.
 *
 * Execução: npx tsx scripts/revoke-unpaid-pros.ts
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

if (getApps().length === 0) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0252520614' });
}
const db = getFirestore();

async function revokeUnpaidPros() {
  // Busca todos os users com role='pro' mas sem assinatura ativa
  const usersSnap = await db.collection('users')
    .where('role', '==', 'pro')
    .where('hasActiveSubscription', '!=', true)
    .get();

  if (usersSnap.empty) {
    console.log('Nenhuma conta Pro sem pagamento encontrada.');
    return;
  }

  const batch = db.batch();
  let count = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    console.log(`Desativando: ${data.email || userDoc.id}`);

    // Reverte role para client
    batch.update(db.collection('users').doc(userDoc.id), {
      role: 'client',
      hasActiveSubscription: false,
      subscriptionUpdatedAt: FieldValue.serverTimestamp(),
    });

    // Desativa professional profile se existir
    const proRef = db.collection('professionals').doc(userDoc.id);
    const proSnap = await proRef.get();
    if (proSnap.exists) {
      batch.update(proRef, {
        subscriptionStatus: 'inactive',
        professionalStatus: 'suspended',
        isActive: false,
      });
    }

    count++;
  }

  await batch.commit();
  console.log(`✅ ${count} conta(s) Pro desativada(s) por falta de pagamento.`);
}

revokeUnpaidPros().catch(console.error);
