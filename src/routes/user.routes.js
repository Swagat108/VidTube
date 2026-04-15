import { Router } from "express";

import { loginUser } from "../controllers/user.controllers.js";
import { logoutUser } from "../controllers/user.controllers.js";

import {
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    updateAccountDetails,
    updateAvatar,
    updateUserCoverImage,
    getWatchHistory
} from "../controllers/user.controllers.js";

import {
    userRegisterValidations,
    updateAccountValidations,
    changePasswordValidations,
    userLoginValidations,
    getUserChannelProfileValidations,
}from "../validators/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//unsecured routes
const router = Router();
router.route("/register").post(
    userRegisterValidations(),validate,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(userLoginValidations(),validate,loginUser);
router.route("/refresh-token").post(refreshAccessToken);


router.use(verifyJWT);
router.route("/logout").post( logoutUser);
router.route("/change-password").post(changePasswordValidations(),validate, changeCurrentPassword);
router.route("/current-user").get( getCurrentUser);

router.route("/c/:username").get(getUserChannelProfileValidations(),validate,getUserChannelProfile);

router.route("/update-account").patch(updateAccountValidations(),validate, updateAccountDetails);

router.route("/update-avatar").patch( upload.single("avatar"), updateAvatar);

router.route("/update-cover-image").patch( upload.single("coverImage"), updateUserCoverImage);

router.route("/watch-history").get( getWatchHistory);

export default router;