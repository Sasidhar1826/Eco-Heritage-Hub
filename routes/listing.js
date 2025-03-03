const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {
  isSeller,
  isLoggedIn,
  validateListing,
  isOwner,
} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index)) // Index route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  ); // Create route

router
  .route("/my-listings")
  .get(isLoggedIn, isSeller, wrapAsync(listingController.showSellerListings));

// New route: Create operation, it is kept above id because id will be recognized as an ID
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// Route to filter listings by region
router.get("/region/:region", wrapAsync(listingController.filterByRegion));

// Route to filter listings by category
router.get(
  "/category/:category",
  wrapAsync(listingController.filterByCategory)
);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // Show route
  .put(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    isOwner,
    wrapAsync(listingController.updateListing)
  ) // Update route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); // Delete route

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
