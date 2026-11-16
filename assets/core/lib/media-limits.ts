export const MAX_IMAGE_BYTES = 7 * 1024 * 1024;
export const MAX_IMAGE_BASE64_LENGTH = 4 * Math.ceil(MAX_IMAGE_BYTES / 3);
// Allow the encoded image plus filename, category and alternative text.
export const MAX_MEDIA_REQUEST_BYTES = MAX_IMAGE_BASE64_LENGTH + 16 * 1024;
