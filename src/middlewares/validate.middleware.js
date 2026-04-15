import { validationResult } from "express-validator";
import { APIerror} from "../utils/Apierror.js";

const validate = (req,res,next) =>
{
    const errors = validationResult(req);
    if(errors.isEmpty())
    {
        return next();
    }
    const trappedErrors = errors.array();
    return res
            .status(422)
            .json(
                new APIerrors(422,"Received data is invalid",trappedErrors)
            )
}
export {validate};