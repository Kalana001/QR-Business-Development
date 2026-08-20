'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Star, Image as ImageIcon, Filter, Upload, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CategoryPlaceholder } from '@/components/placeholders/CategoryPlaceholder';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, BUSINESS_TYPES_META } from '@/lib/types';
import { formatCurrency, formatDuration } from '@/lib/utils';

export default function DashboardItemsPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Business-Type specific form fields
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState('');
  const [duration, setDuration] = useState('');
  const [badgeInput, setBadgeInput] = useState('');
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (biz) {
      setBusiness(biz as Business);
      const { data: catData } = await supabase.from('categories').select('*').eq('business_id', biz.id).order('display_order');
      const { data: itemData } = await supabase.from('catalog_items').select('*').eq('business_id', biz.id).order('created_at', { ascending: false });
      setCategories((catData as Category[]) || []);
      setItems((itemData as CatalogItem[]) || []);
    }
    setLoading(false);
  }

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setDescription('');
    setIsAvailable(true);
    setIsFeatured(false);
    setImageUrl('');
    setAuthor('');
    setIsbn('');
    setQuantity('');
    setDuration('');
    setBadges([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.category_id || '');
    setPrice(item.price.toString());
    setDescription(item.description || '');
    setIsAvailable(item.is_available);
    setIsFeatured(item.is_featured);
    setImageUrl(item.image_url || '');
    setAuthor(item.author || '');
    setIsbn(item.isbn || '');
    setQuantity(item.quantity !== null && item.quantity !== undefined ? item.quantity.toString() : '');
    setDuration(item.duration ? item.duration.toString() : '');
    setBadges(item.badges || []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSubmitting(true);
    setFormError(null);

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFormError('Please enter a valid price.');
      setSubmitting(false);
      return;
    }

    const itemDataPayload = {
      business_id: business.id,
      category_id: categoryId || null,
      name,
      price: numericPrice,
      description: description || null,
      is_available: isAvailable,
      is_featured: isFeatured,
      image_url: imageUrl || null,
      author: author || null,
      isbn: isbn || null,
      quantity: quantity ? parseInt(quantity, 10) : null,
      duration: duration ? parseInt(duration, 10) : null,
      badges: badges.length > 0 ? badges : [],
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('catalog_items')
          .update(itemDataPayload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('catalog_items')
          .insert(itemDataPayload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const supabase = createClient();
      await supabase.from('catalog_items').delete().eq('id', id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err: any) {
      console.error('Delete item error:', err);
    }
  };

  const toggleAvailability = async (item: CatalogItem) => {
    const nextState = !item.is_available;
    setItems(items.map((i) => (i.id === item.id ? { ...i, is_available: nextState } : i)));
    try {
      const supabase = createClient();
      await supabase.from('catalog_items').update({ is_available: nextState }).eq('id', item.id);
    } catch {}
  };

  const addBadge = () => {
    if (badgeInput.trim() && !badges.includes(badgeInput.trim())) {
      setBadges([...badges, badgeInput.trim()]);
      setBadgeInput('');
    }
  };

  const removeBadge = (b: string) => {
    setBadges(badges.filter((badge) => badge !== b));
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const bMeta = business ? BUSINESS_TYPES_META[business.business_type] : BUSINESS_TYPES_META.general;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{bMeta.itemTerm} Catalog</h1>
          <p className="text-xs text-slate-500">
            Manage products and services displayed to customers when scanning your QR code.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2 font-semibold shadow-sm">
          <Plus className="w-4 h-4" /> Add New {bMeta.itemTerm}
        </Button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder={`Search ${bMeta.itemTerm.toLowerCase()}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
          >
            <option value="all">All Categories ({items.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Item List / Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No {bMeta.itemTerm.toLowerCase()}s found</h3>
          <p className="text-xs text-slate-500">
            Your catalog is empty or no items match your search. Add your first {bMeta.itemTerm.toLowerCase()} to get started!
          </p>
          <Button onClick={openAddModal} size="sm" className="mt-2">
            Add {bMeta.itemTerm}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const cat = categories.find((c) => c.id === item.category_id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Media Header */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CategoryPlaceholder
                      businessType={business?.business_type}
                      categoryName={cat?.name}
                      itemName={item.name}
                    />
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {item.is_featured && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase rounded-full shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" /> Featured
                      </span>
                    )}
                    {cat && (
                      <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white font-medium text-[10px] rounded-full">
                        {cat.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm transition-colors ${
                      item.is_available
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {item.is_available ? 'Active' : 'Hidden'}
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{item.name}</h3>
                      {item.author && (
                        <p className="text-xs font-medium text-teal-700 mt-0.5">by {item.author}</p>
                      )}
                    </div>
                    <div className="text-base font-extrabold text-slate-900 shrink-0">
                      {formatCurrency(item.price, business?.currency)}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Business Type Field Metadata */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Salon Duration */}
                    {bMeta.fields.duration && item.duration && (
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        ⏱️ {formatDuration(item.duration)}
                      </span>
                    )}

                    {/* Bookshop Quantity */}
                    {bMeta.fields.quantity && item.quantity !== null && item.quantity !== undefined && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        item.quantity === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.quantity === 0 ? 'Out of stock' : `Stock: ${item.quantity}`}
                      </span>
                    )}

                    {/* Bookshop ISBN */}
                    {item.isbn && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        ISBN: {item.isbn}
                      </span>
                    )}

                    {/* Restaurant Badges */}
                    {item.badges && item.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.badges.map((b) => (
                          <span key={b} className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    ID: {item.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${bMeta.itemTerm}` : `Add New ${bMeta.itemTerm}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`${bMeta.itemTerm} Name / Title`}
              placeholder={business?.business_type === 'bookshop' ? 'e.g. The Great Gatsby' : 'e.g. Truffle Pasta'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Type Dynamic Fields */}
          {business?.business_type === 'bookshop' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
              <Input
                label="Author Name"
                placeholder="e.g. F. Scott Fitzgerald"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <Input
                label="ISBN Number"
                placeholder="e.g. 9780743273565"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>
          )}

          {business?.business_type === 'salon' && (
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
              <Input
                label="Duration (in minutes)"
                type="number"
                placeholder="e.g. 45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          )}

          {business?.business_type === 'restaurant' && (
            <div className="space-y-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-900">
                Dietary & Dish Badges
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add badge (e.g. Vegan, Spicy, Chef Special)"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  className="bg-white"
                />
                <Button type="button" onClick={addBadge} variant="outline" size="sm" className="shrink-0">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-md font-semibold">
                    {b}
                    <button type="button" onClick={() => removeBadge(b)} className="hover:text-rose-700">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Selling Price (${business?.currency || 'USD'})`}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            {bMeta.fields.quantity && (
              <Input
                label="Stock Quantity"
                type="number"
                placeholder="Leave blank for unlimited"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a detailed description for customers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <Input
            label="Image URL (Optional)"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helperText="If no image is provided, a visual category fallback illustration will be displayed."
          />

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-950"
              />
              <span className="text-xs font-semibold text-slate-700">Available to Customers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-slate-700">Featured Highlight</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {editingItem ? 'Save Changes' : `Add ${bMeta.itemTerm}`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
