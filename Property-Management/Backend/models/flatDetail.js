const db = require("../config/database");

class FlatDetail {
  static async getFlatDetailByFlatId(flatId) {
    try {
      const [details] = await db.query(
        `
        SELECT fd.*, a.name as agent_name
        FROM flat_details fd
        LEFT JOIN agents a ON fd.sold_by = a.id
        WHERE fd.flat_id = ?
      `,
        [flatId]
      );

      if (details.length === 0) {
        return null;
      }

      return details[0];
    } catch (error) {
      console.error(`Error getting flat details for flat ${flatId}:`, error);
      throw error;
    }
  }

  static async createOrUpdateFlatDetail(flatId, detailData) {
    try {
      // Check if details already exist
      const [existing] = await db.query("SELECT id FROM flat_details WHERE flat_id = ?", [flatId]);

      if (existing.length > 0) {
        // Update existing record
        const [result] = await db.query(
          `
          UPDATE flat_details SET
            owner_type = ?,
            owner_name = ?,
            bhk_type = ?,
            uds = ?,
            parking = ?,
            area = ?,
            unit_price = ?,
            semi_finished_price = ?,
            work_order_estimate = ?,
            registration_gst = ?,
            miscellaneous_amount = ?,
            total_flat_amount = ?,
            sold_by = ?
          WHERE flat_id = ?
        `,
          [
            detailData.ownerType,
            detailData.ownerName || null,
            detailData.bhkType || null,
            detailData.uds || null,
            detailData.parking || null,
            detailData.area || null,
            detailData.unitPrice || null,
            detailData.semiFinishedPrice || null,
            detailData.workOrderEstimate || null,
            detailData.registrationGst || null,
            detailData.miscellaneousAmount || null,
            detailData.totalFlatAmount || null,
            detailData.soldBy || null,
            flatId,
          ]
        );

        return existing[0].id;
      } else {
        // Create new record
        const [result] = await db.query(
          `
          INSERT INTO flat_details (
            flat_id, owner_type, owner_name, bhk_type, uds, parking, area,
            unit_price, semi_finished_price, work_order_estimate, registration_gst,
            miscellaneous_amount, total_flat_amount, sold_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            flatId,
            detailData.ownerType,
            detailData.ownerName || null,
            detailData.bhkType || null,
            detailData.uds || null,
            detailData.parking || null,
            detailData.area || null,
            detailData.unitPrice || null,
            detailData.semiFinishedPrice || null,
            detailData.workOrderEstimate || null,
            detailData.registrationGst || null,
            detailData.miscellaneousAmount || null,
            detailData.totalFlatAmount || null,
            detailData.soldBy || null,
          ]
        );

        return result.insertId;
      }
    } catch (error) {
      console.error(`Error creating/updating flat details for flat ${flatId}:`, error);
      throw error;
    }
  }

  static async deleteFlatDetail(flatId) {
    try {
      const [result] = await db.query("DELETE FROM flat_details WHERE flat_id = ?", [flatId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting flat details for flat ${flatId}:`, error);
      throw error;
    }
  }
}

module.exports = FlatDetail;