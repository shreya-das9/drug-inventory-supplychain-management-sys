import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get('/secret', requireAuth, requireRole('ADMIN'), (req, res) => {
  res.json({ msg: `Hello Admin ${req.user.email}` });
});

export default router;
