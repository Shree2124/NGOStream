import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME! as string,
  api_key: process.env.CLOUDINARY_API_KEY! as string,
  api_secret: process.env.CLOUDINARY_API_SECRET! as string,
});

const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    console.log("Uploading file:", localFilePath);

    if (!localFilePath) return null;

    const fileExtension = path.extname(localFilePath).slice(1).toLowerCase();
    const fileName = path.basename(localFilePath, path.extname(localFilePath));

    let resourceType: "auto" | "image" | "video" | "raw" = "auto";

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const videoExtensions = ["mp4", "mov", "avi", "mkv"];
    const pdfExtensions = ["pdf"];

    if (imageExtensions.includes(fileExtension)) {
      resourceType = "image";
    } else if (videoExtensions.includes(fileExtension)) {
      resourceType = "video";
    } else if (pdfExtensions.includes(fileExtension)) {
      resourceType = "raw"; // PDF should be uploaded as raw file type
    }

    const uploadOptions: UploadApiOptions = {
      public_id: fileName,
      resource_type: resourceType,
    };

    const response = await cloudinary.uploader.upload(
      localFilePath,
      uploadOptions
    );
    console.log("Cloudinary upload response:", response);

    // Clean up the local file after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Clean up the local file in case of error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary Error:", error);
    return null;
  }
};

export default uploadOnCloudinary;
