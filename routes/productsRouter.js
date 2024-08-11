const express = require("express");
const upload = require("../config/multer-config");
const router = express.Router();
const productModel = require("../models/product-model");

router.post("/create", upload.single("image"), async (req, res) => {
  let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
  try {
    let product = await productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });
    req.flash("success", "product created sucessfully");
    res.redirect("/owners/admin");
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/", (req, res) => {
  res.send("Hay product");
});

module.exports = router;
