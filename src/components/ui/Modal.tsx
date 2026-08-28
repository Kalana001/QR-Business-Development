'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-3xl',
    xl: 'sm:max-w-5xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in">
      {/* Full-screen dark backdrop overlay covering 100% of the viewport */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Centered Modal Box with Pinned Header, Footer & Scrollable Body */}
      <div
        className={`relative z-10 w-full max-w-[calc(100vw-1.5rem)] ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden text-left my-auto shrink-0`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-white rounded-t-2xl shrink-0">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with min-h-0 for Flexbox overflow */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {children}
        </div>

        {/* Pinned Bottom Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
