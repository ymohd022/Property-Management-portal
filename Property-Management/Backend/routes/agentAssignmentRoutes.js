const express = require("express")
const router = express.Router()
const agentAssignmentController = require("../controllers/agentAssignmentController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/", authMiddleware.verifyAdmin, agentAssignmentController.getAllAssignments)
router.get("/:id", authMiddleware.verifyAdmin, agentAssignmentController.getAssignmentById)
router.post("/", authMiddleware.verifyAdmin, agentAssignmentController.createAssignment)
router.put("/:id", authMiddleware.verifyAdmin, agentAssignmentController.updateAssignment)
router.delete("/:id", authMiddleware.verifyAdmin, agentAssignmentController.deleteAssignment)

module.exports = router
