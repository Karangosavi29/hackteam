const asyncHandler = require('../middlewares/asyncHandler');
const taskService = require('../services/task.service');

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.create(req.params.teamId, req.user._id, req.body);
  res.status(201).json({ success: true, task });
});

const getTeamTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getForTeam(req.params.teamId, req.user._id);
  res.status(200).json({ success: true, count: tasks.length, tasks });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.update(req.params.taskId, req.user._id, req.body);
  res.status(200).json({ success: true, task });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.remove(req.params.taskId, req.user._id);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

module.exports = { createTask, getTeamTasks, updateTask, deleteTask };