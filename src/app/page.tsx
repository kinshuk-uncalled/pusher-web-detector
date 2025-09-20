"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isPusherSupported, setIsPusherSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      setIsPusherSupported(false);
      return;
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsPusherSupported(true);
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            subscription.unsubscribe().then(() => {
              console.log("Unsubscribed from existing push notification.");
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
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => {
        const beamsClient = new (window as any).PusherPushNotifications.Client({
          instanceId: "d6370761-8bae-4554-bf96-33d74a0a4d66",
        });

        beamsClient.start()
          .then(() => beamsClient.addDeviceInterest("hello"))
          .then(() => {
            console.log("Successfully registered and subscribed!");
            setIsSubscribed(true);
          })
          .catch(console.error);
      })
      .catch(err => console.error("Service worker registration failed", err));
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Pusher Beams Notification Tester</h1>
        <div className="text-center">
          <p className="text-lg">
            Web push notifications are
            <span
              className={`font-bold ${
                isPusherSupported ? "text-green-500" : "text-red-500"
              }`}
            >
              {isPusherSupported ? " supported" : " not supported"}
            </span>
            {" "}in this browser.
          </p>
          {isSubscribed && (
            <p className="text-lg text-green-500 font-bold">
              Yayy! The notification is working!
            </p>
          )}
        </div>
      </main>
    </div>
  );
}