import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/appError';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

type UploadOptions = {
  folder?: string;
  maxFiles?: number;
};

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const;

const ALLOWED_IMAGE_MIME_TYPE_SET = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

const detectImageMimeType = (buffer: Buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) return 'image/png';
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) return 'image/gif';
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) return 'image/webp';

  return undefined;
};

export const validateImageFiles = (files: Express.Multer.File[], maxFiles = 3): void => {
  if (files.length > maxFiles) {
    throw new AppError('INVALID_FILE', `Chỉ cho phép tải lên tối đa ${maxFiles} ảnh`, 400);
  }

  const maxSize = 5 * 1024 * 1024;
  for (const file of files) {
    if (file.size > maxSize) {
      throw new AppError('INVALID_FILE', `File ${file.originalname} vượt quá dung lượng 5MB`, 400);
    }
    if (!ALLOWED_IMAGE_MIME_TYPE_SET.has(file.mimetype)) {
      throw new AppError('INVALID_FILE', `File ${file.originalname} không thuộc định dạng ảnh được phép`, 400);
    }

    const detectedMimeType = detectImageMimeType(file.buffer);
    if (!detectedMimeType) {
      throw new AppError('INVALID_FILE', `File ${file.originalname} không có nội dung ảnh hợp lệ`, 400);
    }
    if (detectedMimeType !== file.mimetype) {
      throw new AppError('INVALID_FILE', `File ${file.originalname} không khớp với loại tệp đã khai báo`, 400);
    }
  }
};

export const uploadImages = async (files: Express.Multer.File[], options: UploadOptions = {}): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  validateImageFiles(files, options.maxFiles || 3);

  const uploadPromises = files.map(file => new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'tung-thien/feedbacks',
        transformation: [{ width: 1024, height: 1024, crop: 'limit', quality: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        return reject(new AppError('UPLOAD_FAILED', 'Không thể tải ảnh lên lúc này', 500));
      }
    );
    uploadStream.end(file.buffer);
  }));

  return Promise.all(uploadPromises);
};
