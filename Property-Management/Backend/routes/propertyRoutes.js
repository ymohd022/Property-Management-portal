const express = require("express")
const router = express.Router()
const propertyController = require("../controllers/propertyController")
const authMiddleware = require("../middleware/authMiddleware")

// Apply auth middleware to all routes
router.use(authMiddleware.verifyToken)

// Get all properties
router.get("/", propertyController.getAllProperties)

// Get property by ID
router.get("/:id", propertyController.getPropertyById)

// Get flats for property
router.get("/:id/flats", propertyController.getFlatsForProperty)

// Create new property
router.post("/", propertyController.createProperty)

// Update property
router.put("/:id", propertyController.updateProperty)

// Delete property
router.delete("/:id", propertyController.deleteProperty)

// Upload property images
router.post("/:id/images", propertyController.uploadPropertyImages)

// Set property image as primary
router.put("/:id/images/:imageId/primary", propertyController.setPropertyImageAsPrimary)

// Delete property image
router.delete("/:id/images/:imageId", propertyController.deletePropertyImage)

module.exports = router
