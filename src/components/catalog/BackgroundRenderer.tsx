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
  if (cleanHex.length !== 6) return `rgba(15, 23, 42, ${opacity})`;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

  // Render 12 Premium Atmospheric Layers
  const renderAtmosphericLayer = () => {
    const strokeColor = isDarkTemplate ? '#FFFFFF' : '#0F172A';

    switch (activeStyleId) {
      case 'clean-premium':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-15"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(${strokeColor} 1px, transparent 1px)`,
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
              className="absolute -top-32 left-1/4 w-96 h-96 rounded-full blur-[90px] opacity-30"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full blur-[120px] opacity-25"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Translucent Glass Blobs with Frosted Blur */}
            <div 
              className="absolute top-12 -left-16 w-72 h-72 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
              style={{ transform: 'rotate(-15deg)' }}
            />
            <div 
              className="absolute top-1/3 -right-20 w-80 h-80 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/15 shadow-2xl"
              style={{ transform: 'rotate(25deg)' }}
            />
            <div 
              className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl"
            />
          </div>
        );

      case 'aurora-mesh':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-35 motion-safe:animate-pulse"
              style={{ backgroundColor: accentColor, animationDuration: '8s' }}
            />
            <div 
              className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full blur-[110px] opacity-25"
              style={{ backgroundColor: primaryColor }}
            />
            <div 
              className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full blur-[90px] opacity-30 motion-safe:animate-pulse"
              style={{ backgroundColor: accentColor, animationDuration: '10s' }}
            />
          </div>
        );

      case 'luxury-marble':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-3xl" />
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.16]">
              <defs>
                <pattern id="marble-veins-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
                  <path d="M 0,50 Q 40,10 80,60 T 160,40" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <path d="M 30,160 Q 90,100 130,140" stroke="#D97706" strokeWidth="1" strokeDasharray="4,2" fill="none" />
                  <circle cx="120" cy="50" r="1.5" fill="#D97706" />
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
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[400px] rounded-full blur-[120px] opacity-35"
              style={{ backgroundColor: accentColor }}
            />
            {/* Translucent Dark Glass Card Highlight */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[480px] rounded-3xl bg-black/20 backdrop-blur-md border border-white/10" />
          </div>
        );

      case 'silk-flow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" className="opacity-[0.16]">
              <path d="M -50,180 C 120,40 320,320 450,120 L 450,0 L -50,0 Z" fill={accentColor} opacity="0.4" />
              <path d="M -50,580 C 160,420 260,720 450,520 L 450,800 L -50,800 Z" fill={primaryColor} opacity="0.3" />
            </svg>
          </div>
        );

      case 'cosmic-luxe':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-20 right-10 w-80 h-80 rounded-full blur-[100px] opacity-30"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="absolute bottom-10 left-10 w-96 h-96 rounded-full blur-[110px] opacity-25"
              style={{ backgroundColor: primaryColor }}
            />
            {/* Subtle Star Particles */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.2]">
              <defs>
                <pattern id="star-particles" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="#FFFFFF" />
                  <circle cx="60" cy="40" r="1.5" fill="#6366F1" />
                  <circle cx="30" cy="70" r="1" fill="#FFFFFF" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#star-particles)" />
            </svg>
          </div>
        );

      case 'architectural':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.14]">
              <defs>
                <pattern id="architectural-grid-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
                  <path d="M 0,32 L 64,32 M 32,0 L 32,64" stroke={strokeColor} strokeWidth="1" />
                  <circle cx="32" cy="32" r="2" fill={strokeColor} />
                  <path d="M 0,0 L 64,64" stroke={strokeColor} strokeWidth="0.6" strokeDasharray="4,4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#architectural-grid-pattern)" />
            </svg>
          </div>
        );

      case 'organic-flow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" className="opacity-[0.15]">
              <path d="M 0,120 Q 180,220 400,100 L 400,0 L 0,0 Z" fill={accentColor} opacity="0.4" />
              <path d="M 0,420 Q 220,320 400,520 L 400,800 L 0,800 Z" fill={primaryColor} opacity="0.3" />
            </svg>
          </div>
        );

      case 'editorial-paper':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.14]">
              <defs>
                <pattern id="editorial-lines-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="24" x2="48" y2="24" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" />
                  <path d="M 12,12 L 18,12 M 30,36 L 36,36" stroke={strokeColor} strokeWidth="1.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editorial-lines-pattern)" />
            </svg>
          </div>
        );

      case 'soft-cloud':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sky-200/40 blur-3xl" />
            <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
            <div className="absolute -bottom-20 right-10 w-80 h-80 rounded-full bg-indigo-100/40 blur-3xl" />
          </div>
        );

      case 'brand-aura':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {/* Softened, desaturated brand color radial aura (never raw 100% saturation) */}
            <div 
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[400px] rounded-full blur-[110px]"
              style={{ backgroundColor: hexToRgba(primaryColor, 0.22) }}
            />
            <div 
              className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full blur-[120px]"
              style={{ backgroundColor: hexToRgba(accentColor, 0.25) }}
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
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-35 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-2xl opacity-25 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
        {renderAtmosphericLayer()}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 12 Atmospheric Visual Layers */}
      {renderAtmosphericLayer()}

      {/* Main Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
