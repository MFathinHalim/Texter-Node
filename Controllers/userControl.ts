const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs")

import type { Model  } from "mongoose";
import { userModel } from "../models/user";

import type { Document } from "mongoose";

dotenv.config();
class Users {
  static instances: Users;

  #users: Model<userType>;
  #error: userType[];

  constructor() {
    this.#users = userModel;
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
    const isNameTaken = await this.#users.findOne({
      $or: [{ username: username }]
    });
    if (isNameTaken) return this.#error[0];

    const newUser: userType = {
      id: this.#users.length.toString(),
      name: name,
      username: username,
      password: password,
      pp: "https://cdn.glitch.global/55de0177-2d52-43bf-a066-45796ec8e7c9/fathin.jpeg?v=1713409662281",
      ban: false,
    };

    this.#users.create(newUser); //di push

    return newUser; //di return
  }

  async login(username: string, password: string): Promise<userType | {}> {
    //Login
    try {
      const user = await this.#users.findOne({ username, ban: false });
      if (!user) {
        return this.#error[1]; // User not found or banned
      }

      const isPasswordValid = await bcrypt.compare(btoa(password), user.password);
      if (!isPasswordValid) return this.#error[1]; // Invalid password

      return {
        username: user.username,
        name: user.name,
        id: user.id
      };
    } catch (error) {
      console.error("Error during login:", error);
      return this.#error[1]; // Handle potential errors during database query
    }
  }

  async createAccessToken(id: string): Promise<string> {
    try {
      const user = await this.#users.findOne({ id });
      if (!user) return "";
      const newToken: string = jwt.sign(user.toObject(), process.env.JWT_SECRET_KEY || "");
      return newToken;
    } catch (error) {
      console.error("Error creating access token:", error);
      return "";
    }
  }

  checkAccessToken(token: string): boolean {
    let jwtSecretKey: string = process.env.JWT_SECRET_KEY || "";
    const verified = jwt.verify(token, jwtSecretKey);
    if (!verified) return false; // User not found
    return true; // True if token is still within 15 minutes
  }

  async follow(username: string, myusername: string) {
    const user: Document<userType, any, any> & userType | null = await this.#users.findOne({ username: username });
    const mine: Document<userType, any, any> & userType | null = await this.#users.findOne({ username: myusername });

    if (user && mine && user.followers && mine.following) {
      const isFollowing = mine.following.some(f => f.username === user.username);
      if (isFollowing) {
        // Unfollow: Remove user from mine's following and mine from user's followers
        mine.following = mine.following.filter(f => f.username !== user.username);
        user.followers = user.followers.filter(f => f.username !== mine.username);
      } else {
        // Follow: Add user to mine's following and mine to user's followers
        user.followers.push(mine);
        mine.following.push(user);
      }
      await user.save();
      await mine.save();
      return 200
    } else {
      return this.#error[1];
    }    
  }

  async checkUserDetails(username: string, myusername: string) {
    let following:boolean = false;
    const user: Document<userType, any, any> & userType | null = await this.#users.findOne({ username: username });
    const mine: Document<userType, any, any> & userType | null = await this.#users.findOne({ username: myusername });
    if (user && mine && user.followers && mine.following) {
      const isFollowing = mine.following.some(f => f.username === user.username);
      if(isFollowing) following = true;
      return {
        user: user,
        following: following
      }
    }
    return {
      user: this.#error[1],
      following: following
    }
  }

  async checkIsUserBan(username: string): Promise<boolean> {
    const user: Document<userType, any, any> & userType | null = await this.#users.findOne({ username: username });
    if(user && user.ban !== true) {
      return false;
    } else {
      return true;
    }
  }
}

export default Users;
