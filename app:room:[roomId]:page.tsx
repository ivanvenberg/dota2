"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { RoomProvider, useStorage, useMutation, useSelf, useOthers } from "@/lib/liveblocks.config";
import { SQUARE_TYPES } from "@/lib/heroes";
import { GameState } from "@/lib/liveblocks.config";
import Lobby from "@/components/Lobby";
import HeroSelect from "@/components/HeroSelect";
import GameBoard from "@/components/GameBoard";
import Results from "@/components/Results";

const INITIAL_GAME_STATE: GameState = {
  phase: "lobby",
  currentPlayerIndex: 0,
  playerOrder: [],
  round: 1,
  maxRounds: 6,
  diceRoll: null,
  currentQuestion: null,
  currentDuel: null,
  expertChallenge: null,
  squareTypes: SQUARE_TYPES,
  lastEvent: "Waiting for host to start the game...",
  winnerIds: [],
};

function GameRoom({ playerId, playerName, isHost }: { playerId: string; playerName: string; isHost: boolean }) {
  const phase = useStorage((root) => root.game.get("phase"));

  const joinGame = useMutation(({ storage }) => {
    const players = storage.get("players");
    if (!players.has(playerId)) {
      players.set(playerId, {
        id: playerId,
        name: playerName,
        funnyName: undefined,
        heroId: "",
        heroName: "",
        position: 0,
        score: 0,
        isBanned: false,
        banRoundsLeft: 0,
        isExpert: false,
        isHost,
        answeredCorrectly: 0,
        answeredWrong: 0,
        mistakes: [],
      });
    }
  }, [playerId, playerName, isHost]);

  useEffect(() => {
    joinGame();
  }, [joinGame]);

  if (phase === "lobby" || phase === "hero-select") {
    return <Lobby playerId={playerId} isHost={isHost} />;
  }
  if (phase === "results") {
    return <Results playerId={playerId} />;
  }
  return <GameBoard playerId={playerId} isHost={isHost} />;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [ready, setReady] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("dota_player_id") || uuidv4();
    const name = localStorage.getItem("dota_player_name");
    const host = localStorage.getItem("dota_is_host") === "true";

    if (!name) {
      router.push("/");
      return;
    }

    localStorage.setItem("dota_player_id", id);
    setPlayerId(id);
    setPlayerName(name);
    setIsHost(host);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⚔️</div>
          <p className="text-gray-400">Loading the battlefield...</p>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ playerId, cursor: null }}
      initialStorage={{
        players: new LiveMap(),
        game: new LiveObject(INITIAL_GAME_STATE),
        chat: new LiveList([]),
      }}
      authEndpoint={async () => {
        const res = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, playerName, roomId }),
        });
        return res.json();
      }}
    >
      {/* Room code banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800 px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">Dota 2 Knowledge Game</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-400">Room:</span>
          <span className="font-mono font-bold text-yellow-400 tracking-widest bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
            {roomId}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            📋 Copy Link
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isHost && <span className="text-xs bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">👑 HOST</span>}
          <span className="text-gray-400 text-xs">{playerName}</span>
        </div>
      </div>
      <div className="pt-12">
        <GameRoom playerId={playerId} playerName={playerName} isHost={isHost} />
      </div>
    </RoomProvider>
  );
}
