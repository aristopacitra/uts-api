const db = require('../db/connection');
const { authenticateToken } = require('../middleware/authMiddleware'); // ✅ Tambahkan ini

// GET all schedules
exports.getAllSchedules = [
  authenticateToken,
  async (req, res) => {
    try {
      const [rows] = await db.query('SELECT slot_time FROM schedules');
      res.status(200).json({
        message: 'Data semua schedules berhasil diambil.',
        schedules: rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Create new schedule
exports.createSchedule = [
  authenticateToken,
  async (req, res) => {
    const { slot_time } = req.body;
    try {
      const [result] = await db.query('INSERT INTO schedules (slot_time) VALUES (?)', [slot_time]);
      res.status(201).json({
        message: `Slot '${slot_time}' berhasil ditambahkan.`,
        slot_time: slot_time
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Update schedule
exports.updateSchedule = [
  authenticateToken,
  async (req, res) => {
    const { slot_time } = req.body;
    const { id } = req.params;

    try {
      const [result] = await db.query('UPDATE schedules SET slot_time = ? WHERE id = ?', [slot_time, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `Schedule dengan id ${id} tidak ditemukan.` });
      }

      res.status(200).json({
        message: `Slot schedule berhasil diubah menjadi '${slot_time}'.`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Delete schedule
exports.deleteSchedule = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [scheduleResult] = await db.query('SELECT slot_time FROM schedules WHERE id = ?', [id]);

      if (scheduleResult.length === 0) {
        return res.status(404).json({ message: `Schedule dengan id ${id} tidak ditemukan.` });
      }

      const schedule = scheduleResult[0];

      await db.query('DELETE FROM schedules WHERE id = ?', [id]);

      res.status(200).json({
        message: `Slot '${schedule.slot_time}' berhasil dihapus.`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];