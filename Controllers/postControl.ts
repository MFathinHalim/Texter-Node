import { type Model, type Document, Types } from "mongoose";
import mainModel from "../models/post";
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
    id?: string
  ): Promise<{ posts: postType[] } | { post: postType | null; replies?: postType[] }> {
    if (id !== undefined) {
      try {
        const post = await this.#posts.findOne({ id });
        const replies = await this.#posts.find({ replyTo: id });
        return { post: post || null, replies: replies || [] };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { post: null, replies: [] };
      }
    } else {
      try {
        const posts:postType[] = await this.#posts.find();
        return { posts:posts };
      } catch (error) {
        console.error("Error fetching all posts:", error);
        return { posts: [] };
      }
    }
  }

  async posting(post: postType): Promise<postType> {
    if (!post.title || post.title === "")
      return this.#notFound;
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
