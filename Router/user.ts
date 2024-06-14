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
  })
  .post((req: Request, res: Response) => {
    let result: userType = userClass.login(
      req.body.username,
      req.body.password
    );

    if (result.username === "system") {
      return res.render("error", {
        type: "user",
        error: result,
      });
    }
    return res.render("redirect", result);
  });

//? router signup
routerUsers
  .route("/signup")
  .get((req: Request, res: Response) => {
    return res.render("signup");
  })
  .post((req: Request, res: Response) => {
    userClass.signUp(req.body.name, req.body.username, req.body.password);
    return res.redirect("/login");
  });

export default routerUsers;
