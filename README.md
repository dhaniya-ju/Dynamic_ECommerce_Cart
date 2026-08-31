# Dynamic E-Commerce Cart & Order Checkout System

## Web Essentials Assignment - 1

### Technologies
- HTML5
- CSS3
- JavaScript (Client Side)
- Node.js + Express (Server Side)
- JSON API

### Features
1. Dynamic product loading from server
2. Add products to cart
3. Increase/decrease quantity
4. Remove products
5. Automatic subtotal, shipping and 5% tax calculation
6. Checkout form validation
7. Server-side order validation
8. Automatic order ID generation
9. Order confirmation screen
10. LocalStorage cart persistence

### How to Run

Install Node.js first.

Open this project folder in VS Code terminal and run:

```bash
npm install
npm start
```

Then open:

http://localhost:3000

### Client-side flow
Browser -> JavaScript -> Cart -> Checkout -> POST /api/orders

### Server-side flow
POST /api/orders -> Validate customer/cart -> Generate Order ID -> Send confirmation JSON

### Files
- `server.js` - server-side Node.js + Express code
- `public/index.html` - user interface
- `public/style.css` - styling
- `public/script.js` - client-side cart and checkout logic
- `package.json` - project dependency configuration
