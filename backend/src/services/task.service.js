const Task = require('../models/task.model');
const Team = require('../models/team.model');
const notificationService = require('./notification.service');

const ensureMember = (team, userId) => {
  const isMember = team.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    const err = new Error('You are not a member of this team');
    err.status = 403;
    throw err;
  }
};

const create = async (teamId, userId, { title, description, assignedTo, priority, dueDate }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  // Any team member can create a task (per spec: members can "create permitted tasks")
  ensureMember(team, userId);

  if (assignedTo && !team.members.some((m) => m.toString() === assignedTo.toString())) {
    const err = new Error('Can only assign tasks to current team members');
    err.status = 400;
    throw err;
  }

  const task = await Task.create({
    team: teamId,
    title,
    description,
    assignedTo: assignedTo || null,
    priority,
    dueDate,
    createdBy: userId,
  });

  if (assignedTo && assignedTo.toString() !== userId.toString()) {
    await notificationService.create({
      recipientId: assignedTo,
      senderId: userId,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: `You were assigned: ${title}`,
      relatedId: task._id,
      relatedType: 'Task',
    });
  }

  return task.populate([
    { path: 'assignedTo', select: 'name avatar role' },
    { path: 'createdBy', select: 'name avatar' },
  ]);
};

const getForTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId).select('members');
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  ensureMember(team, userId);

  return Task.find({ team: teamId })
    .populate('assignedTo', 'name avatar role')
    .populate('createdBy', 'name avatar')
    .sort({ createdAt: -1 });
};

const update = async (taskId, userId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }

  const team = await Team.findById(task.team);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  ensureMember(team, userId);

  const isLeader = team.leader.toString() === userId.toString();
  const isAssignee = task.assignedTo && task.assignedTo.toString() === userId.toString();

  const requestedFields = Object.keys(updates);
  const onlyChangingStatus = requestedFields.every((f) => f === 'status');

  if (!isLeader && !(isAssignee && onlyChangingStatus)) {
    const err = new Error(
      isAssignee
        ? 'You can only update the status of a task assigned to you'
        : 'Only the team leader can update this task'
    );
    err.status = 403;
    throw err;
  }

  // Leader reassigning — validate new assignee is a team member
  if (updates.assignedTo && !team.members.some((m) => m.toString() === updates.assignedTo.toString())) {
    const err = new Error('Can only assign tasks to current team members');
    err.status = 400;
    throw err;
  }

  const allowed = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate'];
  const previousAssignee = task.assignedTo?.toString() || null;
  const previousStatus = task.status;

  allowed.forEach((field) => {
    if (updates[field] !== undefined) task[field] = updates[field];
  });
  await task.save();

  // Notify on (re)assignment
  if (updates.assignedTo && updates.assignedTo.toString() !== previousAssignee && updates.assignedTo.toString() !== userId.toString()) {
    await notificationService.create({
      recipientId: updates.assignedTo,
      senderId: userId,
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: `You were assigned: ${task.title}`,
      relatedId: task._id,
      relatedType: 'Task',
    });
  }

  // Notify the creator when someone else marks the task done
  if (updates.status === 'DONE' && previousStatus !== 'DONE' && task.createdBy.toString() !== userId.toString()) {
    await notificationService.create({
      recipientId: task.createdBy,
      senderId: userId,
      type: 'TASK_COMPLETED',
      title: 'Task completed',
      message: `"${task.title}" was marked done`,
      relatedId: task._id,
      relatedType: 'Task',
    });
  }

  return task.populate([
    { path: 'assignedTo', select: 'name avatar role' },
    { path: 'createdBy', select: 'name avatar' },
  ]);
};

const remove = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }

  const team = await Team.findById(task.team).select('leader');
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (team.leader.toString() !== userId.toString()) {
    const err = new Error('Only the team leader can delete tasks');
    err.status = 403;
    throw err;
  }

  await task.deleteOne();
};

module.exports = { create, getForTeam, update, remove };