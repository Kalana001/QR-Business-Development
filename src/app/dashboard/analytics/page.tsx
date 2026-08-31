'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, QrCode, Eye, Search, Smartphone, Users, Crown, Calendar, TrendingUp, AlertTriangle, ArrowUpRight, CheckCircle2, Lock, ArrowDownRight, Layers, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/lib/types';
import { getAnalyticsSummary, AnalyticsSummary, MetricComparison } from '@/lib/analytics';

export default function DashboardAnalyticsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [daysFilter, setDaysFilter] = useState<number>(7);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [selectedTrendIndex, setSelectedTrendIndex] = useState<number | null>(null);

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
  const isBusinessPlan = isSuperAdmin || planKey === 'enterprise' || planKey === 'enterprise_gift' || planKey === 'business' || planKey === 'business_plus';

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

  // Render Metric Trend Pill
  const renderMetricTrend = (metric?: MetricComparison) => {
    if (!metric || metric.notEnoughData || metric.percentageChange === null) {
      return (
        <span className="text-[11px] text-slate-400 font-medium">
          Not enough data
        </span>
      );
    }

    const isPositive = metric.percentageChange >= 0;
    return (
      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5" />
        )}
        {Math.abs(metric.percentageChange)}% vs prev period
      </span>
    );
  };

  const hasActivity = (analytics?.totalScans || 0) > 0 || (analytics?.totalItemViews || 0) > 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Date Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Business Analytics Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-purple-200">
              <Crown className="w-3 h-3 text-purple-600" /> {planKey === 'enterprise_gift' ? '🎁 VIP Complimentary Gift Active' : 'Business Plus Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time customer engagement metrics, scan traffic, and product intelligence.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setDaysFilter(7)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              daysFilter === 7
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDaysFilter(30)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              daysFilter === 30
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDaysFilter(365)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">QR Scans</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.totalScans || 0}</div>
            {renderMetricTrend(analytics?.scansMetric)}
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Item Views</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.totalItemViews || 0}</div>
            {renderMetricTrend(analytics?.itemViewsMetric)}
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Searches</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.topSearches.length || 0}</div>
            {renderMetricTrend(analytics?.searchesMetric)}
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Zero-Result Searches</div>
            <div className="text-2xl font-black text-slate-900">{analytics?.zeroResultSearches.length || 0}</div>
            <div className="text-[11px] text-amber-600 font-semibold">Expansion opportunities</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-700 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TRAFFIC TREND CHART SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Traffic & Engagement Trends
            </h3>
            <p className="text-xs text-slate-500">
              Daily recorded QR scans and catalog item views over the selected period.
            </p>
          </div>
        </div>

        {!hasActivity ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-extrabold text-slate-900">No catalog activity yet</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your analytics traffic trend will appear here as soon as customers scan your QR code and browse your catalog.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Interactive Bar Chart Viewport with Generous Headroom for Popovers */}
            <div className="relative h-72 pt-16 pb-3 px-3 border-b border-slate-100 bg-slate-50/50 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar flex items-end justify-between gap-2">
              {/* Subtle Horizontal Gridlines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pt-16 opacity-40" aria-hidden="true">
                <div className="w-full border-b border-dashed border-slate-300" />
                <div className="w-full border-b border-dashed border-slate-300" />
                <div className="w-full border-b border-dashed border-slate-300" />
                <div className="w-full border-b border-dashed border-slate-300" />
              </div>

              {(analytics?.dailyTrends || []).map((t, idx) => {
                const maxVal = Math.max(...(analytics?.dailyTrends || []).map((item) => Math.max(item.scans, item.views)), 1);
                const scanHeight = Math.max(Math.round((t.scans / maxVal) * 100), 8);
                const viewHeight = Math.max(Math.round((t.views / maxVal) * 100), 8);

                const isSelected = selectedTrendIndex === idx;
                const isHovered = hoveredTrendIndex === idx;
                const isActive = isSelected || (selectedTrendIndex === null && isHovered);

                const totalTrends = (analytics?.dailyTrends || []).length;
                const isNearStart = idx < 2;
                const isNearEnd = idx >= totalTrends - 2;

                let tooltipAlignClass = "left-1/2 -translate-x-1/2";
                let arrowAlignClass = "left-1/2 -translate-x-1/2";

                if (isNearStart) {
                  tooltipAlignClass = "left-0 translate-x-0";
                  arrowAlignClass = "left-4 translate-x-0";
                } else if (isNearEnd) {
                  tooltipAlignClass = "right-0 left-auto translate-x-0";
                  arrowAlignClass = "right-4 left-auto translate-x-0";
                }

                return (
                  <div
                    key={t.date + idx}
                    onMouseEnter={() => setHoveredTrendIndex(idx)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                    onClick={() => setSelectedTrendIndex(idx)}
                    className={`flex-1 min-w-[32px] flex flex-col items-center gap-2 group cursor-pointer relative z-10 transition-all duration-200 p-1 rounded-xl ${
                      isActive ? 'bg-white shadow-md ring-2 ring-indigo-500 scale-105' : 'hover:bg-white/80 hover:shadow-xs'
                    }`}
                  >
                    {/* Floating Interactive Popover Tooltip (Positioned in Headroom) */}
                    {isActive && (
                      <div className={`absolute -top-12 z-30 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl shadow-2xl border border-slate-700 text-center whitespace-nowrap animate-fade-in pointer-events-none ${tooltipAlignClass}`}>
                        <div className="text-[10px] font-extrabold text-indigo-300">{t.date}</div>
                        <div className="text-[11px] font-bold flex items-center justify-center gap-2 mt-0.5">
                          <span className="text-teal-400 font-extrabold">{t.scans} Scans</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-indigo-400 font-extrabold">{t.views} Views</span>
                        </div>
                        {/* Down Arrow Tip */}
                        <div className={`absolute -bottom-1 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700 ${arrowAlignClass}`} />
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      {/* QR Scans Bar */}
                      <div
                        className={`w-3.5 rounded-t-lg transition-all duration-300 shadow-xs ${
                          isActive
                            ? 'bg-gradient-to-t from-teal-600 via-teal-500 to-teal-400 ring-1 ring-teal-300'
                            : 'bg-gradient-to-t from-teal-500 to-teal-400/80 group-hover:from-teal-600 group-hover:to-teal-400'
                        }`}
                        style={{ height: `${t.scans > 0 ? scanHeight : 6}%` }}
                      />

                      {/* Item Views Bar */}
                      <div
                        className={`w-3.5 rounded-t-lg transition-all duration-300 shadow-xs ${
                          isActive
                            ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 ring-1 ring-indigo-300'
                            : 'bg-gradient-to-t from-indigo-500 to-indigo-400/80 group-hover:from-indigo-600 group-hover:to-indigo-400'
                        }`}
                        style={{ height: `${t.views > 0 ? viewHeight : 6}%` }}
                      />
                    </div>

                    <span className={`text-[10px] font-bold truncate transition-colors ${
                      isActive ? 'text-indigo-900 font-extrabold' : 'text-slate-500 group-hover:text-slate-900'
                    }`}>
                      {t.date}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-1 px-2 text-slate-600">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-t from-teal-600 to-teal-400 shadow-xs" /> QR Scans
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-xs" /> Item Views
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium italic hidden sm:inline">
                💡 Hover or click any column to inspect daily metrics.
              </span>
            </div>
          </div>
        )}
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
                Customers searched for these keywords but your catalog yielded 0 matching items:
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
          <Smartphone className="w-5 h-5 text-blue-600" /> Visitor Device Distribution
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
