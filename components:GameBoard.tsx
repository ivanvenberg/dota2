"use client";
import { useState, useEffect, useCallback } from "react";
import { useStorage, useMutation } from "@/lib/liveblocks.config";
import { SQUARE_TYPES, SQUARE_COLORS, SQUARE_LABELS, getHeroImageUrl } from "@/lib/heroes";
import { rollDice, getNextPosition, getRandomFunnyNickname, getScoreForAnswer, getRandomPrize } from "@/lib/gameLogic";
import QuestionCard from "./QuestionCard";
import DuelModal from "./DuelModal";

export default function GameBoard({ playerId, isHost }: { playerId: string; isHost: boolean }) {
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [diceAnim, setDiceAnim] = useState(false);

  const game = useStorage((root) => {
    const g = root.game;
    return {
      phase: g.get("phase"),
      currentPlayerIndex: g.get("currentPlayerIndex"),
      playerOrder: g.get("playerOrder"),
      round: g.get("round"),
      maxRounds: g.get("maxRounds"),
      diceRoll: g.get("diceRoll"),
      currentQuestion: g.get("currentQuestion"),
      currentDuel: g.get("currentDuel"),
      expertChallenge: g.get("expertChallenge"),
      lastEvent: g.get("lastEvent"),
    };
  });

  const players = useStorage((root) => {
    const arr: any[] = [];
    root.players.forEach((v) => arr.push(v));
    return arr;
  });

  const myPlayer = players.find((p) => p.id === playerId);
  const currentPlayerId = game.playerOrder[game.currentPlayerIndex];
  const isMyTurn = currentPlayerId === playerId;
  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  const addChat = useMutation(({ storage }, msg: string, type = "game-event") => {
    storage.get("chat").push({
      id: Date.now().toString(),
      playerId: "system",
      playerName: "System",
      message: msg,
      type,
      timestamp: Date.now(),
    });
  }, []);

  const handleRoll = useMutation(async ({ storage }) => {
    if (!isMyTurn) return;
    setDiceAnim(true);
    setTimeout(() => setDiceAnim(false), 700);

    const roll = rollDice();
    const me = storage.get("players").get(playerId);
    if (!me) return;

    const newPos = getNextPosition(me.position, roll);
    const squareType = SQUARE_TYPES[newPos];
    storage.get("players").set(playerId, { ...me, position: newPos });

    const game = storage.get("game");
    game.set("diceRoll", roll);

    addChat(`🎲 ${me.name} rolled a ${roll} and landed on ${SQUARE_LABELS[squareType]}!`);

    if (squareType === "prize") {
      const prize = getRandomPrize();
      game.set("lastEvent", `🏆 ${me.name} landed on the Prize Zone! Prize: ${prize.emoji} ${prize.name} — ${prize.description}`);
      addChat(`🏆 ${me.name} got a prize: ${prize.name}!`);
      setTimeout(() => advanceTurn(), 3000);
      return;
    }

    if (squareType === "duel") {
      const others = Array.from(storage.get("players").values()).filter((p: any) => p.id !== playerId && !p.isBanned);
      if (others.length > 0) {
        const target = others[Math.floor(Math.random() * others.length)] as any;
        game.set("phase", "duel");
        setLoadingQuestion(true);
        try {
          const res = await fetch("/api/question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "duel", heroes: [] }),
          });
          const { question } = await res.json();
          game.set("currentDuel", {
            player1Id: playerId,
            player2Id: target.id,
            question: question.question,
            options: question.options,
            correctIndex: question.correctIndex,
            p1Answer: null,
            p2Answer: null,
            winnerId: null,
          });
          game.set("lastEvent", `⚔️ DUEL! ${me.name} challenges ${target.name}!`);
          addChat(`🥊 DUEL TIME! ${me.name} vs ${target.name}!`);
        } finally {
          setLoadingQuestion(false);
        }
        return;
      }
    }

    // Regular question
    game.set("phase", "question");
    setLoadingQuestion(true);
    try {
      const heroIds = Array.from(storage.get("players").values()).map((p: any) => p.heroId);
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: squareType, heroes: heroIds }),
      });
      const { question } = await res.json();
      game.set("currentQuestion", question);
      game.set("lastEvent", `❓ ${SQUARE_LABELS[squareType]} question for ${me.name}!`);
    } finally {
      setLoadingQuestion(false);
    }
  }, [playerId, isMyTurn, addChat]);

  const advanceTurn = useMutation(({ storage }) => {
    const game = storage.get("game");
    const playerOrder = game.get("playerOrder");
    const currentIndex = game.get("currentPlayerIndex");
    const round = game.get("round");
    const maxRounds = game.get("maxRounds");

    const nextIndex = (currentIndex + 1) % playerOrder.length;
    const newRound = nextIndex === 0 ? round + 1 : round;

    if (newRound > maxRounds) {
      // End game
      const players = storage.get("players");
      let topScore = -1;
      let winners: string[] = [];
      players.forEach((p) => {
        if (p.score > topScore) { topScore = p.score; winners = [p.id]; }
        else if (p.score === topScore) winners.push(p.id);
      });
      game.set("winnerIds", winners);
      game.set("phase", "results");
      addChat("🏆 The game is over! Checking results...");
      return;
    }

    // Skip banned players
    let skipIndex = nextIndex;
    const playerMap = storage.get("players");
    let attempts = 0;
    while (attempts < playerOrder.length) {
      const nextPlayer = playerMap.get(playerOrder[skipIndex]);
      if (nextPlayer?.isBanned) {
        playerMap.set(playerOrder[skipIndex], { ...nextPlayer, banRoundsLeft: nextPlayer.banRoundsLeft - 1, isBanned: nextPlayer.banRoundsLeft > 1 });
        skipIndex = (skipIndex + 1) % playerOrder.length;
        attempts++;
      } else break;
    }

    game.set("currentPlayerIndex", skipIndex);
    game.set("round", newRound);
    game.set("phase", "playing");
    game.set("diceRoll", null);
    game.set("currentQuestion", null);
    game.set("currentDuel", null);
    game.set("expertChallenge", null);
    const nextName = playerMap.get(playerOrder[skipIndex])?.name;
    game.set("lastEvent", `🎲 It's ${nextName}'s turn!`);
  }, [addChat]);

  const handleAnswer = useMutation(({ storage }, answerIndex: number, correct: boolean) => {
    const players = storage.get("players");
    const me = players.get(playerId);
    if (!me) return;

    const question = storage.get("game").get("currentQuestion");
    const difficulty = question?.difficulty || "medium";
    const points = getScoreForAnswer(correct, difficulty, false);

    if (correct) {
      players.set(playerId, { ...me, score: me.score + points, answeredCorrectly: me.answeredCorrectly + 1 });
      addChat(`✅ ${me.name} got it right! +${points} points! 🎉`);
      storage.get("game").set("lastEvent", `✅ Correct! ${me.name} earns ${points} points!`);
    } else {
      const newWrong = me.answeredWrong + 1;
      const existingNames = Array.from(players.values()).map((p: any) => p.funnyName).filter(Boolean);
      const funnyName = newWrong >= 2 && !me.funnyName ? getRandomFunnyNickname(existingNames) : me.funnyName;
      players.set(playerId, { ...me, answeredWrong: newWrong, funnyName: funnyName || me.funnyName, mistakes: [...me.mistakes, question?.question || ""] });
      
      if (funnyName && !me.funnyName) {
        addChat(`😂 ${me.name} is now officially known as "${funnyName}" after that blunder!`, "funny");
        storage.get("game").set("lastEvent", `😂 Wrong! ${me.name} has been renamed to "${funnyName}"! LMAO`);
      } else {
        addChat(`❌ ${me.name} got it wrong! The answer was option ${question?.correctIndex !== undefined ? question.correctIndex + 1 : "?"}`);
        storage.get("game").set("lastEvent", `❌ Wrong answer! ${me.name} loses this round.`);
      }
    }

    setTimeout(() => advanceTurn(), 4000);
  }, [playerId, addChat, advanceTurn]);

  const handleExpertChallenge = useMutation(({ storage }, correction: string) => {
    const me = storage.get("players").get(playerId);
    if (!me?.isExpert) return;
    storage.get("game").set("expertChallenge", {
      challengerId: playerId,
      challengerName: me.name,
      correction,
      resolved: false,
      upheld: null,
    });
    storage.get("game").set("lastEvent", `🎓 EXPERT CHALLENGE by ${me.name}!`);
    addChat(`🎓 ${me.name} (Expert) is challenging this question! Listen up...`, "expert");
  }, [playerId, addChat]);

  const resolveExpertChallenge = useMutation(({ storage }, upheld: boolean) => {
    if (!isHost) return;
    const game = storage.get("game");
    const challenge = game.get("expertChallenge");
    if (!challenge) return;

    const expert = storage.get("players").get(challenge.challengerId);
    if (upheld) {
      // Expert was right — award them points
      if (expert) {
        storage.get("players").set(challenge.challengerId, { ...expert, score: expert.score + 200 });
      }
      game.set("lastEvent", `✅ Expert challenge upheld! ${challenge.challengerName} gets 200 bonus points!`);
      addChat(`🎓 The expert was right! ${challenge.challengerName} earns 200 bonus points!`);
    } else {
      // Expert was wrong — ban them 1 round
      if (expert) {
        storage.get("players").set(challenge.challengerId, { ...expert, isBanned: true, banRoundsLeft: 1 });
      }
      game.set("lastEvent", `🚫 Expert challenge REJECTED! ${challenge.challengerName} is banned for 1 round! LOOOOOL`);
      addChat(`🚫 The expert was WRONG! ${challenge.challengerName} is banned for a round lmaooo`, "funny");
    }

    game.set("expertChallenge", { ...challenge, resolved: true, upheld });
    setTimeout(() => advanceTurn(), 3000);
  }, [isHost, addChat, advanceTurn]);

  const chat = useStorage((root) => {
    const msgs: any[] = [];
    root.chat.forEach((m) => msgs.push(m));
    return msgs.slice(-20);
  });

  // Board layout: positions 0-19 around a 5x5 grid perimeter
  const BOARD_POSITIONS = [
    // Bottom row (left to right): 0-4
    { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
    // Right col (bottom to top): 5-8 (skip corner)
    { row: 3, col: 4 }, { row: 2, col: 4 }, { row: 1, col: 4 },
    // Top row (right to left): 9-14
    { row: 0, col: 4 }, { row: 0, col: 3 }, { row: 0, col: 2 }, { row: 0, col: 1 }, { row: 0, col: 0 },
    // Left col (top to bottom): 13-19
    { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 },
    // Extra to fill 20: loop back into bottom
    { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 },
  ];

  const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Status bar */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <span className="text-gray-500 text-sm">Round</span>
            <span className="text-yellow-400 font-black text-2xl ml-2">{game.round}</span>
            <span className="text-gray-600 text-sm">/{game.maxRounds}</span>
          </div>
          <div className="flex-1 text-center">
            <p className="text-white font-semibold text-sm md:text-base">{game.lastEvent}</p>
          </div>
          {game.diceRoll && (
            <div className={`text-4xl ${diceAnim ? "dice-roll" : ""}`}>
              {DICE_FACES[(game.diceRoll || 1) - 1]}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Board */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <div className="grid grid-cols-5 gap-1.5" style={{ aspectRatio: "1" }}>
                {Array.from({ length: 25 }, (_, idx) => {
                  const row = Math.floor(idx / 5);
                  const col = idx % 5;
                  
                  // Find which board position this cell is
                  const boardPos = BOARD_POSITIONS.findIndex((p, i) => p.row === row && p.col === col && i < 20);
                  const isPerimeter = row === 0 || row === 4 || col === 0 || col === 4;
                  const isCenter = !isPerimeter;

                  if (isCenter) {
                    // Center area - show game info
                    if (idx === 12) {
                      return (
                        <div key={idx} className="col-span-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl">⚔️</div>
                          </div>
                        </div>
                      );
                    }
                    return <div key={idx} className="bg-gray-800/30 rounded" />;
                  }

                  const posIdx = BOARD_POSITIONS.findIndex((p) => p.row === row && p.col === col);
                  const sqType = posIdx >= 0 ? SQUARE_TYPES[posIdx] || "trivia" : "trivia";
                  const sqColor = SQUARE_COLORS[sqType];
                  const playersHere = players.filter((p: any) => p.position === posIdx);

                  return (
                    <div
                      key={idx}
                      className="board-square p-1"
                      style={{ backgroundColor: sqColor + "22", borderColor: sqColor + "66" }}
                    >
                      <div className="text-[10px] font-bold leading-tight mb-0.5" style={{ color: sqColor }}>
                        {posIdx === 0 ? "🏁" : posIdx === 5 ? "🥊" : posIdx === 10 ? "🎓" : posIdx === 15 ? "🏆" : SQUARE_LABELS[sqType]?.split(" ")[0]}
                      </div>
                      <div className="text-[9px] text-gray-500 leading-tight hidden sm:block">
                        {posIdx >= 0 ? `#${posIdx}` : ""}
                      </div>
                      {/* Player tokens */}
                      <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                        {playersHere.map((p: any) => (
                          <div
                            key={p.id}
                            className={`w-5 h-5 rounded-full overflow-hidden border ${p.id === playerId ? "border-yellow-400 pulse-token" : "border-gray-500"}`}
                            title={p.funnyName ? `${p.funnyName} (${p.name})` : p.name}
                          >
                            <img
                              src={getHeroImageUrl(p.heroId)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/20x20/1f2937/ffffff?text=${p.name[0]}`; }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Roll button */}
              {isMyTurn && game.phase === "playing" && !loadingQuestion && (
                <button
                  onClick={handleRoll}
                  className="mt-4 w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black py-4 rounded-xl text-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/50"
                >
                  🎲 ROLL THE DICE!
                </button>
              )}
              {!isMyTurn && game.phase === "playing" && (
                <div className="mt-4 text-center text-gray-500 py-2">
                  Waiting for <span className="text-yellow-400 font-bold">{currentPlayer?.funnyName || currentPlayer?.name}</span> to roll...
                </div>
              )}
              {loadingQuestion && (
                <div className="mt-4 text-center text-gray-400 py-2 flex items-center justify-center gap-2">
                  <div className="animate-spin text-xl">⚔️</div>
                  Generating question...
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Scoreboard */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <h3 className="font-bold text-gray-300 mb-3 text-sm uppercase tracking-wider">📊 Scoreboard</h3>
              <div className="flex flex-col gap-2">
                {[...players].sort((a: any, b: any) => b.score - a.score).map((player: any, idx: number) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      player.id === currentPlayerId ? "bg-yellow-950/40 border border-yellow-800" : "bg-gray-800"
                    }`}
                  >
                    <span className="text-gray-500 text-xs w-4">{idx + 1}.</span>
                    <img
                      src={getHeroImageUrl(player.heroId)}
                      className="w-7 h-7 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/28x28/1f2937/6b7280?text=${player.name[0]}`; }}
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {player.funnyName ? (
                          <span className="text-orange-400">{player.funnyName}</span>
                        ) : player.name}
                      </p>
                      {player.isExpert && <span className="text-[10px] text-cyan-400">🎓 Expert</span>}
                      {player.isBanned && <span className="text-[10px] text-red-400">🚫 Banned</span>}
                    </div>
                    <span className="text-yellow-400 font-black text-sm">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat log */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 flex-1">
              <h3 className="font-bold text-gray-300 mb-3 text-sm uppercase tracking-wider">💬 Battle Log</h3>
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-48">
                {chat.map((msg: any) => (
                  <p
                    key={msg.id}
                    className={`text-xs leading-relaxed ${
                      msg.type === "funny" ? "text-orange-400 font-bold" :
                      msg.type === "expert" ? "text-cyan-400" :
                      "text-gray-400"
                    }`}
                  >
                    {msg.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Question overlay */}
        {game.phase === "question" && game.currentQuestion && (
          <QuestionCard
            question={game.currentQuestion}
            playerId={playerId}
            isMyTurn={isMyTurn}
            myPlayer={myPlayer}
            onAnswer={handleAnswer}
            onExpertChallenge={handleExpertChallenge}
            expertChallenge={game.expertChallenge}
            isHost={isHost}
            onResolveChallenge={resolveExpertChallenge}
          />
        )}

        {/* Duel overlay */}
        {game.phase === "duel" && game.currentDuel && (
          <DuelModal
            duel={game.currentDuel}
            playerId={playerId}
            players={players}
            onAnswer={(answerIndex) => {
              // Handle duel answer logic inline
            }}
          />
        )}
      </div>
    </div>
  );
}
