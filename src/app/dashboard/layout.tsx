'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  QrCode, LayoutDashboard, Package, Layers, Settings, ExternalLink, LogOut, Store, Menu, X, Copy, Check, Smartphone
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/lib/types';
import { slugify } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBusinessData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Unauthenticated user -> redirect to login
        router.push('/login');
        return;
      }

      // Fetch user's business workspace
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bizData) {
        setBusiness(bizData as Business);
      } else {
        // Read exact business name and type typed during sign-up from user_metadata
        const metaName = user.user_metadata?.business_name;
        const defaultName = metaName && metaName.trim()
          ? metaName.trim()
          : (user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Business` : 'My Business Catalog');
        
        const metaType = user.user_metadata?.business_type || 'restaurant';
        const metaSlug = user.user_metadata?.business_slug || (slugify(defaultName) + '-' + Date.now().toString().slice(-4));
        
        const { data: newBiz } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            name: defaultName,
            slug: metaSlug,
            business_type: metaType,
            currency: 'LKR',
            theme_color: '#0F172A',
          })
          .select()
          .single();

        if (newBiz) {
          setBusiness(newBiz as Business);
        }
      }
      setLoading(false);
    }

    loadBusinessData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleCopyLink = () => {
    if (!business) return;
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/c/${business.slug}`
      : `/c/${business.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/items', label: 'Catalog Items', icon: Package },
    { href: '/dashboard/categories', label: 'Categories', icon: Layers },
    { href: '/dashboard/qr-code', label: 'QR Code Studio', icon: QrCode },
    { href: '/dashboard/business', label: 'Business Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-white text-base">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-lg shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="truncate">{business?.name || 'My Business'}</div>
              <div className="text-[10px] text-teal-400 font-normal capitalize">
                {business?.business_type || 'Catalog'}
              </div>
            </div>
          </Link>
        </div>

        {/* Eye-Catching Public Catalog Sidebar Card */}
        {business && (
          <div className="mx-4 my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/60 border border-teal-500/30 shadow-lg relative overflow-hidden space-y-3">
            {/* Subtle glow background circle */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Catalog
              </div>
              <button
                onClick={handleCopyLink}
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Public URL Slug</div>
              <div className="text-xs font-mono font-bold text-teal-300 truncate mt-0.5">
                /c/{business.slug}
              </div>
            </div>

            <a
              href={`/c/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 group cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Preview Customer View</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 space-y-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Navigation */}
      <div className="md:hidden bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sm">
          <div className="p-1.5 bg-teal-500 text-slate-950 rounded-md">
            <QrCode className="w-4 h-4" />
          </div>
          <span>{business?.name || 'QR Catalog'}</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-teal-500 text-slate-950 font-semibold' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {business && (
            <a
              href={`/c/${business.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-400 bg-teal-500/10 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" /> View Public Customer Catalog
            </a>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
