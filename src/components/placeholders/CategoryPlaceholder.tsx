import React from 'react';
import { 
  Utensils, Coffee, Pizza, Soup, Cake, Wine, IceCream,
  BookOpen, Bookmark, Library, BookMarked,
  Scissors, Sparkles, Flame, SprayCan, Crown,
  ShoppingBag, Tag, Package, Box, Layers, Star
} from 'lucide-react';
import { BusinessType } from '@/lib/types';

interface CategoryPlaceholderProps {
  businessType?: BusinessType;
  categoryName?: string;
  itemName?: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'tall';
}

export const CategoryPlaceholder: React.FC<CategoryPlaceholderProps> = ({
  businessType = 'general',
  categoryName = '',
  itemName = '',
  className = '',
}) => {
  const nameLower = (categoryName + ' ' + itemName).toLowerCase();

  // Select appropriate Lucide icon and background gradient based on business type & keywords
  let IconComponent = ShoppingBag;
  let bgGradient = 'from-slate-700 to-slate-900';
  let accentColor = 'text-amber-400';

  if (businessType === 'restaurant') {
    if (nameLower.includes('coffee') || nameLower.includes('drink') || nameLower.includes('beverage') || nameLower.includes('tea')) {
      IconComponent = Coffee;
      bgGradient = 'from-amber-800 to-stone-900';
      accentColor = 'text-amber-300';
    } else if (nameLower.includes('pizza') || nameLower.includes('pastry')) {
      IconComponent = Pizza;
      bgGradient = 'from-rose-800 to-orange-950';
      accentColor = 'text-amber-400';
    } else if (nameLower.includes('soup') || nameLower.includes('appetizer') || nameLower.includes('starter')) {
      IconComponent = Soup;
      bgGradient = 'from-emerald-800 to-teal-950';
      accentColor = 'text-emerald-300';
    } else if (nameLower.includes('dessert') || nameLower.includes('sweet') || nameLower.includes('cake')) {
      IconComponent = Cake;
      bgGradient = 'from-pink-800 to-purple-950';
      accentColor = 'text-pink-300';
    } else if (nameLower.includes('wine') || nameLower.includes('cocktail') || nameLower.includes('bar')) {
      IconComponent = Wine;
      bgGradient = 'from-purple-900 to-indigo-950';
      accentColor = 'text-purple-300';
    } else {
      IconComponent = Utensils;
      bgGradient = 'from-rose-900 to-stone-900';
      accentColor = 'text-rose-400';
    }
  } else if (businessType === 'bookshop') {
    if (nameLower.includes('fiction') || nameLower.includes('novel')) {
      IconComponent = BookOpen;
      bgGradient = 'from-teal-900 to-slate-900';
      accentColor = 'text-teal-300';
    } else if (nameLower.includes('science') || nameLower.includes('history') || nameLower.includes('non-fiction')) {
      IconComponent = Library;
      bgGradient = 'from-cyan-900 to-blue-950';
      accentColor = 'text-cyan-300';
    } else if (nameLower.includes('classic') || nameLower.includes('rare')) {
      IconComponent = BookMarked;
      bgGradient = 'from-amber-900 to-stone-950';
      accentColor = 'text-amber-300';
    } else {
      IconComponent = Bookmark;
      bgGradient = 'from-slate-800 to-slate-950';
      accentColor = 'text-teal-400';
    }
  } else if (businessType === 'salon') {
    if (nameLower.includes('beard') || nameLower.includes('shave') || nameLower.includes('barber')) {
      IconComponent = Flame;
      bgGradient = 'from-zinc-800 to-zinc-950';
      accentColor = 'text-amber-400';
    } else if (nameLower.includes('spa') || nameLower.includes('facial') || nameLower.includes('skincare')) {
      IconComponent = Sparkles;
      bgGradient = 'from-violet-900 to-slate-950';
      accentColor = 'text-violet-300';
    } else {
      IconComponent = Scissors;
      bgGradient = 'from-purple-900 to-slate-950';
      accentColor = 'text-purple-300';
    }
  } else {
    // General
    if (nameLower.includes('offer') || nameLower.includes('sale') || nameLower.includes('discount')) {
      IconComponent = Tag;
      bgGradient = 'from-blue-900 to-slate-950';
      accentColor = 'text-blue-300';
    } else if (nameLower.includes('box') || nameLower.includes('set')) {
      IconComponent = Package;
      bgGradient = 'from-indigo-900 to-slate-950';
      accentColor = 'text-indigo-300';
    } else {
      IconComponent = Package;
      bgGradient = 'from-slate-800 to-slate-950';
      accentColor = 'text-slate-300';
    }
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${bgGradient} overflow-hidden rounded-lg p-3 select-none ${className}`}
    >
      {/* Decorative background geometric pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Subtle corner light flare */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

      {/* Main icon container - Dead centered */}
      <div className="relative z-10 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 ${accentColor}`} />
      </div>
    </div>
  );
};
