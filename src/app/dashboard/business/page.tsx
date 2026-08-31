'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Store, Save, CheckCircle2, AlertCircle, Utensils, BookOpen, Scissors, Link as LinkIcon, RefreshCw, Lock, MessageSquare, Image as ImageIcon, Upload, Trash2, Crop } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Business, BusinessType, BUSINESS_TYPES_META } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { ImageCropperModal } from '@/components/catalog/ImageCropperModal';
import { validateImageFile, uploadBusinessLogo, uploadBusinessBanner, deleteBusinessLogo, deleteBusinessBanner, getOriginalImageUrl } from '@/lib/storage';

export default function DashboardBusinessSettingsPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [themeColor, setThemeColor] = useState('#0F172A');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Logo Cropper State (1:1 Aspect Ratio)
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [croppedLogoBlob, setCroppedLogoBlob] = useState<Blob | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Banner Cropper State (3:1 Aspect Ratio)
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [croppedBannerBlob, setCroppedBannerBlob] = useState<Blob | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Shared Cropper Modal State
  const [activeCropperMode, setActiveCropperMode] = useState<'logo' | 'banner' | null>(null);
  const [cropperSourceUrl, setCropperSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
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
      populateForm(biz as Business);
    }
    setLoading(false);
  }

  function populateForm(b: Business) {
    setName(b.name);
    setSlug(b.slug);
    setBusinessType(b.business_type);
    setDescription(b.description || '');
    setPhone(b.phone || '');
    setEmail(b.email || '');
    setAddress(b.address || '');
    setWebsite(b.website || '');
    setCurrency(b.currency || 'LKR');
    setThemeColor(b.theme_color || '#0F172A');
    setLogoUrl(b.logo_url || '');
    setLogoPreviewUrl(b.logo_url || null);
    setBannerUrl(b.banner_url || '');
    setBannerPreviewUrl(b.banner_url || null);
  }

  // Handle Logo Selection
  const handleLogoFileSelect = (file: File | null) => {
    if (!file) return;
    const val = validateImageFile(file);
    if (!val.valid) {
      setLogoError(val.error || 'Invalid logo image.');
      return;
    }
    setLogoError(null);
    setSelectedLogoFile(file);
    setCroppedLogoBlob(null);
    setCropperSourceUrl(URL.createObjectURL(file));
    setActiveCropperMode('logo');
  };

  // Handle Banner Selection
  const handleBannerFileSelect = (file: File | null) => {
    if (!file) return;
    const val = validateImageFile(file);
    if (!val.valid) {
      setBannerError(val.error || 'Invalid header banner image.');
      return;
    }
    setBannerError(null);
    setSelectedBannerFile(file);
    setCroppedBannerBlob(null);
    setCropperSourceUrl(URL.createObjectURL(file));
    setActiveCropperMode('banner');
  };

  const handleReCropLogo = () => {
    if (selectedLogoFile) {
      setCropperSourceUrl(URL.createObjectURL(selectedLogoFile));
      setActiveCropperMode('logo');
      return;
    }
    if (logoUrl || logoPreviewUrl) {
      const src = getOriginalImageUrl(logoUrl || logoPreviewUrl) || (logoUrl || logoPreviewUrl || '');
      setCropperSourceUrl(src);
      setActiveCropperMode('logo');
    }
  };

  const handleReCropBanner = () => {
    if (selectedBannerFile) {
      setCropperSourceUrl(URL.createObjectURL(selectedBannerFile));
      setActiveCropperMode('banner');
      return;
    }
    if (bannerUrl || bannerPreviewUrl) {
      const src = getOriginalImageUrl(bannerUrl || bannerPreviewUrl) || (bannerUrl || bannerPreviewUrl || '');
      setCropperSourceUrl(src);
      setActiveCropperMode('banner');
    }
  };

  const handleCropConfirm = (blob: Blob, previewUrl: string) => {
    if (activeCropperMode === 'logo') {
      setCroppedLogoBlob(blob);
      setLogoPreviewUrl(previewUrl);
    } else if (activeCropperMode === 'banner') {
      setCroppedBannerBlob(blob);
      setBannerPreviewUrl(previewUrl);
    }
    setActiveCropperMode(null);
  };

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null);
    setCroppedLogoBlob(null);
    setLogoPreviewUrl(null);
    setLogoUrl('');
    setLogoError(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveBanner = () => {
    setSelectedBannerFile(null);
    setCroppedBannerBlob(null);
    setBannerPreviewUrl(null);
    setBannerUrl('');
    setBannerError(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // Handle Business Name Change
  const handleNameChange = (newName: string) => {
    setName(newName);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    let finalLogoUrl: string | null = logoUrl || null;
    let finalBannerUrl: string | null = bannerUrl || null;

    try {
      // 1. Upload Logo if newly cropped
      if (croppedLogoBlob && (selectedLogoFile || logoPreviewUrl)) {
        const logoSource = selectedLogoFile || croppedLogoBlob;
        const res = await uploadBusinessLogo(business.id, logoSource, croppedLogoBlob);
        finalLogoUrl = res.logoUrl;
      } else if (!logoPreviewUrl && logoUrl) {
        finalLogoUrl = null;
        await deleteBusinessLogo(business.id);
      }

      // 2. Upload Banner if newly cropped
      if (croppedBannerBlob && (selectedBannerFile || bannerPreviewUrl)) {
        const bannerSource = selectedBannerFile || croppedBannerBlob;
        const res = await uploadBusinessBanner(business.id, bannerSource, croppedBannerBlob);
        finalBannerUrl = res.bannerUrl;
      } else if (!bannerPreviewUrl && bannerUrl) {
        finalBannerUrl = null;
        await deleteBusinessBanner(business.id);
      }

      const updatedPayload = {
        name,
        slug: business.slug, // Preserve original locked slug
        business_type: businessType,
        description: description || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        website: website || null,
        currency,
        theme_color: themeColor,
        logo_url: finalLogoUrl,
        banner_url: finalBannerUrl,
        updated_at: new Date().toISOString(),
      };

      const supabase = createClient();
      const { error } = await supabase.from('businesses').update(updatedPayload).eq('id', business.id);
      if (error) throw error;

      setSuccessMsg('Business details successfully updated!');
      setBusiness({ ...business, ...updatedPayload });
      setLogoUrl(finalLogoUrl || '');
      setBannerUrl(finalBannerUrl || '');
      setSelectedLogoFile(null);
      setCroppedLogoBlob(null);
      setSelectedBannerFile(null);
      setCroppedBannerBlob(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const whatsappRequestUrl = `https://wa.me/94712220731?text=${encodeURIComponent(
    `Hello Admin, I want to request a URL Slug change for my business "${name || business?.name}" (Current URL slug: "${slug || business?.slug}"). Desired new slug: `
  )}`;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Business Settings</h1>
        <p className="text-xs text-slate-500">
          Configure branding, business type, contact info, currency, and public catalog URL settings.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          General & Branding Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            helperText="Public QR code URL remains stable when changing business name."
            required
          />

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Public Catalog URL Slug</span>
              <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" /> Protected (Locked)
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={slug}
                readOnly
                disabled
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono cursor-not-allowed select-none"
              />
              <Lock className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-slate-800 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">URL Slug is Locked (Printed QR Code Safeguard)</p>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Your URL slug defines your public catalog link (<strong className="font-mono text-slate-900">/c/{slug}</strong>). Changing it alters your live QR URL. To protect your printed physical QR code stickers, slug edits require an Admin Request.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href={whatsappRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request URL Slug Change (WhatsApp)
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
              <LinkIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              Live customer URL: <strong className="text-slate-800 font-mono">/c/{slug}</strong>
            </p>
          </div>
        </div>

        {/* Business Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Business Type & Catalog Profile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(BUSINESS_TYPES_META) as BusinessType[]).map((type) => {
              const meta = BUSINESS_TYPES_META[type];
              const isSelected = businessType === type;

              let TypeIcon = Store;
              if (type === 'restaurant') TypeIcon = Utensils;
              if (type === 'bookshop') TypeIcon = BookOpen;
              if (type === 'salon') TypeIcon = Scissors;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBusinessType(type)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <TypeIcon className={`w-5 h-5 mb-2 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                  <div className="text-xs font-bold">{meta.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            About / Business Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Welcome message or story displayed at the top of your mobile catalog..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950"
          />
        </div>

        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">
          Contact & Location Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number (Call/WhatsApp)"
            placeholder="+94 77 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Public Contact Email"
            placeholder="info@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Physical Address"
            placeholder="123 Main Street, Colombo 03"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            label="Website URL"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">
          Business Profile & Header Images
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo / Profile Image Upload Section (1:1) */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Business Logo / Avatar (1:1)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">JPG, PNG, WEBP</span>
            </div>

            {logoError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{logoError}</span>
              </div>
            )}

            {logoPreviewUrl ? (
              <div className="space-y-2">
                <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 h-40 flex items-center justify-center p-3">
                  <img
                    src={logoPreviewUrl}
                    alt="Business Logo Preview"
                    className="w-28 h-28 object-contain rounded-full border-2 border-white shadow-md bg-white"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change Logo
                    </button>
                    <button
                      type="button"
                      onClick={handleReCropLogo}
                      className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-teal-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" /> Re-Crop
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-rose-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3 text-slate-600" /> Change
                  </button>
                  <button
                    type="button"
                    onClick={handleReCropLogo}
                    className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-bold text-xs rounded-lg hover:bg-teal-100 flex items-center gap-1"
                  >
                    <Crop className="w-3 h-3 text-teal-600" /> Re-Crop
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-slate-100/50 rounded-xl p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 h-40"
              >
                <div className="p-3 bg-white border border-slate-200 rounded-full shadow-xs text-teal-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Upload Logo <span className="font-normal text-slate-500">(1:1 Square)</span>
                </p>
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Header Banner Upload Section (3:1) */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Catalog Header Banner (3:1)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">JPG, PNG, WEBP</span>
            </div>

            {bannerError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bannerError}</span>
              </div>
            )}

            {bannerPreviewUrl ? (
              <div className="space-y-2">
                <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 h-40 flex items-center justify-center">
                  <img
                    src={bannerPreviewUrl}
                    alt="Header Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change Banner
                    </button>
                    <button
                      type="button"
                      onClick={handleReCropBanner}
                      className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-teal-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" /> Re-Crop
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-rose-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3 text-slate-600" /> Change
                  </button>
                  <button
                    type="button"
                    onClick={handleReCropBanner}
                    className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-bold text-xs rounded-lg hover:bg-teal-100 flex items-center gap-1"
                  >
                    <Crop className="w-3 h-3 text-teal-600" /> Re-Crop
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-slate-100/50 rounded-xl p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 h-40"
              >
                <div className="p-3 bg-white border border-slate-200 rounded-full shadow-xs text-teal-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Upload Header Cover Banner <span className="font-normal text-slate-500">(3:1 Landscape)</span>
                </p>
              </div>
            )}

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleBannerFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">
          Localization & Visual Theme
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              <option value="LKR">LKR (Rs - Sri Lankan Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="CAD">CAD ($ - Canadian Dollar)</option>
              <option value="AUD">AUD ($ - Australian Dollar)</option>
              <option value="JPY">JPY (¥ - Japanese Yen)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Catalog Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 p-1 rounded-lg border border-slate-300 cursor-pointer"
              />
              <Input
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" isLoading={submitting} className="gap-2 font-semibold">
            <Save className="w-4 h-4" /> Save Business Settings
          </Button>
        </div>
      </form>

      {/* Image Cropper Modal for Logo & Banner */}
      <ImageCropperModal
        isOpen={activeCropperMode !== null}
        onClose={() => setActiveCropperMode(null)}
        imageSrc={cropperSourceUrl}
        onCropConfirm={handleCropConfirm}
        aspectRatio={activeCropperMode === 'banner' ? 3 / 1 : 1}
      />
    </div>
  );
}
