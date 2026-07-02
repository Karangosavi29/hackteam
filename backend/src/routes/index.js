const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'HackTeam API is live' }));

module.exports = router;