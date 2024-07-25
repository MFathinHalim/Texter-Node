const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Import router
const router = require("./Router/main");
//? dotenv config
dotenv.config();

const app = express(); // Create express app
const port = process.env.PORT || 3000; // Set port

app.set("view engine", "ejs"); // Set view engine to ejs
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files from public

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//? Use router
app.use("/", router); //* Router Posts
// Run app on specified port
mongoose.set("strict", false);
mongoose.connect(process.env.MONGODBURI || "").then(() => {
  app.listen(port, () => {
    console.log(`[app]: running at: http://localhost:${port}`); // Log to indicate the app is running
  });
});
