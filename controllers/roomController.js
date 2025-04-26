const db = require('../db/connection');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET all rooms by date and slot
exports.getAvailableRooms = [
  async (req, res) => {
    const { date, slot } = req.query;

    if (!date || !slot) {
      return res.status(400).json({ error: 'Harap isi query ?date=YYYY-MM-DD&slot=HH:MM' });
    }

    try {
      // Cek apakah slot ada di tabel schedules
      const [slotCheck] = await db.query('SELECT * FROM schedules WHERE slot_time = ?', [slot]);

      if (slotCheck.length === 0) {
        return res.status(404).json({ message: `Slot pada jam ${slot} tidak tersedia.` });
      }

      // Ambil available rooms
      const [rooms] = await db.query(`
        SELECT r.name, r.capacity, rt.name AS type 
        FROM rooms r
        JOIN room_types rt ON r.type_id = rt.id
        WHERE r.id NOT IN (
          SELECT b.room_id FROM bookings b
          JOIN schedules s ON b.schedule_id = s.id
          WHERE b.booking_date = ? AND s.slot_time = ?
        )
      `, [date, slot]);

      res.status(200).json({
        message: `Available rooms pada tanggal ${date} dan slot ${slot}.`,
        rooms: rooms
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// GET all rooms
exports.getAllRooms = [
  authenticateToken,
  async (req, res) => {
    try {
      const [rooms] = await db.query(`
        SELECT r.name, r.capacity, rt.name AS type
        FROM rooms r
        JOIN room_types rt ON r.type_id = rt.id
      `);

      res.status(200).json({
        message: 'Data semua rooms berhasil diambil.',
        rooms: rooms
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Create new room
exports.createRoom = [
  authenticateToken,
  async (req, res) => {
    const { name, capacity, type_id } = req.body;
    try {
      const [result] = await db.query('INSERT INTO rooms (name, capacity, type_id) VALUES (?, ?, ?)', [name, capacity, type_id]);
      const [typeResult] = await db.query('SELECT name FROM room_types WHERE id = ?', [type_id]);
      const typeName = typeResult.length > 0 ? typeResult[0].name : null;

      res.status(201).json({ 
        message: `Selamat, Room '${name}' berhasil ditambahkan.`,
        room: {
          name,
          capacity,
          type: typeName
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Update room
exports.updateRoom = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { name, capacity, type_id } = req.body;

    try {
      const [result] = await db.query('UPDATE rooms SET name = ?, capacity = ?, type_id = ? WHERE id = ?', [name, capacity, type_id, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `Room dengan id ${id} tidak ditemukan.` });
      }
      const [typeResult] = await db.query('SELECT name FROM room_types WHERE id = ?', [type_id]);
      const typeName = typeResult.length > 0 ? typeResult[0].name : null;

      res.status(200).json({ 
        message: `Room '${name}' berhasil diubah.`,
        room: {
          name,
          capacity,
          type: typeName
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Delete room
exports.deleteRoom = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [roomResult] = await db.query('SELECT name FROM rooms WHERE id = ?', [id]);

      if (roomResult.length === 0) {
        return res.status(404).json({ message: `Room dengan id ${id} tidak ditemukan.` });
      }

      const room = roomResult[0];

      await db.query('DELETE FROM rooms WHERE id = ?', [id]);

      res.status(200).json({ message: `Room '${room.name}' berhasil dihapus.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];