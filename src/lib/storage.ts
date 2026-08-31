import { createClient } from '@/lib/supabase/client';

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
 * Resizes and compresses large images client-side before uploading.
 * Max dimension: 1600px on the longest side.
 */
export async function optimizeImage(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  // If browser environment or image element is available
  if (typeof window === 'undefined') return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const width = img.width;
      const height = img.height;

      // If dimensions are within limit and file size is reasonable, keep original
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
      resolve(file); // Fallback to original if image load fails
    };

    img.src = objectUrl;
  });
}

/**
 * Helper to extract relative storage path from a full Supabase Public URL.
 * e.g., "https://xyz.supabase.co/storage/v1/object/public/business-assets/BIZ_ID/items/ITEM_ID.jpg"
 * -> "BIZ_ID/items/ITEM_ID.jpg"
 */
export function extractStoragePathFromUrl(url: string, bucket = BUCKET_NAME): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const searchString = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(searchString);
    if (index !== -1) {
      return url.substring(index + searchString.length);
    }

    // Alternative pattern if path is bucket relative
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
 * Uploads an item image to Supabase Storage in path:
 * business-assets/{businessId}/items/{itemId}.{ext}
 */
export async function uploadItemImage(
  businessId: string,
  itemId: string,
  file: File
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = createClient();

  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  // Optimize
  const fileToUpload = await optimizeImage(file);

  // Extract extension
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  const storagePath = `${businessId}/items/${itemId}.${cleanExt}`;

  // Upload to Supabase Storage bucket
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

  // Retrieve public URL
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
 * Safely deletes a file from Supabase Storage if it belongs to the given businessId.
 */
export async function deleteStorageFileByUrl(url: string, businessId: string): Promise<boolean> {
  const storagePath = extractStoragePathFromUrl(url);
  if (!storagePath) return false;

  // Strict tenant isolation safety check: Ensure storagePath starts with businessId/
  if (!storagePath.startsWith(`${businessId}/`)) {
    console.warn(`Tenant isolation warning: Refusing to delete storage file '${storagePath}' not belonging to business '${businessId}'.`);
    return false;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) {
      console.error('Error deleting storage file:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete storage file:', err);
    return false;
  }
}
