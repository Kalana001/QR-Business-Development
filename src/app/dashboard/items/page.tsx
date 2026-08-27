'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Star, Image as ImageIcon, Filter, Upload, AlertCircle, Zap, Crown, Lock, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { BulkImportModal } from '@/components/catalog/BulkImportModal';
import { CategoryPlaceholder } from '@/components/placeholders/CategoryPlaceholder';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, BUSINESS_TYPES_META, SUBSCRIPTION_PLANS_META } from '@/lib/types';
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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);

  // Inline Category Creation Fields
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

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

  // Calculate Expiration & Effective Limits (NULL max_items = Unlimited)
  const isSuperAdmin = business?.name?.toLowerCase().includes('master super admin');
  const isExpired = !isSuperAdmin && (business?.subscription_status !== 'active' || 
    (business?.subscription_end_date ? new Date(business.subscription_end_date) < new Date() : false));
  
  const currentPlanKey = business?.subscription_plan || 'free';
  const currentPlanMeta = SUBSCRIPTION_PLANS_META[currentPlanKey];
  
  // NULL means Unlimited
  const rawMaxItems = business?.max_items;
  const isUnlimited = isSuperAdmin || (!isExpired && (rawMaxItems === null || rawMaxItems === undefined || currentPlanKey === 'enterprise'));
  const maxAllowedItems = isUnlimited ? Infinity : (isExpired ? 10 : (rawMaxItems ?? 10));

  const openAddModal = () => {
    if (!editingItem && !isUnlimited && items.length >= maxAllowedItems) {
      setIsUpgradeModalOpen(true);
      return;
    }

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

    if (!editingItem && !isUnlimited && items.length >= maxAllowedItems) {
      setIsModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }

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

  const toggleAvailability = async (item: CatalogItem, isLocked: boolean) => {
    if (isLocked) {
      setIsUpgradeModalOpen(true);
      return;
    }
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

  const handleInlineCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newCategoryName.trim()) return;

    // Calculate category subscription limit
    const rawMaxCategories = business.max_categories;
    const isUnlimitedCategories = isSuperAdmin || (!isExpired && (rawMaxCategories === null || rawMaxCategories === undefined || currentPlanKey === 'enterprise'));
    const maxAllowedCategories = isUnlimitedCategories ? Infinity : (isExpired ? 5 : (rawMaxCategories ?? 5));

    if (categories.length >= maxAllowedCategories) {
      setCategoryError(`Category limit reached (${categories.length}/${maxAllowedCategories}). Please upgrade your plan to create more categories.`);
      return;
    }

    setCreatingCategory(true);
    setCategoryError(null);

    try {
      const supabase = createClient();
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert({
          business_id: business.id,
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim() || null,
          display_order: categories.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      if (newCat) {
        setCategories([...categories, newCat as Category]);
        setCategoryId(newCat.id); // Automatically select newly created category!
        setIsCreateCategoryModalOpen(false);
        setNewCategoryName('');
        setNewCategoryDesc('');
      }
    } catch (err: any) {
      setCategoryError(err.message || 'Error creating category.');
    } finally {
      setCreatingCategory(false);
    }
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
  const publishedCount = isUnlimited ? items.length : Math.min(items.length, maxAllowedItems);

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
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="gap-2 font-semibold border-teal-500/40 text-teal-700 bg-teal-50 hover:bg-teal-100 shadow-xs"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button onClick={openAddModal} className="gap-2 font-semibold shadow-xs">
            <Plus className="w-4 h-4" /> Add New {bMeta.itemTerm}
          </Button>
        </div>
      </div>

      {/* EXPIRED SUBSCRIPTION WARNING BANNER */}
      {isExpired && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-amber-500 text-slate-950 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Subscription Expired — Catalog Fallback Active
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Your {currentPlanMeta.name} subscription has expired.
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Your entire catalog is <strong>safely saved</strong> ({items.length} items kept in your database), but only <strong>{publishedCount} items</strong> are currently visible to customers on the Starter Free tier.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsUpgradeModalOpen(true)}
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs gap-1.5 border-none shadow-md shrink-0 py-2.5 px-4"
          >
            <Zap className="w-4 h-4" /> Renew {currentPlanMeta.name}
          </Button>
        </div>
      )}

      {/* Plan Usage Meter Banner */}
      {business && !isExpired && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          !isUnlimited && items.length >= maxAllowedItems
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${!isUnlimited && items.length >= maxAllowedItems ? 'bg-rose-500 text-white' : 'bg-slate-900 text-teal-400'}`}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Plan Usage ({currentPlanMeta.name})
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {items.length} / {isUnlimited ? 'Unlimited' : maxAllowedItems} {bMeta.itemTerm}s used
              </div>
            </div>
          </div>

          {!isUnlimited && (
            <Button
              onClick={() => setIsUpgradeModalOpen(true)}
              size="sm"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-1.5 border-none shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> Upgrade Plan
            </Button>
          )}
        </div>
      )}

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
          {filteredItems.map((item, index) => {
            const cat = categories.find((c) => c.id === item.category_id);
            const isLocked = !isUnlimited && index >= maxAllowedItems;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                  isLocked
                    ? 'bg-slate-50 border-amber-200/80 shadow-xs opacity-75'
                    : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Media Header */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className={`w-full h-full object-cover ${isLocked ? 'grayscale-30' : ''}`}
                    />
                  ) : (
                    <CategoryPlaceholder
                      businessType={business?.business_type}
                      categoryName={cat?.name}
                      itemName={item.name}
                    />
                  )}

                  {/* Locked Overlay Badge */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full shadow-lg flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Locked (Plan Exceeded)
                      </span>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {item.is_featured && !isLocked && (
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
                    onClick={() => toggleAvailability(item, isLocked)}
                    disabled={isLocked}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm transition-colors ${
                      isLocked
                        ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                        : item.is_available
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                    title={isLocked ? 'Renew subscription to publish item' : 'Toggle Visibility'}
                  >
                    {isLocked ? '🔒 Hidden' : item.is_available ? 'Active' : 'Hidden'}
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                        {item.name}
                        {isLocked && <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </h3>
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
                    {bMeta.fields.duration && item.duration && (
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        ⏱️ {formatDuration(item.duration)}
                      </span>
                    )}

                    {bMeta.fields.quantity && item.quantity !== null && item.quantity !== undefined && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        item.quantity === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.quantity === 0 ? 'Out of stock' : `Stock: ${item.quantity}`}
                      </span>
                    )}

                    {item.isbn && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        ISBN: {item.isbn}
                      </span>
                    )}

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
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isLocked ? '🔒 Saved in DB' : `ID: ${item.id.slice(0, 8)}`}
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

      {/* Upgrade / Renewal Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={business?.subscription_plan}
        reason={
          isExpired
            ? `Your ${currentPlanMeta.name} subscription has expired. Renew your plan to unlock all ${items.length} items!`
            : `You have used ${items.length} of your ${isUnlimited ? 'unlimited' : maxAllowedItems} item limit on the ${currentPlanMeta.name} plan.`
        }
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${bMeta.itemTerm}` : `Add New ${bMeta.itemTerm}`}
        maxWidth="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="item-form" isLoading={submitting}>
              {editingItem ? 'Save Changes' : `Add ${bMeta.itemTerm}`}
            </Button>
          </>
        }
      >
        <form id="item-form" onSubmit={handleSaveItem} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryError(null);
                    setIsCreateCategoryModalOpen(true);
                  }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create New
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => {
                  if (e.target.value === '__CREATE_NEW__') {
                    setCategoryError(null);
                    setIsCreateCategoryModalOpen(true);
                  } else {
                    setCategoryId(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__CREATE_NEW__" className="font-bold text-teal-600 bg-teal-50">
                  + Create New Category...
                </option>
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
              label={`Selling Price (${business?.currency || 'LKR'})`}
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
        </form>
      </Modal>

      {/* Inline Create Category Modal */}
      <Modal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        title="Create New Category"
        maxWidth="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsCreateCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="inline-category-form"
              isLoading={creatingCategory}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Create & Select
            </Button>
          </>
        }
      >
        <form id="inline-category-form" onSubmit={handleInlineCreateCategory} className="space-y-4">
          {categoryError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{categoryError}</span>
            </div>
          )}

          <Input
            label="Category Name"
            placeholder="e.g. Special Offers, Starters, Desserts"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Fresh daily chef specials"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      {business && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          business={business}
          categories={categories}
          existingItems={items}
          onImportSuccess={loadData}
          onOpenUpgradeModal={() => {
            setIsBulkImportOpen(false);
            setIsUpgradeModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
