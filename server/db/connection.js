import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connection Created Successfully");
    } catch (error) {
        console.log("Connection Failed", error.message);
        process.exit(1);
    }
}

export default connectDB;