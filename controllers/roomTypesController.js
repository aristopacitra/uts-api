const db = require('../db/connection');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET all room types
exports.getAllRoomTypes = [
  authenticateToken,
  async (req, res) => {
    try {
      const [rows] = await db.query('SELECT name FROM room_types');
      res.status(200).json({
        message: 'Data room types berhasil diambil.',
        room_types: rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Get room type by ID
exports.getRoomTypeById = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [rows] = await db.query('SELECT name FROM room_types WHERE id = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: `Room Type dengan id ${id} tidak ditemukan.` });
      }

      res.status(200).json({
        message: `Data Room Type berhasil ditemukan.`,
        room_type: rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Create new room type
exports.createRoomType = [
  authenticateToken,
  async (req, res) => {
    const { name } = req.body;
    try {
      const [result] = await db.query('INSERT INTO room_types (name) VALUES (?)', [name]);
      res.status(201).json({
        message: `Selamat, Room Type '${name}' berhasil ditambahkan.`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Update room type
exports.updateRoomType = [
  authenticateToken,
  async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    try {
      const [result] = await db.query('UPDATE room_types SET name = ? WHERE id = ?', [name, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `Room Type dengan id ${id} tidak ditemukan.` });
      }

      res.status(200).json({
        message: `Selamat, Room Type '${name}' berhasil diubah.`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Delete room type
exports.deleteRoomType = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [roomTypeResult] = await db.query('SELECT name FROM room_types WHERE id = ?', [id]);

      if (roomTypeResult.length === 0) {
        return res.status(404).json({ message: `Room Type dengan id ${id} tidak ditemukan.` });
      }

      const roomType = roomTypeResult[0];

      await db.query('DELETE FROM room_types WHERE id = ?', [id]);

      res.status(200).json({
        message: `Room Type '${roomType.name}' berhasil dihapus.`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];