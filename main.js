const express = require("express");
const layouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('./config/passport');
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const httpStatus = require("http-status-codes"); 
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

//const authRoutes = require("./routes/authRoutes");
const mongoose = require("mongoose");
const appRoutes = require("./routes"); 
const User = require("./models/user");


// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/ai_academy", {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connexion réussie à MongoDB en utilisant Mongoose !");
});

const app = express();

// Configuration Express
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(layouts);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method", { methods: ["POST", "GET"] }));

// Sessions & Cookies
app.use(cookieParser("secret_passcode"));
app.use(session({
  secret: "secret_passcode",
  cookie: { maxAge: 4000000 },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Variables disponibles dans toutes les vues
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.pageTitle = "AI Academy";
  res.locals.notification = req.session.notification || null;
  delete req.session.notification;
  next();
});
// Auth Google
app.get("/auth/google", passport.authenticate("google", { scope: ['profile', 'email'] }));
app.get("/auth/google/callback", 
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
    successRedirect: "/",
    successFlash: "Vous êtes maintenant connecté avec Google !"
  })
);

app.use("/users", userRoutes);
app.use("/", authRoutes);


// Utilisation des routes séparées
app.use("/", appRoutes);

// Gestion des erreurs
const errorController = require("./controllers/errorController");
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Démarrage du serveur
app.listen(app.get("port"), () => { 
  console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);   console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`); 
}); 

