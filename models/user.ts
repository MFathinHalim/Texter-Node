import { Model, Schema, model, Types } from "mongoose";

const userSchema: Schema<userType> = new Schema<userType>({
    id: String,
    name: String,
    username: String,
    password: String,
    pp: String,
    ban: Boolean,
    followers: [{ type: Types.ObjectId, ref: 'User' }],
    following: [{ type: Types.ObjectId, ref: 'User' }], 
})

const userModel:Model<userType> = model("user", userSchema); 
export { userModel, userSchema };