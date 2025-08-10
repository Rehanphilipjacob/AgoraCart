# AgoraCart

AgoraCart is a full-stack ecommerce web application featuring product browsing, cart management, order placement, and an admin panel for product and order management.

## Features

* User side:

  * Browse products with images, categories, and descriptions
  * Add products to cart with quantity control
  * Place orders with delivery and payment options (Cash on Delivery / Online Payment via Razorpay)
  * View order history and order status updates

* Admin side:

  * Manage products: add, edit, delete
  * View all orders with order status (pending, placed, shipped)
  * Update order status via dropdown control
  * View all registered users

## Technologies Used

* Backend: Node.js, Express.js
* Templating: Handlebars (hbs)
* Database: MongoDB
* Frontend: Bootstrap 5, jQuery, AJAX
* Payment Gateway: Razorpay

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/AgoraCart.git
   cd AgoraCart
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory with necessary variables such as:

   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. Run the application:

   ```bash
   npm start
   ```

5. Access the app in your browser:

   ```
   http://localhost:3000
   ```

## Usage

* Visit `/` to browse products.
* Register and log in to add items to cart and place orders.
* Admin users can access `/admin` to manage products, orders, and users.

## Folder Structure

```
/ AgoraCart
│
├── /bin                 # Server startup script (bin/www)
├── /config              # Configuration files: database connection, collections, etc.
├── /admin               # Admin routes and views
├── /public              # Static assets (images, stylesheets, scripts)
├── /routes              # Route definitions
├── /views               # Handlebars templates
├── /helpers             # Helper functions (e.g., database operations)
├── app.js               # Main Express app configuration
└── package.json         # Project metadata and dependencies

```

## Contributing

Contributions are welcome. Please fork the repository and create a pull request with your proposed changes.

## License

This project is licensed under the MIT License.

---

If you want me to customize for your specific repo URL or add more sections (like screenshots, demo link, known issues), just ask.
