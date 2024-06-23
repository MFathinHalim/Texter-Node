import { Model, Schema, Types, model } from "mongoose";
import { userSchema } from "./user";

// Schema for the embedded re-quoted post (without self-reference)
const reQuotedPostSchema = new Schema<postType>({
    id: String,
    title: String,
    time: String,
    user: userSchema,
    like: {
      total: Number,
      users: [userSchema],
    },
    replyTo: String,
    img: String,
    repost: userSchema,
    ogId: String,
    // No reQuote field here to avoid circularity 
});

// Main post schema
const postSchema = new Schema<postType>({
    id: String,
    title: String,
    time: String,
    user: userSchema,
    like: {
      total: Number,
      users: [userSchema],
    },
    replyTo: String,
    img: String,
    repost: userSchema,
    ogId: String,
    reQuote: reQuotedPostSchema // Embed the separate schema
});

const mainModel:Model<postType> = model<postType>("posts", postSchema);
export default mainModel;
