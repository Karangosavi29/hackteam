const User = require('../models/user.model');
const Team = require('../models/team.model');
const Hackathon = require('../models/hackathon.model');

// ────────────────────────────────────────────────────────────────
// CONFIG — tune the algorithm here, not scattered across the app.
// Weights must sum to 1. This is a transparent, deterministic
// algorithm — NOT an AI/ML model.
// ────────────────────────────────────────────────────────────────

const WEIGHTS = {
  skills: 0.4,
  interests: 0.2,
  experience: 0.15,
  availability: 0.1,
  role: 0.1,
  other: 0.05,
};

// How close two experience levels are (0-1). Missing/unknown pairs default to 0.5 (neutral).
const EXPERIENCE_ORDER = ['beginner', 'intermediate', 'advanced'];
const EXPERIENCE_PROXIMITY = { 0: 1, 1: 0.5, 2: 0.1 }; // keyed by |difference|

// Reward complementary (different) disciplines over duplicate ones, but don't zero out duplicates.
const ROLE_SCORE = { complementary: 1, same: 0.4 };

const MIN_CANDIDATE_POOL = 100;

// ────────────────────────────────────────────────────────────────
// SCORING PRIMITIVES
// ────────────────────────────────────────────────────────────────

/** Jaccard overlap of two string arrays, 0-1. Empty-vs-empty is neutral (0.5), not 0. */
const jaccard = (a = [], b = []) => {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 0.5;
  const intersection = [...setA].filter((x) => setB.has(x));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0.5 : intersection.length / union.size;
};

const sharedItems = (a = [], b = []) => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

const experienceScore = (levelA, levelB) => {
  const idxA = EXPERIENCE_ORDER.indexOf(levelA);
  const idxB = EXPERIENCE_ORDER.indexOf(levelB);
  if (idxA === -1 || idxB === -1) return 0.5;
  const diff = Math.abs(idxA - idxB);
  return EXPERIENCE_PROXIMITY[diff] ?? 0.1;
};

const roleScore = (roleA, roleB) => {
  if (!roleA || !roleB) return 0.5;
  return roleA === roleB ? ROLE_SCORE.same : ROLE_SCORE.complementary;
};

const collegeScore = (collegeA, collegeB) => {
  if (!collegeA || !collegeB) return 0.5;
  return collegeA.toLowerCase() === collegeB.toLowerCase() ? 1 : 0;
};

// ────────────────────────────────────────────────────────────────
// COMPATIBILITY: USER <-> USER
// ────────────────────────────────────────────────────────────────

/**
 * Computes a 0-100 compatibility score between two users plus a
 * breakdown and human-readable reasons explaining the score.
 */
const computeUserCompatibility = (userA, userB) => {
  const skillOverlap = jaccard(userA.skills, userB.skills);
  const interestOverlap = jaccard(userA.interests, userB.interests);
  const experienceCompat = experienceScore(userA.experienceLevel, userB.experienceLevel);
  const availabilityOverlap = jaccard(userA.availability, userB.availability);
  const roleCompat = roleScore(userA.role, userB.role);
  const otherCompat = collegeScore(userA.college, userB.college);

  const breakdown = {
    skills: Math.round(skillOverlap * 100),
    interests: Math.round(interestOverlap * 100),
    experience: Math.round(experienceCompat * 100),
    availability: Math.round(availabilityOverlap * 100),
    role: Math.round(roleCompat * 100),
    other: Math.round(otherCompat * 100),
  };

  const weightedTotal =
    skillOverlap * WEIGHTS.skills +
    interestOverlap * WEIGHTS.interests +
    experienceCompat * WEIGHTS.experience +
    availabilityOverlap * WEIGHTS.availability +
    roleCompat * WEIGHTS.role +
    otherCompat * WEIGHTS.other;

  const score = Math.round(weightedTotal * 100);

  const sharedSkills = sharedItems(userA.skills, userB.skills);
  const sharedInterests = sharedItems(userA.interests, userB.interests);
  const sharedAvailability = sharedItems(userA.availability, userB.availability);

  const reasons = [];

  if (sharedSkills.length > 0) {
    reasons.push(
      sharedSkills.length === 1
        ? `Shared skill: ${sharedSkills[0]}`
        : `Strong skill overlap: ${sharedSkills.slice(0, 3).join(', ')}${sharedSkills.length > 3 ? '…' : ''}`
    );
  } else if (userA.skills?.length && userB.skills?.length) {
    reasons.push('No overlapping skills — could still be complementary');
  }

  if (userA.role && userB.role && userA.role !== userB.role) {
    reasons.push(`Complementary roles: ${userA.role} + ${userB.role}`);
  } else if (userA.role && userA.role === userB.role) {
    reasons.push(`Both bring ${userA.role} skills`);
  }

  if (sharedInterests.length > 0) {
    reasons.push(
      `Both interested in ${sharedInterests.slice(0, 2).join(' and ')}`
    );
  }

  if (userA.experienceLevel && userA.experienceLevel === userB.experienceLevel) {
    reasons.push(`Similar experience level (${userA.experienceLevel})`);
  }

  if (sharedAvailability.length > 0) {
    reasons.push(`Availability overlaps on ${sharedAvailability.join(', ')}`);
  }

  if (
    userA.college &&
    userB.college &&
    userA.college.toLowerCase() === userB.college.toLowerCase()
  ) {
    reasons.push(`Same college (${userA.college})`);
  }

  return { score, breakdown, reasons, sharedSkills, sharedInterests, sharedAvailability };
};

// ────────────────────────────────────────────────────────────────
// COMPATIBILITY: USER <-> TEAM
// ────────────────────────────────────────────────────────────────

const computeTeamCompatibility = (user, team) => {
  const teamSkills = [...new Set(team.members.flatMap((m) => m.skills || []))];
  const skillOverlap = jaccard(user.skills, teamSkills);
  const roleNeeded = team.requiredRoles?.includes(user.role);
  const hasSpace = team.members.length < team.maxSize;

  // Average this user's pairwise compatibility against each current member —
  // reuses the same user<->user engine so scoring logic isn't duplicated.
  const memberCompatScores = team.members
    .filter((m) => m._id.toString() !== user._id.toString())
    .map((m) => computeUserCompatibility(user, m).score);
  const avgMemberCompat = memberCompatScores.length
    ? memberCompatScores.reduce((sum, s) => sum + s, 0) / memberCompatScores.length
    : 50; // neutral for an empty/solo team

  // Blend: team-need signals (role/space) matter alongside average interpersonal fit
  const needScore = (roleNeeded ? 60 : 0) + (hasSpace ? 40 : 0);
  const score = Math.round(avgMemberCompat * 0.6 + needScore * 0.4);

  const sharedSkills = sharedItems(user.skills, teamSkills);
  const reasons = [];
  if (roleNeeded) reasons.push(`This team is looking for a ${user.role}`);
  if (hasSpace) reasons.push(`${team.maxSize - team.members.length} spot(s) left`);
  if (sharedSkills.length > 0) {
    reasons.push(`You share ${sharedSkills.length} skill(s) with the team: ${sharedSkills.slice(0, 3).join(', ')}`);
  }
  if (avgMemberCompat >= 70) reasons.push('High average compatibility with current members');

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
    matchDetails: { roleNeeded, spotsLeft: team.maxSize - team.members.length, sharedSkills },
  };
};

// ────────────────────────────────────────────────────────────────
// TEAM SKILL COVERAGE
// ────────────────────────────────────────────────────────────────

/**
 * Compares a hackathon's requiredSkills against the union of a team's
 * member skills. Returns per-skill coverage plus an overall percentage.
 */
const computeSkillCoverage = (requiredSkills = [], team) => {
  const teamSkills = new Set(team.members.flatMap((m) => m.skills || []));

  const coverage = requiredSkills.map((skill) => ({
    skill,
    covered: teamSkills.has(skill),
  }));

  const missingSkills = coverage.filter((c) => !c.covered).map((c) => c.skill);
  const coveredCount = coverage.length - missingSkills.length;
  const percentage = requiredSkills.length === 0
    ? 100
    : Math.round((coveredCount / requiredSkills.length) * 100);

  return { coverage, missingSkills, percentage };
};

// ────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS (used by match.controller.js)
// ────────────────────────────────────────────────────────────────

const suggestTeammates = async (userId, { hackathonId, limit = 10 }) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const query = { _id: { $ne: userId } };
  // Pre-filter on skill overlap when the user has skills, to keep the candidate
  // pool relevant without scanning the whole collection.
  if (currentUser.skills?.length > 0) {
    query.skills = { $in: currentUser.skills };
  }

  const candidates = await User.find(query)
    .select('-refreshToken -passwordHash')
    .limit(MIN_CANDIDATE_POOL);

  let hackathon = null;
  if (hackathonId) {
    hackathon = await Hackathon.findById(hackathonId).select('requiredSkills title');
  }

  const scored = candidates
    .map((candidate) => {
      const { score, breakdown, reasons, sharedSkills } = computeUserCompatibility(currentUser, candidate);

      // If a hackathon context was given, add a bonus reason for candidates
      // whose skills help cover skills the hackathon requires.
      const finalReasons = [...reasons];
      if (hackathon?.requiredSkills?.length) {
        const helpsWith = sharedItems(hackathon.requiredSkills, candidate.skills);
        if (helpsWith.length > 0) {
          finalReasons.push(`Covers hackathon-required skills: ${helpsWith.join(', ')}`);
        }
      }

      return {
        user: candidate,
        score,
        breakdown,
        reasons: finalReasons,
        matchDetails: {
          sharedSkills,
          complementaryRole: currentUser.role !== candidate.role,
          sameCollege:
            !!currentUser.college &&
            !!candidate.college &&
            currentUser.college.toLowerCase() === candidate.college.toLowerCase(),
        },
      };
    })
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

  const teams = await Team.find({
    hackathon: hackathonId,
    isOpen: true,
    members: { $ne: userId },
  })
    .populate('members', 'name role skills avatar interests experienceLevel availability college')
    .populate('hackathon', 'title startDate mode')
    .limit(50);

  const scored = teams
    .map((team) => {
      const { score, reasons, matchDetails } = computeTeamCompatibility(user, team);
      return { team, score, reasons, matchDetails };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  return scored;
};

/** Pairwise compatibility between the current user and a specific other user. */
const getCompatibility = async (userId, otherUserId) => {
  if (userId.toString() === otherUserId.toString()) {
    const err = new Error('Cannot compute compatibility with yourself');
    err.status = 400;
    throw err;
  }

  const [userA, userB] = await Promise.all([
    User.findById(userId).select('-refreshToken -passwordHash'),
    User.findById(otherUserId).select('-refreshToken -passwordHash'),
  ]);

  if (!userA || !userB) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const result = computeUserCompatibility(userA, userB);
  return { userA, userB, ...result };
};

/** Skill coverage + average pairwise compatibility for a team, based on its hackathon's requiredSkills. */
const getTeamSkillCoverage = async (teamId) => {
  const team = await Team.findById(teamId)
    .populate('members', 'name skills interests experienceLevel availability role college')
    .populate('hackathon', 'title requiredSkills');

  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }

  const requiredSkills = team.hackathon?.requiredSkills || [];
  const { coverage, missingSkills, percentage } = computeSkillCoverage(requiredSkills, team);

  // Average pairwise compatibility across all current members — gives a single
  // "team compatibility" number for the dashboard, reusing the same engine.
  const members = team.members;
  const pairScores = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairScores.push(computeUserCompatibility(members[i], members[j]).score);
    }
  }
  const compatibilityScore = pairScores.length
    ? Math.round(pairScores.reduce((sum, s) => sum + s, 0) / pairScores.length)
    : null; // null when there's only one member — nothing to compare yet

  return {
    teamId: team._id,
    hackathonTitle: team.hackathon?.title,
    requiredSkills,
    coverage,
    missingSkills,
    percentage,
    compatibilityScore,
  };
};

module.exports = {
  WEIGHTS,
  suggestTeammates,
  suggestTeams,
  getCompatibility,
  getTeamSkillCoverage,
  // exported for potential reuse/unit testing
  computeUserCompatibility,
  computeTeamCompatibility,
  computeSkillCoverage,
};