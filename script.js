let products = [];
let cart = [];

const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const checkoutForm = document.getElementById("checkoutForm");

const themeBtn = document.getElementById("themeBtn");


// ==========================================
// PRODUCT DATA
// ==========================================

const fallbackProducts = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 1499,
        category: "Audio",
        image: "headphones.jpg"
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        price: 2499,
        category: "Accessories",
        image: "keyboard.jpg"
    },
    {
        id: 3,
        name: "Wireless Mouse",
        price: 899,
        category: "Accessories",
        image: "mouse.jpg"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 2999,
        category: "Wearables",
        image: "smartwatch.jpg"
    },
    {
        id: 5,
        name: "Bluetooth Speaker",
        price: 1999,
        category: "Audio",
        image: "speaker.jpg"
    },
    {
        id: 6,
        name: "USB Hub",
        price: 699,
        category: "Accessories",
        image: "usb-hub.jpg"
    }
];


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const apiProducts = await response.json();

        products = apiProducts.map((product) => {

            let image = "";

            switch (product.id) {
                case 1:
                    image = "headphones.jpg";
                    break;

                case 2:
                    image = "keyboard.jpg";
                    break;

                case 3:
                    image = "mouse.jpg";
                    break;

                case 4:
                    image = "smartwatch.jpg";
                    break;

                case 5:
                    image = "speaker.jpg";
                    break;

                case 6:
                    image = "usb-hub.jpg";
                    break;

                default:
                    image = "";
            }

            return {
                ...product,
                image: image
            };
        });

    } catch (error) {

        console.log("Using local product data:", error);

        products = fallbackProducts;
    }

    displayProducts(products);
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(productList) {

    if (!productList.length) {

        productsGrid.innerHTML = `
            <div class="loading">
                No products found.
            </div>
        `;

        return;
    }


    productsGrid.innerHTML = productList.map(product => {

        return `
            <article class="product-card">

                <img
                    class="product-image"
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.onerror=null; this.src='${getFallbackImage(product.id)}';"
                >

                <div class="product-info">

                    <div class="product-category">
                        ${product.category}
                    </div>

                    <h3 class="product-name">
                        ${product.name}
                    </h3>

                    <div class="product-bottom">

                        <div class="product-price">
                            ₹${Number(product.price).toLocaleString("en-IN")}
                        </div>

                        <button
                            class="add-btn"
                            onclick="addToCart(${product.id})"
                        >
                            Add to Cart
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}


// ==========================================
// IMAGE FALLBACK
// ==========================================

function getFallbackImage(id) {

    const images = {
        1: "headphones.jpg",
        2: "keyboard.jpg",
        3: "mouse.jpg",
        4: "smartwatch.jpg",
        5: "speaker.jpg",
        6: "usb-hub.jpg"
    };

    return images[id] || "headphones.jpg";
}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(productId) {

    const product = products.find(
        product => product.id === productId
    );

    if (!product) {
        return;
    }

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCart();

    openCart();
}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;


    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartTotal.textContent =
        `₹${totalPrice.toLocaleString("en-IN")}`;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        return;
    }


    cartItems.innerHTML = cart.map(item => {

        return `
            <div class="cart-item">

                <img
                    class="cart-item-image"
                    src="${item.image}"
                    alt="${item.name}"
                >

                <div class="cart-item-info">

                    <div class="cart-item-name">
                        ${item.name}
                    </div>

                    <div class="cart-item-price">
                        ₹${Number(item.price).toLocaleString("en-IN")}
                    </div>

                    <div class="quantity-controls">

                        <button
                            class="quantity-btn"
                            onclick="changeQuantity(${item.id}, -1)"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            class="quantity-btn"
                            onclick="changeQuantity(${item.id}, 1)"
                        >
                            +
                        </button>

                        <button
                            class="remove-btn"
                            onclick="removeFromCart(${item.id})"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            </div>
        `;

    }).join("");
}


// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQuantity(productId, change) {

    const item = cart.find(
        item => item.id === productId
    );

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {

        cart = cart.filter(
            item => item.id !== productId
        );

    }

    updateCart();
}


// ==========================================
// REMOVE FROM CART
// ==========================================

function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    updateCart();
}


// ==========================================
// OPEN CART
// ==========================================

function openCart() {

    cartPanel.classList.add("open");
    cartOverlay.classList.add("show");

    document.body.style.overflow = "hidden";
}


// ==========================================
// CLOSE CART
// ==========================================

function closeCartPanel() {

    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("show");

    document.body.style.overflow = "";
}


// ==========================================
// CART EVENTS
// ==========================================

cartBtn.addEventListener(
    "click",
    openCart
);

closeCart.addEventListener(
    "click",
    closeCartPanel
);

cartOverlay.addEventListener(
    "click",
    closeCartPanel
);


// ==========================================
// CATEGORY FILTER
// ==========================================

const filterButtons =
    document.querySelectorAll(".filter");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const category =
            button.dataset.category;


        if (category === "All") {

            displayProducts(products);

        } else {

            const filtered =
                products.filter(
                    product =>
                        product.category === category
                );

            displayProducts(filtered);
        }

    });

});


// ==========================================
// CHECKOUT
// ==========================================

checkoutBtn.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert("Your cart is empty!");

            return;
        }

        checkoutModal.classList.add("show");
    }
);


closeModal.addEventListener(
    "click",
    () => {
        checkoutModal.classList.remove("show");
    }
);


checkoutModal.addEventListener(
    "click",
    (event) => {

        if (event.target === checkoutModal) {

            checkoutModal.classList.remove("show");
        }
    }
);


// ==========================================
// PLACE ORDER
// ==========================================

checkoutForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const name =
            document.getElementById("customerName").value;

        alert(
            `Thank you, ${name}! 🎉\n\nYour order has been placed successfully.`
        );

        cart = [];

        updateCart();

        checkoutForm.reset();

        checkoutModal.classList.remove("show");

        closeCartPanel();
    }
);


// ==========================================
// DARK / LIGHT MODE
// ==========================================

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

} else {

    themeBtn.textContent = "🌙";
}


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");


        if (isDark) {

            themeBtn.textContent = "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            themeBtn.textContent = "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );
        }

    }
);


// ==========================================
// START APPLICATION
// ==========================================

loadProducts();

updateCart();
