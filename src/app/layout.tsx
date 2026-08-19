import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Business Catalog — Multi-tenant Digital Catalogs',
  description: 'Create beautiful digital catalogs for restaurants, bookshops, salons, and businesses accessible via instant QR code scan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
