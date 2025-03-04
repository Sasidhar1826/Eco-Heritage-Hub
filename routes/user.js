const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//home route

router.route("/").get(async (req, res) => {
  res.render("./users/home.ejs");
});

//Signup routes
router
  .route("/signup")
  .get((req, res) => {
    res.render("./users/signup.ejs");
  })
  .post(wrapAsync(userController.signup));

//Login routes
router
  .route("/login")
  .get((req, res) => {
    res.render("./users/login.ejs");
  })
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login)
  );

//LogOut routes
//Passport has inbuild function for logout
router.get("/logout", userController.logout);

// Profile edit routes
router.get("/profile", isLoggedIn, userController.renderProfile);
router.get("/profile/edit", isLoggedIn, userController.renderEditProfile);
router.put(
  "/profile",
  isLoggedIn,
  upload.single("profileImage"),
  wrapAsync(userController.updateProfile)
);

module.exports = router;
