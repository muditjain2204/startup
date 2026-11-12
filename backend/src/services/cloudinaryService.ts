import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else if (process.env.CLOUDINARY_URL) {
  // Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
  const cleanUrl = process.env.CLOUDINARY_URL.trim();
  if (cleanUrl.startsWith('cloudinary://')) {
    process.env.CLOUDINARY_URL = cleanUrl;
  }
}

export const isCloudinaryReady = (): boolean => {
  return !!(
    (cloudName && apiKey && apiSecret) ||
    (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.trim().startsWith('cloudinary://'))
  );
};

/**
 * Uploads a local file to Cloudinary and returns its secure HTTPS URL.
 * Falls back to null if Cloudinary is not configured or encounters an issue.
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder = 'smartroad_evidence'
): Promise<string | null> => {
  if (!isCloudinaryReady()) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      timeout: 120000,
    });
    return result.secure_url;
  } catch (err: any) {
    console.warn('⚠️ [Cloudinary] Upload to cloud failed, using local file path fallback:', err.message);
    return null;
  }
};

