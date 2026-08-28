import { BusinessType } from '@/lib/types';

export type BackgroundStyleId = 
  | 'clean'
  | 'soft-gradient'
  | 'subtle-pattern'
  | 'food-restaurant'
  | 'jewelry-luxury'
  | 'botanical'
  | 'cafe-coffee'
  | 'modern-geometric'
  | 'elegant-texture'
  | 'paper-editorial';

export interface BackgroundStyle {
  id: BackgroundStyleId;
  name: string;
  description: string;
  category: 'minimal' | 'gradient' | 'pattern' | 'industry' | 'texture';
  isPremium?: boolean;
  previewGradient: string;
  previewAccent: string;
}

export const BACKGROUND_STYLES: Record<BackgroundStyleId, BackgroundStyle> = {
  'clean': {
    id: 'clean',
    name: 'Clean & Minimal',
    description: 'Crisp solid surfaces with subtle visual hierarchy. Pure & professional.',
    category: 'minimal',
    isPremium: false,
    previewGradient: 'from-slate-100 to-slate-200',
    previewAccent: '#0F172A',
  },
  'soft-gradient': {
    id: 'soft-gradient',
    name: 'Soft Gradient',
    description: 'Gentle color transitions adapting dynamically to your business theme color.',
    category: 'gradient',
    isPremium: false,
    previewGradient: 'from-sky-100 via-indigo-100 to-purple-100',
    previewAccent: '#6366F1',
  },
  'subtle-pattern': {
    id: 'subtle-pattern',
    name: 'Subtle Pattern',
    description: 'Extremely low-opacity repeating geometric dot matrix grid.',
    category: 'pattern',
    isPremium: true,
    previewGradient: 'from-slate-900 to-slate-950',
    previewAccent: '#38BDF8',
  },
  'food-restaurant': {
    id: 'food-restaurant',
    name: 'Food & Restaurant',
    description: 'Elegant culinary & utensil line-art vector pattern for dining.',
    category: 'industry',
    isPremium: true,
    previewGradient: 'from-amber-50 to-orange-100',
    previewAccent: '#EA580C',
  },
  'jewelry-luxury': {
    id: 'jewelry-luxury',
    name: 'Jewelry / Luxury',
    description: 'Sophisticated marble-like curves & subtle golden geometric accents.',
    category: 'industry',
    isPremium: true,
    previewGradient: 'from-stone-900 via-zinc-900 to-stone-950',
    previewAccent: '#D97706',
  },
  'botanical': {
    id: 'botanical',
    name: 'Botanical & Organic',
    description: 'Gentle leaves & organic botanical line-art vectors.',
    category: 'industry',
    isPremium: true,
    previewGradient: 'from-emerald-50 via-teal-50 to-emerald-100',
    previewAccent: '#059669',
  },
  'cafe-coffee': {
    id: 'cafe-coffee',
    name: 'Cafe & Coffee',
    description: 'Warm roasted coffee bean vectors & cozy editorial texture.',
    category: 'industry',
    isPremium: true,
    previewGradient: 'from-amber-100/60 to-stone-200',
    previewAccent: '#78350F',
  },
  'modern-geometric': {
    id: 'modern-geometric',
    name: 'Modern Geometric',
    description: 'Subtle arcs, circles & clean modern abstract geometric vectors.',
    category: 'pattern',
    isPremium: true,
    previewGradient: 'from-indigo-950 to-slate-900',
    previewAccent: '#818CF8',
  },
  'elegant-texture': {
    id: 'elegant-texture',
    name: 'Elegant Texture',
    description: 'Deep luxury texture & soft visual depth for high-end catalogs.',
    category: 'texture',
    isPremium: true,
    previewGradient: 'from-zinc-900 via-neutral-900 to-slate-950',
    previewAccent: '#F59E0B',
  },
  'paper-editorial': {
    id: 'paper-editorial',
    name: 'Paper / Editorial',
    description: 'Subtle tactile paper grain & literary line-art for bookstores.',
    category: 'texture',
    isPremium: true,
    previewGradient: 'from-orange-50/70 to-amber-100/50',
    previewAccent: '#7C2D12',
  },
};

export const RECOMMENDED_BACKGROUNDS_BY_BIZ_TYPE: Record<BusinessType, BackgroundStyleId[]> = {
  restaurant: ['clean', 'food-restaurant', 'cafe-coffee', 'soft-gradient', 'subtle-pattern'],
  salon: ['clean', 'botanical', 'soft-gradient', 'elegant-texture'],
  bookshop: ['clean', 'paper-editorial', 'subtle-pattern', 'elegant-texture'],
  general: ['clean', 'soft-gradient', 'modern-geometric', 'subtle-pattern', 'jewelry-luxury'],
};
