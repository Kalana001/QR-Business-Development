'use client';

import React, { useState, useMemo } from 'react';
import { 
  Percent, DollarSign, Tag, CheckSquare, Square, Search, Filter, 
  ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, 
  TrendingUp, TrendingDown, Layers, Sparkles
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export interface UndoPriceItem {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
}

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  categories: Category[];
  items: CatalogItem[];
  onUpdateSuccess: (count: number, undoList: UndoPriceItem[]) => void;
}

type UpdateMethod = 'percentage' | 'fixed' | 'exact';
type Direction = 'increase' | 'decrease';

export function calculateNewPrice(
  currentPrice: number,
  method: UpdateMethod,
  direction: Direction,
  value: number
): number {
  let newPrice = currentPrice;
  if (method === 'percentage') {
    const factor = direction === 'increase' ? 1 + value / 100 : 1 - value / 100;
    newPrice = currentPrice * factor;
  } else if (method === 'fixed') {
    newPrice = direction === 'increase' ? currentPrice + value : currentPrice - value;
  } else if (method === 'exact') {
    newPrice = value;
  }

  // Proper currency decimal rounding to avoid floating point issues (e.g. 1612.49999999)
  newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;

  // Prevent negative prices
  return Math.max(0, newPrice);
}

export const BulkPriceUpdateModal: React.FC<BulkPriceUpdateModalProps> = ({
  isOpen,
  onClose,
  business,
  categories,
  items,
  onUpdateSuccess,
}) => {
  // Step state: 'select' | 'preview'
  const [step, setStep] = useState<'select' | 'preview'>('select');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Selected item IDs (Set for O(1) lookups)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Price Update Rule State
  const [method, setMethod] = useState<UpdateMethod>('percentage');
  const [direction, setDirection] = useState<Direction>('increase');
  const [inputValue, setInputValue] = useState<string>('10');

  // Processing state
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Category Map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q));

      const matchesCat =
        selectedCategoryFilter === 'all' || item.category_id === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, selectedCategoryFilter]);

  // Handle Item Checkbox Toggle
  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select All Filtered Items
  const handleSelectAllFiltered = () => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      filteredItems.forEach((item) => next.add(item.id));
      return next;
    });
  };

  // Clear Selection
  const handleClearSelection = () => {
    setSelectedItemIds(new Set());
  };

  // Quick Select by Category
  const handleSelectByCategory = (catId: string) => {
    if (!catId || catId === 'all') return;
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      items.filter((item) => item.category_id === catId).forEach((item) => next.add(item.id));
      return next;
    });
  };

  // Numeric parsed value
  const numericValue = parseFloat(inputValue);
  const isInputValid =
    !isNaN(numericValue) &&
    (method === 'exact' ? numericValue >= 0 : numericValue > 0);

  // Calculate items to be updated and their preview data
  const previewItems = useMemo(() => {
    if (!isInputValid || selectedItemIds.size === 0) return [];

    const list: {
      item: CatalogItem;
      oldPrice: number;
      newPrice: number;
      difference: number;
      categoryName: string;
    }[] = [];

    items.forEach((item) => {
      if (selectedItemIds.has(item.id)) {
        const oldPrice = typeof item.price === 'number' ? item.price : 0;
        const newPrice = calculateNewPrice(oldPrice, method, direction, numericValue);
        const difference = Math.round((newPrice - oldPrice + Number.EPSILON) * 100) / 100;
        const categoryName = item.category_id ? categoryMap.get(item.category_id) || 'Uncategorized' : 'Uncategorized';

        list.push({
          item,
          oldPrice,
          newPrice,
          difference,
          categoryName,
        });
      }
    });

    return list;
  }, [items, selectedItemIds, isInputValid, method, direction, numericValue, categoryMap]);

  // Handle Apply Updates to Database
  const handleApplyUpdates = async () => {
    if (previewItems.length === 0) return;

    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const undoList: UndoPriceItem[] = [];

      // Update items in batches of 25 for optimal performance and tenant safety
      const BATCH_SIZE = 25;
      for (let i = 0; i < previewItems.length; i += BATCH_SIZE) {
        const batch = previewItems.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(async ({ item, oldPrice, newPrice }) => {
            const { error } = await supabase
              .from('catalog_items')
              .update({
                price: newPrice,
                updated_at: new Date().toISOString(),
              })
              .eq('id', item.id)
              .eq('business_id', business.id);

            if (error) {
              throw error;
            }

            undoList.push({
              id: item.id,
              name: item.name,
              oldPrice,
              newPrice,
            });
          })
        );
      }

      // Trigger success callback and close modal
      onUpdateSuccess(previewItems.length, undoList);
      handleResetAndClose();
    } catch (err: any) {
      console.error('Bulk price update error:', err);
      setErrorMessage(err.message || 'Price update failed. Please check your connection and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('select');
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedItemIds(new Set());
    setMethod('percentage');
    setDirection('increase');
    setInputValue('10');
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  const currencySymbol = business.currency || 'LKR';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Bulk Price Update"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {step === 'select' ? 'Select Items & Set Rule' : 'Review & Confirm Changes'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'select'
                ? 'Choose the catalog items and the price adjustment formula.'
                : 'Carefully verify the new prices before saving to your live menu.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span
              className={`px-2.5 py-1 rounded-full ${
                step === 'select'
                  ? 'bg-slate-900 text-teal-400'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              1. Select
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-full ${
                step === 'preview'
                  ? 'bg-slate-900 text-teal-400'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2. Preview & Confirm
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Price update failed:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: ITEM SELECTION & PRICE RULE FORMULA                               */}
        {/* ========================================================================= */}
        {step === 'select' && (
          <div className="space-y-5">
            {/* Search & Category Filter Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search items by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9 bg-slate-50"
                />
              </div>

              <div className="sm:col-span-6 flex items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium h-9"
                >
                  <option value="all">All Categories ({items.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (
                      {items.filter((i) => i.category_id === cat.id).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Selection Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAllFiltered}
                  className="text-xs h-7.5 px-2.5 bg-white font-semibold"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  Select All Filtered ({filteredItems.length})
                </Button>

                {selectedItemIds.size > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearSelection}
                    className="text-xs h-7.5 px-2.5 text-slate-500 hover:text-slate-800"
                  >
                    <Square className="w-3.5 h-3.5 mr-1" />
                    Clear Selection
                  </Button>
                )}
              </div>

              {/* Quick Select by Category Shortcut */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="hidden sm:inline font-medium text-[11px]">Quick Add Category:</span>
                <select
                  onChange={(e) => {
                    handleSelectByCategory(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-md font-medium text-slate-700"
                >
                  <option value="" disabled>
                    + Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({items.filter((i) => i.category_id === cat.id).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Counter Badge */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-700">
                Selected Items:{' '}
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-900 rounded-md font-black">
                  {selectedItemIds.size} of {items.length} items
                </span>
              </span>
              <span className="text-slate-400 text-[11px]">
                Showing {filteredItems.length} filtered items
              </span>
            </div>

            {/* Scrollable Item Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No items match your search filter.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = selectedItemIds.has(item.id);
                  const catName = item.category_id
                    ? categoryMap.get(item.category_id) || 'Uncategorized'
                    : 'Uncategorized';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors cursor-pointer select-none ${
                        isChecked
                          ? 'bg-teal-50/70 hover:bg-teal-100/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{catName}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-800">
                          {formatCurrency(item.price, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* =================================================================== */}
            {/* PRICE UPDATE METHOD CONFIGURATION                                   */}
            {/* =================================================================== */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-4 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    Price Update Formula
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Active Method: {method.toUpperCase()}
                </span>
              </div>

              {/* Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('percentage');
                    setInputValue('10');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    method === 'percentage'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span>Percentage (%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('fixed');
                    setInputValue('100');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    method === 'fixed'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Fixed Amount</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('exact');
                    setInputValue('1000');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    method === 'exact'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Set Exact Price</span>
                </button>
              </div>

              {/* Formula Inputs */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                {/* Method A: Percentage */}
                {method === 'percentage' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex rounded-lg overflow-hidden border border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => setDirection('increase')}
                          className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            direction === 'increase'
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" /> Increase (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirection('decrease')}
                          className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            direction === 'decrease'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <TrendingDown className="w-3.5 h-3.5" /> Decrease (-)
                        </button>
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                          By:
                        </span>
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="e.g. 10"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-white font-mono font-bold pr-8 text-xs h-8.5"
                          />
                          <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick percentage presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">
                        Quick presets:
                      </span>
                      {['5', '10', '15', '20', '25'].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setInputValue(pct)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            inputValue === pct
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Method B: Fixed Amount */}
                {method === 'fixed' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex rounded-lg overflow-hidden border border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => setDirection('increase')}
                          className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            direction === 'increase'
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" /> Increase (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirection('decrease')}
                          className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            direction === 'decrease'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <TrendingDown className="w-3.5 h-3.5" /> Decrease (-)
                        </button>
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                          Amount ({currencySymbol}):
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="e.g. 100"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white font-mono font-bold text-xs h-8.5"
                        />
                      </div>
                    </div>

                    {/* Quick amount presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">
                        Quick presets:
                      </span>
                      {['50', '100', '200', '500', '1000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setInputValue(amt)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            inputValue === amt
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Method C: Set Exact Price */}
                {method === 'exact' && (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                        Assign Exact Price ({currencySymbol}) for all selected:
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 1200"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white font-mono font-bold text-xs h-8.5 flex-1"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Note: Setting an exact price will overwrite the current price of all{' '}
                      {selectedItemIds.size} selected items with this exact value (0.00 is allowed).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1 Footer Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={handleResetAndClose} size="sm">
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => setStep('preview')}
                disabled={selectedItemIds.size === 0 || !isInputValid}
                className="gap-2 font-bold shadow-xs"
                size="sm"
              >
                <span>Preview Price Updates ({selectedItemIds.size})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: LIVE PREVIEW & CONFIRMATION                                       */}
        {/* ========================================================================= */}
        {step === 'preview' && (
          <div className="space-y-5">
            {/* Operation Overview Banner */}
            <div className="p-4 bg-teal-500/10 border-2 border-teal-500/30 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Price Update Summary</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {method === 'percentage' && (
                  <>
                    You are about to{' '}
                    <strong className="text-teal-900">{direction} the prices</strong> of{' '}
                    <strong>{previewItems.length} items</strong> by{' '}
                    <strong>{inputValue}%</strong>.
                  </>
                )}
                {method === 'fixed' && (
                  <>
                    You are about to{' '}
                    <strong className="text-teal-900">{direction} the prices</strong> of{' '}
                    <strong>{previewItems.length} items</strong> by{' '}
                    <strong>
                      {formatCurrency(numericValue, currencySymbol)}
                    </strong>
                    .
                  </>
                )}
                {method === 'exact' && (
                  <>
                    You are about to set the exact price of{' '}
                    <strong>{previewItems.length} items</strong> to{' '}
                    <strong>
                      {formatCurrency(numericValue, currencySymbol)}
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>

            {/* Live Comparison Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span>Detailed Price Comparison:</span>
                <span className="text-teal-700 font-extrabold">
                  {previewItems.length} items will be updated
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto divide-y divide-slate-100 bg-white">
                <div className="grid grid-cols-12 gap-2 px-3.5 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <div className="col-span-5">Item &amp; Category</div>
                  <div className="col-span-3 text-right">Current Price</div>
                  <div className="col-span-4 text-right">New Price (Diff)</div>
                </div>

                {previewItems.map(({ item, oldPrice, newPrice, difference, categoryName }) => {
                  const isIncreased = difference > 0;
                  const isDecreased = difference < 0;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 px-3.5 py-2.5 text-xs items-center hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="col-span-5 min-w-0 pr-1">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{categoryName}</p>
                      </div>

                      <div className="col-span-3 text-right font-mono text-slate-500">
                        {formatCurrency(oldPrice, currencySymbol)}
                      </div>

                      <div className="col-span-4 text-right font-mono">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(newPrice, currencySymbol)}
                        </span>
                        {difference !== 0 && (
                          <span
                            className={`block text-[10px] font-bold ${
                              isIncreased
                                ? 'text-emerald-600'
                                : isDecreased
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {isIncreased ? '+' : ''}
                            {formatCurrency(difference, currencySymbol)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmation Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Are you sure you want to apply these price updates?</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  This will safely update the selected catalog items in your database and live QR catalog.
                </p>
              </div>
            </div>

            {/* Step 2 Footer Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('select')}
                disabled={isUpdating}
                size="sm"
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit</span>
              </Button>

              <Button
                type="button"
                onClick={handleApplyUpdates}
                disabled={isUpdating || previewItems.length === 0}
                className="gap-2 font-bold bg-teal-600 hover:bg-teal-500 shadow-md"
                size="sm"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Prices...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Prices ({previewItems.length} items)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
