'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  QrCode, Store, Utensils, BookOpen, Scissors, ArrowRight, ShieldCheck, 
  Smartphone, CheckCircle, Laptop, Printer, MessageSquare, Sparkles, 
  Layers, SlidersHorizontal, FileSpreadsheet, BarChart3, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BillingInterval, calculatePackageDiscount } from '@/lib/types';

export default function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');
  const [activePrototypeTab, setActivePrototypeTab] = useState<'mobile' | 'dashboard' | 'flyer'>('mobile');
  const [activeSizeVariation, setActiveSizeVariation] = useState<'small' | 'large' | 'extreme'>('large');

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

        {/* Prototype & Feature Showcase Section */}
        <section className="space-y-10 pt-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Interactive System Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              See What You &amp; Your Customers Get
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore the complete ecosystem included in your QR digital catalog: from seamless mobile ordering for your diners to intuitive real-time management and print-ready flyers.
            </p>

            {/* Showcase Tab Selector */}
            <div className="pt-2 flex justify-center">
              <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl inline-flex flex-wrap items-center justify-center gap-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => setActivePrototypeTab('mobile')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activePrototypeTab === 'mobile'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md scale-102'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>1. Mobile Customer View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePrototypeTab('dashboard')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activePrototypeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md scale-102'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>2. Owner Admin Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePrototypeTab('flyer')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activePrototypeTab === 'flyer'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md scale-102'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>3. Printable QR Table Tents</span>
                </button>
              </div>
            </div>
          </div>

          {/* Prototype Display Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* TAB 1: Mobile Customer Catalog */}
            {activePrototypeTab === 'mobile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Smartphone Mockup (5 Cols) */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-[340px] bg-slate-950 rounded-[40px] border-[6px] border-slate-800 shadow-2xl p-4 space-y-3.5 relative overflow-hidden ring-1 ring-white/10">
                    {/* Phone Top Notch / Speaker */}
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto" />

                    {/* Catalog Restaurant Header */}
                    <div className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 p-3 rounded-2xl border border-teal-500/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                        SF
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">Sigiri Food &amp; Bistro</h4>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        </div>
                        <p className="text-[10px] text-teal-300 font-medium">★ 4.9 (140+ reviews) • Polgasowita</p>
                      </div>
                    </div>

                    {/* Category Selector Bar */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                      <span className="px-2.5 py-1 bg-teal-500 text-slate-950 rounded-lg text-[10px] font-bold shrink-0 shadow-xs">
                        Fried Rice
                      </span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-medium shrink-0">
                        Kottu
                      </span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-medium shrink-0">
                        Chopsey Rice
                      </span>
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-medium shrink-0">
                        Noodles
                      </span>
                    </div>

                    {/* Interactive Item Card with Variations */}
                    <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5 relative">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                            🔥 Chef&apos;s Special
                          </span>
                          <h5 className="text-xs font-bold text-white mt-1">
                            Mixed Fried Rice (Basmathi)
                          </h5>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                            Wok-seared Basmathi with tender chicken, sea prawns &amp; fresh farm eggs.
                          </p>
                        </div>
                        <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                          🍚
                        </div>
                      </div>

                      {/* Interactive Size Selector */}
                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-semibold">Select Portion:</span>
                          <span className="text-teal-400 font-bold">
                            {activeSizeVariation === 'small' ? 'Rs. 850.00' : activeSizeVariation === 'large' ? 'Rs. 1,100.00' : 'Rs. 1,400.00'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveSizeVariation('small')}
                            className={`py-1 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                              activeSizeVariation === 'small'
                                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Small
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSizeVariation('large')}
                            className={`py-1 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                              activeSizeVariation === 'large'
                                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Large
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSizeVariation('extreme')}
                            className={`py-1 px-1 rounded-lg text-[9px] font-bold text-center transition-all cursor-pointer ${
                              activeSizeVariation === 'extreme'
                                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Extreme
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp Order Button */}
                      <div className="pt-1">
                        <div className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-md">
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>Order on WhatsApp ({activeSizeVariation.toUpperCase()})</span>
                        </div>
                      </div>
                    </div>

                    {/* 2nd Mock Item */}
                    <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                      <div>
                        <h6 className="text-[11px] font-bold text-white">Chicken Cheese Kottu</h6>
                        <span className="text-[10px] text-teal-400 font-semibold">From Rs. 1,100 (2 Options)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-800 rounded-lg">View</span>
                    </div>
                  </div>
                </div>

                {/* Feature Highlights (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Customer Mobile Experience</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Lightning-Fast Digital Menus Your Customers Love
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Say goodbye to outdated paper menus. When customers point their phone camera at your QR code, your menu opens instantly with rich photos, portion size selectors, and direct ordering.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg w-fit">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">No App Download</h4>
                      <p className="text-xs text-slate-400">Works directly in Safari, Chrome, and all mobile camera scanners.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">1-Click WhatsApp Orders</h4>
                      <p className="text-xs text-slate-400">Selected dish, portion size, and price pre-fill the customer&apos;s WhatsApp chat.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg w-fit">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Portions &amp; Variations</h4>
                      <p className="text-xs text-slate-400">Add Small/Large sizes, book editions, or options with dynamic prices.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-fit">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Dietary &amp; Chef Badges</h4>
                      <p className="text-xs text-slate-400">Tag items with Spicy, Chef&apos;s Special, Vegan, or Best Seller badges.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Owner Management Studio */}
            {activePrototypeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Desktop Browser Window Mockup (6 Cols) */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                    {/* Browser Chrome Header */}
                    <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="flex-1 mx-3 bg-slate-950/80 rounded-md px-2.5 py-0.5 text-[10px] text-slate-400 font-mono truncate border border-slate-800">
                        https://qrcatalog.lk/dashboard/items
                      </div>
                    </div>

                    {/* Dashboard Preview Body */}
                    <div className="p-4 space-y-4">
                      {/* Top Metric Bar */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">QR Scans</div>
                          <div className="text-base font-black text-white">1,420</div>
                          <div className="text-[9px] text-emerald-400 font-semibold">↑ +24% vs last mo</div>
                        </div>
                        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Item Views</div>
                          <div className="text-base font-black text-white">4,890</div>
                          <div className="text-[9px] text-indigo-400 font-semibold">★ Top: Fried Rice</div>
                        </div>
                        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Catalog Items</div>
                          <div className="text-base font-black text-teal-400">42 Active</div>
                          <div className="text-[9px] text-slate-400">7 Categories</div>
                        </div>
                      </div>

                      {/* Mock Item Editor Form */}
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" /> Item Variations Builder
                          </span>
                          <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded text-[9px] font-bold">
                            ✓ Variations Enabled
                          </span>
                        </div>

                        {/* Rows */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
                            <span className="text-white font-medium">Small Portion</span>
                            <span className="text-teal-300 font-bold font-mono">Rs. 850.00</span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
                            <span className="text-white font-medium">Large Portion</span>
                            <span className="text-teal-300 font-bold font-mono">Rs. 1,100.00</span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
                            <span className="text-white font-medium">Extreme Large</span>
                            <span className="text-teal-300 font-bold font-mono">Rs. 1,400.00</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1 text-teal-400 font-semibold">
                            <FileSpreadsheet className="w-3 h-3" /> Excel Bulk Import Ready
                          </span>
                          <span className="px-2.5 py-1 bg-teal-500 text-slate-950 font-bold rounded-md">
                            Save Changes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Highlights (6 Cols) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Owner Management Studio</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Full Control of Prices, Items &amp; Branding Anytime
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Update your digital menu in seconds from your phone, tablet, or laptop. No waiting for graphic designers or paying for costly re-prints when prices adjust.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg w-fit">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Instant Price Updates</h4>
                      <p className="text-xs text-slate-400">Change prices or toggle sold-out items live in under 5 seconds.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Excel &amp; CSV Bulk Import</h4>
                      <p className="text-xs text-slate-400">Import your entire catalog with variations from a spreadsheet in one click.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg w-fit">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Scan &amp; Traffic Analytics</h4>
                      <p className="text-xs text-slate-400">Track daily QR scans, most popular dishes, and visitor device trends.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">6 Premium Visual Themes</h4>
                      <p className="text-xs text-slate-400">Customize accent colors, dark/light layouts, and restaurant banners.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Printable Tabletop QR Flyers */}
            {activePrototypeTab === 'flyer' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Tabletop Stand Mockup (5 Cols) */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-[300px] bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-center relative ring-1 ring-white/10">
                    {/* Brand Top Header */}
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black mx-auto text-sm shadow-md">
                        SF
                      </div>
                      <h4 className="text-sm font-black text-white">Sigiri Food &amp; Bistro</h4>
                      <p className="text-[10px] text-slate-400">Scan to Browse Menu &amp; Order</p>
                    </div>

                    {/* QR Code Centerpiece */}
                    <div className="p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto border-4 border-teal-500/40">
                      <QrCode className="w-32 h-32 text-slate-950" />
                    </div>

                    {/* Table Number & WiFi Details */}
                    <div className="space-y-1.5 pt-1">
                      <div className="inline-block px-3 py-1 bg-slate-800 text-teal-300 font-extrabold text-xs rounded-full border border-slate-700">
                        TABLE #12
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">📶 Free WiFi: Sigiri_Guest</p>
                    </div>

                    {/* Wooden / Acrylic Base Illusion */}
                    <div className="w-44 h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-full mx-auto shadow-lg" />
                  </div>
                </div>

                {/* Feature Highlights (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Physical QR Collateral</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Print-Ready Tabletop Tents &amp; Posters with 1 Click
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Download pre-designed, high-resolution QR flyers tailored to standard 5&quot;x7&quot; acrylic table stands, counter displays, or A4 wall posters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg w-fit">
                        <Printer className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Standard 5&quot;x7&quot; &amp; A4 Formats</h4>
                      <p className="text-xs text-slate-400">Pre-formatted for standard table tent acrylic stands and wall posters.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Permanent QR Technology</h4>
                      <p className="text-xs text-slate-400">The QR never expires or changes, even if you rebrand or change prices.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg w-fit">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Custom Table Numbers</h4>
                      <p className="text-xs text-slate-400">Generate table-specific QR flyers so staff know exactly where orders originate.</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-fit">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Zero Hardware Fees</h4>
                      <p className="text-xs text-slate-400">No expensive tablet stands or proprietary POS terminal rentals required.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

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
