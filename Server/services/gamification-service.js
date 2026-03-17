const User = require('../modals/user-modals');

const LEVEL_STEP_POINTS = 500;

function calculateLevel(points) {
  const safePoints = Math.max(0, Number(points) || 0);
  return Math.floor(safePoints / LEVEL_STEP_POINTS) + 1;
}

async function awardPoints(userId, delta, reason = 'generic') {
  const pointsToAdd = Number(delta) || 0;
  if (!userId || !Number.isFinite(pointsToAdd) || pointsToAdd === 0) return null;

  const user = await User.findById(userId).select('contribution fullName email');
  if (!user) return null;

  const currentPoints = user.contribution?.points ?? 0;
  const nextPoints = Math.max(0, currentPoints + pointsToAdd);
  const nextLevel = calculateLevel(nextPoints);

  user.contribution = {
    ...(user.contribution?.toObject ? user.contribution.toObject() : user.contribution),
    points: nextPoints,
    level: nextLevel,
    lastAwardedAt: new Date()
  };

  await user.save();

  return {
    userId: user._id,
    points: nextPoints,
    level: nextLevel,
    reason
  };
}

module.exports = {
  awardPoints,
  calculateLevel,
  LEVEL_STEP_POINTS
};

