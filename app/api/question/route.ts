import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, buildQuestionPrompt } from "@/lib/gameLogic";

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
        max_tokens: 1000,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: buildQuestionPrompt(type, heroes || []),
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Strip any markdown fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    const question = JSON.parse(clean);

    return NextResponse.json({ question });
  } catch (err) {
    console.error("Question generation error:", err);
    // Fallback question if Claude fails
    return NextResponse.json({
      question: {
        question: "Which hero is known as the 'Melee Carry' who uses Battlefury as a core item to farm efficiently?",
        options: ["Juggernaut", "Anti-Mage", "Phantom Assassin", "Lifestealer"],
        correctIndex: 1,
        explanation: "Anti-Mage is the classic Battlefury carrier, using it to farm and split push efficiently while building his mana burn synergy.",
        difficulty: "easy",
        hero1: "antimage",
        hero2: null,
      },
    });
  }
}
