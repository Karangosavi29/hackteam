const asyncHandler = require('../middlewares/asyncHandler');
const messageService = require('../services/message.service');

const getTeamMessages = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await messageService.getForTeam(req.params.teamId, req.user._id, { page, limit });
  res.status(200).json({ success: true, ...result });
});

// REST fallback for sending a message — the primary path is the `send_message`
// socket event (see sockets/chat.socket.js), which also broadcasts it live.
// This exists for clients that aren't connected over a socket.
const sendTeamMessage = asyncHandler(async (req, res) => {
  const message = await messageService.create(req.params.teamId, req.user._id, req.body.message);
  res.status(201).json({ success: true, message });
});

module.exports = { getTeamMessages, sendTeamMessage };