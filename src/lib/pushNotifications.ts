import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (!supported) return null;
  const { getApps } = await import('firebase/app');
  const app = getApps()[0];
  if (!app) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

// Wait for an INSTALLING or WAITING SW to become active.
// If no update is pending, returns immediately (existing active SW is used).
async function waitForNewSWActivation(reg: ServiceWorkerRegistration): Promise<void> {
  const sw = reg.installing || reg.waiting;
  if (!sw) return;
  return Promise.race([
    new Promise<void>(resolve => {
      sw.addEventListener('statechange', function handler() {
        if (sw.state === 'activated') {
          sw.removeEventListener('statechange', handler);
          resolve();
        }
      });
    }),
    // Safety timeout — if SW never activates, don't hang forever
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('SW activation timeout')), 8000)
    ),
  ]);
}

export async function requestPushPermission(): Promise<string | null> {
  try {
    if (!VAPID_KEY) return null;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    // Register/update sw.js (FCM-capable) and wait for the new version to activate
    const swReg = await navigator.serviceWorker.register('/sw.js');
    await waitForNewSWActivation(swReg);

    // Clear any stale push subscription so getToken creates a fresh FCM one
    const oldSub = await swReg.pushManager.getSubscription();
    if (oldSub) await oldSub.unsubscribe().catch(() => {});

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token && auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { fcmToken: token });
    }

    return token || null;
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
    // Non-critical
  }
}
