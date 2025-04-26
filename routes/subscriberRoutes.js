const express = require("express");
const router = express.Router();
const subscribersController = require("../controllers/subscribersController");
const { body, validationResult } = require("express-validator");

// Liste et vue formulaire
router.get("/", subscribersController.getAllSubscribers);
router.get("/new", subscribersController.getSubscriptionPage);

// Création avec validation
router.post("/create", [
  body("name").notEmpty().withMessage("Le nom est requis"),
  body("email").isEmail().withMessage("Email invalide"),
  body("zipCode").isLength({ min: 5, max: 5 }).isNumeric().withMessage("Code postal doit contenir 5 chiffres")
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("subscribers/new", {
      errors: errors.array(),
      subscriber: req.body
    });
  }
  subscribersController.saveSubscriber(req, res, next);
});

router.get("/:id/edit", subscribersController.edit);
router.post("/:id/update", subscribersController.update);
router.get("/search", subscribersController.search);
router.get("/thanks", (req, res) => res.render("subscribers/thanks", { pageTitle: "Merci" }));
router.get("/:id", subscribersController.show);
router.post("/:id/delete", subscribersController.deleteSubscriber);

module.exports = router;
