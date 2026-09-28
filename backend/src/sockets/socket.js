const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { registerChatHandlers } = require('./chat.socket');

/**
 * Initializes Socket.IO on top of the existing HTTP server.
 * Auth mirrors the REST `protect` middleware, but reads the JWT from the
 * socket handshake (`socket.handshake.auth.token`) instead of a header,
 * since the browser's native WebSocket can't send custom headers on connect.
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar');
      if (!user) return next(new Error('User no longer exists'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });

  return io;
};

module.exports = { initSocket };