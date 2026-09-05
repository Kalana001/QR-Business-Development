'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isValidRecovery, setIsValidRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function verifyRecoverySession() {
      try {
        const supabase = createClient();

        // 1. Check for URL hash parameters if implicit flow returned hash fragments
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashError = hashParams.get('error_description') || hashParams.get('error');
          const hashType = hashParams.get('type');
          if (hashError) {
            setError('This password reset link is invalid or has expired. Please request a new password reset link.');
            setIsValidRecovery(false);
            setCheckingSession(false);
            return;
          }
          if (hashType === 'recovery') {
            setIsValidRecovery(true);
          }
        }

        // 2. Check for type=recovery searchParam from auth/callback
        const typeParam = searchParams.get('type');
        const codeParam = searchParams.get('code');
        
        // 3. Listen to Supabase auth state change events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setIsValidRecovery(true);
          }
        });

        // 4. Verify existing authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        if (session || typeParam === 'recovery' || codeParam) {
          setIsValidRecovery(true);
        } else {
          // If no active session or recovery flag, check user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setIsValidRecovery(true);
          } else {
            setIsValidRecovery(false);
          }
        }

        subscription.unsubscribe();
      } catch (err) {
        console.error('Error verifying recovery session:', err);
        setIsValidRecovery(false);
      } finally {
        setCheckingSession(false);
      }
    }

    verifyRecoverySession();
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation 1: Password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Validation 2: Passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Double-check session presence before updating
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (!session && !user) {
        setError('This password reset link is invalid or has expired. Please request a new password reset link.');
        setIsValidRecovery(false);
        setLoading(false);
        return;
      }

      // Execute password update
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMsg('Your password has been updated successfully.');

      // Sign out to ensure clean state and require login with new credentials
      await supabase.auth.signOut();

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Verifying Recovery Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-white">
            <div className="p-2 bg-teal-500 text-slate-950 rounded-lg">
              <QrCode className="w-6 h-6" />
            </div>
            <span>QuickMenu</span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Reset your password</h2>
          <p className="text-xs text-slate-400">Enter a new password for your account.</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-emerald-400 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Password Updated!</span>
            </div>
            <p>{successMsg}</p>
            <p className="text-[11px] text-emerald-300/80 pt-1">
              Redirecting you to the login page...
            </p>
            <div className="pt-2">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2"
              >
                Proceed to Login <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Invalid or Expired Session Screen */}
        {!isValidRecovery && !successMsg ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                This password reset link is invalid or has expired. Please request a new password reset link.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2.5"
              >
                Request New Reset Link <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <Link
                href="/login"
                className="inline-block text-xs text-slate-400 hover:text-white font-medium pt-1"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : !successMsg ? (
          /* Valid Recovery Form */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1 relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                disabled={loading}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1 relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                disabled={loading}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-teal-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[32px] text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold border-none py-2.5 mt-2"
            >
              Update Password <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        ) : null}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Remember your password?{' '}
          <Link href="/login" className="text-teal-400 hover:underline font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Loading Reset Page...
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
