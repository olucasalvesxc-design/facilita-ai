import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY!;
      const formattedKey = privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey;
      const projectId = 'facilita-ai-fa770';
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: formattedKey }),
        projectId,
      });
    }
    const db = admin.firestore();
    const snap = await db.collection('users').limit(1).get();
    res.json({ ok: true, connected: true, userCount: snap.size });
  } catch (e: any) {
    res.status(500).json({ error: e.message, code: e.code });
  }
}
