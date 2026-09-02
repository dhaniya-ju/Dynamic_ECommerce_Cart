const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend files from the root folder
app.use(express.static(__dirname));

/* =========================
   PRODUCTS
========================= */

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

/* =========================
   TEMPORARY USER STORAGE
========================= */

const users = [];

let nextUserId = 1;
let nextOrderId = 1001;

/* =========================
   AUTH HELPER
========================= */

function findUserByEmail(email) {
  return users.find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );
}

/* =========================
   PRODUCTS API
========================= */

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

/* =========================
   SIGN UP
========================= */

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must contain at least 6 characters"
    });
  }

  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists"
    });
  }

  const newUser = {
    id: nextUserId++,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    location: "",
    address: "",
    phone: "",
    orders: [],
    wishlist: []
  };

  users.push(newUser);

  res.status(201).json({
    message: "Account created successfully",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      location: newUser.location,
      address: newUser.address,
      phone: newUser.phone,
      orders: newUser.orders,
      wishlist: newUser.wishlist
    }
  });
});

/* =========================
   SIGN IN
========================= */

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      address: user.address,
      phone: user.phone,
      orders: user.orders,
      wishlist: user.wishlist
    }
  });
});

/* =========================
   GET ACCOUNT
========================= */

app.get("/api/account/:userId", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location,
    address: user.address,
    phone: user.phone,
    orders: user.orders,
    wishlist: user.wishlist
  });
});

/* =========================
   UPDATE ACCOUNT
========================= */

app.put("/api/account/:userId", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const {
    name,
    phone,
    location,
    address
  } = req.body;

  if (name !== undefined) {
    user.name = name.trim();
  }

  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  if (location !== undefined) {
    user.location = location.trim();
  }

  if (address !== undefined) {
    user.address = address.trim();
  }

  res.json({
    message: "Account updated successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      address: user.address,
      phone: user.phone,
      orders: user.orders,
      wishlist: user.wishlist
    }
  });
});

/* =========================
   UPDATE LOCATION
========================= */

app.put("/api/account/:userId/location", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const { location, address } = req.body;

  if (!location) {
    return res.status(400).json({
      message: "Location is required"
    });
  }

  user.location = location.trim();

  if (address !== undefined) {
    user.address = address.trim();
  }

  res.json({
    message: "Delivery location updated",
    location: user.location,
    address: user.address
  });
});

/* =========================
   CREATE ORDER
========================= */

app.post("/api/orders", (req, res) => {
  const {
    userId,
    items,
    deliveryAddress,
    paymentMethod
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required"
    });
  }

  const user = users.find(
    u => u.id === Number(userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Cart is empty"
    });
  }

  let total = 0;

  const orderItems = items.map(item => {
    const product = products.find(
      p => p.id === Number(item.productId)
    );

    if (!product) {
      return null;
    }

    const quantity = Math.max(
      1,
      Number(item.quantity) || 1
    );

    const itemTotal = product.price * quantity;

    total += itemTotal;

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: itemTotal
    };
  }).filter(Boolean);

  if (orderItems.length === 0) {
    return res.status(400).json({
      message: "No valid products in cart"
    });
  }

  const order = {
    orderId: nextOrderId++,
    date: new Date().toISOString(),
    items: orderItems,
    total: total,
    deliveryAddress:
      deliveryAddress || user.address || user.location || "",
    paymentMethod:
      paymentMethod || "Cash on Delivery",
    status: "Order Placed"
  };

  user.orders.push(order);

  res.status(201).json({
    message: "Order placed successfully",
    order: order
  });
});

/* =========================
   GET USER ORDERS
========================= */

app.get("/api/orders/:userId", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json(user.orders);
});

/* =========================
   WISHLIST - ADD
========================= */

app.post("/api/wishlist/:userId", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const productId = Number(req.body.productId);

  const product = products.find(
    p => p.id === productId
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
  }

  res.json({
    message: "Added to wishlist",
    wishlist: user.wishlist
  });
});

/* =========================
   WISHLIST - REMOVE
========================= */

app.delete("/api/wishlist/:userId/:productId", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const productId = Number(req.params.productId);

  user.wishlist = user.wishlist.filter(
    id => id !== productId
  );

  res.json({
    message: "Removed from wishlist",
    wishlist: user.wishlist
  });
});

/* =========================
   GET WISHLIST
========================= */

app.get("/api/wishlist/:userId", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.userId)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const wishlistProducts = products.filter(
    product => user.wishlist.includes(product.id)
  );

  res.json(wishlistProducts);
});

/* =========================
   FRONTEND ROUTES
========================= */

app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
