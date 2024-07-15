import { type Model, type Document, Types } from "mongoose";
import mainModel  from "../models/post";
import ImageKit from "imagekit";
const { htmlToText } = require('html-to-text');
import * as dotenv from "dotenv"

dotenv.config();

const imagekit: ImageKit = new ImageKit({
  publicKey: process.env.publicImg ||  "",
  privateKey: process.env.privateImg || "",
  urlEndpoint: process.env.urlEndPoint || "",
})

//? Kelas untuk postingan
class Posts {
  static instance: Posts; //Instance

  //TODO Siapin variabel yang kita perlukan
  #posts: Model<postType>;
  #notFound: postType;

  //* Constructor, semacam __init__ di python :3
  constructor() {
    this.#posts = mainModel; //Postnya untuk kelas
    this.#notFound = {
      id: "not-found",
      title: "data not found",
      time: "undefined",
      user: {
        id: "System",
        name: "System",
        username: "system",
        desc: "system",
        password: "system",
        pp: "",
        ban: false,
        accessToken: {
          accessNow: "",
          timeBefore: "",
        },
      },
      replyTo: "",
      like: {
        total: 0,
        users: [],
      },
    }; //Post kalau gak ketemu
  }

  //Dapatin instancenya, alias cek udah ada atau belum :D
  static getInstances(): Posts {
    if (!Posts.instance) Posts.instance = new Posts(); //? Bikin kelasnya
    return Posts.instance; //return instancenya (alias kelasnya)
  }

  //Fungsi untuk mendapatkan data
  async getData(
    id: string,
    page: number, 
    limit: number
  ): Promise<{ posts: postType[] } | {post:postType | null; replies?: postType[] }> {
    if (!id) {
      try {
        const totalPosts = await this.#posts.countDocuments(); // Get total number of posts
        const skip = (page - 1) * limit;

        // Adjust limit if on the last page to avoid fetching more than available
        let adjustedLimit = Math.min(limit, totalPosts - skip); 
        if (adjustedLimit <= 0) {
          adjustedLimit = 1;
        }

        const posts = await this.#posts.find({})
        .populate('user', '-password')
        .populate({
            path: 'reQuote',
            populate: {
                path: 'user',
                select: '-password'
            }
        })
          .skip(skip)
          .limit(adjustedLimit)
          .exec();

        return { posts };
      } catch (error) {
        console.error("Error fetching posts:", error);
        return { posts: [] };
      }
    } else {
      try {
        const post = await this.#posts.findOne({ id })
        .populate('user', '-password')
        .populate({
            path: 'reQuote',
            populate: {
                path: 'user',
                select: '-password'
            }
        })
        .exec();    
        const replies = await this.#posts.find({ replyTo: id }).populate("user", "-password").exec();
        return { post: post || null, replies: replies || [] };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { post: null, replies: [] };
      }
    }
  }

  async posting(post: postType, user: any,file: any): Promise<postType> {
    if (!post.title || post.title === "")
      return this.#notFound;
    if(post.repost) {
      const og: Document<postType, any, any> & postType | null = await this.#posts.findOne({ post });
      post.ogId = og?.id;
    }
    post.user = user._id
    post.title = htmlToText(post.title);
    if(file) {
      await imagekit.upload({
        file: file,
        fileName: `image-${post.title}-${post.user}-${post.time}`,
        useUniqueFileName: false,
        folder: "Txtr"
      }, function (error: any, result: any) {
        if (error) console.error("Error uploading to ImageKit:", error);
        post.img = result.url;
      })
    }
    await mainModel.create(post)
    return post;
  }

  async liking(postId: string, user: any): Promise<postType | number> {
    try {
      const post: Document<postType, any, any> & postType | any = await this.#posts.findOne({ id: postId }).populate("like.users", "-password").exec();      
      if (post) {
        const userAlreadyLike: userType | undefined = post.like.users.find(
          (entry: userType) => entry.id.toString() === user.id
        );
        if (!userAlreadyLike) {
          // User belum like, tambahkan like
          post.like.total++;
          post.like.users.push(user._id);
        } else {
          // User sudah like, hapus like
          post.like.total--;
          const index = post.like.users.findIndex((entry: userType) => entry.username === user.username);
          // Remove the user if found
          if (index > -1) {
            post.like.users.splice(index, 1); 
          }        
        }
        // Simpan perubahan ke database
        await post.save();
  
        return post.like.total;
      } else {
        return this.#notFound;
      }
    } catch (error) {
      console.error("Error in liking:", error);
      return this.#notFound;
    }
  }
}
export default Posts; //TODO Di Export supaya dipake di files lain :D
