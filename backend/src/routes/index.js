const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

router.get('/', (req, res) => res.json({ message: 'HackTeam API is live' }));
router.use('/auth', authRoutes);

module.exports = router;