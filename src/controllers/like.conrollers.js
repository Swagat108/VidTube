import { asyncHandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/Apierror.js";
import { APIresponse } from "../utils/Apiresponse.js";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid object Id");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIerror(404, "Video not found");
    }
    const likedVideo = await Like.findOne({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })
    if (likedVideo) {
        await Like.findOneAndDelete({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
        return res
            .status(200)
            .json(
                new APIresponse(200, "Video unliked successfully")
            )
    }
    await Like.create({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })
    return res
        .status(200)
        .json(
            new APIresponse(200, "Video liked successfully")
        )
})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid object Id");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new APIerror(404, "Comment not found");
    }

    const likedComment = await Like.findOne({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (likedComment) {
        await Like.findOneAndDelete({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
        return res
            .status(200)
            .json(
                new APIresponse(200, "Comment unliked successfully")
            )
    }
    await Like.create({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })
    return res
        .status(200)
        .json(
            new APIresponse(200, "Comment liked successfully")
        )
})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new APIerror(400, "Invalid object Id");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new APIerror(404, "Tweet not found");
    }

    const likedTweet = await Like.findOne({
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })
    if (likedTweet) {
        await Like.findOneAndDelete({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
        return res
            .status(200)
            .json(
                new APIresponse(200, "Tweet unliked successfully")
            )
    }
    await Like.create({
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })
    return res
        .status(200)
        .json(
            new APIresponse(200, "Tweet liked successfully")
        )

})
const getLikedVideos = asyncHandler(async (req, res) => {

    const videos = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos",
                    pipeline: [
                        {
                            $project: {
                                videoFile: 1,
                                thumbnail: 1,
                                title: 1,
                                description: 1,
                                views: 1,
                            }
                        }
                    ]
                }
            }
        ]
    )
    if (!videos || videos.length == 0) {
        throw new APIerror(404, "Videos not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, videos, "Liked videos fetched successfully")
        )
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

