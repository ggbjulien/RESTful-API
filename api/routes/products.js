const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");

// Handle incoming GET request to /products
//(GET ALL PRODUCT)
router.get("/", async (req, res, next) => {
  try {
    const product_list = await Product.find().select("name price _id");

    const response = {
      count: product_list.length,
      products: product_list.map(product_list => {
        return {
          name: product_list.name,
          price: product_list.price,
          _id: product_list._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + product_list._id
          }
        };
      })
    };
    // if (product_list >= 0) {
    res.status(200).json(response);
    // } else {
    //   res.status(404).json({ message: "No entries found" });
    // }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});
// (GET PRODUCT BY ID)
router.get("/:productId", async (req, res, next) => {
  try {
    const id = req.params.productId;
    const find_product = await Product.findById(id).select("name price _id");

    console.log("From database", find_product);

    if (find_product) {
      res.status(200).json({
        product: find_product,
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id
        }
      });
    } else {
      res.status(404).json({ message: "No valid entry found for priveded ID" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// Handle incoming POST request to /products
//(CREATE PRODUCT)
router.post("/", async (req, res, next) => {
  try {
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price
    });

    await product.save();
    console.log(product);

    res.status(201).json({
      message: "Successfully created",
      createdProduct: {
        name: product.name,
        price: product.price,
        _id: product._id,
        request: {
          type: "POST",
          url: "http:/localhost:3000/products/" + product._id
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// Handle incoming PATCH request to /products
//(UPDATE PRODUCT)
router.patch("/:productId", async (req, res, next) => {
  const id = req.params.productId;
  const updatedProp = {};

  try {
    for (const ops of req.body) {
      updatedProp[ops.propName] = ops.value;
    }
    await Product.updateOne({ _id: id }, updatedProp);
    res.status(200).json({
      message: "Product updated",
      request: {
        type: "GET",
        url: "http://localhost:3000/products/" + id
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// Handle incoming DELETE request to /products
//(DELETE PRODUCT)
router.delete("/:productId", async (req, res, next) => {
  try {
    const id = req.params.productId;

    await Product.deleteOne({ _id: id });
    res.status(200).json({
      message: "Product deleted",
      request: {
        type: "POST",
        url: "http://localhost:3000/products",
        body: { name: "String", price: Number }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
