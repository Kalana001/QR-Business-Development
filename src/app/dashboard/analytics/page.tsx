'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, QrCode, Eye, Search, Smartphone, Users, Crown, Calendar, TrendingUp, AlertTriangle, ArrowUpRight, CheckCircle2, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/lib/types';
import { getAnalyticsSummary, AnalyticsSummary } from '@/lib/analytics';

export default function DashboardAnalyticsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setBusiness({
          id: 'demo-biz-1', owner_id: 'demo', name: 'Bella Vista Bistro', slug: 'bella-vista-bistro',
          business_type: 'restaurant', description: null, phone: null, email: null, address: null,
          website: null, logo_url: null, banner_url: null, currency: 'USD', theme_color: '#0F172A',
          created_at: '', updated_at: '', subscription_plan: 'enterprise',
        });
        setIsSuperAdmin(true);
        setLoading(false);
        return;
      }

      const { data: adminRpc } = await supabase.rpc('is_super_admin');
      setIsSuperAdmin(Boolean(adminRpc));

      const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
      if (biz) {
        setBusiness(biz as Business);
        const data = await getAnalyticsSummary(biz.id, daysFilter);
        setAnalytics(data);
      }
      setLoading(false);
    }

    loadData();
  }, [daysFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const planKey = (business?.subscription_plan || 'free').toLowerCase();
  const isBusinessPlan = isSuperAdmin || planKey === 'enterprise' || planKey === 'business' || planKey === 'business_plus';

  if (!isBusinessPlan) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-purple-600" /> Advanced QR & Catalog Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Track customer QR scans, item popularity, search trends, and device demographics.
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-purple-600" /> Business Plus Feature
          </span>
        </div>

        {/* Locked Feature Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-purple-500/20 text-center space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center justify-center p-4 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-2xl shadow-inner">
            <Crown className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Unlock Deep Customer Insights
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Advanced QR & Catalog Analytics is available exclusively on the <strong>Business Plus</strong> plan (LKR 3,500/mo). Upgrade today to track scans, top items, and zero-result search terms!
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4 max-w-2xl mx-auto">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <QrCode className="w-5 h-5 text-purple-400" />
              <div className="text-xs font-bold text-white">Real-Time QR Scans</div>
              <div className="text-[11px] text-slate-400">Track daily scan traffic & peak hours.</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <Eye className="w-5 h-5 text-purple-400" />
              <div className="text-xs font-bold text-white">Item Popularity</div>
              <div className="text-[11px] text-slate-400">Rank your top viewed menu items.</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <Search className="w-5 h-5 text-purple-400" />
              <div className="text-xs font-bold text-white">Search Trends</div>
              <div className="text-[11px] text-slate-400">Discover customer search keywords.</div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-lg gap-2 text-sm"
            >
              <Crown className="w-4 h-4" /> Upgrade to Business Plus
            </Button>
          </div>
        </div>

        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Advanced Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-purple-200">
              <Crown className="w-3 h-3 text-purple-600" /> Business Plus Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time customer engagement metrics, scan traffic, and search intelligence.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shrink-0">
          <button
            onClick={() => setDaysFilter(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              daysFilter === 7
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDaysFilter(30)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              daysFilter === 30
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDaysFilter(365)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              daysFilter === 365
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total QR Scans</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.totalScans || 0}</div>
            <div className="text-[11px] text-teal-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Real-time scan logs
            </div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Visitors</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.uniqueVisitors || 0}</div>
            <div className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" /> Mobile devices
            </div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Item Views</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.totalItemViews || 0}</div>
            <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Eye className="w-3 h-3" /> Catalog clicks
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Searches</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.topSearches.length || 0}</div>
            <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <Search className="w-3 h-3" /> Unique keywords
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Search className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Insights Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Most Viewed Items Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Eye className="w-5 h-5 text-teal-600" /> Top Viewed Items Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Most engaged menu & catalog items based on customer clicks in the public view.
            </p>
          </div>

          <div className="space-y-4">
            {!analytics?.topItems || analytics.topItems.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                No item views recorded yet in this time period. Scan your QR code to test views!
              </div>
            ) : (
              analytics.topItems.map((item, index) => (
                <div key={item.id + index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">
                        #{index + 1}
                      </span>
                      {item.name}
                    </span>
                    <span className="text-slate-600 font-mono">
                      {item.views} views ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Data automatically refreshes upon customer scans.
          </div>
        </div>

        {/* Customer Search Keywords & Zero-Result Opportunities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="w-5 h-5 text-purple-600" /> Search Intelligence & Keyword Trends
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Keywords customers are searching for, including unlisted items they want to buy.
            </p>
          </div>

          <div className="space-y-4">
            {/* Top Keywords */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Popular Search Terms
              </div>
              {!analytics?.topSearches || analytics.topSearches.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No search queries logged yet.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analytics.topSearches.map((s) => (
                    <span
                      key={s.query}
                      className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>&quot;{s.query}&quot;</span>
                      <span className="px-1.5 py-0.2 bg-purple-200/80 rounded-md text-[10px] font-mono">
                        {s.count}x
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Zero Result Searches Alert Box */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Zero-Result Searches (Menu Expansion Ideas)
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Items customers searched for that yielded 0 matches in your catalog:
              </p>
              {!analytics?.zeroResultSearches || analytics.zeroResultSearches.length === 0 ? (
                <div className="text-xs text-amber-800 font-medium italic">
                  All customer searches found matching catalog items!
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analytics.zeroResultSearches.map((z) => (
                    <span
                      key={z.query}
                      className="px-2.5 py-1 bg-amber-200/70 text-amber-900 rounded-lg text-xs font-bold border border-amber-300"
                    >
                      &quot;{z.query}&quot; ({z.count} searches)
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
            Use zero-result searches to add popular requested dishes or products to your catalog.
          </div>
        </div>
      </div>

      {/* Device Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Smartphone className="w-5 h-5 text-blue-600" /> Visitor Mobile Device Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">iPhone / iOS</div>
            <div className="text-xl font-extrabold text-slate-900">{analytics?.deviceBreakdown.iphone || 0}</div>
            <div className="text-[10px] text-slate-400">Apple Safari / Chrome</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Android Mobile</div>
            <div className="text-xl font-extrabold text-slate-900">{analytics?.deviceBreakdown.android || 0}</div>
            <div className="text-[10px] text-slate-400">Android Chrome / Browser</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Desktop / Laptop</div>
            <div className="text-xl font-extrabold text-slate-900">{analytics?.deviceBreakdown.desktop || 0}</div>
            <div className="text-[10px] text-slate-400">Web Browsers</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Other Devices</div>
            <div className="text-xl font-extrabold text-slate-900">{analytics?.deviceBreakdown.other || 0}</div>
            <div className="text-[10px] text-slate-400">Tablets & Scanners</div>
          </div>
        </div>
      </div>
    </div>
  );
}
