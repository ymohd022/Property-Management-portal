const db = require("../config/database")

class AgentAssignment {
  static async getAll() {
    try {
      const [assignments] = await db.query(`
        SELECT aa.*, a.name as agent_name, p.name as property_name, f.flat_number
        FROM agent_assignments aa
        JOIN agents a ON aa.agent_id = a.id
        JOIN properties p ON aa.property_id = p.id
        LEFT JOIN flats f ON aa.flat_id = f.id
        ORDER BY aa.assignment_date DESC
      `)
      return assignments
    } catch (error) {
      console.error("Error getting agent assignments:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [assignments] = await db.query(
        `
        SELECT aa.*, a.name as agent_name, p.name as property_name, f.flat_number
        FROM agent_assignments aa
        JOIN agents a ON aa.agent_id = a.id
        JOIN properties p ON aa.property_id = p.id
        LEFT JOIN flats f ON aa.flat_id = f.id
        WHERE aa.id = ?
      `,
        [id],
      )
      return assignments[0]
    } catch (error) {
      console.error(`Error getting agent assignment with id ${id}:`, error)
      throw error
    }
  }

  static async getByAgentId(agentId) {
    try {
      const [assignments] = await db.query(
        `
        SELECT aa.*, 
               a.name as agent_name, 
               p.name as property_name, 
               p.locality as property_location,
               f.id as flat_id, 
               f.flat_number, 
               f.flat_type, 
               f.flat_size,
               f.flat_price,
               f.status as flat_status
        FROM agent_assignments aa
        JOIN agents a ON aa.agent_id = a.id
        JOIN properties p ON aa.property_id = p.id
        LEFT JOIN flats f ON aa.flat_id = f.id
        WHERE aa.agent_id = ?
        ORDER BY aa.assignment_date DESC
      `,
        [agentId],
      )
      return assignments
    } catch (error) {
      console.error(`Error getting agent assignments for agent ${agentId}:`, error)
      throw error
    }
  }

  static async create(assignmentData) {
    try {
      // Validate that the property exists
      const [properties] = await db.query("SELECT * FROM properties WHERE id = ?", [assignmentData.propertyId])
      if (properties.length === 0) {
        throw new Error("Property not found")
      }

      // Validate that the flat exists and belongs to the property if a flat ID is provided
      if (assignmentData.flatId) {
        const [flats] = await db.query("SELECT * FROM flats WHERE id = ? AND property_id = ?", [
          assignmentData.flatId,
          assignmentData.propertyId,
        ])
        if (flats.length === 0) {
          throw new Error("Flat not found or does not belong to the specified property")
        }
      }

      const [result] = await db.query(
        `INSERT INTO agent_assignments (
          agent_id, property_id, flat_id, commission_rate, notes, assignment_date
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          assignmentData.agentId,
          assignmentData.propertyId,
          assignmentData.flatId || null,
          assignmentData.commissionRate || 5,
          assignmentData.notes || null,
        ],
      )
      return result.insertId
    } catch (error) {
      console.error("Error creating agent assignment:", error)
      throw error
    }
  }

  static async update(id, assignmentData) {
    try {
      const updateFields = []
      const updateValues = []

      if (assignmentData.propertyId) {
        updateFields.push("property_id = ?")
        updateValues.push(assignmentData.propertyId)
      }

      if (assignmentData.flatId !== undefined) {
        updateFields.push("flat_id = ?")
        updateValues.push(assignmentData.flatId)
      }

      if (assignmentData.commissionRate !== undefined) {
        updateFields.push("commission_rate = ?")
        updateValues.push(assignmentData.commissionRate)
      }

      if (assignmentData.notes !== undefined) {
        updateFields.push("notes = ?")
        updateValues.push(assignmentData.notes)
      }

      if (assignmentData.status) {
        updateFields.push("status = ?")
        updateValues.push(assignmentData.status)
      }

      if (updateFields.length === 0) {
        return false
      }

      updateValues.push(id)

      const [result] = await db.query(
        `UPDATE agent_assignments SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        updateValues,
      )

      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating agent assignment with id ${id}:`, error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query("DELETE FROM agent_assignments WHERE id = ?", [id])
      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error deleting agent assignment with id ${id}:`, error)
      throw error
    }
  }

  static async getByAgentAndProperty(agentId, propertyId, flatId = null) {
    try {
      let query = "SELECT * FROM agent_assignments WHERE agent_id = ? AND property_id = ?"
      const params = [agentId, propertyId]

      if (flatId) {
        query += " AND flat_id = ?"
        params.push(flatId)
      } else {
        query += " AND flat_id IS NULL"
      }

      const [assignments] = await db.query(query, params)
      return assignments[0]
    } catch (error) {
      console.error(`Error getting assignment for agent ${agentId} and property ${propertyId}:`, error)
      throw error
    }
  }
}

module.exports = AgentAssignment
