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
    const rawExt = path.extname(file.originalname).toLowerCase();
    let ext = rawExt;
    if (!ext) {
      if (file.mimetype.startsWith('video/')) {
        ext = '.mp4';
      } else if (file.mimetype === 'application/pdf') {
        ext = '.pdf';
      } else {
        ext = '.jpg';
      }
    }
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit to comfortably allow road survey videos
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const isPdf = file.mimetype === 'application/pdf';
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const allowedExts = /^(jpeg|jpg|png|webp|gif|bmp|mp4|mov|webm|avi|mkv|m4v|3gp|pdf)$/i;

    if (isImage || isVideo || isPdf || allowedExts.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Please upload road photographs (JPEG, PNG, WEBP) or videos (MP4, MOV, WEBM, AVI, 3GP).'));
    }
  },
});

