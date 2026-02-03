const CLOUDINARY_CLOUD_NAME = "drsamqwk7";
const CLOUDINARY_UPLOAD_PRESET = "ProjectBolt";

interface CloudinaryResponse {
    secure_url: string;
    [key: string]: any;
}

/**
 * Uploads an image to Cloudinary
 * @param uri - Local URI of the image to upload
 * @returns The secure URL of the uploaded image
 */
export async function uploadImage(uri: string): Promise<string> {
    const formData = new FormData();

    const filename = uri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : "image/jpeg";

    if (type === "image/jpg") type = "image/jpeg";

    console.log("Preparing Cloudinary Upload:");
    console.log(`  URI: ${uri}`);
    console.log(`  Type: ${type}`);
    console.log(`  Preset: ${CLOUDINARY_UPLOAD_PRESET}`);

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    if (uri.startsWith("data:image")) {
        // Web: Base64 data URI
        console.log("Cloudinary Upload: Detected Base64 (Web/Data URI). Sending as string.");
        formData.append("file", uri);
    } else if (uri.startsWith("blob:")) {
        // Web: Blob URL from expo-image-picker on web
        console.log("Cloudinary Upload: Detected Blob URL (Web). Fetching and sending as File.");
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `photo_${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
        formData.append("file", file);
    } else {
        // Native (iOS/Android): File URI
        console.log("Cloudinary Upload: Detected File URI (Native). Sending as file object.");
        // @ts-ignore
        formData.append("file", {
            uri,
            name: filename,
            type,
        });
    }

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Cloudinary upload failed!");
            console.error(`Status: ${response.status}`);
            console.error(`Body: ${errorText}`);
            throw new Error(`Cloudinary Error: ${response.status} ${errorText}`);
        }

        const data: CloudinaryResponse = await response.json();
        console.log("Cloudinary success:", data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error("Upload network error:", error);
        throw error;
    }
}