import { BusinessType } from '@/lib/types';

export type BackgroundStyleId = 
  // MINIMAL
  | 'pure-canvas'
  | 'soft-gradient'
  | 'editorial-paper'
  // MODERN
  | 'aurora-flow'
  | 'liquid-glass'
  | 'architectural-grid'
  | 'organic-waves'
  // LUXURY
  | 'luxury-marble'
  | 'obsidian-glow'
  | 'silk-satin'
  | 'pearl-mist'
  | 'noir-gold'
  // BUSINESS
  | 'culinary-atelier'
  | 'coffee-atelier'
  | 'botanical-shadow';

export type BackgroundCategory = 'minimal' | 'modern' | 'luxury' | 'business';

export interface BackgroundCategoryMeta {
  id: BackgroundCategory;
  name: string;
  description: string;
}

export const BACKGROUND_CATEGORIES: BackgroundCategoryMeta[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean, subtle surfaces for crisp visual focus' },
  { id: 'modern', name: 'Modern', description: 'Atmospheric light, glass & architectural geometry' },
  { id: 'luxury', name: 'Luxury', description: 'Fine marble, silk, pearl & obsidian depth' },
  { id: 'business', name: 'Business', description: 'Culinary, cafe & botanical atelier line-art' },
];

export interface BackgroundStyle {
  id: BackgroundStyleId;
  name: string;
  description: string;
  category: BackgroundCategory;
  isPremium?: boolean;
  previewGradient: string;
  previewAccent: string;
}

export const BACKGROUND_STYLES: Record<BackgroundStyleId, BackgroundStyle> = {
  // MINIMAL
  'pure-canvas': {
    id: 'pure-canvas',
    name: 'Pure Canvas',
    description: 'Premium clean surface with subtle depth and almost invisible texture. Crisp & professional.',
    category: 'minimal',
    isPremium: false,
    previewGradient: 'from-slate-100 to-slate-200',
    previewAccent: '#0F172A',
  },
  'soft-gradient': {
    id: 'soft-gradient',
    name: 'Soft Gradient',
    description: 'Elegant multi-layer gradient adapting dynamically to your business theme color.',
    category: 'minimal',
    isPremium: false,
    previewGradient: 'from-sky-100 via-indigo-100 to-purple-100',
    previewAccent: '#6366F1',
  },
  'editorial-paper': {
    id: 'editorial-paper',
    name: 'Editorial Paper',
    description: 'Premium editorial paper surface with fine grain & thin line details.',
    category: 'minimal',
    isPremium: true,
    previewGradient: 'from-orange-50/70 via-amber-50 to-stone-100',
    previewAccent: '#7C2D12',
  },

  // MODERN
  'aurora-flow': {
    id: 'aurora-flow',
    name: 'Aurora Flow',
    description: 'Layered atmospheric aurora waves with soft brand-colored ambient light.',
    category: 'modern',
    isPremium: true,
    previewGradient: 'from-slate-950 via-indigo-950 to-purple-950',
    previewAccent: '#A855F7',
  },
  'liquid-glass': {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    description: 'Soft translucent glass-like forms floating over the background.',
    category: 'modern',
    isPremium: true,
    previewGradient: 'from-cyan-950 via-slate-900 to-sky-950',
    previewAccent: '#38BDF8',
  },
  'architectural-grid': {
    id: 'architectural-grid',
    name: 'Architectural Grid',
    description: 'Sophisticated architectural geometry with perspective lines & depth.',
    category: 'modern',
    isPremium: true,
    previewGradient: 'from-slate-900 via-zinc-900 to-slate-950',
    previewAccent: '#94A3B8',
  },
  'organic-waves': {
    id: 'organic-waves',
    name: 'Organic Waves',
    description: 'Elegant large curved overlapping translucent organic layers.',
    category: 'modern',
    isPremium: true,
    previewGradient: 'from-teal-950 via-slate-900 to-emerald-950',
    previewAccent: '#2DD4BF',
  },

  // LUXURY
  'luxury-marble': {
    id: 'luxury-marble',
    name: 'Luxury Marble',
    description: 'Elegant marble-inspired surface with restrained metallic champagne veins.',
    category: 'luxury',
    isPremium: true,
    previewGradient: 'from-stone-900 via-zinc-900 to-stone-950',
    previewAccent: '#D97706',
  },
  'obsidian-glow': {
    id: 'obsidian-glow',
    name: 'Obsidian Glow',
    description: 'Deep charcoal base with soft radial ambient glow.',
    category: 'luxury',
    isPremium: true,
    previewGradient: 'from-black via-zinc-950 to-neutral-950',
    previewAccent: '#F59E0B',
  },
  'silk-satin': {
    id: 'silk-satin',
    name: 'Silk & Satin',
    description: 'Smooth flowing fabric-inspired surface with satin highlights.',
    category: 'luxury',
    isPremium: true,
    previewGradient: 'from-rose-950 via-slate-950 to-purple-950',
    previewAccent: '#FB7185',
  },
  'pearl-mist': {
    id: 'pearl-mist',
    name: 'Pearl Mist',
    description: 'Soft luminous ivory/pearl surface with delicate luminous gradients.',
    category: 'luxury',
    isPremium: true,
    previewGradient: 'from-amber-50/80 via-rose-50/50 to-slate-100',
    previewAccent: '#E11D48',
  },
  'noir-gold': {
    id: 'noir-gold',
    name: 'Noir Gold',
    description: 'Deep charcoal base with thin gold geometric lines & ambient glow.',
    category: 'luxury',
    isPremium: true,
    previewGradient: 'from-zinc-950 via-black to-stone-950',
    previewAccent: '#EAB308',
  },

  // BUSINESS
  'culinary-atelier': {
    id: 'culinary-atelier',
    name: 'Culinary Atelier',
    description: 'Sophisticated culinary plate outlines, utensils & chef line-art.',
    category: 'business',
    isPremium: true,
    previewGradient: 'from-orange-950/90 via-amber-950 to-stone-950',
    previewAccent: '#F97316',
  },
  'coffee-atelier': {
    id: 'coffee-atelier',
    name: 'Coffee Atelier',
    description: 'Coffee bean silhouettes & warm editorial cafe texture.',
    category: 'business',
    isPremium: true,
    previewGradient: 'from-amber-950 via-stone-950 to-neutral-950',
    previewAccent: '#D97706',
  },
  'botanical-shadow': {
    id: 'botanical-shadow',
    name: 'Botanical Shadow',
    description: 'Elegant oversized blurred leaf shadows & botanical line-art.',
    category: 'business',
    isPremium: true,
    previewGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    previewAccent: '#10B981',
  },
};

/**
 * Safe normalization function mapping legacy or null/invalid background IDs cleanly to pure-canvas
 */
export function normalizeBackgroundStyleId(rawId?: string | null): BackgroundStyleId {
  if (!rawId) return 'pure-canvas';
  if (rawId in BACKGROUND_STYLES) return rawId as BackgroundStyleId;

  // Legacy mappings
  const legacyMap: Record<string, BackgroundStyleId> = {
    'clean': 'pure-canvas',
    'paper-editorial': 'editorial-paper',
    'food-restaurant': 'culinary-atelier',
    'cafe-coffee': 'coffee-atelier',
    'botanical': 'botanical-shadow',
    'jewelry-luxury': 'luxury-marble',
    'elegant-texture': 'obsidian-glow',
    'subtle-pattern': 'architectural-grid',
    'modern-geometric': 'aurora-flow',
  };

  return legacyMap[rawId] || 'pure-canvas';
}

export const RECOMMENDED_BACKGROUNDS_BY_BIZ_TYPE: Record<BusinessType, BackgroundStyleId[]> = {
  restaurant: ['pure-canvas', 'culinary-atelier', 'coffee-atelier', 'organic-waves', 'soft-gradient'],
  salon: ['pure-canvas', 'botanical-shadow', 'pearl-mist', 'soft-gradient', 'organic-waves', 'silk-satin'],
  bookshop: ['pure-canvas', 'editorial-paper', 'architectural-grid', 'organic-waves'],
  general: ['pure-canvas', 'soft-gradient', 'aurora-flow', 'liquid-glass', 'architectural-grid'],
};
