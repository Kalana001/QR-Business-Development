'use client';

import React, { useEffect, useState } from 'react';
import { 
  Palette, Eye, CheckCircle2, RotateCcw, Save, Crown, Sparkles, Filter, X, Smartphone, Store, Utensils, BookOpen, Scissors 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business, Category, CatalogItem } from '@/lib/types';
import { CATALOG_TEMPLATES, TemplateId, CatalogTemplate, CatalogThemeSettings, getBusinessThemeSettings, saveBusinessThemeSettings } from '@/lib/templates';
import { CatalogRenderer } from '@/components/catalog/CatalogRenderer';

export default function DashboardCatalogDesignPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishedItems, setPublishedItems] = useState<CatalogItem[]>([]);
  const [themeSettings, setThemeSettings] = useState<CatalogThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Preview & Customization State
  const [previewTemplateId, setPreviewTemplateId] = useState<TemplateId | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Fallback demo data
        const demoBiz: Business = {
          id: 'demo-biz-1', owner_id: 'demo', name: 'Sigiri Food Bistro', slug: 'sigiri-food',
          business_type: 'restaurant', description: 'Authentic Sri Lankan & Italian dining with handcrafted dishes.',
          phone: '+94 77 123 4567', email: 'contact@sigirifood.lk', address: 'Main Street, Colombo',
          website: 'https://sigirifood.lk', logo_url: null, banner_url: null, currency: 'LKR', theme_color: '#0F172A',
          created_at: '', updated_at: '', subscription_plan: 'enterprise',
        };
        setBusiness(demoBiz);
        setIsSuperAdmin(true);
        setCategories([
          { id: 'c1', business_id: demoBiz.id, name: 'Kottu Specials', description: 'Freshly shredded kottu', display_order: 1, created_at: '' },
          { id: 'c2', business_id: demoBiz.id, name: 'Fried Rice & Mains', description: 'Wok-tossed rice', display_order: 2, created_at: '' },
        ]);
        setPublishedItems([
          { id: 'i1', business_id: demoBiz.id, category_id: 'c1', name: 'Chicken Kottu (Full)', description: 'Classic shredded roti with spiced chicken, eggs, and fresh vegetables.', price: 1450, is_available: true, is_featured: true, image_url: null, badges: ['Chef Special', 'Spicy'], created_at: '', updated_at: '' },
          { id: 'i2', business_id: demoBiz.id, category_id: 'c2', name: 'Special Mix Fried Rice', description: 'Basmati rice with prawns, chicken, eggs, and signature chili paste.', price: 1850, is_available: true, is_featured: true, image_url: null, badges: ['Popular'], created_at: '', updated_at: '' },
        ]);
        const settings = await getBusinessThemeSettings(demoBiz.id);
        setThemeSettings(settings);
        setLoading(false);
        return;
      }

      const { data: adminRpc } = await supabase.rpc('is_super_admin');
      setIsSuperAdmin(Boolean(adminRpc));

      const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
      if (biz) {
        setBusiness(biz as Business);
        
        const [{ data: catData }, { data: itemData }, settings] = await Promise.all([
          supabase.from('categories').select('*').eq('business_id', biz.id).order('display_order'),
          supabase.from('catalog_items').select('*').eq('business_id', biz.id),
          getBusinessThemeSettings(biz.id),
        ]);

        if (catData) setCategories(catData as Category[]);
        if (itemData) setPublishedItems(itemData as CatalogItem[]);
        setThemeSettings(settings);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading || !business) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const planKey = (business.subscription_plan || 'free').toLowerCase();
  const isPaidPlan = isSuperAdmin || planKey === 'pro' || planKey === 'pro_growth' || planKey === 'enterprise' || planKey === 'enterprise_gift' || planKey === 'business' || planKey === 'business_plus';

  const handleSelectTemplate = async (templateId: TemplateId) => {
    if (!isPaidPlan) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setSaving(true);
    setSaveSuccessMsg(null);
    const templateMeta = CATALOG_TEMPLATES[templateId];

    const newSettings: CatalogThemeSettings = {
      business_id: business.id,
      template_id: templateId,
      primary_color: templateMeta.defaultColors.primary,
      secondary_color: templateMeta.defaultColors.secondary,
      accent_color: templateMeta.defaultColors.accent,
      card_style: 'rounded',
      header_style: 'standard',
    };

    const success = await saveBusinessThemeSettings(newSettings);
    if (success) {
      setThemeSettings(newSettings);
      setSaveSuccessMsg(`Applied "${templateMeta.name}" template to your public catalog!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
    setSaving(false);
  };

  const handleCustomColorChange = async (type: 'primary' | 'accent', color: string) => {
    if (!themeSettings) return;
    const updated = {
      ...themeSettings,
      [type === 'primary' ? 'primary_color' : 'accent_color']: color,
    };
    setThemeSettings(updated);
    await saveBusinessThemeSettings(updated);
  };

  const handleResetDefaults = async () => {
    if (!themeSettings) return;
    const templateMeta = CATALOG_TEMPLATES[themeSettings.template_id];
    const reset = {
      ...themeSettings,
      primary_color: templateMeta.defaultColors.primary,
      accent_color: templateMeta.defaultColors.accent,
    };
    setThemeSettings(reset);
    await saveBusinessThemeSettings(reset);
  };

  const templateKeys = Object.keys(CATALOG_TEMPLATES) as TemplateId[];
  const filteredTemplateKeys = templateKeys.filter((key) => {
    if (filterType === 'all') return true;
    return CATALOG_TEMPLATES[key].suitableTypes.includes(filterType as any);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Choose Your Catalog Design</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-600" /> Premium Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Give your customers a better browsing experience with a professional catalog design.
          </p>
        </div>

        {/* Business Type Filters */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setFilterType('restaurant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'restaurant' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setFilterType('bookshop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'bookshop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bookshops
          </button>
          <button
            onClick={() => setFilterType('salon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'salon' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Salons
          </button>
          <button
            onClick={() => setFilterType('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retail
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}



      {/* 6 Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplateKeys.map((tKey) => {
          const t = CATALOG_TEMPLATES[tKey];
          const isActive = themeSettings?.template_id === t.id;

          return (
            <div
              key={t.id}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-xs transition-all relative ${
                isActive
                  ? 'border-2 border-purple-600 shadow-md ring-2 ring-purple-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> Currently Active
                </div>
              )}

              {/* Visual Card Representation */}
              <div className="space-y-4">
                <div 
                  className="h-36 rounded-2xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden border"
                  style={{ 
                    backgroundColor: t.defaultColors.background,
                    borderColor: 'rgba(226, 232, 240, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: t.defaultColors.primary, color: '#FFFFFF' }}
                    >
                      {t.name}
                    </div>
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.defaultColors.accent }}
                    />
                  </div>

                  {/* Card Sample */}
                  <div 
                    className="p-2.5 rounded-xl space-y-1 shadow-xs border"
                    style={{ backgroundColor: t.defaultColors.cardBg, borderColor: 'rgba(226, 232, 240, 0.2)' }}
                  >
                    <div className="text-[11px] font-extrabold truncate" style={{ color: t.defaultColors.text }}>
                      Sample Item Card
                    </div>
                    <div className="text-[10px] font-black" style={{ color: t.defaultColors.accent }}>
                      LKR 1,500
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {t.description}
                  </p>
                </div>

                <div className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                  Best for: {t.bestFor}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex items-center gap-2">
                <Button
                  onClick={() => setPreviewTemplateId(t.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-semibold gap-1.5 border-slate-300"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" /> Preview
                </Button>

                <Button
                  onClick={() => handleSelectTemplate(t.id)}
                  disabled={saving}
                  size="sm"
                  className={`flex-1 text-xs font-bold gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {isActive ? 'Applied' : 'Select Template'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Data Mobile Preview Modal */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-white">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Live Real-Data Preview</div>
                <h3 className="text-base font-extrabold text-white">
                  {CATALOG_TEMPLATES[previewTemplateId]?.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    handleSelectTemplate(previewTemplateId);
                    setPreviewTemplateId(null);
                  }}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Apply This Design
                </Button>
                <button
                  onClick={() => setPreviewTemplateId(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Real-Data Catalog Viewport */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <CatalogRenderer
                business={business}
                categories={categories}
                publishedItems={publishedItems}
                themeSettings={{
                  business_id: business.id,
                  template_id: previewTemplateId,
                  primary_color: CATALOG_TEMPLATES[previewTemplateId].defaultColors.primary,
                  secondary_color: CATALOG_TEMPLATES[previewTemplateId].defaultColors.secondary,
                  accent_color: CATALOG_TEMPLATES[previewTemplateId].defaultColors.accent,
                  card_style: 'rounded',
                  header_style: 'standard',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal Trigger */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="Upgrade to unlock 6 Premium Commercial Catalog Templates"
      />
    </div>
  );
}
