import {
getVideoComments,
addComment,
updateComment,
deleteComment

} from "../controllers/comment.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
        addCommentValidations,
        updateCommentValidations
} from "../validators/index.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId")
        .get(getVideoComments)
        .post(addCommentValidations(), validate, addComment)

router.route("/c/:commentId")
        .delete(deleteComment)
        .patch(updateCommentValidations(), validate, updateComment)

export default router;