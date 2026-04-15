import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDB = async()=>{
    try {
        
       const connectionInstant =  await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`MongoDB connected successfully ! DB Host : ${connectionInstant.connection.host}`);

    } catch (error) {
        console.log("MongoDB connection error",error);
        process.exit(1);
    }
}
export default connectDB;