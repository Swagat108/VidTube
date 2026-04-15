import mongoose, { isValidObjectId, mongo } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { APIerror } from "../utils/Apierror.js"
import { APIresponse } from "../utils/Apiresponse.js"
import { asyncHandler } from "../utils/asynchandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if(!name?.trim() || !description?.trim())
    {
        throw new APIerror(400,"Name and description is required for playlist");
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner : new mongoose.Types.ObjectId(req.user?._id),
        videos : []
    })
    if(!playlist)
    {
        throw new APIerror(400,"Error in the creation of the playlist");
    }
    return res
            .status(201)
            .json(
                new APIresponse(201,playlist,"PLaylist created successfully")
            )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if(!isValidObjectId(userId))
    {
        throw new APIerror(400,"Invalid object Id");
    }
    const playlist = await Playlist.find({ owner: userId });
   if(!playlist)
   {
        throw new APIerror(404,"Playlist not found");
   }
   return res
        .status(200)
        .json(
            new APIresponse(200,playlist,"Playlist of user fetched successfully")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new APIerror(400,"Invalid object id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist)
    {
        throw new APIerror(404,"Playlist not found");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200,playlist,"Playlist fetched succesfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    {
        throw new APIerror(400,"Invalid object id");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist)
    {
        throw new APIerror(404,"Playlist not found");
    }
    if (playlist.videos.includes(videoId)) {
        throw new APIerror(400, "Video already exists in playlist");
    }
    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave : false});

    return res
        .staus(200)
        .json(
            new APIresponse(200, playlist,"Video successfully added to the playlist")
        )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIerror(400, "Invalid object id");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIerror(404, "Playlist not found");
    }

    playlist.videos = playlist.videos.filter((element)=> element.toString()!=videoId);
    await playlist.save({validateBeforeSave : false});
    return res
        .status(200)
        .json(
            new APIresponse(200,playlist,"Video successfully deleted from playlist")
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new APIerror(400,"Invalid object Id");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if(!playlist)
    {
        throw new APIerror(404,"Playlist not found");
    }
    return res
            .status(200)
            .json(new APIresponse(200,playlist,"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body;
    if(!isValidObjectId(playlistId))
    {
        throw new APIerror(400,"Invalid object Id");
    }
    if(!name?.trim() || description?.trim())
    {
        throw new APIerror(400,"Name and description are required for updation");
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },
        {
            new : true
        }
    )
    if(!playlist)
    {
        throw new APIerror(400,"Error in the updation of the playlist");
    }
    return res
        .status(200)
        .json(
            new APIresponse(200,playlist,"Playlist updated successfully")
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}