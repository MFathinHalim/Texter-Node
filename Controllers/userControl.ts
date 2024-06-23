const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs")

import type { Model, Document } from "mongoose";
import { userModel } from "../models/user";

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
      $or: [
          { username: username },
          { name: { $exists: true, $ne: '', $gt: 50 } }
      ]
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
}

export default Users;
