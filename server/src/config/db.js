//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)

import mongoose from "mongoose";//talk to mongodb


//async arrow function 
const connectDB = async () => {
  try {//if databse doesn't exist 
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);//ops! something went wrong exit the process
  }
};

export default connectDB;//let's other files import this function
