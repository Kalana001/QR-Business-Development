'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category } from '@/lib/types';
import { logQrScan, logItemView, logSearchQuery } from '@/lib/analytics';
import { getBusinessThemeSettings, CatalogThemeSettings } from '@/lib/templates';
import { CatalogRenderer } from '@/components/catalog/CatalogRenderer';

export default function PublicCustomerCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishedItems, setPublishedItems] = useState<CatalogItem[]>([]);
  const [themeSettings, setThemeSettings] = useState<CatalogThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPublicCatalog() {
      setLoading(true);
      const supabase = createClient();

      // 1. Fetch business from public_businesses
      const { data: bizData, error: bizError } = await supabase
        .from('public_businesses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (bizError || !bizData) {
        if (slug === 'bella-vista-bistro') {
          const demoBiz: Business = {
            id: '1', owner_id: 'demo', name: 'Bella Vista Bistro', slug: 'bella-vista-bistro',
            business_type: 'restaurant', description: 'Authentic Italian dining experience in Colombo.',
            phone: '+94 11 234 5678', email: 'info@bellavista.lk', address: '123 Galle Road, Colombo 03',
            website: 'https://bellavista.lk', logo_url: null, banner_url: null, currency: 'LKR', theme_color: '#0F172A',
            created_at: '', updated_at: '', subscription_plan: 'enterprise',
          };
          setBusiness(demoBiz);
          setCategories([
            { id: '1', business_id: '1', name: 'Antipasti & Starters', description: 'Fresh Italian appetizers', display_order: 1, created_at: '' },
            { id: '2', business_id: '1', name: 'Gourmet Pizzas', description: 'Wood-fired sourdough pizzas', display_order: 2, created_at: '' },
          ]);
          setPublishedItems([
            { id: '101', business_id: '1', category_id: '1', name: 'Truffle Bruschetta', description: 'Toasted sourdough with wild mushrooms and truffle oil.', price: 1650, is_available: true, is_featured: true, image_url: null, badges: ['Chef Special'], created_at: '', updated_at: '' },
            { id: '102', business_id: '1', category_id: '2', name: 'Margherita D.O.P.', description: 'San Marzano tomatoes, buffalo mozzarella, fresh basil.', price: 2400, is_available: true, is_featured: true, image_url: null, badges: ['Vegetarian'], created_at: '', updated_at: '' },
          ]);
          const settings = await getBusinessThemeSettings('1');
          setThemeSettings(settings);
          setLoading(false);
          return;
        }

        setNotFound(true);
        setLoading(false);
        return;
      }

      setBusiness(bizData as Business);

      // 2. Fetch Categories, Items & Theme Settings in parallel
      const [
        { data: catData },
        { data: itemData },
        settings
      ] = await Promise.all([
        supabase.from('public_categories').select('*').eq('business_id', bizData.id),
        supabase.from('public_catalog_items').select('*').eq('business_id', bizData.id),
        getBusinessThemeSettings(bizData.id),
      ]);

      if (catData) setCategories(catData as Category[]);
      if (itemData) setPublishedItems(itemData as CatalogItem[]);
      if (settings) setThemeSettings(settings);

      setLoading(false);
    }

    loadPublicCatalog();
  }, [slug]);

  // Log QR Scan when catalog loads
  useEffect(() => {
    if (business?.id) {
      logQrScan(business.id);
    }
  }, [business?.id]);

  // Debounced Search Tracking
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2 || !business?.id) return;

    const timer = setTimeout(() => {
      logSearchQuery(business.id, searchQuery, publishedItems.length);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, business?.id, publishedItems.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading digital catalog...</p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <span className="text-2xl font-black">404</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Business Catalog Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The catalog QR link you scanned does not exist or has been removed by the business owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CatalogRenderer
      business={business}
      categories={categories}
      publishedItems={publishedItems}
      themeSettings={themeSettings || {
        business_id: business.id,
        template_id: 'minimal-clean',
        background_style: 'clean-premium',
        primary_color: business.theme_color || '#0F172A',
        secondary_color: '#1E293B',
        accent_color: '#0F172A',
        card_style: 'rounded',
        header_style: 'standard',
      }}
      onSelectItem={(item) => {
        if (business?.id) {
          logItemView(business.id, item.id, item.name);
        }
      }}
      onSearchChange={(q) => {
        setSearchQuery(q);
      }}
    />
  );
}
