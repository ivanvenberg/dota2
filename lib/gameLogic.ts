import { Player, GameState, Question } from "./liveblocks.config";
import { SQUARE_TYPES, FUNNY_NICKNAMES } from "./heroes";

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function getNextPosition(current: number, roll: number): number {
  return (current + roll) % 20;
}

export function getSquareType(position: number): string {
  return SQUARE_TYPES[position] || "trivia";
}

export function getRandomFunnyNickname(exclude: string[] = []): string {
  const available = FUNNY_NICKNAMES.filter((n) => !exclude.includes(n));
  if (available.length === 0) return FUNNY_NICKNAMES[Math.floor(Math.random() * FUNNY_NICKNAMES.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function calculateWinner(players: Map<string, Player>): string[] {
  const sorted = Array.from(players.values()).sort((a, b) => b.score - a.score);
  if (sorted.length === 0) return [];
  const topScore = sorted[0].score;
  return sorted.filter((p) => p.score === topScore).map((p) => p.id);
}

export function getScoreForAnswer(correct: boolean, difficulty: string, isExpert: boolean): number {
  if (!correct) return 0;
  const base = difficulty === "hard" ? 300 : difficulty === "medium" ? 200 : 100;
  return isExpert ? Math.floor(base * 1.5) : base;
}

export function buildSystemPrompt(): string {
  return `You are a Dota 2 expert question master for a party knowledge game. 
Generate Dota 2 trivia questions in valid JSON only. No markdown, no explanation.
Always return exactly this structure:
{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "string explaining why",
  "difficulty": "easy"|"medium"|"hard",
  "hero1": "hero_id or null",
  "hero2": "hero_id or null"
}
Keep questions fun, competitive and accurate. Difficulty should vary.`;
}

export function buildQuestionPrompt(type: string, heroes: string[]): string {
  const heroList = heroes.length > 0 ? `Relevant heroes in this game: ${heroes.join(", ")}.` : "";
  
  switch (type) {
    case "counterpick":
      return `${heroList} Generate a counterpick question. Example: "Hero A vs Hero B in lane - who counters who and why?" or "Which item counters lifesteal?" Give 4 options.`;
    case "combat":
      return `${heroList} Generate a combat scenario question. Example: "Juggernaut with Battlefury, BKB and Butterfly vs Crystal Maiden with Eul's and Aghs - who wins a 1v1 at 30 min?" Give 4 options including explanation of why.`;
    case "ability":
      return `Generate a Dota 2 ability question. Example: "Which hero's ultimate can be stolen by Rubick the easiest?" or "What is the max range of Pudge's hook?" Give 4 multiple choice options.`;
    case "trivia":
      return `Generate a fun Dota 2 trivia question. Can be about lore, history, mechanics, or funny facts. Give 4 options.`;
    case "duel":
      return `Generate a head-to-head Dota 2 question perfect for a duel between two players. Should be something both can answer quickly. Give 4 options.`;
    default:
      return `Generate a medium-difficulty Dota 2 knowledge question with 4 multiple choice options.`;
  }
}

export const PRIZE_REWARDS = [
  { name: "Double Points", description: "Your next correct answer is worth 2x points!", emoji: "✨" },
  { name: "Immunity Ward", description: "Skip your next wrong-answer penalty!", emoji: "🛡️" },
  { name: "Hero Swap", description: "You can swap your hero for a new one!", emoji: "🔄" },
  { name: "Expert Block", description: "Expert cannot challenge your next answer!", emoji: "🚫" },
  { name: "Free Roll", description: "Roll again on your next turn!", emoji: "🎲" },
];

export function getRandomPrize() {
  return PRIZE_REWARDS[Math.floor(Math.random() * PRIZE_REWARDS.length)];
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export function getPlayerDisplayName(player: Player): string {
  return player.funnyName ? `${player.funnyName} (${player.name})` : player.name;
}

export function shouldChangeNickname(player: Player): boolean {
  return player.answeredWrong >= 2 && !player.funnyName;
}
