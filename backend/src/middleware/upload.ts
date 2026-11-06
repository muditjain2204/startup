import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
const evidenceDir = path.join(uploadDir, 'evidence');
const docsDir = path.join(uploadDir, 'docs');
const updatesDir = path.join(uploadDir, 'updates');

[uploadDir, evidenceDir, docsDir, updatesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'document') {
      cb(null, docsDir);
    } else if (file.fieldname === 'updatePhoto') {
      cb(null, updatesDir);
    } else {
      cb(null, evidenceDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for video/photos
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|mp4|mov|webm|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, MP4, MOV, and PDF are allowed.'));
    }
  },
});

