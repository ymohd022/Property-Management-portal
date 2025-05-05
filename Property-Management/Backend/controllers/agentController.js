const Agent = require("../models/agent")

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.getAll()
    res.json(agents)
  } catch (error) {
    console.error("Error in getAllAgents:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.getById(req.params.id)
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }
    res.json(agent)
  } catch (error) {
    console.error("Error in getAgentById:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.createAgent = async (req, res) => {
  try {
    const agentId = await Agent.create(req.body)
    res.status(201).json({ id: agentId, message: "Agent created successfully" })
  } catch (error) {
    console.error("Error in createAgent:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateAgent = async (req, res) => {
  try {
    const success = await Agent.update(req.params.id, req.body)
    if (!success) {
      return res.status(404).json({ message: "Agent not found or no changes made" })
    }
    res.json({ message: "Agent updated successfully" })
  } catch (error) {
    console.error("Error in updateAgent:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateAgentStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const success = await Agent.updateStatus(req.params.id, status)
    if (!success) {
      return res.status(404).json({ message: "Agent not found" })
    }
    res.json({ message: "Agent status updated successfully" })
  } catch (error) {
    console.error("Error in updateAgentStatus:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAgentDashboard = async (req, res) => {
  try {
    // Verify the agent is accessing their own data or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const dashboardData = await Agent.getDashboardData(req.params.id)
    res.json(dashboardData)
  } catch (error) {
    console.error("Error in getAgentDashboard:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAgentProperties = async (req, res) => {
  try {
    // Verify the agent is accessing their own data or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const properties = await Agent.getAssignedProperties(req.params.id)
    res.json(properties)
  } catch (error) {
    console.error("Error in getAgentProperties:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAgentLeads = async (req, res) => {
  try {
    // Verify the agent is accessing their own data or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const leads = await Agent.getLeads(req.params.id)
    res.json(leads)
  } catch (error) {
    console.error("Error in getAgentLeads:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAgentSales = async (req, res) => {
  try {
    // Verify the agent is accessing their own data or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const Sale = require("../models/sale")
    const sales = await Sale.getByAgentId(req.params.id)
    res.json(sales)
  } catch (error) {
    console.error("Error in getAgentSales:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getAgentCommissions = async (req, res) => {
  try {
    // Verify the agent is accessing their own data or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const Commission = require("../models/commission")
    const commissions = await Commission.getByAgentId(req.params.id)
    res.json(commissions)
  } catch (error) {
    console.error("Error in getAgentCommissions:", error)
    res.status(500).json({ message: "Server error" })
  }
}
