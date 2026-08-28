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
  // SVG Vector Overlays with low opacity to preserve WCAG AA readability
  const renderSvgOverlay = () => {
    const strokeColor = isDarkTemplate ? '#FFFFFF' : '#000000';
    const opacityClass = isDarkTemplate ? 'opacity-[0.06]' : 'opacity-[0.04]';

    switch (styleId) {
      case 'subtle-pattern':
        return (
          <div className={`absolute inset-0 pointer-events-none ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dot-matrix" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill={strokeColor} />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-matrix)" />
            </svg>
          </div>
        );

      case 'food-restaurant':
        return (
          <div className={`absolute inset-0 pointer-events-none ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="food-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  {/* Plate & Fork Vector */}
                  <circle cx="15" cy="15" r="8" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <line x1="38" y1="10" x2="38" y2="24" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M 35,10 L 35,16 M 41,10 L 41,16" stroke={strokeColor} strokeWidth="1" strokeLinecap="round" />
                  {/* Cup / Beverage */}
                  <rect x="10" y="38" width="10" height="12" rx="2" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <path d="M 20,41 C 23,41 23,47 20,47" stroke={strokeColor} strokeWidth="1" fill="none" />
                  {/* Chef Star */}
                  <polygon points="45,38 47,43 52,43 48,46 50,51 45,48 40,51 42,46 38,43 43,43" fill={strokeColor} />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#food-pattern)" />
            </svg>
          </div>
        );

      case 'jewelry-luxury':
        return (
          <div className={`absolute inset-0 pointer-events-none ${isDarkTemplate ? 'opacity-[0.08]' : 'opacity-[0.05]'}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="luxury-diamond" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 25,0 L 50,25 L 25,50 L 0,25 Z" stroke={strokeColor} strokeWidth="1" fill="none" />
                  <circle cx="25" cy="25" r="3" stroke={strokeColor} strokeWidth="0.8" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#luxury-diamond)" />
            </svg>
          </div>
        );

      case 'botanical':
        return (
          <div className={`absolute inset-0 pointer-events-none ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="botanical-leaves" width="64" height="64" patternUnits="userSpaceOnUse">
                  <path d="M 10,25 Q 25,10 40,25 Q 25,40 10,25 Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                  <path d="M 10,25 Q 25,25 40,25" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="2,2" fill="none" />
                  <path d="M 30,50 Q 45,35 60,50 Q 45,65 30,50 Z" stroke={strokeColor} strokeWidth="1.2" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#botanical-leaves)" />
            </svg>
          </div>
        );

      case 'cafe-coffee':
        return (
          <div className={`absolute inset-0 pointer-events-none ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="coffee-beans" width="48" height="48" patternUnits="userSpaceOnUse">
                  {/* Coffee Bean Vector */}
                  <ellipse cx="16" cy="16" rx="7" ry="10" stroke={strokeColor} strokeWidth="1.2" fill="none" transform="rotate(30 16 16)" />
                  <path d="M 14,8 Q 18,16 14,24" stroke={strokeColor} strokeWidth="1" fill="none" transform="rotate(30 16 16)" />
                  <ellipse cx="36" cy="36" rx="7" ry="10" stroke={strokeColor} strokeWidth="1.2" fill="none" transform="rotate(-30 36 36)" />
                  <path d="M 34,28 Q 38,36 34,44" stroke={strokeColor} strokeWidth="1" fill="none" transform="rotate(-30 36 36)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#coffee-beans)" />
            </svg>
          </div>
        );

      case 'modern-geometric':
        return (
          <div className={`absolute inset-0 pointer-events-none ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="modern-geo" width="56" height="56" patternUnits="userSpaceOnUse">
                  <circle cx="28" cy="28" r="18" stroke={strokeColor} strokeWidth="1" fill="none" />
                  <path d="M 0,28 L 56,28" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="3,3" />
                  <path d="M 28,0 L 28,56" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="3,3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modern-geo)" />
            </svg>
          </div>
        );

      case 'elegant-texture':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="elegant-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 0,30 L 30,0 M 0,0 L 30,30" stroke={strokeColor} strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#elegant-grid)" />
            </svg>
          </div>
        );

      case 'paper-editorial':
        return (
          <div className={`absolute inset-0 pointer-events-none ${opacityClass}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="paper-lines" width="40" height="40" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="20" x2="40" y2="20" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4,4" />
                  <path d="M 10,10 L 15,10 M 25,30 L 30,30" stroke={strokeColor} strokeWidth="1" />
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

  // Header specific subtle depth overlays
  if (headerOnly) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Ambient Highlight */}
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-2xl opacity-15 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
        {renderSvgOverlay()}
      </div>
    );
  }

  // Soft Gradient Dynamic Background Overlay
  const gradientOverlayStyle = styleId === 'soft-gradient' ? {
    backgroundImage: `radial-gradient(circle at 10% 20%, ${accentColor}15 0%, transparent 40%), radial-gradient(circle at 90% 80%, ${primaryColor}20 0%, transparent 50%)`,
  } : undefined;

  return (
    <div className={`relative ${className}`}>
      {/* Background SVG / Gradient Treatment Overlay */}
      {renderSvgOverlay()}
      {styleId === 'soft-gradient' && (
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500" 
          style={gradientOverlayStyle}
        />
      )}
      {children}
    </div>
  );
}
