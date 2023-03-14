const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { title, nextTick } = require("process");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema } = require("./schema.js");

const app = express();

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampGround = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campground", async (req, res) => {
  const camps = await Campground.find({});
  res.render("campground/index", { camps });
});

app.get("/campground/new", (req, res) => {
  res.render("campground/create");
});

app.post(
  "/campground",
  validateCampGround,
  catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
  })
);

app.get(
  "/campground/:id",
  catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render("campground/show", { camp });
  })
);

app.get(
  "/campground/:id/edit",
  catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    res.render("campground/edit", { camp });
  })
);

app.put(
  "/campground/:id",
  validateCampGround,
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const camp = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campground/${camp._id}`);
  })
);

app.delete(
  "/campground/:id",
  catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campground");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { message = "Something went wrong", statusCode = 500 } = err;
  res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
