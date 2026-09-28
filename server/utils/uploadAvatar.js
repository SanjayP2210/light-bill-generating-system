import crypto from 'crypto';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isCloudinaryConfigured = () =>
    Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

// Signed upload through Cloudinary's REST API (no SDK dependency).
// Signature = sha1 of the alphabetically sorted params + API secret.
const uploadToCloudinary = async (file, userId) => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    const params = {
        folder: 'litebill/avatars',
        overwrite: 'true',
        public_id: String(userId),
        timestamp: String(Math.floor(Date.now() / 1000)),
    };
    const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
    const signature = crypto.createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex');

    const form = new FormData();
    form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    Object.entries(params).forEach(([k, v]) => form.append(k, v));
    form.append('api_key', CLOUDINARY_API_KEY);
    form.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result?.error?.message || 'Avatar upload failed');
    }
    return result.secure_url;
};

// Local-disk fallback for development. Not usable on Vercel, whose
// filesystem is read-only.
const saveToDisk = async (file, userId) => {
    const dir = path.join(__dirname, '../uploads/avatars');
    await fs.mkdir(dir, { recursive: true });
    const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    await fs.writeFile(path.join(dir, fileName), file.buffer);
    return `/uploads/avatars/${fileName}`;
};

// Stores the uploaded avatar and returns the URL to save on the user:
// an absolute Cloudinary URL, or a server-relative /uploads/... path.
const uploadAvatar = async (file, userId) => {
    if (isCloudinaryConfigured()) {
        return uploadToCloudinary(file, userId);
    }
    if (process.env.VERCEL) {
        throw new Error('Avatar storage is not configured on the server');
    }
    return saveToDisk(file, userId);
};

export default uploadAvatar;
