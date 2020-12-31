const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const HttpError = require("./models/http-errors");
const usersRoutes = require("./routes/users-routes");


const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
})

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
})

app.use((error, req, res, next) => {
  if(req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }

  if(error.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || "An unknown error occurred"})
})

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.phfd7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true })
.then(() => {
  app.listen(process.env.PORT || 5000, () => console.log("Listening to port 5000"))})
  .catch(err => {console.log("Failed to connect to atlas")});

// mongoose.connect("mongodb://localhost:27017/visitPlaces", { useNewUrlParser: true });
//
// app.listen(5000, () => console.log("Running on port 5000"));
