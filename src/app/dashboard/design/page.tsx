'use client';

import React, { useEffect, useState } from 'react';
import { 
  Palette, Eye, CheckCircle2, RotateCcw, Save, Crown, Sparkles, Filter, X, Smartphone, Store, Utensils, BookOpen, Scissors, Layers, Star 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business, Category, CatalogItem } from '@/lib/types';
import { CATALOG_TEMPLATES, TemplateId, CatalogTemplate, CatalogThemeSettings, getBusinessThemeSettings, saveBusinessThemeSettings } from '@/lib/templates';
import { BACKGROUND_STYLES, BackgroundStyleId, RECOMMENDED_BACKGROUNDS_BY_BIZ_TYPE } from '@/lib/backgrounds';
import { CatalogRenderer } from '@/components/catalog/CatalogRenderer';
import { BackgroundRenderer } from '@/components/catalog/BackgroundRenderer';

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
    if (!isPaidPlan && templateId !== 'minimal-clean') {
      setIsUpgradeModalOpen(true);
      return;
    }

    setSaving(true);
    setSaveSuccessMsg(null);
    const templateMeta = CATALOG_TEMPLATES[templateId];

    const newSettings: CatalogThemeSettings = {
      ...(themeSettings || {
        business_id: business.id,
        primary_color: templateMeta.defaultColors.primary,
        secondary_color: templateMeta.defaultColors.secondary,
        accent_color: templateMeta.defaultColors.accent,
        card_style: 'rounded',
        header_style: 'standard',
      }),
      business_id: business.id,
      template_id: templateId,
      background_style: themeSettings?.background_style || 'clean',
      primary_color: templateMeta.defaultColors.primary,
      secondary_color: templateMeta.defaultColors.secondary,
      accent_color: templateMeta.defaultColors.accent,
    };

    const success = await saveBusinessThemeSettings(newSettings);
    if (success) {
      setThemeSettings(newSettings);
      setSaveSuccessMsg(`Applied "${templateMeta.name}" template to your public catalog!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
    setSaving(false);
  };

  const handleSelectBackground = async (bgId: BackgroundStyleId) => {
    const bgMeta = BACKGROUND_STYLES[bgId];
    if (bgMeta.isPremium && !isPaidPlan) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setSaving(true);
    setSaveSuccessMsg(null);

    const currentTemplate = themeSettings?.template_id || 'minimal-clean';
    const templateMeta = CATALOG_TEMPLATES[currentTemplate];

    const newSettings: CatalogThemeSettings = {
      ...(themeSettings || {
        business_id: business.id,
        template_id: currentTemplate,
        primary_color: templateMeta.defaultColors.primary,
        secondary_color: templateMeta.defaultColors.secondary,
        accent_color: templateMeta.defaultColors.accent,
        card_style: 'rounded',
        header_style: 'standard',
      }),
      business_id: business.id,
      background_style: bgId,
    };

    const success = await saveBusinessThemeSettings(newSettings);
    if (success) {
      setThemeSettings(newSettings);
      setSaveSuccessMsg(`Applied "${bgMeta.name}" background style to your catalog!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
    setSaving(false);
  };

  const templateKeys = Object.keys(CATALOG_TEMPLATES) as TemplateId[];
  const filteredTemplateKeys = templateKeys.filter((key) => {
    if (filterType === 'all') return true;
    return CATALOG_TEMPLATES[key].suitableTypes.includes(filterType as any);
  });

  const backgroundKeys = Object.keys(BACKGROUND_STYLES) as BackgroundStyleId[];
  const recommendedBgs = RECOMMENDED_BACKGROUNDS_BY_BIZ_TYPE[business.business_type] || RECOMMENDED_BACKGROUNDS_BY_BIZ_TYPE.general;

  const currentTemplateId = themeSettings?.template_id || 'minimal-clean';
  const currentBgId = themeSettings?.background_style || 'clean';

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Catalog Design & Background Studio</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-600" /> Premium Design
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize your catalog layout template and subtle background style for your customers.
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

      {/* SECTION 1: CATALOG LAYOUT TEMPLATES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" /> Catalog Layout Template
            </h2>
            <p className="text-xs text-slate-500">
              Select the structure and typography layout for your catalog cards.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Active: <strong className="text-slate-900">{CATALOG_TEMPLATES[currentTemplateId]?.name}</strong>
          </span>
        </div>

        {/* 6 Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplateKeys.map((tKey) => {
            const t = CATALOG_TEMPLATES[tKey];
            const isActive = currentTemplateId === t.id;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-xs transition-all relative ${
                  isActive
                    ? 'border-2 border-purple-600 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Active Badge floating at top right with z-20 stacking context */}
                {isActive && (
                  <div className="absolute top-3 right-3 z-20 bg-purple-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-purple-400/30">
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">{t.name}</h3>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-purple-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" /> Active
                        </span>
                      )}
                    </div>
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
      </div>

      {/* SECTION 2: BACKGROUND STYLE SYSTEM */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" /> Background Style
            </h2>
            <p className="text-xs text-slate-500">
              Choose a subtle visual background treatment that complements your catalog.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
            Recommended for <span className="capitalize">{business.business_type}</span>
          </span>
        </div>

        {/* 10 Background Style Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {backgroundKeys.map((bgId) => {
            const bg = BACKGROUND_STYLES[bgId];
            const isActive = currentBgId === bg.id;
            const isRecommended = recommendedBgs.includes(bg.id);

            return (
              <div
                key={bg.id}
                onClick={() => handleSelectBackground(bg.id)}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all relative cursor-pointer group ${
                  isActive
                    ? 'border-2 border-teal-600 shadow-md ring-2 ring-teal-500/20 bg-teal-500/5'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Visual Gradient/Pattern Thumbnail */}
                <div className="space-y-3">
                  <div className={`h-24 rounded-xl p-3 bg-gradient-to-br ${bg.previewGradient} relative overflow-hidden border border-slate-200/50 flex flex-col justify-between`}>
                    <BackgroundRenderer styleId={bg.id} headerOnly={false} />

                    <div className="flex items-center justify-between relative z-10">
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" /> Recommended
                        </span>
                      )}
                      {bg.isPremium && !isRecommended && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[9px] font-extrabold uppercase tracking-wider">
                          Pro
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-extrabold text-slate-800 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md self-start relative z-10">
                      {bg.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {bg.name}
                      </h4>
                      {isActive && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                      {bg.description}
                    </p>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
                    {isActive ? '✓ Currently Active' : 'Click to Apply'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: LIVE INTEGRATED CATALOG PREVIEW */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" /> Live Interactive Catalog Preview
          </h2>
          <p className="text-xs text-slate-500">
            Real-time preview showing your template layout combined with your selected background style.
          </p>
        </div>

        <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-center">
          <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-3 border-4 border-slate-800 shadow-2xl">
            <div className="rounded-[2rem] overflow-hidden max-h-[600px] overflow-y-auto no-scrollbar border border-slate-800">
              <CatalogRenderer
                business={business}
                categories={categories}
                publishedItems={publishedItems}
                themeSettings={themeSettings || {
                  business_id: business.id,
                  template_id: currentTemplateId,
                  background_style: currentBgId,
                  primary_color: CATALOG_TEMPLATES[currentTemplateId].defaultColors.primary,
                  secondary_color: CATALOG_TEMPLATES[currentTemplateId].defaultColors.secondary,
                  accent_color: CATALOG_TEMPLATES[currentTemplateId].defaultColors.accent,
                  card_style: 'rounded',
                  header_style: 'standard',
                }}
              />
            </div>
          </div>
        </div>
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
                  background_style: currentBgId,
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
        reason="Upgrade to unlock Premium Catalog Templates & Professional Background Styles"
      />
    </div>
  );
}
