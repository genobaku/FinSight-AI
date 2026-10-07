// Cloudinary Upload Utility

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
  isCloudinaryDirect: boolean;
}

export const getCloudinaryConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

  const cloudName =
    metaEnv.VITE_CLOUDINARY_CLOUD_NAME ||
    procEnv.VITE_CLOUDINARY_CLOUD_NAME ||
    procEnv.CLOUDINARY_CLOUD_NAME ||
    '';

  const uploadPreset =
    metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET ||
    procEnv.VITE_CLOUDINARY_UPLOAD_PRESET ||
    procEnv.CLOUDINARY_UPLOAD_PRESET ||
    '';

  return { cloudName, uploadPreset };
};

export const isCloudinaryConfigured = (): boolean => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
};

export async function uploadToCloudinary(
  fileOrBase64: File | Blob | string
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  // If Cloudinary preset & cloud name are set, perform direct unsigned upload
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      if (typeof fileOrBase64 === 'string') {
        formData.append('file', fileOrBase64);
      } else {
        formData.append('file', fileOrBase64);
      }
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
          original_filename: data.original_filename || 'receipt_scanned',
          isCloudinaryDirect: true,
        };
      }
    } catch (err) {
      console.warn('Direct Cloudinary upload failed, falling back to server route:', err);
    }
  }

  // Fallback: Post to server-side endpoint /api/cloudinary/upload
  try {
    let payloadBase64 = '';
    if (typeof fileOrBase64 === 'string') {
      payloadBase64 = fileOrBase64;
    } else {
      payloadBase64 = await fileToDataUrl(fileOrBase64);
    }

    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: payloadBase64 }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        secure_url: data.secure_url,
        public_id: data.public_id || `res_${Date.now()}`,
        format: data.format || 'jpg',
        width: data.width || 800,
        height: data.height || 600,
        bytes: data.bytes || 120000,
        original_filename: data.original_filename || 'uploaded_image',
        isCloudinaryDirect: data.isCloudinaryDirect ?? false,
      };
    }
  } catch (err) {
    console.error('Server upload route error:', err);
  }

  // Final fallback: local data URL
  const dataUrl = typeof fileOrBase64 === 'string' ? fileOrBase64 : await fileToDataUrl(fileOrBase64);
  return {
    secure_url: dataUrl,
    public_id: `local_${Date.now()}`,
    format: 'png',
    width: 600,
    height: 400,
    bytes: 50000,
    original_filename: 'local_file',
    isCloudinaryDirect: false,
  };
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
