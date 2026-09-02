/* =========================================================
   GLOBAL DATA
========================================================= */

let products = [];

let cart =
    JSON.parse(localStorage.getItem("shopEaseCart")) || [];

let currentUser =
    JSON.parse(localStorage.getItem("shopEaseUser")) || null;


/* =========================================================
   ELEMENTS
========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const cartBtn =
    document.getElementById("cartBtn");

const cartPanel =
    document.getElementById("cartPanel");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const checkoutModal =
    document.getElementById("checkoutModal");

const closeModal =
    document.getElementById("closeModal");

const checkoutForm =
    document.getElementById("checkoutForm");

const themeBtn =
    document.getElementById("themeBtn");

const accountBtn =
    document.getElementById("accountBtn");

const accountText =
    document.getElementById("accountText");

const locationBtn =
    document.getElementById("locationBtn");

const wishlistBtn =
    document.getElementById("wishlistBtn");

const loginModal =
    document.getElementById("loginModal");

const signupModal =
    document.getElementById("signupModal");

const accountModal =
    document.getElementById("accountModal");

const locationModal =
    document.getElementById("locationModal");

const profileModal =
    document.getElementById("profileModal");

const ordersModal =
    document.getElementById("ordersModal");

const wishlistModal =
    document.getElementById("wishlistModal");


/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

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


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {
    localStorage.setItem(
        "shopEaseCart",
        JSON.stringify(cart)
    );
}


/* =========================================================
   SAVE USER
========================================================= */

function saveUser() {

    if (currentUser) {

        localStorage.setItem(
            "shopEaseUser",
            JSON.stringify(currentUser)
        );

    } else {

        localStorage.removeItem(
            "shopEaseUser"
        );
    }
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        if (!response.ok) {
            throw new Error("API failed");
        }

        const apiProducts =
            await response.json();

        products = apiProducts.map(product => {

            const imageMap = {
                1: "headphones.jpg",
                2: "keyboard.jpg",
                3: "mouse.jpg",
                4: "smartwatch.jpg",
                5: "speaker.jpg",
                6: "usb-hub.jpg"
            };

            return {
                ...product,
                image:
                    imageMap[product.id] || ""
            };
        });

    } catch (error) {

        console.log(
            "Using fallback products",
            error
        );

        products = fallbackProducts;
    }

    displayProducts(products);
}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts(productList) {

    if (!productList.length) {

        productsGrid.innerHTML = `
            <div class="loading">
                No products found.
            </div>
        `;

        return;
    }

    productsGrid.innerHTML =
        productList.map(product => {

            const wished =
                currentUser &&
                currentUser.wishlist &&
                currentUser.wishlist.includes(product.id);

            return `
                <article class="product-card">

                    <div class="product-image-wrapper">

                        <img
                            class="product-image"
                            src="${product.image}"
                            alt="${product.name}"
                            onerror="
                                this.onerror=null;
                                this.src='${getFallbackImage(product.id)}';
                            "
                        >

                        <button
                            class="wishlist-heart ${
                                wished ? "active" : ""
                            }"
                            onclick="toggleWishlist(${product.id})"
                            title="Wishlist"
                        >
                            ${wished ? "❤️" : "♡"}
                        </button>

                    </div>

                    <div class="product-info">

                        <div class="product-category">
                            ${product.category}
                        </div>

                        <h3 class="product-name">
                            ${product.name}
                        </h3>

                        <div class="product-bottom">

                            <div class="product-price">
                                ₹${Number(
                                    product.price
                                ).toLocaleString("en-IN")}
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


/* =========================================================
   IMAGE FALLBACK
========================================================= */

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


/* =========================================================
   ADD CART
========================================================= */

function addToCart(productId) {

    const product =
        products.find(
            product => product.id === productId
        );

    if (!product) {
        return;
    }

    const existingItem =
        cart.find(
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

    saveCart();
    updateCart();
    openCart();
}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    cartCount.textContent =
        totalItems;


    const totalPrice =
        cart.reduce(
            (total, item) =>
                total +
                item.price * item.quantity,
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


    cartItems.innerHTML =
        cart.map(item => {

            return `
                <div class="cart-item">

                    <img
                        class="cart-item-image"
                        src="${item.image}"
                        alt="${item.name}"
                        onerror="
                            this.src='${getFallbackImage(item.id)}'
                        "
                    >

                    <div class="cart-item-info">

                        <div class="cart-item-name">
                            ${item.name}
                        </div>

                        <div class="cart-item-price">
                            ₹${Number(
                                item.price
                            ).toLocaleString("en-IN")}
                        </div>

                        <div class="quantity-controls">

                            <button
                                class="quantity-btn"
                                onclick="
                                    changeQuantity(
                                        ${item.id},
                                        -1
                                    )
                                "
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                class="quantity-btn"
                                onclick="
                                    changeQuantity(
                                        ${item.id},
                                        1
                                    )
                                "
                            >
                                +
                            </button>

                            <button
                                class="remove-btn"
                                onclick="
                                    removeFromCart(
                                        ${item.id}
                                    )
                                "
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            item => item.id === productId
        );

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== productId
            );
    }

    saveCart();
    updateCart();
}


/* =========================================================
   REMOVE CART
========================================================= */

function removeFromCart(productId) {

    cart =
        cart.filter(
            item => item.id !== productId
        );

    saveCart();
    updateCart();
}


/* =========================================================
   CART OPEN
========================================================= */

function openCart() {

    cartPanel.classList.add("open");
    cartOverlay.classList.add("show");

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
   CART CLOSE
========================================================= */

function closeCartPanel() {

    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("show");

    document.body.style.overflow =
        "";
}


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add("show");
    document.body.style.overflow =
        "hidden";
}


function closeAnyModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    document.body.style.overflow =
        "";
}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(
    email,
    password
) {

    try {

        const response =
            await fetch(
                "/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Login failed"
            );

            return;
        }

        currentUser =
            data.user;

        saveUser();

        updateAccountUI();

        closeAnyModal(loginModal);

        alert(
            `Welcome back, ${currentUser.name}! 👋`
        );

        if (products.length) {
            displayProducts(products);
        }

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   LOGIN FORM
========================================================= */

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            loginUser(
                email,
                password
            );
        }
    );


/* =========================================================
   SIGN UP
========================================================= */

document
    .getElementById("signupForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "signupName"
                ).value.trim();

            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "signupPassword"
                ).value;

            try {

                const response =
                    await fetch(
                        "/api/auth/signup",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Signup failed"
                    );

                    return;
                }

                currentUser =
                    data.user;

                saveUser();

                updateAccountUI();

                closeAnyModal(signupModal);

                document
                    .getElementById("signupForm")
                    .reset();

                alert(
                    `Account created successfully! Welcome ${currentUser.name} 🎉`
                );

                if (products.length) {
                    displayProducts(products);
                }

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );
            }
        }
    );


/* =========================================================
   ACCOUNT UI
========================================================= */

function updateAccountUI() {

    const loggedOut =
        document.getElementById(
            "loggedOutAccount"
        );

    const loggedIn =
        document.getElementById(
            "loggedInAccount"
        );

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    const accountLocationText =
        document.getElementById(
            "accountLocationText"
        );


    if (currentUser) {

        accountText.textContent =
            currentUser.name.split(" ")[0];

        profileName.textContent =
            currentUser.name;

        profileEmail.textContent =
            currentUser.email;

        loggedOut.classList.add("hidden");

        loggedIn.classList.remove("hidden");

        accountLocationText.textContent =
            currentUser.location ||
            "Add your location";

    } else {

        accountText.textContent =
            "Account";

        profileName.textContent =
            "My Account";

        profileEmail.textContent =
            "Sign in to view account";

        loggedOut.classList.remove("hidden");

        loggedIn.classList.add("hidden");

        accountLocationText.textContent =
            "Add your location";
    }
}


/* =========================================================
   ACCOUNT BUTTON
========================================================= */

accountBtn.addEventListener(
    "click",
    () => {

        updateAccountUI();

        openModal(accountModal);
    }
);


/* =========================================================
   LOGIN FROM ACCOUNT
========================================================= */

document
    .getElementById("accountLoginBtn")
    .addEventListener(
        "click",
        () => {

            closeAnyModal(accountModal);

            openModal(loginModal);
        }
    );


/* =========================================================
   SHOW SIGNUP
========================================================= */

document
    .getElementById("showSignup")
    .addEventListener(
        "click",
        () => {

            closeAnyModal(loginModal);

            openModal(signupModal);
        }
    );


/* =========================================================
   SHOW LOGIN
========================================================= */

document
    .getElementById("showLogin")
    .addEventListener(
        "click",
        () => {

            closeAnyModal(signupModal);

            openModal(loginModal);
        }
    );


/* =========================================================
   LOCATION
========================================================= */

locationBtn.addEventListener(
    "click",
    () => {

        if (!currentUser) {

            alert(
                "Please sign in to save your delivery location."
            );

            openModal(loginModal);

            return;
        }

        document.getElementById(
            "locationInput"
        ).value =
            currentUser.location || "";

        document.getElementById(
            "addressInput"
        ).value =
            currentUser.address || "";

        openModal(locationModal);
    }
);


/* =========================================================
   LOCATION FORM
========================================================= */

document
    .getElementById("locationForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!currentUser) {
                return;
            }

            const location =
                document.getElementById(
                    "locationInput"
                ).value.trim();

            const address =
                document.getElementById(
                    "addressInput"
                ).value.trim();

            try {

                const response =
                    await fetch(
                        `/api/account/${currentUser.id}/location`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                location,
                                address
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to update location."
                    );

                    return;
                }

                currentUser.location =
                    data.location;

                currentUser.address =
                    data.address;

                saveUser();

                updateAccountUI();

                closeAnyModal(locationModal);

                alert(
                    "Delivery location saved successfully 📍"
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );
            }
        }
    );


/* =========================================================
   ACCOUNT LOCATION BUTTON
========================================================= */

document
    .getElementById("locationAccountBtn")
    .addEventListener(
        "click",
        () => {

            closeAnyModal(accountModal);

            if (!currentUser) {
                return;
            }

            document.getElementById(
                "locationInput"
            ).value =
                currentUser.location || "";

            document.getElementById(
                "addressInput"
            ).value =
                currentUser.address || "";

            openModal(locationModal);
        }
    );


/* =========================================================
   EDIT PROFILE
========================================================= */

document
    .getElementById("editProfileBtn")
    .addEventListener(
        "click",
        () => {

            if (!currentUser) {
                return;
            }

            document.getElementById(
                "profileNameInput"
            ).value =
                currentUser.name;

            document.getElementById(
                "profileEmailInput"
            ).value =
                currentUser.email;

            document.getElementById(
                "profilePhoneInput"
            ).value =
                currentUser.phone || "";

            closeAnyModal(accountModal);

            openModal(profileModal);
        }
    );


/* =========================================================
   PROFILE FORM
========================================================= */

document
    .getElementById("profileForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!currentUser) {
                return;
            }

            const name =
                document.getElementById(
                    "profileNameInput"
                ).value.trim();

            const phone =
                document.getElementById(
                    "profilePhoneInput"
                ).value.trim();

            try {

                const response =
                    await fetch(
                        `/api/account/${currentUser.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                name,
                                phone
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to update profile."
                    );

                    return;
                }

                currentUser =
                    data.user;

                saveUser();

                updateAccountUI();

                closeAnyModal(profileModal);

                alert(
                    "Profile updated successfully ✅"
                );

                displayProducts(products);

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );
            }
        }
    );


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            currentUser = null;

            saveUser();

            updateAccountUI();

            closeAnyModal(accountModal);

            displayProducts(products);

            alert(
                "You have been logged out successfully."
            );
        }
    );


/* =========================================================
   ORDERS
========================================================= */

document
    .getElementById("ordersBtn")
    .addEventListener(
        "click",
        async () => {

            if (!currentUser) {
                return;
            }

            closeAnyModal(accountModal);

            await loadOrders();

            openModal(ordersModal);
        }
    );


async function loadOrders() {

    const ordersList =
        document.getElementById(
            "ordersList"
        );

    ordersList.innerHTML = `
        <div class="loading">
            Loading orders...
        </div>
    `;

    try {

        const response =
            await fetch(
                `/api/orders/${currentUser.id}`
            );

        const orders =
            await response.json();

        if (!orders.length) {

            ordersList.innerHTML = `
                <div class="empty-state">
                    <div>📦</div>
                    <h3>No Orders Yet</h3>
                    <p>
                        Your placed orders will
                        appear here.
                    </p>
                </div>
            `;

            return;
        }

        ordersList.innerHTML =
            orders
                .slice()
                .reverse()
                .map(order => {

                    const date =
                        new Date(
                            order.date
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                    const items =
                        order.items
                            .map(
                                item =>
                                    `
                                    <div class="order-product">
                                        <span>
                                            ${item.name}
                                        </span>

                                        <span>
                                            ×${item.quantity}
                                        </span>
                                    </div>
                                    `
                            )
                            .join("");

                    return `
                        <div class="order-card">

                            <div class="order-top">

                                <div>
                                    <strong>
                                        Order #${order.orderId}
                                    </strong>

                                    <small>
                                        ${date}
                                    </small>
                                </div>

                                <span class="order-status">
                                    ${order.status}
                                </span>

                            </div>

                            <div class="order-products">
                                ${items}
                            </div>

                            <div class="order-bottom">

                                <span>
                                    ${order.paymentMethod}
                                </span>

                                <strong>
                                    ₹${Number(
                                        order.total
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                        </div>
                    `;

                })
                .join("");

    } catch (error) {

        console.error(error);

        ordersList.innerHTML = `
            <div class="empty-state">
                Unable to load orders.
            </div>
        `;
    }
}


/* =========================================================
   WISHLIST
========================================================= */

wishlistBtn.addEventListener(
    "click",
    async () => {

        if (!currentUser) {

            alert(
                "Please sign in to use your wishlist."
            );

            openModal(loginModal);

            return;
        }

        await loadWishlist();

        openModal(wishlistModal);
    }
);


document
    .getElementById("accountWishlistBtn")
    .addEventListener(
        "click",
        async () => {

            closeAnyModal(accountModal);

            await loadWishlist();

            openModal(wishlistModal);
        }
    );


async function loadWishlist() {

    const wishlistList =
        document.getElementById(
            "wishlistList"
        );

    wishlistList.innerHTML = `
        <div class="loading">
            Loading wishlist...
        </div>
    `;

    try {

        const response =
            await fetch(
                `/api/wishlist/${currentUser.id}`
            );

        const wishlist =
            await response.json();

        currentUser.wishlist =
            wishlist.map(
                product => product.id
            );

        saveUser();

        if (!wishlist.length) {

            wishlistList.innerHTML = `
                <div class="empty-state">
                    <div>❤️</div>
                    <h3>Your Wishlist is Empty</h3>
                    <p>
                        Tap the heart on a product
                        to save it here.
                    </p>
                </div>
            `;

            return;
        }

        wishlistList.innerHTML =
            wishlist.map(product => {

                return `
                    <div class="wishlist-card">

                        <img
                            src="${product.image ||
                            getFallbackImage(product.id)}"
                            alt="${product.name}"
                            onerror="
                                this.src='${getFallbackImage(
                                    product.id
                                )}'
                            "
                        >

                        <div class="wishlist-info">

                            <span>
                                ${product.category}
                            </span>

                            <h3>
                                ${product.name}
                            </h3>

                            <strong>
                                ₹${Number(
                                    product.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                        <button
                            class="wishlist-remove"
                            onclick="
                                removeWishlist(
                                    ${product.id}
                                )
                            "
                        >
                            ×
                        </button>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(error);

        wishlistList.innerHTML = `
            <div class="empty-state">
                Unable to load wishlist.
            </div>
        `;
    }
}


/* =========================================================
   TOGGLE WISHLIST
========================================================= */

async function toggleWishlist(
    productId
) {

    if (!currentUser) {

        alert(
            "Please sign in to add products to your wishlist."
        );

        openModal(loginModal);

        return;
    }

    const isWished =
        currentUser.wishlist.includes(
            productId
        );

    try {

        let response;

        if (isWished) {

            response =
                await fetch(
                    `/api/wishlist/${currentUser.id}/${productId}`,
                    {
                        method: "DELETE"
                    }
                );

        } else {

            response =
                await fetch(
                    `/api/wishlist/${currentUser.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            productId
                        })
                    }
                );
        }

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Wishlist update failed."
            );

            return;
        }

        currentUser.wishlist =
            data.wishlist;

        saveUser();

        displayProducts(products);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update wishlist."
        );
    }
}


/* =========================================================
   REMOVE WISHLIST
========================================================= */

async function removeWishlist(
    productId
) {

    try {

        const response =
            await fetch(
                `/api/wishlist/${currentUser.id}/${productId}`,
                {
                    method: "DELETE"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to remove item."
            );

            return;
        }

        currentUser.wishlist =
            data.wishlist;

        saveUser();

        await loadWishlist();

        displayProducts(products);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to remove wishlist item."
        );
    }
}


/* =========================================================
   CHECKOUT
========================================================= */

checkoutBtn.addEventListener(
    "click",
    () => {

        if (cart.length === 0) {

            alert(
                "Your cart is empty!"
            );

            return;
        }

        if (!currentUser) {

            alert(
                "Please sign in before checkout."
            );

            openModal(loginModal);

            return;
        }

        document.getElementById(
            "customerName"
        ).value =
            currentUser.name || "";

        document.getElementById(
            "customerEmail"
        ).value =
            currentUser.email || "";

        document.getElementById(
            "customerAddress"
        ).value =
            currentUser.address ||
            currentUser.location ||
            "";

        openModal(checkoutModal);
    }
);


/* =========================================================
   PLACE ORDER
========================================================= */

checkoutForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!currentUser) {

            alert(
                "Please sign in first."
            );

            return;
        }

        if (!cart.length) {

            alert(
                "Your cart is empty."
            );

            return;
        }

        const deliveryAddress =
            document.getElementById(
                "customerAddress"
            ).value.trim();

        const paymentMethod =
            document.getElementById(
                "paymentMethod"
            ).value;

        try {

            const response =
                await fetch(
                    "/api/orders",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({

                            userId:
                                currentUser.id,

                            items:
                                cart.map(item => ({
                                    productId:
                                        item.id,

                                    quantity:
                                        item.quantity
                                })),

                            deliveryAddress,

                            paymentMethod
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Order failed."
                );

                return;
            }

            currentUser.orders =
                currentUser.orders || [];

            currentUser.orders.push(
                data.order
            );

            saveUser();

            cart = [];

            saveCart();

            updateCart();

            checkoutForm.reset();

            closeAnyModal(
                checkoutModal
            );

            closeCartPanel();

            alert(
                `Order #${data.order.orderId} placed successfully! 🎉`
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to place order. Please try again."
            );
        }
    }
);


/* =========================================================
   CLOSE BUTTONS
========================================================= */

closeCart.addEventListener(
    "click",
    closeCartPanel
);

cartOverlay.addEventListener(
    "click",
    closeCartPanel
);

closeModal.addEventListener(
    "click",
    () => closeAnyModal(checkoutModal)
);

document
    .getElementById("closeLogin")
    .addEventListener(
        "click",
        () => closeAnyModal(loginModal)
    );

document
    .getElementById("closeSignup")
    .addEventListener(
        "click",
        () => closeAnyModal(signupModal)
    );

document
    .getElementById("closeAccount")
    .addEventListener(
        "click",
        () => closeAnyModal(accountModal)
    );

document
    .getElementById("closeLocation")
    .addEventListener(
        "click",
        () => closeAnyModal(locationModal)
    );

document
    .getElementById("closeProfile")
    .addEventListener(
        "click",
        () => closeAnyModal(profileModal)
    );

document
    .getElementById("closeOrders")
    .addEventListener(
        "click",
        () => closeAnyModal(ordersModal)
    );

document
    .getElementById("closeWishlist")
    .addEventListener(
        "click",
        () => closeAnyModal(wishlistModal)
    );


/* =========================================================
   CLOSE MODAL ON OUTSIDE CLICK
========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {
                    closeAnyModal(modal);
                }

            }
        );

    });


/* =========================================================
   CATEGORY FILTER
========================================================= */

const filterButtons =
    document.querySelectorAll(
        ".filter"
    );

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {
                btn.classList.remove(
                    "active"
                );
            });

            button.classList.add(
                "active"
            );

            const category =
                button.dataset.category;

            if (category === "All") {

                displayProducts(products);

            } else {

                const filtered =
                    products.filter(
                        product =>
                            product.category ===
                            category
                    );

                displayProducts(
                    filtered
                );
            }

        }
    );

});


/* =========================================================
   DARK / LIGHT MODE
========================================================= */

const savedTheme =
    localStorage.getItem(
        "theme"
    );

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent = "☀️";

} else {

    themeBtn.textContent = "🌙";
}


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        const isDark =
            document.body.classList.contains(
                "dark"
            );

        if (isDark) {

            themeBtn.textContent =
                "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            themeBtn.textContent =
                "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );
        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

updateAccountUI();

updateCart();

loadProducts();
