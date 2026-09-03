import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsOfServicePage() {
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
            <Shield className="w-4 h-4" /> Terms of Service
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400 font-mono">Last Updated: August 26, 2026</p>
        </div>

        {/* Document Content - Paragraph Style */}
        <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          
          <p>
            These Terms of Service (&quot;Agreement&quot;) govern your access to and usage of the QR Business Development digital catalog creation,
            QR code publishing, and inventory management platform. By registering an account, browsing public catalogs, or subscribing to any plan,
            you agree to be legally bound by these terms.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              1. Business Account &amp; Service Usage
            </h2>
            <p>
              QR Business Catalog provides an intelligent multi-tenant software-as-a-service platform allowing restaurants, salons, bookstores, retail shops, and independent businesses to create mobile-optimized digital QR catalogs, generate printable table tent QR flyers, view scan analytics, and manage item inventories.
            </p>
            <p>
              By creating an account, you agree to provide accurate, current, and verifiable business details. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities and catalog modifications performed under your workspace.
            </p>
            <p>
              Each business is assigned a unique public URL slug (<strong className="font-mono text-slate-200">/c/[slug]</strong>) which directly encodes your physical QR flyers, table tents, and printed stickers. To protect your printed materials from becoming invalid, URL slug modifications are locked in the dashboard and require verification via our administration desk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              2. Content Ownership &amp; Catalog Data
            </h2>
            <p>
              You retain full, uncompromised intellectual property rights and copyright ownership over all logos, item titles, descriptions, pricing structures, and product images uploaded to your catalog workspace. We do not claim any proprietary rights over your brand content.
            </p>
            <p>
              You agree not to upload, publish, or distribute fraudulent, deceptive, defamatory, obscene, infringing, or illegal goods or services. The platform reserves the right to immediately suspend or restrict public access to any catalog found to be in violation of applicable laws or community standards.
            </p>
            <p>
              The platform provides an interactive shopping cart experience on public catalog pages to help customers organize order preferences and portion selections. The platform serves as a digital presentation layer and does not take responsibility for offline order fulfillment or disputes between merchants and their customers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              3. Subscription &amp; Expiration Policy
            </h2>
            <p>
              The platform offers structured subscription tiers to accommodate business growth. The <strong>Starter Free</strong> package includes up to 10 items, 5 categories, and single-price listings. The <strong>Pro Growth</strong> package (LKR 2,000/mo or LKR 21,000/yr) includes up to 150 items, 20 categories, up to 2 portion variations per item, custom theme branding, and printable 5&quot;x7&quot; QR table tent flyers. The <strong>Business Plus</strong> tier (LKR 3,500/mo or LKR 36,000/yr) provides unlimited items, unlimited categories, unlimited variations, and full analytics capabilities.
            </p>
            <p>
              Upon the expiration of a paid subscription period, none of your catalog items, categories, or uploaded photos are deleted. Your data remains fully preserved in our database. However, public catalog visibility will automatically default to standard free tier limits until the subscription is renewed. Advance renewals extend from your existing expiration date so you never lose prepaid days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-2">
              4. Platform Availability &amp; Support
            </h2>
            <p>
              While we strive for continuous 99.9% service availability, the service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Occasional scheduled maintenance windows may be performed during off-peak hours to update server infrastructure and security configurations.
            </p>
            <p>
              In no event shall the platform, its developers, or administrators be liable for indirect, incidental, or consequential damages resulting from third-party Internet outages, localized device failures, or external network interruptions. Support inquiries, custom plan activations, and technical assistance can be initiated directly via our verified WhatsApp business desk:
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/94712220731?text=Hello%20Admin%2C%20I%20have%20an%20inquiry%20regarding%20the%20Terms%20of%20Service."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4" /> Reach Support on WhatsApp (+94 71 222 0731)
              </a>
            </div>
          </section>

        </div>

        {/* Footer Link */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-teal-400 hover:underline font-semibold">
            Privacy Policy
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
