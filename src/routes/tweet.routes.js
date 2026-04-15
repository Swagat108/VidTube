import {

        createTweet,
        getUserTweets,
        updateTweet,
        deleteTweet
    
} from "../controllers/tweet.controllers.js";

import {
        createTweetValidations,
        updateTweetValidations,
} from "../validators/index.js";
import {validate} from "../middlewares/validate.middleware.js";
import express from "express";
const router = express.Router();

router.route("/").post(createTweetValidations(),validate,createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId")
        .patch(updateTweetValidations(),validate,updateTweet)
        .delete(deleteTweet);

export default router;