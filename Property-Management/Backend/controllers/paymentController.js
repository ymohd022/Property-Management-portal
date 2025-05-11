const Payment = require('../models/payment');
const FlatPricing = require('../models/flatPricing');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

exports.getPaymentsByFlatId = async (req, res) => {
  try {
    const { flatId } = req.params;
    const payments = await Payment.getPaymentsByFlatId(flatId);
    res.status(200).json(payments);
  } catch (error) {
    console.error(`Error fetching payments for flat ${req.params.flatId}:`, error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

exports.getPaymentsByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const payments = await Payment.getPaymentsByPropertyId(propertyId);
    res.status(200).json(payments);
  } catch (error) {
    console.error(`Error fetching payments for property ${req.params.propertyId}:`, error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error(`Error fetching payment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    let paymentData = { ...req.body };
    
    // Handle file upload if present
    if (req.file) {
      const filename = `${uuidv4()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      paymentData.receipt_image_path = `/uploads/receipts/${filename}`;
    }
    
    // Add the user ID from the authenticated request
    paymentData.created_by = req.user.id;
    
    const payment = await Payment.createPayment(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    let paymentData = { ...req.body };
    
    // Get existing payment to check if we need to delete old image
    const existingPayment = await Payment.getPaymentById(id);
    if (!existingPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Handle file upload if present
    if (req.file) {
      const filename = `${uuidv4()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      paymentData.receipt_image_path = `/uploads/receipts/${filename}`;
      
      // Delete old image if exists
      if (existingPayment.receipt_image_path) {
        const oldFilePath = path.join(__dirname, '..', existingPayment.receipt_image_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    } else {
      // Keep existing image path if no new file uploaded
      paymentData.receipt_image_path = existingPayment.receipt_image_path;
    }
    
    const payment = await Payment.updatePayment(id, paymentData);
    res.status(200).json(payment);
  } catch (error) {
    console.error(`Error updating payment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get existing payment to delete image if exists
    const existingPayment = await Payment.getPaymentById(id);
    if (!existingPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Delete image if exists
    if (existingPayment.receipt_image_path) {
      const filePath = path.join(__dirname, '..', existingPayment.receipt_image_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Payment.deletePayment(id);
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting payment ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const summary = await Payment.getPaymentSummary();
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ message: 'Error fetching payment summary', error: error.message });
  }
};

exports.getPaymentSummaryByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const summary = await Payment.getPaymentSummaryByPropertyId(propertyId);
    res.status(200).json(summary);
  } catch (error) {
    console.error(`Error fetching payment summary for property ${req.params.propertyId}:`, error);
    res.status(500).json({ message: 'Error fetching payment summary', error: error.message });
  }
};

exports.getPaymentSummaryByFlatId = async (req, res) => {
  try {
    const { flatId } = req.params;
    const summary = await Payment.getPaymentSummaryByFlatId(flatId);
    
    if (!summary) {
      return res.status(404).json({ message: 'Flat not found or no payment data available' });
    }
    
    res.status(200).json(summary);
  } catch (error) {
    console.error(`Error fetching payment summary for flat ${req.params.flatId}:`, error);
    res.status(500).json({ message: 'Error fetching payment summary', error: error.message });
  }
};

exports.getFlatPricing = async (req, res) => {
  try {
    const { flatId } = req.params;
    const pricing = await FlatPricing.getFlatPricingByFlatId(flatId);
    
    if (!pricing) {
      return res.status(404).json({ message: 'Flat pricing not found' });
    }
    
    res.status(200).json(pricing);
  } catch (error) {
    console.error(`Error fetching pricing for flat ${req.params.flatId}:`, error);
    res.status(500).json({ message: 'Error fetching flat pricing', error: error.message });
  }
};

exports.createOrUpdateFlatPricing = async (req, res) => {
  try {
    const { flatId } = req.params;
    const pricingData = { ...req.body, flat_id: flatId };
    
    // Calculate total flat amount if not provided
    if (!pricingData.total_flat_amount) {
      pricingData.total_flat_amount = (
        parseFloat(pricingData.base_price || 0) +
        parseFloat(pricingData.semi_finished_price || 0) +
        parseFloat(pricingData.work_order_estimate || 0) +
        parseFloat(pricingData.registration_gst || 0) +
        parseFloat(pricingData.miscellaneous_amount || 0)
      );
    }
    
    const pricing = await FlatPricing.updateFlatPricing(flatId, pricingData);
    res.status(200).json(pricing);
  } catch (error) {
    console.error(`Error updating pricing for flat ${req.params.flatId}:`, error);
    res.status(500).json({ message: 'Error updating flat pricing', error: error.message });
  }
};