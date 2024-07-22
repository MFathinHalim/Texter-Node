import { Router } from "express";
import type { Request, Response, Router as RouterTypes } from "express";

import Posts from "../Controllers/postControl";
import Users from "../Controllers/userControl";
import * as dotenv from "dotenv"

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

dotenv.config();

const userClass: Users = Users.getInstances(); //Cek classnya
const PostsClass: Posts = Posts.getInstances(); //Cek classnya
const router: RouterTypes = Router(); //Bikin Router Baru

router
  .route("/") //Route /
  .get(async (req: Request, res: Response) => {
    return res.render( req.query.id ? "details" : "homepage", req.query.id ? await PostsClass.getData(req.query.id?.toString(), 0, 0) : {})
  })
  .post(upload.single("image"), async (req: Request, res: Response) => {
    const checkToken: boolean = await userClass.checkAccessToken(req.body.token)
    if(checkToken) {
      const user: any = await userClass.checkUserId(JSON.parse(req.body.data).user.id);
      console.log(user)
      //@ts-ignore: Unreachable code error
      await PostsClass.posting(JSON.parse(req.body.data), user, req.body.img !== undefined ? req.body.img.buffer : "");
    }
    return res.redirect(`/?id=${req.body.id}`);
  });

router.route("/get/posts").get(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1; // Get page from query
    const limit = parseInt(req.query.limit as string) || 10; // Get limit from query
    try {
      const posts = await PostsClass.getData("", page, limit); // Assuming getData now takes page and limit
      return res.json({ posts }); // Send posts as JSON response
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
})

router.route("/like/")
.post(async (req: Request, res: Response) => {
  const checkToken: boolean = await userClass.checkAccessToken(req.body.token)
  let likes:number | postType = 0;
  if(checkToken) {
    const user: any = await userClass.checkUserId(req.body.user.id);
    likes = await PostsClass.liking(req.body.post.id, user);
  }
  return res.json({
    likes:likes
  });
})

router.route("/madeToken").post(async (req: Request, res: Response) => {
  return req.body.id === null ? res.json({token: ""} ): res.json({ token: await userClass.createAccessToken(req.body.id.toString()) })
})
  
router.route("/user/details/:username").get(async (req: Request, res: Response) => {
  const user = await userClass.checkUserDetails(req.params.username, (req.query.myname?.toString() ||""));
  return res.render("user", user);
})

router.route("/user/follow/:username")
.get(async (req: Request, res: Response) => {
  const isFollowing:boolean | userType = await userClass.checkFollow(req.params.username, (req.query.myname?.toString() || ""));
  return res.json({ isFollowing });
})
.post(async (req: Request, res: Response) => {
  const checkToken: boolean = await userClass.checkAccessToken(req.body.token)
  if(checkToken) await userClass.follow(req.params.username, (req.body.myname));
  res.send(200);
})

router.route("/user/check").get(async (req: Request, res: Response) => {
  const checkUser: boolean = await userClass.checkIsUserBan(req.query.username?.toString() || "")
  return res.json({
    check: checkUser
  })
})

//? router login
router
  .route("/login")
  .get((req: Request, res: Response) => {
    return res.render("login");
  }) //untuk get login, ya di render aja
  .post(async (req: Request, res: Response) => {
    let result: any = await userClass.login(
      req.body.username,
      req.body.password
    ); //liat hasil resultnya nih

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
  .route("/signup") //signup
  .get((req: Request, res: Response) => {
    return res.render("signup"); //? ya render
  })
  .post(async (req: Request, res: Response) => {
    await userClass.signUp(req.body.name, req.body.username, req.body.password); //di adain
    return res.redirect("/login"); //lalu ke /login
  });

export default router; //TODO export routernya buat dipake di index.ts
