import { Router } from "express";
import type { Request, Response, Router as RouterTypes } from "express";

import Posts from "../Controllers/postControl";
import Users from "../Controllers/userControl";
import * as dotenv from "dotenv"

dotenv.config();

const userClass: Users = Users.getInstances(); //Cek classnya
const PostsClass: Posts = Posts.getInstances(); //Cek classnya
const router: RouterTypes = Router(); //Bikin Router Baru

router
  .route("/") //Route /
  .get(async (req: Request, res: Response) => {
    return res.render(
      req.query.id === undefined ? "homepage" : "details",
      req.query.id === undefined
        ? await PostsClass.getData()
        : await PostsClass.getData(req.query.id?.toString())
    ); //? kalau get, liat dulu ada id atau enggak. Kalau ada details, kalau enggak homepage
  })
  .post(async (req: Request, res: Response) => {
    const checkToken: boolean = await userClass.checkAccessToken(req.body.token)
    if(checkToken) await PostsClass.posting(req.body.data);
    return res.redirect(`/?id=${req.body.id}`);
  });

router.route("/madeToken").post(async (req: Request, res: Response) => {
  return req.body.id === null ? res.json({token: ""} ): res.json({ token: await userClass.createAccessToken(req.body.id.toString()) })
})
  
router.route("/like/")
.post(async (req: Request, res: Response) => {
  const checkToken: boolean = await userClass.checkAccessToken(req.body.token)
  if(checkToken) await PostsClass.liking(req.body.post, req.body.user);
  return res.redirect(`/?id=${req.body.post.id}`);
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
