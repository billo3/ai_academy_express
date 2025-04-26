const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Route pour les pages non trouvées (404)
router.use(errorController.pageNotFoundError);

// Route pour les erreurs serveur (500) - Ceci doit être un middleware de gestion d'erreurs.
router.use(errorController.internalServerError);

module.exports = router;
