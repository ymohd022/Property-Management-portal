const db = require("../config/database");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Configure multer storage for receipt images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../uploads/receipts");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
      return cb(new Error("Only image and PDF files are allowed!"), false);
    }
    cb(null, true);
  },
});

class Payment {
  static async getAllPayments() {
    try {
      const [payments] = await db.query(`
        SELECT p.*, 
          pr.name as property_name, 
          f.flat_number, 
          b.block_name,
          CONCAT(u.name) as created_by_name,
          CONCAT(c.name) as client_name
        FROM payments p
        JOIN properties pr ON p.property_id = pr.id
        JOIN flats f ON p.flat_id = f.id
        LEFT JOIN blocks b ON p.block_id = b.id
        JOIN users u ON p.created_by = u.id
        LEFT JOIN clients c ON p.client_id = c.id
        ORDER BY p.payment_date DESC
      `);
      return payments;
    } catch (error) {
      console.error("Error getting payments:", error);
      throw error;
    }
  }

  static async getPaymentsByPropertyId(propertyId) {
    try {
      const [payments] = await db.query(
        `
        SELECT p.*, 
          pr.name as property_name, 
          f.flat_number, 
          b.block_name,
          CONCAT(u.name) as created_by_name,
          CONCAT(c.name) as client_name
        FROM payments p
        JOIN properties pr ON p.property_id = pr.id
        JOIN flats f ON p.flat_id = f.id
        LEFT JOIN blocks b ON p.block_id = b.id
        JOIN users u ON p.created_by = u.id
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.property_id = ?
        ORDER BY p.payment_date DESC
      `,
        [propertyId]
      );
      return payments;
    } catch (error) {
      console.error(`Error getting payments for property ${propertyId}:`, error);
      throw error;
    }
  }

  static async getPaymentsByFlatId(flatId) {
    try {
      const [payments] = await db.query(
        `
        SELECT p.*, 
          pr.name as property_name, 
          f.flat_number, 
          b.block_name,
          CONCAT(u.name) as created_by_name,
          CONCAT(c.name) as client_name
        FROM payments p
        JOIN properties pr ON p.property_id = pr.id
        JOIN flats f ON p.flat_id = f.id
        LEFT JOIN blocks b ON p.block_id = b.id
        JOIN users u ON p.created_by = u.id
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.flat_id = ?
        ORDER BY p.payment_date DESC
      `,
        [flatId]
      );
      return payments;
    } catch (error) {
      console.error(`Error getting payments for flat ${flatId}:`, error);
      throw error;
    }
  }

  static async getPaymentById(id) {
    try {
      const [payments] = await db.query(
        `
        SELECT p.*, 
          pr.name as property_name, 
          f.flat_number, 
          b.block_name,
          CONCAT(u.name) as created_by_name,
          CONCAT(c.name) as client_name
        FROM payments p
        JOIN properties pr ON p.property_id = pr.id
        JOIN flats f ON p.flat_id = f.id
        LEFT JOIN blocks b ON p.block_id = b.id
        JOIN users u ON p.created_by = u.id
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ?
      `,
        [id]
      );

      if (payments.length === 0) {
        return null;
      }

      return payments[0];
    } catch (error) {
      console.error(`Error getting payment with id ${id}:`, error);
      throw error;
    }
  }

  static async createPayment(paymentData, userId) {
  try {
    // Convert "undefined" to null and validate client_id
    const clientId = paymentData.clientId === 'undefined' || paymentData.clientId === undefined 
      ? null 
      : paymentData.clientId;

    const [result] = await db.query(
      `
      INSERT INTO payments (
        property_id, block_id, flat_id, client_id, payment_date, 
        payment_type, payment_method, amount, reference_number, 
        receipt_image, comments, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        paymentData.propertyId,
        paymentData.blockId || null,
        paymentData.flatId,
        clientId, // Use sanitized clientId
        paymentData.paymentDate,
        paymentData.paymentType,
        paymentData.paymentMethod,
        paymentData.amount,
        paymentData.referenceNumber || null,
        paymentData.receiptImage || null,
        paymentData.comments || null,
        userId,
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}
  static async updatePayment(id, paymentData) {
    try {
      const [result] = await db.query(
        `
        UPDATE payments SET
          property_id = ?,
          block_id = ?,
          flat_id = ?,
          client_id = ?,
          payment_date = ?,
          payment_type = ?,
          payment_method = ?,
          amount = ?,
          reference_number = ?,
          receipt_image = COALESCE(?, receipt_image),
          comments = ?
        WHERE id = ?
      `,
        [
          paymentData.propertyId,
          paymentData.blockId || null,
          paymentData.flatId,
          paymentData.clientId || null,
          paymentData.paymentDate,
          paymentData.paymentType,
          paymentData.paymentMethod,
          paymentData.amount,
          paymentData.referenceNumber || null,
          paymentData.receiptImage || null,
          paymentData.comments || null,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating payment with id ${id}:`, error);
      throw error;
    }
  }

  static async deletePayment(id) {
    try {
      // Get payment to check if it has an image
      const [payments] = await db.query("SELECT receipt_image FROM payments WHERE id = ?", [id]);
      
      if (payments.length > 0 && payments[0].receipt_image) {
        // Delete the image file
        const imagePath = path.join(__dirname, "../uploads/receipts", path.basename(payments[0].receipt_image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const [result] = await db.query("DELETE FROM payments WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting payment with id ${id}:`, error);
      throw error;
    }
  }

  // Get upload middleware
  static getUploadMiddleware() {
    return upload.single("receiptImage");
  }
}

module.exports = Payment;