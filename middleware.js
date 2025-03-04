const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./schema.js");
const Cart = require("./models/cart");

//Middleware to check if user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
  //passport has inbuild function will authenticate user if they are logged in or not. req.user variable will have all info about user
  // console.log(req.user);
  if (!req.isAuthenticated()) {
    //redirect url save
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must be logged in to create new listigs");
    return res.redirect("/login");
  }
  next();
};

module.exports.isSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    return next();
  }
  req.flash("error", "You must be a seller to access this page.");
  return res.redirect("/");
};

module.exports.isOwner = async (req, res, next) => {
  //authorization step
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this listing");
    return res.redirect(`/products/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this review");
    return res.redirect(`/products/${id}`);
  }
  next();
};

//to save redirectUrl to locals
module.exports.saveRedirectUrl = (req, res, next) => {
  //when we login then passport clear session data. to get redirect url we need to store in locals
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

//MiddleWare to validate incomming data
//validate data for reviews
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//validate data for listings
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Middleware for flash
module.exports.flashMiddleware = (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
};

// Add cart count to response locals
module.exports.addCartCount = async (req, res, next) => {
  try {
    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id }).lean();
      if (cart && Array.isArray(cart.items)) {
        const count = cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        req.session.cartItemCount = count;
        res.locals.cartItemCount = count;
        await new Promise((resolve) => req.session.save(resolve));
      } else {
        res.locals.cartItemCount = 0;
      }
    } else {
      res.locals.cartItemCount = 0;
    }
  } catch (err) {
    console.error("Error in addCartCount middleware:", err);
    res.locals.cartItemCount = 0;
  }
  next();
};
