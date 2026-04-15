import { asyncHandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/Apierror.js";
import { APIresponse } from "../utils/Apiresponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new APIerror(404, "User not found");
        }
        let refreshToken = user.generateRefreshToken();
        let accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIerror(500, "Something went wrong in the generation of the access and refresh tokens");
    }
}
const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new APIerror(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existingUser) {
        throw new APIerror(400, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new APIerror(400, "Avatar local path is neccessary");
    }
    let avatar;
    try {

        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Avatar is uploaded successfully on cloudinary", avatar);

    } catch (error) {
        console.log("There is an error in the uploadation in the avatar image", error);
        throw new APIerror(400, "Error in the uploadation");
    }

    let coverImage;
    if (coverLocalPath) {
        try {

            coverImage = await uploadOnCloudinary(coverLocalPath);
            console.log("Cover image is uploaded successfully on cloudinary", coverImage);

        } catch (error) {
            console.log("There is an error in the uploadation in the cover image", error);
            throw new APIerror(400, "Error in the uploadation");
        }

    }
    if (!avatar || !avatar.url) {
        throw new APIerror(400, "Avatar upload failed");
    }
    try {
        console.log("hello");
        const user = await User.create({
            email,
            username: username.toLowerCase(),
            fullName,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
        })
        console.log("hello");
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new APIerror(500, "Something went wrong in the registration of the user");
        }
        return res
            .status(201)
            .json(
                new APIresponse(201, createdUser, "User registered successfully")
            )
    } catch (error) {
        console.log("Error in the creation of the object", error);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new APIerror(500, "Something went wrong in the registration of the user and images are deleted");
    }
})
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    //validate password
    const passwordCorrect = await user.isPasswordCorrect(password);
    if (!passwordCorrect) {
        throw new APIerror(400, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!loggedInUser) {
        throw new APIerror(400, "Error occured in the login of the user");
    }

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIresponse(200,
                {
                    user: loggedInUser,
                    refreshToken,
                    accessToken
                },
                "User logged in successfully"
            )
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {

    const refreshToken  = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
        throw new APIerror(400, "Refresh Token is not present");
    }
    try {

        const decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new APIerror(500, "Invalid refresh token");
        }
        if (refreshToken !== user.refreshToken) {
            throw new APIerror(500, "Invalid refresh token");
        }
        const { accessToken, refreshToken : newRefreshToken } = await generateAccessandRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIresponse(
                    200,
                    { user, accessToken, refreshToken: newRefreshToken },
                    "Access and refresh tokens refreshed successfully"
                )
            )

    } catch (error) {
        throw new APIerror(400, "Something went wrong in the refresh of access and refresh token", error);
    }
})
const logoutUser = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }
    )
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIresponse(200, {}, "User logged out successfully")
        )
})
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new APIerror(404, "User not found");
    }
    if (! await user.isPasswordCorrect(oldPassword)) {
        throw new APIerror(400, "Old password is incorrect");
    }
    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new APIresponse(200, {}, "Password changed successfully")
        )
})
const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new APIerror(404, "Current user not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, user, "The current user fetched successfully")
        )
})
const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new APIerror(400, "Fullname and email re required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");
    if (!user) {
        throw new APIerror(404, "User not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200, user, "Account details updated successsfully")
        )
})
const updateAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new APIerror(400, "Local path is neccessary");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new APIerror(400, "Error in the uploadation of the avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new APIerror(404, "User not found");
    }

    return res
        .status(200)
        .json(new APIresponse(200, user, "Avatar updated successfully"));

})
const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverLocalPath = req.file?.path;
    if (!coverLocalPath) {
        throw new APIerror(400, "Local path is neccessary");
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);
    if (!coverImage || !coverImage.url) {
        throw new APIerror(400, "Error in the uploadation of the cover image on the cloudinary");
    }

    const user = await User.findById(

        req.user?._id,
        {
            coverImage: coverImage.url
        },
        {
            new: true
        }
    ).select("-password -refreshToken");
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, user, "Cover image updated successfully")
        );
})
const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params;
    if (!username.trim()) {
        throw new APIerror(400, "Username is required");
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    subscriberCount: 1,
                    channelsSubscribedToCount: 1,
                    coverImage: 1,
                    email: 1,
                    isSubscribed: 1,
                }
            }
        ]
    )

    if (!channel || !channel.length) {
        throw new APIerror(404, "Channle not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, channel[0], "Channel fetched successfully")
        )

})
const getWatchHistory = asyncHandler(async (req, res) => {

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
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new APIresponse(200, user[0]?.watchHistory, "Watch history fetched successfully")
        )

})

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};



