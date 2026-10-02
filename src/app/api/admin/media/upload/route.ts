// ─── Admin Media Upload API ───────────────────────────────────────────────────
// POST /api/admin/media/upload — securely upload to Cloudinary
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/errors/handler';

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    const cropParamsRaw = formData.get('cropParams') as string | null;

    if (!file) {
      return NextResponse.json({ error: { message: 'No file provided' } }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let transformation: any = undefined;
    let cropTransformStr = '';

    if (cropParamsRaw) {
      try {
        const cropParams = JSON.parse(cropParamsRaw);
        const transforms: any[] = [];
        const transformParts: string[] = [];

        if (cropParams.rotation) {
          transforms.push({ angle: cropParams.rotation });
          transformParts.push(`a_${cropParams.rotation}`);
        }
        
        if (
          cropParams.x !== undefined &&
          cropParams.y !== undefined &&
          cropParams.width &&
          cropParams.height
        ) {
          const x = Math.max(0, Math.round(cropParams.x));
          const y = Math.max(0, Math.round(cropParams.y));
          const w = Math.max(10, Math.round(cropParams.width));
          const h = Math.max(10, Math.round(cropParams.height));

          transforms.push({
            crop: 'crop',
            gravity: 'north_west',
            x,
            y,
            width: w,
            height: h,
          });
          transformParts.push(`c_crop,g_north_west,x_${x},y_${y},w_${w},h_${h}`);
        } else if (cropParams.aspectRatio) {
          transforms.push({
            crop: 'fill',
            aspect_ratio: cropParams.aspectRatio,
          });
          transformParts.push(`c_fill,ar_${cropParams.aspectRatio}`);
        }

        if (transforms.length > 0) {
          transformation = transforms;
          cropTransformStr = transformParts.join('/');
        }
      } catch (e) {
        console.warn('Failed to parse cropParams for upload', e);
      }
    }

    const isVideo = file.type.startsWith('video/');

    // Upload to Cloudinary using a stream
    const result: any = await new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: 'majhi_vastu_properties',
        resource_type: isVideo ? 'video' : 'auto',
      };

      if (transformation) {
        uploadOptions.transformation = transformation;
        if (isVideo) {
          uploadOptions.eager = transformation;
          uploadOptions.eager_async = false;
        }
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // If it's a video with crop transformations, make sure secure_url reflects the crop transformation
    if (isVideo && cropTransformStr && result.secure_url) {
      if (result.eager && result.eager.length > 0 && result.eager[0].secure_url) {
        result.secure_url = result.eager[0].secure_url;
      } else {
        // Inject transformation into Cloudinary secure_url: /upload/<transform>/v...
        result.secure_url = result.secure_url.replace(
          /\/upload\/(?:v\d+\/)?/,
          (match: string) => `/upload/${cropTransformStr}/${match.includes('v') ? match.substring(8) : ''}`
        );
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
