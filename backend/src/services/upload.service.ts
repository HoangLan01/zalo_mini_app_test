// src/services/upload.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const validateImageFiles = (files: Express.Multer.File[]): void => {
  if (files.length > 3) {
    throw new Error('Chỉ cho phép tải lên tối đa 3 ảnh');
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      throw new Error(`File ${file.originalname} vượt quá dung lượng 5MB`);
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new Error(`File ${file.originalname} không phải là định dạng ảnh`);
    }
  }
};

export const uploadImages = async (files: Express.Multer.File[]): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  validateImageFiles(files);

  const uploadPromises = files.map(file => {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'tung-thien/feedbacks',
          transformation: [{ width: 1024, height: 1024, crop: 'limit', quality: 'auto' }]
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
          reject(new Error('Lỗi không xác định khi upload'));
        }
      );
      uploadStream.end(file.buffer);
    });
  });

  return Promise.all(uploadPromises);
};
