import { NextRequest, NextResponse } from "next/server";

function buildPrompt(type: string, heroes: string[]): string {
  const heroList = heroes.length ? `Heroes in this game: ${heroes.join(", ")}.` : "";
  const prompts: Record<string, string> = {
    counterpick: `${heroList} Generate a Dota 2 counterpick question. Example: "Who hard counters Anti-Mage in lane?" Give 4 options.`,
    combat: `${heroList} Generate a Dota 2 combat scenario. Example: "Juggernaut with BKB, Battlefury, Butterfly vs Crystal Maiden with Aghs, Eul's at 30 min — who wins 1v1?" Give 4 options.`,
    ability: `Generate a Dota 2 ability/mechanic question. Example: "Which hero's ult can be stolen by Rubick most easily?" Give 4 options.`,
    trivia: `Generate a fun Dota 2 trivia question — lore, history, mechanics, funny facts. Give 4 options.`,
    duel: `Generate a quick Dota 2 knowledge question perfect for a head-to-head duel. Give 4 options.`,
  };
  return prompts[type] ?? prompts.trivia;
}

export async function POST(request: NextRequest) {
  const { type, heroes } = await request.json();
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: `You are a Dota 2 expert question master. Return ONLY valid JSON, no markdown, no explanation:
{"question":"string","options":["A","B","C","D"],"correctIndex":0,"explanation":"string","difficulty":"easy"|"medium"|"hard","hero1":"hero_id or null","hero2":"hero_id or null"}`,
        messages: [{ role: "user", content: buildPrompt(type, heroes || []) }],
      }),
    });
    const data = await response.json();
    const text = (data.content?.[0]?.text ?? "").replace(/```json|```/g, "").trim();
    const question = JSON.parse(text);
    return NextResponse.json({ question });
  } catch {
    return NextResponse.json({
      question: {
        question: "Which hero uses Mana Break as a core mechanic to counter intelligence heroes?",
        options: ["Silencer", "Anti-Mage", "Outworld Devourer", "Skywrath Mage"],
        correctIndex: 1,
        explanation: "Anti-Mage's passive Mana Break burns mana on each attack, making him deadly against mana-dependent heroes.",
        difficulty: "easy",
        hero1: "antimage",
        hero2: null,
      },
    });
  }
}
