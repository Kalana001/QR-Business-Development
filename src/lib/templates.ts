import { createClient } from '@/lib/supabase/client';
import { BusinessType } from '@/lib/types';

export type TemplateId = 'modern-dark' | 'fresh-light' | 'warm-colors' | 'soft-pastel' | 'elegant-premium' | 'minimal-clean';

export interface CatalogTemplate {
  id: TemplateId;
  name: string;
  description: string;
  bestFor: string;
  suitableTypes: BusinessType[];
  isPremium: boolean;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
    subtext: string;
  };
}

export interface CatalogThemeSettings {
  business_id: string;
  template_id: TemplateId;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  card_style: 'rounded' | 'square' | 'bordered' | 'flat';
  header_style: 'standard' | 'minimal' | 'hero' | 'centered';
  created_at?: string;
  updated_at?: string;
}

export const CATALOG_TEMPLATES: Record<TemplateId, CatalogTemplate> = {
  'modern-dark': {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Dark premium interface with high contrast pricing, white typography, and strong product cards.',
    bestFor: 'Restaurants, Cafés, Bars & Food Businesses',
    suitableTypes: ['restaurant', 'general', 'salon', 'bookshop'],
    isPremium: true,
    defaultColors: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#38BDF8',
      background: '#020617',
      cardBg: '#0F172A',
      text: '#F8FAFC',
      subtext: '#94A3B8',
    },
  },
  'fresh-light': {
    id: 'fresh-light',
    name: 'Fresh Light',
    description: 'Clean white background with vibrant emerald green accents, circular category pills, and minimal cards.',
    bestFor: 'Restaurants, Healthy Food, Cafés & Organic Stores',
    suitableTypes: ['restaurant', 'general'],
    isPremium: true,
    defaultColors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#F0FDF4',
      cardBg: '#FFFFFF',
      text: '#064E3B',
      subtext: '#047857',
    },
  },
  'warm-colors': {
    id: 'warm-colors',
    name: 'Warm Colors',
    description: 'Warm orange & amber palette with bold category sections and friendly modern typography.',
    bestFor: 'Restaurants, Bakeries, Cafés & Eateries',
    suitableTypes: ['restaurant', 'general'],
    isPremium: true,
    defaultColors: {
      primary: '#EA580C',
      secondary: '#F97316',
      accent: '#FBBF24',
      background: '#FFF7ED',
      cardBg: '#FFFFFF',
      text: '#431407',
      subtext: '#9A3412',
    },
  },
  'soft-pastel': {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Gentle pastel background with elegant rounded cards and premium lifestyle typography.',
    bestFor: 'Bakeries, Beauty Salons, Boutiques & Spas',
    suitableTypes: ['salon', 'general', 'restaurant'],
    isPremium: true,
    defaultColors: {
      primary: '#DB2777',
      secondary: '#F472B6',
      accent: '#F43F5E',
      background: '#FDF2F8',
      cardBg: '#FFFFFF',
      text: '#831843',
      subtext: '#9D174D',
    },
  },
  'elegant-premium': {
    id: 'elegant-premium',
    name: 'Elegant Premium',
    description: 'Dark luxury interface with gold & cream accents, high-end typography, and spacious layout.',
    bestFor: 'Fine Dining, Luxury Retail, Salons & Boutiques',
    suitableTypes: ['restaurant', 'salon', 'general', 'bookshop'],
    isPremium: true,
    defaultColors: {
      primary: '#1C1917',
      secondary: '#292524',
      accent: '#D97706',
      background: '#0C0A09',
      cardBg: '#1C1917',
      text: '#FEF3C7',
      subtext: '#D6D3D1',
    },
  },
  'minimal-clean': {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Extremely clean light background focusing purely on typography, prices, and fast browsing.',
    bestFor: 'Bookshops, Retail Stores & Professional Services',
    suitableTypes: ['bookshop', 'general', 'salon', 'restaurant'],
    isPremium: true,
    defaultColors: {
      primary: '#18181B',
      secondary: '#27272A',
      accent: '#2563EB',
      background: '#FAFAFA',
      cardBg: '#FFFFFF',
      text: '#09090B',
      subtext: '#52525B',
    },
  },
};

/**
 * Fetch theme settings for a business (Supabase + localStorage fallback)
 */
export async function getBusinessThemeSettings(businessId: string): Promise<CatalogThemeSettings> {
  const defaultSettings: CatalogThemeSettings = {
    business_id: businessId,
    template_id: 'modern-dark',
    primary_color: CATALOG_TEMPLATES['modern-dark'].defaultColors.primary,
    secondary_color: CATALOG_TEMPLATES['modern-dark'].defaultColors.secondary,
    accent_color: CATALOG_TEMPLATES['modern-dark'].defaultColors.accent,
    card_style: 'rounded',
    header_style: 'standard',
  };

  if (!businessId) return defaultSettings;

  // 1. Try Supabase first
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalog_theme_settings')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    if (data && !error) {
      return {
        ...defaultSettings,
        ...data,
      };
    }
  } catch (err) {
    // Fallback to localStorage
  }

  // 2. Try localStorage backup
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`catalog_theme_${businessId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {}

  return defaultSettings;
}

/**
 * Save theme settings for a business (Supabase + localStorage backup)
 */
export async function saveBusinessThemeSettings(settings: CatalogThemeSettings): Promise<boolean> {
  if (!settings.business_id) return false;

  const timestamp = new Date().toISOString();
  const updatedSettings = {
    ...settings,
    updated_at: timestamp,
  };

  // 1. Save to localStorage backup instantly
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`catalog_theme_${settings.business_id}`, JSON.stringify(updatedSettings));
    }
  } catch (e) {}

  // 2. Save to Supabase
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('catalog_theme_settings')
      .upsert(updatedSettings, { onConflict: 'business_id' });

    if (error) {
      console.warn('[ThemeSettings] Supabase upsert notice:', error.message);
    }
    return true;
  } catch (err) {
    return true;
  }
}
