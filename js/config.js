// Neon Slot Global Config
const SlotConfig = {
  // Slot Machine Catalog for Casino Lobby Selection
  machines: {
    'classic-3': {
      id: 'classic-3',
      name: 'Retro 777 Deluxe',
      subtitle: 'CLASSIC VEGAS CABINET',
      badge: '3 REELS • 5 LINES',
      cols: 3,
      rows: 3,
      volatility: 'Medium-Low',
      volatilityStars: '★★★☆☆',
      color: '#ff0055',
      secondaryColor: '#ffff00',
      description: 'Fast-paced arcade action, mechanical rhythm, and frequent cascade hits.',
      paylines: [
        { id: 1, name: "Center Line",  coords: [[0,1], [1,1], [2,1]], color: "#ff0055" },
        { id: 2, name: "Top Line",     coords: [[0,0], [1,0], [2,0]], color: "#00ffcc" },
        { id: 3, name: "Bottom Line",  coords: [[0,2], [1,2], [2,2]], color: "#0088ff" },
        { id: 4, name: "Diagonal 1",   coords: [[0,0], [1,1], [2,2]], color: "#ffff00" },
        { id: 5, name: "Diagonal 2",   coords: [[0,2], [1,1], [2,0]], color: "#ff00de" }
      ]
    },
    'neon-5': {
      id: 'neon-5',
      name: 'Cyberpunk Neon',
      subtitle: 'MODERN VIDEO SLOT',
      badge: '5 REELS • 10 LINES',
      cols: 5,
      rows: 3,
      volatility: 'Medium',
      volatilityStars: '★★★★☆',
      color: '#ff00de',
      secondaryColor: '#00ffff',
      description: '10 active paylines, Expanding Wilds, and Sticky Multiplier Free Spins.',
      paylines: [
        { id: 1,  name: "Center",      coords: [[0,1], [1,1], [2,1], [3,1], [4,1]], color: "#ff0055" },
        { id: 2,  name: "Top",         coords: [[0,0], [1,0], [2,0], [3,0], [4,0]], color: "#00ffcc" },
        { id: 3,  name: "Bottom",      coords: [[0,2], [1,2], [2,2], [3,2], [4,2]], color: "#0088ff" },
        { id: 4,  name: "V-Shape",     coords: [[0,0], [1,1], [2,2], [3,1], [4,0]], color: "#ffff00" },
        { id: 5,  name: "Inverted V",  coords: [[0,2], [1,1], [2,0], [3,1], [4,2]], color: "#ff00de" },
        { id: 6,  name: "Zig-Zag 1",   coords: [[0,1], [1,0], [2,1], [3,2], [4,1]], color: "#ffaa00" },
        { id: 7,  name: "Zig-Zag 2",   coords: [[0,1], [1,2], [2,1], [3,0], [4,1]], color: "#39ff14" },
        { id: 8,  name: "Top-Center",  coords: [[0,0], [1,0], [2,1], [3,2], [4,2]], color: "#00ffff" },
        { id: 9,  name: "Bottom-Center",coords:[[0,2], [1,2], [2,1], [3,0], [4,0]], color: "#ff3399" },
        { id: 10, name: "Center-Edges",coords: [[0,1], [1,0], [2,0], [3,0], [4,1]], color: "#ffffff" }
      ]
    },
    'vegas-20': {
      id: 'vegas-20',
      name: 'Vegas High-Roller',
      subtitle: 'VIP CASCADE CABINET',
      badge: '5 REELS • 20 LINES',
      cols: 5,
      rows: 3,
      volatility: 'High',
      volatilityStars: '★★★★★',
      color: '#ffd700',
      secondaryColor: '#ff0055',
      description: '20 explosive paylines! Massive cascade combo chains and high multiplier potential.',
      paylines: [
        { id: 1,  name: "Sredina",     coords: [[0,1], [1,1], [2,1], [3,1], [4,1]], color: "#ff0055" },
        { id: 2,  name: "Gore",        coords: [[0,0], [1,0], [2,0], [3,0], [4,0]], color: "#00ffcc" },
        { id: 3,  name: "Dole",        coords: [[0,2], [1,2], [2,2], [3,2], [4,2]], color: "#0088ff" },
        { id: 4,  name: "V-Oblik",     coords: [[0,0], [1,1], [2,2], [3,1], [4,0]], color: "#ffff00" },
        { id: 5,  name: "Obrnuti V",   coords: [[0,2], [1,1], [2,0], [3,1], [4,2]], color: "#ff00de" },
        { id: 6,  name: "Cik-Cak 1",   coords: [[0,1], [1,0], [2,1], [3,2], [4,1]], color: "#ffaa00" },
        { id: 7,  name: "Cik-Cak 2",   coords: [[0,1], [1,2], [2,1], [3,0], [4,1]], color: "#39ff14" },
        { id: 8,  name: "Gore-Sred",   coords: [[0,0], [1,0], [2,1], [3,2], [4,2]], color: "#00ffff" },
        { id: 9,  name: "Dole-Sred",   coords: [[0,2], [1,2], [2,1], [3,0], [4,0]], color: "#ff3399" },
        { id: 10, name: "Sred-Krajevi", coords:[[0,1], [1,0], [2,0], [3,0], [4,1]], color: "#ffffff" },
        { id: 11, name: "Gore-Dole 1", coords: [[0,0], [1,1], [2,0], [3,1], [4,0]], color: "#00e5ff" },
        { id: 12, name: "Dole-Gore 1", coords: [[0,2], [1,1], [2,2], [3,1], [4,2]], color: "#ff9100" },
        { id: 13, name: "Sred-Vrh",    coords: [[0,1], [1,0], [2,0], [3,0], [4,1]], color: "#e040fb" },
        { id: 14, name: "Sred-Dno",    coords: [[0,1], [1,2], [2,2], [3,2], [4,1]], color: "#76ff03" },
        { id: 15, name: "Vrh-Sred-Vrh",coords: [[0,0], [1,0], [2,1], [3,0], [4,0]], color: "#ff1744" },
        { id: 16, name: "Dno-Sred-Dno",coords: [[0,2], [1,2], [2,1], [3,2], [4,2]], color: "#ffff00" },
        { id: 17, name: "Dijag Široka 1", coords: [[0,0], [1,1], [2,1], [3,1], [4,2]], color: "#00b0ff" },
        { id: 18, name: "Dijag Široka 2", coords: [[0,2], [1,1], [2,1], [3,1], [4,0]], color: "#f50057" },
        { id: 19, name: "Stepenica Gore", coords: [[0,2], [1,2], [2,1], [3,0], [4,0]], color: "#00e676" },
        { id: 20, name: "Stepenica Dole", coords: [[0,0], [1,0], [2,1], [3,2], [4,2]], color: "#ff6d00" }
      ]
    }
  },
  defaultMachine: 'classic-3',

  // Početni parametri
  defaultMode: 3,
  startingBalance: 1000,
  minBet: 10,
  maxBet: 500,
  betStep: 10,

  // Vremena animacije spin-a u ms
  spinDurationBase: 1200,
  reelStopDelay: 300,

  // RTP & Jackpot Config
  jackpots: [
    { id: 'nano',  name: 'NANO',  currentVal: 120.00, targetVal: 120.00, limit: 350.00,  color: '#00ffcc', rate: 0.008 },
    { id: 'micro', name: 'MICRO', currentVal: 600.00, targetVal: 600.00, limit: 1800.00, color: '#ff00de', rate: 0.004 },
    { id: 'mini',  name: 'MEGA',  currentVal: 2200.00, targetVal: 2200.00, limit: 6000.00, color: '#ffd700', rate: 0.002 }
  ]
};
