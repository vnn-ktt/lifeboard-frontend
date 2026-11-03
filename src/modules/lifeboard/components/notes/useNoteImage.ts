/** Browser-only image helper; limit storage usage before embedding in local JSON backup. */
const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 450_000;
const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function compressNoteImage(file: File): Promise<string> {
  if (!SUPPORTED_TYPES.has(file.type)) throw new Error('image-type');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('image-size');

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('image-read'));
      image.src = objectUrl;
    });

    if (!image.naturalWidth || !image.naturalHeight) throw new Error('image-read');
    for (const maxDimension of [1100, 800, 600]) {
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('image-read');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL('image/jpeg', maxDimension === 1100 ? 0.78 : 0.65);
      if (result.length <= MAX_DATA_URL_LENGTH) return result;
    }
    throw new Error('image-size');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
