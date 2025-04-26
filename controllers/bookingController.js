const db = require('../db/connection');

// GET all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.name AS user_name, 
        r.name AS room_name, 
        s.slot_time AS schedule_slot, 
        b.booking_date
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN schedules s ON b.schedule_id = s.id
    `);

    res.status(200).json({
      message: 'Data semua bookings berhasil diambil.',
      bookings: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET bookings by user, room, schedule, or booking_date
exports.getBookingByFilter = async (req, res) => {
  const { user_id, room_id, schedule_id, booking_date } = req.query;

  try {
    let whereClause = [];
    let values = [];

    if (user_id) {
      whereClause.push('b.user_id = ?');
      values.push(user_id);
    }
    if (room_id) {
      whereClause.push('b.room_id = ?');
      values.push(room_id);
    }
    if (schedule_id) {
      whereClause.push('b.schedule_id = ?');
      values.push(schedule_id);
    }
    if (booking_date) {
      whereClause.push('b.booking_date = ?');
      values.push(booking_date);
    }

    if (whereClause.length === 0) {
      return res.status(400).json({ message: 'Harap berikan minimal satu filter: user_id, room_id, schedule_id, atau booking_date.' });
    }

    const query = `
      SELECT 
        u.name AS user_name, 
        r.name AS room_name, 
        s.slot_time AS schedule_slot, 
        b.booking_date
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN schedules s ON b.schedule_id = s.id
      WHERE ${whereClause.join(' AND ')}
    `;

    const [results] = await db.query(query, values);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Data booking tidak ditemukan dengan filter yang diberikan.' });
    }

    res.status(200).json({
      message: 'Data booking berhasil ditemukan.',
      bookings: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  const { user_id, room_id, schedule_id, booking_date } = req.body;
  try {
    const [existingBooking] = await db.query(`
      SELECT * FROM bookings 
      WHERE room_id = ? AND schedule_id = ? AND booking_date = ?
    `, [room_id, schedule_id, booking_date]);

    if (existingBooking.length > 0) {
      return res.status(400).json({ message: 'Booking gagal: Jadwal ini sudah di-booking untuk room tersebut.' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, room_id, schedule_id, booking_date) VALUES (?, ?, ?, ?)',
      [user_id, room_id, schedule_id, booking_date]
    );

    const [detail] = await db.query(`
      SELECT 
        u.name AS user_name, 
        r.name AS room_name, 
        s.slot_time AS schedule_slot
      FROM users u
      JOIN rooms r ON r.id = ?
      JOIN schedules s ON s.id = ?
      WHERE u.id = ?
    `, [room_id, schedule_id, user_id]);

    const bookingDetail = detail[0];

    res.status(201).json({
      message: `Booking berhasil dibuat untuk user '${bookingDetail.user_name}', di room '${bookingDetail.room_name}', pada slot '${bookingDetail.schedule_slot}', tanggal '${booking_date}'.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { user_id, room_id, schedule_id, booking_date } = req.body;
  try {
    const [existingBooking] = await db.query(`
      SELECT * FROM bookings 
      WHERE room_id = ? AND schedule_id = ? AND booking_date = ? AND id != ?
    `, [room_id, schedule_id, booking_date, id]);

    if (existingBooking.length > 0) {
      return res.status(400).json({ message: 'Update gagal: Jadwal ini sudah di-booking untuk room tersebut.' });
    }

    const [updateResult] = await db.query(
      'UPDATE bookings SET user_id=?, room_id=?, schedule_id=?, booking_date=? WHERE id=?',
      [user_id, room_id, schedule_id, booking_date, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: `Booking dengan id ${id} tidak ditemukan.` });
    }

    const [detail] = await db.query(`
      SELECT 
        u.name AS user_name, 
        r.name AS room_name, 
        s.slot_time AS schedule_slot
      FROM users u
      JOIN rooms r ON r.id = ?
      JOIN schedules s ON s.id = ?
      WHERE u.id = ?
    `, [room_id, schedule_id, user_id]);

    const bookingDetail = detail[0];

    res.status(200).json({
      message: `Booking berhasil diupdate untuk user '${bookingDetail.user_name}', room '${bookingDetail.room_name}', slot '${bookingDetail.schedule_slot}', tanggal '${booking_date}'.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const [bookingResult] = await db.query(`
      SELECT 
        u.name AS user_name, 
        r.name AS room_name, 
        s.slot_time AS schedule_slot, 
        b.booking_date
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN schedules s ON b.schedule_id = s.id
      WHERE b.id = ?
    `, [id]);

    if (bookingResult.length === 0) {
      return res.status(404).json({ message: `Booking dengan id ${id} tidak ditemukan.` });
    }

    const booking = bookingResult[0];

    await db.query('DELETE FROM bookings WHERE id = ?', [id]);

    res.status(200).json({
      message: `Booking untuk user '${booking.user_name}' di room '${booking.room_name}' pada slot '${booking.schedule_slot}', tanggal '${booking.booking_date}' berhasil dihapus.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};