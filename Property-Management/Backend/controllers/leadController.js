const Lead = require("../models/lead")

exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.getAll()
    res.json(leads)
  } catch (error) {
    console.error("Error in getAllLeads:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.getById(req.params.id)
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" })
    }

    // Verify the agent is accessing their own lead or admin is accessing
    if (req.user.role !== "admin" && req.user.id !== lead.agent_id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    res.json(lead)
  } catch (error) {
    console.error("Error in getLeadById:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.createLead = async (req, res) => {
  try {
    // If agent is creating, ensure they're creating for themselves
    if (req.user.role === "agent") {
      req.body.agentId = req.user.id
    }

    const leadId = await Lead.create(req.body)
    res.status(201).json({ id: leadId, message: "Lead created successfully" })
  } catch (error) {
    console.error("Error in createLead:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateLead = async (req, res) => {
  try {
    // First check if the lead exists and belongs to the agent
    const lead = await Lead.getById(req.params.id)
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" })
    }

    // Verify the agent is updating their own lead or admin is updating
    if (req.user.role !== "admin" && req.user.id !== lead.agent_id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const success = await Lead.update(req.params.id, req.body)
    if (!success) {
      return res.status(404).json({ message: "Lead not found or no changes made" })
    }
    res.json({ message: "Lead updated successfully" })
  } catch (error) {
    console.error("Error in updateLead:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    // First check if the lead exists and belongs to the agent
    const lead = await Lead.getById(req.params.id)
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" })
    }

    // Verify the agent is updating their own lead or admin is updating
    if (req.user.role !== "admin" && req.user.id !== lead.agent_id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const success = await Lead.updateStatus(req.params.id, status)
    if (!success) {
      return res.status(404).json({ message: "Lead not found" })
    }

    // If lead is converted to a sale, create a sale record
    if (status === "Converted") {
      // This would be implemented in a real application
      // const Sale = require('../models/sale');
      // await Sale.createFromLead(req.params.id);
    }

    res.json({ message: "Lead status updated successfully" })
  } catch (error) {
    console.error("Error in updateLeadStatus:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.deleteLead = async (req, res) => {
  try {
    const success = await Lead.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: "Lead not found" })
    }
    res.json({ message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error in deleteLead:", error)
    res.status(500).json({ message: "Server error" })
  }
}
