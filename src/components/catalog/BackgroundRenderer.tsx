'use client';

import React from 'react';
import { BackgroundStyleId, normalizeBackgroundStyleId } from '@/lib/backgrounds';

interface BackgroundRendererProps {
  styleId?: string;
  primaryColor?: string;
  accentColor?: string;
  isDarkTemplate?: boolean;
  children?: React.ReactNode;
  className?: string;
  headerOnly?: boolean;
}

// Utility helper to convert hex to rgba with opacity for softening brand colors
function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return `rgba(56, 189, 248, ${opacity})`;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Get effective vibrant accent color (fallback if accent is dark slate #0F172A or black)
function getVibrantAccent(accent: string): string {
  const cleanHex = accent.replace('#', '').toUpperCase();
  if (cleanHex === '0F172A' || cleanHex === '000000' || cleanHex === '1E293B' || cleanHex === '000') {
    return '#38BDF8'; // Vibrant sky blue fallback for atmospheric glows
  }
  return accent;
}

export function BackgroundRenderer({
  styleId,
  primaryColor = '#0F172A',
  accentColor = '#38BDF8',
  isDarkTemplate = false,
  children,
  className = '',
  headerOnly = false,
}: BackgroundRendererProps) {
  const activeStyleId = normalizeBackgroundStyleId(styleId);
  const vibrantAccent = getVibrantAccent(accentColor);

  // Base background surface style to guarantee visual distinction across light and dark templates
  const getBaseSurface = () => {
    if (isDarkTemplate) return 'bg-slate-950 text-white';

    switch (activeStyleId) {
      case 'clean-premium':
        return 'bg-slate-50 text-slate-900';
      case 'editorial-paper':
        return 'bg-[#FAF8F5] text-stone-900';
      case 'soft-cloud':
        return 'bg-gradient-to-b from-sky-50/80 via-white to-amber-50/50 text-slate-900';
      case 'luxury-marble':
        return 'bg-stone-50 text-stone-900';
      case 'obsidian-glow':
      case 'cosmic-luxe':
        return 'bg-slate-950 text-white';
      case 'liquid-glass':
      case 'aurora-mesh':
      case 'organic-flow':
      case 'silk-flow':
      case 'architectural':
      case 'brand-aura':
      default:
        return 'bg-slate-50/90 text-slate-900';
    }
  };

  // Render 12 Premium Atmospheric Layers with high contrast for both light and dark themes
  const renderAtmosphericLayer = () => {
    const strokeColor = isDarkTemplate ? '#FFFFFF' : '#0F172A';
    const strokeOpacity = isDarkTemplate ? '0.18' : '0.14';

    switch (activeStyleId) {
      case 'clean-premium':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[90px] opacity-25"
              style={{ backgroundColor: vibrantAccent }}
            />
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(${strokeColor} 1.2px, transparent 1.2px)`,
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        );

      case 'liquid-glass':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {/* Ambient Background Gradient */}
            <div 
              className="absolute -top-32 left-1/4 w-96 h-96 rounded-full blur-[80px] opacity-40"
              style={{ backgroundColor: vibrantAccent }}
            />
            <div 
              className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full blur-[100px] opacity-30"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Translucent Glass Blobs with Frosted Blur and Distinct Contrast Borders */}
            <div 
              className={`absolute top-12 -left-16 w-72 h-72 rounded-full backdrop-blur-xl border shadow-2xl ${
                isDarkTemplate ? 'bg-white/10 border-white/20' : 'bg-white/60 border-slate-900/10 shadow-slate-300/50'
              }`}
              style={{ transform: 'rotate(-15deg)' }}
            />
            <div 
              className={`absolute top-1/3 -right-20 w-80 h-80 rounded-[3rem] backdrop-blur-2xl border shadow-2xl ${
                isDarkTemplate ? 'bg-white/5 border-white/15' : 'bg-white/50 border-slate-900/10 shadow-slate-300/40'
              }`}
              style={{ transform: 'rotate(25deg)' }}
            />
            <div 
              className={`absolute bottom-20 left-10 w-64 h-64 rounded-full backdrop-blur-lg border shadow-xl ${
                isDarkTemplate ? 'bg-white/10 border-white/20' : 'bg-white/60 border-slate-900/10'
              }`}
            />
          </div>
        );

      case 'aurora-mesh':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-[90px] opacity-45 motion-safe:animate-pulse"
              style={{ backgroundColor: vibrantAccent, animationDuration: '8s' }}
            />
            <div 
              className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full blur-[100px] opacity-35"
              style={{ backgroundColor: primaryColor }}
            />
            <div 
              className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full blur-[80px] opacity-40 motion-safe:animate-pulse"
              style={{ backgroundColor: vibrantAccent, animationDuration: '10s' }}
            />
          </div>
        );

      case 'luxury-marble':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-amber-500/15 via-transparent to-transparent blur-3xl" />
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className={isDarkTemplate ? 'opacity-[0.2]' : 'opacity-[0.16]'}>
              <defs>
                <pattern id="marble-veins-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
                  <path d="M 0,50 Q 40,10 80,60 T 160,40" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <path d="M 30,160 Q 90,100 130,140" stroke="#D97706" strokeWidth="1.2" strokeDasharray="4,2" fill="none" />
                  <circle cx="120" cy="50" r="2" fill="#D97706" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#marble-veins-pattern)" />
            </svg>
          </div>
        );

      case 'obsidian-glow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[400px] rounded-full blur-[110px] opacity-40"
              style={{ backgroundColor: vibrantAccent }}
            />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[480px] rounded-3xl bg-black/30 backdrop-blur-md border border-white/10" />
          </div>
        );

      case 'silk-flow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" className={isDarkTemplate ? 'opacity-[0.2]' : 'opacity-[0.18]'}>
              <path d="M -50,180 C 120,40 320,320 450,120 L 450,0 L -50,0 Z" fill={vibrantAccent} opacity="0.45" />
              <path d="M -50,580 C 160,420 260,720 450,520 L 450,800 L -50,800 Z" fill={primaryColor} opacity="0.35" />
            </svg>
          </div>
        );

      case 'cosmic-luxe':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-20 right-10 w-80 h-80 rounded-full blur-[90px] opacity-35"
              style={{ backgroundColor: vibrantAccent }}
            />
            <div 
              className="absolute bottom-10 left-10 w-96 h-96 rounded-full blur-[100px] opacity-30"
              style={{ backgroundColor: primaryColor }}
            />
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.25]">
              <defs>
                <pattern id="star-particles" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.2" fill="#FFFFFF" />
                  <circle cx="60" cy="40" r="1.8" fill="#38BDF8" />
                  <circle cx="30" cy="70" r="1.2" fill="#FFFFFF" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#star-particles)" />
            </svg>
          </div>
        );

      case 'architectural':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className={isDarkTemplate ? 'opacity-[0.18]' : 'opacity-[0.14]'}>
              <defs>
                <pattern id="architectural-grid-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
                  <path d="M 0,32 L 64,32 M 32,0 L 32,64" stroke={strokeColor} strokeWidth="1.2" />
                  <circle cx="32" cy="32" r="2.5" fill={strokeColor} />
                  <path d="M 0,0 L 64,64" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4,4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#architectural-grid-pattern)" />
            </svg>
          </div>
        );

      case 'organic-flow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" className={isDarkTemplate ? 'opacity-[0.2]' : 'opacity-[0.16]'}>
              <path d="M 0,120 Q 180,220 400,100 L 400,0 L 0,0 Z" fill={vibrantAccent} opacity="0.45" />
              <path d="M 0,420 Q 220,320 400,520 L 400,800 L 0,800 Z" fill={primaryColor} opacity="0.35" />
            </svg>
          </div>
        );

      case 'editorial-paper':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className={isDarkTemplate ? 'opacity-[0.18]' : 'opacity-[0.15]'}>
              <defs>
                <pattern id="editorial-lines-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="24" x2="48" y2="24" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="4,4" />
                  <path d="M 12,12 L 18,12 M 30,36 L 36,36" stroke={strokeColor} strokeWidth="1.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editorial-lines-pattern)" />
            </svg>
          </div>
        );

      case 'soft-cloud':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky-300/40 blur-3xl" />
            <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="absolute -bottom-20 right-10 w-80 h-80 rounded-full bg-indigo-300/40 blur-3xl" />
          </div>
        );

      case 'brand-aura':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[400px] rounded-full blur-[100px]"
              style={{ backgroundColor: hexToRgba(primaryColor, 0.28) }}
            />
            <div 
              className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full blur-[110px]"
              style={{ backgroundColor: hexToRgba(vibrantAccent, 0.32) }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Header specific subtle depth overlays
  if (headerOnly) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundColor: vibrantAccent }}
        />
        <div 
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
        {renderAtmosphericLayer()}
      </div>
    );
  }

  return (
    <div className={`relative ${getBaseSurface()} ${className}`}>
      {/* 12 Atmospheric Visual Layers */}
      {renderAtmosphericLayer()}

      {/* Main Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
