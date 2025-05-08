const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // move to env var in prod

// Import your User model
const User = require("./models/user");

// --- MIDDLEWARE ---
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Handle preflight
app.options("*", cors());

// built-in body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads if needed
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Your other routes...
// app.use("/api/agents", agentRoutes);
// etc.

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  console.log("→ Forgot password request for:", email);
  // stub
  res.json({ message: "If your email is registered, you will receive a reset link." });
});

// Start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
