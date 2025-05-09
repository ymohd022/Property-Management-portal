const db = require("../config/database")
const bcrypt = require("bcryptjs")

class User {
  static async getAll() {
    try {
      const [users] = await db.query("SELECT id, name, email, role, status FROM users")
      return users
    } catch (error) {
      console.error("Error getting users:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [users] = await db.query("SELECT id, name, email, role, status FROM users WHERE id = ?", [id])
      return users[0]
    } catch (error) {
      console.error(`Error getting user with id ${id}:`, error)
      throw error
    }
  }

  static async getByEmail(email) {
    try {
      console.log(`Looking for user with email: ${email}`)
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email])
      console.log(`Found ${users.length} users with email ${email}`)
      return users[0]
    } catch (error) {
      console.error(`Error getting user with email ${email}:`, error)
      throw error
    }
  }

  static async create(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.getByEmail(userData.email)
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const [result] = await db.query(
        "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
        [userData.name, userData.email, hashedPassword, userData.role, userData.status || "Active"],
      )

      // If user is agent, create agent record
      if (userData.role === "agent") {
        await db.query(
          "INSERT INTO agents (user_id, name, email, phone, commission_rate, status) VALUES (?, ?, ?, ?, ?, ?)",
          [
            result.insertId,
            userData.name,
            userData.email,
            userData.phone || "",
            userData.commissionRate || 5,
            userData.status || "Active",
          ],
        )
      }

      return result.insertId
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  static async update(id, userData) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      const updateFields = []
      const updateValues = []

      if (userData.name) {
        updateFields.push("name = ?")
        updateValues.push(userData.name)
      }

      if (userData.email) {
        // Check if email is being changed and if new email already exists
        const [users] = await connection.query("SELECT email FROM users WHERE id = ?", [id])
        if (users.length > 0 && users[0].email !== userData.email) {
          const [existingUsers] = await connection.query("SELECT id FROM users WHERE email = ? AND id != ?", [
            userData.email,
            id,
          ])
          if (existingUsers.length > 0) {
            throw new Error("User with this email already exists")
          }
        }
        updateFields.push("email = ?")
        updateValues.push(userData.email)
      }

      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        updateFields.push("password = ?")
        updateValues.push(hashedPassword)
      }

      if (userData.role) {
        updateFields.push("role = ?")
        updateValues.push(userData.role)
      }

      if (userData.status) {
        updateFields.push("status = ?")
        updateValues.push(userData.status)
      }

      if (updateFields.length === 0) {
        return false
      }

      updateValues.push(id)

      const [result] = await connection.query(
        `UPDATE users SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        updateValues,
      )

      // If user is agent, update agent record
      if (userData.role === "agent") {
        // Check if agent record exists
        const [agents] = await connection.query("SELECT id FROM agents WHERE user_id = ?", [id])

        if (agents.length > 0) {
          // Update existing agent
          const agentUpdateFields = []
          const agentUpdateValues = []

          if (userData.name) {
            agentUpdateFields.push("name = ?")
            agentUpdateValues.push(userData.name)
          }

          if (userData.email) {
            agentUpdateFields.push("email = ?")
            agentUpdateValues.push(userData.email)
          }

          if (userData.phone) {
            agentUpdateFields.push("phone = ?")
            agentUpdateValues.push(userData.phone)
          }

          if (userData.commissionRate) {
            agentUpdateFields.push("commission_rate = ?")
            agentUpdateValues.push(userData.commissionRate)
          }

          if (userData.status) {
            agentUpdateFields.push("status = ?")
            agentUpdateValues.push(userData.status)
          }

          if (agentUpdateFields.length > 0) {
            agentUpdateValues.push(agents[0].id)
            await connection.query(
              `UPDATE agents SET ${agentUpdateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
              agentUpdateValues,
            )
          }
        } else {
          // Create new agent record
          await connection.query(
            "INSERT INTO agents (user_id, name, email, phone, commission_rate, status) VALUES (?, ?, ?, ?, ?, ?)",
            [
              id,
              userData.name,
              userData.email,
              userData.phone || "",
              userData.commissionRate || 5,
              userData.status || "Active",
            ],
          )
        }
      }

      await connection.commit()
      return result.affectedRows > 0
    } catch (error) {
      await connection.rollback()
      console.error(`Error updating user with id ${id}:`, error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async updateStatus(id, status) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      // Update user status
      const [result] = await connection.query("UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?", [
        status,
        id,
      ])

      // Check if user is an agent
      const [users] = await connection.query("SELECT role FROM users WHERE id = ?", [id])
      if (users.length > 0 && users[0].role === "agent") {
        // Update agent status
        await connection.query("UPDATE agents SET status = ?, updated_at = NOW() WHERE user_id = ?", [status, id])
      }

      await connection.commit()
      return result.affectedRows > 0
    } catch (error) {
      await connection.rollback()
      console.error(`Error updating status for user with id ${id}:`, error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async verifyCredentials(email, password) {
    try {
      console.log(`Verifying credentials for email: ${email}`)
      const user = await this.getByEmail(email)

      if (!user) {
        console.log("User not found")
        return null
      }

      console.log("Comparing passwords...")
      const isPasswordValid = await bcrypt.compare(password, user.password)
      console.log(`Password valid: ${isPasswordValid}`)

      if (!isPasswordValid) {
        console.log("Invalid password")
        return null
      }

      if (user.status !== "Active") {
        console.log("User inactive")
        return { status: "Inactive" }
      }

      console.log("Credentials verified successfully")
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    } catch (error) {
      console.error("Error verifying user credentials:", error)
      throw error
    }
  }
}

module.exports = User
