'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Building2, LogOut, ArrowLeft, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAdminAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect unauthenticated user to login with next=/admin
        router.push('/login?next=/admin');
        return;
      }

      // Check database authorization using is_super_admin RPC or Super Admin Email
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_super_admin');
      const isSuperAdminEmail = user.email?.toLowerCase() === 'adminkal@gmail.com';
      const isAuthorized = Boolean(isAdmin) || isSuperAdminEmail;

      if (!isAuthorized) {
        console.error('Super Admin check failed for user:', user.id, user.email, 'RPC Error:', rpcError?.message, 'isAdmin:', isAdmin);
        router.push('/dashboard');
        return;
      }

      setUserEmail(user.email || null);
      setLoading(false);
    }

    checkAdminAuth();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-teal-500 selection:text-slate-950">
      {/* Desktop Admin Sidebar (Hidden on <md screens) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 min-h-screen justify-between overflow-x-hidden">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Super Admin Portal
            </div>
            <h2 className="text-lg font-extrabold text-white">Master Console</h2>
            <p className="text-[11px] font-mono text-teal-300 truncate">{userEmail}</p>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                pathname === '/admin'
                  ? 'bg-teal-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Business Directory</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Dashboard</span>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (<md screens) */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Super Admin Portal
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Toggle admin menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-Over Drawer (<md screens) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col justify-between h-full p-4 shadow-2xl border-r border-slate-800 animate-fade-in overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Super Admin</div>
                  <div className="text-sm font-bold text-white">Master Console</div>
                  <div className="text-[10px] font-mono text-teal-300 truncate">{userEmail}</div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold ${
                    pathname === '/admin' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Business Directory</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" /> Sign Out Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
