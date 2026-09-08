const Team = require('../models/team.model');
const User = require('../models/user.model');

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
};

module.exports = { create, getAll, getById, update, disband, leaveTeam, removeMember };