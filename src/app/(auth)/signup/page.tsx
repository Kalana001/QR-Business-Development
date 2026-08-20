'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowRight, AlertCircle, Utensils, BookOpen, Scissors, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { BusinessType, BUSINESS_TYPES_META } from '@/lib/types';
import { slugify } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // 1. Sign up auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('Signup failed. Please try again.');

      // 2. Create initial business workspace
      const generatedSlug = slugify(businessName) || `biz-${Date.now()}`;
      
      const { error: bizError } = await supabase.from('businesses').insert({
        owner_id: user.id,
        name: businessName,
        slug: generatedSlug,
        business_type: businessType,
        currency: 'USD',
        theme_color: '#0F172A',
      });

      if (bizError) {
        console.error('Error creating business:', bizError);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to register account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-white">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <span>QR Catalog Studio</span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Create your Business Catalog</h2>
          <p className="text-xs text-slate-400">Launch a digital catalog accessible via QR code scan in 2 minutes</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Your Full Name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500"
            />
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500"
          />

          <Input
            label="Business Name"
            type="text"
            placeholder="e.g. Bella Vista Bistro, City Books"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500"
          />

          {/* Business Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Business Type
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{meta.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Determines customized catalog fields (e.g. Dish badges vs ISBN/Author vs Duration).
            </p>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold border-none py-2.5 mt-2"
          >
            Create Business & Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
