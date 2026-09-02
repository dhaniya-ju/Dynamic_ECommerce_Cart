const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

/* =========================================================
   PRODUCTS
========================================================= */

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

/* =========================================================
   TEMPORARY USER STORAGE
========================================================= */

const users = [];

let nextUserId = 1;
let nextOrderId = 1001;

/* =========================================================
   HELPER
========================================================= */

function findUserByEmail(email) {
    return users.find(
        user =>
            user.email.toLowerCase() ===
            email.trim().toLowerCase()
    );
}

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        address: user.address,
        orders: user.orders,
        wishlist: user.wishlist
    };
}

/* =========================================================
   PRODUCTS API
========================================================= */

app.get("/api/products", (req, res) => {
    res.json(products);
});

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

/* =========================================================
   SIGN UP
========================================================= */

app.post("/api/auth/signup", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must contain at least 6 characters"
        });
    }

    if (findUserByEmail(email)) {
        return res.status(409).json({
            message: "An account with this email already exists"
        });
    }

    const user = {
        id: nextUserId++,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: "",
        location: "",
        address: "",
        orders: [],
        wishlist: []
    };

    users.push(user);

    res.status(201).json({
        message: "Account created successfully",
        user: publicUser(user)
    });
});

/* =========================================================
   LOGIN
========================================================= */

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
        user: publicUser(user)
    });
});

/* =========================================================
   GET ACCOUNT
========================================================= */

app.get("/api/account/:userId", (req, res) => {
    const user = users.find(
        u => u.id === Number(req.params.userId)
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json(publicUser(user));
});

/* =========================================================
   UPDATE ACCOUNT
========================================================= */

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
        user.name = String(name).trim();
    }

    if (phone !== undefined) {
        user.phone = String(phone).trim();
    }

    if (location !== undefined) {
        user.location = String(location).trim();
    }

    if (address !== undefined) {
        user.address = String(address).trim();
    }

    res.json({
        message: "Account updated successfully",
        user: publicUser(user)
    });
});

/* =========================================================
   UPDATE LOCATION
========================================================= */

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

    user.location = String(location).trim();

    if (address !== undefined) {
        user.address = String(address).trim();
    }

    res.json({
        message: "Delivery location updated",
        location: user.location,
        address: user.address
    });
});

/* =========================================================
   CREATE ORDER
========================================================= */

app.post("/api/orders", (req, res) => {
    const {
        userId,
        items,
        deliveryAddress,
        paymentMethod
    } = req.body;

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

    const orderItems = [];
    let total = 0;

    items.forEach(item => {
        const product = products.find(
            p => p.id === Number(item.productId)
        );

        if (!product) {
            return;
        }

        const quantity = Math.max(
            1,
            Number(item.quantity) || 1
        );

        const itemTotal = product.price * quantity;

        total += itemTotal;

        orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            total: itemTotal
        });
    });

    if (orderItems.length === 0) {
        return res.status(400).json({
            message: "No valid products found"
        });
    }

    const order = {
        orderId: nextOrderId++,
        date: new Date().toISOString(),
        items: orderItems,
        total,
        deliveryAddress:
            deliveryAddress ||
            user.address ||
            user.location ||
            "Not provided",
        paymentMethod:
            paymentMethod || "Cash on Delivery",
        status: "Order Placed"
    };

    user.orders.push(order);

    res.status(201).json({
        message: "Order placed successfully",
        order
    });
});

/* =========================================================
   GET ORDERS
========================================================= */

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

/* =========================================================
   WISHLIST - GET
========================================================= */

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

/* =========================================================
   WISHLIST - ADD
========================================================= */

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

/* =========================================================
   WISHLIST - REMOVE
========================================================= */

app.delete(
    "/api/wishlist/:userId/:productId",
    (req, res) => {

        const user = users.find(
            u => u.id === Number(req.params.userId)
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const productId =
            Number(req.params.productId);

        user.wishlist =
            user.wishlist.filter(
                id => id !== productId
            );

        res.json({
            message: "Removed from wishlist",
            wishlist: user.wishlist
        });
    }
);

/* =========================================================
   FRONTEND
========================================================= */

app.get("/{*splat}", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
    );
});

/* =========================================================
   START
========================================================= */

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
