const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { userModel } = require("../models/user");

dotenv.config();

class Users {
  static instances;

  #users;
  #error;

  constructor() {
    this.#users = userModel;
    this.#error = [
      {
        id: "System",
        name: "Username is Taken",
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
      {
        id: "System",
        name: "This User Not Found!",
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
    ]; // list kemungkinan error
  }

  static getInstances() {
    if (!Users.instances) Users.instances = new Users(); // Untuk ngestart class
    return Users.instances;
  }

  async signUp(name, username, password, desc) {
    password = await bcrypt.hash(btoa(password), 10);
    // untuk signup
    const isNameTaken = await this.#users.findOne({
      $or: [{ username: username }],
    });
    if (isNameTaken) return this.#error[0];
    const time = new Date().toLocaleDateString();

    const newUser = {
      id:
        "txtr-usr" +
        username +
        Math.random().toString(16).slice(2) +
        "tme:" +
        time,
      name: name,
      username: username,
      desc: desc,
      password: password,
      pp: "https://cdn.glitch.global/55de0177-2d52-43bf-a066-45796ec8e7c9/fathin.jpeg?v=1713409662281",
      ban: false,
      followers: [],
      following: [],
    };

    this.#users.create(newUser); // di push

    return newUser; // di return
  }

  async login(username, password) {
    // Login
    try {
      const user = await this.#users.findOne({ username, ban: false });
      if (!user) {
        return this.#error[1]; // User not found or banned
      }

      const isPasswordValid = await bcrypt.compare(
        btoa(password),
        user.password
      );
      if (!isPasswordValid) return this.#error[1]; // Invalid password

      return {
        username: user.username,
        name: user.name,
        id: user.id,
      };
    } catch (error) {
      console.error("Error during login:", error);
      return this.#error[1]; // Handle potential errors during database query
    }
  }

  async createAccessToken(id) {
    try {
      const user = await this.#users.findOne({ id });
      if (!user) return "";
      const newToken = jwt.sign(
        user.toObject(),
        process.env.JWT_SECRET_KEY || ""
      );
      return newToken;
    } catch (error) {
      console.error("Error creating access token:", error);
      return "";
    }
  }

  checkAccessToken(token) {
    let jwtSecretKey = process.env.JWT_SECRET_KEY || "";
    const verified = jwt.verify(token, jwtSecretKey);
    if (!verified) return false; // User not found
    return true; // True if token is still within 15 minutes
  }

  async follow(username, myusername) {
    const user = await this.#users.findOne({ username });
    const mine = await this.#users.findOne({ username: myusername });

    if (user && mine) {
      const isFollowing = mine.following?.some((f) => f.equals(user._id));
      if (isFollowing) {
        await this.#users.findByIdAndUpdate(
          mine._id,
          { $pull: { following: user._id } },
          { new: true } // Return the updated document
        );
        await this.#users.findByIdAndUpdate(
          user._id,
          { $pull: { followers: mine._id } },
          { new: true }
        );
      } else {
        await this.#users.findByIdAndUpdate(
          mine._id,
          { $push: { following: user._id } },
          { new: true }
        );
        await this.#users.findByIdAndUpdate(
          user._id,
          { $push: { followers: mine._id } },
          { new: true }
        );
      }
      await user.save();
      await mine.save();
      return 200;
    } else {
      return this.#error[1];
    }
  }

  async checkFollow(username, myusername) {
    const user = await this.#users.findOne({ username });
    const mine = await this.#users.findOne({ username: myusername });

    if (user && mine) {
      const isFollowing = mine.following?.some((f) => f.equals(user._id));
      if (isFollowing) return true;
      return false;
    } else {
      // Handle cases where users are not found (optional)
      return false; // Or throw an error or log a message
    }
  }

  async checkUserDetails(username, myusername) {
    let following = false;
    const user = await this.#users.findOne({ username: username });
    if (myusername) {
      const mine = await this.#users.findOne({ username: myusername });
      if (user && mine && user.followers && mine.following) {
        const isFollowing = mine.following.some(
          (f) => f.username === user.username
        );
        if (isFollowing) following = true;
        return {
          user: user,
          following: following,
        };
      }
    }
    if (user) {
      return {
        user: user,
      };
    }
    return {
      user: this.#error[1],
      following: following,
    };
  }

  async checkUserId(userId) {
    const user = await this.#users.findOne({ id: userId });
    if (user) {
      return user;
    } else {
      return this.#error[1];
    }
  }

  async checkIsUserBan(username) {
    const user = await this.#users.findOne({ username: username });
    if (user && user.ban !== true) {
      return false;
    } else {
      return true;
    }
  }

  async editProfile(userData, profilePicture) {
    try {
      const user = await this.#users.findOne({ id: userData.id });
      if (!user) {
        return this.#error[1]; // User not found
      }

      user.name = userData.name;
      user.pp = profilePicture !== "" ? profilePicture : user.pp;
      user.desc = userData.desc;

      await user.save();
      return {
        username: user.username,
        name: user.name,
        pp: user.pp,
        desc: user.desc,
      };
    } catch (error) {
      console.error("Error editing profile:", error);
      return this.#error[1];
    }
  }
}

module.exports = Users;
