import { createClient } from '@/lib/supabase/client';
import { Area } from 'react-easy-crop';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const BUCKET_NAME = 'business-assets';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file format and size for item images.
 */
export function validateImageFile(file: File): ImageValidationResult {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  const validMimeType = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());

  if (!validExtension && !validMimeType) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG, or WEBP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image must be smaller than 5 MB.',
    };
  }

  return { valid: true };
}

/**
 * Creates an HTML Image element from a source URL or Blob URL.
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Crops an image canvas using react-easy-crop pixel crop coordinates.
 * Returns a Blob of the cropped image area.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  mimeType = 'image/jpeg',
  maxDimension = 1600,
  quality = 0.85
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d canvas context available');
  }

  let cropWidth = pixelCrop.width;
  let cropHeight = pixelCrop.height;

  let targetWidth = cropWidth;
  let targetHeight = cropHeight;

  if (cropWidth > maxDimension || cropHeight > maxDimension) {
    if (cropWidth > cropHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((cropHeight * maxDimension) / cropWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((cropWidth * maxDimension) / cropHeight);
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Derive original image storage URL from catalog image URL.
 * Replaces /{item_id}.ext with /{item_id}-original.ext
 */
export function getOriginalImageUrl(url: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  if (url.includes(`/${BUCKET_NAME}/`) && url.includes('/items/')) {
    if (url.includes('-original.')) return url;

    const lastSlash = url.lastIndexOf('/');
    const folder = url.substring(0, lastSlash + 1);
    const filename = url.substring(lastSlash + 1);

    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex !== -1) {
      const nameWithoutExt = filename.substring(0, dotIndex);
      const ext = filename.substring(dotIndex);
      return `${folder}${nameWithoutExt}-original${ext}`;
    }
  }

  return url;
}

/**
 * Resizes and compresses large images client-side before uploading.
 * Max dimension: 1600px on the longest side.
 */
export async function optimizeImage(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  if (typeof window === 'undefined') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const width = img.width;
      const height = img.height;

      if (width <= maxDimension && height <= maxDimension && file.size <= 1.5 * 1024 * 1024) {
        return resolve(file);
      }

      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > maxDimension) {
          newHeight = Math.round((height * maxDimension) / width);
          newWidth = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          newWidth = Math.round((width * maxDimension) / height);
          newHeight = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          const resizedFile = new File([blob], file.name, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Helper to extract relative storage path from a full Supabase Public URL.
 */
export function extractStoragePathFromUrl(url: string, bucket = BUCKET_NAME): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const searchString = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(searchString);
    if (index !== -1) {
      return url.substring(index + searchString.length);
    }

    const altSearchString = `/${bucket}/`;
    const altIndex = url.indexOf(altSearchString);
    if (altIndex !== -1) {
      const extracted = url.substring(altIndex + altSearchString.length);
      if (extracted.includes('/items/')) {
        return extracted;
      }
    }
  } catch (e) {
    console.error('Error parsing storage URL:', e);
  }

  return null;
}

/**
 * Uploads original and cropped catalog image to Supabase Storage:
 * Original: business-assets/{businessId}/items/{itemId}-original.{ext}
 * Catalog:  business-assets/{businessId}/items/{itemId}.{ext}
 */
export async function uploadItemImages(
  businessId: string,
  itemId: string,
  originalFileOrBlob: File | Blob,
  croppedBlob: Blob
): Promise<{ catalogUrl: string; originalUrl: string }> {
  const supabase = createClient();

  let ext = 'jpg';
  if (originalFileOrBlob instanceof File && originalFileOrBlob.name) {
    const rawExt = originalFileOrBlob.name.split('.').pop()?.toLowerCase();
    if (rawExt && ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt)) {
      ext = rawExt;
    }
  } else if (originalFileOrBlob.type === 'image/png') {
    ext = 'png';
  } else if (originalFileOrBlob.type === 'image/webp') {
    ext = 'webp';
  }

  const catalogPath = `${businessId}/items/${itemId}.${ext}`;
  const originalPath = `${businessId}/items/${itemId}-original.${ext}`;

  // 1. Upload original file
  const { error: origErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(originalPath, originalFileOrBlob, {
      cacheControl: '3600',
      upsert: true,
    });

  if (origErr) {
    console.warn('Original image storage upload warning:', origErr);
  }

  // 2. Upload cropped catalog image
  const { error: cropErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(catalogPath, croppedBlob, {
      cacheControl: '3600',
      upsert: true,
    });

  if (cropErr) {
    console.error('Cropped catalog image storage upload error:', cropErr);
    throw new Error(cropErr.message || 'Failed to upload catalog image to storage.');
  }

  const { data: catalogData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(catalogPath);
  const { data: originalData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(originalPath);

  return {
    catalogUrl: catalogData.publicUrl,
    originalUrl: originalData?.publicUrl || catalogData.publicUrl,
  };
}

/**
 * Upload single item image (fallback)
 */
export async function uploadItemImage(
  businessId: string,
  itemId: string,
  file: File
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = createClient();

  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const fileToUpload = await optimizeImage(file);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  const storagePath = `${businessId}/items/${itemId}.${cleanExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    throw new Error(uploadError.message || 'Failed to upload image to storage.');
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error('Failed to generate public URL for uploaded image.');
  }

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

/**
 * Safely deletes both catalog and original files from Supabase Storage for a given businessId.
 */
export async function deleteStorageFileByUrl(url: string, businessId: string): Promise<boolean> {
  const storagePath = extractStoragePathFromUrl(url);
  if (!storagePath) return false;

  if (!storagePath.startsWith(`${businessId}/`)) {
    console.warn(`Tenant isolation warning: Refusing to delete storage file '${storagePath}' not belonging to business '${businessId}'.`);
    return false;
  }

  const pathsToDelete = [storagePath];

  if (!storagePath.includes('-original.')) {
    const dotIdx = storagePath.lastIndexOf('.');
    if (dotIdx !== -1) {
      const origPath = `${storagePath.substring(0, dotIdx)}-original${storagePath.substring(dotIdx)}`;
      pathsToDelete.push(origPath);
    }
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
    if (error) {
      console.error('Error deleting storage files:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete storage files:', err);
    return false;
  }
}

export const deleteItemImagesByUrl = deleteStorageFileByUrl;
