'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Upload, Download, FileText, FileSpreadsheet, CheckCircle2, AlertCircle, AlertTriangle, X, RefreshCw, Plus, Crown, Zap, ShieldCheck
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Business, CatalogItem, Category, SUBSCRIPTION_PLANS_META, ItemVariation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  categories: Category[];
  existingItems: CatalogItem[];
  onImportSuccess: () => void;
  onOpenUpgradeModal?: () => void;
}

export interface ParsedImportRow {
  rowIndex: number;
  name: string;
  categoryName: string;
  categoryId: string | null;
  price: number;
  description: string | null;
  author: string | null;
  isbn: string | null;
  duration: number | null;
  badges: string[];
  variations: ItemVariation[];
  quantity: number | null;
  is_available: boolean;
  is_featured: boolean;
  image_url: string | null;
  
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  isNewCategory: boolean;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  business,
  categories,
  existingItems,
  onImportSuccess,
  onOpenUpgradeModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    skippedCount: number;
    failedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscription Limits & Expiration Check
  const isSuperAdmin = business.name.toLowerCase().includes('master super admin');
  const isExpired = !isSuperAdmin && (business.subscription_status !== 'active' || 
    (business.subscription_end_date ? new Date(business.subscription_end_date) < new Date() : false));
  
  const currentPlanKey = business.subscription_plan || 'free';
  const currentPlanMeta = SUBSCRIPTION_PLANS_META[currentPlanKey];
  
  const rawMaxItems = business.max_items;
  const isUnlimitedItems = isSuperAdmin || (!isExpired && (rawMaxItems === null || rawMaxItems === undefined || currentPlanKey === 'enterprise'));
  const maxAllowedItems = isUnlimitedItems ? Infinity : (isExpired ? 10 : (rawMaxItems ?? 10));
  const remainingItemQuota = isUnlimitedItems ? Infinity : Math.max(0, maxAllowedItems - existingItems.length);

  const rawMaxCategories = business.max_categories;
  const isUnlimitedCategories = isSuperAdmin || (!isExpired && (rawMaxCategories === null || rawMaxCategories === undefined || currentPlanKey === 'enterprise'));
  const maxAllowedCategories = isUnlimitedCategories ? Infinity : (isExpired ? 5 : (rawMaxCategories ?? 5));
  const remainingCategoryQuota = isUnlimitedCategories ? Infinity : Math.max(0, maxAllowedCategories - categories.length);

  // --------------------------------------------------------------------------
  // 1. TEMPLATE GENERATION (CSV & EXCEL)
  // --------------------------------------------------------------------------
  const getSampleRows = () => {
    const bType = business.business_type;

    if (bType === 'bookshop') {
      return [
        {
          name: 'The Great Gatsby',
          category: 'Fiction',
          price: '1500.00',
          description: 'Classic novel set in the Roaring Twenties',
          author: 'F. Scott Fitzgerald',
          isbn: '9780743273565',
          duration: '',
          badges: 'Bestseller',
          variations: 'Paperback: 1500 | Hardcover: 2800',
          quantity: '50',
          is_available: 'TRUE',
          is_featured: 'TRUE',
          image_url: '',
        },
        {
          name: 'Atomic Habits',
          category: 'Self-Help',
          price: '2200.00',
          description: 'An easy and proven way to build good habits',
          author: 'James Clear',
          isbn: '9780735211292',
          duration: '',
          badges: 'Popular',
          variations: '1st Edition: 2200 | Collector Edition: 4500',
          quantity: '30',
          is_available: 'TRUE',
          is_featured: 'FALSE',
          image_url: '',
        },
      ];
    } else if (bType === 'salon') {
      return [
        {
          name: 'Haircut & Styling',
          category: 'Hair Care',
          price: '3500.00',
          description: 'Includes wash, blow dry and custom hair styling',
          author: '',
          isbn: '',
          duration: '45',
          badges: 'Popular',
          variations: 'Basic: 3500 | VIP Treatment: 5500',
          quantity: '',
          is_available: 'TRUE',
          is_featured: 'TRUE',
          image_url: '',
        },
        {
          name: 'Deep Hydration Facial',
          category: 'Skincare',
          price: '5000.00',
          description: 'Deep cleansing and skin hydration treatment',
          author: '',
          isbn: '',
          duration: '60',
          badges: 'Premium',
          variations: '',
          quantity: '',
          is_available: 'TRUE',
          is_featured: 'FALSE',
          image_url: '',
        },
      ];
    } else if (bType === 'restaurant') {
      return [
        {
          name: 'Special Mix Fried Rice',
          category: 'Mains',
          price: '1800.00',
          description: 'Wok-tossed basmati rice with prawns, chicken, and egg',
          author: '',
          isbn: '',
          duration: '',
          badges: 'Popular',
          variations: 'Small: 1000 | Large: 1500 | Extreme Large: 2500',
          quantity: '',
          is_available: 'TRUE',
          is_featured: 'TRUE',
          image_url: '',
        },
        {
          name: 'Classic Margherita Pizza',
          category: 'Pizzas',
          price: '1850.00',
          description: 'San Marzano tomatoes, fresh buffalo mozzarella and basil',
          author: '',
          isbn: '',
          duration: '',
          badges: 'Vegetarian',
          variations: 'Medium 10 inch: 1850 | Large 14 inch: 2800',
          quantity: '',
          is_available: 'TRUE',
          is_featured: 'FALSE',
          image_url: '',
        },
      ];
    } else {
      return [
        {
          name: 'Wireless Bluetooth Headphones',
          category: 'Electronics',
          price: '12500.00',
          description: 'Over-ear noise canceling wireless headphones',
          author: '',
          isbn: '',
          duration: '',
          badges: 'Top Rated',
          variations: 'Standard: 12500 | Pro Wireless: 18500',
          quantity: '15',
          is_available: 'TRUE',
          is_featured: 'TRUE',
          image_url: '',
        },
        {
          name: 'Organic Cotton T-Shirt',
          category: 'Apparel',
          price: '2500.00',
          description: '100% organic cotton crewneck tshirt',
          author: '',
          isbn: '',
          duration: '',
          badges: '',
          variations: 'Small: 2500 | Medium: 2500 | Large: 2700 | XL: 2900',
          quantity: '100',
          is_available: 'TRUE',
          is_featured: 'FALSE',
          image_url: '',
        },
      ];
    }
  };

  const sanitizeFormula = (val: any): any => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (['=', '+', '-', '@'].some((char) => trimmed.startsWith(char))) {
        return `'${val}`;
      }
    }
    return val;
  };

  const sanitizeRowObj = (obj: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      sanitized[key] = sanitizeFormula(obj[key]);
    });
    return sanitized;
  };

  const handleDownloadCSVTemplate = () => {
    const sampleData = getSampleRows().map(sanitizeRowObj);
    const csvContent = Papa.unparse(sampleData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${business.slug}_catalog_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcelTemplate = () => {
    const sampleData = getSampleRows().map(sanitizeRowObj);
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog Items');
    XLSX.writeFile(workbook, `${business.slug}_catalog_import_template.xlsx`);
  };

  // --------------------------------------------------------------------------
  // 2. FILE SELECTION & PARSING
  // --------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setImportSummary(null);
    setParsing(true);

    const filename = file.name.toLowerCase();
    const isCsv = filename.endsWith('.csv');
    const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls');

    if (!isCsv && !isExcel) {
      setParseError('Unsupported file format. Please upload a .csv or .xlsx Excel file.');
      setParsing(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setParseError('File size exceeds 5MB limit. Please upload a smaller file.');
      setParsing(false);
      return;
    }

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateAndSetRows(results.data as Record<string, any>[]);
          setParsing(false);
        },
        error: (err) => {
          setParseError(`CSV parsing error: ${err.message}`);
          setParsing(false);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          validateAndSetRows(jsonRows);
        } catch (err: any) {
          setParseError(`Excel reading error: ${err.message || 'Corrupted file'}`);
        } finally {
          setParsing(false);
        }
      };
      reader.onerror = () => {
        setParseError('Failed to read Excel file.');
        setParsing(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // --------------------------------------------------------------------------
  // 3. ROW VALIDATION & DUPLICATE CHECKING
  // --------------------------------------------------------------------------
  const validateAndSetRows = (rawRows: Record<string, any>[]) => {
    if (!rawRows || rawRows.length === 0) {
      setParseError('Uploaded file contains no rows or data.');
      setParsedRows([]);
      return;
    }

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => {
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
    });

    const existingNamesSet = new Set<string>();
    existingItems.forEach((item) => {
      existingNamesSet.add(item.name.toLowerCase().trim());
    });

    const fileNamesSeen = new Set<string>();
    const validated: ParsedImportRow[] = [];

    rawRows.forEach((row, idx) => {
      const rowIndex = idx + 1;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Flexible column getter (handles case differences)
      const getVal = (key: string) => {
        const matchingKey = Object.keys(row).find((k) => k.toLowerCase().trim() === key.toLowerCase().trim());
        return matchingKey ? String(row[matchingKey]).trim() : '';
      };

      const rawName = getVal('name') || getVal('title') || getVal('product') || getVal('item');
      const rawCategory = getVal('category') || getVal('category_name') || getVal('group');
      const rawPrice = getVal('price') || getVal('cost') || getVal('amount');
      const rawDescription = getVal('description') || getVal('desc') || getVal('details');
      const rawAuthor = getVal('author') || getVal('writer');
      const rawIsbn = getVal('isbn') || getVal('barcode');
      const rawDuration = getVal('duration') || getVal('time') || getVal('minutes');
      const rawBadges = getVal('badges') || getVal('tags') || getVal('badge');
      const rawVariationsStr = getVal('variations') || getVal('options') || getVal('sizes') || getVal('variation');
      const rawQuantity = getVal('quantity') || getVal('qty') || getVal('stock');
      const rawIsAvailable = getVal('is_available') || getVal('available') || getVal('in_stock');
      const rawIsFeatured = getVal('is_featured') || getVal('featured') || getVal('highlight');
      const rawImageUrl = getVal('image_url') || getVal('image') || getVal('photo');

      // 1. Name Check
      if (!rawName) {
        errors.push('Missing item name');
      }

      // 2. Variations Parsing
      const parsedVariations: ItemVariation[] = [];
      if (rawVariationsStr) {
        const segments = rawVariationsStr.split('|');
        segments.forEach((seg) => {
          const parts = seg.split(':');
          if (parts.length >= 2) {
            const vName = parts[0].trim();
            const cleanedVPrice = parts[1].replace(/[^0-9.]/g, '').trim();
            const vPrice = parseFloat(cleanedVPrice);
            if (vName && !isNaN(vPrice) && vPrice >= 0) {
              parsedVariations.push({ name: vName, price: vPrice, is_available: true });
            }
          }
        });
      }

      // 3. Price Check (Fallback to lowest variation price if base price is empty)
      let numericPrice = 0;
      if (!rawPrice && parsedVariations.length > 0) {
        numericPrice = Math.min(...parsedVariations.map((v) => v.price));
      } else if (!rawPrice) {
        errors.push('Missing item price');
      } else {
        const cleanedPrice = rawPrice.replace(/[^0-9.]/g, '');
        numericPrice = parseFloat(cleanedPrice);
        if (isNaN(numericPrice) || numericPrice < 0) {
          if (parsedVariations.length > 0) {
            numericPrice = Math.min(...parsedVariations.map((v) => v.price));
          } else {
            errors.push(`Invalid price format: "${rawPrice}"`);
          }
        }
      }

      // 4. Category Check
      let categoryId: string | null = null;
      let isNewCategory = false;
      if (rawCategory) {
        const lowerCat = rawCategory.toLowerCase().trim();
        if (categoryMap.has(lowerCat)) {
          categoryId = categoryMap.get(lowerCat)!;
        } else {
          isNewCategory = true;
          warnings.push(`New category detected: "${rawCategory}"`);
        }
      }

      // 5. Duplicate Check
      let isDuplicate = false;
      if (rawName) {
        const lowerName = rawName.toLowerCase().trim();
        if (fileNamesSeen.has(lowerName)) {
          isDuplicate = true;
          warnings.push('Duplicate item name within uploaded file');
        } else if (existingNamesSet.has(lowerName)) {
          isDuplicate = true;
          warnings.push('Item already exists in catalog database');
        }
        fileNamesSeen.add(lowerName);
      }

      // 6. Booleans & Integers
      const is_available = rawIsAvailable === '' ? true : !['false', '0', 'no', 'n'].includes(rawIsAvailable.toLowerCase());
      const is_featured = ['true', '1', 'yes', 'y'].includes(rawIsFeatured.toLowerCase());
      const parsedQuantity = rawQuantity ? parseInt(rawQuantity, 10) : null;
      const parsedDuration = rawDuration ? parseInt(rawDuration, 10) : null;
      const parsedBadges = rawBadges ? rawBadges.split(',').map((b) => b.trim()).filter(Boolean) : [];

      let status: 'valid' | 'warning' | 'error' = 'valid';
      if (errors.length > 0) {
        status = 'error';
      } else if (warnings.length > 0) {
        status = 'warning';
      }

      validated.push({
        rowIndex,
        name: rawName,
        categoryName: rawCategory,
        categoryId,
        price: numericPrice,
        description: rawDescription || null,
        author: rawAuthor || null,
        isbn: rawIsbn || null,
        duration: isNaN(parsedDuration as number) ? null : parsedDuration,
        badges: parsedBadges,
        variations: parsedVariations,
        quantity: isNaN(parsedQuantity as number) ? null : parsedQuantity,
        is_available,
        is_featured,
        image_url: rawImageUrl || null,
        status,
        errors,
        warnings,
        isDuplicate,
        isNewCategory,
      });
    });

    setParsedRows(validated);
  };

  // Filter rows by valid/errors/warnings
  const validRows = parsedRows.filter((r) => r.status !== 'error');
  const errorRows = parsedRows.filter((r) => r.status === 'error');
  const newCategoryNames = Array.from(new Set(parsedRows.filter((r) => r.isNewCategory && r.categoryName).map((r) => r.categoryName.trim())));

  // --------------------------------------------------------------------------
  // 4. IMPORT EXECUTION WITH SUBSCRIPTION LIMIT ENFORCEMENT
  // --------------------------------------------------------------------------
  const handlePerformImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setImportProgress('Initializing bulk import...');

    const supabase = createClient();

    try {
      // 1. Create missing categories if within quota
      const createdCategoryMap = new Map<string, string>();
      categories.forEach((c) => createdCategoryMap.set(c.name.toLowerCase().trim(), c.id));

      if (newCategoryNames.length > 0) {
        if (!isUnlimitedCategories && newCategoryNames.length > remainingCategoryQuota) {
          throw new Error(`Cannot create ${newCategoryNames.length} new categories. Remaining category quota is ${remainingCategoryQuota}.`);
        }

        setImportProgress(`Creating ${newCategoryNames.length} missing categories...`);
        for (let i = 0; i < newCategoryNames.length; i++) {
          const catName = newCategoryNames[i];
          const { data: newCat, error: catErr } = await supabase
            .from('categories')
            .insert({
              business_id: business.id,
              name: catName,
              display_order: categories.length + i + 1,
            })
            .select()
            .single();

          if (catErr) throw catErr;
          if (newCat) {
            createdCategoryMap.set(catName.toLowerCase().trim(), newCat.id);
          }
        }
      }

      // 2. Determine how many valid items can be imported under quota
      const allowedImportRows = isUnlimitedItems
        ? validRows
        : validRows.slice(0, remainingItemQuota);

      if (allowedImportRows.length === 0) {
        throw new Error(`Item limit reached on your plan (${itemsCountText}). Please upgrade to import more.`);
      }

      // 3. Prepare Payloads in batches of 50
      const batchSize = 50;
      let totalInserted = 0;

      for (let i = 0; i < allowedImportRows.length; i += batchSize) {
        const batch = allowedImportRows.slice(i, i + batchSize);
        setImportProgress(`Importing items ${i + 1} to ${Math.min(i + batchSize, allowedImportRows.length)} of ${allowedImportRows.length}...`);

        const insertPayloads = batch.map((r, bIdx) => ({
          business_id: business.id, // Strictly derived from authenticated business state (RLS tenant safety)
          category_id: r.categoryId || (r.categoryName ? createdCategoryMap.get(r.categoryName.toLowerCase().trim()) || null : null),
          name: r.name,
          price: r.price,
          description: r.description,
          author: r.author,
          isbn: r.isbn,
          duration: r.duration,
          badges: r.badges,
          variations: r.variations.length > 0 ? r.variations : [],
          quantity: r.quantity,
          is_available: r.is_available,
          is_featured: r.is_featured,
          image_url: r.image_url,
          display_order: existingItems.length + i + bIdx + 1,
        }));

        const { error: insertErr } = await supabase
          .from('catalog_items')
          .insert(insertPayloads);

        if (insertErr) throw insertErr;
        totalInserted += batch.length;
      }

      setImportSummary({
        successCount: totalInserted,
        skippedCount: validRows.length - allowedImportRows.length,
        failedCount: errorRows.length,
      });

      onImportSuccess();
    } catch (err: any) {
      setParseError(err.message || 'Error during bulk import execution.');
    } finally {
      setImporting(false);
      setImportProgress('');
    }
  };

  // --------------------------------------------------------------------------
  // 5. DOWNLOAD ERROR REPORT (CSV)
  // --------------------------------------------------------------------------
  const handleDownloadErrorReport = () => {
    if (parsedRows.length === 0) return;

    const reportData = parsedRows.map((r) => sanitizeRowObj({
      Row: r.rowIndex,
      Name: r.name || '(Empty)',
      Category: r.categoryName || 'Uncategorized',
      Price: r.price,
      Status: r.status.toUpperCase(),
      Errors: r.errors.join('; '),
      Warnings: r.warnings.join('; '),
    }));

    const csvContent = Papa.unparse(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${business.slug}_import_error_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetModal = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setParseError(null);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const itemsCountText = isUnlimitedItems ? 'Unlimited' : `${existingItems.length} / ${maxAllowedItems}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Catalog Import"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {parsedRows.length > 0 && !importSummary && (
              <Button type="button" variant="ghost" onClick={handleResetModal} size="sm" className="text-slate-600 text-xs">
                Reset File
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={importing}>
              {importSummary ? 'Close' : 'Cancel'}
            </Button>
            {parsedRows.length > 0 && !importSummary && (
              <Button
                type="button"
                onClick={handlePerformImport}
                isLoading={importing}
                disabled={validRows.length === 0 || remainingItemQuota <= 0}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
              >
                Import {Math.min(validRows.length, remainingItemQuota)} Valid Items
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step 1: Instructions & Download Template */}
        {!selectedFile && (
          <div className="space-y-6">
            {/* Step Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Quick Bulk Catalog Setup
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Plan Quota: {itemsCountText}</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                Add multiple catalog items at once using CSV or Excel
              </h3>
              <p className="text-xs text-slate-300">
                Follow 3 simple steps below to import products, prices, and categories without entering items one by one.
              </p>
            </div>

            {/* 3 Step Instruction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">1</div>
                <div className="font-bold text-slate-900">Download Template</div>
                <p className="text-slate-500 text-[11px]">
                  Get our ready-to-use template with formatted headers matching your <strong>{business.business_type}</strong> catalog.
                </p>
                <div className="pt-2 space-y-1.5">
                  <Button
                    onClick={handleDownloadCSVTemplate}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-bold gap-1.5 border-teal-500/40 text-teal-700 bg-teal-50 hover:bg-teal-100"
                  >
                    <FileText className="w-3.5 h-3.5" /> Download CSV Template
                  </Button>
                  <Button
                    onClick={handleDownloadExcelTemplate}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-bold gap-1.5 border-indigo-500/40 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Download Excel Template
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">2</div>
                <div className="font-bold text-slate-900">Fill In Products</div>
                <p className="text-slate-500 text-[11px]">
                  Open the template in Excel or Google Sheets. Add item names, prices, descriptions, and categories.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">3</div>
                <div className="font-bold text-slate-900">Upload & Preview</div>
                <p className="text-slate-500 text-[11px]">
                  Select your completed CSV or XLSX file below to preview items and validate row errors before importing.
                </p>
              </div>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto border border-teal-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Click to upload your CSV or Excel file</div>
                <div className="text-xs text-slate-500 mt-0.5">Supports .CSV, .XLSX, and .XLS files up to 5MB</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Parsing Indicator */}
        {parsing && (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600 font-bold">Reading & validating file rows...</p>
          </div>
        )}

        {/* Parse Error Alert */}
        {parseError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Import File Error</span>
            </div>
            <p>{parseError}</p>
            <Button onClick={handleResetModal} size="sm" variant="outline" className="text-xs border-rose-300 text-rose-700 hover:bg-rose-100">
              Try Another File
            </Button>
          </div>
        )}

        {/* Step 2: Preview & Validation Table */}
        {parsedRows.length > 0 && !importSummary && !parsing && (
          <div className="space-y-4">
            {/* File Details & Summary Badges */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm border border-slate-800">
              <div>
                <div className="text-[11px] font-mono text-teal-400 font-bold uppercase">Uploaded File</div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2 mt-0.5">
                  <FileText className="w-4 h-4 text-teal-400" /> {selectedFile?.name}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  Total: {parsedRows.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Valid: {validRows.length}
                </span>
                {errorRows.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    Errors: {errorRows.length}
                  </span>
                )}
              </div>
            </div>

            {/* Quota Exceeded Warning Banner */}
            {!isUnlimitedItems && validRows.length > remainingItemQuota && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Item Subscription Limit Warning</span>
                  </div>
                  {onOpenUpgradeModal && (
                    <Button onClick={onOpenUpgradeModal} size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1 border-none">
                      <Zap className="w-3.5 h-3.5" /> Upgrade Plan
                    </Button>
                  )}
                </div>
                <p>
                  You have <strong>{remainingItemQuota} remaining item slots</strong> on your {currentPlanMeta.name} plan ({existingItems.length}/{maxAllowedItems} used).
                  Only the first <strong>{remainingItemQuota} valid items</strong> will be imported.
                </p>
              </div>
            )}

            {/* Progress Message */}
            {importing && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-teal-600" />
                <span>{importProgress}</span>
              </div>
            )}

            {/* Row Preview List / Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="max-h-[320px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">Row</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Details / Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r) => (
                      <tr key={r.rowIndex} className={r.status === 'error' ? 'bg-rose-50/60' : r.status === 'warning' ? 'bg-amber-50/40' : 'bg-white'}>
                        <td className="p-3 font-mono text-center font-bold text-slate-500">{r.rowIndex}</td>
                        <td className="p-3 font-bold text-slate-900 max-w-[150px] truncate" title={r.name}>{r.name || '(Empty)'}</td>
                        <td className="p-3 font-medium text-slate-700">
                          {r.categoryName ? (
                            <span className={r.isNewCategory ? 'text-amber-800 font-bold' : ''}>
                              {r.categoryName} {r.isNewCategory && '(New)'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Uncategorized</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">{formatCurrency(r.price, business.currency)}</td>
                        <td className="p-3 whitespace-nowrap">
                          {r.status === 'valid' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                            </span>
                          )}
                          {r.status === 'warning' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
                            </span>
                          )}
                          {r.status === 'error' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <X className="w-3 h-3 text-rose-600" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[11px]">
                          {r.errors.length > 0 && (
                            <div className="text-rose-600 font-medium">{r.errors.join('; ')}</div>
                          )}
                          {r.warnings.length > 0 && (
                            <div className="text-amber-700 font-medium">{r.warnings.join('; ')}</div>
                          )}
                          {r.status === 'valid' && (
                            <span className="text-slate-400">Ready to import</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Error Report Download button if errors exist */}
            {errorRows.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-600 font-bold">
                  {errorRows.length} row(s) contain validation errors and will be skipped.
                </span>
                <Button onClick={handleDownloadErrorReport} size="sm" variant="outline" className="text-xs gap-1 border-rose-300 text-rose-700">
                  <Download className="w-3.5 h-3.5" /> Download Error Report
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success Summary Card */}
        {importSummary && (
          <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-4 shadow-xl border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Catalog Import Completed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your business catalog items have been updated in your production database.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs pt-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Imported</div>
                <div className="text-xl font-black text-white">{importSummary.successCount}</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-amber-400">Skipped</div>
                <div className="text-xl font-black text-white">{importSummary.skippedCount}</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-rose-400">Failed</div>
                <div className="text-xl font-black text-white">{importSummary.failedCount}</div>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={onClose} className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs">
                Return to Catalog Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
