import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIresponse } from "../utils/APIresponse.js";

import { APIerror } from "../utils/Apierror.js";

import { User } from "../models/user.models.js";

const getChannelStats = asyncHandler(async (req, res) => {

    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videos",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes",
                }
            },
            {
                $addFields: {
                    TotalLikes: {
                        $size: "$likes"
                    },
                    TotalVideos: {
                        $size: "$videos"
                    },
                    TotalSubscribers: {
                        $size: "$subscribers"
                    },
                    TotalViews: {
                        $sum: "$videos.views"
                    }

                }
            },
            {
                $project: {
                    videos: 0,
                    subscribers: 0,
                    likes: 0
                }
            }

        ]
    )

    if (!user || user.length == 0) {
        throw new APIerror(404, "Dashboard not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, user[0], "Dashboard fetched successfully")
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {


    const videos = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
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
                            $project: {
                                title: 1,
                                description: 1,
                                views: 1,
                                duration: 1,
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    videos: 1
                }
            }
        ]
    )

    if (!videos || videos.length == 0) {
        throw new APIerror(404, "Videos are not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, videos[0].videos, "Videos of owner are fetched successfully")
        )
})


export {
    getChannelStats,
    getChannelVideos
}

