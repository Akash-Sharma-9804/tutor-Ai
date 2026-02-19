const express = require("express");
const router = express.Router();
const adminAuthController = require("../../controllers/Admin/adminAuthController");

router.post("/login", adminAuthController.login);

module.exports = router;
