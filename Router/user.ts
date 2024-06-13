import { Router } from "express";
import type { Request, Response, Router as RouterTypes } from "express";

const routerUsers: RouterTypes = Router();

routerUsers
  .route("/login")
  .get((req: Request, res: Response) => {
    return res.render("login");
  })
  .post((req: Request, res: Response) => {
    return "Woah login coy";
  });

export default routerUsers;
