const express = require("express");
//pour le lab6
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose"); // Ajout de Mongoose

const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");
// Ajoutez les contrôleurs pour lab8
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");
const authController = require("./controllers/authController");

// Configuration de la connexion à MongoDB
mongoose.connect(
    "mongodb://localhost:27017/ai_academy",
    { useNewUrlParser: true }

);
const db = mongoose.connection;
db.once("open", () => {
    console.log("Connexion réussie à MongoDB en utilisant Mongoose!");
});

const app = express();
// Définir le port
app.set("port", process.env.PORT || 3001);
// Configuration d'EJS comme moteur de template
app.set("view engine", "ejs");
app.use(layouts);
// Middleware pour traiter les données des formulaires
app.use(
    express.urlencoded({
        extended: false
    })
);
app.use(express.json());

//POur le lab6
app.use(
    session({ secret: "Siyaar", resave: false, saveUninitialized: true })
);
app.use(flash());

// Configuration des cookies et des sessions lab9
app.use(cookieParser("secret_passcode"));
app.use(session({
    secret: "secret_passcode",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));
// Configuration de flash messages
app.use(flash());
// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());
// Configuration du User model pour Passport
const User = require("./models/user");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Middleware pour rendre les variables locales disponibles dans toutes les vues
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});


// Ajouter le middleware method-override pour lab8
const methodOverride = require("method-override");
app.use(methodOverride("_method", {
    methods: ["POST", "GET"]

}));

// Servir les fichiers statiques
app.use(express.static("public"));
// Définir les routes
app.get("/", homeController.index);
app.get("/about", homeController.about);
// app.get("/courses", homeController.courses);
app.get("/contact", homeController.contact);
app.post("/contact", homeController.processContact);
app.get("/faq", homeController.faq);

// Routes pour les utilisateurs lab8
app.get("/users", usersController.index, usersController.indexView);
app.get("/users/new", usersController.new);
app.post("/users/create", usersController.create, usersController.redirectView);
app.get("/users/:id", usersController.show, usersController.showView);
app.get("/users/:id/edit", usersController.edit);
app.put("/users/:id/update", usersController.update, usersController.redirectView);
app.delete("/users/:id/delete", usersController.delete, usersController.redirectView);
// Routes pour les cours
app.get("/courses", coursesController.index, coursesController.indexView);
app.get("/courses/new", coursesController.new);
app.post("/courses/create", coursesController.create, coursesController.redirectView);
app.get("/courses/:id", coursesController.show, coursesController.showView);
app.get("/courses/:id/edit", coursesController.edit);
app.put("/courses/:id/update", coursesController.update, coursesController.redirectView);
app.delete("/courses/:id/delete", coursesController.delete, coursesController.redirectView);


// Routes pour les abonnés
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/:id", subscribersController.show);
app.post("/subscribers/:id/delete", subscribersController.delete);
app.get("/subscribers/:id/edit", subscribersController.edit);
app.post("/subscribers/:id/update", subscribersController.update);
app.get("/subscribers/search", subscribersController.search);

// Routes d'authentification lab9
app.get("/login", authController.login);
app.post("/login", authController.authenticate);
app.get("/logout", authController.logout, usersController.redirectView);
app.get("/signup", authController.signup);
app.post("/signup", authController.register, usersController.redirectView);
// Routes protégées - accessibles uniquement aux utilisateurs connectés
app.use("/users", authController.ensureLoggedIn);
app.use("/courses/new", authController.ensureLoggedIn);
app.use("/courses/:id/edit", authController.ensureLoggedIn);

app.post("/subscribers/create", async (req, res) => {
    const { name, email, postalCode } = req.body;

    // Validation des champs vides
    if (!name || !email || !postalCode) {
        return res.render('subscribers/new', {
            message: 'Tous les champs sont requis.',
            subscriber: req.body,
        });
    }

    // Validation du format de l'email
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.render('subscribers/new', {
            message: 'Email invalide.',
            subscriber: req.body,
        });
    }

    // Création et sauvegarde du nouvel abonné
    try {
        const newSubscriber = new Subscriber({
            name,
            email,
            zipCode: postalCode
        });
        await newSubscriber.save();
        res.redirect('/subscribers');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création de l\'abonné.');
    }
});


// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);
// Démarrer le serveur
app.listen(app.get("port"), () => {
    console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);
    console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`);
});
