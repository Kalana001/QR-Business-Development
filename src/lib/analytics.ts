import { createClient } from '@/lib/supabase/client';

export interface AnalyticsScan {
  id: string;
  business_id: string;
  device_type: string;
  user_agent?: string;
  created_at: string;
}

export interface AnalyticsItemView {
  id: string;
  business_id: string;
  item_id: string;
  item_name: string;
  created_at: string;
}

export interface AnalyticsSearchLog {
  id: string;
  business_id: string;
  query_text: string;
  results_count: number;
  created_at: string;
}

export interface MetricComparison {
  current: number;
  previous: number;
  percentageChange: number | null;
  notEnoughData: boolean;
}

export interface AnalyticsSummary {
  scansMetric: MetricComparison;
  itemViewsMetric: MetricComparison;
  searchesMetric: MetricComparison;
  totalScans: number;
  totalItemViews: number;
  topItems: { id: string; name: string; views: number; percentage: number }[];
  leastItems: { id: string; name: string; views: number }[];
  topSearches: { query: string; count: number; resultsCount: number }[];
  zeroResultSearches: { query: string; count: number }[];
  deviceBreakdown: { iphone: number; android: number; desktop: number; other: number };
  dailyTrends: { date: string; scans: number; views: number }[];
}

// Detect broad privacy-conscious device classification from User-Agent
function detectDeviceType(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'desktop';
  const ua = (navigator.userAgent || '').toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iphone';
  if (ua.includes('android')) return 'android';
  if (ua.includes('mobile')) return 'mobile';
  return 'desktop';
}

/**
 * Log a public QR scan event (fails silently if DB fails)
 */
export async function logQrScan(businessId: string) {
  if (!businessId) return;

  const deviceType = detectDeviceType();
  const timestamp = new Date().toISOString();

  // 1. Log to localStorage backup
  try {
    const key = `analytics_scans_${businessId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      id: Math.random().toString(36).substring(2),
      business_id: businessId,
      device_type: deviceType,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      created_at: timestamp,
    });
    if (existing.length > 500) existing.shift();
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {}

  // 2. Log to Supabase silently
  try {
    const supabase = createClient();
    await supabase.from('analytics_qr_scans').insert({
      business_id: businessId,
      device_type: deviceType,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
  } catch (err) {}
}

/**
 * Log a catalog item view event (fails silently)
 */
export async function logItemView(businessId: string, itemId: string, itemName: string) {
  if (!businessId || !itemId) return;

  const timestamp = new Date().toISOString();

  // 1. Log to localStorage backup
  try {
    const key = `analytics_views_${businessId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      id: Math.random().toString(36).substring(2),
      business_id: businessId,
      item_id: itemId,
      item_name: itemName,
      created_at: timestamp,
    });
    if (existing.length > 500) existing.shift();
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {}

  // 2. Log to Supabase silently
  try {
    const supabase = createClient();
    await supabase.from('analytics_item_views').insert({
      business_id: businessId,
      item_id: itemId,
      item_name: itemName,
    });
  } catch (err) {}
}

/**
 * Log a catalog search query event with accurate matching results count
 */
export async function logSearchQuery(businessId: string, queryText: string, resultsCount: number) {
  const queryClean = queryText.trim().toLowerCase();
  if (!businessId || !queryClean || queryClean.length < 2) return;

  const timestamp = new Date().toISOString();

  // 1. Log to localStorage backup
  try {
    const key = `analytics_searches_${businessId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      id: Math.random().toString(36).substring(2),
      business_id: businessId,
      query_text: queryClean,
      results_count: resultsCount,
      created_at: timestamp,
    });
    if (existing.length > 500) existing.shift();
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {}

  // 2. Log to Supabase silently
  try {
    const supabase = createClient();
    await supabase.from('analytics_search_logs').insert({
      business_id: businessId,
      query_text: queryClean,
      results_count: resultsCount,
    });
  } catch (err) {}
}

/**
 * Calculate period comparison and percentage change safely
 */
function computeMetricComparison(currentCount: number, previousCount: number): MetricComparison {
  if (previousCount === 0 && currentCount === 0) {
    return { current: 0, previous: 0, percentageChange: null, notEnoughData: true };
  }
  if (previousCount === 0) {
    return { current: currentCount, previous: 0, percentageChange: null, notEnoughData: true };
  }
  const change = Math.round(((currentCount - previousCount) / previousCount) * 100 * 10) / 10;
  return { current: currentCount, previous: previousCount, percentageChange: change, notEnoughData: false };
}

/**
 * Fetch tenant-isolated analytics summary for a business with accurate period comparisons
 */
export async function getAnalyticsSummary(businessId: string, daysLimit: number = 30): Promise<AnalyticsSummary> {
  let allScans: AnalyticsScan[] = [];
  let allViews: AnalyticsItemView[] = [];
  let allSearches: AnalyticsSearchLog[] = [];

  const supabase = createClient();

  // Try fetching from Supabase first
  try {
    const [scanRes, viewRes, searchRes] = await Promise.all([
      supabase.from('analytics_qr_scans').select('*').eq('business_id', businessId),
      supabase.from('analytics_item_views').select('*').eq('business_id', businessId),
      supabase.from('analytics_search_logs').select('*').eq('business_id', businessId),
    ]);

    if (scanRes.data && scanRes.data.length > 0) allScans = scanRes.data;
    if (viewRes.data && viewRes.data.length > 0) allViews = viewRes.data;
    if (searchRes.data && searchRes.data.length > 0) allSearches = searchRes.data;
  } catch (err) {}

  // LocalStorage fallback if Supabase is empty
  try {
    if (allScans.length === 0 && typeof localStorage !== 'undefined') {
      allScans = JSON.parse(localStorage.getItem(`analytics_scans_${businessId}`) || '[]');
    }
    if (allViews.length === 0 && typeof localStorage !== 'undefined') {
      allViews = JSON.parse(localStorage.getItem(`analytics_views_${businessId}`) || '[]');
    }
    if (allSearches.length === 0 && typeof localStorage !== 'undefined') {
      allSearches = JSON.parse(localStorage.getItem(`analytics_searches_${businessId}`) || '[]');
    }
  } catch (e) {}

  const now = new Date();
  const currentCutoff = new Date(now.getTime() - daysLimit * 24 * 60 * 60 * 1000);
  const previousCutoff = new Date(now.getTime() - daysLimit * 2 * 24 * 60 * 60 * 1000);

  // Filter current period records
  const currentScans = allScans.filter((s) => new Date(s.created_at) >= currentCutoff);
  const currentViews = allViews.filter((v) => new Date(v.created_at) >= currentCutoff);
  const currentSearches = allSearches.filter((q) => new Date(q.created_at) >= currentCutoff);

  // Filter previous period records for trend comparisons
  const previousScans = allScans.filter((s) => {
    const d = new Date(s.created_at);
    return d >= previousCutoff && d < currentCutoff;
  });
  const previousViews = allViews.filter((v) => {
    const d = new Date(v.created_at);
    return d >= previousCutoff && d < currentCutoff;
  });
  const previousSearches = allSearches.filter((q) => {
    const d = new Date(q.created_at);
    return d >= previousCutoff && d < currentCutoff;
  });

  const scansMetric = computeMetricComparison(currentScans.length, previousScans.length);
  const itemViewsMetric = computeMetricComparison(currentViews.length, previousViews.length);
  const searchesMetric = computeMetricComparison(currentSearches.length, previousSearches.length);

  // Compute Device Breakdown for current period
  const deviceBreakdown = { iphone: 0, android: 0, desktop: 0, other: 0 };
  currentScans.forEach((s) => {
    const dev = (s.device_type || '').toLowerCase();
    if (dev.includes('iphone') || dev.includes('ipad')) deviceBreakdown.iphone++;
    else if (dev.includes('android')) deviceBreakdown.android++;
    else if (dev.includes('desktop')) deviceBreakdown.desktop++;
    else deviceBreakdown.other++;
  });

  // Compute Item Views Rankings (Top and Least Viewed)
  const itemMap: Record<string, { id: string; name: string; views: number }> = {};
  currentViews.forEach((v) => {
    const key = v.item_id || v.item_name;
    if (!itemMap[key]) {
      itemMap[key] = { id: v.item_id, name: v.item_name || 'Catalog Item', views: 0 };
    }
    itemMap[key].views++;
  });

  const totalViewsCount = currentViews.length;
  const sortedItemList = Object.values(itemMap).sort((a, b) => b.views - a.views);

  const topItems = sortedItemList.slice(0, 5).map((item) => ({
    ...item,
    percentage: totalViewsCount > 0 ? Math.round((item.views / totalViewsCount) * 100) : 0,
  }));

  const leastItems = sortedItemList.length > 3 ? sortedItemList.slice(-3).reverse() : [];

  // Compute Top Searches & Genuine Zero Result Searches
  const searchMap: Record<string, { query: string; count: number; resultsCount: number }> = {};
  currentSearches.forEach((s) => {
    const q = s.query_text.toLowerCase().trim();
    if (!searchMap[q]) {
      searchMap[q] = { query: q, count: 0, resultsCount: s.results_count };
    }
    searchMap[q].count++;
    if (s.results_count < searchMap[q].resultsCount) {
      searchMap[q].resultsCount = s.results_count;
    }
  });

  const sortedSearches = Object.values(searchMap).sort((a, b) => b.count - a.count);
  const topSearches = sortedSearches.slice(0, 5);
  const zeroResultSearches = sortedSearches.filter((s) => s.resultsCount === 0).slice(0, 5);

  // Compute Daily Trend Data for Responsive Charts
  const dailyTrendMap: Record<string, { scans: number; views: number }> = {};
  for (let i = Math.min(daysLimit, 30) - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyTrendMap[dateStr] = { scans: 0, views: 0 };
  }

  currentScans.forEach((s) => {
    const dStr = (s.created_at || '').split('T')[0];
    if (dailyTrendMap[dStr]) dailyTrendMap[dStr].scans++;
  });

  currentViews.forEach((v) => {
    const dStr = (v.created_at || '').split('T')[0];
    if (dailyTrendMap[dStr]) dailyTrendMap[dStr].views++;
  });

  const dailyTrends = Object.entries(dailyTrendMap).map(([date, counts]) => ({
    date: date.substring(5), // MM-DD format
    scans: counts.scans,
    views: counts.views,
  }));

  return {
    scansMetric,
    itemViewsMetric,
    searchesMetric,
    totalScans: currentScans.length,
    totalItemViews: currentViews.length,
    topItems,
    leastItems,
    topSearches,
    zeroResultSearches,
    deviceBreakdown,
    dailyTrends,
  };
}

export interface GlobalAnalyticsSummary {
  totalPlatformScans: number;
  totalPlatformRevenue: number;
  topBusinesses: { businessId: string; businessName: string; scanCount: number; percentage: number }[];
  hourlyPeakScans: { hourLabel: string; count: number }[];
}

/**
 * Fetch aggregated platform-wide analytics for Super Admin (using authoritative subscription_payments)
 */
export async function getGlobalPlatformAnalytics(allBusinesses: { id: string; name: string }[]): Promise<GlobalAnalyticsSummary> {
  let allScans: AnalyticsScan[] = [];
  let totalRevenue = 0;
  const supabase = createClient();

  try {
    const [{ data: scanData }, { data: paymentData }] = await Promise.all([
      supabase.from('analytics_qr_scans').select('*'),
      supabase.from('subscription_payments').select('amount_lkr, payment_status').eq('payment_status', 'completed'),
    ]);

    if (scanData && scanData.length > 0) allScans = scanData;
    if (paymentData && paymentData.length > 0) {
      totalRevenue = paymentData.reduce((sum, p) => sum + (Number(p.amount_lkr) || 0), 0);
    }
  } catch (err) {}

  // LocalStorage fallback check across business IDs
  if (allScans.length === 0 && typeof localStorage !== 'undefined') {
    allBusinesses.forEach((b) => {
      try {
        const stored = JSON.parse(localStorage.getItem(`analytics_scans_${b.id}`) || '[]');
        allScans.push(...stored);
      } catch (e) {}
    });
  }

  // Count by business
  const bizScanMap: Record<string, number> = {};
  const hourlyCount: number[] = new Array(24).fill(0);

  allScans.forEach((s) => {
    if (s.business_id) {
      bizScanMap[s.business_id] = (bizScanMap[s.business_id] || 0) + 1;
    }
    const hour = new Date(s.created_at || Date.now()).getHours();
    hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
  });

  const total = allScans.length;
  const bizList = Object.entries(bizScanMap)
    .map(([bId, count]) => {
      const biz = allBusinesses.find((b) => b.id === bId);
      return {
        businessId: bId,
        businessName: biz?.name || 'Customer Business',
        scanCount: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.scanCount - a.scanCount)
    .slice(0, 5);

  const hourlyPeakScans = hourlyCount.map((count, hr) => {
    const period = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
    return {
      hourLabel: `${displayHr}${period}`,
      count,
    };
  });

  return {
    totalPlatformScans: total,
    totalPlatformRevenue: totalRevenue,
    topBusinesses: bizList,
    hourlyPeakScans,
  };
}
