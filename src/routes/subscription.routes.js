import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import Router from "express";
const router = Router();

import { verifyJWT } from "../middlewares/auth.middleware.js";
router.use(verifyJWT);

router.route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);
    

router.route("/u/:subscriberId").get(getSubscribedChannels);
export default router;