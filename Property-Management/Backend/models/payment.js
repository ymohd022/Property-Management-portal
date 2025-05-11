const db = require('../config/database');

class Payment {
  static async getAllPayments() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*, 
          f.flat_number, 
          f.floor_number,
          pr.name AS property_name,
          u.name AS created_by_name
        FROM 
          payments p
        JOIN 
          flats f ON p.flat_id = f.id
        JOIN 
          properties pr ON p.property_id = pr.id
        JOIN 
          users u ON p.created_by = u.id
        ORDER BY 
          p.payment_date DESC
      `;
      
      db.query(query, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getPaymentsByFlatId(flatId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*, 
          u.name AS created_by_name
        FROM 
          payments p
        JOIN 
          users u ON p.created_by = u.id
        WHERE 
          p.flat_id = ?
        ORDER BY 
          p.payment_date DESC
      `;
      
      db.query(query, [flatId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getPaymentsByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*, 
          f.flat_number, 
          f.floor_number,
          u.name AS created_by_name
        FROM 
          payments p
        JOIN 
          flats f ON p.flat_id = f.id
        JOIN 
          users u ON p.created_by = u.id
        WHERE 
          p.property_id = ?
        ORDER BY 
          p.payment_date DESC
      `;
      
      db.query(query, [propertyId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getPaymentById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*, 
          f.flat_number, 
          f.floor_number,
          pr.name AS property_name,
          u.name AS created_by_name
        FROM 
          payments p
        JOIN 
          flats f ON p.flat_id = f.id
        JOIN 
          properties pr ON p.property_id = pr.id
        JOIN 
          users u ON p.created_by = u.id
        WHERE 
          p.id = ?
      `;
      
      db.query(query, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (results.length === 0) {
          return resolve(null);
        }
        
        resolve(results[0]);
      });
    });
  }

  static async createPayment(paymentData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO payments 
        (flat_id, property_id, payment_date, payment_type, payment_amount, 
         payment_category, reference_number, receipt_image_path, comments, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        paymentData.flat_id,
        paymentData.property_id,
        paymentData.payment_date,
        paymentData.payment_type,
        paymentData.payment_amount,
        paymentData.payment_category,
        paymentData.reference_number || null,
        paymentData.receipt_image_path || null,
        paymentData.comments || null,
        paymentData.created_by
      ];
      
      db.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({ id: result.insertId, ...paymentData });
      });
    });
  }

  static async updatePayment(id, paymentData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE payments 
        SET 
          payment_date = ?,
          payment_type = ?,
          payment_amount = ?,
          payment_category = ?,
          reference_number = ?,
          receipt_image_path = ?,
          comments = ?
        WHERE id = ?
      `;
      
      const values = [
        paymentData.payment_date,
        paymentData.payment_type,
        paymentData.payment_amount,
        paymentData.payment_category,
        paymentData.reference_number || null,
        paymentData.receipt_image_path || null,
        paymentData.comments || null,
        id
      ];
      
      db.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        
        if (result.affectedRows === 0) {
          return reject(new Error('Payment not found'));
        }
        
        resolve({ id, ...paymentData });
      });
    });
  }

  static async deletePayment(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM payments WHERE id = ?';
      
      db.query(query, [id], (err, result) => {
        if (err) {
          return reject(err);
        }
        
        if (result.affectedRows === 0) {
          return reject(new Error('Payment not found'));
        }
        
        resolve({ id });
      });
    });
  }

  static async getPaymentSummary() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM payment_summary_view`;
      
      db.query(query, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getPaymentSummaryByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM payment_summary_view WHERE property_id = ?`;
      
      db.query(query, [propertyId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getPaymentSummaryByFlatId(flatId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM payment_summary_view WHERE flat_id = ?`;
      
      db.query(query, [flatId], (err, results) => {
        if (err) {
          return reject(err);
        }
        
        if (results.length === 0) {
          return resolve(null);
        }
        
        resolve(results[0]);
      });
    });
  }
}

module.exports = Payment;