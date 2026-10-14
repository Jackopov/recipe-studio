/**
 * Prepare a photo picked on a phone for the web: decode, downscale to a
 * reasonable edge length and re-encode as JPEG. Multi-megabyte camera photos
 * would otherwise be slow to upload and heavy to display on mobile data.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.85;
/** Below this size, re-encoding is not worth the quality loss. */
const SKIP_BELOW_BYTES = 400_000;

export async function prepareImage(file: File): Promise<Blob> {
  if (file.type === "image/jpeg" && file.size < SKIP_BELOW_BYTES) {
    return file;
  }

  try {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Could not read the photo."));
        element.src = url;
      });

      const scale = Math.min(
        1,
        MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
      );
      if (scale === 1 && file.type === "image/jpeg" && file.size < 1_200_000) {
        return file;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) return file;

      // Warm paper behind any transparent pixels.
      context.fillStyle = "#F6F3EE";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", QUALITY),
      );
      return blob ?? file;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    // Anything unexpected — send the original rather than blocking the save.
    return file;
  }
}
