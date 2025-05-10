const express = require("express")
const router = express.Router()
const dashboardController = require("../controllers/dashboardController")
const authMiddleware = require("../middleware/authMiddleware")

// Apply auth middleware to all routes
router.use(authMiddleware.verifyToken)

// Get dashboard data
router.get("/", dashboardController.getDashboardData)

// Export dashboard report
router.get("/export", dashboardController.exportDashboardReport)

module.exports = router
