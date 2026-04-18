"use client";
import { useState } from "react";
import { useMutation } from "@/lib/liveblocks.config";
import { getHeroImageUrl } from "@/lib/heroes";

type Props = {
  duel: any;
  playerId: string;
  players: any[];
  onAnswer: (idx: number) => void;
};

export default function DuelModal({ duel, playerId, players, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isInDuel = duel.player1Id === playerId || duel.player2Id === playerId;
  const player1 = players.find((p) => p.id === duel.player1Id);
  const player2 = players.find((p) => p.id === duel.player2Id);

  const submitDuelAnswer = useMutation(({ storage }, answerIndex: number) => {
    const game = storage.get("game");
    const currentDuel = game.get("currentDuel");
    if (!currentDuel) return;

    let updated = { ...currentDuel };
    if (playerId === currentDuel.player1Id) updated.p1Answer = answerIndex;
    else if (playerId === currentDuel.player2Id) updated.p2Answer = answerIndex;

    // Check if both answered
    if (updated.p1Answer !== null && updated.p2Answer !== null) {
      const p1Correct = updated.p1Answer === currentDuel.correctIndex;
      const p2Correct = updated.p2Answer === currentDuel.correctIndex;
      
      let winnerId: string | null = null;
      if (p1Correct && !p2Correct) winnerId = currentDuel.player1Id;
      else if (p2Correct && !p1Correct) winnerId = currentDuel.player2Id;
      else if (p1Correct && p2Correct) winnerId = "tie";
      
      updated.winnerId = winnerId;

      const players = storage.get("players");
      if (winnerId && winnerId !== "tie") {
        const winner = players.get(winnerId);
        if (winner) players.set(winnerId, { ...winner, score: winner.score + 400 });
      }

      const p1 = players.get(currentDuel.player1Id);
      const p2 = players.get(currentDuel.player2Id);

      // Funny name for loser
      if (winnerId === currentDuel.player1Id && p2 && !p2.funnyName) {
        const existingNames = Array.from(players.values()).map((p: any) => p.funnyName).filter(Boolean);
        const funny = ["Fountain Camper", "Creep Denier", "Divine Blocker"][Math.floor(Math.random() * 3)];
        players.set(currentDuel.player2Id, { ...p2, funnyName: funny });
      } else if (winnerId === currentDuel.player2Id && p1 && !p1.funnyName) {
        const funny = ["Tree Hider", "TP Scroll Seller", "Rosh Feeder"][Math.floor(Math.random() * 3)];
        players.set(currentDuel.player1Id, { ...p1, funnyName: funny });
      }

      const msg = winnerId === "tie"
        ? "🤝 DUEL TIE! Both players knew their stuff!"
        : `🏆 ${players.get(winnerId || "")?.name || "Someone"} WINS THE DUEL! +400 points!`;

      storage.get("chat").push({
        id: Date.now().toString(),
        playerId: "system",
        playerName: "System",
        message: msg,
        type: "game-event",
        timestamp: Date.now(),
      });

      game.set("lastEvent", msg);
      setTimeout(() => {
        game.set("phase", "playing");
        game.set("currentDuel", null);
        game.set("diceRoll", null);
        const playerOrder = game.get("playerOrder");
        const currentIndex = game.get("currentPlayerIndex");
        const nextIndex = (currentIndex + 1) % playerOrder.length;
        game.set("currentPlayerIndex", nextIndex);
      }, 4000);
    }

    game.set("currentDuel", updated);
  }, [playerId]);

  function handleAnswer(idx: number) {
    if (!isInDuel || selected !== null) return;
    setSelected(idx);
    submitDuelAnswer(idx);
    // Reveal after a delay if other player has answered too
    setTimeout(() => setRevealed(true), 1000);
  }

  const myAnswer = playerId === duel.player1Id ? duel.p1Answer : duel.p2Answer;
  const bothAnswered = duel.p1Answer !== null && duel.p2Answer !== null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-orange-950 to-gray-950 border-2 border-orange-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        {/* Duel header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-orange-400 mb-1">⚔️ DUEL!</h2>
          <p className="text-gray-400 text-sm">First correct answer wins 400 points!</p>
        </div>

        {/* Players */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {[player1, player2].map((player, i) => (
            <div key={i} className={`flex flex-col items-center ${player?.id === playerId ? "scale-110" : ""}`}>
              <img
                src={getHeroImageUrl(player?.heroId || "")}
                alt={player?.name}
                className={`w-16 h-16 rounded-xl object-cover border-2 ${
                  duel.winnerId === player?.id ? "border-yellow-400 glow-yellow" :
                  player?.id === playerId ? "border-orange-400" : "border-gray-600"
                }`}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/64x64/1f2937/6b7280?text=${player?.name?.[0] || "?"}` }}
              />
              <p className="text-white font-bold text-sm mt-2">{player?.funnyName || player?.name}</p>
              {player?.id === playerId && <span className="text-xs text-orange-400">(you)</span>}
              {i === 0 && (myAnswer !== null || duel.p1Answer !== null) && (
                <span className="text-xs mt-1">{duel.p1Answer !== null ? "✅ Answered" : "⏳ Thinking..."}</span>
              )}
              {i === 1 && (duel.p2Answer !== null) && (
                <span className="text-xs mt-1">{duel.p2Answer !== null ? "✅ Answered" : "⏳ Thinking..."}</span>
              )}
            </div>
          ))}
        </div>

        {/* Result banner */}
        {duel.winnerId && (
          <div className={`text-center py-3 rounded-xl mb-4 font-black text-xl ${
            duel.winnerId === playerId ? "bg-green-900 text-green-300 glow-green" :
            duel.winnerId === "tie" ? "bg-gray-800 text-gray-300" :
            "bg-red-900 text-red-300"
          }`}>
            {duel.winnerId === playerId ? "🏆 YOU WIN! +400 points!" :
             duel.winnerId === "tie" ? "🤝 TIE GAME!" :
             "💀 You lost this one..."}
          </div>
        )}

        {/* Question */}
        <div className="bg-black/40 rounded-xl p-4 mb-4">
          <p className="text-white text-lg font-semibold">{duel.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2">
          {duel.options.map((opt: string, idx: number) => {
            let btnClass = "bg-gray-800 border-gray-700 text-white hover:bg-gray-700";
            if (myAnswer !== null || duel.winnerId) {
              if (idx === duel.correctIndex) btnClass = "bg-green-900 border-green-500 text-green-200";
              else if (idx === myAnswer && idx !== duel.correctIndex) btnClass = "bg-red-900 border-red-500 text-red-200";
              else btnClass = "bg-gray-900 border-gray-800 text-gray-500";
            } else if (idx === selected) {
              btnClass = "bg-orange-900 border-orange-500 text-orange-200";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={!isInDuel || myAnswer !== null || !!duel.winnerId}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all ${btnClass} disabled:cursor-default`}
              >
                <span className="text-gray-500 mr-2">{["A", "B", "C", "D"][idx]}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {!isInDuel && (
          <p className="text-center text-gray-500 text-sm mt-4">You're spectating this duel 👀</p>
        )}
      </div>
    </div>
  );
}
