'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

declare global {
  interface Window {
    PusherPushNotifications: {
      Client: new (options: { instanceId: string | undefined }) => {
        start: () => Promise<void>;
        addDeviceInterest: (interest: string) => Promise<void>;
      };
    };
  }
}

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [isPusherSupported, setIsPusherSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [os, setOs] = useState<string>('');
  const [browser, setBrowser] = useState<string>('');

  useEffect(() => {
    // Detect OS
    const userAgent = navigator.userAgent;
    let detectedOS = 'Unknown';
    if (userAgent.indexOf('Win') !== -1) detectedOS = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) detectedOS = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) detectedOS = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) detectedOS = 'Android';
    else if (userAgent.indexOf('like Mac') !== -1) detectedOS = 'iOS';
    setOs(detectedOS);

    // Detect Browser
    let detectedBrowser = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1) detectedBrowser = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) detectedBrowser = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1) detectedBrowser = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) detectedBrowser = 'Edge';
    else if (userAgent.indexOf('Opera') !== -1) detectedBrowser = 'Opera';
    setBrowser(detectedBrowser);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      setIsPusherSupported(false);
      return;
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPusherSupported(true);
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            subscription.unsubscribe().then(() => {
              console.log('Unsubscribed from existing push notification.');
              initializeBeams();
            });
          } else {
            initializeBeams();
          }
        });
      });
    }
  }, []);

  function initializeBeams() {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => {
        const beamsClient = new window.PusherPushNotifications.Client({
          instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID,
        });

        beamsClient
          .start()
          .then(() => beamsClient.addDeviceInterest('hello'))
          .then(() => {
            console.log('Successfully registered and subscribed!');
            setIsSubscribed(true);
          })
          .catch(console.error);
      })
      .catch((err) => console.error('Service worker registration failed', err));
  }

  function sendTestNotification() {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test desktop notification!',
          icon: '/favicon.ico',
        });
        toast.success('Desktop notification sent successfully!');
      } else {
        toast.error('Notification permission denied');
      }
    });
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 flex justify-end w-full">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Pusher Beams Notification Tester</h1>
        <div className="text-center">
          <p className="text-lg">
            OS: <span className="font-bold">{os}</span> | Browser:{' '}
            <span className="font-bold">{browser}</span>
          </p>
          <p className="text-lg">
            Web push notifications are
            <span
              className={`font-bold ${
                isPusherSupported ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPusherSupported ? ' supported' : ' not supported'}
            </span>{' '}
            in this browser.
          </p>
          {isSubscribed && (
            <p className="text-lg text-green-500 font-bold">
              Yayy! The notification is working!
            </p>
          )}
          {isPusherSupported && (
            <button
              onClick={sendTestNotification}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send Test Notification
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
