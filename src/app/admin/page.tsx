'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Calendar, Crown, ExternalLink, RefreshCw, Zap, DollarSign, BarChart3, QrCode, Eye, Smartphone, TrendingUp, Users, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import { Business, SubscriptionPlan, SubscriptionStatus, SUBSCRIPTION_PLANS_META } from '@/lib/types';
import { getGlobalPlatformAnalytics, getAnalyticsSummary, GlobalAnalyticsSummary, AnalyticsSummary } from '@/lib/analytics';

interface BusinessWithMetrics extends Business {
  item_count?: number;
  category_count?: number;
  owner_email?: string;
  is_super_admin_owner?: boolean;
}

export default function SuperAdminDashboardPage() {
  const [businesses, setBusinesses] = useState<BusinessWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [totalScansCount, setTotalScansCount] = useState<number>(0);
  const [globalAnalytics, setGlobalAnalytics] = useState<GlobalAnalyticsSummary | null>(null);

  // Inspector Modal State
  const [inspectBiz, setInspectBiz] = useState<BusinessWithMetrics | null>(null);
  const [inspectAnalytics, setInspectAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // Subscription Approval Modal State
  const [selectedBiz, setSelectedBiz] = useState<BusinessWithMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal Form Fields
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro');
  const [startDateStr, setStartDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadMasterDirectory();
  }, []);

  async function loadMasterDirectory() {
    setLoading(true);
    const supabase = createClient();

    // Fetch all businesses
    const { data: bizData, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (bizError) {
      console.error('Admin fetch error:', bizError);
      setLoading(false);
      return;
    }

    // Fetch items & categories counts for metrics
    const { data: itemsData } = await supabase.from('catalog_items').select('id, business_id');
    const { data: catData } = await supabase.from('categories').select('id, business_id');
    const { data: profilesData } = await supabase.from('profiles').select('id, full_name');
    const { data: authUser } = await supabase.auth.getUser();

    // Query platform scans
    let scansCount = 0;
    try {
      const { count } = await supabase.from('analytics_qr_scans').select('*', { count: 'exact', head: true });
      if (count !== null) scansCount = count;
    } catch (e) {
      // fallback
    }
    setTotalScansCount(scansCount);

    const enriched = (bizData || []).map((b) => {
      const itemsCount = (itemsData || []).filter((i) => i.business_id === b.id).length;
      const catCount = (catData || []).filter((c) => c.business_id === b.id).length;
      const profile = (profilesData || []).find((p) => p.id === b.owner_id);
      
      const isSuperAdminOwner = (b.name && b.name.toLowerCase().includes('master super admin')) || 
        (profile?.full_name && profile.full_name.toLowerCase().includes('super admin')) ||
        (authUser.user?.id === b.owner_id);

      return {
        ...b,
        item_count: itemsCount,
        category_count: catCount,
        owner_email: profile?.full_name || 'Owner',
        is_super_admin_owner: isSuperAdminOwner,
      };
    });

    setBusinesses(enriched);

    // Fetch Global Platform Analytics
    const globalData = await getGlobalPlatformAnalytics(enriched);
    setGlobalAnalytics(globalData);
    setTotalScansCount(globalData.totalPlatformScans);

    setLoading(false);
  }

  const handleInspectAnalytics = async (biz: BusinessWithMetrics) => {
    setInspectBiz(biz);
    setLoadingInspect(true);
    setIsInspectorOpen(true);
    const summary = await getAnalyticsSummary(biz.id, 30);
    setInspectAnalytics(summary);
    setLoadingInspect(false);
  };

  const openApprovalModal = (biz: BusinessWithMetrics) => {
    if (biz.is_super_admin_owner) return;
    setSelectedBiz(biz);
    setSelectedPlan(biz.subscription_plan || 'pro');
    
    const today = new Date().toISOString().split('T')[0];
    setStartDateStr(biz.subscription_start_date ? new Date(biz.subscription_start_date).toISOString().split('T')[0] : today);
    
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleApproveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const planMeta = SUBSCRIPTION_PLANS_META[selectedPlan];
      const startDate = new Date(startDateStr);
      
      // Automatically set end date to +1 Month from Start Date
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const supabase = createClient();
      
      // Securely invoke server-side RPC for subscription update
      const { data: rpcResult, error } = await supabase.rpc('admin_update_subscription', {
        p_business_id: selectedBiz.id,
        p_plan: selectedPlan,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      });

      if (error) throw error;

      setSuccessMsg(`Successfully activated ${planMeta.name} for 1 month! Valid until ${endDate.toLocaleDateString()}`);
      
      // Reload directory
      await loadMasterDirectory();
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to calculate days remaining
  function getDaysRemaining(endDateStr?: string | null, isSuperAdmin = false): { text: string; isExpired: boolean; days: number } {
    if (isSuperAdmin) return { text: 'Unlimited', isExpired: false, days: 9999 };
    if (!endDateStr) return { text: 'Active Free (Perpetual)', isExpired: false, days: 9999 };
    const now = new Date();
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { text: `Expired (${Math.abs(diffDays)}d ago)`, isExpired: true, days: diffDays };
    }
    return { text: `${diffDays} days left`, isExpired: false, days: diffDays };
  }

  // Filtered Business List
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.email && b.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (planFilter === 'all') return matchesSearch;
    if (planFilter === 'expired') return matchesSearch && getDaysRemaining(b.subscription_end_date, b.is_super_admin_owner).isExpired;
    return matchesSearch && b.subscription_plan === planFilter;
  });

  // Calculate Customer Revenue Analytics (Excluding Super Admin Workspace)
  const customerBusinesses = businesses.filter((b) => !b.is_super_admin_owner);
  const proAccounts = customerBusinesses.filter((b) => b.subscription_plan === 'pro' && !getDaysRemaining(b.subscription_end_date).isExpired).length;
  const enterpriseAccounts = customerBusinesses.filter((b) => b.subscription_plan === 'enterprise' && !getDaysRemaining(b.subscription_end_date).isExpired).length;
  const freeAccounts = customerBusinesses.filter((b) => b.subscription_plan === 'free' || !b.subscription_plan).length;
  const monthlyRevenue = (proAccounts * 2000) + (enterpriseAccounts * 3500);

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Platform Control Console
          </div>
          <h1 className="text-2xl font-extrabold text-white">Super Admin Directory</h1>
          <p className="text-xs text-slate-400">
            Manage registered customer businesses, approve monthly subscriptions, and inspect live catalogs.
          </p>
        </div>

        <Button onClick={loadMasterDirectory} variant="outline" size="sm" className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </Button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Revenue</div>
            <div className="text-2xl font-extrabold text-teal-400 mt-1">
              LKR {monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Estimated MRR</div>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Businesses</div>
            <div className="text-2xl font-extrabold text-white mt-1">{customerBusinesses.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">{freeAccounts} Free Forever accounts</div>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pro Growth Accounts</div>
            <div className="text-2xl font-extrabold text-teal-400 mt-1">{proAccounts}</div>
            <div className="text-[11px] text-slate-500 mt-1">LKR 2,000 / month</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Plus Accounts</div>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">{enterpriseAccounts}</div>
            <div className="text-[11px] text-slate-500 mt-1">LKR 3,500 / month</div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Crown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Global Platform QR Traffic & Business Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Most Scanned Businesses Leaderboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-400" /> Top Scanned Businesses (Leaderboard)
            </h3>
            <span className="text-xs font-mono text-teal-400 font-bold px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
              {globalAnalytics?.totalPlatformScans || 0} Total Scans
            </span>
          </div>

          <div className="space-y-3">
            {!globalAnalytics?.topBusinesses || globalAnalytics.topBusinesses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                No scan activity recorded yet across registered businesses.
              </div>
            ) : (
              globalAnalytics.topBusinesses.map((biz, idx) => (
                <div key={biz.businessId + idx} className="space-y-1.5 p-2 bg-slate-950/40 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
                        #{idx + 1}
                      </span>
                      {biz.businessName}
                    </span>
                    <span className="text-teal-400 font-mono">
                      {biz.scanCount} scans ({biz.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(biz.percentage, 8)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Peak Hours Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Global Peak Scanning Hours
            </h3>
            <p className="text-xs text-slate-400 mt-1">Scan activity distribution across customer peak dining & shopping hours.</p>
          </div>

          <div className="flex items-end justify-between gap-1 h-32 pt-4 px-2">
            {!globalAnalytics?.hourlyPeakScans ? (
              <div className="w-full text-center text-xs text-slate-500 py-8">Loading scan activity...</div>
            ) : (
              globalAnalytics.hourlyPeakScans.map((h, i) => {
                const maxCount = Math.max(...globalAnalytics.hourlyPeakScans.map(item => item.count), 1);
                const heightPct = Math.round((h.count / maxCount) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full bg-slate-800 rounded-t-sm overflow-hidden flex items-end h-24">
                      <div
                        className="w-full bg-purple-500 group-hover:bg-purple-400 transition-all rounded-t-sm"
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                    </div>
                    {i % 4 === 0 && (
                      <span className="text-[9px] font-mono text-slate-400">{h.hourLabel}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Real-time scan logs aggregated across all active accounts.
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <Input
            placeholder="Search business name, slug, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium w-full md:w-auto"
          >
            <option value="all">All Businesses ({businesses.length})</option>
            <option value="free">Starter Free ({freeAccounts})</option>
            <option value="pro">Pro Growth ({proAccounts})</option>
            <option value="enterprise">Business Plus Unlimited ({enterpriseAccounts})</option>
            <option value="expired">Expired Subscriptions</option>
          </select>
        </div>
      </div>

      {/* Master Business Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No businesses found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or plan filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Business & Type</th>
                  <th className="p-4">Current Plan</th>
                  <th className="p-4">Items / Limit</th>
                  <th className="p-4">Subscription Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredBusinesses.map((biz) => {
                  const daysInfo = getDaysRemaining(biz.subscription_end_date, biz.is_super_admin_owner);
                  const planKey = biz.subscription_plan || 'free';
                  const planMeta = SUBSCRIPTION_PLANS_META[planKey];
                  const rawMax = biz.max_items;
                  const maxItemsDisplay = (biz.is_super_admin_owner || rawMax === null || rawMax === undefined || planKey === 'enterprise') ? '∞' : rawMax;

                  return (
                    <tr key={biz.id} className={`hover:bg-slate-800/50 transition-colors ${
                      biz.is_super_admin_owner ? 'bg-teal-950/20' : ''
                    }`}>
                      {/* Business & Type */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{biz.name}</span>
                          {biz.is_super_admin_owner && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase">
                              Super Admin Owner
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">/c/{biz.slug}</div>
                        <div className="text-[10px] text-teal-400 capitalize mt-0.5">{biz.business_type}</div>
                      </td>

                      {/* Current Plan */}
                      <td className="p-4">
                        {biz.is_super_admin_owner ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Business Plus (Super Admin)
                          </span>
                        ) : (
                          <>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${
                              biz.subscription_plan === 'enterprise'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : biz.subscription_plan === 'pro'
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {planMeta.name}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {planMeta.priceLKR > 0 ? `LKR ${planMeta.priceLKR.toLocaleString()}/mo` : 'Free Forever'}
                            </div>
                          </>
                        )}
                      </td>

                      {/* Items / Limit */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">
                          {biz.item_count} / {maxItemsDisplay} Items
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {biz.category_count} Categories
                        </div>
                      </td>

                      {/* Subscription Status & Days Remaining */}
                      <td className="p-4">
                        {biz.is_super_admin_owner ? (
                          <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                            <ShieldCheck className="w-4 h-4 text-teal-400" /> Platform Owner (Unlimited)
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                daysInfo.isExpired ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                              }`} />
                              <span className={`font-semibold ${
                                daysInfo.isExpired ? 'text-rose-400' : 'text-emerald-400'
                              }`}>
                                {daysInfo.text}
                              </span>
                            </div>
                            {biz.subscription_end_date && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Until {new Date(biz.subscription_end_date).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleInspectAnalytics(biz)}
                            size="sm"
                            variant="outline"
                            className="gap-1 border-purple-500/40 text-purple-300 hover:bg-purple-950/40 text-xs font-semibold"
                            title="Inspect Business Scan & Customer Analytics"
                          >
                            <BarChart3 className="w-3.5 h-3.5" /> Inspect Analytics
                          </Button>

                          <a
                            href={`/c/${biz.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                            title="Inspect Public Customer Catalog"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {!biz.is_super_admin_owner && (
                            <Button
                              onClick={() => openApprovalModal(biz)}
                              size="sm"
                              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-1 border-none shadow-sm"
                            >
                              <Crown className="w-3.5 h-3.5" /> Manage Subscription
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Approval Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Approve Subscription — ${selectedBiz?.name}`}
        maxWidth="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="approval-form" isLoading={submitting} className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
              Approve & Activate 1 Month
            </Button>
          </>
        }
      >
        <form id="approval-form" onSubmit={handleApproveSubscription} className="space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Package */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Package Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['free', 'pro', 'enterprise'] as SubscriptionPlan[]).map((planKey) => {
                const plan = SUBSCRIPTION_PLANS_META[planKey];
                const isSelected = selectedPlan === planKey;

                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => setSelectedPlan(planKey)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 text-slate-900 shadow-md font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold">{plan.name}</div>
                      <div className="text-xs text-teal-700 font-extrabold mt-1">
                        {plan.priceLKR > 0 ? `LKR ${plan.priceLKR.toLocaleString()}/mo` : 'Free Forever'}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">
                      {plan.maxItems === null ? 'Unlimited' : `${plan.maxItems} Items limit`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start / Payment Date Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Payment / Subscription Start Date
            </label>
            <Input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Validity will be automatically extended for <strong>1 month</strong> from this start date.
            </p>
          </div>
        </form>
      </Modal>

      {/* One-Click Business Analytics Inspector Modal */}
      <Modal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        title={`Analytics Inspector — ${inspectBiz?.name || 'Business'}`}
        maxWidth="lg"
      >
        <div className="space-y-6 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-mono text-teal-700 font-bold">/c/{inspectBiz?.slug}</div>
              <div className="text-[11px] text-slate-500 capitalize">{inspectBiz?.business_type} • Plan: {inspectBiz?.subscription_plan || 'free'}</div>
            </div>
            <a
              href={`/c/${inspectBiz?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Catalog
            </a>
          </div>

          {loadingInspect ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Fetching Business Analytics...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Scans</div>
                  <div className="text-xl font-black text-slate-900">{inspectAnalytics?.totalScans || 0}</div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-purple-700">Visitors</div>
                  <div className="text-xl font-black text-purple-900">{inspectAnalytics?.uniqueVisitors || 0}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Item Views</div>
                  <div className="text-xl font-black text-amber-900">{inspectAnalytics?.totalItemViews || 0}</div>
                </div>
              </div>

              {/* Top Viewed Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top Viewed Catalog Items</h4>
                {!inspectAnalytics?.topItems || inspectAnalytics.topItems.length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">No item views recorded yet.</div>
                ) : (
                  inspectAnalytics.topItems.map((item, idx) => (
                    <div key={item.id + idx} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">#{idx + 1} {item.name}</span>
                      <span className="font-mono text-slate-600">{item.views} views ({item.percentage}%)</span>
                    </div>
                  ))
                )}
              </div>

              {/* Search Keywords & Zero Result Searches */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-semibold">Customer Search Keywords</h4>
                {!inspectAnalytics?.topSearches || inspectAnalytics.topSearches.length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg">No search queries logged yet.</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {inspectAnalytics.topSearches.map((s) => (
                      <span key={s.query} className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                        &quot;{s.query}&quot; ({s.count}x)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Device Breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Device Distribution</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                  <div>iPhone: <span className="font-bold text-slate-900">{inspectAnalytics?.deviceBreakdown.iphone || 0}</span></div>
                  <div>Android: <span className="font-bold text-slate-900">{inspectAnalytics?.deviceBreakdown.android || 0}</span></div>
                  <div>Desktop: <span className="font-bold text-slate-900">{inspectAnalytics?.deviceBreakdown.desktop || 0}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
