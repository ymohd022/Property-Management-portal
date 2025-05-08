const express = require("express")
const router = express.Router()
const propertyController = require("../controllers/propertyController")
const authMiddleware = require("../middleware/authMiddleware")
const Property = require("../models/property")

// Get all properties
router.get("/", propertyController.getAllProperties)

// Get a single property
router.get("/:id", propertyController.getPropertyById)

// Create a new property
router.post("/", authMiddleware.verifyAdmin, propertyController.createProperty)

// Update a property
router.put("/:id", authMiddleware.verifyAdmin, propertyController.updateProperty)

// Delete a property
router.delete("/:id", authMiddleware.verifyAdmin, propertyController.deleteProperty)

// Upload property images
router.post(
  "/:id/images",
  authMiddleware.verifyAdmin,
  Property.getUploadMiddleware(),
  propertyController.uploadPropertyImages,
)

// Delete property image
router.delete("/:id/images/:imageId", authMiddleware.verifyAdmin, propertyController.deletePropertyImage)

// Set property image as primary
router.put("/:id/images/:imageId/primary", authMiddleware.verifyAdmin, propertyController.setPropertyImageAsPrimary)

module.exports = router
