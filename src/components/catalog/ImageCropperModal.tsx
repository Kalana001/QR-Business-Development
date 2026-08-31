'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { ZoomIn, ZoomOut, RefreshCw, Check, X, Crop } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getCroppedImg } from '@/lib/storage';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropConfirm: (croppedBlob: Blob, previewUrl: string) => void;
  aspectRatio?: number;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropConfirm,
  aspectRatio = 1, // 1:1 ratio for catalog cards
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // Reset cropper state whenever a new image is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [imageSrc, isOpen]);

  const onCropCompleteCallback = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      onCropConfirm(croppedBlob, previewUrl);
      onClose();
    } catch (err) {
      console.error('Error generating cropped image:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crop for Catalog"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            size="sm"
            className="flex items-center gap-1.5 text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Crop
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCrop}
              isLoading={processing}
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Use This Crop
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 font-medium">
          Crop the image to choose exactly what customers see in the catalog. This square preview matches your catalog cards.
        </p>

        {/* Cropper Container */}
        <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: { width: '100%', height: '100%', borderRadius: '1rem' },
              cropAreaStyle: { border: '2px solid #0D9488', borderRadius: '0.75rem', boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)' },
            }}
          />
        </div>

        {/* Zoom Slider Controls */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <Crop className="w-3.5 h-3.5 text-teal-600" /> Zoom Level
            </span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
