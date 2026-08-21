'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Download, Printer, ExternalLink, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/lib/types';

export default function DashboardQrCodePage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  
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

    // Render to Canvas / DataURL
    QRCode.toDataURL(targetUrl, {
      width: 400,
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
    <div className="space-y-8 animate-fade-in print:p-0">
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
          <Button onClick={handlePrint} className="w-full sm:w-auto gap-2 text-xs font-semibold bg-slate-900">
            <Printer className="w-3.5 h-3.5" /> Print Tabletop Flyer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        {/* Customization Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs h-fit">
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
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Printable Tabletop Tent Preview (Standard 5&quot; x 7&quot; Layout)
          </div>

          {/* Tabletop Flyer Document */}
          <div
            id="printable-flyer"
            className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col items-center text-center space-y-5 sm:space-y-6 print:border-none print:shadow-none print:max-w-none print:w-full print:p-12"
          >
            {/* Header / Business Brand */}
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center p-3 bg-slate-900 text-white rounded-2xl mb-1 shadow-sm">
                <QrIcon className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {business?.name}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Digital Catalog & Menu
              </p>
            </div>

            {/* High-Res QR Code Display */}
            <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl shadow-inner my-1 sm:my-2">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Business Catalog QR Code"
                  className="w-44 h-44 sm:w-56 sm:h-56 max-w-full object-contain"
                />
              )}
            </div>

            {/* Customer Scan Callout */}
            <div className="space-y-2 max-w-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-teal-600" /> Point Camera to Scan
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No app installation required. Scan with any smartphone camera to instantly view menu, items & details.
              </p>
            </div>

            {/* Footer Watermark */}
            <div className="pt-4 border-t border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{catalogUrl}</span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <ShieldCheck className="w-3 h-3 text-teal-500" /> Touchless Catalog
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
