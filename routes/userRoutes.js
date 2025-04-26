const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

// Appliquer le middleware d'auth à toutes les routes ci-dessous
router.use(authController.ensureLoggedIn);

// Affichage de la liste
router.get("/", usersController.index, usersController.indexView);

// Obtenir un token API
router.get("/api-token", usersController.getApiToken); 

// Création
router.get("/new", usersController.new);
router.post("/create", usersController.create, usersController.redirectView);

// Lecture
router.get("/:id", usersController.show, usersController.showView);

// Mise à jour
router.get("/:id/edit", usersController.edit);
router.put("/:id/update", usersController.update, usersController.redirectView);

// Suppression
router.delete("/:id/delete", usersController.delete, usersController.redirectView);

module.exports = router;
