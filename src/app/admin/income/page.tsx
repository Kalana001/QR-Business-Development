'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  ArrowLeft, 
  Search, 
  Filter, 
  Receipt, 
  Printer, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Layers,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { SUBSCRIPTION_PLANS_META, SubscriptionPlan } from '@/lib/types';
import { ReceiptModal, PaymentTransaction } from '@/components/admin/ReceiptModal';

interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  subscription_plan: SubscriptionPlan;
  billing_interval: 'monthly' | 'annual';
  subscription_status: string;
  subscription_end_date: string | null;
  email?: string | null;
  phone?: string | null;
}

export default function AdminIncomePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedIntervalFilter, setSelectedIntervalFilter] = useState<string>('all');

  // Receipt Modal State
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentTransaction | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Load Admin Data
  const loadAdminFinancials = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || (user.email?.toLowerCase() !== 'adminkal@gmail.com' && user.email !== 'AdminKal@gmail.com')) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      // 1. Fetch Payment Ledger
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('subscription_payments')
        .select('*, businesses(name, slug, email, phone, address, currency)')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      } else {
        setPayments(paymentsData || []);
      }

      // 2. Fetch All Businesses for Future Forecasting
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('id, name, slug, subscription_plan, billing_interval, subscription_status, subscription_end_date, email, phone');

      if (businessesError) {
        console.error('Error fetching businesses for forecast:', businessesError);
      } else {
        setBusinesses(businessesData || []);
      }

    } catch (err) {
      console.error('Failed to load admin income data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminFinancials();
  }, []);

  // Financial Calculations
  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalRealized = 0;
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    let paidTransactionsCount = 0;

    const monthlyAggregation: Record<string, { monthName: string; amount: number; count: number; date: Date }> = {};

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (amt > 0) {
        totalRealized += amt;
        paidTransactionsCount += 1;
      }

      const pDate = new Date(p.created_at);
      const pYear = pDate.getFullYear();
      const pMonth = pDate.getMonth();

      if (pYear === currentYear && pMonth === currentMonth) {
        thisMonthTotal += amt;
      }

      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      if (pYear === prevYear && pMonth === prevMonth) {
        lastMonthTotal += amt;
      }

      // Monthly breakdown key: "YYYY-MM"
      const monthKey = `${pYear}-${String(pMonth + 1).padStart(2, '0')}`;
      const monthLabel = pDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyAggregation[monthKey]) {
        monthlyAggregation[monthKey] = {
          monthName: monthLabel,
          amount: 0,
          count: 0,
          date: new Date(pYear, pMonth, 1)
        };
      }
      monthlyAggregation[monthKey].amount += amt;
      if (amt > 0) {
        monthlyAggregation[monthKey].count += 1;
      }
    });

    // Chronological last 6 months (oldest to newest for line chart timeline)
    const chronologicalMonths: { monthKey: string; monthName: string; amount: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const k = `${y}-${String(m + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const record = monthlyAggregation[k];
      chronologicalMonths.push({
        monthKey: k,
        monthName: label,
        amount: record ? record.amount : 0,
        count: record ? record.count : 0
      });
    }

    const monthlyList = Object.values(monthlyAggregation)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);

    // Future Revenue Forecasting (Next 30, 60, 90 Days)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    let projected30Days = 0;
    let projected60Days = 0;
    let projected90Days = 0;
    let upcomingRenewalsCount30 = 0;

    let activeProCount = 0;
    let activePlusCount = 0;
    let activeFreeCount = 0;

    businesses.forEach((b) => {
      if (b.subscription_plan === 'pro') activeProCount += 1;
      else if (b.subscription_plan === 'enterprise' || b.subscription_plan === 'enterprise_gift') activePlusCount += 1;
      else activeFreeCount += 1;

      if (b.subscription_status === 'active' && b.subscription_end_date && b.subscription_plan !== 'free') {
        const endDate = new Date(b.subscription_end_date);
        
        let renewalRate = 0;
        if (b.subscription_plan === 'pro') {
          renewalRate = b.billing_interval === 'annual' ? 21000 : 2000;
        } else if (b.subscription_plan === 'enterprise') {
          renewalRate = b.billing_interval === 'annual' ? 36000 : 3500;
        }

        if (endDate >= now && endDate <= thirtyDaysFromNow) {
          projected30Days += renewalRate;
          upcomingRenewalsCount30 += 1;
        }
        if (endDate >= now && endDate <= sixtyDaysFromNow) {
          projected60Days += renewalRate;
        }
        if (endDate >= now && endDate <= ninetyDaysFromNow) {
          projected90Days += renewalRate;
        }
      }
    });

    const monthGrowthPercent = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonthTotal > 0 ? 100 : 0;

    return {
      totalRealized,
      thisMonthTotal,
      lastMonthTotal,
      monthGrowthPercent,
      paidTransactionsCount,
      monthlyList,
      chronologicalMonths,
      projected30Days,
      projected60Days,
      projected90Days,
      upcomingRenewalsCount30,
      activeProCount,
      activePlusCount,
      activeFreeCount,
      totalActivePaid: activeProCount + activePlusCount
    };
  }, [payments, businesses]);

  // Filtered Payments List (Excluding Free Tier)
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Exclude free package customers from payment & receipt ledger
      if (p.plan === 'free') return false;

      const bName = p.businesses?.name?.toLowerCase() || '';
      const bSlug = p.businesses?.slug?.toLowerCase() || '';
      const receiptNo = `rcp-${new Date(p.created_at).getFullYear()}-${p.id.slice(0, 6)}`.toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || bName.includes(q) || bSlug.includes(q) || receiptNo.includes(q);

      const matchesPlan = selectedPlanFilter === 'all' || p.plan === selectedPlanFilter;
      const matchesInterval = selectedIntervalFilter === 'all' || p.billing_interval === selectedIntervalFilter;

      return matchesSearch && matchesPlan && matchesInterval;
    });
  }, [payments, searchQuery, selectedPlanFilter, selectedIntervalFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading financial intelligence ledger...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This financial income center is reserved exclusively for Super Administrative accounts.
          </p>
          <Link href="/login">
            <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs mt-2">
              Sign In as Super Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-teal-500 selection:text-slate-950 pb-20">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Super Admin Financials &amp; Revenue</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Live Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400">Income metrics, recurring forecast &amp; digital receipt generation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdminFinancials}
              className="gap-1.5 text-xs text-slate-300 border-slate-700 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Site Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-800/60 pt-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800/40"
          >
            <Building2 className="w-4 h-4" /> Business Directory &amp; Accounts
          </Link>
          <Link
            href="/admin/income"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all bg-slate-800 text-teal-400 border-t-2 border-teal-400"
          >
            <DollarSign className="w-4 h-4" /> Financials &amp; Income Analytics
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Realized Revenue */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Realized Revenue</span>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {formatCurrency(metrics.totalRealized, 'LKR')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                From {metrics.paidTransactionsCount} paid activations to date
              </p>
            </div>
          </div>

          {/* Current Month Income */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month (MRR)</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {formatCurrency(metrics.thisMonthTotal, 'LKR')}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <span className={`font-bold ${metrics.monthGrowthPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics.monthGrowthPercent >= 0 ? '+' : ''}{metrics.monthGrowthPercent}%
                </span>
                <span className="text-slate-400">vs last month ({formatCurrency(metrics.lastMonthTotal, 'LKR')})</span>
              </div>
            </div>
          </div>

          {/* Projected Future Income (Next 30 Days) */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next 30D Renewal Forecast</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono tracking-tight">
                {formatCurrency(metrics.projected30Days, 'LKR')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {metrics.upcomingRenewalsCount30} active subscriptions expiring soon
              </p>
            </div>
          </div>

          {/* Active Paid Subscribers */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Paid Clients</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                {metrics.totalActivePaid} Businesses
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {metrics.activeProCount} Pro &bull; {metrics.activePlusCount} Plus &bull; {metrics.activeFreeCount} Free
              </p>
            </div>
          </div>

        </div>

        {/* Future Forecasting & Month-Over-Month Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Monthly Realized Income Line Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-white">Monthly Realized Income History</h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[11px] text-slate-400">Last 6 Months Line Trend</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  LKR {metrics.chronologicalMonths.reduce((sum, m) => sum + m.amount, 0).toLocaleString()} 6M Total
                </span>
              </div>
            </div>

            {/* Line Chart Render */}
            {(() => {
              const months = metrics.chronologicalMonths;
              const maxVal = Math.max(...months.map((m) => m.amount), 5000);
              const paddingX = 40;
              const paddingTop = 25;
              const chartHeight = 140;
              const totalWidth = 560;
              const innerWidth = totalWidth - paddingX * 2;
              const stepX = innerWidth / (months.length - 1);

              const points = months.map((m, idx) => {
                const x = paddingX + idx * stepX;
                const ratio = m.amount / maxVal;
                const y = paddingTop + (chartHeight - ratio * chartHeight);
                return { x, y, ...m };
              });

              // Construct Smooth Curve or Polyline Path
              const pathD = points.reduce((acc, p, idx) => {
                if (idx === 0) return `M ${p.x} ${p.y}`;
                const prev = points[idx - 1];
                const cx = (prev.x + p.x) / 2;
                return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
              }, '');

              const firstPoint = points[0];
              const lastPoint = points[points.length - 1];
              const baseY = paddingTop + chartHeight;
              const areaD = `${pathD} L ${lastPoint.x} ${baseY} L ${firstPoint.x} ${baseY} Z`;

              return (
                <div className="relative w-full overflow-hidden pt-2">
                  <svg 
                    viewBox={`0 0 ${totalWidth} 220`} 
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      {/* Gradient Fill under the Line */}
                      <linearGradient id="revenue-line-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
                        <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                      </linearGradient>

                      {/* Drop Glow on Line */}
                      <filter id="teal-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#14B8A6" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    {/* Horizontal Gridlines & Y-Axis Labels */}
                    {[1, 0.75, 0.5, 0.25, 0].map((level, i) => {
                      const yPos = paddingTop + (chartHeight - level * chartHeight);
                      const labelVal = Math.round(maxVal * level);
                      return (
                        <g key={i}>
                          <line
                            x1={paddingX}
                            y1={yPos}
                            x2={totalWidth - paddingX}
                            y2={yPos}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeDasharray={i === 4 ? '0' : '4,4'}
                            strokeWidth="1"
                          />
                          <text
                            x={paddingX - 8}
                            y={yPos + 3}
                            textAnchor="end"
                            fill="#64748B"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area Gradient Fill */}
                    <path d={areaD} fill="url(#revenue-line-gradient)" />

                    {/* Glow Line Stroke */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#14B8A6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#teal-glow)"
                    />

                    {/* Nodes / Data Points */}
                    {points.map((p, idx) => {
                      const isHovered = hoveredPointIndex === idx;
                      return (
                        <g 
                          key={idx}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredPointIndex(idx)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                        >
                          {/* Outer pulse aura if hovered */}
                          {isHovered && (
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="12"
                              fill="#14B8A6"
                              opacity="0.25"
                              className="animate-ping"
                            />
                          )}

                          {/* Outer ring */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? '7' : '5'}
                            fill="#0F172A"
                            stroke="#2DD4BF"
                            strokeWidth={isHovered ? '3.5' : '2.5'}
                          />

                          {/* Center dot */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? '3' : '2'}
                            fill="#FFFFFF"
                          />

                          {/* Month X-Axis Label */}
                          <text
                            x={p.x}
                            y={baseY + 22}
                            textAnchor="middle"
                            fill={isHovered ? '#2DD4BF' : '#94A3B8'}
                            fontSize="11"
                            fontWeight={isHovered ? 'bold' : 'normal'}
                          >
                            {p.monthName}
                          </text>

                          {/* Data Value Label above Node */}
                          {p.amount > 0 && (
                            <text
                              x={p.x}
                              y={p.y - 12}
                              textAnchor="middle"
                              fill={isHovered ? '#2DD4BF' : '#E2E8F0'}
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {p.amount >= 1000 ? `${(p.amount / 1000).toFixed(1)}k` : p.amount}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Hovered Month Detail Card */}
                  {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                    <div 
                      className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-teal-500/40 text-xs shadow-xl flex items-center gap-3 backdrop-blur-md animate-fade-in pointer-events-none"
                    >
                      <div>
                        <span className="font-bold text-white">{points[hoveredPointIndex].monthName}:</span>{' '}
                        <span className="font-mono font-black text-teal-400">
                          {formatCurrency(points[hoveredPointIndex].amount, 'LKR')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-800">
                        {points[hoveredPointIndex].count} paid activations
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Future Projection Pipeline */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">Future Revenue Pipeline</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Next 30 Days</div>
                  <div className="text-[10px] text-slate-400">Expiring soon &bull; Expected renewal</div>
                </div>
                <div className="text-right font-mono font-black text-sm text-purple-400">
                  {formatCurrency(metrics.projected30Days, 'LKR')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Next 60 Days</div>
                  <div className="text-[10px] text-slate-400">Cumulative 2-Month pipeline</div>
                </div>
                <div className="text-right font-mono font-black text-sm text-slate-200">
                  {formatCurrency(metrics.projected60Days, 'LKR')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Next 90 Days</div>
                  <div className="text-[10px] text-slate-400">Quarterly forward projection</div>
                </div>
                <div className="text-right font-mono font-black text-sm text-slate-200">
                  {formatCurrency(metrics.projected90Days, 'LKR')}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                Projections are calculated based on currently active paid businesses renewing at standard rates upon their respective expiration dates.
              </p>
            </div>
          </div>

        </div>

        {/* Transaction History & Payment Ledger */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-400" /> Payment &amp; Receipt Ledger
              </h2>
              <p className="text-xs text-slate-400">Automatic payment records and customer receipt generation</p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by business or receipt #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500 w-52 sm:w-64"
                />
              </div>

              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-teal-500"
              >
                <option value="all">All Paid Plans</option>
                <option value="pro">Pro Growth</option>
                <option value="enterprise">Business Plus</option>
                <option value="enterprise_gift">Free Trial / Gift</option>
              </select>

              <select
                value={selectedIntervalFilter}
                onChange={(e) => setSelectedIntervalFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-teal-500"
              >
                <option value="all">All Intervals</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No payment records found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or filter options.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Business</th>
                    <th className="p-3">Plan &amp; Interval</th>
                    <th className="p-3">Amount Paid</th>
                    <th className="p-3">Active Period</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3 text-right">Receipt Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.map((p) => {
                    const planMeta = SUBSCRIPTION_PLANS_META[p.plan] || { name: p.plan.toUpperCase() };
                    const receiptNo = `RCP-${new Date(p.created_at).getFullYear()}-${p.id.slice(0, 6).toUpperCase()}`;
                    const startDateFormatted = new Date(p.start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const endDateFormatted = new Date(p.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const paymentDateFormatted = new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Receipt No */}
                        <td className="p-3">
                          <span className="font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                            {receiptNo}
                          </span>
                        </td>

                        {/* Business */}
                        <td className="p-3">
                          <div className="font-bold text-white">{p.businesses?.name || 'Unknown Business'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">/c/{p.businesses?.slug}</div>
                        </td>

                        {/* Plan */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200">{planMeta.name}</span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                              {p.billing_interval}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{p.payment_reference === 'Super Admin Manual Approval' || !p.payment_reference ? 'Bank Transfer (Admin Approval)' : p.payment_reference}</div>
                        </td>

                        {/* Amount */}
                        <td className="p-3">
                          <div className="font-black text-sm font-mono text-white">
                            {formatCurrency(p.amount, p.currency || 'LKR')}
                          </div>
                          {p.plan === 'enterprise_gift' || p.amount === 0 ? (
                            <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Free
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Paid In Full
                            </div>
                          )}
                        </td>

                        {/* Period */}
                        <td className="p-3 text-slate-300">
                          <div className="text-[11px] font-medium">{startDateFormatted}</div>
                          <div className="text-[10px] text-slate-500">to {endDateFormatted}</div>
                        </td>

                        {/* Date */}
                        <td className="p-3 text-slate-400 text-[11px]">
                          {paymentDateFormatted}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setSelectedPaymentForReceipt(p)}
                            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold gap-1.5"
                          >
                            <Receipt className="w-3.5 h-3.5" /> View Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedPaymentForReceipt)}
        onClose={() => setSelectedPaymentForReceipt(null)}
        payment={selectedPaymentForReceipt}
      />

    </div>
  );
}
