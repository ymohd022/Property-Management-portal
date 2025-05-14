const db = require("../config/database");

class PaymentSchedule {
  static async getSchedulesByFlatId(flatId) {
    try {
      const [schedules] = await db.query(
        `
        SELECT * FROM payment_schedules
        WHERE flat_id = ?
        ORDER BY due_date
      `,
        [flatId]
      );
      return schedules;
    } catch (error) {
      console.error(`Error getting payment schedules for flat ${flatId}:`, error);
      throw error;
    }
  }

  static async getScheduleById(id) {
    try {
      const [schedules] = await db.query("SELECT * FROM payment_schedules WHERE id = ?", [id]);
      
      if (schedules.length === 0) {
        return null;
      }
      
      return schedules[0];
    } catch (error) {
      console.error(`Error getting payment schedule with id ${id}:`, error);
      throw error;
    }
  }

  static async createSchedule(scheduleData) {
    try {
      const [result] = await db.query(
        `
        INSERT INTO payment_schedules (
          flat_id, schedule_name, amount, due_date, status
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [
          scheduleData.flatId,
          scheduleData.scheduleName,
          scheduleData.amount,
          scheduleData.dueDate,
          scheduleData.status || 'Pending',
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error("Error creating payment schedule:", error);
      throw error;
    }
  }

  static async updateSchedule(id, scheduleData) {
    try {
      const [result] = await db.query(
        `
        UPDATE payment_schedules SET
          flat_id = ?,
          schedule_name = ?,
          amount = ?,
          due_date = ?,
          status = ?
        WHERE id = ?
      `,
        [
          scheduleData.flatId,
          scheduleData.scheduleName,
          scheduleData.amount,
          scheduleData.dueDate,
          scheduleData.status,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating payment schedule with id ${id}:`, error);
      throw error;
    }
  }

  static async deleteSchedule(id) {
    try {
      const [result] = await db.query("DELETE FROM payment_schedules WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting payment schedule with id ${id}:`, error);
      throw error;
    }
  }
}

module.exports = PaymentSchedule;