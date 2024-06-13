import type { Express } from "express";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import path from "path";

//import routernya
import routerPosts from "./Router/post";
import routerUsers from "./Router/user";

//? dotenv config
dotenv.config();

const app: Express = express(); //bikin expressnya
const port: number | string = process.env.PORT || 3000; //bikin port :D

app.set("view engine", "ejs"); //set view enginenya jadi ejs
app.use(express.static(path.join(__dirname, "/public"))); //TODO buat frontendnya, css js image di taruh di public
app.use(bodyParser.json()); //bodyParser

//? Jalankan Routernya
app.use(routerPosts); //* Router Posts
app.use(routerUsers); //* Router Users

//Run app nya sesuai port
app.listen(port, () => {
  console.log(`[app]: berjalan pada: http://localhost:${port}`); //TODO di Log biar jelas udah jalan atau kagak
});
