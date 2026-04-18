# ⚔️ Dota 2 Knowledge Battleground

A real-time multiplayer Dota 2 trivia game — Monopoly-style board, hero tokens, counterpick questions, duels, expert challenges, and funny nicknames for bad players.

## ✨ Features

- 🎲 **Monopoly-style board** — Roll dice, move your hero token around 20 squares
- ⚔️ **Counterpick Questions** — "Who counters who? What item beats what?"
- 🛡️ **Combat Scenarios** — "These items at 30 min, who wins the 1v1?"
- ✨ **Ability Knowledge** — Hero skills, mechanics, interactions
- 📚 **Dota 2 Trivia** — Lore, history, fun facts
- 🥊 **Duels** — Head-to-head challenges between players
- 🎓 **Expert Role** — A designated expert can challenge wrong answers (but gets banned if they're wrong themselves lol)
- 😂 **Funny Nicknames** — Get 2 wrong? You're now "Fountain Camper"
- 🏆 **Prize Zone** — Land here for a bonus power-up
- 📊 **End Game Results** — Full stats, accuracy %, personalized recommendations

## 🚀 Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/dota2-knowledge-game
cd dota2-knowledge-game
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys:

```env
LIVEBLOCKS_SECRET_KEY=sk_prod_...   # from liveblocks.io → API Keys
ANTHROPIC_API_KEY=sk-ant-...        # from console.anthropic.com
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Add environment variables:
   - `LIVEBLOCKS_SECRET_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy → share the link with your squad

---

## 🎮 How to Play

| Square | Color | Type |
|--------|-------|------|
| 🏁 Start | Green | Free pass |
| ⚔️ Counterpick | Blue | Who counters who? |
| 🛡️ Combat | Red | Item/fight scenarios |
| ✨ Ability | Purple | Hero skill knowledge |
| 📚 Trivia | Amber | General Dota 2 facts |
| 🥊 Duel Arena | Orange | 1v1 vs random player |
| 🎓 Expert's Lair | Cyan | Expert challenge square |
| 🏆 Prize Zone | Gold | Bonus power-up |

### Scoring
- Easy question: **100 pts**
- Medium question: **200 pts**
- Hard question: **300 pts**
- Winning a Duel: **400 pts**
- Expert bonus (if upheld): **200 pts**

### Expert Rules
- Host assigns the Expert role (someone who still actively plays)
- Expert can challenge any answer during a question
- Expert types their correction
- **Host decides**: upheld = Expert gets +200pts, rejected = Expert banned 1 round 😂

### Funny Nicknames
- Get 2+ wrong answers → you get a randomly assigned nickname
- It shows on the scoreboard and in the battle log
- Examples: "Fountain Camper", "Divine Blocker", "Rosh Feeder"

---

## 🛠️ Tech Stack

- **Next.js 14** — App Router, API routes
- **Liveblocks** — Real-time sync (presence, storage, events)
- **Claude API** — Dynamic question generation
- **OpenDota / Steam CDN** — Hero & item images (free)
- **Tailwind CSS** — Styling
- **Vercel** — Hosting

---

## 💰 Cost

| Service | Cost |
|---------|------|
| Vercel | Free |
| Liveblocks | Free (up to 100 connections) |
| Claude API | ~$0.001 per question |

A full 6-round game with 5 players ≈ ~30 questions ≈ **~$0.03 total** 🎉

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                  # Landing / create / join
│   ├── room/[roomId]/page.tsx    # Game room
│   └── api/
│       ├── liveblocks-auth/      # Auth endpoint
│       └── question/             # Claude question generation
├── components/
│   ├── Lobby.tsx                 # Waiting room + hero select
│   ├── GameBoard.tsx             # Main board + dice + tokens
│   ├── QuestionCard.tsx          # Q&A + expert challenge UI
│   ├── DuelModal.tsx             # 1v1 duel overlay
│   └── Results.tsx               # End screen + analysis
└── lib/
    ├── liveblocks.config.ts      # Types + client
    ├── heroes.ts                 # Hero data + board config
    └── gameLogic.ts              # Game utilities + prompts
```

---

GG WP. Don't feed. 🏆
