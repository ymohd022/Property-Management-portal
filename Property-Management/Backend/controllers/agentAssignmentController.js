const AgentAssignment = require("../models/agentAssignment")

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await AgentAssignment.getAll()
    res.json(assignments)
  } catch (error) {
    console.error("Error in getAllAssignments:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await AgentAssignment.getById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" })
    }
    res.json(assignment)
  } catch (error) {
    console.error("Error in getAssignmentById:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.getAssignmentsByAgentId = async (req, res) => {
  try {
    const agentId = req.params.agentId

    // Verify the agent is accessing their own data or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(agentId)) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const assignments = await AgentAssignment.getByAgentId(agentId)
    res.json(assignments)
  } catch (error) {
    console.error("Error in getAssignmentsByAgentId:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.createAssignment = async (req, res) => {
  try {
    // Check if agent is already assigned to this property/flat
    const existingAssignment = await AgentAssignment.getByAgentAndProperty(
      req.body.agentId,
      req.body.propertyId,
      req.body.flatId,
    )

    if (existingAssignment) {
      return res.status(400).json({
        message: "Agent is already assigned to this property/flat",
        existingAssignment,
      })
    }

    const assignmentId = await AgentAssignment.create(req.body)
    res.status(201).json({ id: assignmentId, message: "Assignment created successfully" })
  } catch (error) {
    console.error("Error in createAssignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.updateAssignment = async (req, res) => {
  try {
    const success = await AgentAssignment.update(req.params.id, req.body)
    if (!success) {
      return res.status(404).json({ message: "Assignment not found or no changes made" })
    }
    res.json({ message: "Assignment updated successfully" })
  } catch (error) {
    console.error("Error in updateAssignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.deleteAssignment = async (req, res) => {
  try {
    const success = await AgentAssignment.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: "Assignment not found" })
    }
    res.json({ message: "Assignment deleted successfully" })
  } catch (error) {
    console.error("Error in deleteAssignment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
