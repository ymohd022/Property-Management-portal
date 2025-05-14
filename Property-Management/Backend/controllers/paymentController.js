const Payment = require("../models/payment");
const FlatDetail = require("../models/flatDetail");
const PaymentSchedule = require("../models/paymentSchedule");
const path = require("path");

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPaymentsByPropertyId = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const payments = await Payment.getPaymentsByPropertyId(propertyId);
    res.json(payments);
  } catch (error) {
    console.error("Error in getPaymentsByPropertyId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPaymentsByFlatId = async (req, res) => {
  try {
    const flatId = req.params.flatId;
    const payments = await Payment.getPaymentsByFlatId(flatId);
    res.json(payments);
  } catch (error) {
    console.error("Error in getPaymentsByFlatId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    let receiptImage = null;
    if (req.file) {
      receiptImage = `/uploads/receipts/${path.basename(req.file.path)}`;
    }

    const paymentData = {
      ...req.body,
      receiptImage,
    };

    const paymentId = await Payment.createPayment(paymentData, req.user.id);
    res.status(201).json({ id: paymentId, message: "Payment created successfully" });
  } catch (error) {
    console.error("Error in createPayment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    let paymentData = { ...req.body };
    
    if (req.file) {
      paymentData.receiptImage = `/uploads/receipts/${path.basename(req.file.path)}`;
    }

    const success = await Payment.updatePayment(req.params.id, paymentData);
    if (!success) {
      return res.status(404).json({ message: "Payment not found or no changes made" });
    }
    res.json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error("Error in updatePayment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const success = await Payment.deletePayment(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error in deletePayment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.uploadPaymentReceipt = Payment.getUploadMiddleware();

// Flat Details Controller Methods
exports.getFlatDetailByFlatId = async (req, res) => {
  try {
    const flatId = req.params.flatId;
    const flatDetail = await FlatDetail.getFlatDetailByFlatId(flatId);
    
    if (!flatDetail) {
      return res.status(404).json({ message: "Flat details not found" });
    }
    
    res.json(flatDetail);
  } catch (error) {
    console.error("Error in getFlatDetailByFlatId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createOrUpdateFlatDetail = async (req, res) => {
  try {
    const flatId = req.params.flatId;
    const detailId = await FlatDetail.createOrUpdateFlatDetail(flatId, req.body);
    
    res.status(200).json({ 
      id: detailId, 
      message: "Flat details saved successfully" 
    });
  } catch (error) {
    console.error("Error in createOrUpdateFlatDetail:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Payment Schedule Controller Methods
exports.getPaymentSchedulesByFlatId = async (req, res) => {
  try {
    const flatId = req.params.flatId;
    const schedules = await PaymentSchedule.getSchedulesByFlatId(flatId);
    res.json(schedules);
  } catch (error) {
    console.error("Error in getPaymentSchedulesByFlatId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createPaymentSchedule = async (req, res) => {
  try {
    const scheduleId = await PaymentSchedule.createSchedule(req.body);
    res.status(201).json({ 
      id: scheduleId, 
      message: "Payment schedule created successfully" 
    });
  } catch (error) {
    console.error("Error in createPaymentSchedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updatePaymentSchedule = async (req, res) => {
  try {
    const success = await PaymentSchedule.updateSchedule(req.params.id, req.body);
    
    if (!success) {
      return res.status(404).json({ message: "Payment schedule not found" });
    }
    
    res.json({ message: "Payment schedule updated successfully" });
  } catch (error) {
    console.error("Error in updatePaymentSchedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deletePaymentSchedule = async (req, res) => {
  try {
    const success = await PaymentSchedule.deleteSchedule(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: "Payment schedule not found" });
    }
    
    res.json({ message: "Payment schedule deleted successfully" });
  } catch (error) {
    console.error("Error in deletePaymentSchedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};