const Team = require('../models/team.model');
const User = require('../models/user.model');
const Task = require('../models/task.model');
const notificationService = require('./notification.service');
const { computeSkillCoverage } = require('./match.service');

const create = async (userId, data) => {
  const team = await Team.create({
    ...data,
    leader: userId,
    members: [userId],
  });

  await User.findByIdAndUpdate(userId, { $addToSet: { teams: team._id } });

  return team.populate([
    { path: 'leader', select: 'name email avatar role' },
    { path: 'members', select: 'name email avatar role skills' },
    { path: 'hackathon', select: 'title startDate mode location' },
  ]);
};

const getAll = async ({ hackathon, isOpen, page = 1, limit = 10 }) => {
  const query = {};
  if (hackathon) query.hackathon = hackathon;
  if (isOpen !== undefined) query.isOpen = isOpen === 'true';

  const skip = (page - 1) * limit;

  const [teams, total] = await Promise.all([
    Team.find(query)
      .populate('leader', 'name email avatar role')
      .populate('members', 'name email avatar role skills')
      .populate('hackathon', 'title startDate mode location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Team.countDocuments(query),
  ]);

  return { teams, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getById = async (id) => {
  const team = await Team.findById(id)
    .populate('leader', 'name email avatar role skills')
    .populate('members', 'name email avatar role skills')
    .populate('hackathon', 'title startDate endDate mode location maxTeamSize');

  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }
  return team;
};

const update = async (teamId, userId, data) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (team.leader.toString() !== userId.toString()) {
    const err = new Error('Only the team leader can update the team');
    err.status = 403;
    throw err;
  }

  const allowed = ['name', 'description', 'projectIdea', 'requiredRoles', 'isOpen', 'maxSize'];
  const updates = {};
  allowed.forEach((field) => {
    if (data[field] !== undefined) updates[field] = data[field];
  });

  const updated = await Team.findByIdAndUpdate(teamId, { $set: updates }, { new: true, runValidators: true })
    .populate('leader', 'name email avatar role')
    .populate('members', 'name email avatar role skills')
    .populate('hackathon', 'title startDate mode location');

  return updated;
};

const disband = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (team.leader.toString() !== userId.toString()) {
    const err = new Error('Only the team leader can disband the team');
    err.status = 403;
    throw err;
  }

  await User.updateMany(
    { _id: { $in: team.members } },
    { $pull: { teams: team._id } }
  );

  await team.deleteOne();
};

const leaveTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (team.leader.toString() === userId.toString()) {
    const err = new Error('Leader cannot leave — transfer leadership or disband the team');
    err.status = 400;
    throw err;
  }

  const isMember = team.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    const err = new Error('You are not a member of this team');
    err.status = 400;
    throw err;
  }

  await Team.findByIdAndUpdate(teamId, { $pull: { members: userId } });
  await User.findByIdAndUpdate(userId, { $pull: { teams: teamId } });
};

const removeMember = async (teamId, leaderId, memberId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (team.leader.toString() !== leaderId.toString()) {
    const err = new Error('Only the team leader can remove members');
    err.status = 403;
    throw err;
  }

  if (memberId === leaderId.toString()) {
    const err = new Error('Leader cannot remove themselves');
    err.status = 400;
    throw err;
  }

  await Team.findByIdAndUpdate(teamId, { $pull: { members: memberId } });
  await User.findByIdAndUpdate(memberId, { $pull: { teams: teamId } });

  await notificationService.create({
    recipientId: memberId,
    senderId: leaderId,
    type: 'TEAM_MEMBER_REMOVED',
    title: 'Removed from team',
    message: `You were removed from ${team.name}`,
    relatedId: teamId,
    relatedType: 'Team',
  });
};

const transferLeadership = async (teamId, currentLeaderId, newLeaderId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (team.leader.toString() !== currentLeaderId.toString()) {
    const err = new Error('Only the current team leader can transfer leadership');
    err.status = 403;
    throw err;
  }

  const isMember = team.members.some((m) => m.toString() === newLeaderId.toString());
  if (!isMember) {
    const err = new Error('New leader must be an existing team member');
    err.status = 400;
    throw err;
  }

  team.leader = newLeaderId;
  await team.save();

  return team.populate([
    { path: 'leader', select: 'name email avatar role' },
    { path: 'members', select: 'name email avatar role skills' },
    { path: 'hackathon', select: 'title startDate mode location' },
  ]);
};


const getAnalytics = async (teamId, userId) => {
  const team = await Team.findById(teamId)
    .populate('members', 'name avatar skills')
    .populate('hackathon', 'title startDate endDate requiredSkills');

  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  const isMember = team.members.some((m) => m._id.toString() === userId.toString());
  if (!isMember) {
    const err = new Error('You are not a member of this team');
    err.status = 403;
    throw err;
  }

  const tasks = await Task.find({ team: teamId })
    .populate('assignedTo', 'name avatar')
    .sort({ updatedAt: -1 });

  const now = new Date();
  const taskCounts = { todo: 0, inProgress: 0, done: 0, total: tasks.length };
  let overdueCount = 0;

  tasks.forEach((t) => {
    if (t.status === 'TODO') taskCounts.todo += 1;
    else if (t.status === 'IN_PROGRESS') taskCounts.inProgress += 1;
    else if (t.status === 'DONE') taskCounts.done += 1;

    if (t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < now) {
      overdueCount += 1;
    }
  });

  const completionRate = taskCounts.total === 0 ? 0 : Math.round((taskCounts.done / taskCounts.total) * 100);

  // Per-member workload
  const memberWorkload = team.members.map((member) => {
    const memberTasks = tasks.filter((t) => t.assignedTo?._id?.toString() === member._id.toString());
    return {
      userId: member._id,
      name: member.name,
      avatar: member.avatar,
      total: memberTasks.length,
      todo: memberTasks.filter((t) => t.status === 'TODO').length,
      inProgress: memberTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: memberTasks.filter((t) => t.status === 'DONE').length,
    };
  });
  const unassignedCount = tasks.filter((t) => !t.assignedTo).length;

  // Skill coverage (reuses the same engine as the dashboard / match service)
  const requiredSkills = team.hackathon?.requiredSkills || [];
  const skillCoverage = computeSkillCoverage(requiredSkills, team);

  // Deadline countdown — nearer of start/end date
  const startDate = team.hackathon?.startDate ? new Date(team.hackathon.startDate) : null;
  const endDate = team.hackathon?.endDate ? new Date(team.hackathon.endDate) : null;
  const targetDate = startDate && startDate > now ? startDate : endDate;
  const daysLeft = targetDate ? Math.max(0, Math.ceil((targetDate - now) / 86400000)) : null;
  const deadlineLabel = startDate && startDate > now ? 'Until hackathon starts' : 'Until hackathon ends';

  // Recent activity — most recently updated tasks, simplest honest signal
  // available without a dedicated audit-log system.
  const recentActivity = tasks.slice(0, 8).map((t) => ({
    taskId: t._id,
    title: t.title,
    status: t.status,
    assignedToName: t.assignedTo?.name || null,
    updatedAt: t.updatedAt,
  }));

  return {
    teamId: team._id,
    teamName: team.name,
    progressPercent: completionRate,
    completionRate,
    taskCounts,
    overdueCount,
    unassignedCount,
    memberWorkload,
    skillCoverage,
    deadline: { label: deadlineLabel, daysLeft },
    recentActivity,
  };
};

module.exports = {
  create, getAll, getById, update, disband, leaveTeam, removeMember, transferLeadership, getAnalytics,
};