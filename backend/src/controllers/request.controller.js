const asyncHandler = require('../middlewares/asyncHandler');
const requestService = require('../services/request.service');

const sendRequest = asyncHandler(async (req, res) => {
  const { type, teamId, toUserId, message } = req.body;
  if (!type || !teamId) {
    return res.status(400).json({ success: false, message: 'type and teamId are required' });
  }
  const request = await requestService.send(req.user._id, { type, teamId, toUserId, message });
  res.status(201).json({ success: true, request });
});

const getIncoming = asyncHandler(async (req, res) => {
  const requests = await requestService.getIncoming(req.user._id);
  res.status(200).json({ success: true, count: requests.length, requests });
});

const getOutgoing = asyncHandler(async (req, res) => {
  const requests = await requestService.getOutgoing(req.user._id);
  res.status(200).json({ success: true, count: requests.length, requests });
});

const acceptRequest = asyncHandler(async (req, res) => {
  const request = await requestService.accept(req.params.id, req.user._id);
  res.status(200).json({ success: true, request });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const request = await requestService.reject(req.params.id, req.user._id);
  res.status(200).json({ success: true, request });
});

const withdrawRequest = asyncHandler(async (req, res) => {
  await requestService.withdraw(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Request withdrawn successfully' });
});

module.exports = { sendRequest, getIncoming, getOutgoing, acceptRequest, rejectRequest, withdrawRequest };