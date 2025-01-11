import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME! as string,
  api_key: process.env.CLOUDINARY_API_KEY! as string,
  api_secret: process.env.CLOUDINARY_API_SECRET! as string,
});

const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    console.log(localFilePath);
    
    if (!localFilePath) return null;
    const uploadOptions: UploadApiOptions = {
      public_id: localFilePath.split("\\").pop()?.split(".")[0],
      resource_type: "auto",
    };
    const response = await cloudinary.uploader.upload(
      localFilePath,
      uploadOptions
    );
    console.log(response);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Cloudinary Error:", error);
    return null;
  }
};

export default uploadOnCloudinary;
