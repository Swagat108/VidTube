import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controllers.js";

import {
    createPlaylistValidations,
    updatePlaylistValidations,
} from "../validators/index.js";
import Router from "express";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {validate} from "../middlewares/validate.middleware.js";
router.use(verifyJWT);

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/").post(createPlaylistValidations(),validate,createPlaylist)


router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylistValidations(),validate,updatePlaylist)
    .delete(deletePlaylist);


router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);


router.route("/user/:userId").get(getUserPlaylists);

export default router;