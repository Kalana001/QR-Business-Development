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

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const generatedSlug = slugify(businessName) || `biz-${Date.now()}`;

      // 1. Register auth user storing business details in user_metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
            business_type: businessType,
            business_slug: generatedSlug,
          },
        },
      });

      if (authError) throw authError;

      // 2. Immediately sign in so no email confirmation link is required
      if (!authData.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) {
          console.log('Instant sign-in notification:', signInErr.message);
        }
      }

      // 3. Forward directly to dashboard
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
          <p className="text-xs text-slate-400">Instant registration with zero email verification required</p>
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
              label="Email Address (e.g. @gmail.com, @yahoo.com)"
              type="email"
              placeholder="name@gmail.com"
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
            Create Business & Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
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
