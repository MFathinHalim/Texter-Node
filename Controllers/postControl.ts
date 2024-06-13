//? Kelas untuk postingan
class Posts {
  static instance: Posts; //Instance

  //TODO Siapin variabel yang kita perlukan
  #posts: postType[];
  #notFound: postType;

  //* Constructor, semacam __init__ di python :3
  constructor() {
    this.#posts = [
      {
        id: "p001",
        title: "Hello, world!",
        time: new Date("2024-06-12T00:00:00.000Z").toISOString(),
        user: {
          id: "001",
          name: "Alice",
          pp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzGDEhwUKopx2_djdmsLjEYQjxKRLr8DSdnw&s",
          ban: false,
        },
        like: {
          total: 0,
          users: [],
        },
        replyTo: "",
        img: "https://i.pinimg.com/474x/96/dc/30/96dc30d7098ff30ca1299ed581639885.jpg",
      }, //contoh post biasa
      {
        id: "p002",
        title: "Hello Too!",
        time: new Date("2024-06-12T00:00:00.000Z").toISOString(),
        user: {
          id: "002",
          name: "Linda",
          pp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzGDEhwUKopx2_djdmsLjEYQjxKRLr8DSdnw&s",
          ban: false,
        },
        replyTo: "p001",
        like: {
          total: 0,
          users: [],
        },
      }, //contoh reply post 1
      {
        id: "p003",
        title: "Hello KS!",
        time: new Date("2024-06-12T00:00:00.000Z").toISOString(),
        user: {
          id: "003",
          name: "Doma",
          pp: "https://i.pinimg.com/originals/5a/67/17/5a67178334c65113bc9b1cdf8122d6fa.jpg",
          ban: false,
        },
        replyTo: "",
        like: {
          total: 0,
          users: [],
        },
      }, //contoh post biasa lainnya
      {
        id: "p004",
        title: "Hello, world!",
        time: new Date("2024-06-12T00:00:00.000Z").toISOString(),
        user: {
          id: "004",
          name: "Fathin",
          pp: "https://i.pinimg.com/736x/2c/d0/16/2cd0166a3b2f3ae98caf92daaa075e05.jpg",
          ban: false,
        },
        replyTo: "",
        like: {
          total: 0,
          users: [],
        },
        img: "https://i.pinimg.com/474x/96/dc/30/96dc30d7098ff30ca1299ed581639885.jpg",
        repost: {
          id: "001",
          name: "Alice",
          pp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzGDEhwUKopx2_djdmsLjEYQjxKRLr8DSdnw&s",
          ban: false,
        },
        ogId: "p001",
      }, //contoh repost
      {
        id: "p005",
        title: "I love coding",
        time: new Date("2024-06-12T00:00:00.000Z").toISOString(),
        user: {
          id: "005",
          name: "Gorengan Hunter",
          pp: "https://w7.pngwing.com/pngs/57/812/png-transparent-fried-food.png",
          ban: false,
        },
        replyTo: "",
        like: {
          total: 0,
          users: [],
        },
        reQuote: {
          id: "p001",
          title: "Hello, world!",
          time: new Date("2024-06-12T00:00:00.000Z").toISOString(),
          user: {
            id: "001",
            name: "Alice",
            pp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzGDEhwUKopx2_djdmsLjEYQjxKRLr8DSdnw&s",
            ban: false,
          },
          like: {
            total: 0,
            users: [],
          },
          replyTo: "",
          img: "https://i.pinimg.com/474x/96/dc/30/96dc30d7098ff30ca1299ed581639885.jpg",
        }, //contoh requotes
      },
    ]; //Postnya untuk kelas
    this.#notFound = {
      id: "not-found",
      title: "data not found",
      time: "undefined",
      user: {
        id: "System",
        name: "System",
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
  getData(id?: string): postType[] | {} {
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
}
export default Posts; //TODO Di Export supaya dipake di files lain :D
