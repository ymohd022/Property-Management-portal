const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const path = require("path")
const bcrypt = require("bcryptjs")

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // In production, use environment variables

// Import models
const User = require("./models/user")

// Import routes
const agentRoutes = require("./routes/agentRoutes")
const leadRoutes = require("./routes/leadRoutes")
const agentAssignmentRoutes = require("./routes/agentAssignmentRoutes")
const propertyRoutes = require("./routes/propertyRoutes")
const userRoutes = require("./routes/userRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(bodyParser.json())

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  console.log("Request Body:", req.body)
  next()
})

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/agents", agentRoutes)
app.use("/api/leads", leadRoutes)
app.use("/api/agent-assignments", agentAssignmentRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/users", userRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body)
    const { email, password } = req.body

    if (!email || !password) {
      console.log("Missing email or password")
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Get user from database
    const user = await User.getByEmail(email)
    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      console.log("User not found")
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("Invalid password")
      return res.status(401).json({ message: "Invalid credentials" })
    }

    if (user.status !== "Active") {
      console.log("User inactive")
      return res.status(403).json({ message: "Your account is inactive. Please contact the administrator." })
    }

    // Create token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" })

    // Return user info and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
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

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
