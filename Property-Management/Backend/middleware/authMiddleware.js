const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" })
  }
}

exports.verifyAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next()
    } else {
      res.status(403).json({ message: "Requires admin privileges" })
    }
  })
}

exports.verifyAgentOrAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "agent") {
      next()
    } else {
      res.status(403).json({ message: "Requires agent or admin privileges" })
    }
  })
}
