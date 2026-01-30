import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Root layout for Swipe to Dine
 *
 * Provides:
 * - Global styles
 * - Metadata for SEO
 * - Mobile viewport settings
 */

export const metadata: Metadata = {
  title: 'Swipe to Dine - Find Your Perfect Restaurant',
  description:
    'A fun, swipe-based way for couples, families, or friends to decide where to eat together.',
  keywords: [
    'restaurant finder',
    'where to eat',
    'dining decision',
    'swipe to dine',
    'restaurant picker',
  ],
  authors: [{ name: 'Swipe to Dine' }],
  openGraph: {
    title: 'Swipe to Dine',
    description: 'Swipe right on your next meal',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 antialiased">
        <main className="relative min-h-screen">{children}</main>
      </body>
    </html>
  );
}
