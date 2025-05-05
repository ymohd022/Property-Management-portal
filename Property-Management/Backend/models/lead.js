const db = require("../config/database")

class Lead {
  static async getAll() {
    try {
      const [leads] = await db.query(`
        SELECT l.*, a.name as agent_name, p.name as property_name, f.flat_number
        FROM leads l
        LEFT JOIN agents a ON l.agent_id = a.id
        LEFT JOIN properties p ON l.property_id = p.id
        LEFT JOIN flats f ON l.flat_id = f.id
        ORDER BY l.created_at DESC
      `)
      return leads
    } catch (error) {
      console.error("Error getting leads:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [leads] = await db.query(
        `
        SELECT l.*, a.name as agent_name, p.name as property_name, f.flat_number
        FROM leads l
        LEFT JOIN agents a ON l.agent_id = a.id
        LEFT JOIN properties p ON l.property_id = p.id
        LEFT JOIN flats f ON l.flat_id = f.id
        WHERE l.id = ?
      `,
        [id],
      )
      return leads[0]
    } catch (error) {
      console.error(`Error getting lead with id ${id}:`, error)
      throw error
    }
  }

  static async create(leadData) {
    try {
      const [result] = await db.query(
        `INSERT INTO leads (
          agent_id, client_name, client_email, client_phone, 
          property_id, flat_id, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leadData.agentId,
          leadData.clientName,
          leadData.clientEmail,
          leadData.clientPhone,
          leadData.propertyId,
          leadData.flatId || null,
          leadData.status || "Active",
          leadData.notes || null,
        ],
      )
      return result.insertId
    } catch (error) {
      console.error("Error creating lead:", error)
      throw error
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.query("UPDATE leads SET status = ?, updated_at = NOW() WHERE id = ?", [status, id])
      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating status for lead with id ${id}:`, error)
      throw error
    }
  }

  static async update(id, leadData) {
    try {
      const updateFields = []
      const updateValues = []

      if (leadData.clientName) {
        updateFields.push("client_name = ?")
        updateValues.push(leadData.clientName)
      }

      if (leadData.clientEmail) {
        updateFields.push("client_email = ?")
        updateValues.push(leadData.clientEmail)
      }

      if (leadData.clientPhone) {
        updateFields.push("client_phone = ?")
        updateValues.push(leadData.clientPhone)
      }

      if (leadData.propertyId) {
        updateFields.push("property_id = ?")
        updateValues.push(leadData.propertyId)
      }

      if (leadData.flatId !== undefined) {
        updateFields.push("flat_id = ?")
        updateValues.push(leadData.flatId)
      }

      if (leadData.status) {
        updateFields.push("status = ?")
        updateValues.push(leadData.status)
      }

      if (leadData.notes !== undefined) {
        updateFields.push("notes = ?")
        updateValues.push(leadData.notes)
      }

      if (updateFields.length === 0) {
        return false
      }

      updateValues.push(id)

      const [result] = await db.query(
        `UPDATE leads SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        updateValues,
      )

      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating lead with id ${id}:`, error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM leads WHERE id = ?", [id])
      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error deleting lead with id ${id}:`, error)
      throw error
    }
  }
}

module.exports = Lead
