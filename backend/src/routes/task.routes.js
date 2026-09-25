const express = require('express');
const router = express.Router();
const { updateTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;