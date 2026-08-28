'use client';

import React from 'react';
import { BackgroundStyleId } from '@/lib/backgrounds';

interface BackgroundRendererProps {
  styleId?: BackgroundStyleId;
  primaryColor?: string;
  accentColor?: string;
  isDarkTemplate?: boolean;
  children?: React.ReactNode;
  className?: string;
  headerOnly?: boolean;
}

export function BackgroundRenderer({
  styleId = 'clean',
  primaryColor = '#0F172A',
  accentColor = '#38BDF8',
  isDarkTemplate = false,
  children,
  className = '',
  headerOnly = false,
}: BackgroundRendererProps) {
  // SVG Vector Overlays with visible opacity (12-16%) for clear visual application while maintaining text contrast
  const renderSvgOverlay = () => {
    const strokeColor = isDarkTemplate ? '#FFFFFF' : '#0F172A';
    const opacityClass = isDarkTemplate ? 'opacity-[0.14]' : 'opacity-[0.12]';

    switch (styleId) {
      case 'subtle-pattern':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dot-matrix" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="2" fill={strokeColor} />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-matrix)" />
            </svg>
          </div>
        );

      case 'food-restaurant':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${isDarkTemplate ? 'opacity-[0.15]' : 'opacity-[0.14]'}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="food-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
                  {/* Plate & Fork Vector */}
                  <circle cx="16" cy="16" r="9" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <line x1="40" y1="10" x2="40" y2="26" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M 36,10 L 36,17 M 44,10 L 44,17" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
                  {/* Cup / Beverage */}
                  <rect x="12" y="40" width="12" height="14" rx="2" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <path d="M 24,43 C 28,43 28,51 24,51" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  {/* Chef Star */}
                  <polygon points="48,40 50,45 55,45 51,48 53,53 48,50 43,53 45,48 41,45 46,45" fill={strokeColor} />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#food-pattern)" />
            </svg>
          </div>
        );

      case 'jewelry-luxury':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${isDarkTemplate ? 'opacity-[0.16]' : 'opacity-[0.13]'}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="luxury-diamond" width="56" height="56" patternUnits="userSpaceOnUse">
                  <path d="M 28,0 L 56,28 L 28,56 L 0,28 Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <circle cx="28" cy="28" r="4" stroke={strokeColor} strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#luxury-diamond)" />
            </svg>
          </div>
        );

      case 'botanical':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${isDarkTemplate ? 'opacity-[0.15]' : 'opacity-[0.13]'}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="botanical-leaves" width="64" height="64" patternUnits="userSpaceOnUse">
                  <path d="M 12,28 Q 28,12 44,28 Q 28,44 12,28 Z" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                  <path d="M 12,28 Q 28,28 44,28" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,2" fill="none" />
                  <path d="M 32,52 Q 48,36 64,52 Q 48,68 32,52 Z" stroke={strokeColor} strokeWidth="1.4" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#botanical-leaves)" />
            </svg>
          </div>
        );

      case 'cafe-coffee':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${isDarkTemplate ? 'opacity-[0.16]' : 'opacity-[0.13]'}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="coffee-beans" width="52" height="52" patternUnits="userSpaceOnUse">
                  <ellipse cx="18" cy="18" rx="8" ry="11" stroke={strokeColor} strokeWidth="1.4" fill="none" transform="rotate(30 18 18)" />
                  <path d="M 16,9 Q 20,18 16,27" stroke={strokeColor} strokeWidth="1.2" fill="none" transform="rotate(30 18 18)" />
                  <ellipse cx="40" cy="40" rx="8" ry="11" stroke={strokeColor} strokeWidth="1.4" fill="none" transform="rotate(-30 40 40)" />
                  <path d="M 38,31 Q 42,40 38,49" stroke={strokeColor} strokeWidth="1.2" fill="none" transform="rotate(-30 40 40)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#coffee-beans)" />
            </svg>
          </div>
        );

      case 'modern-geometric':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="modern-geo" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="20" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <path d="M 0,30 L 60,30" stroke={strokeColor} strokeWidth="0.9" strokeDasharray="4,4" />
                  <path d="M 30,0 L 30,60" stroke={strokeColor} strokeWidth="0.9" strokeDasharray="4,4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modern-geo)" />
            </svg>
          </div>
        );

      case 'elegant-texture':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${isDarkTemplate ? 'opacity-[0.16]' : 'opacity-[0.12]'}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="elegant-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 0,32 L 32,0 M 0,0 L 32,32" stroke={strokeColor} strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#elegant-grid)" />
            </svg>
          </div>
        );

      case 'paper-editorial':
        return (
          <div className={`absolute inset-0 pointer-events-none z-0 ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="paper-lines" width="44" height="44" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="22" x2="44" y2="22" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" />
                  <path d="M 12,12 L 18,12 M 28,34 L 34,34" stroke={strokeColor} strokeWidth="1.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#paper-lines)" />
            </svg>
          </div>
        );

      case 'soft-gradient':
      case 'clean':
      default:
        return null;
    }
  };

  // Ambient Color Glow Overlays
  const getAmbientGradient = () => {
    switch (styleId) {
      case 'soft-gradient':
        return `radial-gradient(circle at 10% 20%, ${accentColor}25 0%, transparent 50%), radial-gradient(circle at 90% 80%, ${primaryColor}20 0%, transparent 60%)`;
      case 'food-restaurant':
        return `radial-gradient(circle at 50% 0%, #EA580C18 0%, transparent 60%)`;
      case 'jewelry-luxury':
        return `radial-gradient(circle at 50% 0%, #D9770620 0%, transparent 60%)`;
      case 'botanical':
        return `radial-gradient(circle at 50% 0%, #05966918 0%, transparent 60%)`;
      case 'cafe-coffee':
        return `radial-gradient(circle at 50% 0%, #78350F18 0%, transparent 60%)`;
      case 'modern-geometric':
        return `radial-gradient(circle at 50% 0%, #6366F118 0%, transparent 60%)`;
      case 'elegant-texture':
        return `radial-gradient(circle at 50% 0%, #F59E0B15 0%, transparent 60%)`;
      case 'paper-editorial':
        return `radial-gradient(circle at 50% 0%, #7C2D1215 0%, transparent 60%)`;
      default:
        return undefined;
    }
  };

  // Header specific subtle depth overlays
  if (headerOnly) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
        {renderSvgOverlay()}
      </div>
    );
  }

  const ambientGradient = getAmbientGradient();

  return (
    <div className={`relative ${className}`}>
      {/* Dynamic Ambient Color Gradient Overlay */}
      {ambientGradient && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 transition-all duration-500" 
          style={{ backgroundImage: ambientGradient }}
        />
      )}

      {/* SVG Vector Overlays */}
      {renderSvgOverlay()}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
