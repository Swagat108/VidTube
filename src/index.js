
import {app} from "./app.js"

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path : "./.env"
})

const port = process.env.PORT || 3000;

connectDB()
    .then(()=>{
        app.listen(port, () => {
            console.log(`The server is listening to the port ${port}`);
        })
    })
    .catch((err)=>{
        console.log("MongoDB connection error",err);
    })
