const express = require("express");
const layouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("express-flash");
const mongoose = require("mongoose");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");
const Subscriber = require("./models/subscriber"); // ⚠️ nécessaire pour la recherche

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/ai_academy", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connexion réussie à MongoDB en utilisant Mongoose!");
}).catch((err) => {
  console.error("Erreur de connexion à MongoDB:", err);
});

const app = express();
app.set("port", process.env.PORT || 3000);

// Configuration EJS
app.set("view engine", "ejs");
app.use(layouts);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({
  secret: "monsecret",
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// ROUTES PRINCIPALES
app.get("/", homeController.index);
app.get("/about", homeController.about);
app.get("/courses", homeController.courses);
app.get("/contact", homeController.getContact);
app.post("/contact", homeController.processContact);
app.get("/faq", homeController.faq);

// ROUTES DES ABONNÉS

// 🔍 Route de recherche (à placer AVANT les routes dynamiques)
app.get("/subscribers/search", async (req, res) => {
  const { name, postalCode } = req.query;
  const searchCriteria = {};
  if (name) searchCriteria.name = { $regex: name, $options: 'i' };
  if (postalCode) searchCriteria.postalCode = postalCode;

  try {
    const subscribers = await Subscriber.find(searchCriteria);
    if (subscribers.length === 0) {
      return res.render("index", {
        message: "Aucun abonné trouvé avec ces critères.",
        subscribers: [],
      });
    }
    return res.render("index", {
      message: "Abonnés trouvés",
      subscribers: subscribers,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Erreur lors de la recherche des abonnés');
  }
});

// 👤 Autres routes abonné
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/:id/edit", subscribersController.edit);
app.post("/subscribers/:id/update", subscribersController.update);
app.post("/subscribers/:id/delete", subscribersController.delete);
app.get("/subscribers/:id", subscribersController.show);



// GESTION DES ERREURS
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Lancer le serveur
app.listen(app.get("port"), () => {
  console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);
  console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`);
});
