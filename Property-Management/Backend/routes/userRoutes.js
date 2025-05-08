const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const authMiddleware = require("../middleware/authMiddleware")

// Get all users
router.get("/", authMiddleware.verifyAdmin, userController.getAllUsers)

// Get a single user
router.get("/:id", authMiddleware.verifyAdmin, userController.getUserById)

// Create a new user
router.post("/", authMiddleware.verifyAdmin, userController.createUser)

// Update a user
router.put("/:id", authMiddleware.verifyAdmin, userController.updateUser)

// Update user status
router.patch("/:id/status", authMiddleware.verifyAdmin, userController.updateUserStatus)

// Delete a user
router.delete("/:id", authMiddleware.verifyAdmin, userController.deleteUser)

module.exports = router
