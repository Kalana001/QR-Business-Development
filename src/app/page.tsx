import Link from 'next/link';
import { QrCode, Store, Utensils, BookOpen, Scissors, ArrowRight, ShieldCheck, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
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
              <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold border-none">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Mobile Catalogs
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Turn your menu or products into an <span className="text-teal-400">instant QR experience</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-normal leading-relaxed">
            Zero app downloads. Zero registration required for your customers. Multi-tenant SaaS platform built for Restaurants, Bookshops, Salons, and Retailers.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-base py-3 px-8 gap-2 border-none">
                Create Business Catalog <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                Go to Business Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid / Business Types */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-teal-500/40 transition-colors">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Restaurant & Café</h3>
            <p className="text-sm text-slate-400">
              Food & drink items, dietary badges (Vegan, Spicy), prices, and availability toggles.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-teal-500/40 transition-colors">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bookshop</h3>
            <p className="text-sm text-slate-400">
              Display Author, ISBN, price, and real-time stock status (&quot;Out of Stock&quot; indicator).
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-teal-500/40 transition-colors">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-4">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Salon & Barber</h3>
            <p className="text-sm text-slate-400">
              List services, treatment descriptions, pricing, and duration in minutes.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-teal-500/40 transition-colors">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">General Business</h3>
            <p className="text-sm text-slate-400">
              Flexible multi-category product catalog with custom pricing and instant contact.
            </p>
          </div>
        </div>

        {/* Pricing Packages Section */}
        <section id="pricing" className="mt-24 scroll-mt-20">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              Flexible Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simple, transparent packages for every business
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Start for free today. Upgrade anytime as your catalog and customer base grow.
            </p>
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
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to <strong>10 Catalog Items</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to <strong>5 Categories</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Instant Mobile QR Customer View</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
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
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Pro Growth
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Pro Growth</h3>
                  <p className="text-xs text-slate-400 mt-1">Ideal for cafés, bookshops, and salons with expanding catalogs.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">LKR 2,000</span>
                  <span className="text-slate-400 text-xs font-medium">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to <strong>150 Catalog Items</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to <strong>20 Categories</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom Branding & Accent Colors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Printable 5&quot;x7&quot; Table Tent Flyers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
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
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Business Plus</h3>
                  <p className="text-xs text-slate-400 mt-1">Built for large restaurants, retail stores, and multi-category shops.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">LKR 3,500</span>
                  <span className="text-slate-400 text-xs font-medium">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span><strong>Unlimited Catalog Items</strong> (∞)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span><strong>Unlimited Categories</strong> (∞)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>All Pro Growth Features Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span><strong>Advanced QR & Catalog Analytics</strong> (Scans, Top Items & Search Trends)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Dedicated Super Admin Onboarding</span>
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
