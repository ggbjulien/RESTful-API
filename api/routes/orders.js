const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");
const Order = require("../models/order");

// Handle incoming GET request to /orders
router.get("/", async (req, res, next) => {
  try {
    const order_list = await Order.find().select("product quantity _id");
    res.status(200).json({
      count: order_list.length,
      orders: order_list.map(order_list => {
        return {
          _id: order_list._id,
          product: order_list.product,
          quantity: order_list.quantity,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders/" + order_list._id
          }
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.get("/:orderId", async (req, res, next) => {
  try {
    const find_order = await Order.findById(req.params.orderId).select(
      "product quantity _id"
    );
    if (find_order) {
      res.status(200).json({
        order: find_order,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders"
        }
      });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

// Handle incoming POST request to /orders
router.post("/", async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId);

    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId
    });

    await order.save();
    res.status(201).json({
      message: "Succesfully stored",
      createdOrder: {
        quantity: order.quantity,
        _id: order._id,
        product: req.body.productId
      },
      request: {
        type: "POST",
        url: "http://localhost:3000/orders/" + order._id
      }
    });
  } catch (err) {
    if ((err.kind = "ObjectId")) {
      console.error(err);
      res.status(404).json({ message: "Product not found" });
    } else {
      console.error(err);
      res.status(500).json({ error: err });
    }
  }
});

// Handle incoming DELETE request to /orders
router.delete("/:orderId", async (req, res, next) => {
  try {
    const id = req.params.orderId;

    await Order.deleteOne({ _id: id });
    res.status(200).json({
      message: "Order deleted",
      request: {
        type: "GET",
        url: "http://localhost:3000/orders",
        body: { productId: "ID", quantity: "Number" }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
