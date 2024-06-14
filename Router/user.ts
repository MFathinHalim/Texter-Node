import { Router } from "express";
import type { Request, Response, Router as RouterTypes } from "express";
import Users from "../Controllers/userControl";

const routerUsers: RouterTypes = Router();
const userClass: Users = Users.getInstances();

//? router login
routerUsers
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
routerUsers
  .route("/signup") //signup
  .get((req: Request, res: Response) => {
    return res.render("signup"); //? ya render
  })
  .post((req: Request, res: Response) => {
    userClass.signUp(req.body.name, req.body.username, req.body.password); //di adain
    return res.redirect("/login"); //lalu ke /login
  });

export default routerUsers;
