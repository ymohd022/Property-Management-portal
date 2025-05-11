const Agent = require("../models/agent")
const Lead = require("../models/lead")
const Sale = require("../models/sale")
const Commission = require("../models/commission")
const AgentAssignment = require("../models/agentAssignment")

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.getAll()
    res.json(agents)
  } catch (error) {
    console.error("Error in getAllAgents:", error)
    res.status(500).json({ message: "Server error", error: error.message })
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
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.createAgent = async (req, res) => {
  try {
    const agentId = await Agent.create(req.body)
    res.status(201).json({ id: agentId, message: "Agent created successfully" })
  } catch (error) {
    console.error("Error in createAgent:", error)
    res.status(500).json({ message: "Server error", error: error.message })
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
    res.status(500).json({ message: "Server error", error: error.message })
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
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.params.id

    // Get agent details
    const agent = await Agent.getById(agentId)
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // Get agent assignments
    const assignments = await AgentAssignment.getAssignmentsByAgentId(agentId)

    // Get agent leads
    const leads = await Lead.getByAgentId(agentId)

    // Get agent sales
    const sales = await Sale.getByAgentId(agentId)

    // Get agent commissions
    const commissions = await Commission.getByAgentId(agentId)

    // Calculate KPIs
    const totalAssignments = assignments.length
    const totalLeads = leads.length
    const activeLeads = leads.filter((lead) => lead.status === "Active").length
    const totalSales = sales.length
    const totalCommission = commissions.reduce((sum, commission) => sum + commission.amount, 0)
    const pendingCommission = commissions
      .filter((commission) => commission.status === "Pending")
      .reduce((sum, commission) => sum + commission.amount, 0)

    // Prepare monthly data for charts
    const currentYear = new Date().getFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize data arrays with zeros
    const leadsData = {
      labels: months,
      datasets: [
        {
          label: "New Leads",
          data: Array(12).fill(0),
        },
        {
          label: "Converted Leads",
          data: Array(12).fill(0),
        },
      ],
    }

    const salesData = {
      labels: months,
      datasets: [
        {
          label: "Sales",
          data: Array(12).fill(0),
        },
      ],
    }

    const commissionData = {
      labels: months,
      datasets: [
        {
          label: "Commission",
          data: Array(12).fill(0),
        },
      ],
    }

    // Fill in the data
    leads.forEach((lead) => {
      const leadDate = new Date(lead.created_at)
      if (leadDate.getFullYear() === currentYear) {
        const month = leadDate.getMonth()
        leadsData.datasets[0].data[month]++

        if (lead.status === "Converted") {
          leadsData.datasets[1].data[month]++
        }
      }
    })

    sales.forEach((sale) => {
      const saleDate = new Date(sale.sale_date)
      if (saleDate.getFullYear() === currentYear) {
        const month = saleDate.getMonth()
        salesData.datasets[0].data[month]++
      }
    })

    commissions.forEach((commission) => {
      const commissionDate = new Date(commission.created_at)
      if (commissionDate.getFullYear() === currentYear) {
        const month = commissionDate.getMonth()
        commissionData.datasets[0].data[month] += commission.amount
      }
    })

    // Get recent leads and sales
    const recentLeads = leads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((lead) => ({
        id: lead.id,
        clientName: lead.client_name,
        property: lead.property_name,
        flatNumber: lead.flat_number,
        status: lead.status,
        date: lead.created_at,
      }))

    const recentSales = sales
      .sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date))
      .slice(0, 5)
      .map((sale) => ({
        id: sale.id,
        clientName: sale.client_name,
        property: sale.property_name,
        flatNumber: sale.flat_number,
        amount: sale.sale_amount,
        commission: sale.commission_amount,
        date: sale.sale_date,
        status: sale.status,
      }))

    // Prepare response
    const dashboardData = {
      kpis: {
        totalAssignments,
        totalLeads,
        activeLeads,
        totalSales,
        totalCommission,
        pendingCommission,
      },
      leadsData,
      salesData,
      commissionData,
      recentLeads,
      recentSales,
      assignedProperties: assignments,
    }

    res.json(dashboardData)
  } catch (error) {
    console.error("Error in getAgentDashboard:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.getAgentLeads = async (req, res) => {
  try {
    const leads = await Lead.getByAgentId(req.params.id)
    res.json(leads)
  } catch (error) {
    console.error("Error in getAgentLeads:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.getAgentSales = async (req, res) => {
  try {
    const sales = await Sale.getByAgentId(req.params.id)
    res.json(sales)
  } catch (error) {
    console.error("Error in getAgentSales:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.getAgentCommissions = async (req, res) => {
  try {
    const commissions = await Commission.getByAgentId(req.params.id)
    res.json(commissions)
  } catch (error) {
    console.error("Error in getAgentCommissions:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
