const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const authController = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

// Limite de requêtes API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes API, veuillez réessayer plus tard"
});

// Appliquer le limiteur à toutes les routes API
router.use(apiLimiter);

// Route pour la documentation (n'a pas besoin de token)
router.get("/documentation", (req, res) => {
  res.render("api/documentation");
});

// Route d'authentification (n'a pas besoin de token)
router.post("/login", apiController.apiAuthenticate);

// Route pour rafraîchir le token (a besoin d'authentification)
router.get("/refresh-token", authController.ensureLoggedIn, apiController.refreshToken);

// Vérifier le token pour toutes les autres routes
router.use(apiController.verifyToken);

// Utilisateurs
router.get("/users", apiController.getAllUsers, apiController.respondJSON);
router.get("/users/:id", apiController.getUserById, apiController.respondJSON);
router.post("/users", apiController.validateUserParams, apiController.createUser, apiController.respondJSON);
router.put("/users/:id", apiController.validateUserParams, apiController.updateUser, apiController.respondJSON);
router.delete("/users/:id", apiController.deleteUser, apiController.respondJSON);

// Cours
router.get("/courses", apiController.getAllCourses, apiController.respondJSON);
router.get("/courses/:id", apiController.getCourseById, apiController.respondJSON);
router.post("/courses", apiController.validateCourseParams, apiController.createCourse, apiController.respondJSON);
router.put("/courses/:id", apiController.validateCourseParams, apiController.updateCourse, apiController.respondJSON);
router.delete("/courses/:id", apiController.deleteCourse, apiController.respondJSON);

// Abonnés
router.get("/subscribers", apiController.getAllSubscribers, apiController.respondJSON);
router.get("/subscribers/:id", apiController.getSubscriberById, apiController.respondJSON);
router.post("/subscribers", apiController.validateSubscriberParams, apiController.createSubscriber, apiController.respondJSON);
router.put("/subscribers/:id", apiController.validateSubscriberParams, apiController.updateSubscriber, apiController.respondJSON);
router.delete("/subscribers/:id", apiController.deleteSubscriber, apiController.respondJSON);

// Gestion des erreurs API
router.use(apiController.errorJSON);

module.exports = router;