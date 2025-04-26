const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db/connection');

const SECRET_KEY = 'rahasia_saya';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = result[0];

    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Password salah.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      message: `Login berhasil. Selamat datang, ${user.name}!`,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};