var products = [];

var cart = JSON.parse(
  localStorage.getItem("cart") || "[]"
);


/* ================= THEME ================= */

function setTheme(theme) {

  var isDark = theme === "dark";

  document.body.classList.toggle("dark", isDark);

  var button = document.getElementById("themeToggle");

  if (button) {
    button.textContent = isDark ? "☀️" : "🌙";
  }

  localStorage.setItem("theme", theme);
}


function toggleTheme() {

  var isDark =
    document.body.classList.contains("dark");

  setTheme(isDark ? "light" : "dark");
}


/* ================= SCROLL ================= */

function scrollToProducts() {

  document
    .getElementById("products")
    .scrollIntoView({
      behavior: "smooth"
    });
}


/* ================= MONEY ================= */

function money(value) {

  return "₹" +
    Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2
    });
}


/* ================= LOAD PRODUCTS ================= */

function loadProducts() {

  fetch("/api/products")

    .then(function (response) {

      if (!response.ok) {
        throw new Error("Unable to load products");
      }

      return response.json();
    })

    .then(function (data) {

      products = data;

      document.getElementById(
        "productCount"
      ).textContent =
        products.length + " products";

      renderProducts();

      updateCartCount();

    })

    .catch(function (error) {

      console.error(error);

      document.getElementById(
        "productGrid"
      ).innerHTML =
        '<div class="empty">' +
        'Unable to load products.' +
        '<br><br>' +
        'Please restart the server.' +
        '</div>';

    });
}


/* ================= RENDER PRODUCTS ================= */

function renderProducts() {

  var grid =
    document.getElementById("productGrid");

  grid.innerHTML = "";


  products.forEach(function (product) {

    var card =
      document.createElement("article");

    card.className = "product";


    var imageBox =
      document.createElement("div");

    imageBox.className =
      "product-image-box";


    var image =
      document.createElement("img");

    image.className =
      "product-image";

    image.src =
      product.image;

    image.alt =
      product.name;


    image.onerror = function () {

      image.style.display = "none";

      imageBox.textContent =
        "Image not found";

      imageBox.classList.add(
        "image-error"
      );
    };


    imageBox.appendChild(image);


    var category =
      document.createElement("div");

    category.className = "category";

    category.textContent =
      product.category.toUpperCase();


    var name =
      document.createElement("h3");

    name.textContent =
      product.name;


    var bottom =
      document.createElement("div");

    bottom.className =
      "product-bottom";


    var price =
      document.createElement("span");

    price.className = "price";

    price.textContent =
      money(product.price);


    var button =
      document.createElement("button");

    button.className = "add";

    button.type = "button";

    button.textContent = "+ Add";


    button.onclick = function () {

      addToCart(product.id);

    };


    bottom.appendChild(price);

    bottom.appendChild(button);


    card.appendChild(imageBox);

    card.appendChild(category);

    card.appendChild(name);

    card.appendChild(bottom);


    grid.appendChild(card);

  });
}


/* ================= CART ================= */

function addToCart(id) {

  var existing =
    cart.find(function (item) {
      return item.id === id;
    });


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({
      id: id,
      quantity: 1
    });

  }


  saveCart();

  showToast("Added to cart ✓");
}


function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();

  renderCart();
}


function updateCartCount() {

  var count =
    cart.reduce(
      function (sum, item) {
        return sum + item.quantity;
      },
      0
    );


  document.getElementById(
    "cartCount"
  ).textContent = count;
}


/* ================= CART PRODUCTS ================= */

function getCartProducts() {

  return cart

    .map(function (item) {

      var product =
        products.find(function (p) {
          return p.id === item.id;
        });


      if (!product) {
        return null;
      }


      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: item.quantity
      };

    })

    .filter(function (item) {
      return item !== null;
    });
}


/* ================= TOTALS ================= */

function calculateTotals() {

  var items =
    getCartProducts();


  var subtotal =
    items.reduce(
      function (sum, product) {

        return sum +
          product.price *
          product.quantity;

      },
      0
    );


  var shipping = 0;


  if (subtotal > 0 && subtotal < 3000) {
    shipping = 80;
  }


  var tax =
    subtotal * 0.05;


  return {
    subtotal: subtotal,
    shipping: shipping,
    tax: tax,
    total: subtotal + shipping + tax
  };
}


/* ================= CART DISPLAY ================= */

function renderCart() {

  var items =
    getCartProducts();


  var box =
    document.getElementById("cartItems");


  var summary =
    document.getElementById("cartSummary");


  var checkoutBtn =
    document.getElementById("checkoutBtn");


  if (items.length === 0) {

    box.innerHTML =
      '<div class="empty">' +
      '🛒' +
      '<br><br>' +
      'Your cart is empty.' +
      '<br>' +
      'Add a product to continue.' +
      '</div>';


    summary.innerHTML = "";

    checkoutBtn.disabled = true;

    checkoutBtn.style.opacity = "0.5";

    return;
  }


  checkoutBtn.disabled = false;

  checkoutBtn.style.opacity = "1";


  box.innerHTML = "";


  items.forEach(function (product) {

    var row =
      document.createElement("div");

    row.className = "cart-row";


    var icon =
      document.createElement("div");

    icon.className = "mini-icon";


    var image =
      document.createElement("img");

    image.src = product.image;

    image.alt = product.name;


    icon.appendChild(image);


    var info =
      document.createElement("div");


    var title =
      document.createElement("strong");

    title.textContent =
      product.name;


    var qty =
      document.createElement("div");

    qty.className = "qty";


    var minus =
      document.createElement("button");

    minus.type = "button";

    minus.textContent = "−";


    minus.onclick = function () {

      changeQty(product.id, -1);

    };


    var quantity =
      document.createElement("span");

    quantity.textContent =
      product.quantity;


    var plus =
      document.createElement("button");

    plus.type = "button";

    plus.textContent = "+";


    plus.onclick = function () {

      changeQty(product.id, 1);

    };


    var remove =
      document.createElement("button");

    remove.type = "button";

    remove.className = "remove";

    remove.textContent = "Remove";


    remove.onclick = function () {

      removeItem(product.id);

    };


    qty.appendChild(minus);

    qty.appendChild(quantity);

    qty.appendChild(plus);

    qty.appendChild(remove);


    info.appendChild(title);

    info.appendChild(qty);


    var total =
      document.createElement("strong");

    total.textContent =
      money(
        product.price *
        product.quantity
      );


    row.appendChild(icon);

    row.appendChild(info);

    row.appendChild(total);


    box.appendChild(row);

  });


  var t =
    calculateTotals();


  summary.innerHTML =
    '<div class="sum-line">' +
    '<span>Subtotal</span>' +
    '<span>' +
    money(t.subtotal) +
    '</span>' +
    '</div>' +

    '<div class="sum-line">' +
    '<span>Shipping</span>' +
    '<span>' +
    (t.shipping ?
      money(t.shipping) :
      "FREE") +
    '</span>' +
    '</div>' +

    '<div class="sum-line">' +
    '<span>Tax (5%)</span>' +
    '<span>' +
    money(t.tax) +
    '</span>' +
    '</div>' +

    '<div class="sum-line total">' +
    '<span>Total</span>' +
    '<span>' +
    money(t.total) +
    '</span>' +
    '</div>';
}


/* ================= QUANTITY ================= */

function changeQty(id, amount) {

  var item =
    cart.find(function (x) {
      return x.id === id;
    });


  if (!item) {
    return;
  }


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(function (x) {
        return x.id !== id;
      });

  }


  saveCart();
}


/* ================= REMOVE ================= */

function removeItem(id) {

  cart =
    cart.filter(function (x) {
      return x.id !== id;
    });


  saveCart();

  showToast("Item removed");
}


/* ================= CART MODAL ================= */

function openCart() {

  renderCart();

  document
    .getElementById("cartOverlay")
    .classList.remove("hidden");
}


function closeCart() {

  document
    .getElementById("cartOverlay")
    .classList.add("hidden");
}


/* ================= CHECKOUT ================= */

function openCheckout() {

  if (!cart.length) {
    return;
  }


  closeCart();


  var t =
    calculateTotals();


  document.getElementById(
    "checkoutTotal"
  ).textContent =
    "Order Total: " +
    money(t.total);


  document
    .getElementById("checkoutOverlay")
    .classList.remove("hidden");
}


function closeCheckout() {

  document
    .getElementById("checkoutOverlay")
    .classList.add("hidden");
}


/* ================= ORDER ================= */

document
  .getElementById("checkoutForm")
  .addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      var payload = {

        customer: {

          name:
            document
              .getElementById("name")
              .value
              .trim(),

          email:
            document
              .getElementById("email")
              .value
              .trim(),

          address:
            document
              .getElementById("address")
              .value
              .trim(),

          payment:
            document
              .getElementById("payment")
              .value

        },

        items: cart,

        totals: calculateTotals()

      };


      var button =
        event.target.querySelector(
          "button[type='submit']"
        );


      button.disabled = true;

      button.textContent =
        "Processing...";


      fetch("/api/orders", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(payload)

      })

        .then(function (response) {

          return response
            .json()
            .then(function (result) {

              if (!response.ok) {

                throw new Error(
                  result.message
                );

              }

              return result;

            });

        })

        .then(function (result) {

          document.getElementById(
            "checkoutMessage"
          ).innerHTML =
            '<div class="success">' +

            '<strong>' +
            '✓ Order placed successfully!' +
            '</strong>' +

            '<br><br>' +

            'Order ID: ' +
            '<strong>' +
            result.orderId +
            '</strong>' +

            '<br>' +

            'Customer: ' +
            result.customer +

            '<br>' +

            'Amount Paid: ' +
            '<strong>' +
            money(result.total) +
            '</strong>' +

            '<br>' +

            'Estimated delivery: ' +
            result.estimatedDelivery +

            '</div>';


          cart = [];

          saveCart();

          event.target.reset();

        })

        .catch(function (error) {

          document.getElementById(
            "checkoutMessage"
          ).innerHTML =
            '<div class="error-message">' +
            error.message +
            '</div>';

        })

        .finally(function () {

          button.disabled = false;

          button.textContent =
            "Place Order ✓";

        });

    }
  );


/* ================= TOAST ================= */

function showToast(message) {

  var toast =
    document.getElementById("toast");


  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(function () {

    toast.classList.remove("show");

  }, 1600);
}


/* ================= START ================= */

var savedTheme =
  localStorage.getItem("theme") ||
  "light";


setTheme(savedTheme);

loadProducts();