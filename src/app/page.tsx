'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, Store, Utensils, BookOpen, Scissors, ArrowRight, ShieldCheck, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BillingInterval, calculatePackageDiscount } from '@/lib/types';

export default function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');

  const proDiscount = calculatePackageDiscount(2000, 21000);
  const bizPlusDiscount = calculatePackageDiscount(3500, 36000);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <span>QR Catalog Studio</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#pricing" className="text-sm font-semibold text-slate-300 hover:text-teal-400 transition-colors hidden sm:inline-block">
              Pricing
            </a>
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold border-none">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-20 flex-1">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Digital QR Catalog Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Transform Your Physical Menu Into an <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400">Interactive QR Catalog</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Create beautiful mobile digital catalogs for your restaurant, bookshop, salon, or retail business. Print tabletop QR flyers & receive customer queries instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold border-none px-8 py-3.5 text-base gap-2">
                Create Free Catalog Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 py-3.5 text-base">
                View Packages & Pricing
              </Button>
            </a>
          </div>
        </div>

        {/* Business Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-teal-500/40 transition-all group">
            <div className="p-3 bg-slate-800 text-teal-400 rounded-xl w-fit group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Restaurants & Cafés</h3>
            <p className="text-xs text-slate-400">
              Digital food & beverage menus with dietary badges, prices, and instant category filters.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-teal-500/40 transition-all group">
            <div className="p-3 bg-slate-800 text-teal-400 rounded-xl w-fit group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Bookshops & Publishers</h3>
            <p className="text-xs text-slate-400">
              Showcase book listings with author names, ISBN numbers, stock status, and cover art.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-teal-500/40 transition-all group">
            <div className="p-3 bg-slate-800 text-teal-400 rounded-xl w-fit group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Salons & Spas</h3>
            <p className="text-xs text-slate-400">
              Display service menus, treatment durations, and styling options for appointments.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-teal-500/40 transition-all group">
            <div className="p-3 bg-slate-800 text-teal-400 rounded-xl w-fit group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">General Business</h3>
            <p className="text-xs text-slate-400">
              Flexible multi-category product catalog with custom pricing and instant contact.
            </p>
          </div>
        </div>

        {/* Pricing Packages Section */}
        <section id="pricing" className="mt-24 scroll-mt-20">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              Flexible Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simple, transparent packages for every business
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Start for free today. Upgrade anytime as your catalog and customer base grow.
            </p>

            {/* Monthly | Annual Billing Switch */}
            <div className="pt-6 flex justify-center">
              <div className="p-1 bg-slate-900 border border-slate-800 rounded-2xl inline-flex items-center gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    billingInterval === 'monthly'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('annual')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    billingInterval === 'annual'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-teal-300">
                    SAVE UP TO 14.3%
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Free */}
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Free Forever
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Starter Free</h3>
                  <p className="text-xs text-slate-400 mt-1">Perfect for small businesses creating their first digital QR catalog.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">LKR 0</span>
                  <span className="text-slate-400 text-xs font-medium">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800/80">
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Up to <strong>10 Catalog Items</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Up to <strong>5 Categories</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Instant Mobile QR Customer View</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Standard Support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 py-2.5">
                    Start Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Growth - Highlighted */}
            <div className="p-8 bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 border-2 border-teal-500 rounded-3xl flex flex-col justify-between shadow-xl shadow-teal-950/30 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Pro Growth
                  </span>
                  {billingInterval === 'annual' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[10px] uppercase">
                      Save {proDiscount.formattedDiscount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Pro Growth</h3>
                  <p className="text-xs text-slate-400 mt-1">Ideal for cafés, bookshops, and salons with expanding catalogs.</p>
                </div>

                {billingInterval === 'annual' ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white">LKR 21,000</span>
                      <span className="text-slate-400 text-xs font-medium">/ year</span>
                      <span className="text-xs text-slate-500 line-through">LKR {proDiscount.originalAnnualized.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-teal-400 font-bold">
                      Equivalent to LKR {proDiscount.monthlyEquivalent.toLocaleString()}/month
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">LKR 2,000</span>
                    <span className="text-slate-400 text-xs font-medium">/ month</span>
                  </div>
                )}

                <ul className="space-y-3 text-xs text-slate-200 pt-4 border-t border-slate-800">
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Up to <strong>150 Catalog Items</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Up to <strong>20 Categories</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Custom Branding & Accent Colors</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Printable 5&quot;x7&quot; Table Tent Flyers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    </div>
                    <span>Priority Admin Activation</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/signup">
                  <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold border-none py-2.5">
                    Upgrade to Pro Growth
                  </Button>
                </Link>
              </div>
            </div>

            {/* Business Plus */}
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col justify-between hover:border-purple-500/40 transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Best Value
                  </span>
                  {billingInterval === 'annual' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-black text-[10px] uppercase">
                      Save {bizPlusDiscount.formattedDiscount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Business Plus</h3>
                  <p className="text-xs text-slate-400 mt-1">Built for large restaurants, retail stores, and multi-category shops.</p>
                </div>

                {billingInterval === 'annual' ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white">LKR 36,000</span>
                      <span className="text-slate-400 text-xs font-medium">/ year</span>
                      <span className="text-xs text-slate-500 line-through">LKR {bizPlusDiscount.originalAnnualized.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-purple-300 font-bold">
                      Equivalent to LKR {bizPlusDiscount.monthlyEquivalent.toLocaleString()}/month
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">LKR 3,500</span>
                    <span className="text-slate-400 text-xs font-medium">/ month</span>
                  </div>
                )}
                <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800/80">
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    </div>
                    <span><strong>Unlimited Catalog Items</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    </div>
                    <span><strong>Unlimited Categories</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    </div>
                    <span>All Pro Growth Features Included</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    </div>
                    <span><strong>Advanced QR & Catalog Analytics</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    </div>
                    <span><strong>Premium Catalog Designs</strong></span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/signup">
                  <Button variant="outline" className="w-full border-purple-500/40 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30 py-2.5">
                    Start Business Plus
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Live Public Catalog Demo Links */}
        <div className="mt-16 p-8 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
                <Smartphone className="w-4 h-4" /> Try Live Mobile Demos
              </div>
              <h3 className="text-xl font-bold text-white">Experience Customer QR Catalogs</h3>
              <p className="text-sm text-slate-400 mt-1">
                Click any business below to open the mobile customer view:
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/c/bella-vista-bistro" target="_blank">
                <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
                  🍽️ Bistro Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} QR Catalog Studio. Production Multi-tenant SaaS.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> PostgreSQL RLS Secured
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
