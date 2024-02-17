import { Schema, model, Document, models } from "mongoose";
import { unique } from "next/dist/build/utils";

export interface UserType extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  clerkId: string;
  image?: string;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: false,
  },
});

const User = models.User || model("User", userSchema);

export default User;
