const { Router } = require("express");
const multer = require("multer");
const dotenv = require("dotenv");

const Posts = require("../Controllers/postControl");
const Users = require("../Controllers/userControl");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

dotenv.config();

const userClass = Users.getInstances(); //Cek classnya
const PostsClass = Posts.getInstances(); //Cek classnya
const router = Router(); //Bikin Router Baru

router
  .route("/api/") //Route /
  .get(upload.single("image"), async (req, res) => {
    return res.render(
      req.query.id ? "details" : "homepage",
      req.query.id
        ? await PostsClass.getData(req.query.id?.toString(), 0, 0)
        : {}
    );
  })
  .post(async (req, res) => {
    const checkToken = await userClass.checkAccessToken(req.body.token);
    if (checkToken) {
      const user = await userClass.checkUserId(req.body.data.user.id);
      //@ts-ignore: Unreachable code error
      await PostsClass.posting(
        req.body.data,
        user,
        req.file !== undefined ? req.file.buffer : ""
      );
    }
    return res.redirect(`/?id=${req.body.id}`);
  });

router.route("/api/get/posts").get(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get page from query
  const limit = parseInt(req.query.limit) || 10; // Get limit from query
  try {
    const posts = await PostsClass.getData("", page, limit); // Assuming getData now takes page and limit
    return res.json({ posts }); // Send posts as JSON response
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.route("/api/like/").post(async (req, res) => {
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

router.route("/api/madeToken").post(async (req, res) => {
  return req.body.id === null
    ? res.json({ token: "" })
    : res.json({
        token: await userClass.createAccessToken(req.body.id.toString()),
      });
});

router.route("/api/user/details/:username").get(async (req, res) => {
  const user = await userClass.checkUserDetails(
    req.params.username,
    req.query.myname?.toString() || ""
  );
  return res.render("user", user);
});

router
  .route("/api/user/follow/:username")
  .get(async (req, res) => {
    const isFollowing = await userClass.checkFollow(
      req.params.username,
      req.query.myname?.toString() || ""
    );
    return res.json({ isFollowing });
  })
  .post(async (req, res) => {
    const checkToken = await userClass.checkAccessToken(req.body.token);
    if (checkToken)
      await userClass.follow(req.params.username, req.body.myname);
    res.sendStatus(200);
  });

router.route("/api/user/check").get(async (req, res) => {
  const checkUser = await userClass.checkIsUserBan(
    req.query.username?.toString() || ""
  );
  return res.json({
    check: checkUser,
  });
});

//? router login
router
  .route("/api/login")
  .get((req, res) => {
    return res.render("login");
  }) //untuk get login, ya di render aja
  .post(async (req, res) => {
    let result = await userClass.login(req.body.username, req.body.password); //liat hasil resultnya nih

    if (result.username === "system") {
      //kalau sistem dia ke error
      return res.render("error", {
        type: "user",
        error: result,
      });
    }
    return res.render("redirect", result); //kalau enggak langsung redirect
  });

//? router signup
router
  .route("/api/signup") //signup
  .get((req, res) => {
    return res.render("signup"); //? ya render
  })
  .post(async (req, res) => {
    await userClass.signUp(req.body.name, req.body.username, req.body.password); //di adain
    return res.redirect("/login"); //lalu ke /login
  });

module.exports = router; //TODO export routernya buat dipake di index.ts
