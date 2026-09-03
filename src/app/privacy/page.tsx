import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, CheckCircle2, FileText, Database, EyeOff, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5" /> Privacy &amp; Data Protection
          </div>
        </div>

        {/* Title & Introduction */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-mono">Effective Date &amp; Last Updated: August 26, 2026</p>
          <p className="text-sm text-slate-300 leading-relaxed pt-2">
            This Privacy Policy describes how the QR Business Development platform (&quot;we&quot;, &quot;us&quot;, or &quot;the Platform&quot;)
            collects, processes, secures, and handles business information, digital catalog assets, and customer scan interactions.
            We are committed to maintaining the highest level of tenant data isolation and user privacy.
          </p>
        </div>

        {/* Section 1 */}
        <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
              1
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" /> Information We Collect
            </h2>
          </div>
          
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">1.1 Business Account &amp; Profile Information</h3>
              <p>
                When a business owner registers an account or configures settings, we collect essential profile data including business name,
                registered owner email, contact telephone numbers, physical business address, currency settings, business category type (e.g. restaurant, salon, bookshop, retail),
                theme styling colors, and uploaded brand assets (such as official business logos and header banner images).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">1.2 Digital Catalog &amp; Inventory Data</h3>
              <p>
                We store item titles, category groupings, descriptions, base prices, portion sizes/variations (e.g. Small, Large), stock availability flags,
                special promotional badges (e.g. Chef&apos;s Special, Bestseller), and high-resolution item imagery uploaded by the business owner.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">1.3 Customer Public Catalog Sessions &amp; Cart State</h3>
              <p>
                When end customers browse a public QR catalog (<strong className="font-mono text-slate-200">/c/[slug]</strong>), their selected cart items, quantities, and chosen portion sizes are maintained locally within the customer&apos;s temporary browser session storage. We do not collect, process, or store end-customer payment card details on our public catalog interfaces.
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
              <EyeOff className="w-5 h-5 text-purple-400" /> Catalog Analytics &amp; Scan Traffic
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">2.1 Anonymous QR Interaction Logging</h3>
              <p>
                To provide business owners with actionable insights regarding customer engagement, the platform records anonymous aggregated metrics, including total QR code scan counts, unique visiting device counts, timestamps of scans, and specific catalog item view frequencies.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">2.2 Absolute Protection Against Data Monetization</h3>
              <p>
                We strictly operate as a private SaaS platform. We <strong className="text-white">never sell, rent, lease, or monetize</strong> your customer analytics, scan trends, or catalog data to third-party data aggregators, advertising networks, or marketing brokers.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">2.3 System Performance &amp; Uptime Monitoring</h3>
              <p>
                Aggregated server request metrics are used solely to monitor platform health, diagnose server response latencies, and prevent denial-of-service or malicious traffic spikes.
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
              <Database className="w-5 h-5 text-emerald-400" /> Data Security &amp; Multi-Tenant Protection
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">3.1 PostgreSQL Row-Level Security (RLS)</h3>
              <p>
                All business records, category arrangements, catalog items, and analytics tables are enforced with strict database-level Row Level Security (RLS) policies. Only the verified authenticated business owner or authorized platform super administrators can modify or manage private workspace records.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">3.2 Tenant-Isolated Storage Architecture</h3>
              <p>
                All uploaded product images, business logos, and table tent assets are segregated into tenant-isolated storage paths keyed specifically to your unique business identifier, preventing any cross-tenant data leaks.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">3.3 End-to-End Encrypted Transmission</h3>
              <p>
                All communications between user devices, QR scan viewers, and our database infrastructure are secured via industry-standard Transport Layer Security (TLS 1.3 / HTTPS encryption).
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
              <MessageSquare className="w-5 h-5 text-amber-400" /> Data Ownership, Deletion &amp; Contacting Us
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-slate-100 mb-1">4.1 Complete Merchant Content Ownership</h3>
              <p>
                Business owners retain complete intellectual property ownership over all uploaded branding, logos, menu items, and pricing structures. We do not claim any proprietary rights over your catalog content.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">4.2 Right to Rectification &amp; Account Deletion</h3>
              <p>
                You can update or delete your catalog items, categories, and business information at any time directly through your dashboard. If you wish to permanently terminate your account and wipe all stored assets from our servers, you may submit an official deletion request.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 mb-1">4.3 Official Administrative Reachout</h3>
              <p>
                For any privacy inquiries, data access requests, or policy questions, please contact our administrative desk through our official WhatsApp administration channel:
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/94712220731?text=Hello%20Admin%2C%20I%20have%20an%20inquiry%20regarding%20the%20Privacy%20Policy."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" /> Contact Administration on WhatsApp (+94 71 222 0731)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link href="/terms" className="text-teal-400 hover:underline font-semibold">
            View Terms of Service
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
