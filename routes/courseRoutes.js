const express = require("express");
const router = express.Router();

const coursesController = require("../controllers/coursesController");
const authController = require("../controllers/authController");
const { isTeacherOrAdmin } = require("../middlewares/authorization");

// Accès libre
router.get("/", coursesController.index, coursesController.indexView);
router.get("/search", coursesController.search, coursesController.searchView);
router.get("/:id", coursesController.show, coursesController.showView);

// Protégées
router.get("/new", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.new);
router.post("/create", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.create, coursesController.redirectView);
router.get("/:id/edit", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.edit);
router.put("/:id/update", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.update, coursesController.redirectView);
router.delete("/:id/delete", authController.ensureLoggedIn, isTeacherOrAdmin, coursesController.delete, coursesController.redirectView);
router.post("/:id/enroll", authController.ensureLoggedIn, coursesController.enroll, coursesController.redirectView);

module.exports = router;
