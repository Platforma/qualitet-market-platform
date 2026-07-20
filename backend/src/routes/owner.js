'use strict';

/**
 * Owner-only routes – accessible exclusively to users with role = 'owner'.
 *
 * GET  /api/owner/me        – return the owner's full profile
 * GET  /api/owner/guard     – lightweight endpoint for client-side role verification
 */

const express = require('express');

const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes in this module require a valid JWT **and** owner role.
// Unlike /api/admin routes (which allow both owner and admin),
// these endpoints are restricted to role = 'owner' only.
router.use(authenticate, requireRole('owner'));

// ─── GET /api/owner/me ────────────────────────────────────────────────────────

router.get('/me', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, name, phone, role, plan, trial_ends_at, created_at
         FROM users
        WHERE id = $1 AND role = 'owner'`,
      [req.user.id]
    )
    if (!result.rows[0]) {
      return res.status(403).json({ error: 'Brak uprawnień właściciela platformy' })
    }
    return res.json(result.rows[0])
  } catch (err) {
    console.error('owner me error:', err.message)
    return res.status(500).json({ error: 'Błąd serwera' })
  }
})

// ─── GET /api/owner/guard ─────────────────────────────────────────────────────
// Lightweight endpoint: the frontend calls this to verify that the current JWT
// belongs to an owner.  Returns 200 { ok: true, role: 'owner' } on success or
// 403 via the requireRole middleware if the role is not 'owner'.

router.get('/guard', (_req, res) => {
  return res.json({ ok: true, role: 'owner' })
})

module.exports = router
