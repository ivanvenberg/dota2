import { FUNNY_NICKNAMES } from "./heroes";

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function getNextPosition(current: number, roll: number): number {
  return (current + roll) % 20;
}

export function getRandomFunnyNickname(exclude: string[] = []): string {
  const available = FUNNY_NICKNAMES.filter((n) => !exclude.includes(n));
  const pool = available.length > 0 ? available : FUNNY_NICKNAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getScoreForAnswer(correct: boolean, difficulty: string, _isExpert: boolean): number {
  if (!correct) return 0;
  return difficulty === "hard" ? 300 : difficulty === "medium" ? 200 : 100;
}

export const PRIZE_REWARDS = [
  { name: "Double Points", description: "Next correct answer is worth 2x!", emoji: "✨" },
  { name: "Immunity Ward", description: "Skip your next wrong-answer penalty!", emoji: "🛡️" },
  { name: "Hero Swap", description: "You can swap your hero!", emoji: "🔄" },
  { name: "Expert Block", description: "Expert can't challenge your next answer!", emoji: "🚫" },
  { name: "Free Roll", description: "Roll again on your next turn!", emoji: "🎲" },
];

export function getRandomPrize() {
  return PRIZE_REWARDS[Math.floor(Math.random() * PRIZE_REWARDS.length)];
}
