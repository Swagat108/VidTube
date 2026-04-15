import { Router } from "express";
import 
{
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
    
} from "../controllers/video.controllers.js";

import {
    publishVideoValidations,
    updateVideoValidations,
} from "../validators/index.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {validate}from "../middlewares/validate.middleware.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos)
    .post(
        publishVideoValidations(),validate,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(updateVideoValidations(),validate,upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;