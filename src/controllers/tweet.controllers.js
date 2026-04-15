import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { APIerror} from "../utils/Apierror.js"
import { APIresponse } from "../utils/Apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.create(
        {
            content,
            owner: new mongoose.Types.ObjectId(req.user?._id)
        }
    )
    if (!tweet) {
        throw new APIerror(400, "Error in the creation of the tweet");
    }
    return res
        .status(201)
        .json(
            new APIresponse(201, tweet, "Tweet created successfully")
        )
})
const getUserTweets = asyncHandler(async (req, res) => {

    const{userId} = req.params;
    if(!isValidObjectId(userId))
    {
        throw new APIerror(400,"Invalid user id");
    }
   const user  = await User.aggregate([
       
         {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
         },
         {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets",
            }
         }
         
   ])
   if(!user || user.length === 0)
   {
     throw new APIerror(404, "User not found");
   }
    return res
        .status(200)
        .json(new APIresponse(200, user[0].tweets, "User tweets fetched successfully"))

})
const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const{tweetID} = req.params;
    if (!content) {
        throw new APIerror(400, "Content is neccessary");
    }
    if(!isValidObjectId(tweetID))
    {
        throw new APIerror(400,"Invalid tweet id");
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetID,
        {
            content,
        },
        {
            new: true
        }
    )
    if (!tweet) {
        throw new APIerror(404, "Tweet not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, tweet, "Tweet updated successfully")
        )
})
const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetID } = req.params;
    if (!tweetID) {
        throw new APIerror(400, "Tweet id is neccessary");
    }
    if(!isValidObjectId(tweetID))
    {
        throw new APIerror(400,"Invalid object id");
    }
    const tweet = await Tweet.findByIdAndDelete(
        tweetID,
    )
    if (!tweet) {
        throw new APIerror(400, "Error in the deletion of the tweet");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, tweet, "Tweet deleted successfully")
        )
})
export 
{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}