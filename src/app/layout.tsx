import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pusher Beams Detector',
  description: 'A tool to test Pusher Beams push notifications support',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Script
            src="https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js"
            strategy="beforeInteractive"
          />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
