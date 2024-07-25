const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const Posts = require("../Controllers/postControl");
const Users = require("../Controllers/userControl");
const ImageKit = require("imagekit");

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const imagekit = new ImageKit({
  publicKey: process.env.publicImg,
  privateKey: process.env.privateImg,
  urlEndpoint: process.env.urlEndPoint,
});

const userClass = Users.getInstances();
const PostsClass = Posts.getInstances();
const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      const data = req.query.id
        ? await PostsClass.getData(req.query.id.toString(), 0, 0)
        : {};
      if (data) {
        return res.render(req.query.id ? "details" : "homepage", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).send("Failed to fetch data");
    }
  })
  .post(upload.single("image"), async (req, res) => {
    try {
      const checkToken = await userClass.checkAccessToken(req.body.token);
      if (!checkToken) {
        throw new Error("Invalid token");
      }

      const userData = JSON.parse(req.body.data);
      const user = await userClass.checkUserId(userData.user.id);

      let img = "";
      if (req.file) {
        const buffer = req.file.buffer;
        const id = `${userData.title}-${userData.user.id}-${userData.time}`;

        await imagekit.upload(
          {
            file: buffer,
            fileName: `image-${id}.jpg`,
            useUniqueFileName: false,
            folder: "Txtr",
          },
          async function (error, result) {
            if (error) {
              console.error("Error uploading to ImageKit:", error);
              return res
                .status(500)
                .json({ msg: "Terjadi kesalahan saat mengunggah file" });
            }

            img = result.url;

            await PostsClass.posting(userData, user, img);
            return res.redirect(`/?id=${req.body.id}`);
          }
        );
      } else {
        await PostsClass.posting(userData, user, img);
        return res.redirect(`/?id=${req.body.id}`);
      }
    } catch (error) {
      console.error("Error posting data:", error);
      return res.status(500).send("Failed to post data");
    }
  });

router.route("/get/posts").get(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const posts = await PostsClass.getData("", page, limit);
    return res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.route("/like/").post(async (req, res) => {
  const checkToken = await userClass.checkAccessToken(req.body.token);
  let likes = 0;
  if (checkToken) {
    const user = await userClass.checkUserId(req.body.user.id);
    likes = await PostsClass.liking(req.body.post.id, user);
  }
  return res.json({
    likes: likes,
  });
});

router.route("/madeToken").post(async (req, res) => {
  return req.body.id === null
    ? res.json({ token: "" })
    : res.json({
        token: await userClass.createAccessToken(req.body.id.toString()),
      });
});

router.route("/user/details/:username").get(async (req, res) => {
  const user = await userClass.checkUserDetails(
    req.params.username,
    req.query.myname || ""
  );
  const post = await PostsClass.getData("", 0, 0, user.user.id);
  if (user && post) {
    return res.render("user", { user: user, posts: post });
  }
});

router
  .route("/profile/:username")
  .get(async (req, res) => {
    const user = await userClass.checkUserDetails(
      req.params.username,
      req.query.myname || ""
    );
    if (user) {
      return res.render("edit-profile", user);
    }
  })
  .post(upload.single("image"), async (req, res) => {
    try {
      const checkToken = await userClass.checkAccessToken(req.body.token);
      if (!checkToken) {
        throw new Error("Invalid token");
      }

      const userData = JSON.parse(req.body.data);

      let img = "";
      if (req.file) {
        const buffer = req.file.buffer;
        const id = userData.id;

        await imagekit.upload(
          {
            file: buffer,
            fileName: `pfp-${id}.jpg`,
            useUniqueFileName: false,
            folder: "Txtr",
          },
          async function (error, result) {
            if (error) {
              console.error("Error uploading to ImageKit:", error);
              return res
                .status(500)
                .json({ msg: "Terjadi kesalahan saat mengunggah file" });
            }
            const currentEpochTime = Date.now();
            const updatedAt = `updatedAt=${currentEpochTime}`;
            img = result.url + `?updatedAt=${updatedAt}`;
            await userClass.editProfile(userData, img);
            return res.send(200);
          }
        );
      }
      await userClass.editProfile(userData, img);
      return res.send(200);
    } catch (error) {
      console.error("Error posting data:", error);
      return res.status(500).send("Failed to post data");
    }
  });

router.route("/user/details/json/:username").get(async (req, res) => {
  const user = await userClass.checkUserDetails(
    req.params.username,
    req.params.username
  );
  return res.json({ user: user });
});

router
  .route("/user/follow/:username")
  .get(async (req, res) => {
    const isFollowing = await userClass.checkFollow(
      req.params.username,
      req.query.myname || ""
    );
    return res.json({ isFollowing });
  })
  .post(async (req, res) => {
    const checkToken = await userClass.checkAccessToken(req.body.token);
    if (checkToken)
      await userClass.follow(req.params.username, req.body.myname);
    res.send(200);
  });

router.route("/user/check").get(async (req, res) => {
  const checkUser = await userClass.checkIsUserBan(req.query.username || "");
  return res.json({
    check: checkUser,
  });
});

router
  .route("/login")
  .get((req, res) => {
    return res.render("login");
  })
  .post(async (req, res) => {
    let result = await userClass.login(req.body.username, req.body.password);

    if (result.username === "system") {
      return res.render("error", {
        type: "user",
        error: result,
      });
    }
    return res.render("redirect", result);
  });

router
  .route("/signup")
  .get((req, res) => {
    return res.render("signup");
  })
  .post(async (req, res) => {
    await userClass.signUp(
      req.body.name,
      req.body.username,
      req.body.password,
      req.body.desc
    );
    return res.redirect("/login");
  });

module.exports = router;
