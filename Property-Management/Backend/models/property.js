const db = require("../config/database")
const fs = require("fs")
const path = require("path")
const multer = require("multer")

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads/properties")
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, `property-${uniqueSuffix}${extension}`)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false)
    }
    cb(null, true)
  },
})

class Property {
  static async getAll() {
    try {
      const [properties] = await db.query(`
        SELECT p.*, 
          COUNT(DISTINCT f.id) as totalFlats,
          SUM(CASE WHEN f.status = 'Available' THEN 1 ELSE 0 END) as availableFlats,
          SUM(CASE WHEN f.status = 'Sold' THEN 1 ELSE 0 END) as soldFlats,
          (SELECT image_path FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary = 1 LIMIT 1) as primaryImage
        FROM properties p
        LEFT JOIN flats f ON p.id = f.property_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `)
      return properties
    } catch (error) {
      console.error("Error getting properties:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      // Get property basic details
      const [properties] = await db.query(
        `
        SELECT p.*, 
          COUNT(DISTINCT f.id) as totalFlats,
          SUM(CASE WHEN f.status = 'Available' THEN 1 ELSE 0 END) as availableFlats,
          SUM(CASE WHEN f.status = 'Sold' THEN 1 ELSE 0 END) as soldFlats
        FROM properties p
        LEFT JOIN flats f ON p.id = f.property_id
        WHERE p.id = ?
        GROUP BY p.id
      `,
        [id],
      )

      if (properties.length === 0) {
        return null
      }

      const property = properties[0]

      // Parse amenities JSON
      if (property.amenities) {
        try {
          property.amenities = JSON.parse(property.amenities)
        } catch (e) {
          property.amenities = []
        }
      } else {
        property.amenities = []
      }

      // Get property images
      const [images] = await db.query("SELECT * FROM property_images WHERE property_id = ?", [id])
      property.images = images

      // Get property blocks if any
      if (property.has_blocks) {
        const [blocks] = await db.query("SELECT * FROM blocks WHERE property_id = ?", [id])
        property.blocks = blocks

        // Get flats for each block
        for (const block of property.blocks) {
          const [flats] = await db.query(
            "SELECT * FROM flats WHERE property_id = ? AND block_id = ? ORDER BY floor_number, flat_number",
            [id, block.id],
          )
          block.flats = flats
        }
      } else {
        // Get flats directly (no blocks)
        const [flats] = await db.query("SELECT * FROM flats WHERE property_id = ? ORDER BY floor_number, flat_number", [
          id,
        ])
        property.flats = flats
      }

      // Get agent assignments
      const [agentAssignments] = await db.query(
        `
        SELECT aa.*, a.name as agent_name, b.block_name, f.flat_number
        FROM agent_assignments aa
        JOIN agents a ON aa.agent_id = a.id
        LEFT JOIN blocks b ON aa.block_id = b.id
        LEFT JOIN flats f ON aa.flat_id = f.id
        WHERE aa.property_id = ?
      `,
        [id],
      )
      property.agent_assignments = agentAssignments

      // Get sales
      const [sales] = await db.query(
        `
        SELECT s.*, c.name as client_name, a.name as agent_name, f.flat_number
        FROM sales s
        JOIN clients c ON s.client_id = c.id
        LEFT JOIN agents a ON s.agent_id = a.id
        JOIN flats f ON s.flat_id = f.id
        WHERE s.property_id = ?
      `,
        [id],
      )
      property.sales = sales

      return property
    } catch (error) {
      console.error(`Error getting property with id ${id}:`, error)
      throw error
    }
  }

  static async create(propertyData) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      // Insert property basic details
      const [propertyResult] = await connection.query(
        `INSERT INTO properties (
          name, type, price, locality, status, total_count, 
          total_land_area, unit_sizes, amenities, has_blocks, 
          total_blocks, target_market, permit_number, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyData.siteName,
          propertyData.siteType,
          propertyData.sitePrice,
          propertyData.siteLocality,
          propertyData.siteStatus,
          propertyData.totalCount,
          propertyData.totalLandArea,
          propertyData.unitSizes,
          JSON.stringify(propertyData.amenities || []),
          propertyData.hasBlocks || false,
          propertyData.totalBlocks || 1,
          propertyData.targetMarket || null,
          propertyData.permitNumber || null,
          propertyData.remarks || null,
        ],
      )

      const propertyId = propertyResult.insertId

      // Handle blocks if the property has blocks
      if (propertyData.hasBlocks && propertyData.blocks && propertyData.blocks.length > 0) {
        for (const block of propertyData.blocks) {
          const [blockResult] = await connection.query(
            `INSERT INTO blocks (
              property_id, block_name, total_floors, flats_per_floor, parking_facilities_count
            ) VALUES (?, ?, ?, ?, ?)`,
            [propertyId, block.blockName, block.totalFloors, block.flatsPerFloor, block.parkingFacilitiesCount || 0],
          )

          const blockId = blockResult.insertId

          // Insert flats for this block
          if (block.floors && block.floors.length > 0) {
            for (const floor of block.floors) {
              if (floor.flats && floor.flats.length > 0) {
                for (const flat of floor.flats) {
                  await connection.query(
                    `INSERT INTO flats (
                      property_id, block_id, flat_number, flat_type, 
                      flat_size, flat_price, status, floor_number
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      propertyId,
                      blockId,
                      flat.flatNumber,
                      flat.flatType,
                      flat.flatSize,
                      flat.flatPrice,
                      flat.flatStatus,
                      floor.floorNumber,
                    ],
                  )
                }
              }
            }
          }
        }
      } else if (propertyData.floors && propertyData.floors.length > 0) {
        // Handle floors and flats directly (no blocks)
        for (const floor of propertyData.floors) {
          if (floor.flats && floor.flats.length > 0) {
            for (const flat of floor.flats) {
              await connection.query(
                `INSERT INTO flats (
                  property_id, flat_number, flat_type, 
                  flat_size, flat_price, status, floor_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  propertyId,
                  flat.flatNumber,
                  flat.flatType,
                  flat.flatSize,
                  flat.flatPrice,
                  flat.flatStatus,
                  floor.floorNumber,
                ],
              )
            }
          }
        }
      }

      await connection.commit()
      return propertyId
    } catch (error) {
      await connection.rollback()
      console.error("Error creating property:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async update(id, propertyData) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      // Update property basic details
      await connection.query(
        `UPDATE properties SET 
          name = ?, type = ?, price = ?, locality = ?, 
          status = ?, total_count = ?, total_land_area = ?, 
          unit_sizes = ?, amenities = ?, has_blocks = ?, 
          total_blocks = ?, target_market = ?, permit_number = ?, 
          remarks = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          propertyData.siteName,
          propertyData.siteType,
          propertyData.sitePrice,
          propertyData.siteLocality,
          propertyData.siteStatus,
          propertyData.totalCount,
          propertyData.totalLandArea,
          propertyData.unitSizes,
          JSON.stringify(propertyData.amenities || []),
          propertyData.hasBlocks || false,
          propertyData.totalBlocks || 1,
          propertyData.targetMarket || null,
          propertyData.permitNumber || null,
          propertyData.remarks || null,
          id,
        ],
      )

      // If updating blocks and flats, first delete existing ones
      await connection.query("DELETE FROM flats WHERE property_id = ?", [id])

      if (propertyData.hasBlocks) {
        await connection.query("DELETE FROM blocks WHERE property_id = ?", [id])

        // Insert new blocks and flats
        if (propertyData.blocks && propertyData.blocks.length > 0) {
          for (const block of propertyData.blocks) {
            const [blockResult] = await connection.query(
              `INSERT INTO blocks (
                property_id, block_name, total_floors, flats_per_floor, parking_facilities_count
              ) VALUES (?, ?, ?, ?, ?)`,
              [id, block.blockName, block.totalFloors, block.flatsPerFloor, block.parkingFacilitiesCount || 0],
            )

            const blockId = blockResult.insertId

            // Insert flats for this block
            if (block.floors && block.floors.length > 0) {
              for (const floor of block.floors) {
                if (floor.flats && floor.flats.length > 0) {
                  for (const flat of floor.flats) {
                    await connection.query(
                      `INSERT INTO flats (
                        property_id, block_id, flat_number, flat_type, 
                        flat_size, flat_price, status, floor_number
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                      [
                        id,
                        blockId,
                        flat.flatNumber,
                        flat.flatType,
                        flat.flatSize,
                        flat.flatPrice,
                        flat.flatStatus,
                        floor.floorNumber,
                      ],
                    )
                  }
                }
              }
            }
          }
        }
      } else if (propertyData.floors && propertyData.floors.length > 0) {
        // Handle floors and flats directly (no blocks)
        for (const floor of propertyData.floors) {
          if (floor.flats && floor.flats.length > 0) {
            for (const flat of floor.flats) {
              await connection.query(
                `INSERT INTO flats (
                  property_id, flat_number, flat_type, 
                  flat_size, flat_price, status, floor_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, flat.flatNumber, flat.flatType, flat.flatSize, flat.flatPrice, flat.flatStatus, floor.floorNumber],
              )
            }
          }
        }
      }

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      console.error(`Error updating property with id ${id}:`, error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async delete(id) {
    try {
      // Get property images to delete files
      const [images] = await db.query("SELECT image_path FROM property_images WHERE property_id = ?", [id])

      // Delete property (cascades to blocks, flats, images)
      const [result] = await db.query("DELETE FROM properties WHERE id = ?", [id])

      // Delete image files from file system
      for (const image of images) {
        const imagePath = path.join(__dirname, "../uploads/properties", path.basename(image.image_path))
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error deleting property with id ${id}:`, error)
      throw error
    }
  }

  static async uploadImage(propertyId, imagePath, isPrimary = false) {
    try {
      // If this is a primary image, reset all other images to non-primary
      if (isPrimary) {
        await db.query("UPDATE property_images SET is_primary = 0 WHERE property_id = ?", [propertyId])
      }

      const [result] = await db.query(
        "INSERT INTO property_images (property_id, image_path, is_primary) VALUES (?, ?, ?)",
        [propertyId, imagePath, isPrimary ? 1 : 0],
      )

      return result.insertId
    } catch (error) {
      console.error("Error uploading property image:", error)
      throw error
    }
  }

  static async getPropertyImages(propertyId) {
    try {
      const [images] = await db.query("SELECT * FROM property_images WHERE property_id = ?", [propertyId])
      return images
    } catch (error) {
      console.error(`Error getting images for property with id ${propertyId}:`, error)
      throw error
    }
  }

  static async deleteImage(imageId) {
    try {
      // Get image path
      const [images] = await db.query("SELECT image_path FROM property_images WHERE id = ?", [imageId])
      if (images.length === 0) {
        return false
      }

      // Delete from database
      const [result] = await db.query("DELETE FROM property_images WHERE id = ?", [imageId])

      // Delete file
      const imagePath = path.join(__dirname, "../uploads/properties", path.basename(images[0].image_path))
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }

      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error deleting image with id ${imageId}:`, error)
      throw error
    }
  }

  // Get upload middleware
  static getUploadMiddleware() {
  return upload.array("images", 5) // Allow up to 5 images
}
}

module.exports = Property
