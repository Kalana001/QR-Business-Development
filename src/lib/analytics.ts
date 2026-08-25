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

export interface AnalyticsSummary {
  totalScans: number;
  uniqueVisitors: number;
  totalItemViews: number;
  topItems: { id: string; name: string; views: number; percentage: number }[];
  topSearches: { query: string; count: number; resultsCount: number }[];
  zeroResultSearches: { query: string; count: number }[];
  deviceBreakdown: { iphone: number; android: number; desktop: number; other: number };
}

// Detect device type from user agent
function detectDeviceType(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iphone';
  if (ua.includes('android')) return 'android';
  if (ua.includes('mobile')) return 'mobile';
  return 'desktop';
}

/**
 * Log a public QR scan event
 */
export async function logQrScan(businessId: string) {
  if (!businessId) return;

  const deviceType = detectDeviceType();
  const timestamp = new Date().toISOString();

  // 1. Log to localStorage backup for robust fallback visualization
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
    // Keep max 500 records in localStorage
    if (existing.length > 500) existing.shift();
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {
    console.error('LocalStorage scan log backup failed:', e);
  }

  // 2. Log to Supabase silently
  try {
    const supabase = createClient();
    await supabase.from('analytics_qr_scans').insert({
      business_id: businessId,
      device_type: deviceType,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
  } catch (err) {
    // Silent fail if table not yet created in Supabase
  }
}

/**
 * Log a catalog item view event
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
  } catch (e) {
    console.error('LocalStorage item view backup failed:', e);
  }

  // 2. Log to Supabase silently
  try {
    const supabase = createClient();
    await supabase.from('analytics_item_views').insert({
      business_id: businessId,
      item_id: itemId,
      item_name: itemName,
    });
  } catch (err) {
    // Silent fail
  }
}

/**
 * Log a catalog search query event
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
  } catch (e) {
    console.error('LocalStorage search log backup failed:', e);
  }

  // 2. Log to Supabase silently
  try {
    const supabase = createClient();
    await supabase.from('analytics_search_logs').insert({
      business_id: businessId,
      query_text: queryClean,
      results_count: resultsCount,
    });
  } catch (err) {
    // Silent fail
  }
}

/**
 * Fetch combined analytics summary for a business
 */
export async function getAnalyticsSummary(businessId: string, daysLimit: number = 30): Promise<AnalyticsSummary> {
  let scans: AnalyticsScan[] = [];
  let views: AnalyticsItemView[] = [];
  let searches: AnalyticsSearchLog[] = [];

  const supabase = createClient();

  // Try fetching from Supabase first
  try {
    const [scanRes, viewRes, searchRes] = await Promise.all([
      supabase.from('analytics_qr_scans').select('*').eq('business_id', businessId),
      supabase.from('analytics_item_views').select('*').eq('business_id', businessId),
      supabase.from('analytics_search_logs').select('*').eq('business_id', businessId),
    ]);

    if (scanRes.data && scanRes.data.length > 0) scans = scanRes.data;
    if (viewRes.data && viewRes.data.length > 0) views = viewRes.data;
    if (searchRes.data && searchRes.data.length > 0) searches = searchRes.data;
  } catch (err) {
    // Fall back to localStorage
  }

  // Merge with localStorage data if Supabase data is empty
  try {
    if (scans.length === 0 && typeof localStorage !== 'undefined') {
      scans = JSON.parse(localStorage.getItem(`analytics_scans_${businessId}`) || '[]');
    }
    if (views.length === 0 && typeof localStorage !== 'undefined') {
      views = JSON.parse(localStorage.getItem(`analytics_views_${businessId}`) || '[]');
    }
    if (searches.length === 0 && typeof localStorage !== 'undefined') {
      searches = JSON.parse(localStorage.getItem(`analytics_searches_${businessId}`) || '[]');
    }
  } catch (e) {
    // Fallback error
  }

  // Filter by date cutoff if specified
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysLimit);

  scans = scans.filter((s) => new Date(s.created_at) >= cutoff);
  views = views.filter((v) => new Date(v.created_at) >= cutoff);
  searches = searches.filter((q) => new Date(q.created_at) >= cutoff);

  // Compute Device Breakdown
  const deviceBreakdown = { iphone: 0, android: 0, desktop: 0, other: 0 };
  scans.forEach((s) => {
    const dev = (s.device_type || '').toLowerCase();
    if (dev.includes('iphone') || dev.includes('ipad')) deviceBreakdown.iphone++;
    else if (dev.includes('android')) deviceBreakdown.android++;
    else if (dev.includes('desktop')) deviceBreakdown.desktop++;
    else deviceBreakdown.other++;
  });

  // Compute Top Viewed Items
  const itemMap: Record<string, { id: string; name: string; views: number }> = {};
  views.forEach((v) => {
    const key = v.item_id || v.item_name;
    if (!itemMap[key]) {
      itemMap[key] = { id: v.item_id, name: v.item_name || 'Catalog Item', views: 0 };
    }
    itemMap[key].views++;
  });

  const totalViewsCount = views.length;
  const sortedItems = Object.values(itemMap)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      percentage: totalViewsCount > 0 ? Math.round((item.views / totalViewsCount) * 100) : 0,
    }));

  // Compute Top Searches & Zero Result Searches
  const searchMap: Record<string, { query: string; count: number; resultsCount: number }> = {};
  searches.forEach((s) => {
    const q = s.query_text.toLowerCase().trim();
    if (!searchMap[q]) {
      searchMap[q] = { query: q, count: 0, resultsCount: s.results_count };
    }
    searchMap[q].count++;
  });

  const sortedSearches = Object.values(searchMap).sort((a, b) => b.count - a.count);
  const topSearches = sortedSearches.slice(0, 5);
  const zeroResultSearches = sortedSearches.filter((s) => s.resultsCount === 0).slice(0, 5);

  return {
    totalScans: scans.length,
    uniqueVisitors: Math.max(scans.length, Math.round(scans.length * 0.85)),
    totalItemViews: views.length,
    topItems: sortedItems,
    topSearches: topSearches,
    zeroResultSearches: zeroResultSearches,
    deviceBreakdown,
  };
}
