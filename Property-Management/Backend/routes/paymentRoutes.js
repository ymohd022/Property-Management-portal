const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);

// Payment routes
router.get('/', paymentController.getAllPayments);
router.get('/summary', paymentController.getPaymentSummary);
router.get('/property/:propertyId', paymentController.getPaymentsByPropertyId);
router.get('/property/:propertyId/summary', paymentController.getPaymentSummaryByPropertyId);
router.get('/flat/:flatId', paymentController.getPaymentsByFlatId);
router.get('/flat/:flatId/summary', paymentController.getPaymentSummaryByFlatId);
router.get('/:id', paymentController.getPaymentById);
router.post('/', upload.single('receipt'), paymentController.createPayment);
router.put('/:id', upload.single('receipt'), paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// Flat pricing routes
router.get('/flat/:flatId/pricing', paymentController.getFlatPricing);
router.post('/flat/:flatId/pricing', paymentController.createOrUpdateFlatPricing);
router.put('/flat/:flatId/pricing', paymentController.createOrUpdateFlatPricing);

module.exports = router;