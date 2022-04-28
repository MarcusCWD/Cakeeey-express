const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);

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

const landingRoutes = require("./routes/landing");
const cakeRoutes = require("./routes/cakes");
const productRoutes = require("./routes/products");
async function main() {
  // set up sessions
  app.use(
    session({
      store: new FileStore(),
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
    })
  );
  // Register Flash middleware
  app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
  });
  app.use("/", landingRoutes);
  app.use("/cakes", cakeRoutes);
  app.use("/products", productRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});
