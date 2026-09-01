const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// ================= PRODUCTS =================

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1499,
    image: "/images/headphones.jpg",
    category: "Audio"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2299,
    image: "/images/smartwatch.jpg",
    category: "Wearables"
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    price: 3199,
    image: "/images/keyboard.jpg",
    category: "Accessories"
  },
  {
    id: 4,
    name: "Gaming Mouse",
    price: 999,
    image: "/images/mouse.jpg",
    category: "Accessories"
  },
  {
    id: 5,
    name: "Portable Speaker",
    price: 1799,
    image: "/images/speaker.jpg",
    category: "Audio"
  },
  {
    id: 6,
    name: "USB-C Hub",
    price: 1299,
    image: "/images/usb-hub.jpg",
    category: "Accessories"
  }
];

// ================= API =================

app.get("/api/products", function (req, res) {
  res.json(products);
});

// ================= ORDERS =================

app.post("/api/orders", function (req, res) {

  const customer = req.body.customer;
  const items = req.body.items;
  const totals = req.body.totals;

  if (
    !customer ||
    !customer.name ||
    !customer.email ||
    !customer.address
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required customer details."
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Your cart is empty."
    });
  }

  const validItems = items.every(function (item) {

    return (
      products.some(function (product) {
        return product.id === item.id;
      }) &&
      Number(item.quantity) > 0
    );

  });

  if (!validItems) {
    return res.status(400).json({
      success: false,
      message: "Invalid product or quantity."
    });
  }

  const orderId =
    "ORD-" + Date.now().toString().slice(-8);

  res.json({
    success: true,
    message: "Order placed successfully!",
    orderId: orderId,
    customer: customer.name,
    total: Number(totals.total).toFixed(2),
    estimatedDelivery: "3-5 working days"
  });
});

// ================= FRONTEND =================

// Express 5 requires this syntax to match "/"
app.get("/{*splat}", function (req, res) {

  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );

});

// ================= SERVER =================

app.listen(PORT, "0.0.0.0", function () {

  console.log(
    "E-Commerce Cart running on port " + PORT
  );

});
