const Hackathon = require('../models/hackathon.model');

const create = async (userId, data) => {
  const hackathon = await Hackathon.create({ ...data, organizer: userId });
  return hackathon;
};

const getAll = async ({ mode, tags, startAfter, startBefore, q, page = 1, limit = 10 }) => {
  const query = {};

  if (mode) query.mode = mode;

  if (tags) {
    const tagArray = tags.split(',').map((t) => t.trim());
    query.tags = { $in: tagArray };
  }

  if (startAfter || startBefore) {
    query.startDate = {};
    if (startAfter) query.startDate.$gte = new Date(startAfter);
    if (startBefore) query.startDate.$lte = new Date(startBefore);
  }

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [hackathons, total] = await Promise.all([
    Hackathon.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Hackathon.countDocuments(query),
  ]);

  return {
    hackathons,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

const getById = async (id) => {
  const hackathon = await Hackathon.findById(id).populate('organizer', 'name email avatar');
  if (!hackathon) {
    const err = new Error('Hackathon not found');
    err.status = 404;
    throw err;
  }
  return hackathon;
};

const update = async (id, userId, data) => {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) {
    const err = new Error('Hackathon not found');
    err.status = 404;
    throw err;
  }

  if (hackathon.organizer.toString() !== userId.toString()) {
    const err = new Error('Not authorized — only the organizer can update this hackathon');
    err.status = 403;
    throw err;
  }

  const updated = await Hackathon.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).populate('organizer', 'name email avatar');

  return updated;
};

const remove = async (id, userId) => {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) {
    const err = new Error('Hackathon not found');
    err.status = 404;
    throw err;
  }

  if (hackathon.organizer.toString() !== userId.toString()) {
    const err = new Error('Not authorized — only the organizer can delete this hackathon');
    err.status = 403;
    throw err;
  }

  await hackathon.deleteOne();
};

module.exports = { create, getAll, getById, update, remove };