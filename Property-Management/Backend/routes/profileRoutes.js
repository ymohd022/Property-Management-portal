const express = require("express")
const router = express.Router()
const profileController = require("../controllers/profileController")
const authMiddleware = require("../middleware/authMiddleware")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/profile_pictures")

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `user-${req.user.id}-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
})

// Apply auth middleware to all routes
router.use(authMiddleware.verifyToken)

// Get user profile
router.get("/", profileController.getUserProfile)

// Update user profile
router.put("/", profileController.updateUserProfile)

// Change password
router.put("/change-password", profileController.changePassword)

// Upload profile picture
router.post("/upload-picture", upload.single("profilePicture"), profileController.uploadProfilePicture)

module.exports = router
