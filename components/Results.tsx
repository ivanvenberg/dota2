"use client";
import { useStorage } from "@/lib/liveblocks.config";
import { getHeroImageUrl, getHeroById } from "@/lib/heroes";

export default function Results({ playerId }: { playerId: string }) {
  const players = useStorage((root) => {
    const arr: any[] = [];
    root.players.forEach((v) => arr.push(v));
    return arr.sort((a, b) => b.score - a.score);
  });

  const winnerIds = useStorage((root) => root.game.get("winnerIds"));

  const MEDALS = ["🥇", "🥈", "🥉"];

  function getRecommendation(player: any): string {
    const hero = getHeroById(player.heroId);
    const total = player.answeredCorrectly + player.answeredWrong;
    const accuracy = total > 0 ? Math.round((player.answeredCorrectly / total) * 100) : 0;

    if (accuracy >= 80) return `Absolutely cracked player. ${hero?.name || "Hero"} would be proud. Play ranked more.`;
    if (accuracy >= 60) return `Solid performance! Maybe re-watch some replays on counterpicking ${hero?.counters?.[0] || "tough heroes"}.`;
    if (accuracy >= 40) return `Room for improvement. Focus on understanding itemization better — start with core items on ${hero?.name || "your hero"}.`;
    if (accuracy >= 20) return `Touch grass. Then read the Dota 2 wiki. Then touch grass again. Then come back.`;
    return `Buddy... ${hero?.name || "Your hero"} is sad. Please watch some pro replays before next game session. 💀`;
  }

  const myPlayer = players.find((p) => p.id === playerId);
  const iWon = winnerIds?.includes(playerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Victory header */}
        <div className="text-center mb-8">
          {iWon ? (
            <>
              <div className="text-6xl mb-3 animate-bounce">🏆</div>
              <h1 className="text-4xl font-black text-yellow-400 mb-2">GG WP!</h1>
              <p className="text-gray-300 text-lg">You're the Dota 2 Knowledge Champion!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-3">⚔️</div>
              <h1 className="text-4xl font-black text-gray-300 mb-2">Game Over!</h1>
              <p className="text-gray-500">Better luck next match, {myPlayer?.funnyName || myPlayer?.name}</p>
            </>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
            📊 Final Standings
          </h2>
          <div className="flex flex-col gap-3">
            {players.map((player, idx) => {
              const isWinner = winnerIds?.includes(player.id);
              const total = player.answeredCorrectly + player.answeredWrong;
              const accuracy = total > 0 ? Math.round((player.answeredCorrectly / total) * 100) : 0;

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border-2 ${
                    isWinner ? "border-yellow-500 bg-yellow-950/30" :
                    player.id === playerId ? "border-gray-500 bg-gray-800" :
                    "border-gray-800 bg-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{MEDALS[idx] || `${idx + 1}.`}</span>
                    <img
                      src={getHeroImageUrl(player.heroId)}
                      alt={player.heroName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-gray-600"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/48x48/1f2937/6b7280?text=${player.name[0]}`; }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-lg">
                          {player.funnyName ? (
                            <><span className="text-orange-400">{player.funnyName}</span><span className="text-gray-500 text-sm ml-1">({player.name})</span></>
                          ) : player.name}
                        </span>
                        {player.isExpert && <span className="text-xs bg-cyan-600 text-black font-bold px-2 py-0.5 rounded-full">🎓 Expert</span>}
                        {player.id === playerId && <span className="text-xs text-yellow-400 font-bold">(you)</span>}
                        {isWinner && <span className="text-xs bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">👑 WINNER</span>}
                      </div>
                      <p className="text-gray-400 text-sm">{player.heroName}</p>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span className="text-green-400">✅ {player.answeredCorrectly} correct</span>
                        <span className="text-red-400">❌ {player.answeredWrong} wrong</span>
                        <span className="text-gray-500">{accuracy}% accuracy</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-black text-2xl">{player.score}</div>
                      <div className="text-gray-500 text-xs">points</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player recommendations */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
            🎯 Post-Game Analysis
          </h2>
          <div className="flex flex-col gap-4">
            {players.map((player) => {
              const hero = getHeroById(player.heroId);
              const total = player.answeredCorrectly + player.answeredWrong;
              const accuracy = total > 0 ? Math.round((player.answeredCorrectly / total) * 100) : 0;

              return (
                <div key={player.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={getHeroImageUrl(player.heroId)}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x40/1f2937/6b7280?text=${player.name[0]}`; }}
                    />
                    <div>
                      <p className="font-bold text-white">{player.funnyName || player.name}</p>
                      <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${accuracy}%`,
                            backgroundColor: accuracy >= 70 ? "#22c55e" : accuracy >= 40 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                    <span className="ml-auto font-bold" style={{ color: accuracy >= 70 ? "#22c55e" : accuracy >= 40 ? "#f59e0b" : "#ef4444" }}>
                      {accuracy}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm italic">💬 {getRecommendation(player)}</p>

                  {/* Study tips based on wrong answers */}
                  {hero && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <p className="text-xs text-gray-500 w-full">Study these heroes to improve vs {hero.name}:</p>
                      {hero.counters.slice(0, 3).map((counter) => (
                        <span key={counter} className="text-xs bg-red-950 border border-red-900 text-red-400 px-2 py-0.5 rounded-lg">
                          ⚔️ {counter}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Play again */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = "/"}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-4 px-10 rounded-xl text-xl transition-all hover:scale-105 shadow-lg"
          >
            🎮 Play Again
          </button>
          <p className="text-gray-600 text-xs mt-3">GG EZ. See you in the next match.</p>
        </div>
      </div>
    </div>
  );
}
