const db = require("../config/database")

class Sale {
  static async getAll() {
    try {
      const [sales] = await db.query(`
        SELECT s.*, a.name as agent_name, p.name as property_name, f.flat_number, c.name as client_name
        FROM sales s
        LEFT JOIN agents a ON s.agent_id = a.id
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        LEFT JOIN clients c ON s.client_id = c.id
        ORDER BY s.sale_date DESC
      `)
      return sales
    } catch (error) {
      console.error("Error getting sales:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [sales] = await db.query(
        `
        SELECT s.*, a.name as agent_name, p.name as property_name, f.flat_number, c.name as client_name
        FROM sales s
        LEFT JOIN agents a ON s.agent_id = a.id
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        LEFT JOIN clients c ON s.client_id = c.id
        WHERE s.id = ?
      `,
        [id],
      )
      return sales[0]
    } catch (error) {
      console.error(`Error getting sale with id ${id}:`, error)
      throw error
    }
  }

  static async create(saleData) {
    try {
      const [result] = await db.query(
        `INSERT INTO sales (
          agent_id, property_id, flat_id, client_id, sale_amount, sale_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          saleData.agentId,
          saleData.propertyId,
          saleData.flatId || null,
          saleData.clientId,
          saleData.saleAmount,
          saleData.saleDate || new Date().toISOString().split("T")[0],
          saleData.status || "Completed",
        ],
      )

      // Create commission record if agent exists
      if (saleData.agentId) {
        // Get agent's commission rate
        const [agents] = await db.query("SELECT commission_rate FROM agents WHERE id = ?", [saleData.agentId])
        if (agents.length > 0) {
          const commissionRate = saleData.commissionRate || agents[0].commission_rate
          const commissionAmount = (saleData.saleAmount * commissionRate) / 100

          await db.query(
            `INSERT INTO commissions (
              agent_id, sale_id, commission_percentage, commission_amount, status
            ) VALUES (?, ?, ?, ?, ?)`,
            [saleData.agentId, result.insertId, commissionRate, commissionAmount, "Pending"],
          )
        }
      }

      // Update flat status if flat_id is provided
      if (saleData.flatId) {
        await db.query("UPDATE flats SET status = ? WHERE id = ?", ["Sold", saleData.flatId])
      }

      return result.insertId
    } catch (error) {
      console.error("Error creating sale:", error)
      throw error
    }
  }

  static async update(id, saleData) {
    try {
      const updateFields = []
      const updateValues = []

      if (saleData.agentId) {
        updateFields.push("agent_id = ?")
        updateValues.push(saleData.agentId)
      }

      if (saleData.propertyId) {
        updateFields.push("property_id = ?")
        updateValues.push(saleData.propertyId)
      }

      if (saleData.flatId !== undefined) {
        updateFields.push("flat_id = ?")
        updateValues.push(saleData.flatId)
      }

      if (saleData.clientId) {
        updateFields.push("client_id = ?")
        updateValues.push(saleData.clientId)
      }

      if (saleData.saleAmount) {
        updateFields.push("sale_amount = ?")
        updateValues.push(saleData.saleAmount)
      }

      if (saleData.saleDate) {
        updateFields.push("sale_date = ?")
        updateValues.push(saleData.saleDate)
      }

      if (saleData.status) {
        updateFields.push("status = ?")
        updateValues.push(saleData.status)
      }

      if (updateFields.length === 0) {
        return false
      }

      updateValues.push(id)

      const [result] = await db.query(
        `UPDATE sales SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        updateValues,
      )

      // Update commission if sale amount changed
      if (saleData.saleAmount) {
        const [sales] = await db.query("SELECT agent_id FROM sales WHERE id = ?", [id])
        if (sales.length > 0 && sales[0].agent_id) {
          const [commissions] = await db.query("SELECT id, commission_percentage FROM commissions WHERE sale_id = ?", [
            id,
          ])
          if (commissions.length > 0) {
            const commissionRate = commissions[0].commission_percentage
            const commissionAmount = (saleData.saleAmount * commissionRate) / 100

            await db.query("UPDATE commissions SET commission_amount = ?, updated_at = NOW() WHERE id = ?", [
              commissionAmount,
              commissions[0].id,
            ])
          }
        }
      }

      return result.affectedRows > 0
    } catch (error) {
      console.error(`Error updating sale with id ${id}:`, error)
      throw error
    }
  }

  static async getByAgentId(agentId) {
    try {
      const [sales] = await db.query(
        `
        SELECT s.*, p.name as property, f.flat_number as flatNumber, c.name as clientName,
               cm.commission_amount as commission
        FROM sales s
        LEFT JOIN properties p ON s.property_id = p.id
        LEFT JOIN flats f ON s.flat_id = f.id
        LEFT JOIN clients c ON s.client_id = c.id
        LEFT JOIN commissions cm ON s.id = cm.sale_id
        WHERE s.agent_id = ?
        ORDER BY s.sale_date DESC
      `,
        [agentId],
      )
      return sales
    } catch (error) {
      console.error(`Error getting sales for agent with id ${agentId}:`, error)
      throw error
    }
  }
}

module.exports = Sale
