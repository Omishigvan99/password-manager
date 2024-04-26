const router = require("express").Router();
const navController = require("../controllers/nav-controller.js");

// POST requests
router.post("/decrypt-password/users/:accountPassword", navController.decryptPassword);

// PATCH requests
router.patch("/create-password-account/users/:email", navController.createPasswordAccount);
router.patch("/update-password-account/users/:email/:accountName", navController.updatePasswordAccount);
router.patch("/delete-password-account/users/:email/:accountName", navController.deletePasswordAccount);

// GET requests
router.get("/logout/users", navController.logoutUser);

// DELETE requests
router.delete("/delete-user-account/users/:email", navController.deleteUserAccount);

module.exports = router;