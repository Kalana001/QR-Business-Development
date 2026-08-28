import { BusinessType } from '@/lib/types';

export type BackgroundStyleId = 
  | 'clean-premium'
  | 'liquid-glass'
  | 'aurora-mesh'
  | 'luxury-marble'
  | 'obsidian-glow'
  | 'silk-flow'
  | 'cosmic-luxe'
  | 'architectural'
  | 'organic-flow'
  | 'editorial-paper'
  | 'soft-cloud'
  | 'brand-aura';

export interface BackgroundStyle {
  id: BackgroundStyleId;
  name: string;
  description: string;
  isPremium?: boolean;
  previewGradient: string;
  previewAccent: string;
}

export const BACKGROUND_STYLES: Record<BackgroundStyleId, BackgroundStyle> = {
  'clean-premium': {
    id: 'clean-premium',
    name: 'Clean Premium',
    description: 'Refined luxury minimal background with subtle radial lighting & editorial depth.',
    isPremium: false,
    previewGradient: 'from-slate-100 via-slate-50 to-slate-200',
    previewAccent: '#0F172A',
  },
  'liquid-glass': {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    description: 'Frosted glass layers, smooth translucent blobs & soft radial highlights.',
    isPremium: true,
    previewGradient: 'from-cyan-950 via-slate-900 to-sky-950',
    previewAccent: '#38BDF8',
  },
  'aurora-mesh': {
    id: 'aurora-mesh',
    name: 'Aurora Mesh',
    description: 'Subtle animated multi-point mesh gradient with soft brand-colored lighting.',
    isPremium: true,
    previewGradient: 'from-slate-950 via-indigo-950 to-purple-950',
    previewAccent: '#A855F7',
  },
  'luxury-marble': {
    id: 'luxury-marble',
    name: 'Luxury Marble',
    description: 'Sophisticated marble-inspired surface with restrained champagne metallic veins.',
    isPremium: true,
    previewGradient: 'from-stone-900 via-zinc-900 to-stone-950',
    previewAccent: '#D97706',
  },
  'obsidian-glow': {
    id: 'obsidian-glow',
    name: 'Obsidian Glow',
    description: 'Deep charcoal/black base with soft atmospheric glow & translucent dark glass.',
    isPremium: true,
    previewGradient: 'from-black via-zinc-950 to-neutral-950',
    previewAccent: '#F59E0B',
  },
  'silk-flow': {
    id: 'silk-flow',
    name: 'Silk Flow',
    description: 'Smooth flowing fabric-inspired surface with satin highlights & elegant depth.',
    isPremium: true,
    previewGradient: 'from-rose-950 via-slate-950 to-purple-950',
    previewAccent: '#FB7185',
  },
  'cosmic-luxe': {
    id: 'cosmic-luxe',
    name: 'Cosmic Luxe',
    description: 'Deep gradient base with soft glowing orbs & luxury technology ambient depth.',
    isPremium: true,
    previewGradient: 'from-indigo-950 via-slate-950 to-blue-950',
    previewAccent: '#6366F1',
  },
  'architectural': {
    id: 'architectural',
    name: 'Architectural',
    description: 'Geometric perspective planes, translucent surfaces & thin architectural lines.',
    isPremium: true,
    previewGradient: 'from-slate-900 via-zinc-900 to-slate-950',
    previewAccent: '#94A3B8',
  },
  'organic-flow': {
    id: 'organic-flow',
    name: 'Organic Flow',
    description: 'Smooth organic forms, natural curves & translucent gradient layers.',
    isPremium: true,
    previewGradient: 'from-teal-950 via-slate-900 to-emerald-950',
    previewAccent: '#2DD4BF',
  },
  'editorial-paper': {
    id: 'editorial-paper',
    name: 'Editorial Paper',
    description: 'Tactile paper texture, fine grain & magazine-inspired decorative lines.',
    isPremium: true,
    previewGradient: 'from-orange-50/80 via-amber-50 to-stone-100',
    previewAccent: '#7C2D12',
  },
  'soft-cloud': {
    id: 'soft-cloud',
    name: 'Soft Cloud',
    description: 'Bright white/cream base with blurred light layers & cloud-like gradients.',
    isPremium: false,
    previewGradient: 'from-amber-50/90 via-sky-50/60 to-slate-100',
    previewAccent: '#3B82F6',
  },
  'brand-aura': {
    id: 'brand-aura',
    name: 'Brand Aura',
    description: 'Dynamic softened mesh gradient derived intelligently from your theme color.',
    isPremium: true,
    previewGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    previewAccent: '#8B5CF6',
  },
};

/**
 * Safe normalization function mapping legacy, null, or unknown background IDs cleanly to clean-premium
 */
export function normalizeBackgroundStyleId(rawId?: string | null): BackgroundStyleId {
  if (!rawId) return 'clean-premium';
  if (rawId in BACKGROUND_STYLES) return rawId as BackgroundStyleId;

  // Legacy mappings from previous iterations to clean-premium or closest match
  const legacyMap: Record<string, BackgroundStyleId> = {
    'clean': 'clean-premium',
    'pure-canvas': 'clean-premium',
    'soft-gradient': 'brand-aura',
    'subtle-pattern': 'architectural',
    'food-restaurant': 'organic-flow',
    'jewelry-luxury': 'luxury-marble',
    'botanical': 'organic-flow',
    'botanical-shadow': 'organic-flow',
    'cafe-coffee': 'editorial-paper',
    'coffee-atelier': 'editorial-paper',
    'culinary-atelier': 'organic-flow',
    'modern-geometric': 'architectural',
    'elegant-texture': 'obsidian-glow',
    'paper-editorial': 'editorial-paper',
    'aurora-flow': 'aurora-mesh',
    'silk-satin': 'silk-flow',
    'pearl-mist': 'soft-cloud',
    'noir-gold': 'obsidian-glow',
  };

  return legacyMap[rawId] || 'clean-premium';
}

export const RECOMMENDED_BACKGROUNDS_BY_BIZ_TYPE: Record<BusinessType, BackgroundStyleId[]> = {
  restaurant: ['clean-premium', 'liquid-glass', 'aurora-mesh', 'organic-flow', 'soft-cloud'],
  salon: ['organic-flow', 'liquid-glass', 'soft-cloud', 'aurora-mesh', 'silk-flow'],
  bookshop: ['editorial-paper', 'clean-premium', 'architectural', 'soft-cloud', 'liquid-glass'],
  general: ['clean-premium', 'liquid-glass', 'brand-aura', 'architectural', 'aurora-mesh'],
};
