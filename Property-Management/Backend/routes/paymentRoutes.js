const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware.verifyToken);

// Payment routes
router.get("/", paymentController.getAllPayments);
router.get("/property/:propertyId", paymentController.getPaymentsByPropertyId);
router.get("/flat/:flatId", paymentController.getPaymentsByFlatId);
router.get("/:id", paymentController.getPaymentById);
router.post("/", paymentController.uploadPaymentReceipt, paymentController.createPayment);
router.put("/:id", paymentController.uploadPaymentReceipt, paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

// Flat details routes
router.get("/flat-details/:flatId", paymentController.getFlatDetailByFlatId);
router.post("/flat-details/:flatId", paymentController.createOrUpdateFlatDetail);

// Payment schedule routes
router.get("/schedules/flat/:flatId", paymentController.getPaymentSchedulesByFlatId);
router.post("/schedules", paymentController.createPaymentSchedule);
router.put("/schedules/:id", paymentController.updatePaymentSchedule);
router.delete("/schedules/:id", paymentController.deletePaymentSchedule);

module.exports = router;