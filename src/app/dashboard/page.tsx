'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, Layers, QrCode, ExternalLink, Plus, CheckCircle2, Store, Utensils, BookOpen, Scissors, Smartphone, Copy, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, BUSINESS_TYPES_META } from '@/lib/types';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOverview() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch active user business
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (biz) {
        setBusiness(biz as Business);
        const { data: itemData } = await supabase
          .from('catalog_items')
          .select('*')
          .eq('business_id', biz.id)
          .order('created_at', { ascending: false });
          
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('business_id', biz.id)
          .order('display_order');

        setItems((itemData as CatalogItem[]) || []);
        setCategories((catData as Category[]) || []);
      }
      setLoading(false);
    }

    loadOverview();
  }, [router]);

  const handleCopyLink = () => {
    if (!business) return;
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/c/${business.slug}`
      : `/c/${business.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const activeItemsCount = items.filter((i) => i.is_available).length;
  const businessMeta = business ? BUSINESS_TYPES_META[business.business_type] : BUSINESS_TYPES_META.general;

  let TypeIcon = Store;
  if (business?.business_type === 'restaurant') TypeIcon = Utensils;
  if (business?.business_type === 'bookshop') TypeIcon = BookOpen;
  if (business?.business_type === 'salon') TypeIcon = Scissors;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Eye-Catching Header Banner */}
      <div className="relative overflow-hidden bg-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Background glow flares */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-500 text-slate-950 rounded-lg shrink-0 shadow-sm">
              <TypeIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              {businessMeta.label} Catalog
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Online
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{business?.name || 'My Business'}</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {business?.description || 'Your digital business catalog is live and ready for instant customer QR code scans.'}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs font-mono text-teal-300">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>/c/{business?.slug}</span>
            <button
              onClick={handleCopyLink}
              className="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {business && (
            <Link href={`/c/${business.slug}`} target="_blank">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-2 border-none shadow-lg py-3 px-5">
                <Smartphone className="w-4 h-4" /> Open Mobile View <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
          <Link href="/dashboard/items">
            <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-2 py-3 px-4">
              <Plus className="w-4 h-4" /> Add {businessMeta.itemTerm}
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total {businessMeta.itemTerm}s
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{items.length}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {activeItemsCount} Available
            </div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Categories
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{categories.length}</div>
            <div className="text-xs text-slate-500 mt-1">Organized sections</div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              QR Access Link
            </div>
            <div className="text-xs font-mono font-bold text-teal-700 mt-2 truncate max-w-[180px]">
              /c/{business?.slug}
            </div>
            <Link href="/dashboard/qr-code" className="text-xs text-teal-600 hover:underline font-semibold mt-1 inline-block">
              Download QR Flyer →
            </Link>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Catalog Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Catalog Preview</h2>
            {items.length > 0 && (
              <Link href="/dashboard/items" className="text-xs text-teal-600 hover:underline font-semibold">
                Manage All ({items.length})
              </Link>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">Your catalog is currently empty</div>
              <p className="text-xs text-slate-500">
                Start adding {businessMeta.itemTerm.toLowerCase()}s to display in your mobile QR catalog.
              </p>
              <Link href="/dashboard/items">
                <Button size="sm" className="mt-2">
                  Add Your First {businessMeta.itemTerm}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">${item.price.toFixed(2)}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.is_available ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick QR Launch Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Printable QR Table Tent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate custom vector QR codes and printable tabletop flyers to display on tables or counter stands.
            </p>
          </div>

          <Link href="/dashboard/qr-code">
            <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold border-none">
              Open QR Code Studio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
