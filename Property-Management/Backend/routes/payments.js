const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'receipt-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png, and .pdf files are allowed'));
    }
  }
});

// Get all payments with optional filters
router.get('/',  async (req, res) => {
  try {
    const { propertyId, flatId, startDate, endDate, paymentType, paymentCategory } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.payment_date,
        p.payment_type,
        p.payment_category,
        p.payment_amount,
        p.reference_number,
        p.receipt_image_path,
        p.comments,
        p.created_at,
        f.id AS flat_id,
        f.flat_number,
        f.floor_number,
        f.bhk_type,
        f.flat_owner,
        pr.id AS property_id,
        pr.name AS property_name
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      JOIN 
        properties pr ON p.property_id = pr.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (propertyId) {
      query += ' AND p.property_id = ?';
      queryParams.push(propertyId);
    }
    
    if (flatId) {
      query += ' AND p.flat_id = ?';
      queryParams.push(flatId);
    }
    
    if (startDate) {
      query += ' AND p.payment_date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND p.payment_date <= ?';
      queryParams.push(endDate);
    }
    
    if (paymentType) {
      query += ' AND p.payment_type = ?';
      queryParams.push(paymentType);
    }
    
    if (paymentCategory) {
      query += ' AND p.payment_category = ?';
      queryParams.push(paymentCategory);
    }
    
    query += ' ORDER BY p.payment_date DESC';
    
    const [payments] = await db.query(query, queryParams);
    
    // Add receipt image URL if exists
    payments.forEach(payment => {
      if (payment.receipt_image_path) {
        payment.receipt_image_url = `${req.protocol}://${req.get('host')}/uploads/receipts/${path.basename(payment.receipt_image_path)}`;
      } else {
        payment.receipt_image_url = null;
      }
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// Get payment by ID
router.get('/:id',  async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT 
        p.*,
        f.flat_number,
        f.floor_number,
        f.bhk_type,
        f.flat_owner,
        pr.name AS property_name
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      JOIN 
        properties pr ON p.property_id = pr.id
      WHERE 
        p.id = ?`,
      [req.params.id]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const payment = payments[0];
    
    // Add receipt image URL if exists
    if (payment.receipt_image_path) {
      payment.receipt_image_url = `${req.protocol}://${req.get('host')}/uploads/receipts/${path.basename(payment.receipt_image_path)}`;
    } else {
      payment.receipt_image_url = null;
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
  }
});

// Get payments by flat ID
router.get('/flat/:flatId',  async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT 
        p.*,
        f.flat_number,
        f.floor_number,
        pr.name AS property_name
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      JOIN 
        properties pr ON p.property_id = pr.id
      WHERE 
        p.flat_id = ?
      ORDER BY 
        p.payment_date DESC`,
      [req.params.flatId]
    );
    
    // Add receipt image URL if exists
    payments.forEach(payment => {
      if (payment.receipt_image_path) {
        payment.receipt_image_url = `${req.protocol}://${req.get('host')}/uploads/receipts/${path.basename(payment.receipt_image_path)}`;
      } else {
        payment.receipt_image_url = null;
      }
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments by flat:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// Get payments by property ID
router.get('/property/:propertyId',  async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT 
        p.*,
        f.flat_number,
        f.floor_number,
        f.bhk_type,
        f.flat_owner,
        pr.name AS property_name
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      JOIN 
        properties pr ON p.property_id = pr.id
      WHERE 
        p.property_id = ?
      ORDER BY 
        p.payment_date DESC`,
      [req.params.propertyId]
    );
    
    // Add receipt image URL if exists
    payments.forEach(payment => {
      if (payment.receipt_image_path) {
        payment.receipt_image_url = `${req.protocol}://${req.get('host')}/uploads/receipts/${path.basename(payment.receipt_image_path)}`;
      } else {
        payment.receipt_image_url = null;
      }
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments by property:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// Get payment summary
router.get('/summary',  async (req, res) => {
  try {
    const { propertyId, flatId } = req.query;
    
    let whereClause = '1=1';
    const queryParams = [];
    
    if (propertyId) {
      whereClause += ' AND f.property_id = ?';
      queryParams.push(propertyId);
    }
    
    if (flatId) {
      whereClause += ' AND f.id = ?';
      queryParams.push(flatId);
    }
    
    // Get total payments
    const [paymentResults] = await db.query(
      `SELECT 
        SUM(p.payment_amount) AS total_paid
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      WHERE 
        ${whereClause}`,
      queryParams
    );
    
    // Get total flat amounts and count
    const [flatResults] = await db.query(
      `SELECT 
        COUNT(f.id) AS total_flats,
        SUM(fp.total_flat_amount) AS total_amount
      FROM 
        flats f
      LEFT JOIN 
        flat_pricing fp ON f.id = fp.flat_id
      WHERE 
        ${whereClause}`,
      queryParams
    );
    
    const totalPaid = paymentResults[0].total_paid || 0;
    const totalAmount = flatResults[0].total_amount || 0;
    const totalOutstanding = Math.max(0, totalAmount - totalPaid);
    
    res.json({
      totalPaid,
      totalAmount,
      totalOutstanding,
      totalFlats: flatResults[0].total_flats || 0
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ message: 'Failed to fetch payment summary', error: error.message });
  }
});

// Create a new payment
router.post('/',  upload.single('receipt_image'), async (req, res) => {
  try {
    const {
      property_id,
      flat_id,
      payment_date,
      payment_type,
      payment_category,
      payment_amount,
      reference_number,
      comments
    } = req.body;
    
    // Validate required fields
    if (!property_id || !flat_id || !payment_date || !payment_type || !payment_category || !payment_amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if flat exists
    const [flats] = await db.query('SELECT * FROM flats WHERE id = ?', [flat_id]);
    if (flats.length === 0) {
      return res.status(404).json({ message: 'Flat not found' });
    }
    
    // Check if property exists
    const [properties] = await db.query('SELECT * FROM properties WHERE id = ?', [property_id]);
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const receipt_image_path = req.file ? req.file.path : null;
    
    const [result] = await db.query(
      `INSERT INTO payments (
        property_id,
        flat_id,
        payment_date,
        payment_type,
        payment_category,
        payment_amount,
        reference_number,
        receipt_image_path,
        comments,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        property_id,
        flat_id,
        payment_date,
        payment_type,
        payment_category,
        payment_amount,
        reference_number || null,
        receipt_image_path,
        comments || null,
        req.user.id
      ]
    );
    
    const paymentId = result.insertId;
    
    // Fetch the created payment with additional details
    const [payments] = await db.query(
      `SELECT 
        p.*,
        f.flat_number,
        f.floor_number,
        pr.name AS property_name
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      JOIN 
        properties pr ON p.property_id = pr.id
      WHERE 
        p.id = ?`,
      [paymentId]
    );
    
    const payment = payments[0];
    
    // Add receipt image URL if exists
    if (payment.receipt_image_path) {
      payment.receipt_image_url = `${req.protocol}://${req.get('host')}/uploads/receipts/${path.basename(payment.receipt_image_path)}`;
    } else {
      payment.receipt_image_url = null;
    }
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Failed to create payment', error: error.message });
  }
});

// Update a payment
router.put('/:id',  upload.single('receipt_image'), async (req, res) => {
  try {
    const paymentId = req.params.id;
    
    // Check if payment exists
    const [existingPayments] = await db.query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (existingPayments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const existingPayment = existingPayments[0];
    
    const {
      payment_date,
      payment_type,
      payment_category,
      payment_amount,
      reference_number,
      comments,
      keep_existing_image
    } = req.body;
    
    // Handle receipt image
    let receipt_image_path = existingPayment.receipt_image_path;
    
    // If a new file is uploaded, use it
    if (req.file) {
      receipt_image_path = req.file.path;
      
      // Delete old file if exists
      if (existingPayment.receipt_image_path && fs.existsSync(existingPayment.receipt_image_path)) {
        fs.unlinkSync(existingPayment.receipt_image_path);
      }
    } 
    // If keep_existing_image is false and no new file, remove the image
    else if (keep_existing_image === 'false' && existingPayment.receipt_image_path) {
      if (fs.existsSync(existingPayment.receipt_image_path)) {
        fs.unlinkSync(existingPayment.receipt_image_path);
      }
      receipt_image_path = null;
    }
    
    await db.query(
      `UPDATE payments SET
        payment_date = ?,
        payment_type = ?,
        payment_category = ?,
        payment_amount = ?,
        reference_number = ?,
        receipt_image_path = ?,
        comments = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        payment_date,
        payment_type,
        payment_category,
        payment_amount,
        reference_number || null,
        receipt_image_path,
        comments || null,
        paymentId
      ]
    );
    
    // Fetch the updated payment with additional details
    const [payments] = await db.query(
      `SELECT 
        p.*,
        f.flat_number,
        f.floor_number,
        pr.name AS property_name
      FROM 
        payments p
      JOIN 
        flats f ON p.flat_id = f.id
      JOIN 
        properties pr ON p.property_id = pr.id
      WHERE 
        p.id = ?`,
      [paymentId]
    );
    
    const payment = payments[0];
    
    // Add receipt image URL if exists
    if (payment.receipt_image_path) {
      payment.receipt_image_url = `${req.protocol}://${req.get('host')}/uploads/receipts/${path.basename(payment.receipt_image_path)}`;
    } else {
      payment.receipt_image_url = null;
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Failed to update payment', error: error.message });
  }
});

// Delete a payment
router.delete('/:id',  async (req, res) => {
  try {
    const paymentId = req.params.id;
    
    // Check if payment exists
    const [payments] = await db.query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const payment = payments[0];
    
    // Delete receipt image if exists
    if (payment.receipt_image_path && fs.existsSync(payment.receipt_image_path)) {
      fs.unlinkSync(payment.receipt_image_path);
    }
    
    await db.query('DELETE FROM payments WHERE id = ?', [paymentId]);
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Failed to delete payment', error: error.message });
  }
});

module.exports = router;