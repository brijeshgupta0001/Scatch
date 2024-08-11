const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generatetoken");

module.exports.registerUser = async (req, res) => {
  try {
    let { email, password, fullname } = req.body;
    let finduser = await userModel.findOne({ email: email });
    if (finduser) {
      req.flash("error", "You already have account, please login");
      return res.redirect("/");
    }
    bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, password) {
        if (err) return res.send(err.message);
        else {
          let user = await userModel.create({
            email,
            password,
            fullname,
          });
          let token = generateToken(user);
          res.cookie("token", token);
          res.redirect("/shop");
        }
      });
    });
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (!user) {
    req.flash("error", "Something went wrong!");
    return res.redirect("/");
  } else {
    bcrypt.compare(password, user.password, function (err, result) {
      if (result === true) {
        let token = generateToken(user);
        res.cookie("token", token);
        res.redirect("/shop");
      } else {
        req.flash("error", "Password is incorrect !");
        return res.redirect("/");
      }
    });
  }
};

module.exports.logOut = (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
};
