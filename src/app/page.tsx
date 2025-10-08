'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faWindows, faApple, faLinux, faAndroid, faChrome, faFirefox, faSafari, faEdge } from '@fortawesome/free-brands-svg-icons';

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
  const [mounted, setMounted] = useState(false);
  const [isPusherSupported, setIsPusherSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [os, setOs] = useState<string>('');
  const [browser, setBrowser] = useState<string>('');
  const [osIcon, setOsIcon] = useState(faDesktop);
  const [browserIcon, setBrowserIcon] = useState(faGlobe);

  useEffect(() => {
    setMounted(true);
    const userAgent = navigator.userAgent;
    let detectedOS = 'Unknown';
    if (userAgent.indexOf('iPad') !== -1) detectedOS = 'iPadOS';
    else if (userAgent.indexOf('iPhone') !== -1) detectedOS = 'iOS';
    else if (userAgent.indexOf('iPod') !== -1) detectedOS = 'iOS';
    else if (userAgent.indexOf('Win') !== -1) detectedOS = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) detectedOS = 'macOS';
    else if (userAgent.indexOf('Linux') !== -1) detectedOS = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) detectedOS = 'Android';
    setOs(detectedOS);

    // Detect Browser
    let detectedBrowser = 'Unknown';
    if (userAgent.indexOf('Chrome') !== -1) detectedBrowser = 'Chrome';
    else if (userAgent.indexOf('Firefox') !== -1) detectedBrowser = 'Firefox';
    else if (userAgent.indexOf('Safari') !== -1) detectedBrowser = 'Safari';
    else if (userAgent.indexOf('Edge') !== -1) detectedBrowser = 'Edge';
    else if (userAgent.indexOf('Opera') !== -1) detectedBrowser = 'Opera';
    setBrowser(detectedBrowser);

    let osIcon = faDesktop;
    if (detectedOS === 'Windows') osIcon = faWindows;
    else if (['macOS', 'iOS', 'iPadOS'].includes(detectedOS)) osIcon = faApple;
    else if (detectedOS === 'Linux') osIcon = faLinux;
    else if (detectedOS === 'Android') osIcon = faAndroid;
    setOsIcon(osIcon);

    let browserIcon = faGlobe;
    if (detectedBrowser === 'Chrome') browserIcon = faChrome;
    else if (detectedBrowser === 'Firefox') browserIcon = faFirefox;
    else if (detectedBrowser === 'Safari') browserIcon = faSafari;
    else if (detectedBrowser === 'Edge') browserIcon = faEdge;
    setBrowserIcon(browserIcon);

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
      <div className="row-start-1 flex justify-end w-full">
        <Button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          variant="outline"
          className="cursor-pointer"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Pusher Beams Notification Tester</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={osIcon} className="w-4 h-4" /> OS: <span className="font-bold">{os}</span>
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={browserIcon} className="w-4 h-4" /> Browser: <span className="font-bold">{browser}</span>
              </span>
            </p>
            <p className="text-lg">
              Web push notifications are{' '}
              <Badge className={isPusherSupported ? 'bg-green-500 text-white' : ''} variant={isPusherSupported ? 'default' : 'destructive'}>
                {isPusherSupported ? 'Supported' : 'Not Supported'}
              </Badge>{' '}
              in this browser.
            </p>
            {isPusherSupported && (
              <p className="text-lg">
                Subscription status:{' '}
                <Badge className="bg-green-500 text-white" variant="default">
                  {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </Badge>
              </p>
            )}
            {isPusherSupported && (
              <Button
                onClick={sendTestNotification}
                className={`w-full cursor-pointer mt-4 ${!mounted && 'invisible'}`}
              >
                Send Test Notification
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
