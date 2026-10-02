export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<File | null> {
  const image = await createImage(imageSrc);

  const targetWidth = Math.max(1, Math.round(pixelCrop.width));
  const targetHeight = Math.max(1, Math.round(pixelCrop.height));

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d', { willReadFrequently: true });

  if (!croppedCtx) {
    return null;
  }

  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;
  croppedCtx.imageSmoothingEnabled = true;
  croppedCtx.imageSmoothingQuality = 'high';

  // If no rotation and no flip, crop directly for maximum performance & fidelity
  if (rotation === 0 && !flip.horizontal && !flip.vertical) {
    croppedCtx.drawImage(
      image,
      Math.max(0, Math.round(pixelCrop.x)),
      Math.max(0, Math.round(pixelCrop.y)),
      targetWidth,
      targetHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );
  } else {
    // Rotated / flipped transform canvas
    const rotRad = getRadianAngle(rotation);
    const bBoxWidth =
      Math.abs(Math.cos(rotRad) * image.naturalWidth) + Math.abs(Math.sin(rotRad) * image.naturalHeight);
    const bBoxHeight =
      Math.abs(Math.sin(rotRad) * image.naturalWidth) + Math.abs(Math.cos(rotRad) * image.naturalHeight);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    tempCanvas.width = bBoxWidth;
    tempCanvas.height = bBoxHeight;
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';

    tempCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
    tempCtx.rotate(rotRad);
    tempCtx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    tempCtx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    tempCtx.drawImage(image, 0, 0);

    croppedCtx.drawImage(
      tempCanvas,
      Math.max(0, Math.round(pixelCrop.x)),
      Math.max(0, Math.round(pixelCrop.y)),
      targetWidth,
      targetHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );
  }

  return new Promise((resolve) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], `cropped_${Date.now()}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        } else {
          resolve(null);
        }
      },
      'image/webp',
      0.95
    );
  });
}
