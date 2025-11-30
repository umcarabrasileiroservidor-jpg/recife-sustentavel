export const TIME_LIMIT_HOURS = 24;

export function checkTimeLimit(lastDisposalTimestamp: number | null) {
  if (!lastDisposalTimestamp) return { allowed: true, timeLeft: '' };

  const now = Date.now();
  const diffMs = now - lastDisposalTimestamp;
  const hoursPassed = diffMs / (1000 * 60 * 60);

  if (hoursPassed >= TIME_LIMIT_HOURS) {
    return { allowed: true, timeLeft: '' };
  }

  const hoursLeft = Math.floor(TIME_LIMIT_HOURS - hoursPassed);
  const minutesLeft = Math.floor(((TIME_LIMIT_HOURS - hoursPassed) - hoursLeft) * 60);

  return {
    allowed: false,
    timeLeft: `${hoursLeft}h ${minutesLeft}min`
  };
}