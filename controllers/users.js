const User = require("../models/user.js");
// s
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

module.exports.renderProfile = async (req, res) => {
  res.render("users/profile");
};

module.exports.renderEditProfile = async (req, res) => {
  res.render("users/edit-profile");
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Update profile image if uploaded
    if (req.file) {
      user.profileImage = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // Update email
    if (email && email !== user.email) {
      user.email = email;
    }

    // Update username if provided and different
    if (username && username !== user.username) {
      user.username = username;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      await user.changePassword(currentPassword, newPassword);
    }

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/profile/edit");
  }
};
