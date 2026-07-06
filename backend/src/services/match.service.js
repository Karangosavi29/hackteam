const User = require('../models/user.model');
const Team = require('../models/team.model');

//  Core scoring algorithm 

const scoreTeammateMatch = (currentUser, candidate) => {
  const userSkills = new Set(currentUser.skills);
  const candidateSkills = new Set(candidate.skills);

  // 1. Jaccard similarity — skill overlap
  const intersection = [...userSkills].filter((s) => candidateSkills.has(s)).length;
  const union = new Set([...userSkills, ...candidateSkills]).size;
  const overlapScore = union === 0 ? 0 : intersection / union;

  // 2. Complementary role bonus — different roles = better team balance
  const roleBonus = currentUser.role !== candidate.role ? 0.2 : 0;

  // 3. Same college bonus — easier to collaborate offline
  const collegeBonus =
    currentUser.college &&
    candidate.college &&
    currentUser.college.toLowerCase() === candidate.college.toLowerCase()
      ? 0.1
      : 0;

  const total = overlapScore + roleBonus + collegeBonus;

  // Normalize to max 1.0
  return Math.min(1, total);
};

const scoreTeamMatch = (user, team) => {
  // 1. Does the team need the user's role?
  const roleNeeded = team.requiredRoles.includes(user.role) ? 0.4 : 0;

  // 2. Skill overlap with existing team members
  const teamSkills = new Set(team.members.flatMap((m) => m.skills || []));
  const userSkills = new Set(user.skills);
  const intersection = [...userSkills].filter((s) => teamSkills.has(s)).length;
  const union = new Set([...userSkills, ...teamSkills]).size;
  const skillOverlap = union === 0 ? 0 : intersection / union;

  // 3. Team has space bonus
  const hasSpace = team.members.length < team.maxSize ? 0.2 : 0;

  const total = roleNeeded + skillOverlap * 0.4 + hasSpace;
  return Math.min(1, total);
};

//  Service functions 

const suggestTeammates = async (userId, { hackathonId, limit = 10 }) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Pre-filter: only users who share at least one skill
  // If user has no skills yet, return users with any skills
  const query = {
    _id: { $ne: userId },
  };

  if (currentUser.skills.length > 0) {
    query.skills = { $in: currentUser.skills };
  }

  const candidates = await User.find(query)
    .select('-refreshToken -passwordHash')
    .limit(100); // pre-filter pool

  // Score and sort
  const scored = candidates
    .map((candidate) => ({
      user: candidate,
      score: scoreTeammateMatch(currentUser, candidate),
      matchDetails: {
        sharedSkills: currentUser.skills.filter((s) => candidate.skills.includes(s)),
        complementaryRole: currentUser.role !== candidate.role,
        sameCollege:
          currentUser.college &&
          candidate.college &&
          currentUser.college.toLowerCase() === candidate.college.toLowerCase(),
      },
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  return scored;
};

const suggestTeams = async (userId, { hackathonId, limit = 10 }) => {
  if (!hackathonId) {
    const err = new Error('hackathonId query param is required');
    err.status = 400;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Get open teams for this hackathon that user is NOT already in
  const teams = await Team.find({
    hackathon: hackathonId,
    isOpen: true,
    members: { $ne: userId },
  })
    .populate('members', 'name role skills avatar')
    .populate('hackathon', 'title startDate mode')
    .limit(50);

  // Score and sort
  const scored = teams
    .map((team) => ({
      team,
      score: scoreTeamMatch(user, team),
      matchDetails: {
        roleNeeded: team.requiredRoles.includes(user.role),
        spotsLeft: team.maxSize - team.members.length,
        sharedSkills: user.skills.filter((s) =>
          team.members.flatMap((m) => m.skills).includes(s)
        ),
      },
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  return scored;
};

module.exports = { suggestTeammates, suggestTeams };