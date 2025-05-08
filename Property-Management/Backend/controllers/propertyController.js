const Property = require("../models/property")
const path = require("path")
// const db = require("../db") // Import the database connection

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.getAll()
    res.json(properties)
  } catch (error) {
    console.error("Error in getAllProperties:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.getById(req.params.id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }
    res.json(property)
  } catch (error) {
    console.error("Error in getPropertyById:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.createProperty = async (req, res) => {
  try {
    const propertyId = await Property.create(req.body)
    res.status(201).json({ id: propertyId, message: "Property created successfully" })
  } catch (error) {
    console.error("Error in createProperty:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateProperty = async (req, res) => {
  try {
    const success = await Property.update(req.params.id, req.body)
    if (!success) {
      return res.status(404).json({ message: "Property not found or no changes made" })
    }
    res.json({ message: "Property updated successfully" })
  } catch (error) {
    console.error("Error in updateProperty:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.deleteProperty = async (req, res) => {
  try {
    const success = await Property.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: "Property not found" })
    }
    res.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Error in deleteProperty:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" })
    }

    const propertyId = req.params.id
    const uploaded = []

    // Check if property exists
    const property = await Property.getById(propertyId)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Get current images
    const currentImages = await Property.getPropertyImages(propertyId)
    const isPrimary = currentImages.length === 0 // First image is primary if no images exist

    // Upload each image
    for (const file of req.files) {
      const relativePath = `/uploads/properties/${path.basename(file.path)}`
      const imageId = await Property.uploadImage(propertyId, relativePath, uploaded.length === 0 && isPrimary)
      uploaded.push({
        id: imageId,
        path: relativePath,
        isPrimary: uploaded.length === 0 && isPrimary,
      })
    }

    res.status(201).json({
      message: "Images uploaded successfully",
      images: uploaded,
    })
  } catch (error) {
    console.error("Error in uploadPropertyImages:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.deletePropertyImage = async (req, res) => {
  try {
    const success = await Property.deleteImage(req.params.imageId)
    if (!success) {
      return res.status(404).json({ message: "Image not found" })
    }
    res.json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Error in deletePropertyImage:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.setPropertyImageAsPrimary = async (req, res) => {
  try {
    // First reset all images for this property
    const propertyId = req.params.id
    const imageId = req.params.imageId

    await Property.getById(propertyId) // Verify property exists

    // Get image by ID
    const [images] = await db.query("SELECT * FROM property_images WHERE id = ? AND property_id = ?", [
      imageId,
      propertyId,
    ])
    if (images.length === 0) {
      return res.status(404).json({ message: "Image not found" })
    }

    // Reset all images for this property
    await db.query("UPDATE property_images SET is_primary = 0 WHERE property_id = ?", [propertyId])

    // Set this image as primary
    await db.query("UPDATE property_images SET is_primary = 1 WHERE id = ?", [imageId])

    res.json({ message: "Image set as primary successfully" })
  } catch (error) {
    console.error("Error in setPropertyImageAsPrimary:", error)
    res.status(500).json({ message: "Server error" })
  }
}
