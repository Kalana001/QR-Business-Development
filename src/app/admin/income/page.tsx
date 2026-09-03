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

    // Sort last 6 months
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

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
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
          
          {/* Monthly Revenue Breakdown List */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-white">Monthly Realized Income History</h2>
              </div>
              <span className="text-[11px] text-slate-400">Last 6 Months</span>
            </div>

            {metrics.monthlyList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment history recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {metrics.monthlyList.map((m) => {
                  const maxAmount = Math.max(...metrics.monthlyList.map((x) => x.amount), 1);
                  const barWidth = Math.max(8, Math.round((m.amount / maxAmount) * 100));

                  return (
                    <div key={m.monthName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{m.monthName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">{m.count} payments</span>
                          <span className="font-mono font-bold text-teal-400">{formatCurrency(m.amount, 'LKR')}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                <option value="all">All Plans</option>
                <option value="pro">Pro Growth</option>
                <option value="enterprise">Business Plus</option>
                <option value="enterprise_gift">Free Trial / Gift</option>
                <option value="free">Starter Free</option>
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
                          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Paid In Full
                          </div>
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
