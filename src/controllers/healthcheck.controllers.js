import {APIresponse} from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const healthCheck = asyncHandler(async (req,res)=>{

   return res.status(200)
        .json(new APIresponse(200,"OK","Healthcheck passed"));
})
export {healthCheck};