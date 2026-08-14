import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Ensure uploads directory exists on Render / Vercel
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : 'uploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });
export default upload;