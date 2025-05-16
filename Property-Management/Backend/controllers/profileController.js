const User = require("../models/user")
const Agent = require("../models/agent")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    let profileData = {}

    // Get basic user data
    const user = await User.getById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profilePicture: user.profile_picture,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }

    // If user is an agent, get additional agent data
    if (userRole === "agent") {
      const agent = await Agent.getByUserId(userId)
      if (agent) {
        profileData.phone = agent.phone
        profileData.address = agent.address
        profileData.commissionRate = agent.commission_rate
      }
    }

    res.json(profileData)
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const { name, phone, address } = req.body

    // Update user data
    const userData = { name }
    const success = await User.update(userId, userData)

    if (!success) {
      return res.status(404).json({ message: "User not found or no changes made" })
    }

    // If user is an agent, update agent data
    if (userRole === "agent" && (phone || address)) {
      const agentData = {}
      if (phone) agentData.phone = phone
      if (address) agentData.address = address

      await Agent.update(userId, agentData)
    }

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" })
    }

    // Get user
    const user = await User.getById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const success = await User.update(userId, { password: hashedPassword })

    if (!success) {
      return res.status(500).json({ message: "Failed to update password" })
    }

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error in changePassword:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const userId = req.user.id
    const profilePicturePath = `/uploads/profile_pictures/${req.file.filename}`

    // Update user with new profile picture path
    const success = await User.update(userId, { profile_picture: profilePicturePath })

    if (!success) {
      // Remove uploaded file if user update fails
      fs.unlinkSync(path.join(__dirname, "../uploads", profilePicturePath))
      return res.status(404).json({ message: "User not found or no changes made" })
    }

    // If user already had a profile picture, delete the old one
    const user = await User.getById(userId)
    if (user.profile_picture && user.profile_picture !== profilePicturePath) {
      const oldPicturePath = path.join(__dirname, "../uploads", user.profile_picture)
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath)
      }
    }

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: profilePicturePath,
    })
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
