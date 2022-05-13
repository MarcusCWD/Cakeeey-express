const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");
const cors = require('cors')

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

app.use(flash());

// enable forms
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(cors());
app.options('**', cors());

app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}))

const landingRoutes = require("./routes/landing");
const cakeRoutes = require("./routes/cakes");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const cloudinaryRoutes = require('./routes/cloudinary')
const cartRoutes = require('./routes/shoppingCart');
const orderRoutes = require('./routes/orders');
const { checkIfAuthenticated } = require("./middlewares");

const api = {
  products: require('./routes/api/products'),
  cart: require('./routes/api/cart'),
  checkout: require('./routes/api/checkout'),
  user: require('./routes/api/user'),
  order: require('./routes/api/order')
}

async function main() {

  // Register Flash middleware
  app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
  });

  // Share the user data with hbs files
  app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
  });

  // enable CSRF
  // app.use(csrf());
  
  const csurfInstance = csrf();
  app.use(function(req,res,next){
    console.log("checking for csrf exclusion")
    if (req.url === '/checkout/process_payment' || req.url.slice(0,5)=="/api/") {
      console.log("we enter next")
      return next()
  }
    csurfInstance(req,res,next);
  })
  

  app.use(function (err, req, res, next) {
    if (err && err.code == "EBADCSRFTOKEN") {
      req.flash("error_messages", "The form has expired. Please try again");
      res.redirect("back");
    } else {
      next();
    }
  });

  // Share CSRF with hbs files
  // app.use(function (req, res, next) {
  //   res.locals.csrfToken = req.csrfToken();
  //   next();
  // });

  app.use(function(req,res,next){
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    
    next();
})


  app.use("/", landingRoutes);
  app.use("/cakes", cakeRoutes);
  app.use("/products", productRoutes);
  app.use("/users", userRoutes);
  app.use('/cloudinary', cloudinaryRoutes);
  app.use('/orders', orderRoutes);
  app.use('/cart',checkIfAuthenticated, cartRoutes); // when we are done, we should remove this. only need the api route
  app.use('/api/checkout', api.checkout);
  app.use('/api/products',express.json(), api.products);
  app.use('/api/cart', express.json(), api.cart);
  app.use('/api/user', express.json(), api.user);
  app.use('/api/order', express.json(), api.order);
}

main();

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
