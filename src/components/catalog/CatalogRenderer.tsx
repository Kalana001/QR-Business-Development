'use client';

import React, { useState } from 'react';
import { 
  Search, Phone, Mail, MapPin, Globe, Star, Clock, CheckCircle2, AlertCircle, X, ChevronRight, Store, BookOpen, Scissors, Utensils 
} from 'lucide-react';
import { CategoryPlaceholder } from '@/components/placeholders/CategoryPlaceholder';
import { Business, CatalogItem, Category, BUSINESS_TYPES_META } from '@/lib/types';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { CatalogThemeSettings, CATALOG_TEMPLATES, TemplateId } from '@/lib/templates';

interface CatalogRendererProps {
  business: Business;
  categories: Category[];
  publishedItems: CatalogItem[];
  themeSettings: CatalogThemeSettings;
  onSelectItem?: (item: CatalogItem) => void;
  onSearchChange?: (query: string) => void;
}

export function CatalogRenderer({
  business,
  categories,
  publishedItems,
  themeSettings,
  onSelectItem,
  onSearchChange,
}: CatalogRendererProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const templateId = (themeSettings?.template_id || 'minimal-clean') as TemplateId;
  const templateMeta = CATALOG_TEMPLATES[templateId] || CATALOG_TEMPLATES['minimal-clean'];

  // Color overrides or template defaults
  const primaryColor = themeSettings?.primary_color || templateMeta.defaultColors.primary;
  const accentColor = themeSettings?.accent_color || templateMeta.defaultColors.accent;
  const bgColor = templateMeta.defaultColors.background;
  const cardBgColor = templateMeta.defaultColors.cardBg;
  const textColor = templateMeta.defaultColors.text;
  const subtextColor = templateMeta.defaultColors.subtext;

  const bMeta = BUSINESS_TYPES_META[business.business_type] || BUSINESS_TYPES_META.general;

  // Filter items
  const filteredItems = publishedItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategory === 'all' || item.category_id === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featuredItems = publishedItems.filter((i) => i.is_featured);

  const handleItemClick = (item: CatalogItem) => {
    setSelectedItem(item);
    if (onSelectItem) onSelectItem(item);
  };

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <div 
      className="min-h-screen text-slate-900 flex justify-center selection:bg-slate-900 selection:text-white transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {/* Viewport Container */}
      <div 
        className="w-full max-w-md min-h-screen border-x shadow-2xl flex flex-col justify-between relative"
        style={{ backgroundColor: cardBgColor, borderColor: 'rgba(226, 232, 240, 0.2)' }}
      >
        
        {/* Header / Brand Banner */}
        <header
          className="relative px-5 pt-8 pb-6 overflow-hidden shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="relative z-10 space-y-3 text-white">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/10 backdrop-blur-xs border border-white/20">
                {bMeta.label}
              </span>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Business Logo & Name */}
            <div className="space-y-2">
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-1">
                {business.logo_url ? (
                  <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg ring-2 ring-white/30 overflow-hidden flex items-center justify-center">
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    {business.name.charAt(0)}
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                  {business.name}
                </h1>
              </div>

              {business.description && (
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed text-center">
                  {business.description}
                </p>
              )}
            </div>

            {/* Contact Information Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] text-white/90 font-medium">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:underline">
                  <Phone className="w-3 h-3" /> {business.phone}
                </a>
              )}
              {business.address && (
                <span className="flex items-center gap-1 truncate max-w-[180px]">
                  <MapPin className="w-3 h-3 shrink-0" /> {business.address}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Sticky Search & Category Bar */}
        <div 
          className="sticky top-0 z-20 border-b px-4 py-3 space-y-3 shadow-xs backdrop-blur-md"
          style={{ backgroundColor: cardBgColor, borderColor: 'rgba(226, 232, 240, 0.15)' }}
        >
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${bMeta.itemTerm.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border rounded-xl text-xs focus:outline-none transition-all"
              style={{
                backgroundColor: templateId === 'modern-dark' || templateId === 'elegant-premium' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                borderColor: 'rgba(226,232,240,0.2)',
                color: textColor,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchInput('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pill Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                backgroundColor: activeCategory === 'all' ? accentColor : 'rgba(241, 245, 249, 0.15)',
                color: activeCategory === 'all' ? '#020617' : textColor,
              }}
            >
              All ({publishedItems.length})
            </button>
            {categories.map((cat) => {
              const catCount = publishedItems.filter((i) => i.category_id === cat.id).length;
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: isCatActive ? accentColor : 'rgba(241, 245, 249, 0.15)',
                    color: isCatActive ? '#020617' : textColor,
                  }}
                >
                  {cat.name} ({catCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Items Feed */}
        <main className="flex-1 p-4 space-y-6">
          {/* Featured Highlight Section */}
          {activeCategory === 'all' && !searchQuery && featuredItems.length > 0 && (
            <div className="space-y-2">
              <div 
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                <Star className="w-3.5 h-3.5 fill-current" /> Featured Highlights
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-48 rounded-2xl overflow-hidden shrink-0 shadow-md cursor-pointer active:scale-98 transition-transform flex flex-col justify-between border"
                    style={{ 
                      backgroundColor: templateId === 'modern-dark' || templateId === 'elegant-premium' ? '#0F172A' : '#FFFFFF',
                      borderColor: 'rgba(226, 232, 240, 0.15)',
                    }}
                  >
                    <div className="h-28 w-full bg-slate-800 relative">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryPlaceholder businessType={business.business_type} itemName={item.name} />
                      )}
                      <span 
                        className="absolute top-2 right-2 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs"
                        style={{ backgroundColor: accentColor, color: '#020617' }}
                      >
                        Star
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs font-bold line-clamp-1" style={{ color: textColor }}>{item.name}</h4>
                      <p className="text-xs font-extrabold" style={{ color: accentColor }}>
                        {formatCurrency(item.price, business.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Feed */}
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center border rounded-2xl space-y-2 my-8" style={{ borderColor: 'rgba(226, 232, 240, 0.15)' }}>
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold" style={{ color: textColor }}>No {bMeta.itemTerm.toLowerCase()}s found</div>
              <p className="text-xs" style={{ color: subtextColor }}>Try searching for a different keyword or category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="border rounded-2xl p-4 shadow-xs hover:border-slate-400 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-4"
                    style={{
                      backgroundColor: templateId === 'modern-dark' || templateId === 'elegant-premium' ? '#0F172A' : '#FFFFFF',
                      borderColor: 'rgba(226, 232, 240, 0.15)',
                    }}
                  >
                    {/* Item Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold truncate leading-snug" style={{ color: textColor }}>
                          {item.name}
                        </h3>
                      </div>

                      {item.author && (
                        <p className="text-xs font-medium text-teal-600">by {item.author}</p>
                      )}

                      {item.description && (
                        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: subtextColor }}>
                          {item.description}
                        </p>
                      )}

                      {/* Attribute Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {bMeta.fields.duration && item.duration && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 bg-purple-500/10 text-purple-400">
                            <Clock className="w-3 h-3" /> {formatDuration(item.duration)}
                          </span>
                        )}

                        {bMeta.fields.quantity && item.quantity !== null && item.quantity !== undefined && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.quantity === 0
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {item.quantity === 0 ? 'Out of Stock' : `In Stock: ${item.quantity}`}
                          </span>
                        )}

                        {item.badges && item.badges.length > 0 && (
                          item.badges.map((b) => (
                            <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400">
                              {b}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-sm font-black pt-1" style={{ color: accentColor }}>
                        {formatCurrency(item.price, business.currency)}
                      </div>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-slate-800 flex items-center justify-center border border-white/10">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryPlaceholder businessType={business.business_type} itemName={item.name} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Item Details Popup Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl space-y-4">
              <div className="relative h-56 w-full bg-slate-800 flex items-center justify-center">
                {selectedItem.image_url ? (
                  <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  <CategoryPlaceholder businessType={business.business_type} itemName={selectedItem.name} />
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 p-2 bg-slate-950/70 text-white rounded-full hover:bg-slate-950 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">{selectedItem.name}</h3>
                  {selectedItem.author && <p className="text-xs text-teal-400 font-semibold">by {selectedItem.author}</p>}
                </div>

                {selectedItem.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedItem.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Price</div>
                  <div className="text-xl font-black text-amber-400">
                    {formatCurrency(selectedItem.price, business.currency)}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Close Item Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="p-4 text-center text-[11px] border-t space-y-1" style={{ borderColor: 'rgba(226, 232, 240, 0.15)', color: subtextColor }}>
          <p>© {new Date().getFullYear()} {business.name}. Powered by QR Business Studio.</p>
        </footer>
      </div>
    </div>
  );
}
