import { Model, Schema, model } from "mongoose";

const userSchema: Schema<userType> = new Schema<userType>({
    id: String,
    name: String,
    username: String,
    password: String,
    pp: String,
    ban: Boolean,
})

const userModel:Model<userType> = model("user", userSchema); 
export { userModel, userSchema };