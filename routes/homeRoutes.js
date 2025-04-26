const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.index);
router.get("/about", homeController.about);
router.get("/courses", homeController.courses);
router.get("/contact", homeController.contact);
router.post("/contact", homeController.processContact);
router.get("/faq", homeController.faq);

module.exports = router;
