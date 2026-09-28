const messageService = require('../services/message.service');

// In-memory presence tracking, per team room: teamId -> Map<userId, { name, socketCount }>.
// A single process is enough for this project's scale; if this were ever run across
// multiple server instances, this would need to move to a shared store (e.g. Redis) —
// deliberately not doing that here per the "don't overengineer" guidance.
const roomPresence = new Map();

const roomName = (teamId) => `team:${teamId}`;

const getOnlineUsers = (teamId) => {
  const presence = roomPresence.get(teamId);
  if (!presence) return [];
  return [...presence.entries()].map(([userId, { name }]) => ({ userId, name }));
};

const markOnline = (io, teamId, userId, name) => {
  if (!roomPresence.has(teamId)) roomPresence.set(teamId, new Map());
  const presence = roomPresence.get(teamId);

  const existing = presence.get(userId);
  if (existing) {
    existing.socketCount += 1;
    return;
  }

  presence.set(userId, { name, socketCount: 1 });
  io.to(roomName(teamId)).emit('user_online', { userId, name });
};

const markOffline = (io, teamId, userId) => {
  const presence = roomPresence.get(teamId);
  if (!presence || !presence.has(userId)) return;

  const entry = presence.get(userId);
  entry.socketCount -= 1;

  if (entry.socketCount <= 0) {
    presence.delete(userId);
    io.to(roomName(teamId)).emit('user_offline', { userId });
  }
};

const registerChatHandlers = (io, socket) => {
  const userId = socket.user._id.toString();
  const userName = socket.user.name;

  // Teams this socket has joined — used to clean up presence on disconnect
  socket.data.joinedTeams = new Set();

  socket.on('join_team', async (teamId, callback) => {
    try {
      const isMember = await messageService.isTeamMember(teamId, userId);
      if (!isMember) {
        return callback?.({ success: false, message: 'You are not a member of this team' });
      }

      socket.join(roomName(teamId));
      socket.data.joinedTeams.add(teamId);
      markOnline(io, teamId, userId, userName);

      callback?.({ success: true, onlineUsers: getOnlineUsers(teamId) });
    } catch (err) {
      callback?.({ success: false, message: 'Failed to join team room' });
    }
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(roomName(teamId));
    socket.data.joinedTeams.delete(teamId);
    markOffline(io, teamId, userId);
  });

  socket.on('send_message', async ({ teamId, message } = {}, callback) => {
    try {
      if (!socket.data.joinedTeams.has(teamId)) {
        return callback?.({ success: false, message: 'Join the team room before sending messages' });
      }

      const saved = await messageService.create(teamId, userId, message);
      io.to(roomName(teamId)).emit('receive_message', saved);
      callback?.({ success: true, message: saved });
    } catch (err) {
      callback?.({ success: false, message: err.message || 'Failed to send message' });
    }
  });

  socket.on('typing_start', (teamId) => {
    if (!socket.data.joinedTeams.has(teamId)) return;
    socket.to(roomName(teamId)).emit('typing_start', { userId, name: userName });
  });

  socket.on('typing_stop', (teamId) => {
    if (!socket.data.joinedTeams.has(teamId)) return;
    socket.to(roomName(teamId)).emit('typing_stop', { userId });
  });

  socket.on('disconnect', () => {
    socket.data.joinedTeams.forEach((teamId) => markOffline(io, teamId, userId));
  });
};

module.exports = { registerChatHandlers };