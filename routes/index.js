const express = require("express");
const indexController = require("../controllers/index");
const { redirectToEditorIfAuthenticated } = require("../middlewares");
const router = express.Router();

router.get("", redirectToEditorIfAuthenticated, indexController.renderLandingPage);

module.exports = router;
