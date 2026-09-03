import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, Layers, CreditCard, Lock, MessageSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-xs gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            <Shield className="w-3.5 h-3.5" /> Legal Terms of Service
          </div>
        </div>

        {/* Title & Introduction */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400 font-mono">Effective Date &amp; Last Updated: August 26, 2026</p>
          <p className="text-sm text-slate-300 leading-relaxed pt-2">
            These Terms of Service (&quot;Agreement&quot;) govern your access to and use of the QR Business Development digital catalog creation,
            QR code publishing, and inventory management platform. By creating an account, browsing public catalogs, or subscribing to paid packages,
            you agree to be bound by these terms.
          </p>
        </div>

        {/* Section 1 */}
        <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
              1
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" /> Business Account &amp; Service Usage
            </h2>
          </div>
          
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">1.1 Scope of Platform Services</h3>
              <p>
                QR Business Catalog provides an intelligent multi-tenant SaaS platform allowing merchants, restaurants, salons, bookstores, and retail businesses to build mobile-optimized digital QR menus and catalogs, generate printable table tent QR flyers, view scan analytics, and manage item inventories.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">1.2 Account Responsibility &amp; Accuracy</h3>
              <p>
                You agree to provide accurate, up-to-date, and truthful business information during registration. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your workspace.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">1.3 Public Catalog URL Slug &amp; Physical QR Code Protection</h3>
              <p>
                Each business is provisioned with a unique URL slug (<strong className="font-mono text-slate-200">/c/[slug]</strong>) which directly encodes your physical QR flyers, table tents, and stickers. To safeguard physical printed materials from breaking, slug modifications are locked in the dashboard and require verification via Super Admin Request.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
              2
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> Content Ownership &amp; Catalog Data
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">2.1 Intellectual Property Ownership</h3>
              <p>
                You retain complete, uncompromised intellectual property rights and copyright ownership of all titles, imagery, logos, item photos, trademarks, pricing, and descriptions uploaded to your catalog workspace.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">2.2 Prohibited Content &amp; Fair Use Standards</h3>
              <p>
                You agree not to upload, publish, or distribute fraudulent, deceptive, defamatory, obscene, infringing, or illegal goods or services. The platform reserves the right to immediately suspend or restrict public access to any catalog found in violation of local laws.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">2.3 Customer Shopping Cart Experience</h3>
              <p>
                Public catalogs provide interactive 1-Click Cart functionality allowing customers to compile order lists and portion preferences. The platform acts as a digital presentation layer and does not take responsibility for independent order fulfillment or disputes between merchant and customer.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
              3
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Subscription Plans, Variations Limits &amp; Expiration Policy
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">3.1 Subscription Plan Quotas &amp; Limits</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-white">Starter Free:</strong> Up to 10 catalog items, 5 categories, and single-price listings (no variations).</li>
                <li><strong className="text-white">Pro Growth (LKR 2,000/mo or LKR 21,000/yr):</strong> Up to 150 items, 20 categories, up to 2 variations/portion sizes per item (e.g. Small / Large), custom branding, and printable 5&quot;x7&quot; QR table tent flyers.</li>
                <li><strong className="text-white">Business Plus &amp; Free Trial (LKR 3,500/mo or LKR 36,000/yr):</strong> Unlimited catalog items, unlimited categories, unlimited portion variations, advanced scan analytics, and luxury catalog designs.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">3.2 Expiration &amp; Data Preservation Safeguard</h3>
              <p>
                Upon the expiration of a paid subscription period, <strong className="text-white">none of your catalog items, categories, or uploaded photos are deleted</strong>. Your data remains completely safe in our database. However, public catalog visibility will automatically default to standard free tier limits until your subscription is renewed.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">3.3 Advance Renewals &amp; Future Payments</h3>
              <p>
                When renewing an active plan before its expiration, the extension is calculated from your existing expiration date, ensuring you never lose prepaid days.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
              4
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" /> Platform Availability, Disclaimers &amp; Support
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">4.1 Service Availability &amp; Maintenance</h3>
              <p>
                While we strive for continuous 99.9% platform availability, the service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Occasional scheduled maintenance windows may be performed during off-peak hours to update server infrastructure and security rules.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">4.2 Limitation of Liability</h3>
              <p>
                In no event shall the platform, its developers, or administrators be liable for indirect, incidental, or consequential damages resulting from third-party Internet outages, localized device failures, or external network interruptions.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">4.3 Priority Support &amp; Administrative Helpdesk</h3>
              <p>
                Support inquiries, custom plan activations, and technical assistance can be initiated directly via our verified WhatsApp business desk:
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/94712220731?text=Hello%20Admin%2C%20I%20have%20an%20inquiry%20regarding%20the%20Terms%20of%20Service."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" /> Reach Support on WhatsApp (+94 71 222 0731)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-teal-400 hover:underline font-semibold">
            View Privacy Policy
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
