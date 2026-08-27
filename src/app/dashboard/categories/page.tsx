'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Edit2, Trash2, ArrowUp, ArrowDown, AlertCircle, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business, Category, SUBSCRIPTION_PLANS_META } from '@/lib/types';

export default function DashboardCategoriesPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
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
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', biz.id)
        .order('display_order');
      setCategories((catData as Category[]) || []);
    }
    setLoading(false);
  }

  const currentPlanKey = business?.subscription_plan || 'free';
  const currentPlanMeta = SUBSCRIPTION_PLANS_META[currentPlanKey];
  
  // NULL means Unlimited (Business Plus)
  const rawMaxCategories = business?.max_categories;
  const isUnlimited = currentPlanKey === 'enterprise' || rawMaxCategories === null || rawMaxCategories === undefined;
  const maxAllowedCategories = isUnlimited ? Infinity : (rawMaxCategories ?? 5);
  const isLimitReached = !isUnlimited && categories.length >= maxAllowedCategories;

  const openAddModal = () => {
    if (!editingCategory && isLimitReached) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setEditingCategory(null);
    setName('');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !name.trim()) return;

    if (!editingCategory && isLimitReached) {
      setIsModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      if (editingCategory) {
        await supabase
          .from('categories')
          .update({ name: name.trim(), description: description.trim() || null })
          .eq('id', editingCategory.id);
      } else {
        const nextOrder = categories.length + 1;
        await supabase
          .from('categories')
          .insert({
            business_id: business.id,
            name: name.trim(),
            description: description.trim() || null,
            display_order: nextOrder,
          });
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      let msg = err.message || 'Error saving category.';
      if (msg.includes('Quota Exceeded') || msg.includes('categories')) {
        msg = 'You have reached the maximum number of categories allowed on your current package. Please upgrade to add more categories.';
      }
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Items in this category will become uncategorized.')) return;
    try {
      const supabase = createClient();
      await supabase.from('categories').delete().eq('id', id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch {}
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    setCategories(reordered);

    try {
      const supabase = createClient();
      for (const cat of reordered) {
        await supabase.from('categories').update({ display_order: cat.display_order }).eq('id', cat.id);
      }
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Categories</h1>
          <p className="text-xs text-slate-500">
            Organize catalog items into custom sections for fast customer browsing.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2 font-semibold">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Plan Usage Meter Banner */}
      {business && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isLimitReached
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isLimitReached ? 'bg-rose-500 text-white' : 'bg-slate-900 text-teal-400'}`}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Category Limit ({currentPlanMeta.name})
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {categories.length} / {isUnlimited ? 'Unlimited' : maxAllowedCategories} Categories used
              </div>
            </div>
          </div>

          {!isUnlimited && (
            <Button
              onClick={() => setIsUpgradeModalOpen(true)}
              size="sm"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-1.5 border-none shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> {isLimitReached ? 'Limit Reached - Upgrade Now' : 'Upgrade Plan'}
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No categories created yet</h3>
          <p className="text-xs text-slate-500">
            Create categories to group menu items or products together.
          </p>
          <Button onClick={openAddModal} size="sm" className="mt-2">
            Create Category
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveOrder(idx, 'down')}
                    disabled={idx === categories.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={business?.subscription_plan}
        reason={`You have used ${categories.length} of your ${isUnlimited ? 'unlimited' : maxAllowedCategories} category limit on the ${currentPlanMeta.name} plan.`}
      />

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" isLoading={submitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Category Name"
            placeholder="e.g. Starters, Main Course, Fiction"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of this category section..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
