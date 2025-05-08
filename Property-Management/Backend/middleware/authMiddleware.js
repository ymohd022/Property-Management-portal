const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // In production, use environment variables

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" })
    }

    req.user = user
    next()
  })
}

exports.verifyAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next()
    } else {
      res.status(403).json({ message: "Forbidden - Admin access required" })
    }
  })
}

exports.verifyAgent = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "agent") {
      next()
    } else {
      res.status(403).json({ message: "Forbidden - Agent access required" })
    }
  })
}

exports.verifyAgentOrAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "agent") {
      next()
    } else {
      res.status(403).json({ message: "Forbidden - Admin or Agent access required" })
    }
  })
}

exports.verifyManager = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "manager") {
      next()
    } else {
      res.status(403).json({ message: "Forbidden - Manager access required" })
    }
  })
}

exports.verifyManagerOrAdmin = (req, res, next) => {
  this.verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "manager") {
      next()
    } else {
      res.status(403).json({ message: "Forbidden - Admin or Manager access required" })
    }
  })
}
