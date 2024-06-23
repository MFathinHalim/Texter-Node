const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs")

dotenv.config();
class Users {
  static instances: Users;

  #users: userType[];
  #error: userType[];

  constructor() {
    this.#users = [
      {
        id: "001",
        name: "Coder Hero",
        username: "coderhero",
        password: "$2a$10$vA0MtwkumHsiRPjRdr7pM.ZTZRTK6bEN8vyDkaLOINdpHn6CnFkgW",
        pp: "https://cdn.glitch.global/55de0177-2d52-43bf-a066-45796ec8e7c9/fathin.jpeg?v=1713409662281",
        ban: false,
        bookmark: [],
        accessToken: {
          accessNow: "",
          timeBefore: ""
        }
      },
    ];
    this.#error = [
      {
        id: "System",
        name: "Username is Taken",
        username: "system",
        password: "system",
        pp: "",
        ban: false,
        accessToken: {
          accessNow: "",
          timeBefore: ""
        }
      },
      {
        id: "System",
        name: "This User Not Found!",
        username: "system",
        password: "system",
        pp: "",
        ban: false,
        accessToken: {
          accessNow: "",
          timeBefore: ""
        }
      },
    ]; //list kemungkinan error
  }

  static getInstances() {
    if (!Users.instances) Users.instances = new Users(); //Untuk ngestart class
    return Users.instances;
  }

  async signUp(name: string, username: string, password: string): Promise<userType> {
    password = await bcrypt.hash(btoa(password), 10)
    //untuk signup
    const isNameTaken: boolean = this.#users.some(
      (user) =>
        user.name === name ||
        user.username === username ||
        user.name.length > 50
    ); //cek namenya aman gak
    if (isNameTaken) return this.#error[0];

    const newUser: userType = {
      id: this.#users.length.toString(),
      name: name,
      username: username,
      password: password,
      pp: "https://cdn.glitch.global/55de0177-2d52-43bf-a066-45796ec8e7c9/fathin.jpeg?v=1713409662281",
      ban: false,
      bookmark: [],
      accessToken: {
        accessNow: "",
        timeBefore: ""
      }
    };

    this.#users.push(newUser); //di push

    return newUser; //di return
  }

  login(username: string, password: string): {} {
    //Login
    const userIndex: number = this.#users.findIndex(
      async (user) =>
        user.username === username &&
        await bcrypt.compare(btoa(password), user.password) &&
        user.ban === false
    ); //? Cek nih uname, password, ban nya aman gak
    console.log(userIndex)
    return userIndex !== -1 ? { 
      username: this.#users[userIndex].username, 
      name: this.#users[userIndex].name, 
      id: this.#users[userIndex].id 
    } : this.#error[1]; //return kalau ada bearti return usernya, kalau enggak ke error 1
  }
  createAccessToken(id: string): string {
    const user = this.#users.find(user => user.id === id);
    if (!user) return "";

    const accessToken = user.accessToken || {
      accessNow: "",
      timeBefore: ""
    };

    const currentTime = new Date();
    const timeBefore = new Date(accessToken.timeBefore);
    const timeDifference = currentTime.getTime() - timeBefore.getTime();

    if (timeDifference < 15 * 60 * 1000 && accessToken.accessNow !== "") {
      return accessToken.accessNow;
    } else {
      const newToken:string = jwt.sign(user,  process.env.JWT_SECRET_KEY || "");
      accessToken.accessNow = newToken;
      accessToken.timeBefore = currentTime.toISOString();  
      return newToken;
    }
  }

  checkAccessToken(username: string, token: string): boolean {
    const user = this.#users.find(user => user.username === username);
    let jwtSecretKey: string = process.env.JWT_SECRET_KEY || "";

    const verified = jwt.verify(token, jwtSecretKey);
    if (!verified) return false; // User not found
    if (user?.accessToken?.accessNow !== token) return false; // Token doesn't match
    return true; // True if token is still within 15 minutes
  }
}

export default Users;
