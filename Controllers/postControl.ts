//? Kelas untuk postingan
class Posts {
  static instance: Posts; //Instance

  //TODO Siapin variabel yang kita perlukan
  #posts: postType[];
  #notFound: postType;

  //* Constructor, semacam __init__ di python :3
  constructor() {
    this.#posts = []; //Postnya untuk kelas
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
      },
      replyTo: "",
      like: {
        total: 0,
        users: [],
      },
    }; //Post kalau gak ketemu
  }

  //Dapatin instancenya, alias cek udah ada atau belum :D
  static getInstance(): Posts {
    if (!Posts.instance) Posts.instance = new Posts(); //? Bikin kelasnya
    return Posts.instance; //return instancenya (alias kelasnya)
  }

  //Fungsi untuk mendapatkan data
  getData(
    id?: string
  ): { posts: postType[] } | { post: postType; replies?: postType[] } {
    return id !== undefined
      ? {
          post:
            this.#posts.find((entry: postType) => entry.id === id) ||
            this.#notFound, //Cek ada atau enggak, kalau enggak ada ya notFound
          replies:
            this.#posts.filter((entry: postType) => entry.replyTo === id) || [], //Cek ada replies gak
        }
      : { posts: this.#posts };
    /*
      ? Kalau ada id dia bakal dicari dalam posts (kalau gak ketemu jadi notFound), 
      TODO kalau gak ada id bearti return semua postnya
    */
  }

  posting(post: postType): postType {
    if (post.user.ban || !post.title || post.title === "")
      return this.#notFound;
    this.#posts.push(post);
    return post;
  }

  liking(post: postType, user: userType): postType {
    const foundPost:postType | undefined= this.#posts.find((entry: postType) => entry.id === post.id);
    if (foundPost) {
      const isUserAlreadyLike:userType | undefined = foundPost.like.users.find(
        (entry: userType) => entry.id === user.id
      );
      if (isUserAlreadyLike) {
        foundPost.like.total--;
        foundPost.like.users = foundPost.like.users.filter((entry: userType) => entry.id !== user.id);
      }
      else {
        foundPost.like.total++;
        foundPost.like.users.push(user);
      }
      return foundPost;
    } else {
      return this.#notFound;
    }
  }
}
export default Posts; //TODO Di Export supaya dipake di files lain :D
