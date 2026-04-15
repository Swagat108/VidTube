import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/Apierror.js";
import { APIresponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.models.js";

import { Video } from "../models/video.models.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => 
{
    let { page = 1, limit = 10, sortBy, sortType, userId } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!userId) 
    {
        throw new APIerror(400, "UserId is required");
    }
    if(!isValidObjectId(userId))
    {
        throw new APIerror(400,"Invalid Object Id");
    }
    const videos = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $match: {
                            isPublished: true
                        }
                    },
                    {
                        $sort: {
                            [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
                        }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]
            }
        }
    ])

    if (videos.length == 0 || videos[0].videos.length == 0) {
        throw new APIerror(404, "Videos not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, videos[0].videos, "All videos fetched successfully")
        )
})
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const videoPath =req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!videoPath) {
        throw new APIerror(400, "Video path is neccessary");
    }
    const uploadedvideo = await uploadOnCloudinary(videoPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!uploadedvideo) {
        throw new APIerror(400, "Error in the uploadation of the video");
    }
    if(!uploadedThumbnail) {
        throw new APIerror(400, "Error in the uploadation of the thumbnail");
    }
    const video = await Video.create(
        {
            videoFile: uploadedvideo.url,
            duration: uploadedvideo.duration,
            thumbnail: uploadedThumbnail.url,
            title,
            description,
            isPublished: true,
            owner: new mongoose.Types.ObjectId(req.user?._id)
        }
    )

    if (!video) {
        throw new APIerror(400, "Error in the publish of the video");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video published successfully")
        )
})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new APIerror(400, "Video ID is required");
    }
    if (!isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid Object Id");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video fetched successfully")
        )
})
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnail = req.file?.path;
    if (!isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid Object ID");
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description,
            thumbnail,
        },
        {
            new: true
        }
    )
    if (!video) {
        throw new APIerror(404, "Video not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video updated successfully")
        )
})
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid Object ID");
    }
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new APIerror(400, "Error in the deletion of the video");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video deleted successfully")
        )
})
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid Object ID");

    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new APIresponse(200, video, "Video publish status toggled successfully")
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}