const fs = require("fs");

const mongoose = require("mongoose");
// const uuid = require('uuid').v4;
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-errors");
const Place = require("../models/place");
const User = require("../models/user");
const getCoordFromAddress = require("../util/location");


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

let place;
try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Could not find a place with that id", 500);
    return next(error);
  }

  if(!place) {
    const error = new HttpError("Could not find the requested place id", 404);
    return next(error);
  }

  res.json({place: place.toObject({ getters: true })});
}

const getPlacesByUserId = async (req, res, next) => {
  const creatorID = req.params.uid;
  console.log(creatorID);
  // let places = [];
  let userWithPlaces;
  try {
      userWithPlaces = await User.findById(creatorID).populate("places");
  } catch(err) {
    const error = new HttpError("Could not find the places by the requested creator id", 500);
    return next(error);
  }

    // if(!places || places.length === 0) {     Before populate method
    if(!userWithPlaces || userWithPlaces.places.length === 0) {
      const error = new HttpError("Could not find the places for the requested user id", 404);
      return next(error);
    }

  res.json({places: userWithPlaces.places.map(place => place.toObject({ getters: true}))});
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);   //returns an array about the data that generated the error

  if(!errors.isEmpty()) {
    const error = new HttpError("Invalid input entered, please check the input", 422);
    return next(error);
  }

  const { title, description, address, creator} = req.body;

  let coordinates;

  try {
    coordinates = await getCoordFromAddress(address);
  } catch (err) {
    return next(err);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if(!user) {
    return next(new HttpError("Couldnot find the user for the provided id", 404))
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess });
    user.places.push(newPlace);   //mongoose push method -- it adds the id of the place to the user model
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed", 500));
  }

  res.status(201).json({place: newPlace});
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return next(new HttpError("Invalid input entered, please check the input", 422));
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  // let updatedPlace;
  // Place.findOneAndUpdate({ _id: placeId }, { $set: { title: title, description: description}}, (err, updatedPlace) => {
  //   res.status(200).json(updatedPlace)
  // })

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Cannot find the requested place to update", 500);
    return next(error);
  }

  if(place.creator.toString() !== req.userData.userId ) {
      const error = new HttpError("You are not allowed to delete this place", 401);
      return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Something went wrong, please try to update again", 500);
    return next(error);
  }

  res.status(200).json({place: place.toObject({ getters: true })});
}



const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  // if(!Place.findById(placeId)) {
  //   throw new HttpError("Could not the place with that id", 404);
  // }
  let place;
  try {
    // await Place.deleteOne({ _id: placeId}, err => console.log(err));
    place = await Place.findById(placeId).populate("creator");   //search through the ref defines in user entity
  } catch (err) {
    const error = new HttpError("Something went wrong, could not delete", 500);
    return next(error);
  }

  if(!place) {
    return next(new HttpError("Could not find place for this id", 404));
  }


    if(place.creator.id !== req.userData.userId ) {
        const error = new HttpError("You are not authorized to delete this place", 401);
        return next(error);
    }

  const deleteImage = place.image;


  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);   //deletes the placeId from the array
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete place", 500));
  }

  fs.unlink(deleteImage, err => {
    console.log(err);
  });

  res.status(200).json({message: "DELETED successfully"});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
