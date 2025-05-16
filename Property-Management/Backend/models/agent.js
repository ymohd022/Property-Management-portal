const db = require("../config/database")
const bcrypt = require("bcryptjs")

class Agent {
  static async getAll() {
    try {
      const [agents] = await db.query(`
        SELECT a.*, 
          COUNT(DISTINCT aa.id) as totalAssignments,
          COUNT(DISTINCT l.id) as totalLeads,
          COUNT(DISTINCT s.id) as totalSales,
          COALESCE(SUM(c.commission_amount), 0) as totalCommission
        FROM agents a
        LEFT JOIN agent_assignments aa ON a.id = aa.agent_id
        LEFT JOIN leads l ON a.id = l.agent_id
        LEFT JOIN sales s ON a.id = s.agent_id
        LEFT JOIN commissions c ON a.id = c.agent_id
        GROUP BY a.id
      `)
      return agents
    } catch (error) {
      console.error("Error getting agents:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [agents] = await db.query("SELECT * FROM agents WHERE id = ?", [id])
      return agents[0]
    } catch (error) {
      console.error(`Error getting agent with id ${id}:`, error)
      throw error
    }
  }

  static async getByUserId(userId) {
    try {
      const [agents] = await db.query("SELECT * FROM agents WHERE user_id = ?", [userId])
      return agents[0]
    } catch (error) {
      console.error(`Error getting agent with user_id ${userId}:`, error)
      throw error
    }
  }

  static async create(agentData) {
    try {
      const hashedPassword = await bcrypt.hash(agentData.password, 10)
      const [result] = await db.query(
        "INSERT INTO agents (name, email, phone, password, address, commission_rate, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          agentData.name,
          agentData.email,
          agentData.phone,
          hashedPassword,
          agentData.address || null,
          agentData.commissionRate || 5,
          agentData.status || "Active",
        ],
      )
      return result.insertId
    } catch (error) {
      console.error("Error creating agent:", error)
      throw error
    }
  }

  static async update(id, agentData) {
    try {
      const updateFields = []
      const updateValues = []

      if (agentData.name) {
        updateFields.push("name = ?")
        updateValues.push(agentData.name)
      }

      if (agentData.email) {
        updateFields.push("email = ?")
        updateValues.push(agentData.email)
      }

      if (agentData.phone) {
        updateFields.push("phone = ?")
        updateValues.push(agentData.phone)
      }

      if (agentData.password) {
        const hashedPassword = await bcrypt.hash(agentData.password, 10)
        updateFields.push("password = ?")
        updateValues.push(hashedPassword)
      }

      if (agentData.address !== undefined) {
        updateFields.push("address = ?")
        updateValues.push(agentData.address)
      }

      if (agentData.commissionRate !== undefined) {
        updateFields.push("commission_rate = ?")
        updateValues.push(agentData.commissionRate)
      }

      if (agentData.status) {
        updateFields.push("status = ?")
        updateValues.push(agentData.status)
      }

      if (updateFields.length === 0) {
        return false
      }

      updateValues.push(id)

      const [result] = await db.query(
        `UPDATE agents SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        updateValues,
      )

      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating agent with id ${id}:`, error)
      throw error
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.query("UPDATE agents SET status = ?, updated_at = NOW() WHERE id = ?", [status, id])
      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating status for agent with id ${id}:`, error)
      throw error
    }
  }

  static async getAssignedProperties(agentId) {
    try {
      const [properties] = await db.query(
        `
        SELECT p.*, 
          COUNT(f.id) as totalFlats,
          SUM(CASE WHEN f.status = 'Available' THEN 1 ELSE 0 END) as availableFlats
        FROM properties p
        JOIN agent_assignments aa ON p.id = aa.property_id
        LEFT JOIN flats f ON p.id = f.property_id
        WHERE aa.agent_id = ?
        GROUP BY p.id
      `,
        [agentId],
      )
      return properties
    } catch (error) {
      console.error(`Error getting assigned properties for agent with id ${agentId}:`, error)
      throw error
    }
  }

  static async getDashboardData(agentId) {
    try {
      // Get KPIs
      const [kpiResults] = await db.query(
        `
        SELECT 
          COUNT(DISTINCT aa.id) as totalAssignments,
          COUNT(DISTINCT l.id) as totalLeads,
          COUNT(DISTINCT CASE WHEN l.status = 'Active' THEN l.id END) as activeLeads,
          COUNT(DISTINCT s.id) as totalSales,
          COALESCE(SUM(c.commission_amount), 0) as totalCommission,
          COALESCE(SUM(CASE WHEN c.status = 'Pending' THEN c.commission_amount ELSE 0 END), 0) as pendingCommission
        FROM agents a
        LEFT JOIN agent_assignments aa ON a.id = aa.agent_id
        LEFT JOIN leads l ON a.id = l.agent_id
        LEFT JOIN sales s ON a.id = s.agent_id
        LEFT JOIN commissions c ON a.id = c.agent_id
        WHERE a.id = ?
      `,
        [agentId],
      )

      // Get recent leads
      const [recentLeads] = await db.query(
        `
        SELECT l.*, p.name as property, f.flat_number as flatNumber
        FROM leads l
        LEFT JOIN properties p ON l.property_id = p.id
        LEFT JOIN flats f ON l.flat_id = f.id
        WHERE l.agent_id = ?
        ORDER BY l.created_at DESC
        LIMIT 5
      `,
        [agentId],
      )

      // Get recent sales
      const [recentSales] = await db.query(
        `
        SELECT s.*, p.name as property, f.flat_number as flatNumber, c.commission_amount as commission
        FROM sales s
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        LEFT JOIN commissions c ON s.id = c.sale_id
        WHERE s.agent_id = ?
        ORDER BY s.sale_date DESC
        LIMIT 5
      `,
        [agentId],
      )

      // Get monthly data for charts
      const [monthlyLeads] = await db.query(
        `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as newLeads,
          SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) as convertedLeads
        FROM leads
        WHERE agent_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `,
        [agentId],
      )

      const [monthlySales] = await db.query(
        `
        SELECT 
          DATE_FORMAT(sale_date, '%Y-%m') as month,
          COUNT(*) as sales
        FROM sales
        WHERE agent_id = ? AND sale_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
        ORDER BY month
      `,
        [agentId],
      )

      const [monthlyCommissions] = await db.query(
        `
        SELECT 
          DATE_FORMAT(c.created_at, '%Y-%m') as month,
          SUM(c.commission_amount) as commission
        FROM commissions c
        WHERE c.agent_id = ? AND c.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(c.created_at, '%Y-%m')
        ORDER BY month
      `,
        [agentId],
      )

      // Format chart data
      const months = []
      const currentDate = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() - i)
        months.push(d.toLocaleString("default", { month: "short" }))
      }

      const leadsData = {
        labels: months,
        datasets: [
          {
            label: "New Leads",
            data: Array(6).fill(0),
          },
          {
            label: "Converted Leads",
            data: Array(6).fill(0),
          },
        ],
      }

      const salesData = {
        labels: months,
        datasets: [
          {
            label: "Sales",
            data: Array(6).fill(0),
          },
        ],
      }

      const commissionData = {
        labels: months,
        datasets: [
          {
            label: "Commission",
            data: Array(6).fill(0),
          },
        ],
      }

      // Fill in the actual data
      monthlyLeads.forEach((item) => {
        const monthIndex = new Date(item.month + "-01").getMonth()
        const relativeIndex = (currentDate.getMonth() - monthIndex + 12) % 12
        if (relativeIndex < 6) {
          const reverseIndex = 5 - relativeIndex
          leadsData.datasets[0].data[reverseIndex] = Number.parseInt(item.newLeads)
          leadsData.datasets[1].data[reverseIndex] = Number.parseInt(item.convertedLeads)
        }
      })

      monthlySales.forEach((item) => {
        const monthIndex = new Date(item.month + "-01").getMonth()
        const relativeIndex = (currentDate.getMonth() - monthIndex + 12) % 12
        if (relativeIndex < 6) {
          const reverseIndex = 5 - relativeIndex
          salesData.datasets[0].data[reverseIndex] = Number.parseInt(item.sales)
        }
      })

      monthlyCommissions.forEach((item) => {
        const monthIndex = new Date(item.month + "-01").getMonth()
        const relativeIndex = (currentDate.getMonth() - monthIndex + 12) % 12
        if (relativeIndex < 6) {
          const reverseIndex = 5 - relativeIndex
          commissionData.datasets[0].data[reverseIndex] = Number.parseFloat(item.commission)
        }
      })

      return {
        kpis: kpiResults[0],
        recentLeads,
        recentSales,
        leadsData,
        salesData,
        commissionData,
        assignedProperties: await this.getAssignedProperties(agentId),
      }
    } catch (error) {
      console.error(`Error getting dashboard data for agent with id ${agentId}:`, error)
      throw error
    }
  }

  static async getLeads(agentId) {
    try {
      const [leads] = await db.query(
        `
        SELECT l.*, p.name as property, f.flat_number as flatNumber
        FROM leads l
        LEFT JOIN properties p ON l.property_id = p.id
        LEFT JOIN flats f ON l.flat_id = f.id
        WHERE l.agent_id = ?
        ORDER BY l.created_at DESC
      `,
        [agentId],
      )
      return leads
    } catch (error) {
      console.error(`Error getting leads for agent with id ${agentId}:`, error)
      throw error
    }
  }

  static async verifyCredentials(email, password) {
    try {
      const [agents] = await db.query("SELECT * FROM agents WHERE email = ?", [email])
      if (agents.length === 0) {
        return null
      }

      const agent = agents[0]
      const isPasswordValid = await bcrypt.compare(password, agent.password)

      if (!isPasswordValid) {
        return null
      }

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: "agent",
        status: agent.status,
      }
    } catch (error) {
      console.error("Error verifying agent credentials:", error)
      throw error
    }
  }
}

module.exports = Agent
