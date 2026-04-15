
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { APIerror} from "../utils/Apierror.js";
import { APIresponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const{ channelId } = req.params;
        if(!isValidObjectId(channelId))
        {
            throw new APIerror(400, "Invalid channel id");
        }
        const channel = await User.findById(channelId);

        if(!channel)
        {
            throw new APIerror(404, "Channel not found");
        }
        const subscriberId = req.user._id;
        const subscription = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });          
        if(subscription)
        {
            await Subscription.findByIdAndDelete(subscription._id);
            return res.status(200).json(new APIresponse(200, null, "Unsubscribed successfully"));
        }   
        await Subscription.create({ subscriber: subscriberId, channel: channelId });
        return res.status(200).json(new APIresponse(200, null, "Subscribed successfully"));
    })
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const{ channelId } = req.params
    if(!isValidObjectId(channelId))
    {
        throw new APIerror(400,"Invalid Object Id");
    }
    const subscribers = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
                pipeline : [
                    {
                        $project : {
                            subscriber : 1,
                            _id : 0,
                        }
                    }
                ]
            }
        }
    ])
    if(subscribers.length === 0)
    {
        throw new APIerror(404, "No subscribers found");
    }

    return res.status(200).json(new APIresponse(200, subscribers[0].subscribers, "Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId))
    {
        throw new APIerror(400,"Invalid Object Id");
    }
    const channels = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannels",
                pipeline: [
                    {
                        $project: {
                            subscriber: 1,
                            _id: 0,
                            username: 1,
                            email: 1,
                            fullName: 1,
                        }
                    }
                ]
            }

        }
    ])
    if(channels.length === 0)
    {
        throw new APIerror(404, "No subscribed channels found");
    }
    return res.status(200).json(new APIresponse(200, channels[0].subscribedChannels, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
}


