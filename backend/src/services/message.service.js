const Message = require('../models/message.model');
const Team = require('../models/team.model');

const ensureMember = (team, userId) => {
  const isMember = team.members.some((m) => m.toString() === userId.toString());
  if (!isMember) {
    const err = new Error('You are not a member of this team');
    err.status = 403;
    throw err;
  }
};

/** Shared by the socket `send_message` handler and the POST /messages REST fallback. */
const create = async (teamId, senderId, text) => {
  const team = await Team.findById(teamId).select('members');
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  ensureMember(team, senderId);

  const trimmed = (text || '').trim();
  if (!trimmed) {
    const err = new Error('Message cannot be empty');
    err.status = 400;
    throw err;
  }

  const message = await Message.create({ teamId, senderId, message: trimmed });
  return message.populate('senderId', 'name avatar');
};

/** Paginated history — most recent page by default, returned in chronological order. */
const getForTeam = async (teamId, userId, { page = 1, limit = 30 } = {}) => {
  const team = await Team.findById(teamId).select('members');
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  ensureMember(team, userId);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ teamId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Message.countDocuments({ teamId }),
  ]);

  return {
    messages: messages.reverse(), // oldest-first for rendering
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

/** Used by the socket layer to authorize joining a team's chat room. */
const isTeamMember = async (teamId, userId) => {
  const team = await Team.findById(teamId).select('members');
  if (!team) return false;
  return team.members.some((m) => m.toString() === userId.toString());
};

module.exports = { create, getForTeam, isTeamMember };