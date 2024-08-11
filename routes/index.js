const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const isLoggedin = require("../middlewares/isLoggedin");
const userModel = require("../models/user-model");

router.get("/shop", isLoggedin, async (req, res) => {
  try {
    let products = await productModel.find();

    products = await products.map((product) => {
      return {
        ...product.toObject(),
        image: product.image.toString("base64"),
      };
    });
    let success = req.flash("success");
    res.render("shop", { products, success });
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/addtocart/:productId", isLoggedin, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.productId);
    await user.save();
    req.flash("success", "Added To Cart Successfully!");
    res.redirect("/shop");
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/cart", isLoggedin, async (req, res) => {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");
    res.render("cart", { user });
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/removefromcart/:productid", isLoggedin, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let index = user.cart.indexOf(req.params.productid);
    if (index !== -1) {
      user.cart.splice(index, 1);
    }
    await user.save();
    res.redirect("/cart");
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/", (req, res) => {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
