import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Header */}
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

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-mono">Last Updated: August 26, 2026</p>
        </div>

        {/* Document Content - Paragraph Style */}
        <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          <p>
            Welcome to the QR Business Development digital catalog platform.
            We are dedicated to safeguarding your business information, intellectual property, and public visitor interactions.
            This Privacy Policy explains in detail how we collect, process, store, and protect your information when you create an account,
            manage your digital catalog, generate QR codes, or when customers visit your public catalog link.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              1. Information We Collect
            </h2>
            <p>
              When you register a business workspace on our platform, we collect the necessary business profile details you provide, including your business name, registered owner email address, contact telephone numbers, physical address, business classification type (such as restaurant, bookshop, salon, or retail), custom theme color preferences, and uploaded branding assets including your official business logo and catalog header banners.
            </p>
            <p>
              Additionally, we collect and store the inventory content you create, including item names, category arrangements, descriptions, base prices, portion sizes and variation pricing (such as Small and Large options), stock indicators, promotional badges, and product photography uploaded directly to your workspace.
            </p>
            <p>
              When public customers visit your digital catalog page (<strong className="font-mono text-slate-200">/c/[slug]</strong>), we store their temporary shopping cart selections, quantities, and chosen portion sizes locally within their device&apos;s browser session storage. We do not collect, process, or store customer payment card numbers on our public catalog interfaces.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              2. Catalog Analytics &amp; Scan Traffic
            </h2>
            <p>
              To provide business owners with actionable business intelligence regarding foot traffic and menu engagement, the platform records anonymous aggregated metrics. These include total QR code scans, unique visiting device counts, scan timestamps, and individual item page views.
            </p>
            <p>
              We operate strictly on a private multi-tenant SaaS model. We never sell, rent, lease, or monetize your scan data, customer traffic patterns, or catalog details to third-party advertising networks, data brokers, or marketing intermediaries. All collected metrics are used exclusively to power your private dashboard analytics and ensure reliable platform performance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              3. Data Security &amp; Multi-Tenant Protection
            </h2>
            <p>
              All business workspace records, category hierarchies, menu items, and analytics tables are safeguarded using database-level Row Level Security (RLS) policies. This architecture guarantees that private dashboard records and item configurations can only be accessed or modified by the authenticated business owner or authorized platform administrators.
            </p>
            <p>
              Furthermore, all uploaded image files, brand assets, and digital flyers are organized into isolated storage paths keyed to your specific business identifier, preventing any unauthorized cross-tenant access. All data in transit between your browser and our servers is secured using modern TLS 1.3 encryption (HTTPS).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              4. Data Ownership, Deletion &amp; Contacting Us
            </h2>
            <p>
              You retain complete intellectual property ownership and copyright over all branding assets, photos, item titles, and catalog descriptions uploaded to your account. You have the right to modify, update, or remove your items and business details at any time directly through your dashboard.
            </p>
            <p>
              If you wish to request complete account deletion or have questions regarding data privacy and access, you can reach out directly to our administration desk via our official WhatsApp business channel:
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/94764689907?text=Hello%20Admin%2C%20I%20have%20an%20inquiry%20regarding%20the%20Privacy%20Policy."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Administration Desk (+94 76 468 9907)
              </a>
            </div>
          </section>

        </div>

        {/* Footer Link */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <Link href="/terms" className="text-teal-400 hover:underline font-semibold">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="text-teal-400 hover:underline font-semibold">
            Refund Policy
          </Link>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> PostgreSQL RLS Secured
          </span>
        </div>

      </div>
    </div>
  );
}
