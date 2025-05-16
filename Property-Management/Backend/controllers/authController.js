const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Agent = require("../models/agent")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // In production, use environment variables

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Check if user exists and password is correct
    const user = await User.verifyCredentials(email, password)

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "Your account is inactive. Please contact the administrator." })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
      },
    })
  } catch (error) {
    console.error("Error in login:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    // Check if user exists
    const user = await User.getByEmail(email)
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.json({ message: "If your email is registered, you will receive a password reset link" })
    }

    // In a real application, you would generate a reset token and send an email
    // For this demo, we'll just return a success message
    res.json({ message: "If your email is registered, you will receive a password reset link" })
  } catch (error) {
    console.error("Error in forgotPassword:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Test endpoint to check API connectivity
exports.testConnection = (req, res) => {
  res.json({ message: "API is working" })
}
