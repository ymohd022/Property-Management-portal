const express = require("express")
const router = express.Router()
const agentController = require("../controllers/agentController")
const authMiddleware = require("../middleware/authMiddleware")

// Admin routes
router.get("/", authMiddleware.verifyAdmin, agentController.getAllAgents)
router.get("/:id", authMiddleware.verifyAdmin, agentController.getAgentById)
router.post("/", authMiddleware.verifyAdmin, agentController.createAgent)
router.put("/:id", authMiddleware.verifyAdmin, agentController.updateAgent)
router.patch("/:id/status", authMiddleware.verifyAdmin, agentController.updateAgentStatus)

// Agent routes
router.get("/:id/dashboard", authMiddleware.verifyAgentOrAdmin, agentController.getAgentDashboard)
router.get("/:id/properties", authMiddleware.verifyAgentOrAdmin, agentController.getAgentProperties)
router.get("/:id/leads", authMiddleware.verifyAgentOrAdmin, agentController.getAgentLeads)
router.get("/:id/sales", authMiddleware.verifyAgentOrAdmin, agentController.getAgentSales)
router.get("/:id/commissions", authMiddleware.verifyAgentOrAdmin, agentController.getAgentCommissions)

module.exports = router
