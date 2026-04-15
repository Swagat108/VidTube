import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { APIerror } from "./Apierror.js";

dotenv.config({
    path : "./.env"
});

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {

    try {
        if (!localFilePath)
            {
                throw new APIerror(400,"Local file path is not found");
            };
        const response = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: "auto",
        }
    )
        console.log("File uploaded on cloudinary");
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed !",error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
       throw new APIerror(400,"Cloudinary upload failed");
    }
}

const deleteFromCloudinary = async (publicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.log("Error in the deletion of the file from the cloudinary",error);
        return null
    }
}
export { uploadOnCloudinary,deleteFromCloudinary };