const express = require("express")
const router = express.Router()
const leadController = require("../controllers/leadController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/", authMiddleware.verifyAdmin, leadController.getAllLeads)
router.get("/:id", authMiddleware.verifyAgentOrAdmin, leadController.getLeadById)
router.post("/", authMiddleware.verifyAgentOrAdmin, leadController.createLead)
router.put("/:id", authMiddleware.verifyAgentOrAdmin, leadController.updateLead)
router.patch("/:id/status", authMiddleware.verifyAgentOrAdmin, leadController.updateLeadStatus)
router.delete("/:id", authMiddleware.verifyAdmin, leadController.deleteLead)

module.exports = router
