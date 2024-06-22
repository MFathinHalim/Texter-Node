import { Router } from "express";
import type { Request, Response, Router as RouterTypes } from "express";

import Posts from "../Controllers/postControl";
import Users from "../Controllers/userControl";

const userClass: Users = Users.getInstances(); //Cek classnya
const PostsClass: Posts = Posts.getInstances(); //Cek classnya
const router: RouterTypes = Router(); //Bikin Router Baru

router
  .route("/") //Route /
  .get((req: Request, res: Response) => {
    return res.render(
      req.query.id === undefined ? "homepage" : "details",
      req.query.id === undefined
        ? PostsClass.getData()
        : PostsClass.getData(req.query.id?.toString())
    ); //? kalau get, liat dulu ada id atau enggak. Kalau ada details, kalau enggak homepage
  })
  .post((req: Request, res: Response) => {
    const checkToken: boolean = userClass.checkAccessToken(req.body.user.username, req.body.user.accessToken)
    if(checkToken) PostsClass.posting(req.body);
    return res.redirect(`/?id=${req.body.id}`);
  });

router.route("/madeToken").get((req: Request, res: Response) => {
  return res.json({ token: userClass.createAccessToken(req.query.username?.toString() || "") })
})
  
router.route("/like/")
.post((req: Request, res: Response) => {
  const checkToken: boolean = userClass.checkAccessToken(req.body.user.username, req.body.user.accessToken)
  if(checkToken) PostsClass.liking(req.body.post, req.body.user);
  return res.redirect(`/?id=${req.body.post.id}`);
})

//? router login
router
  .route("/login")
  .get((req: Request, res: Response) => {
    return res.render("login");
  }) //untuk get login, ya di render aja
  .post((req: Request, res: Response) => {
    let result: userType = userClass.login(
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
  .post((req: Request, res: Response) => {
    userClass.signUp(req.body.name, req.body.username, req.body.password); //di adain
    return res.redirect("/login"); //lalu ke /login
  });

export default router; //TODO export routernya buat dipake di index.ts
