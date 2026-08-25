'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Download, Printer, ExternalLink, Sparkles, Smartphone, ShieldCheck, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/lib/types';

export default function DashboardQrCodePage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Customization controls
  const [darkColor, setDarkColor] = useState('#0F172A');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [margin, setMargin] = useState(2);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setBusiness({
          id: '1', owner_id: 'demo', name: 'Bella Vista Bistro', slug: 'bella-vista-bistro',
          business_type: 'restaurant', description: null, phone: null, email: null, address: null,
          website: null, logo_url: null, banner_url: null, currency: 'USD', theme_color: '#0F172A',
          created_at: '', updated_at: '',
        });
        setLoading(false);
        return;
      }

      const { data: adminRpc } = await supabase.rpc('is_super_admin');
      setIsSuperAdmin(Boolean(adminRpc));

      const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
      if (biz) setBusiness(biz as Business);
      setLoading(false);
    }

    loadData();
  }, []);

  // Generate QR Code when slug or colors change
  useEffect(() => {
    if (!business) return;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://qr-business-development.vercel.app');
    const targetUrl = `${baseUrl}/c/${business.slug}`;

    // Render to Canvas / DataURL (600px high resolution for print)
    QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));

    // Render to SVG String
    QRCode.toString(targetUrl, {
      type: 'svg',
      margin: margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.error('QR SVG error:', err));
  }, [business, darkColor, lightColor, margin]);

  const planKey = (business?.subscription_plan || 'free').toLowerCase();
  const isPaidPlan = isSuperAdmin || planKey === 'pro' || planKey === 'pro_growth' || planKey === 'enterprise' || planKey === 'business' || planKey === 'business_plus';

  const downloadPng = () => {
    if (!qrDataUrl || !business) return;
    const link = document.createElement('a');
    link.download = `${business.slug}-qr-code.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const downloadSvg = () => {
    if (!qrSvg || !business) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${business.slug}-qr-code.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!isPaidPlan) {
      setIsUpgradeModalOpen(true);
      return;
    }
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const catalogUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${business?.slug}`
    : `/c/${business?.slug}`;

  return (
    <div className="space-y-8 animate-fade-in print:p-0 print:m-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: '@media print { @page { size: portrait; margin: 5mm; } html, body { height: 100% !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; } }' }} />

      {/* Non-printable Controls & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">QR Code Studio</h1>
          <p className="text-xs text-slate-500">
            Generate high-resolution vector QR codes and printable tabletop tent flyers for your business.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={downloadSvg} className="flex-1 sm:flex-none gap-2 text-xs font-semibold">
            <Download className="w-3.5 h-3.5" /> Download SVG
          </Button>
          <Button variant="outline" onClick={downloadPng} className="flex-1 sm:flex-none gap-2 text-xs font-semibold">
            <Download className="w-3.5 h-3.5" /> Download PNG
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md">
            <Printer className="w-3.5 h-3.5 text-teal-400" /> Print Tabletop Flyer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:w-full">
        {/* Customization Panel (Hidden during printing) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs h-fit print:hidden">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <QrIcon className="w-5 h-5 text-teal-600" /> Customization Controls
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Target URL
              </label>
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 truncate">
                {catalogUrl}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  QR Module Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{darkColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600">{lightColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Quiet Zone Margin ({margin}px)
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <a
              href={`/c/${business?.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Test URL in new browser tab
            </a>
          </div>
        </div>

        {/* Live Printable Tabletop Flyer Preview */}
        <div className="lg:col-span-2 flex flex-col items-center print:w-full print:m-0 relative">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 print:hidden flex items-center gap-2">
            Printable Tabletop Tent Preview (Standard 5&quot; x 7&quot; Layout)
            {!isPaidPlan && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" /> Pro Feature
              </span>
            )}
          </div>

          <div className="relative w-full max-w-lg">
            {/* Locked Overlay for Free Tier */}
            {!isPaidPlan && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 print:hidden">
                <div className="p-3.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl shadow-lg">
                  <Crown className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-lg font-bold text-white">Pro & Business Feature</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Printable 5&quot; x 7&quot; Table Tent Flyers are available exclusively on Pro Growth and Business Plus plans.
                  </p>
                </div>
                <Button onClick={() => setIsUpgradeModalOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-2 shadow-md">
                  <Crown className="w-4 h-4" /> Upgrade Package to Unlock
                </Button>
              </div>
            )}

            {/* Tabletop Flyer Document */}
            <div
              id="printable-flyer"
              className="w-full max-w-lg bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-6 print:border-2 print:border-slate-900 print:shadow-none print:max-w-none print:w-[6.5in] print:max-h-[9.5in] print:h-auto print:mx-auto print:my-0 print:p-8 print:rounded-3xl print:flex print:flex-col print:justify-between print:page-break-inside-avoid print:break-inside-avoid"
            >
              {/* Header / Business Brand with Centered Logo */}
              <div className="space-y-3 w-full flex flex-col items-center">
                {business?.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-14 h-14 object-cover rounded-2xl border border-slate-200 shadow-md mb-1"
                  />
                ) : (
                  <div className="inline-flex items-center justify-center p-3.5 bg-slate-900 text-white rounded-2xl shadow-md mb-1">
                    <QrIcon className="w-8 h-8 text-teal-400" />
                  </div>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight print:text-4xl">
                  {business?.name}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 text-xs font-bold uppercase tracking-wider print:text-sm">
                    {business?.business_type || 'Business'} Catalog & Menu
                  </span>
                </div>
              </div>

              {/* High-Res Large QR Code Display */}
              <div className="p-4 sm:p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-md my-2 flex items-center justify-center print:border-slate-400 print:p-6 print:my-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Business Catalog QR Code"
                    className="w-64 h-64 sm:w-80 sm:h-80 max-w-full object-contain print:w-[3.5in] print:h-[3.5in]"
                  />
                )}
              </div>

              {/* Customer Scan Callout */}
              <div className="space-y-3 max-w-sm">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm print:text-sm print:py-2 print:px-5">
                  <Smartphone className="w-4 h-4 text-teal-400" /> Point Camera to Scan
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed print:text-base">
                  No app installation required. Scan with any smartphone camera to view items, prices & details.
                </p>
              </div>

              {/* Footer Watermark - Centered Touchless Catalog without site URL or top line */}
              <div className="w-full flex items-center justify-center text-xs text-slate-500 font-mono print:text-sm">
                <span className="flex items-center justify-center gap-1.5 font-bold text-slate-700 text-center">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Touchless Catalog
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
