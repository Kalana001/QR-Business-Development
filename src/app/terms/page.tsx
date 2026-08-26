import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-xs gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Terms of Service
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-xs text-slate-400 font-mono">Last Updated: August 26, 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Business Account & Service Usage</h2>
            <p>
              QR Business Catalog provides a digital catalog management and QR scanning platform for business owners.
              By creating an account, you agree to provide accurate business details and operate within your selected subscription plan limits.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Content Ownership & Catalog Data</h2>
            <p>
              You retain full ownership of all business images, logos, titles, pricing, and catalog descriptions uploaded to your account.
              You agree not to upload fraudulent, deceptive, or illegal content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Subscription & Expiration Policy</h2>
            <p>
              Subscription plans offer specified catalog item and category limits. Upon subscription expiration, business catalog data is safely preserved;
              however, public catalog visibility will automatically default to standard free tier limits until renewed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Platform Availability & Support</h2>
            <p>
              While we strive for maximum platform uptime, service availability is provided on an &quot;as is&quot; basis.
              Support requests can be initiated via our official WhatsApp business channel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
