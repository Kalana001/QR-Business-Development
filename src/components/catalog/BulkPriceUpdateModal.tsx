'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  CheckSquare, Square, Search, RefreshCw, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Layers, Sparkles, Save, RotateCcw, 
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, ItemVariation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export interface UndoPriceItem {
  id: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  oldVariations?: ItemVariation[] | null;
  newVariations?: ItemVariation[] | null;
}

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  categories: Category[];
  items: CatalogItem[];
  onUpdateSuccess: (count: number, undoList: UndoPriceItem[]) => void;
}

export const BulkPriceUpdateModal: React.FC<BulkPriceUpdateModalProps> = ({
  isOpen,
  onClose,
  business,
  categories,
  items,
  onUpdateSuccess,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Selected item IDs (Set for O(1) lookups)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Direct Edited Prices State: Record<itemId, string>
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});

  // Direct Edited Variations State: Record<itemId, ItemVariation[]>
  const [editedVariations, setEditedVariations] = useState<Record<string, ItemVariation[]>>({});

  // Expanded item rows for variations
  const [expandedVariations, setExpandedVariations] = useState<Set<string>>(new Set());

  // Processing state
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Category Map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Handle Item Checkbox Toggle
  const toggleItemSelection = (item: CatalogItem) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        // Initialize price input if not yet touched
        if (editedPrices[item.id] === undefined) {
          setEditedPrices((p) => ({
            ...p,
            [item.id]: (item.price ?? 0).toString(),
          }));
        }
        // Initialize variations if any
        if (item.variations && item.variations.length > 0 && editedVariations[item.id] === undefined) {
          setEditedVariations((v) => ({
            ...v,
            [item.id]: JSON.parse(JSON.stringify(item.variations)),
          }));
          // Auto-expand variation rows for easy inspection
          setExpandedVariations((exp) => new Set(exp).add(item.id));
        }
      }
      return next;
    });
  };

  // Select All Filtered Items
  const handleSelectAllFiltered = (filteredList: CatalogItem[]) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      const newPrices = { ...editedPrices };
      const newVars = { ...editedVariations };
      const newExp = new Set(expandedVariations);

      filteredList.forEach((item) => {
        next.add(item.id);
        if (newPrices[item.id] === undefined) {
          newPrices[item.id] = (item.price ?? 0).toString();
        }
        if (item.variations && item.variations.length > 0 && newVars[item.id] === undefined) {
          newVars[item.id] = JSON.parse(JSON.stringify(item.variations));
          newExp.add(item.id);
        }
      });

      setEditedPrices(newPrices);
      setEditedVariations(newVars);
      setExpandedVariations(newExp);
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
    const catItems = items.filter((item) => item.category_id === catId);
    handleSelectAllFiltered(catItems);
  };

  // Handle Base Item Price Input Change
  const handlePriceChange = (itemId: string, value: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  // Handle Variation Price Change
  const handleVariationPriceChange = (itemId: string, varIndex: number, value: string) => {
    const num = parseFloat(value);
    const validNum = isNaN(num) ? 0 : Math.max(0, num);

    setEditedVariations((prev) => {
      const itemVars = prev[itemId] || [];
      const updated = [...itemVars];
      if (updated[varIndex]) {
        updated[varIndex] = {
          ...updated[varIndex],
          price: validNum,
        };
      }
      return {
        ...prev,
        [itemId]: updated,
      };
    });
  };

  // Toggle expand/collapse variations for an item
  const toggleExpandVariations = (itemId: string) => {
    setExpandedVariations((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Reset an item's edited price back to original
  const handleResetItemPrice = (item: CatalogItem) => {
    setEditedPrices((prev) => ({
      ...prev,
      [item.id]: (item.price ?? 0).toString(),
    }));
    if (item.variations) {
      setEditedVariations((prev) => ({
        ...prev,
        [item.id]: JSON.parse(JSON.stringify(item.variations)),
      }));
    }
  };

  // Filter and dynamic sort: SELECTED ITEMS FLOAT TO TOP!
  const displayItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // 1. Filter items by search query and category
    const filtered = items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.variations && item.variations.some((v) => v.name.toLowerCase().includes(q)));

      const matchesCat =
        selectedCategoryFilter === 'all' || item.category_id === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });

    // 2. Sort: Selected items float to TOP, followed by unselected items
    return [...filtered].sort((a, b) => {
      const aSelected = selectedItemIds.has(a.id);
      const bSelected = selectedItemIds.has(b.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return 0;
    });
  }, [items, searchQuery, selectedCategoryFilter, selectedItemIds]);

  // Compute changed items list
  const changesSummary = useMemo(() => {
    const changedList: {
      item: CatalogItem;
      oldPrice: number;
      newPrice: number;
      difference: number;
      oldVariations?: ItemVariation[] | null;
      newVariations?: ItemVariation[] | null;
    }[] = [];

    selectedItemIds.forEach((id) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const oldPrice = typeof item.price === 'number' ? item.price : 0;
      const priceStr = editedPrices[id] !== undefined ? editedPrices[id] : oldPrice.toString();
      let newPrice = parseFloat(priceStr);

      if (isNaN(newPrice) || newPrice < 0) {
        newPrice = oldPrice;
      }
      newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;

      const currentVars = item.variations || [];
      const updatedVars = editedVariations[id] || currentVars;

      const basePriceChanged = Math.abs(newPrice - oldPrice) > 0.001;
      let varsChanged = false;

      if (currentVars.length > 0 && updatedVars.length === currentVars.length) {
        for (let i = 0; i < currentVars.length; i++) {
          if (Math.abs((updatedVars[i]?.price ?? 0) - (currentVars[i]?.price ?? 0)) > 0.001) {
            varsChanged = true;
            break;
          }
        }
      }

      if (basePriceChanged || varsChanged) {
        changedList.push({
          item,
          oldPrice,
          newPrice,
          difference: Math.round((newPrice - oldPrice + Number.EPSILON) * 100) / 100,
          oldVariations: item.variations,
          newVariations: currentVars.length > 0 ? updatedVars : null,
        });
      }
    });

    return changedList;
  }, [items, selectedItemIds, editedPrices, editedVariations]);

  // Handle Save Price Updates to Database
  const handleSavePriceUpdates = async () => {
    if (selectedItemIds.size === 0) return;

    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const undoList: UndoPriceItem[] = [];
      let updatedCount = 0;

      const updatePayloads: {
        item: CatalogItem;
        oldPrice: number;
        newPrice: number;
        newVariations: ItemVariation[] | null;
        oldVariations: ItemVariation[] | null;
      }[] = [];

      selectedItemIds.forEach((id) => {
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const oldPrice = typeof item.price === 'number' ? item.price : 0;
        const priceStr = editedPrices[id] !== undefined ? editedPrices[id] : oldPrice.toString();
        let newPrice = parseFloat(priceStr);

        if (isNaN(newPrice) || newPrice < 0) {
          newPrice = oldPrice;
        }
        newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;

        const newVars = editedVariations[id] || (item.variations ? [...item.variations] : null);

        updatePayloads.push({
          item,
          oldPrice,
          newPrice,
          newVariations: newVars,
          oldVariations: item.variations || null,
        });
      });

      // Update in batches of 25 for safe performance
      const BATCH_SIZE = 25;
      for (let i = 0; i < updatePayloads.length; i += BATCH_SIZE) {
        const batch = updatePayloads.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async ({ item, oldPrice, newPrice, newVariations, oldVariations }) => {
            const updateObj: Record<string, any> = {
              price: newPrice,
              updated_at: new Date().toISOString(),
            };

            if (newVariations) {
              updateObj.variations = newVariations;
            }

            const { error } = await supabase
              .from('catalog_items')
              .update(updateObj)
              .eq('id', item.id)
              .eq('business_id', business.id);

            if (error) throw error;

            updatedCount++;
            undoList.push({
              id: item.id,
              name: item.name,
              oldPrice,
              newPrice,
              oldVariations,
              newVariations,
            });
          })
        );
      }

      onUpdateSuccess(updatedCount, undoList);
      handleResetAndClose();
    } catch (err: any) {
      console.error('Bulk price update error:', err);
      setErrorMessage(err.message || 'Price update failed. Please check your network connection and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAndClose = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedItemIds(new Set());
    setEditedPrices({});
    setEditedVariations({});
    setExpandedVariations(new Set());
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
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Header Subtitle & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Direct Price Editor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select items below to enter their new prices directly. Selected items automatically float to the top.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-800 border border-teal-500/20">
              {selectedItemIds.size} Selected
            </span>
            {changesSummary.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {changesSummary.length} Modified
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Error updating prices:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Search dishes or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-300"
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
                  {cat.name} ({items.filter((i) => i.category_id === cat.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Selection Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleSelectAllFiltered(displayItems)}
              className="text-xs h-7.5 px-2.5 bg-white font-semibold"
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1 text-teal-600" />
              Select All Filtered ({displayItems.length})
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

          {/* Quick Add by Category */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="hidden sm:inline font-medium text-[11px]">Select Category:</span>
            <select
              onChange={(e) => {
                handleSelectByCategory(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-md font-medium text-slate-700"
            >
              <option value="" disabled>
                + Choose Category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({items.filter((i) => i.category_id === cat.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIRECT SPREADSHEET PRICE TABLE                                            */}
        {/* ========================================================================= */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-900 text-[11px] font-bold text-slate-200 uppercase tracking-wider sticky top-0 z-10">
            <div className="col-span-6 sm:col-span-5 flex items-center gap-2">
              <span>Item &amp; Category</span>
            </div>
            <div className="col-span-3 sm:col-span-3 text-right">
              <span>Current Price</span>
            </div>
            <div className="col-span-3 sm:col-span-4 text-right">
              <span>New Item Price ({currencySymbol})</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {displayItems.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 space-y-1">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No items match your filter</p>
                <p className="text-[11px]">Try clearing search or choosing another category.</p>
              </div>
            ) : (
              displayItems.map((item) => {
                const isSelected = selectedItemIds.has(item.id);
                const oldPrice = typeof item.price === 'number' ? item.price : 0;
                const priceInputValue = editedPrices[item.id] !== undefined ? editedPrices[item.id] : oldPrice.toString();
                const numericNewPrice = parseFloat(priceInputValue);
                const isValidNewPrice = !isNaN(numericNewPrice) && numericNewPrice >= 0;
                const difference = isValidNewPrice ? Math.round((numericNewPrice - oldPrice + Number.EPSILON) * 100) / 100 : 0;
                const isIncreased = difference > 0;
                const isDecreased = difference < 0;

                const catName = item.category_id
                  ? categoryMap.get(item.category_id) || 'Uncategorized'
                  : 'Uncategorized';

                const hasVars = item.variations && item.variations.length > 0;
                const itemVars = editedVariations[item.id] || item.variations || [];
                const isExpanded = expandedVariations.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-teal-50/40 hover:bg-teal-50/70 border-l-4 border-teal-500'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Main Item Row */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs items-center">
                      {/* Item Info & Checkbox */}
                      <div className="col-span-6 sm:col-span-5 flex items-start gap-2.5 min-w-0 pr-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item)}
                          className="w-4 h-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer shrink-0"
                          title="Select item for price update"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              onClick={() => toggleItemSelection(item)}
                              className={`font-bold truncate cursor-pointer select-none ${
                                isSelected ? 'text-slate-950 font-extrabold' : 'text-slate-800'
                              }`}
                            >
                              {item.name}
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500 text-slate-950">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 truncate">{catName}</span>
                            {hasVars && (
                              <button
                                type="button"
                                onClick={() => toggleExpandVariations(item.id)}
                                className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 font-bold hover:underline cursor-pointer"
                              >
                                <span>{itemVars.length} variations</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Current Price */}
                      <div className="col-span-3 sm:col-span-3 text-right font-mono font-semibold text-slate-600">
                        {formatCurrency(oldPrice, currencySymbol)}
                      </div>

                      {/* New Item Price Input Column */}
                      <div className="col-span-3 sm:col-span-4 flex flex-col items-end gap-1">
                        {isSelected ? (
                          <div className="w-full max-w-[170px] space-y-1">
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                step="any"
                                value={priceInputValue}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                placeholder="0.00"
                                className={`text-right font-mono font-bold text-xs h-8.5 pr-2 bg-white transition-all ${
                                  difference !== 0
                                    ? 'border-teal-500 ring-2 ring-teal-500/20 text-slate-950 bg-teal-50/30'
                                    : 'border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>

                            {/* Difference indicator */}
                            <div className="flex items-center justify-end gap-1 text-[10px] font-bold font-mono">
                              {difference !== 0 ? (
                                <span
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md ${
                                    isIncreased
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isIncreased ? (
                                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <ArrowDownRight className="w-3 h-3 text-rose-600" />
                                  )}
                                  {isIncreased ? '+' : ''}
                                  {formatCurrency(difference, currencySymbol)}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">No change</span>
                              )}

                              {difference !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleResetItemPrice(item)}
                                  title="Reset to original price"
                                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleItemSelection(item)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            + Click to Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Nested Variations Rows (If Expanded) */}
                    {isSelected && hasVars && isExpanded && (
                      <div className="bg-slate-50/90 px-6 py-2.5 border-t border-slate-200/80 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-teal-600" />
                          <span>Portion / Size Variations for {item.name}:</span>
                        </div>

                        <div className="space-y-1.5 divide-y divide-slate-200/50">
                          {itemVars.map((v, vIdx) => {
                            const origVarPrice = item.variations?.[vIdx]?.price ?? 0;
                            const varDiff = Math.round(((v.price ?? 0) - origVarPrice + Number.EPSILON) * 100) / 100;
                            const isVarInc = varDiff > 0;
                            const isVarDec = varDiff < 0;

                            return (
                              <div
                                key={vIdx}
                                className="grid grid-cols-12 gap-2 pt-1.5 text-xs items-center"
                              >
                                <div className="col-span-5 text-slate-700 font-medium pl-2 truncate">
                                  ↳ {v.name}
                                </div>
                                <div className="col-span-3 text-right font-mono text-[11px] text-slate-500">
                                  {formatCurrency(origVarPrice, currencySymbol)}
                                </div>
                                <div className="col-span-4 flex items-center justify-end gap-1.5">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={v.price ?? 0}
                                    onChange={(e) =>
                                      handleVariationPriceChange(item.id, vIdx, e.target.value)
                                    }
                                    className="w-24 text-right font-mono font-bold text-xs h-7.5 bg-white border-slate-300"
                                  />
                                  {varDiff !== 0 && (
                                    <span
                                      className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded ${
                                        isVarInc
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {isVarInc ? '+' : ''}
                                      {formatCurrency(varDiff, currencySymbol)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER ACTION BAR                                                  */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-200 gap-3">
          <div className="text-xs text-slate-600 font-medium">
            {changesSummary.length > 0 ? (
              <span>
                Ready to save{' '}
                <strong className="text-emerald-700 font-black">
                  {changesSummary.length} price update{changesSummary.length === 1 ? '' : 's'}
                </strong>
                .
              </span>
            ) : selectedItemIds.size > 0 ? (
              <span>
                {selectedItemIds.size} item{selectedItemIds.size === 1 ? '' : 's'} selected. Type new prices above to apply changes.
              </span>
            ) : (
              <span>Select items from the list to update prices.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetAndClose}
              disabled={isUpdating}
              size="sm"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSavePriceUpdates}
              disabled={isUpdating || selectedItemIds.size === 0}
              className="gap-2 font-bold bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-md text-xs px-4"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    Save Price Updates ({changesSummary.length > 0 ? changesSummary.length : selectedItemIds.size})
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
