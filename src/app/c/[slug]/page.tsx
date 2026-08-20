'use client';

import React, { useEffect, useState, use } from 'react';
import { 
  Search, Phone, Mail, MapPin, Globe, Star, Clock, CheckCircle2, XCircle, X, ChevronRight, MessageCircle, Store, Utensils, BookOpen, Scissors, AlertCircle, Lock 
} from 'lucide-react';
import { CategoryPlaceholder } from '@/components/placeholders/CategoryPlaceholder';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, BUSINESS_TYPES_META } from '@/lib/types';
import { formatCurrency, formatDuration } from '@/lib/utils';

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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Modals & Drawers
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    async function loadPublicCatalog() {
      setLoading(true);
      const supabase = createClient();

      // 1. Fetch business from SANITIZED PUBLIC VIEW (public_businesses)
      const { data: bizData, error: bizError } = await supabase
        .from('public_businesses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (bizError || !bizData) {
        // Hardcoded demo catalog fallbacks if DB table is empty or loading locally
        if (slug === 'bella-vista-bistro') {
          const demoBiz: Business = {
            id: '11111111-1111-1111-1111-111111111111',
            owner_id: 'demo', name: 'Bella Vista Bistro', slug: 'bella-vista-bistro', business_type: 'restaurant',
            description: 'Authentic Italian dining with fresh homemade pasta and artisanal pizzas.',
            phone: '+1 (555) 234-5678', email: 'contact@bellavistabistro.com', address: '123 Main Street, Downtown',
            website: 'https://bellavistabistro.com', logo_url: null, banner_url: null, currency: 'USD', theme_color: '#E11D48',
            created_at: '', updated_at: '',
          };
          setBusiness(demoBiz);
          setCategories([
            { id: 'c1', business_id: demoBiz.id, name: 'Starters & Appetizers', description: 'Fresh Italian antipasti', display_order: 1, created_at: '' },
            { id: 'c2', business_id: demoBiz.id, name: 'Pasta & Mains', description: 'Handcrafted egg pasta', display_order: 2, created_at: '' },
          ]);
          setPublishedItems([
            { id: 'i1', business_id: demoBiz.id, category_id: 'c1', name: 'Bruschetta Originale', description: 'Grilled sourdough topped with vine tomatoes, garlic, extra virgin olive oil and fresh basil.', price: 12.5, is_available: true, is_featured: true, image_url: null, badges: ['Vegetarian', 'Popular'], created_at: '', updated_at: '' },
            { id: 'i2', business_id: demoBiz.id, category_id: 'c2', name: 'Truffle Tagliolini', description: 'Handmade egg pasta with summer black truffle sauce and aged Parmigiano Reggiano.', price: 24.0, is_available: true, is_featured: true, image_url: null, badges: ["Chef's Special"], created_at: '', updated_at: '' },
            { id: 'i3', business_id: demoBiz.id, category_id: 'c2', name: 'Margherita Artisanal Pizza', description: 'San Marzano tomatoes, fresh mozzarella di bufala, and basil.', price: 18.0, is_available: true, is_featured: false, image_url: null, badges: ['Vegetarian'], created_at: '', updated_at: '' },
          ]);
          setLoading(false);
          return;
        }

        setNotFound(true);
        setLoading(false);
        return;
      }

      setBusiness(bizData as Business);

      // 2. Fetch Categories from DB-RANK-ENFORCED VIEW (public_categories)
      const { data: catData } = await supabase
        .from('public_categories')
        .select('*')
        .eq('business_id', bizData.id);

      // 3. Fetch Items from DB-RANK-ENFORCED VIEW (public_catalog_items)
      const { data: itemData } = await supabase
        .from('public_catalog_items')
        .select('*')
        .eq('business_id', bizData.id);

      if (catData) setCategories(catData as Category[]);
      if (itemData) setPublishedItems(itemData as CatalogItem[]);

      setLoading(false);
    }

    loadPublicCatalog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Opening Catalog...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Catalog Not Found</h1>
          <p className="text-xs text-slate-500">
            The business catalog URL &quot;/c/{slug}&quot; could not be located. Please verify the QR code.
          </p>
        </div>
      </div>
    );
  }

  const bMeta = BUSINESS_TYPES_META[business.business_type] || BUSINESS_TYPES_META.general;

  // Filter ONLY over currently DB-published items
  const filteredItems = publishedItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategory === 'all' || item.category_id === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featuredItems = publishedItems.filter((i) => i.is_featured);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center selection:bg-slate-900 selection:text-white">
      {/* Mobile viewport container */}
      <div className="w-full max-w-md bg-white min-h-screen border-x border-slate-200 shadow-2xl flex flex-col justify-between relative">
        
        {/* Header / Brand Banner */}
        <header
          className="relative px-5 pt-8 pb-6 text-white overflow-hidden shadow-md"
          style={{ backgroundColor: business.theme_color || '#0F172A' }}
        >
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full text-white/90">
                  {bMeta.label}
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight leading-tight">{business.name}</h1>
              </div>

              <button
                onClick={() => setContactModalOpen(true)}
                className="p-3 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl text-white transition-transform active:scale-95 border border-white/20 shrink-0"
                aria-label="Contact Business"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>

            {business.description && (
              <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Quick Contact Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/90 font-medium">
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

        {/* Search Bar & Sticky Category Filter Pills */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 space-y-3 shadow-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${bMeta.itemTerm.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({publishedItems.length})
            </button>
            {categories.map((cat) => {
              const catCount = publishedItems.filter((i) => i.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({catCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Items Container */}
        <main className="flex-1 p-4 space-y-6">
          {/* Featured Highlight Section */}
          {activeCategory === 'all' && !searchQuery && featuredItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> Featured Highlights
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="w-48 bg-slate-900 text-white rounded-2xl overflow-hidden shrink-0 shadow-md cursor-pointer active:scale-98 transition-transform flex flex-col justify-between"
                  >
                    <div className="h-28 w-full bg-slate-800 relative">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <CategoryPlaceholder businessType={business.business_type} itemName={item.name} />
                      )}
                      <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full">
                        Star
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="text-xs font-bold line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-extrabold text-amber-400">
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
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2 my-8">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No {bMeta.itemTerm.toLowerCase()}s found</div>
              <p className="text-xs text-slate-400">Try searching for a different keyword or category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const cat = categories.find((c) => c.id === item.category_id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 active:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    {/* Item Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate leading-snug">
                          {item.name}
                        </h3>
                      </div>

                      {item.author && (
                        <p className="text-xs font-medium text-teal-700">by {item.author}</p>
                      )}

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Attribute Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {/* Salon Duration */}
                        {bMeta.fields.duration && item.duration && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDuration(item.duration)}
                          </span>
                        )}

                        {/* Bookshop Stock Status */}
                        {bMeta.fields.quantity && item.quantity !== null && item.quantity !== undefined && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.quantity === 0
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.quantity === 0 ? 'Out of stock' : `In stock (${item.quantity})`}
                          </span>
                        )}

                        {/* Restaurant Badges */}
                        {item.badges && item.badges.length > 0 && item.badges.map((b) => (
                          <span key={b} className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {b}
                          </span>
                        ))}
                      </div>

                      <div className="text-sm font-extrabold text-slate-900 pt-0.5">
                        {formatCurrency(item.price, business.currency)}
                      </div>
                    </div>

                    {/* Image Card */}
                    <div className="relative w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CategoryPlaceholder
                          businessType={business.business_type}
                          categoryName={cat?.name}
                          itemName={item.name}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="p-6 bg-slate-50 border-t border-slate-200 text-center space-y-2">
          <div className="text-xs font-bold text-slate-800">{business.name}</div>
          <p className="text-[11px] text-slate-400">
            Digital QR Catalog • No app download required
          </p>
        </footer>

        {/* Item Detail Sheet / Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Banner */}
              <div className="relative h-56 w-full bg-slate-900">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CategoryPlaceholder
                    businessType={business.business_type}
                    itemName={selectedItem.name}
                  />
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/70 text-white rounded-full backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedItem.name}</h2>
                    {selectedItem.author && (
                      <p className="text-xs font-semibold text-teal-700 mt-1">Author: {selectedItem.author}</p>
                    )}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 shrink-0">
                    {formatCurrency(selectedItem.price, business.currency)}
                  </div>
                </div>

                {selectedItem.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {selectedItem.duration && (
                    <span className="text-xs font-semibold text-purple-800 bg-purple-50 px-3 py-1 rounded-lg">
                      ⏱️ Duration: {formatDuration(selectedItem.duration)}
                    </span>
                  )}
                  {selectedItem.isbn && (
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      ISBN: {selectedItem.isbn}
                    </span>
                  )}
                  {selectedItem.quantity !== null && selectedItem.quantity !== undefined && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      selectedItem.quantity === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {selectedItem.quantity === 0 ? 'Out of Stock' : `Available Quantity: ${selectedItem.quantity}`}
                    </span>
                  )}
                  {selectedItem.badges && selectedItem.badges.map((b) => (
                    <span key={b} className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setContactModalOpen(true);
                  }}
                  className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Contact Business to Order / Inquire
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Business Modal */}
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Contact {business.name}</h3>
                <button onClick={() => setContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-between p-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-slate-900 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 text-white rounded-xl">
                        <Phone className="w-4 h-4" />
                      </div>
                      Call {business.phone}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                {business.phone && (
                  <a
                    href={`https://wa.me/${business.phone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-xs font-bold text-emerald-900 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      WhatsApp Chat
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center justify-between p-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-slate-900 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 text-white rounded-xl">
                        <Mail className="w-4 h-4" />
                      </div>
                      Email Business
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}

                {business.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-slate-900 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 text-white rounded-xl">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div>Location & Directions</div>
                        <div className="text-[10px] font-normal text-slate-500 truncate max-w-[180px]">
                          {business.address}
                        </div>
                      </div>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
