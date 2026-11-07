/**
 * Source textures: one per live video, GIF frame or backdrop, LINEAR and
 * CLAMP_TO_EDGE, uploaded with the context's pixel store (no flip, straight
 * alpha; source passes flip v themselves).
 */

export function createVjSourceTexture(
  gl: WebGL2RenderingContext,
): WebGLTexture {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

/** Reused by every upload so the frame loop allocates nothing. */
const uploadedSize = { width: 0, height: 0 };

/** Videos, images and VideoFrames report their decoded size; the rest report width and height. */
function readVjFrameSize(frame: TexImageSource): void {
  if ("videoWidth" in frame) {
    uploadedSize.width = frame.videoWidth;
    uploadedSize.height = frame.videoHeight;
  } else if ("naturalWidth" in frame) {
    uploadedSize.width = frame.naturalWidth;
    uploadedSize.height = frame.naturalHeight;
  } else if ("displayWidth" in frame) {
    uploadedSize.width = frame.displayWidth;
    uploadedSize.height = frame.displayHeight;
  } else {
    uploadedSize.width = frame.width;
    uploadedSize.height = frame.height;
  }
}

/**
 * Uploads one frame and answers its size, or null when the frame has no
 * pixels yet (a video before its first decoded frame, an image still loading)
 * or the upload threw (a cross-origin or detached source). The answered
 * object is shared across calls: copy its numbers before the next upload.
 */
export function uploadVjFrame(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  frame: TexImageSource,
): { width: number; height: number } | null {
  readVjFrameSize(frame);
  if (uploadedSize.width <= 0 || uploadedSize.height <= 0) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, frame);
  } catch {
    return null;
  } finally {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  return uploadedSize;
}
