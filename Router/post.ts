import { Router } from "express";
import type { Request, Response, Router as RouterTypes } from "express";

import Posts from "../Controllers/postControl";

const PostsClass: Posts = Posts.getInstance(); //Cek classnya
const routerPosts: RouterTypes = Router(); //Bikin Router Baru

routerPosts
  .route("/") //Route /
  .get((req: Request, res: Response) => {
    return res.render(
      req.query.id === undefined ? "homepage" : "details",
      req.query.id !== undefined
        ? PostsClass.getData(req.query.id?.toString())
        : PostsClass.getData()
    ); //? kalau get, liat dulu ada id atau enggak. Kalau ada details, kalau enggak homepage
  })
  .post((req: Request, res: Response) => {
    PostsClass.posting(req.body.post);
    return res.redirect(`/?id=${req.body.post.id}`);
  });

export default routerPosts; //TODO export routernya buat dipake di index.ts
