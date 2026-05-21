import multer from 'multer';
import path from 'path';

/**
 * File upload middleware using multer
 * ตาม README.md Security spec: Type/size validation
 */
const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`ไฟล์ประเภท ${file.mimetype} ไม่รองรับ อนุญาตเฉพาะ JPEG, PNG, WebP, PDF`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5, // max 5 files
  },
});
