const express = require("express");
const router = express.Router();

// The utility functions

function isProductInCart(cart, id) {
  return cart.some((item) => item.id === id);
}

function calculateTotal(cart, req) {
  let total = 0;
  for (let item of cart) {
    const price = item.sale_price || item.price;
    total += price * item.quantity;
  }
  req.session.total = total;
  return total;
}

// The Routes

router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  const total = req.session.total || 0;
  res.json({ cart, total });
});


//AddToCart

router.post("/addtocart", (req, res) => {
  console.log("Add to cart route hit");
  const product = req.body.product;
  if (!product)
    return res.status(400).json({
      messsage: "No Product provided",
    });

  let cart = req.session.cart || [];

  if (!isProductInCart(cart, product.id)) {
    cart.push({ ...product, quantity: 1 });
  }

  req.session.cart = cart;
  const total = calculateTotal(cart, req);
  res.json({ cart, total });
});

// //RemoveProduct

router.post("/removeproduct", (req, res) => {
  const id = req.body.id;
  let cart = req.session.cart || [];

  cart = cart.filter((item) => item.id !== id);

  req.session.cart = cart;
  const total = calculateTotal(cart, req);
  res.json({ cart, total });
});

// //Edit Product

router.post("/editProductQuantity", (req, res) => {
  const { id, action } = req.body;
  let cart = req.session.cart || [];

  cart = cart.map((item) => {
    if (item.id === id) {
      const quantity =
        action === "increase"
          ? item.quantity + 1
          : Math.max(1, item.quantity - 1);
      return { ...item, quantity };
    }
    return item;
  });

  req.session.cart = cart;
  const total = calculateTotal(cart, req);
  res.json({ cart, total });
});

// //PlaceOrder

router.post("/placeorder", (req, res) => {
  req.session.cart = [];
  req.session.total = 0;
  res.json({ message: "Order placed successuflly" });
});

//Payment

router.get('/payment', (req,res) => {
    const total = req.session.total || 0; // Ensuring you get the  total from session.
    if (total === 0) {
        return res.status(400).json({
            message: 'Cart is empty,cannot complete the payment'
        })
    }
    res.json({message: 'Proceed to payment', total: total})
})

module.exports = router;



