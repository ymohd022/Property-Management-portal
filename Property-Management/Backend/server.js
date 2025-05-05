const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // In production, use environment variables

// Import routes
const agentRoutes = require("./routes/agentRoutes")
const leadRoutes = require("./routes/leadRoutes")
const agentAssignmentRoutes = require("./routes/agentAssignmentRoutes")

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Routes
app.use("/api/agents", agentRoutes)
app.use("/api/leads", leadRoutes)
app.use("/api/agent-assignments", agentAssignmentRoutes)

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if it's an admin login
    if (email === "admin@qmaks.com" && password === "password") {
      const token = jwt.sign({ id: 1, email, role: "admin" }, JWT_SECRET, { expiresIn: "1h" })

      return res.json({
        token,
        user: {
          id: 1,
          name: "Admin User",
          email,
          role: "admin",
        },
      })
    }

    // Check if it's an agent login
    const Agent = require("./models/agent")
    const agent = await Agent.verifyCredentials(email, password)

    if (!agent) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    if (agent.status === "Inactive") {
      return res.status(403).json({ message: "Your account is inactive. Please contact the administrator." })
    }

    const token = jwt.sign({ id: agent.id, email: agent.email, role: "agent" }, JWT_SECRET, { expiresIn: "1h" })

    res.json({
      token,
      user: agent,
    })
  } catch (error) {
    console.error("Error in login:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body

  // In a real app, you would send an email with a reset link
  res.json({ message: "If your email is registered, you will receive a password reset link" })
})

// Properties routes
app.get("/api/properties", (req, res) => {
  // Mock properties data
  const properties = [
    {
      id: 1,
      name: "Sunshine Apartments",
      location: "Whitefield, Bangalore",
      type: "Residential",
      totalFlats: 48,
      soldFlats: 32,
      availableFlats: 16,
      status: "Active",
    },
    {
      id: 2,
      name: "Green Valley Villas",
      location: "Electronic City, Bangalore",
      type: "Residential",
      totalFlats: 24,
      soldFlats: 18,
      availableFlats: 6,
      status: "Active",
    },
    {
      id: 3,
      name: "Metro Business Park",
      location: "MG Road, Bangalore",
      type: "Commercial",
      totalFlats: 36,
      soldFlats: 28,
      availableFlats: 8,
      status: "Completed",
    },
    {
      id: 4,
      name: "Lakeside Residency",
      location: "Hebbal, Bangalore",
      type: "Residential",
      totalFlats: 60,
      soldFlats: 45,
      availableFlats: 15,
      status: "Active",
    },
    {
      id: 5,
      name: "City Center Mall",
      location: "Jayanagar, Bangalore",
      type: "Commercial",
      totalFlats: 72,
      soldFlats: 64,
      availableFlats: 8,
      status: "Completed",
    },
  ]

  res.json(properties)
})

app.get("/api/properties/:id/flats", (req, res) => {
  // Mock flats data
  const flats = [
    { id: 101, flatNumber: "101", type: "2BHK", status: "Available" },
    { id: 102, flatNumber: "102", type: "3BHK", status: "Available" },
    { id: 103, flatNumber: "103", type: "2BHK", status: "Booked" },
    { id: 104, flatNumber: "104", type: "3BHK", status: "Available" },
    { id: 201, flatNumber: "201", type: "2BHK", status: "Sold" },
    { id: 202, flatNumber: "202", type: "3BHK", status: "Available" },
  ]

  res.json(flats)
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
