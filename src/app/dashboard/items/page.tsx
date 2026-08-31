'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Star, Image as ImageIcon, Filter, Upload, AlertCircle, Zap, Crown, Lock, RefreshCw, Crop
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { BulkImportModal } from '@/components/catalog/BulkImportModal';
import { ImageCropperModal } from '@/components/catalog/ImageCropperModal';
import { CategoryPlaceholder } from '@/components/placeholders/CategoryPlaceholder';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, BUSINESS_TYPES_META, SUBSCRIPTION_PLANS_META, ItemVariation } from '@/lib/types';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { validateImageFile, uploadItemImages, uploadItemImage, deleteItemImagesByUrl, deleteStorageFileByUrl, getOriginalImageUrl } from '@/lib/storage';

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

  // Image Upload & Crop State
  const [selectedOriginalFile, setSelectedOriginalFile] = useState<File | Blob | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileError, setImageFileError] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper Modal State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperSourceUrl, setCropperSourceUrl] = useState<string | null>(null);

  // Business-Type specific form fields
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState('');
  const [duration, setDuration] = useState('');
  const [badgeInput, setBadgeInput] = useState('');
  const [badges, setBadges] = useState<string[]>([]);

  // Item Variations / Options State (Portion sizes, editions, variants)
  const [hasVariations, setHasVariations] = useState(false);
  const [variationsList, setVariationsList] = useState<ItemVariation[]>([]);

  const handleAddVariationRow = () => {
    setVariationsList([...variationsList, { name: '', price: 0, is_available: true }]);
  };

  const handleUpdateVariationRow = (index: number, field: 'name' | 'price', val: string) => {
    const updated = [...variationsList];
    if (field === 'name') {
      updated[index].name = val;
    } else {
      const num = parseFloat(val);
      updated[index].price = isNaN(num) ? 0 : num;
    }
    setVariationsList(updated);
  };

  const handleRemoveVariationRow = (index: number) => {
    const updated = variationsList.filter((_, i) => i !== index);
    setVariationsList(updated);
    if (updated.length === 0) {
      setHasVariations(false);
    }
  };

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

  const handleImageFileSelect = (file: File | null) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageFileError(validation.error || 'Invalid image file.');
      return;
    }

    setImageFileError(null);
    setSelectedOriginalFile(file);
    setCroppedBlob(null);

    const objectUrl = URL.createObjectURL(file);
    setCropperSourceUrl(objectUrl);
    setIsCropperOpen(true);
  };

  const handleReCrop = () => {
    if (selectedOriginalFile) {
      const srcUrl = URL.createObjectURL(selectedOriginalFile);
      setCropperSourceUrl(srcUrl);
      setIsCropperOpen(true);
      return;
    }

    if (imageUrl || imagePreviewUrl) {
      const currentUrl = imageUrl || imagePreviewUrl || '';
      const origUrl = getOriginalImageUrl(currentUrl) || currentUrl;
      setCropperSourceUrl(origUrl);
      setIsCropperOpen(true);
    }
  };

  const handleCropConfirm = (blob: Blob, previewUrl: string) => {
    setCroppedBlob(blob);
    setImagePreviewUrl(previewUrl);
  };

  const handleRemoveImage = () => {
    setSelectedOriginalFile(null);
    setCroppedBlob(null);
    setImagePreviewUrl(null);
    setImageUrl('');
    setImageFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileSelect(e.dataTransfer.files[0]);
    }
  };

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
    setSelectedOriginalFile(null);
    setCroppedBlob(null);
    setImagePreviewUrl(null);
    setImageFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setAuthor('');
    setIsbn('');
    setQuantity('');
    setDuration('');
    setBadges([]);
    setHasVariations(false);
    setVariationsList([]);
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
    setSelectedOriginalFile(null);
    setCroppedBlob(null);
    setImagePreviewUrl(item.image_url || null);
    setImageFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setAuthor(item.author || '');
    setIsbn(item.isbn || '');
    setQuantity(item.quantity !== null && item.quantity !== undefined ? item.quantity.toString() : '');
    setDuration(item.duration ? item.duration.toString() : '');
    setBadges(item.badges || []);

    const itemVars = item.variations && Array.isArray(item.variations) ? item.variations : [];
    setHasVariations(itemVars.length > 0);
    setVariationsList(itemVars);

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

    // Validate variations if enabled
    const validVars: ItemVariation[] = [];
    if (hasVariations) {
      variationsList.forEach((v) => {
        if (v.name.trim() !== '') {
          validVars.push({
            name: v.name.trim(),
            price: typeof v.price === 'number' && !isNaN(v.price) && v.price >= 0 ? v.price : 0,
            is_available: v.is_available !== false,
          });
        }
      });

      if (validVars.length === 0) {
        setFormError('Please add at least one valid variation name and price, or disable variations.');
        setSubmitting(false);
        return;
      }
    }

    let numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      if (hasVariations && validVars.length > 0) {
        numericPrice = Math.min(...validVars.map((v) => v.price));
      } else {
        setFormError('Please enter a valid price.');
        setSubmitting(false);
        return;
      }
    }

    let finalImageUrl: string | null = imageUrl || null;

    const itemDataPayload = {
      business_id: business.id,
      category_id: categoryId || null,
      name,
      price: numericPrice,
      description: description || null,
      is_available: isAvailable,
      is_featured: isFeatured,
      image_url: finalImageUrl,
      author: author || null,
      isbn: isbn || null,
      quantity: quantity ? parseInt(quantity, 10) : null,
      duration: duration ? parseInt(duration, 10) : null,
      badges: badges.length > 0 ? badges : [],
      variations: hasVariations ? validVars : [],
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();

      if (editingItem) {
        // --- EDIT EXISTING ITEM ---
        const targetItemId = editingItem.id;
        const oldImageUrl = editingItem.image_url;

        if (croppedBlob && selectedOriginalFile) {
          // Upload new original and cropped catalog image
          const uploadRes = await uploadItemImages(business.id, targetItemId, selectedOriginalFile, croppedBlob);
          finalImageUrl = uploadRes.catalogUrl;

          // If old image was stored in business-assets and differs, remove old files
          if (oldImageUrl && oldImageUrl !== finalImageUrl) {
            await deleteItemImagesByUrl(oldImageUrl, business.id);
          }
        } else if (croppedBlob) {
          // User re-cropped existing original image
          const dummyOriginal = new Blob();
          const uploadRes = await uploadItemImages(business.id, targetItemId, dummyOriginal, croppedBlob);
          finalImageUrl = uploadRes.catalogUrl;
        } else if (!imagePreviewUrl && oldImageUrl) {
          // User explicitly clicked remove image
          finalImageUrl = null;
          await deleteItemImagesByUrl(oldImageUrl, business.id);
        }

        const updatePayload = {
          ...itemDataPayload,
          image_url: finalImageUrl,
        };

        const { error } = await supabase
          .from('catalog_items')
          .update(updatePayload)
          .eq('id', targetItemId);

        if (error) throw error;
      } else {
        // --- INSERT NEW ITEM ---
        // 1. Insert DB record first using existing logic
        const { data: newInsertedItem, error: insertErr } = await supabase
          .from('catalog_items')
          .insert(itemDataPayload)
          .select()
          .single();

        if (insertErr) throw insertErr;

        // 2. If user cropped an image, upload both original and cropped catalog image
        if (croppedBlob && newInsertedItem?.id) {
          try {
            const originalSource = selectedOriginalFile || croppedBlob;
            const uploadRes = await uploadItemImages(business.id, newInsertedItem.id, originalSource, croppedBlob);
            finalImageUrl = uploadRes.catalogUrl;

            await supabase
              .from('catalog_items')
              .update({ image_url: finalImageUrl })
              .eq('id', newInsertedItem.id);
          } catch (uploadErr: any) {
            console.error('Image upload failed after item creation:', uploadErr);
            setFormError(`Item created successfully, but image upload failed: ${uploadErr.message || 'Storage error'}. You can edit the item to retry uploading.`);
            await loadData();
            setSubmitting(false);
            return;
          }
        }
      }

      setIsModalOpen(false);
      setSelectedOriginalFile(null);
      setCroppedBlob(null);
      setCropperSourceUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadData();
    } catch (err: any) {
      let msg = err.message || 'Error saving item.';
      if (msg.includes('Quota Exceeded') || msg.includes('catalog items')) {
        msg = 'You have reached the maximum number of catalog items allowed on your current package. Please upgrade to add more items.';
      }
      setFormError(msg);
    } finally {
      setSubmitting(false);
      setSelectedOriginalFile(null);
      setCroppedBlob(null);
      setCropperSourceUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const supabase = createClient();
      const targetItem = items.find((i) => i.id === id);
      if (targetItem?.image_url && business) {
        await deleteItemImagesByUrl(targetItem.image_url, business.id);
      }
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
      let msg = err.message || 'Error creating category.';
      if (msg.includes('Quota Exceeded') || msg.includes('categories')) {
        msg = 'You have reached the maximum number of categories allowed on your current package. Please upgrade to add more categories.';
      }
      setCategoryError(msg);
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
                    <div className="text-base font-extrabold text-slate-900 shrink-0 text-right">
                      {item.variations && item.variations.length > 0 ? (
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">From</span>
                          <span>{formatCurrency(Math.min(...item.variations.map((v) => v.price)), business?.currency)}</span>
                          <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 block mt-0.5 font-bold">
                            {item.variations.length} Options
                          </span>
                        </div>
                      ) : (
                        formatCurrency(item.price, business?.currency)
                      )}
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

          {/* Item Variations / Options Section */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  Item Variations / Options
                </label>
                <p className="text-[11px] text-slate-500">
                  Portion sizes (Small, Large), book editions, service tiers, or item sizes with custom prices.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={hasVariations}
                  onChange={(e) => {
                    setHasVariations(e.target.checked);
                    if (e.target.checked && variationsList.length === 0) {
                      setVariationsList([{ name: '', price: 0, is_available: true }]);
                    }
                  }}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-teal-700">Enable Variations</span>
              </label>
            </div>

            {hasVariations && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                {variationsList.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Option Name (e.g. Small, Large, 1st Edition)"
                      value={v.name}
                      onChange={(e) => handleUpdateVariationRow(idx, 'name', e.target.value)}
                      className="text-xs bg-white flex-1"
                    />
                    <div className="w-32 shrink-0">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={v.price === 0 ? '' : v.price.toString()}
                        onChange={(e) => handleUpdateVariationRow(idx, 'price', e.target.value)}
                        className="text-xs bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariationRow(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                      title="Remove Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddVariationRow}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-teal-500 text-teal-700 font-bold text-xs rounded-lg flex items-center gap-1 mt-2 cursor-pointer"
                >
                  + Add Option
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Base Selling Price (${business?.currency || 'LKR'})`}
              type="number"
              step="0.01"
              placeholder={hasVariations ? 'Auto-calculated from lowest option' : '0.00'}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required={!hasVariations}
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

          {/* Item Image Upload & Preview Section */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Item Image (Optional)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                JPG, PNG, WEBP (Max 5 MB)
              </span>
            </div>

            {imageFileError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageFileError}</span>
              </div>
            )}

            {imagePreviewUrl ? (
              <div className="space-y-2">
                {/* Current Cropped Catalog Image Preview */}
                <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-950 h-44 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Cropped catalog preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/90 text-white font-bold text-[10px] uppercase rounded-md tracking-wider border border-white/20 backdrop-blur-xs">
                    Catalog Preview (1:1)
                  </div>
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleReCrop}
                      className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-teal-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" /> Re-Crop
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-rose-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>

                {/* Visible Action Buttons for Mobile / Touch Accessibility */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" /> Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleReCrop}
                    className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 font-bold text-xs rounded-lg hover:bg-teal-100 flex items-center gap-1"
                  >
                    <Crop className="w-3.5 h-3.5 text-teal-600" /> Re-Crop
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  isDraggingImage
                    ? 'border-teal-500 bg-teal-50/50 text-teal-700'
                    : 'border-slate-300 hover:border-teal-500 hover:bg-slate-100/50 text-slate-600'
                }`}
              >
                <div className="p-3 bg-white border border-slate-200 rounded-full shadow-xs text-teal-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Upload & Crop Image <span className="font-normal text-slate-500">(Click or drag & drop)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select an image file to open the 1:1 catalog image cropper
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* Optional Manual URL Link Expansion */}
            <div className="pt-1">
              <details className="text-[11px] text-slate-500 cursor-pointer">
                <summary className="font-semibold text-slate-600 hover:text-slate-900 select-none">
                  Or enter image URL manually
                </summary>
                <div className="pt-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setImagePreviewUrl(e.target.value.trim());
                        setSelectedOriginalFile(null);
                      } else if (!selectedOriginalFile) {
                        setImagePreviewUrl(null);
                      }
                    }}
                    className="text-xs"
                  />
                </div>
              </details>
            </div>
          </div>

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

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={cropperSourceUrl}
        onCropConfirm={handleCropConfirm}
        aspectRatio={1}
      />
    </div>
  );
}
