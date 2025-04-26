const db = require('../db/connection');
const { authenticateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// GET all users
exports.getAllUsers = [
  authenticateToken,
  async (req, res) => {
    const [users] = await db.query('SELECT name, email, password FROM users');
    res.json(users);
  }
];

// Get user by ID
exports.getUserById = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [userResult] = await db.query('SELECT name, email FROM users WHERE id = ?', [id]);

      if (userResult.length === 0) {
        return res.status(404).json({ message: `User dengan id ${id} tidak ditemukan.` });
      }

      const user = userResult[0];

      res.status(200).json({
        message: `Data user ditemukan.`,
        user: {
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Create new user or Register
exports.createUser = [
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      res.status(201).json({ 
        message: `Selamat, user ${name} berhasil ditambahkan.`,
        name,
        email
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Update user
exports.updateUser = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
      let query = 'UPDATE users SET name = ?, email = ?';
      const values = [name, email];

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += ', password = ?';
        values.push(hashedPassword);
      }

      query += ' WHERE id = ?';
      values.push(id);

      await db.query(query, values);

      res.status(200).json({
        message: `Selamat, user ${name} berhasil diubah.`,
        name,
        email
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

// Delete user
exports.deleteUser = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [userResult] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

      if (userResult.length === 0) {
        return res.status(404).json({ message: `User dengan id ${id} tidak ditemukan.` });
      }

      const deletedUser = userResult[0];

      await db.query('DELETE FROM users WHERE id = ?', [id]);

      res.status(200).json({
        message: `User ${deletedUser.name} berhasil dihapus.`,
        deletedUser: {
          name: deletedUser.name,
          email: deletedUser.email
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];