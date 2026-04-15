
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());


import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import likesRouter from "./routes/like.routes.js";
import videoRouter from "./routes/video.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/likes",likesRouter);
app.use("/api/v1/videos",videoRouter);

export { app };