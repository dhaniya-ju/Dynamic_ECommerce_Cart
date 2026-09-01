const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend files from the root folder
app.use(express.static(__dirname));

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1499,
    icon: "🎧",
    category: "Audio"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 2499,
    icon: "⌨️",
    category: "Accessories"
  },
  {
    id: 3,
    name: "Wireless Mouse",
    price: 899,
    icon: "🖱️",
    category: "Accessories"
  },
  {
    id: 4,
    name: "Smart Watch",
    price: 2999,
    icon: "⌚",
    category: "Wearables"
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    price: 1999,
    icon: "🔊",
    category: "Audio"
  },
  {
    id: 6,
    name: "USB Hub",
    price: 699,
    icon: "🔌",
    category: "Accessories"
  }
];

// Get all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Get a single product
app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    p => p.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.json(product);
});

// Handle frontend routes
app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
