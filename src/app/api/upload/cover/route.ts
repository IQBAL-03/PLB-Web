import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif', '.jfif']);

function isSupportedImageBytes(buf: Buffer, filename: string, mimeType: string): boolean {
  if (mimeType.startsWith('image/')) return true;

  // Magic byte checks for PNG, JPEG, GIF, WEBP, and ISO-BMFF (AVIF/HEIC)
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf.length >= 6 && buf.subarray(0, 4).toString('ascii') === 'GIF8') return true;
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return true;
  }
  if (buf.length >= 12 && buf.subarray(4, 8).toString('ascii') === 'ftyp') return true;

  const dotIdx = filename.lastIndexOf('.');
  const ext = dotIdx >= 0 ? filename.slice(dotIdx).toLowerCase() : '';
  return ALLOWED_EXT.has(ext);
}

export async function POST(req: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Layanan unggah gambar belum dikonfigurasi di server.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = (formData.get('cover') || formData.get('file')) as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Berkas foto sampul wajib disertakan.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran foto melebihi batas maksimal 2 MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran foto melebihi batas maksimal 2 MB.' },
        { status: 400 }
      );
    }

    if (!isSupportedImageBytes(buffer, file.name || '', file.type || '')) {
      return NextResponse.json(
        { success: false, error: 'Hanya berkas foto (PNG, JPG, WEBP) yang diizinkan.' },
        { status: 400 }
      );
    }

    const folder = 'sisperpus/covers';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const uploadPayload = new FormData();
    uploadPayload.append('file', new Blob([buffer], { type: file.type || 'image/png' }), file.name || 'cover.png');
    uploadPayload.append('api_key', apiKey);
    uploadPayload.append('timestamp', timestamp);
    uploadPayload.append('folder', folder);
    uploadPayload.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadPayload,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.secure_url) {
      return NextResponse.json(
        { success: false, error: data?.error?.message || 'Gagal mengunggah gambar ke penyimpanan.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id || '',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat mengunggah foto.' },
      { status: 500 }
    );
  }
}
