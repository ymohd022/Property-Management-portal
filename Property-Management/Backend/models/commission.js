const db = require("../config/database")

class Commission {
  static async getAll() {
    try {
      const [commissions] = await db.query(`
        SELECT c.*, a.name as agent_name, s.sale_amount, p.name as property_name, f.flat_number
        FROM commissions c
        JOIN agents a ON c.agent_id = a.id
        JOIN sales s ON c.sale_id = s.id
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        ORDER BY c.created_at DESC
      `)
      return commissions
    } catch (error) {
      console.error("Error getting commissions:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [commissions] = await db.query(
        `
        SELECT c.*, a.name as agent_name, s.sale_amount, p.name as property_name, f.flat_number
        FROM commissions c
        JOIN agents a ON c.agent_id = a.id
        JOIN sales s ON c.sale_id = s.id
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        WHERE c.id = ?
      `,
        [id],
      )
      return commissions[0]
    } catch (error) {
      console.error(`Error getting commission with id ${id}:`, error)
      throw error
    }
  }

  static async updateStatus(id, status, paymentDate = null) {
    try {
      let query = "UPDATE commissions SET status = ?, updated_at = NOW()"
      const params = [status]

      if (status === "Paid" && paymentDate) {
        query += ", payment_date = ?"
        params.push(paymentDate)
      }

      query += " WHERE id = ?"
      params.push(id)

      const [result] = await db.query(query, params)
      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating status for commission with id ${id}:`, error)
      throw error
    }
  }

  static async getByAgentId(agentId) {
    try {
      const [commissions] = await db.query(
        `
        SELECT c.*, s.sale_date, s.sale_amount, p.name as property_name, f.flat_number
        FROM commissions c
        JOIN sales s ON c.sale_id = s.id
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        WHERE c.agent_id = ?
        ORDER BY c.created_at DESC
      `,
        [agentId],
      )
      return commissions
    } catch (error) {
      console.error(`Error getting commissions for agent with id ${agentId}:`, error)
      throw error
    }
  }
}

module.exports = Commission
