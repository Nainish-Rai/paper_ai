// Import the mongoose library and the Mongoose type from "mongoose"
import mongoose, { Mongoose } from "mongoose";

// Get the MongoDB URI from the environment variables
const MONGO_URI = process.env.MONGO_URI;

// Define the structure of the Mongoose connection
interface MongooseConnection {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Create a global variable to cache the Mongoose connection
let cached: MongooseConnection = (global as any).mongoose;

// If the Mongoose connection is not cached, initialize it as null
if (!cached) {
  cached = (global as any).mongoose = { connection: null, promise: null };
}

// Define a function to connect to the database asynchronously
export const connectToDatabase = async () => {
  // If the connection is already established, return the cached connection
  if (cached.connection) {
    console.log("Using cached connection", cached.connection);
    return cached.connection;
  }

  if (!MONGO_URI) {
    throw new Error(
      "Please define the MONGO_URI environment variable inside .env.local"
    ); // Throw an error if the MONGO_URI is not defined
  }

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGO_URI, { dbName: "paper", bufferCommands: false });

  return cached.connection;
};
