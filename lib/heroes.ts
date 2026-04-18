export type Hero = {
  id: string;
  name: string;
  attribute: "str" | "agi" | "int" | "uni";
  roles: string[];
  counters: string[];
  counteredBy: string[];
  keyItems: string[];
  keyAbility: string;
  emoji: string;
};

export const HEROES: Hero[] = [
  {
    id: "antimage",
    name: "Anti-Mage",
    attribute: "agi",
    roles: ["Carry", "Escape"],
    counters: ["Storm Spirit", "Outworld Devourer", "Medusa"],
    counteredBy: ["Orchid", "Doom", "Bloodseeker"],
    keyItems: ["Manta Style", "Battlefury", "Abyssal Blade"],
    keyAbility: "Mana Break",
    emoji: "⚡",
  },
  {
    id: "axe",
    name: "Axe",
    attribute: "str",
    roles: ["Initiator", "Durable", "Disabler"],
    counters: ["Lifestealer", "Wraith King", "Timbersaw"],
    counteredBy: ["Kiting heroes", "Slark", "Anti-Mage"],
    keyItems: ["Blink Dagger", "Blade Mail", "Vanguard"],
    keyAbility: "Berserker's Call",
    emoji: "🪓",
  },
  {
    id: "crystal_maiden",
    name: "Crystal Maiden",
    attribute: "int",
    roles: ["Support", "Disabler", "Nuker"],
    counters: ["Bristleback", "Spectre"],
    counteredBy: ["Storm Spirit", "Windranger", "Anti-Mage"],
    keyItems: ["Glimmer Cape", "Force Staff", "Aghanim's Scepter"],
    keyAbility: "Freezing Field",
    emoji: "❄️",
  },
  {
    id: "drow_ranger",
    name: "Drow Ranger",
    attribute: "agi",
    roles: ["Carry", "Nuker", "Disabler"],
    counters: ["Phantom Assassin", "Keeper of the Light"],
    counteredBy: ["Bounty Hunter", "Slark", "Nyx Assassin"],
    keyItems: ["Dragon Lance", "Hurricane Pike", "Daedalus"],
    keyAbility: "Marksmanship",
    emoji: "🏹",
  },
  {
    id: "earthshaker",
    name: "Earthshaker",
    attribute: "str",
    roles: ["Initiator", "Disabler", "Support"],
    counters: ["Grouped heroes", "Warlock"],
    counteredBy: ["Blink counters", "Faceless Void"],
    keyItems: ["Blink Dagger", "Aghanim's Scepter", "Force Staff"],
    keyAbility: "Echo Slam",
    emoji: "🌍",
  },
  {
    id: "invoker",
    name: "Invoker",
    attribute: "int",
    roles: ["Carry", "Nuker", "Disabler"],
    counters: ["Support heroes", "Medusa"],
    counteredBy: ["Silencer", "Anti-Mage", "Nyx Assassin"],
    keyItems: ["Eul's Scepter", "Aghanim's Scepter", "Octarine Core"],
    keyAbility: "Invoke",
    emoji: "🌀",
  },
  {
    id: "juggernaut",
    name: "Juggernaut",
    attribute: "agi",
    roles: ["Carry", "Pusher"],
    counters: ["High armor heroes struggle vs Omnislash"],
    counteredBy: ["Axe", "Doom", "Meepo"],
    keyItems: ["Battle Fury", "Aghanim's Scepter", "Diffusal Blade"],
    keyAbility: "Omnislash",
    emoji: "🗡️",
  },
  {
    id: "lina",
    name: "Lina",
    attribute: "int",
    roles: ["Carry", "Support", "Nuker", "Disabler"],
    counters: ["Axe", "Dragon Knight"],
    counteredBy: ["Viper", "Anti-Mage", "Bloodseeker"],
    keyItems: ["Aghanim's Scepter", "Daedalus", "Scythe of Vyse"],
    keyAbility: "Laguna Blade",
    emoji: "🔥",
  },
  {
    id: "lion",
    name: "Lion",
    attribute: "int",
    roles: ["Support", "Disabler", "Nuker"],
    counters: ["Meepo", "Naga Siren"],
    counteredBy: ["Black King Bar heroes", "Lifestealer"],
    keyItems: ["Aghanim's Scepter", "Blink Dagger", "Aether Lens"],
    keyAbility: "Finger of Death",
    emoji: "🦁",
  },
  {
    id: "naga_siren",
    name: "Naga Siren",
    attribute: "agi",
    roles: ["Carry", "Pusher", "Initiator"],
    counters: ["Supports", "Low HP heroes"],
    counteredBy: ["Lion", "Doom", "Ancient Apparition"],
    keyItems: ["Radiance", "Diffusal Blade", "Heart of Tarrasque"],
    keyAbility: "Song of the Siren",
    emoji: "🧜",
  },
  {
    id: "pudge",
    name: "Pudge",
    attribute: "str",
    roles: ["Disabler", "Initiator", "Durable"],
    counters: ["Isolated targets", "Fragile supports"],
    counteredBy: ["Butterfly", "Ghost Scepter", "Anti-Mage"],
    keyItems: ["Aghanim's Scepter", "Blink Dagger", "Black King Bar"],
    keyAbility: "Meat Hook",
    emoji: "🪝",
  },
  {
    id: "rubick",
    name: "Rubick",
    attribute: "int",
    roles: ["Support", "Disabler", "Nuker"],
    counters: ["Heroes with strong stolen spells"],
    counteredBy: ["Silencer", "Ancient Apparition", "Doom"],
    keyItems: ["Aether Lens", "Aghanim's Scepter", "Force Staff"],
    keyAbility: "Spell Steal",
    emoji: "🔮",
  },
  {
    id: "shadow_fiend",
    name: "Shadow Fiend",
    attribute: "agi",
    roles: ["Carry", "Nuker"],
    counters: ["Heroes without gap closers", "Supports"],
    counteredBy: ["Axe", "Storm Spirit", "Anti-Mage"],
    keyItems: ["Eul's Scepter", "Daedalus", "Shadow Blade"],
    keyAbility: "Requiem of Souls",
    emoji: "💀",
  },
  {
    id: "storm_spirit",
    name: "Storm Spirit",
    attribute: "int",
    roles: ["Carry", "Escape", "Initiator", "Nuker"],
    counters: ["Mana-dependent heroes", "Slow heroes"],
    counteredBy: ["Anti-Mage", "Bloodseeker", "Orchid"],
    keyItems: ["Bloodstone", "Kaya and Sange", "Scythe of Vyse"],
    keyAbility: "Ball Lightning",
    emoji: "⚡",
  },
  {
    id: "tidehunter",
    name: "Tidehunter",
    attribute: "str",
    roles: ["Initiator", "Durable", "Disabler"],
    counters: ["Grouped melee heroes"],
    counteredBy: ["Silencer", "Doom", "Outworld Devourer"],
    keyItems: ["Blink Dagger", "Aghanim's Scepter", "Kraken Shell"],
    keyAbility: "Ravage",
    emoji: "🌊",
  },
  {
    id: "windranger",
    name: "Windranger",
    attribute: "int",
    roles: ["Carry", "Support", "Disabler", "Nuker", "Escape"],
    counters: ["Crystal Maiden", "Witch Doctor"],
    counteredBy: ["Ursa", "Phantom Assassin", "Lifestealer"],
    keyItems: ["Maelstrom", "Hurricane Pike", "Aghanim's Scepter"],
    keyAbility: "Shackleshot",
    emoji: "💨",
  },
];

export function getHeroImageUrl(heroId: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroId}.png`;
}

export function getHeroById(id: string): Hero | undefined {
  return HEROES.find((h) => h.id === id);
}

export const SQUARE_TYPES = [
  "start",       // 0 - Go / Start
  "counterpick", // 1
  "combat",      // 2
  "ability",     // 3
  "trivia",      // 4
  "duel",        // 5 - Duel Arena corner
  "counterpick", // 6
  "combat",      // 7
  "ability",     // 8
  "trivia",      // 9
  "expert",      // 10 - Expert's Lair corner
  "counterpick", // 11
  "combat",      // 12
  "ability",     // 13
  "trivia",      // 14
  "prize",       // 15 - Prize Zone corner
  "counterpick", // 16
  "combat",      // 17
  "ability",     // 18
  "trivia",      // 19
];

export const SQUARE_COLORS: Record<string, string> = {
  start: "#22c55e",
  counterpick: "#3b82f6",
  combat: "#ef4444",
  ability: "#a855f7",
  trivia: "#f59e0b",
  duel: "#f97316",
  expert: "#06b6d4",
  prize: "#eab308",
};

export const SQUARE_LABELS: Record<string, string> = {
  start: "🏁 START",
  counterpick: "⚔️ Counterpick",
  combat: "🛡️ Combat",
  ability: "✨ Ability",
  trivia: "📚 Trivia",
  duel: "🥊 DUEL ARENA",
  expert: "🎓 EXPERT'S LAIR",
  prize: "🏆 PRIZE ZONE",
};

export const FUNNY_NICKNAMES = [
  "Fountain Camper",
  "Techies Fan",
  "Invoker Spammer",
  "Chronosphere Misser",
  "Rosh Feeder",
  "Divine Blocker",
  "Courier Killer",
  "Tree Hider",
  "Creep Denier",
  "Buyback Forgetter",
  "Salve Waster",
  "Last Pick Invoker",
  "Blink on Cooldown",
  "TP Scroll Seller",
  "Jungle Afk-er",
  "Pudge Misser",
  "Hook or Feed",
  "Ancient Stacker Pro",
  "500 GPM Support",
];
