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

  // SVG Vector & Atmospheric Overlay Layer
  const renderAtmosphericLayer = () => {
    const strokeColor = isDarkTemplate ? '#FFFFFF' : '#0F172A';
    const strokeOpacity = isDarkTemplate ? '0.14' : '0.11';

    switch (activeStyleId) {
      // MINIMAL
      case 'pure-canvas':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(${strokeColor} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        );

      case 'soft-gradient':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        );

      case 'editorial-paper':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.12]">
              <defs>
                <pattern id="paper-lines" width="48" height="48" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="24" x2="48" y2="24" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" />
                  <path d="M 12,12 L 18,12 M 30,36 L 36,36" stroke={strokeColor} strokeWidth="1.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#paper-lines)" />
            </svg>
          </div>
        );

      // MODERN
      case 'aurora-flow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute -top-20 left-1/4 w-80 h-80 rounded-full blur-[90px] opacity-35 animate-pulse"
              style={{ backgroundColor: accentColor, animationDuration: '6s' }}
            />
            <div 
              className="absolute top-1/3 -right-20 w-96 h-96 rounded-full blur-[100px] opacity-25"
              style={{ backgroundColor: primaryColor }}
            />
            <div 
              className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full blur-[80px] opacity-30"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        );

      case 'liquid-glass':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {/* Translucent Glass Blob 1 */}
            <div 
              className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
              style={{ transform: 'rotate(-15deg)' }}
            />
            {/* Translucent Glass Blob 2 */}
            <div 
              className="absolute top-1/2 -right-20 w-72 h-72 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/15 shadow-2xl"
              style={{ transform: 'rotate(25deg)' }}
            />
          </div>
        );

      case 'architectural-grid':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.14]">
              <defs>
                <pattern id="arch-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 0,30 L 60,30 M 30,0 L 30,60" stroke={strokeColor} strokeWidth="1" />
                  <circle cx="30" cy="30" r="1.5" fill={strokeColor} />
                  <path d="M 0,0 L 60,60" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="3,3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#arch-grid)" />
            </svg>
          </div>
        );

      case 'organic-waves':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" className="opacity-[0.15]">
              <path d="M 0,100 Q 150,200 400,120 L 400,0 L 0,0 Z" fill={accentColor} opacity="0.4" />
              <path d="M 0,400 Q 250,300 400,500 L 400,800 L 0,800 Z" fill={primaryColor} opacity="0.3" />
            </svg>
          </div>
        );

      // LUXURY
      case 'luxury-marble':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.15]">
              <defs>
                <pattern id="marble-veins" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M 0,40 Q 30,10 60,50 T 120,30" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <path d="M 20,120 Q 70,80 100,110" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4,2" fill="none" />
                  <circle cx="90" cy="40" r="1" fill="#D97706" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#marble-veins)" />
            </svg>
          </div>
        );

      case 'obsidian-glow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full blur-[110px] opacity-30"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        );

      case 'silk-satin':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" className="opacity-[0.14]">
              <path d="M -50,200 C 100,50 300,350 450,150 L 450,0 L -50,0 Z" fill={accentColor} opacity="0.35" />
              <path d="M -50,600 C 150,450 250,750 450,550 L 450,800 L -50,800 Z" fill={primaryColor} opacity="0.25" />
            </svg>
          </div>
        );

      case 'pearl-mist':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-rose-200/20 blur-3xl" />
            <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-amber-100/30 blur-3xl" />
          </div>
        );

      case 'noir-gold':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-80 rounded-full bg-amber-500/10 blur-[100px]" />
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.16]">
              <defs>
                <pattern id="noir-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 40,0 L 80,40 L 40,80 L 0,40 Z" stroke="#EAB308" strokeWidth="1" fill="none" />
                  <circle cx="40" cy="40" r="2" fill="#EAB308" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#noir-grid)" />
            </svg>
          </div>
        );

      // BUSINESS
      case 'culinary-atelier':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.14]">
              <defs>
                <pattern id="culinary-art" width="70" height="70" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="10" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <line x1="45" y1="12" x2="45" y2="28" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M 41,12 L 41,19 M 49,12 L 49,19" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="14" y="44" width="12" height="14" rx="2" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <polygon points="52,44 54,49 59,49 55,52 57,57 52,54 47,57 49,52 45,49 50,49" fill={strokeColor} />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#culinary-art)" />
            </svg>
          </div>
        );

      case 'coffee-atelier':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.14]">
              <defs>
                <pattern id="coffee-art" width="56" height="56" patternUnits="userSpaceOnUse">
                  <ellipse cx="20" cy="20" rx="8" ry="12" stroke={strokeColor} strokeWidth="1.4" fill="none" transform="rotate(30 20 20)" />
                  <path d="M 18,10 Q 22,20 18,30" stroke={strokeColor} strokeWidth="1.2" fill="none" transform="rotate(30 20 20)" />
                  <ellipse cx="42" cy="42" rx="8" ry="12" stroke={strokeColor} strokeWidth="1.4" fill="none" transform="rotate(-30 42 42)" />
                  <path d="M 40,32 Q 44,42 40,52" stroke={strokeColor} strokeWidth="1.2" fill="none" transform="rotate(-30 42 42)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#coffee-art)" />
            </svg>
          </div>
        );

      case 'botanical-shadow':
        return (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.14]">
              <defs>
                <pattern id="botanical-art" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 15,35 Q 35,15 55,35 Q 35,55 15,35 Z" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <path d="M 15,35 Q 35,35 55,35" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,2" fill="none" />
                  <path d="M 40,65 Q 60,45 80,65 Q 60,85 40,65 Z" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#botanical-art)" />
            </svg>
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
      {/* 15 Atmospheric Visual Layers */}
      {renderAtmosphericLayer()}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
