'use strict';

const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { signToken } = require('../middleware/auth');

async function login(req, res) {
  const { email, phone, password } = req.body;

  try {
    let result;
    if (email) {
      result = await db.query(
        'SELECT id, email, password_hash, name, role, plan, trial_ends_at FROM users WHERE email = $1',
        [email]
      );
    } else {
      result = await db.query(
        'SELECT id, email, password_hash, name, role, plan, trial_ends_at FROM users WHERE phone = $1',
        [phone]
      );
    }

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Nieprawidłowy e-mail/telefon lub hasło' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Nieprawidłowy e-mail/telefon lub hasło' });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        trialEndsAt: user.trial_ends_at,
      },
    });
  } catch (err) {
    console.error('auth login error:', err.message);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}

module.exports = {
  login,
};
