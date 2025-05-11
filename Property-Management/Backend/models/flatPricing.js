const db = require('../config/database');

class FlatPricing {
  static async getFlatPricingByFlatId(flatId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM flat_pricing WHERE flat_id = ?';
      
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

  static async createFlatPricing(pricingData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO flat_pricing 
        (flat_id, base_price, unit_price, semi_finished_price, work_order_estimate, 
         registration_gst, miscellaneous_amount, total_flat_amount, ownership_type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        pricingData.flat_id,
        pricingData.base_price,
        pricingData.unit_price,
        pricingData.semi_finished_price || null,
        pricingData.work_order_estimate || null,
        pricingData.registration_gst || null,
        pricingData.miscellaneous_amount || null,
        pricingData.total_flat_amount,
        pricingData.ownership_type || 'Builder'
      ];
      
      db.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({ id: result.insertId, ...pricingData });
      });
    });
  }

  static async updateFlatPricing(flatId, pricingData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE flat_pricing 
        SET 
          base_price = ?,
          unit_price = ?,
          semi_finished_price = ?,
          work_order_estimate = ?,
          registration_gst = ?,
          miscellaneous_amount = ?,
          total_flat_amount = ?,
          ownership_type = ?
        WHERE flat_id = ?
      `;
      
      const values = [
        pricingData.base_price,
        pricingData.unit_price,
        pricingData.semi_finished_price || null,
        pricingData.work_order_estimate || null,
        pricingData.registration_gst || null,
        pricingData.miscellaneous_amount || null,
        pricingData.total_flat_amount,
        pricingData.ownership_type || 'Builder',
        flatId
      ];
      
      db.query(query, values, (err, result) => {
        if (err) {
          return reject(err);
        }
        
        if (result.affectedRows === 0) {
          // If no record was updated, create a new one
          return this.createFlatPricing(pricingData)
            .then(resolve)
            .catch(reject);
        }
        
        resolve({ flatId, ...pricingData });
      });
    });
  }
}

module.exports = FlatPricing;