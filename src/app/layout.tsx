import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hotspot Map',
  description: 'Full-screen Google Map with place search.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
