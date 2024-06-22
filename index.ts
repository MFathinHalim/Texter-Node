import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import path from "path";

//import routernya
import router from "./Router/main";
//? dotenv config
dotenv.config();

const app: Express = express(); //bikin expressnya
const port: number | string = process.env.PORT || 3000; //bikin port :D

app.set("view engine", "ejs"); //set view enginenya jadi ejs
app.use(express.static(path.join(__dirname, "/public"))); //TODO buat frontendnya, css js image di taruh di public

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//? Jalankan Routernya
app.use("/", router); //* Router Posts
//Run app nya sesuai port
app.listen(port, () => {
  console.log(`[app]: berjalan pada: http://localhost:${port}`); //TODO di Log biar jelas udah jalan atau kagak
});
