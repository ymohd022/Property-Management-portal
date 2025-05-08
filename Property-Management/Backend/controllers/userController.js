const User = require("../models/user")

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll()
    res.json(users)
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error in getUserById:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.createUser = async (req, res) => {
  try {
    const userId = await User.create(req.body)
    res.status(201).json({ id: userId, message: "User created successfully" })
  } catch (error) {
    console.error("Error in createUser:", error)
    if (error.message === "User with this email already exists") {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const success = await User.update(req.params.id, req.body)
    if (!success) {
      return res.status(404).json({ message: "User not found or no changes made" })
    }
    res.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error in updateUser:", error)
    if (error.message === "User with this email already exists") {
      return res.status(400).json({ message: error.message })
    }
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const success = await User.updateStatus(req.params.id, status)
    if (!success) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ message: "User status updated successfully" })
  } catch (error) {
    console.error("Error in updateUserStatus:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const success = await User.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error in deleteUser:", error)
    res.status(500).json({ message: "Server error" })
  }
}
