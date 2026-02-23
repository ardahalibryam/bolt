import * as ImageManipulator from "expo-image-manipulator";

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.8;

/**
 * Compresses and resizes an image to ensure it's under 5MB.
 * - Resizes to max 1600px width (maintains aspect ratio)
 * - Converts to JPEG at 0.8 quality
 * @param uri - Local URI of the original image
 * @returns URI of the compressed image
 */
export async function compressImage(uri: string): Promise<string> {
    const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_WIDTH } }],
        { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
}
