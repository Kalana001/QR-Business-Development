import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPolicyPage() {
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
            <Lock className="w-4 h-4" /> Privacy Policy
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-mono">Last Updated: August 26, 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect business account information provided during registration (business name, email, phone, logo, address)
              and catalog items created by business owners.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Catalog Analytics & Scan Traffic</h2>
            <p>
              To provide business owners with scan insights, the platform collects basic anonymous catalog interaction data,
              including total QR catalog scans and item page views. We do not sell or share customer analytics with third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Data Security & Multi-Tenant Protection</h2>
            <p>
              All business workspace data and catalog storage assets are secured using database Row Level Security (RLS) and path-isolated tenant policies,
              ensuring business data remains strictly isolated.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Contacting Us</h2>
            <p>
              For inquiries regarding data access or account deletion requests, business owners can reach out through our official WhatsApp administration contact.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
