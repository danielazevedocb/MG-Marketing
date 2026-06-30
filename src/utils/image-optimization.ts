// Otimização de imagens no servidor (sharp) — reduz peso antes do upload ao R2.
import sharp from "sharp";

export type ImageOptimizationOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export type OptimizedImage = {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  size: number;
};

const DEFAULT_MAX_DIMENSION = 2048;
const DEFAULT_QUALITY = 85;

const OPTIMIZABLE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isOptimizableImage(mimeType: string): boolean {
  return OPTIMIZABLE_MIME_TYPES.has(mimeType);
}

/// Redimensiona e comprime imagens raster; SVG e demais tipos passam sem alteração.
export async function optimizeImage(
  input: Buffer,
  mimeType: string,
  options: ImageOptimizationOptions = {},
): Promise<OptimizedImage> {
  if (!isOptimizableImage(mimeType)) {
    return {
      buffer: input,
      mimeType,
      width: 0,
      height: 0,
      size: input.byteLength,
    };
  }

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_DIMENSION;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const pipeline = sharp(input, { animated: mimeType === "image/gif" })
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

  let outputBuffer: Buffer;
  let outputMime = mimeType;

  if (mimeType === "image/png") {
    outputBuffer = await pipeline
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true })
      .then(({ data }) => data);
    outputMime = "image/webp";
  } else if (mimeType === "image/jpeg") {
    outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
  } else if (mimeType === "image/webp") {
    outputBuffer = await pipeline.webp({ quality }).toBuffer();
  } else {
    outputBuffer = await pipeline.toBuffer();
  }

  const metadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    mimeType: outputMime,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    size: outputBuffer.byteLength,
  };
}
