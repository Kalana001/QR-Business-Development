'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(errorParam || null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetMsg(null);

    try {
      const supabase = createClient();
      const trimmedEmail = email.trim();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) throw authError;

      // Database-backed redirect: Super Admin -> /admin, Business Owners -> /dashboard or nextParam
      const { data: isAdmin } = await supabase.rpc('is_super_admin');

      if (nextParam) {
        router.push(nextParam);
      } else if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first to reset your password.');
      return;
    }
    setResetLoading(true);
    setError(null);
    setResetMsg(null);

    try {
      const supabase = createClient();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      });
      if (resetErr) throw resetErr;
      setResetMsg(`Password reset link sent to ${email.trim()}. Please check your email inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-white">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <span>QR Catalog Studio</span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to manage your digital catalog or admin portal</p>
        </div>

        {resetMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <span>{resetMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. AdminKal@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500"
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500"
            />
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-[11px] font-semibold text-teal-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                {resetLoading ? 'Sending Reset Email...' : 'Forgot password?'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold border-none py-2.5 mt-2"
          >
            Sign In <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Don&apos;t have a business catalog yet?{' '}
          <Link href="/signup" className="text-teal-400 hover:underline font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
