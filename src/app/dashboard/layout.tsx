'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  QrCode, LayoutDashboard, Package, Layers, Settings, ExternalLink, LogOut, Store, Menu, X, ShieldCheck 
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullCatalogUrl, setFullCatalogUrl] = useState('');

  useEffect(() => {
    async function loadBusinessData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Unauthenticated user -> redirect to login
        router.push('/login');
        return;
      }

      // Query database RPC is_super_admin
      const { data: adminRpc } = await supabase.rpc('is_super_admin');
      const isSuperAdminUser = Boolean(adminRpc);
      setIsSuperAdmin(isSuperAdminUser);

      // Fetch user's business workspace
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bizData) {
        // Ensure Super Admin account has Unlimited Enterprise features
        if (isSuperAdminUser && bizData.subscription_plan !== 'enterprise') {
          const { data: updatedBiz } = await supabase
            .from('businesses')
            .update({
              subscription_plan: 'enterprise',
              subscription_status: 'active',
              max_items: null,
              max_categories: null,
            })
            .eq('id', bizData.id)
            .select()
            .single();
          setBusiness((updatedBiz || bizData) as Business);
        } else {
          setBusiness(bizData as Business);
        }

        if (typeof window !== 'undefined') {
          setFullCatalogUrl(`${window.location.origin}/c/${bizData.slug}`);
        }
      } else {
        // Read exact business name and type typed during sign-up from user_metadata
        const metaName = user.user_metadata?.business_name;
        const defaultName = isSuperAdminUser
          ? 'Master Super Admin Workspace'
          : (metaName && metaName.trim()
            ? metaName.trim()
            : (user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Business` : 'My Business Catalog'));
        
        const metaType = user.user_metadata?.business_type || 'general';
        const uniqueSuffix = '-' + Math.floor(1000 + Math.random() * 9000);
        const metaSlug = (slugify(defaultName) || 'admin') + uniqueSuffix;
        
        const { data: newBiz } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            name: defaultName,
            slug: metaSlug,
            business_type: metaType,
            currency: 'LKR',
            theme_color: '#0F172A',
            subscription_plan: isSuperAdminUser ? 'enterprise' : 'free',
            subscription_status: 'active',
            max_items: isSuperAdminUser ? null : 10,
            max_categories: isSuperAdminUser ? null : 5,
          })
          .select()
          .single();

        if (newBiz) {
          setBusiness(newBiz as Business);
          if (typeof window !== 'undefined') {
            setFullCatalogUrl(`${window.location.origin}/c/${newBiz.slug}`);
          }
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
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row" suppressHydrationWarning>
      {/* Desktop Sidebar Navigation (Hidden on <md screens & print) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen shrink-0 overflow-x-hidden print:hidden">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-white text-base min-w-0 w-full overflow-hidden">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-lg shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="truncate text-sm font-bold text-white" title={business?.name || 'My Business'}>
                {business?.name || 'My Business'}
              </div>
              <div className="text-[10px] text-teal-400 font-normal capitalize truncate">
                {business?.business_type || 'Catalog'}
              </div>
            </div>
          </Link>
        </div>

        {/* Public Catalog Quick Link Banner */}
        {business && (
          <div className="p-4 mx-4 my-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 overflow-hidden">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live Public QR Catalog
            </div>
            <a
              href={`/c/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-medium transition-colors overflow-hidden"
            >
              <span className="truncate">{fullCatalogUrl || `/c/${business.slug}`}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1.5" />
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
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Super Admin Control Link - Visible ONLY for Super Admin */}
        {isSuperAdmin && (
          <div className="px-4 py-2">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Super Admin Console</span>
            </Link>
          </div>
        )}

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar (<md screens) */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sm min-w-0 overflow-hidden">
          <div className="p-1.5 bg-teal-500 text-slate-950 rounded-md shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="truncate">{business?.name || 'QR Catalog'}</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-Over Navigation Drawer (<md screens) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col justify-between h-full p-4 shadow-2xl border-r border-slate-800 animate-fade-in overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-teal-500 text-slate-950 rounded-lg shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{business?.name}</div>
                    <div className="text-[10px] text-teal-400 font-normal capitalize truncate">{business?.business_type}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Public Catalog Link */}
              {business && (
                <a
                  href={`/c/${business.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-2.5 mb-4 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-medium"
                >
                  <span className="truncate">View Public Catalog</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                </a>
              )}

              {/* Navigation Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer Admin & Logout */}
            <div className="pt-4 border-t border-slate-800 space-y-2 mt-6">
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-teal-400 bg-teal-500/10 rounded-xl"
                >
                  <ShieldCheck className="w-4 h-4" /> Super Admin Console
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
