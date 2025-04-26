const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Routes d'authentification
router.get("/login", authController.login);
router.post("/login", authController.authenticate);
router.get("/logout", authController.logout);

router.get("/signup", authController.signup);
router.post("/signup", authController.register);

// Réinitialisation de mot de passe
router.get("/forgot-password", authController.forgotPassword);
router.post("/forgot-password", authController.requestPasswordReset);
router.get("/reset-password/:token", authController.resetPasswordForm);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
