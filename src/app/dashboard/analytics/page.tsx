'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  BarChart3, QrCode, Eye, Search, Smartphone, Users, Crown, Calendar, TrendingUp, AlertTriangle, ArrowUpRight, CheckCircle2, Lock, ArrowDownRight, Layers, Sparkles, ChevronLeft, ChevronRight, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/lib/types';
import { getAnalyticsSummary, AnalyticsSummary, MetricComparison, AnalyticsFilterOptions } from '@/lib/analytics';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function DashboardAnalyticsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [filterOption, setFilterOption] = useState<AnalyticsFilterOptions>({ type: '7d' });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [selectedTrendIndex, setSelectedTrendIndex] = useState<number | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(() => new Date().getFullYear());
  const monthPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    }
    if (isMonthPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  const getMonthFilterLabel = () => {
    if (filterOption.type === 'month' && filterOption.month) {
      const parts = filterOption.month.split('-');
      if (parts.length === 2) {
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${MONTH_NAMES[mIdx] || 'Month'} ${parts[0]}`;
      }
    }
    return 'Select Month';
  };

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
      const isSuperAdminUser = Boolean(adminRpc);
      setIsSuperAdmin(isSuperAdminUser);

      let targetBizId: string | null = null;
      if (typeof window !== 'undefined' && isSuperAdminUser) {
        const urlParams = new URLSearchParams(window.location.search);
        targetBizId = urlParams.get('biz') || sessionStorage.getItem('admin_active_biz_id');
      }

      let biz: Business | null = null;
      if (isSuperAdminUser && targetBizId) {
        const { data: adminSelectedBiz } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', targetBizId)
          .maybeSingle();
        biz = adminSelectedBiz as Business | null;
      }

      if (!biz) {
        const { data: userBiz } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        biz = userBiz as Business | null;
      }

      if (biz) {
        setBusiness(biz as Business);
        const data = await getAnalyticsSummary(biz.id, filterOption);
        setAnalytics(data);
      }
      setLoading(false);
    }

    loadData();
  }, [filterOption]);

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
    const periodLabel = (filterOption.type === 'this_month' || filterOption.type === 'month') ? 'vs prev month' : 'vs prev period';
    return (
      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5" />
        )}
        {Math.abs(metric.percentageChange)}% {periodLabel}
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
              <Crown className="w-3 h-3 text-purple-600" /> {planKey === 'enterprise_gift' ? '🎁 Free Trial Active' : 'Business Plus Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time customer engagement metrics, scan traffic, and product intelligence.
          </p>
        </div>

        {/* Date Filter Buttons & Monthly Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shrink-0">
            <button
              onClick={() => setFilterOption({ type: '7d' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterOption.type === '7d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setFilterOption({ type: '30d' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterOption.type === '30d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setFilterOption({ type: 'this_month' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterOption.type === 'this_month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Monthly Calendar Popover Picker */}
          <div className="relative" ref={monthPickerRef}>
            <button
              type="button"
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-xs cursor-pointer ${
                filterOption.type === 'month'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 ring-2 ring-indigo-200'
                  : 'bg-white text-slate-700 border-slate-300/80 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${filterOption.type === 'month' ? 'text-white' : 'text-indigo-600'}`} />
              <span>{getMonthFilterLabel()}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMonthPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMonthPickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 z-40 animate-fade-in">
                {/* Year Navigation Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPickerYear((y) => y - 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-extrabold text-slate-900">
                    {pickerYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerYear((y) => y + 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 12-Month Calendar Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_SHORT.map((mShort, idx) => {
                    const mValue = `${pickerYear}-${String(idx + 1).padStart(2, '0')}`;
                    const isSelected = filterOption.type === 'month' && filterOption.month === mValue;
                    const isCurrent = new Date().getFullYear() === pickerYear && new Date().getMonth() === idx;

                    return (
                      <button
                        key={mShort}
                        type="button"
                        onClick={() => {
                          setFilterOption({ type: 'month', month: mValue });
                          setIsMonthPickerOpen(false);
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                            : isCurrent
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{mShort}</span>
                        {isCurrent && !isSelected && (
                          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Quick Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setPickerYear(now.getFullYear());
                      setFilterOption({ type: 'this_month' });
                      setIsMonthPickerOpen(false);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
                  >
                    Current Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMonthPickerOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 2 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            {/* Interactive Bar Chart Viewport - 100% Fixed Frame (No Horizontal Scroll) */}
            <div className="relative h-72 pt-14 pb-2 px-2 sm:px-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 flex items-end justify-between gap-0.5 sm:gap-1 w-full overflow-visible">
              {/* Subtle Horizontal Gridlines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pt-14 opacity-40" aria-hidden="true">
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
                const isDense = totalTrends > 10;
                
                // Show milestone labels on dense views (e.g. 30 days) to prevent text collision
                const showDateLabel = !isDense || idx === 0 || idx === totalTrends - 1 || idx % Math.ceil(totalTrends / 6) === 0 || isActive;

                let tooltipAlignClass = "left-1/2 -translate-x-1/2";
                let arrowAlignClass = "left-1/2 -translate-x-1/2";

                if (idx < 3) {
                  tooltipAlignClass = "left-0 translate-x-0";
                  arrowAlignClass = "left-3 translate-x-0";
                } else if (idx >= totalTrends - 3) {
                  tooltipAlignClass = "right-0 left-auto translate-x-0";
                  arrowAlignClass = "right-3 left-auto translate-x-0";
                }

                return (
                  <div
                    key={t.date + idx}
                    onMouseEnter={() => setHoveredTrendIndex(idx)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                    onClick={() => setSelectedTrendIndex(idx)}
                    className={`flex-1 min-w-0 h-full flex flex-col items-center justify-end group cursor-pointer relative z-10 transition-all duration-200 p-0.5 rounded-lg ${
                      isActive ? 'bg-white/90 shadow-md ring-2 ring-indigo-500 scale-105' : 'hover:bg-white/60'
                    }`}
                  >
                    {/* Floating Interactive Popover Tooltip */}
                    {isActive && (
                      <div className={`absolute -top-12 z-30 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 text-center whitespace-nowrap animate-fade-in pointer-events-none ${tooltipAlignClass}`}>
                        <div className="text-[10px] font-extrabold text-indigo-300">{t.date}</div>
                        <div className="text-[11px] font-bold flex items-center justify-center gap-1.5 mt-0.5">
                          <span className="text-teal-400 font-extrabold">{t.scans} Scans</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-indigo-400 font-extrabold">{t.views} Views</span>
                        </div>
                        {/* Down Arrow Tip */}
                        <div className={`absolute -bottom-1 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700 ${arrowAlignClass}`} />
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-40">
                      {/* QR Scans Bar */}
                      <div
                        className={`rounded-t-sm sm:rounded-t-md transition-all duration-300 shadow-xs ${
                          isDense ? 'w-full max-w-[5px] sm:max-w-[7px]' : 'w-3 sm:w-4'
                        } ${
                          isActive
                            ? 'bg-gradient-to-t from-teal-600 via-teal-500 to-teal-400 ring-1 ring-teal-300'
                            : 'bg-gradient-to-t from-teal-500 to-teal-400/80 group-hover:from-teal-600 group-hover:to-teal-400'
                        }`}
                        style={{ height: `${t.scans > 0 ? scanHeight : 6}%` }}
                      />

                      {/* Item Views Bar */}
                      <div
                        className={`rounded-t-sm sm:rounded-t-md transition-all duration-300 shadow-xs ${
                          isDense ? 'w-full max-w-[5px] sm:max-w-[7px]' : 'w-3 sm:w-4'
                        } ${
                          isActive
                            ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 ring-1 ring-indigo-300'
                            : 'bg-gradient-to-t from-indigo-500 to-indigo-400/80 group-hover:from-indigo-600 group-hover:to-indigo-400'
                        }`}
                        style={{ height: `${t.views > 0 ? viewHeight : 6}%` }}
                      />
                    </div>

                    <div className="h-5 flex items-center justify-center w-full">
                      {showDateLabel ? (
                        <span className={`text-[9px] sm:text-[10px] font-bold truncate transition-colors ${
                          isActive ? 'text-indigo-900 font-extrabold' : 'text-slate-500 group-hover:text-slate-900'
                        }`}>
                          {t.date}
                        </span>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
                      )}
                    </div>
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

        {/* Visitor Device Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Smartphone className="w-5 h-5 text-blue-600" /> Visitor Device Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Breakdown of devices used by customers to scan and browse your catalog.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
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

          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Real-time mobile vs desktop traffic analysis.
          </div>
        </div>
      </div>
    </div>
  );
}
