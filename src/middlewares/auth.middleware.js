import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js";
import { APIerror } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req,res, next) => {

    const token = req.cookies?.accessToken ||  req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new APIerror(400, "Unauthorized user");
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new APIerror(401, "Unauthorized user");
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        throw new APIerror(401, error.message || "Invalid access token");
    }
})
export { verifyJWT };