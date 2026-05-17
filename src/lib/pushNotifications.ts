import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Get this from: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (!supported) return null;
  const { initializeApp, getApps } = await import('firebase/app');
  const apps = getApps();
  const app = apps[0];
  if (!app) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export async function requestPushPermission(): Promise<string | null> {
  try {
    if (!VAPID_KEY) return null;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    // Register firebase messaging SW explicitly if not already registered
    let swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token && auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { fcmToken: token });
    }

    return token;
  } catch (err) {
    console.warn('[Push] requestPushPermission failed:', err);
    return null;
  }
}

export async function sendPushNotification(payload: {
  recipientId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-critical — Firestore notification still written
  }
}
