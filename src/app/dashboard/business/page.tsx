'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Store, Save, CheckCircle2, AlertCircle, Utensils, BookOpen, Scissors, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Business, BusinessType, BUSINESS_TYPES_META } from '@/lib/types';
import { slugify } from '@/lib/utils';

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
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [themeColor, setThemeColor] = useState('#0F172A');
  const [logoUrl, setLogoUrl] = useState('');

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
    setIsSlugCustomized(false);
    setBusinessType(b.business_type);
    setDescription(b.description || '');
    setPhone(b.phone || '');
    setEmail(b.email || '');
    setAddress(b.address || '');
    setWebsite(b.website || '');
    setCurrency(b.currency || 'LKR');
    setThemeColor(b.theme_color || '#0F172A');
    setLogoUrl(b.logo_url || '');
  }

  // Handle Business Name Change with auto-slug sync
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isSlugCustomized) {
      setSlug(slugify(newName));
    }
  };

  // Handle manual slug edit
  const handleSlugChange = (newSlug: string) => {
    setIsSlugCustomized(true);
    setSlug(slugify(newSlug));
  };

  // Reset slug to match current business name
  const resetSlugToName = () => {
    setIsSlugCustomized(false);
    setSlug(slugify(name));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formattedSlug = slugify(slug) || slugify(name);

    const updatedPayload = {
      name,
      slug: formattedSlug,
      business_type: businessType,
      description: description || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      website: website || null,
      currency,
      theme_color: themeColor,
      logo_url: logoUrl || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from('businesses').update(updatedPayload).eq('id', business.id);
      if (error) throw error;
      setSuccessMsg('Business details & public URL successfully updated!');
      setSlug(formattedSlug);
      setBusiness({ ...business, ...updatedPayload });
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
            helperText="Changing business name auto-syncs public catalog URL slug below."
            required
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Public Catalog URL Slug
              </label>
              {isSlugCustomized && (
                <button
                  type="button"
                  onClick={resetSlugToName}
                  className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Sync with Name
                </button>
              )}
            </div>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <LinkIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              Live customer URL: <strong className="text-slate-800">/c/{slugify(slug || name)}</strong>
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
          Localization & Visual Theme
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <Input
            label="Logo Image URL"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" isLoading={submitting} className="gap-2 font-semibold">
            <Save className="w-4 h-4" /> Save Business Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
