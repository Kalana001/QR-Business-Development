'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Store, Save, CheckCircle2, AlertCircle, Utensils, BookOpen, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Business, BusinessType, BUSINESS_TYPES_META } from '@/lib/types';
import { slugify } from '@/lib/utils';

export default function DashboardBusinessSettingsPage() {
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
  const [currency, setCurrency] = useState('USD');
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
      // Demo dataset
      const demoBiz: Business = {
        id: '11111111-1111-1111-1111-111111111111',
        owner_id: 'demo',
        name: 'Bella Vista Bistro',
        slug: 'bella-vista-bistro',
        business_type: 'restaurant',
        description: 'Authentic Italian dining with fresh homemade pasta and artisanal pizzas.',
        phone: '+1 (555) 234-5678',
        email: 'contact@bellavistabistro.com',
        address: '123 Main Street, Suite A, Downtown',
        website: 'https://bellavistabistro.com',
        logo_url: null,
        banner_url: null,
        currency: 'USD',
        theme_color: '#E11D48',
        created_at: '',
        updated_at: '',
      };
      setBusiness(demoBiz);
      populateForm(demoBiz);
      setLoading(false);
      return;
    }

    const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
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
    setCurrency(b.currency || 'USD');
    setThemeColor(b.theme_color || '#0F172A');
    setLogoUrl(b.logo_url || '');
  }

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
      setSuccessMsg('Business details successfully updated!');
      setSlug(formattedSlug);
    } catch (err: any) {
      // Local state update fallback
      setBusiness({ ...business, ...updatedPayload });
      setSuccessMsg('Settings updated locally!');
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
          Configure branding, business type, contact info, and public catalog URL settings.
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
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Public Catalog URL Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText={`Your customer link: /c/${slugify(slug || name)}`}
            required
          />
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
            placeholder="+1 (555) 000-0000"
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
            placeholder="123 Main Street, Suite 4"
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
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
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
