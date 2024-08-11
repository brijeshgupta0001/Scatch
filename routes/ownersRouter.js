const express = require("express");
const ownerModel = require("../models/owner-model");
const generateToken = require("../utils/generatetoken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/admin", (req, res) => {
  let success = req.flash("success");
  res.render("createproducts", { success });
});

router.get("/", (req, res) => {
  let error = req.flash("error");
  res.render("owner-login", { error });
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let owner = await ownerModel.findOne({ email: email });
  if (!owner) {
    req.flash("error", "Something went wrong!");
    return res.redirect("/owners");
  } else {
    bcrypt.compare(password, owner.password, function (err, result) {
      if (result === true) {
        let token = jwt.sign(
          { id: owner._id, email: owner.email },
          process.env.JWT_KEY
        );
        res.cookie("token", token);
        res.redirect("/shop");
      } else {
        req.flash("error", "Password is incorrect !");
        return res.redirect("/owners");
      }
    });
  }
});

router.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/owners");
});

if (process.env.NODE_ENV === "development") {
  router.post("/register", async (req, res) => {
    // console.log(process.env.NODE_ENV);
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      req.flash("error", "You don't have permission to create new owner");
      return res.redirect("/owners");
    }
    let { fullname, email, password } = req.body;
    bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, password) {
        if (err) return res.send(err.message);
        else {
          let owner = await ownerModel.create({
            email,
            password,
            fullname,
          });
          let token = jwt.sign(
            { id: owner._id, email: owner.email },
            process.env.JWT_KEY
          );
          res.cookie("token", token);
          res.redirect("/shop");
        }
      });
    });
  });
}

module.exports = router;
