const Request = require('../models/request.model');
const Team = require('../models/team.model');
const User = require('../models/user.model');

const send = async (senderId, { type, teamId, toUserId, message }) => {
  const team = await Team.findById(teamId);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  if (!team.isOpen) {
    const err = new Error('This team is not accepting requests');
    err.status = 400;
    throw err;
  }

  if (team.members.length >= team.maxSize) {
    const err = new Error('Team is already full');
    err.status = 400;
    throw err;
  }

  // For join request — sender is student, receiver is leader
  // For invite request — sender is leader, receiver is student
  let from, to;

  if (type === 'join') {
    // Student sends join request to team leader
    if (team.members.some((m) => m.toString() === senderId.toString())) {
      const err = new Error('You are already a member of this team');
      err.status = 400;
      throw err;
    }
    from = senderId;
    to = team.leader;
  } else if (type === 'invite') {
    // Leader invites a student
    if (team.leader.toString() !== senderId.toString()) {
      const err = new Error('Only the team leader can send invites');
      err.status = 403;
      throw err;
    }
    if (!toUserId) {
      const err = new Error('toUserId is required for invite');
      err.status = 400;
      throw err;
    }
    from = senderId;
    to = toUserId;
  }

  // Check for existing pending request
  const existing = await Request.findOne({ from, team: teamId, status: 'pending' });
  if (existing) {
    const err = new Error('A pending request already exists for this team');
    err.status = 409;
    throw err;
  }

  const request = await Request.create({
    type,
    from,
    to,
    team: teamId,
    hackathon: team.hackathon,
    message,
  });

  return request.populate([
    { path: 'from', select: 'name email avatar role skills' },
    { path: 'to', select: 'name email avatar role' },
    { path: 'team', select: 'name hackathon' },
  ]);
};

const getIncoming = async (userId) => {
  return Request.find({ to: userId })
    .populate('from', 'name email avatar role skills college')
    .populate('team', 'name description requiredRoles')
    .populate('hackathon', 'title startDate mode')
    .sort({ createdAt: -1 });
};

const getOutgoing = async (userId) => {
  return Request.find({ from: userId })
    .populate('to', 'name email avatar role')
    .populate('team', 'name description')
    .populate('hackathon', 'title startDate mode')
    .sort({ createdAt: -1 });
};

const accept = async (requestId, userId) => {
  const request = await Request.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }

  if (request.to.toString() !== userId.toString()) {
    const err = new Error('Not authorized to accept this request');
    err.status = 403;
    throw err;
  }

  if (request.status !== 'pending') {
    const err = new Error(`Request already ${request.status}`);
    err.status = 400;
    throw err;
  }

  const team = await Team.findById(request.team);
  if (!team) {
    const err = new Error('Team no longer exists');
    err.status = 404;
    throw err;
  }

  if (team.members.length >= team.maxSize) {
    const err = new Error('Team is already full');
    err.status = 400;
    throw err;
  }

  // Determine who joins the team
  // join request → sender (from) joins
  // invite request → receiver (to) joins... but here userId IS the receiver
  const newMemberId = request.type === 'join' ? request.from : request.to;

  // Add member to team and team to user
  await Team.findByIdAndUpdate(request.team, {
    $addToSet: { members: newMemberId },
  });
  await User.findByIdAndUpdate(newMemberId, {
    $addToSet: { teams: request.team },
  });

  // Update request status
  request.status = 'accepted';
  await request.save();

  // Reject all other pending requests from same user to same team
  await Request.updateMany(
    {
      from: request.from,
      team: request.team,
      status: 'pending',
      _id: { $ne: requestId },
    },
    { status: 'rejected' }
  );

  return request;
};

const reject = async (requestId, userId) => {
  const request = await Request.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }

  if (request.to.toString() !== userId.toString()) {
    const err = new Error('Not authorized to reject this request');
    err.status = 403;
    throw err;
  }

  if (request.status !== 'pending') {
    const err = new Error(`Request already ${request.status}`);
    err.status = 400;
    throw err;
  }

  request.status = 'rejected';
  await request.save();
  return request;
};

const withdraw = async (requestId, userId) => {
  const request = await Request.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }

  if (request.from.toString() !== userId.toString()) {
    const err = new Error('Not authorized to withdraw this request');
    err.status = 403;
    throw err;
  }

  if (request.status !== 'pending') {
    const err = new Error('Only pending requests can be withdrawn');
    err.status = 400;
    throw err;
  }

  await request.deleteOne();
};

module.exports = { send, getIncoming, getOutgoing, accept, reject, withdraw };