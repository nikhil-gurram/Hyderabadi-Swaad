const { json } = require("express");

function index(req, res) {
  res.render("customers/cart");
}

function updateCart(req, res) {
  if (!req.session.cart) {
    req.session.cart = {
      items: {},
      totalQty: 0,
      totalPrice: 0,
    };
  }
  let cart = req.session.cart;

  if (!cart.items[req.body._id]) {
    cart.items[req.body._id] = {
      item: req.body,
      qty: 1,
    };
    cart.totalQty = cart.totalQty + 1;
    cart.totalPrice = cart.totalPrice + req.body.price;
  } else {
    cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
    cart.totalQty = cart.totalQty + 1;
    cart.totalPrice = cart.totalPrice + req.body.price;
  }

  return res.json({ totalQty: req.session.cart.totalQty });
}

function increaseQty(req, res) {
  if (!req.session.cart) {
    return res.status(400).json({ message: "Cart not found" });
  }

  let cart = req.session.cart;
  const itemId = req.body._id;

  if (cart.items[itemId]) {
    cart.items[itemId].qty += 1;
    cart.totalQty += 1;
    cart.totalPrice += cart.items[itemId].item.price;

    return res.json({
      totalQty: cart.totalQty,
      itemQty: cart.items[itemId].qty,
      totalPrice: cart.totalPrice,
    });
  }

  return res.status(400).json({ message: "Item not found in cart" });
}

function decreaseQty(req, res) {
  if (!req.session.cart) {
    return res.status(400).json({ message: "Cart not found" });
  }

  let cart = req.session.cart;
  const itemId = req.body._id;

  if (cart.items[itemId]) {
    if (cart.items[itemId].qty > 1) {
      cart.items[itemId].qty -= 1;
      cart.totalQty -= 1;
      cart.totalPrice -= cart.items[itemId].item.price;

      return res.json({
        totalQty: cart.totalQty,
        itemQty: cart.items[itemId].qty,
        totalPrice: cart.totalPrice,
      });
    } else {
      // If quantity is 1, remove the item completely
      return removeItem(req, res);
    }
  }

  return res.status(400).json({ message: "Item not found in cart" });
}

function removeItem(req, res) {
  if (!req.session.cart) {
    return res.status(400).json({ message: "Cart not found" });
  }

  let cart = req.session.cart;
  const itemId = req.body._id || req.params.id;

  if (cart.items[itemId]) {
    const item = cart.items[itemId];
    cart.totalQty -= item.qty;
    cart.totalPrice -= item.item.price * item.qty;

    delete cart.items[itemId];

    return res.json({
      totalQty: cart.totalQty,
      totalPrice: cart.totalPrice,
      message: "Item removed from cart",
    });
  }

  return res.status(400).json({ message: "Item not found in cart" });
}

module.exports = { index, updateCart, increaseQty, decreaseQty, removeItem };
