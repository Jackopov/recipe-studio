/**
 * Prepare a photo picked on a phone for local storage: decode, downscale to a
 * reasonable edge length and re-encode as a JPEG data URL. Multi-megabyte
 * camera photos would otherwise blow the localStorage quota and slow the
 * database view down.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.85;
/** Below this size, re-encoding is not worth the quality loss. */
const SKIP_BELOW_BYTES = 400_000;

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(file);
  });
}

export async function photoToDataUrl(file) {
  if (file.type === "image/jpeg" && file.size < SKIP_BELOW_BYTES) {
    return await readAsDataURL(file);
  }

  try {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
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
        return await readAsDataURL(file);
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) return await readAsDataURL(file);

      // Warm paper behind any transparent pixels.
      context.fillStyle = "#F6F3EE";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL("image/jpeg", QUALITY);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    // Anything unexpected — keep the original rather than blocking the save.
    return await readAsDataURL(file);
  }
}
