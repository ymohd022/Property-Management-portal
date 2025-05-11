const express = require("express")
const router = express.Router()
const agentController = require("../controllers/agentController")
const authMiddleware = require("../middleware/authMiddleware")

// Apply auth middleware to all routes
router.use(authMiddleware.verifyToken)

// Get all agents
router.get("/", agentController.getAllAgents)

// Get agent by ID (fixed route)
router.get("/:id", agentController.getAgentById)

// Create new agent
router.post("/", agentController.createAgent)

// Update agent
router.put("/:id", agentController.updateAgent)

// Update agent status
router.patch("/:id/status", agentController.updateAgentStatus)

// Get agent dashboard data
router.get("/:id/dashboard", agentController.getAgentDashboard)

// Get agent leads
router.get("/:id/leads", agentController.getAgentLeads)

// Get agent sales
router.get("/:id/sales", agentController.getAgentSales)

// Get agent commissions
router.get("/:id/commissions", agentController.getAgentCommissions)

module.exports = router