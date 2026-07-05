const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const hackathonRoutes = require('./hackathon.routes');

router.get('/', (req, res) => res.json({ message: 'HackTeam API is live' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hackathons', hackathonRoutes);

module.exports = router;