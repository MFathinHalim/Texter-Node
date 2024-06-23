import { Model, Schema, model } from "mongoose";

const followSchema: Schema<userType> = new Schema<userType>({
    id: String,
    name: String,
    username: String,
    pp: String,
})

const userSchema: Schema<userType> = new Schema<userType>({
    id: String,
    name: String,
    username: String,
    password: String,
    pp: String,
    ban: Boolean,
    followers: followSchema,
    following: followSchema,
})

const userModel:Model<userType> = model("user", userSchema); 
export { userModel, userSchema };