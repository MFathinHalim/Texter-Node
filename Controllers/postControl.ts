import { type Model, type Document, Types } from "mongoose";
import mainModel from "../models/post";
const { htmlToText } = require('html-to-text');
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
        if(adjustedLimit <= 0) {
          adjustedLimit = 1;
        }
    
        const posts: postType[] = await this.#posts.aggregate([
          { $match: {} }, // Match all documents (optional, but can be used for filtering)
          { $sample: { size: totalPosts } }, // Randomize ALL posts first
          { $skip: skip }, // Then skip based on pagination
          { $limit: adjustedLimit } // Limit results to the adjusted limit
        ]);
    
        return { posts };
      } catch (error) {
        console.error("Error fetching posts:", error);
        return { posts: [] };
      }
    } else {
      try {
        const post = await this.#posts.findOne({ id });
        const replies = await this.#posts.find({ replyTo: id });
        return { post: post || null, replies: replies || [] };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { post: null, replies: [] };
      }
    }
  }

  async posting(post: postType): Promise<postType> {
    if (!post.title || post.title === "")
      return this.#notFound;
    post.title = htmlToText(post.title);
    await mainModel.create(post)
    return post;
  }

  async liking(postId: string, user: userType): Promise<postType | number> {
    try {
      const post: Document<postType, any, any> & postType | null = await this.#posts.findOne({ id: postId });      
      if (post) {
        const userAlreadyLike: userType | undefined = post.like.users.find(
          (entry: userType) => entry.username === user.username
        );
        if (!userAlreadyLike) {
          // User belum like, tambahkan like
          post.like.total++;
          post.like.users.push(user);
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
