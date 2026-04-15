import { asyncHandler } from "../utils/asynchandler.js";
import { Comment } from "../models/comment.models.js";
import { APIresponse } from "../utils/Apiresponse.js";
import { APIerror } from "../utils/Apierror.js";
import mongoose, { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if(!isValidObjectId(videoId))
    {
        throw new APIerror(400,"Invalid Object Id");
    }
    const comment = await Comment.find(
        {
            video : videoId
        }
    )
    .skip((page-1)*limit)
    .limit(limit)

    if(comment === 0)
    {
        throw new APIerror(400,"Error in the fetching comments");
    }
    return res
            .status(200)
            .json(
                new APIresponse(200,comment,"Comments fetched successfully")
            )
})
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid video ID");
    }
    if (!content) {
        throw new APIerror(400, "Content is neccessary");
    }
    const comment = await Comment.create(
        {
            content,
            video: new mongoose.Types.ObjectId(videoId),
            owner: new mongoose.Types.ObjectId(req.user?._id),
        }
    )
    if (!comment) {
        throw new APIerror(400, "Error in the creation of comment");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, comment, "Comment added on video successfully")
        )

})
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid object ID");
    }
    if (!content) {
        throw new APIerror(400, "Content is required");
    }
    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id,
        },
        {
            content
        },
        {
            new: true
        }
    )
    if (!comment) {
        throw new APIerror(400, "Error in the updation of the comment");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, comment, "Comment updated successfully")
        )
})
const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new APIerror(400, "Invalid Object id");
    }
    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id
    });
    if (!comment) {
        throw new APIerror(400, "Error in the deletion of the comment");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, comment, "Comment deleted successfully")
        )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}