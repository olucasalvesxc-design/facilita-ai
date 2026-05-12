import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0252520614';

if (getApps().length === 0) {
  initializeApp({ projectId: PROJECT_ID });
}

const auth = getAuth();
const db = getFirestore();

const TARGET_EMAIL = process.argv[2] || 'olucasalveszx@gmail.com';

async function makeAdmin(email: string) {
  console.log(`Buscando usuário com email: ${email}`);

  const user = await auth.getUserByEmail(email);
  console.log(`UID encontrado: ${user.uid}`);

  await db.collection('admins').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || '',
    createdAt: FieldValue.serverTimestamp(),
  });

  await db.collection('users').doc(user.uid).update({
    role: 'admin',
  });

  console.log(`✅ ${email} agora é ADMIN (UID: ${user.uid})`);
}

makeAdmin(TARGET_EMAIL).catch(console.error);
