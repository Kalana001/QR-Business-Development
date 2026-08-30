import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const errorDescription = searchParams.get('error_description') || searchParams.get('error');

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = new URL(next, origin);
      if (next.includes('/reset-password')) {
        redirectUrl.searchParams.set('type', 'recovery');
      }
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // Return user to login if verification code invalid or expired
  return NextResponse.redirect(`${origin}/login?error=Verification%20failed%20or%20expired`);
}
