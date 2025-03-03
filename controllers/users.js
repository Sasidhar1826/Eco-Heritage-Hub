const User = require("../models/user.js");

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const newUser = new User({ email, username, role });
    const registerUser = await User.register(newUser, password);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Eco Heritage Hub");
      res.redirect("/products");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Eco Heritage Hub");

  // Default redirect
  let redirectUrl = res.locals.redirectUrl || "/products";

  // Check if user is a seller and update redirectUrl
  if (req.user && req.user.role === "seller") {
    redirectUrl = "products/my-listings";
  }

  // Prevent DELETE redirects
  if (redirectUrl.includes("DELETE")) {
    redirectUrl = "/products";
  }

  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", " You are logged out now");
    res.redirect("/products");
  });
};
