// Neon Slot Simboli i SVG renderovanje
const SlotSymbols = {
  cherry: {
    id: 'cherry',
    name: 'Cherry',
    cls: 'color-cherry',
    color: '#ff0055',
    baseVal: 2,
    multipliers: { 3: 2, 4: 5, 5: 15 },
    weight: 28,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Peteljke i listić -->
      <path d="M48 20 C 58 14, 70 18, 76 15" stroke="#39ff14" stroke-width="3" fill="none" opacity="0.9" />
      <path d="M48 20 Q 32 35 34 56" stroke="#39ff14" stroke-width="3.5" fill="none" />
      <path d="M48 20 Q 64 35 68 56" stroke="#39ff14" stroke-width="3.5" fill="none" />
      <!-- Dve višnje sa sjajem -->
      <circle cx="33" cy="68" r="16" stroke="#ff0055" stroke-width="4.5" fill="rgba(255, 0, 85, 0.12)" />
      <circle cx="69" cy="68" r="16" stroke="#ff0055" stroke-width="4.5" fill="rgba(255, 0, 85, 0.12)" />
      <!-- Unutrašnji neonski odsjaj -->
      <path d="M26 62 Q 30 57 37 57" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.8" />
      <path d="M62 62 Q 66 57 73 57" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.8" />
    </svg>`
  },
  lemon: {
    id: 'lemon',
    name: 'Lemon',
    cls: 'color-lemon',
    color: '#ffff00',
    baseVal: 3,
    multipliers: { 3: 3, 4: 8, 5: 20 },
    weight: 24,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Limun rotirano telo sa šiljcima na krajevima -->
      <g transform="rotate(-35 50 50)">
        <path d="M20 50 C 20 28, 40 22, 50 22 C 60 22, 80 28, 80 50 C 80 72, 60 78, 50 78 C 40 78, 20 72, 20 50 Z" stroke="#ffff00" stroke-width="4.5" fill="rgba(255, 255, 0, 0.1)" />
        <!-- Šiljci limuna -->
        <path d="M19 50 L 13 50" stroke="#ffff00" stroke-width="4" stroke-linecap="round" />
        <path d="M81 50 L 87 50" stroke="#ffff00" stroke-width="4" stroke-linecap="round" />
        <!-- Unutrašnja tekstura kriške -->
        <path d="M34 50 Q 50 40 66 50" stroke="#ffea00" stroke-width="2.5" fill="none" opacity="0.6" />
        <!-- Sjaj na kori -->
        <path d="M30 33 Q 50 27 70 33" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.85" />
      </g>
    </svg>`
  },
  plum: {
    id: 'plum',
    name: 'Plum',
    cls: 'color-plum',
    color: '#00ffff',
    baseVal: 5,
    multipliers: { 3: 5, 4: 12, 5: 35 },
    weight: 20,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Peteljka i zeleni list šljive -->
      <path d="M50 26 L 50 14" stroke="#39ff14" stroke-width="3.5" fill="none" />
      <path d="M50 18 Q 66 12 68 22 Q 58 24 50 18" stroke="#39ff14" stroke-width="2.5" fill="rgba(57, 255, 20, 0.2)" />
      <!-- Sočno srcoliko telo šljive -->
      <path d="M50 30 C 26 26, 18 52, 24 72 C 30 88, 46 90, 50 86 C 54 90, 70 88, 76 72 C 82 52, 74 26, 50 30 Z" stroke="#00ffff" stroke-width="4.5" fill="rgba(0, 255, 255, 0.12)" />
      <!-- Centralni usek šljive -->
      <path d="M50 32 Q 45 56 49 82" stroke="#00d4ff" stroke-width="2.5" fill="none" opacity="0.75" />
      <!-- Sjaj na boku -->
      <path d="M28 46 Q 26 62 34 74" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.85" />
    </svg>`
  },
  grapes: {
    id: 'grapes',
    name: 'Grapes',
    cls: 'color-grapes',
    color: '#39ff14',
    baseVal: 8,
    multipliers: { 3: 8, 4: 20, 5: 60 },
    weight: 16,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Loza i list grozda -->
      <path d="M50 24 L 50 12 Q 62 10 66 16" stroke="#00ffff" stroke-width="3" fill="none" />
      <path d="M38 22 Q 48 15 54 24 Q 44 26 38 22" stroke="#39ff14" stroke-width="2.5" fill="rgba(57, 255, 20, 0.25)" />
      <!-- Bobice raspoređene u grozd -->
      <g stroke="#39ff14" stroke-width="4" fill="rgba(57, 255, 20, 0.12)">
        <!-- Gornji red -->
        <circle cx="36" cy="36" r="9" />
        <circle cx="50" cy="33" r="9" />
        <circle cx="64" cy="36" r="9" />
        <!-- Srednji red -->
        <circle cx="43" cy="51" r="9" />
        <circle cx="57" cy="51" r="9" />
        <!-- Donji red -->
        <circle cx="38" cy="67" r="8.5" />
        <circle cx="52" cy="67" r="8.5" />
        <circle cx="64" cy="67" r="8.5" />
        <!-- Vrh grozda na dnu -->
        <circle cx="50" cy="82" r="7.5" />
      </g>
      <!-- Refleksije svetlosti na bobicama -->
      <circle cx="34" cy="34" r="2.5" fill="#ffffff" stroke="none" opacity="0.85" />
      <circle cx="62" cy="34" r="2.5" fill="#ffffff" stroke="none" opacity="0.85" />
      <circle cx="50" cy="49" r="2.5" fill="#ffffff" stroke="none" opacity="0.85" />
    </svg>`
  },
  bell: {
    id: 'bell',
    name: 'Bell',
    cls: 'color-bell',
    color: '#ffaa00',
    baseVal: 15,
    multipliers: { 3: 15, 4: 40, 5: 120 },
    weight: 12,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Glavno zvono sa širokim obodom -->
      <path d="M50 18 C 36 18, 30 38, 28 58 L 20 72 Q 18 78 26 78 L 74 78 Q 82 78 80 72 L 72 58 C 70 38, 64 18, 50 18 Z" stroke="#ffaa00" stroke-width="4.5" fill="rgba(255, 170, 0, 0.12)" />
      <!-- Klatno na dnu -->
      <circle cx="50" cy="85" r="7" stroke="#ffaa00" stroke-width="4" fill="rgba(255, 170, 0, 0.25)" />
      <!-- Kruna na vrhu zvona -->
      <path d="M44 18 C 44 12, 56 12, 56 18" stroke="#ffaa00" stroke-width="3.5" fill="none" />
      <!-- Vodoravna ukrasna linija na telu zvona -->
      <path d="M28 64 Q 50 68 72 64" stroke="#ffd700" stroke-width="2.5" fill="none" opacity="0.75" />
      <!-- Refleksija na levom boku -->
      <path d="M33 34 Q 31 52 26 66" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.85" />
    </svg>`
  },
  seven: {
    id: 'seven',
    name: 'Seven',
    cls: 'color-seven',
    color: '#ff00de',
    baseVal: 30,
    multipliers: { 3: 30, 4: 100, 5: 300 },
    weight: 8,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Dvostruka konturna Sedmica u Vegas / Arcade stilu -->
      <path d="M18 22 L 82 22 L 46 88 L 32 88 L 64 34 L 18 34 Z" stroke="#ff00de" stroke-width="3" fill="rgba(255, 0, 222, 0.2)" stroke-linejoin="round" />
      <!-- Poprečna neon crta kroz sedmicu -->
      <line x1="38" y1="52" x2="62" y2="52" stroke="#00ffff" stroke-width="4.5" stroke-linecap="round" />
      <!-- Unutrašnja neonska linija sjaja -->
      <polyline points="24,26 76,26 48,82" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.9" />
    </svg>`
  },
  wild: {
    id: 'wild',
    name: 'Wild',
    cls: 'color-wild',
    color: '#00ffff',
    baseVal: 50,
    multipliers: { 3: 50, 4: 180, 5: 600 },
    weight: 5,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Rotirajući neonski bedž -->
      <circle cx="50" cy="50" r="42" stroke="#ff00de" stroke-width="3" stroke-dasharray="6,4" fill="rgba(255, 0, 222, 0.1)" />
      <polygon points="50,14 58,38 84,38 63,53 71,78 50,63 29,78 37,53 16,38 42,38" stroke="#00ffff" stroke-width="3.5" fill="rgba(0, 255, 255, 0.15)" stroke-linejoin="round"/>
      <!-- Centriran upečatljiv WILD natpis -->
      <text x="50" y="58" font-family="'Orbitron', sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="#ffffff" stroke="#00ffff" stroke-width="1.2" letter-spacing="1">WILD</text>
    </svg>`
  },
  bonus: {
    id: 'bonus',
    name: 'Super Bonus',
    cls: 'color-bonus',
    color: '#ff0044',
    baseVal: 0,
    multipliers: { 3: 0, 4: 0, 5: 0 },
    weight: 3,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Laserska meta za Shooter bonus -->
      <circle cx="50" cy="50" r="40" stroke="#ff0044" stroke-width="3.5" fill="rgba(255, 0, 68, 0.12)" />
      <circle cx="50" cy="50" r="27" stroke="#ff0044" stroke-width="2.5" fill="none" stroke-dasharray="4,3" />
      <circle cx="50" cy="50" r="14" stroke="#ffffff" stroke-width="3" fill="rgba(255, 0, 68, 0.3)" />
      <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="none" />
      <!-- Krstić nišana -->
      <line x1="50" y1="4" x2="50" y2="96" stroke="#00ffff" stroke-width="2.5" stroke-linecap="round" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="#00ffff" stroke-width="2.5" stroke-linecap="round" />
      <!-- BONUS tekst -->
      <text x="50" y="26" font-family="'Orbitron', sans-serif" font-weight="900" font-size="8.5" text-anchor="middle" fill="#ffd700">SUPER</text>
      <text x="50" y="80" font-family="'Orbitron', sans-serif" font-weight="900" font-size="8.5" text-anchor="middle" fill="#ffd700">BONUS</text>
    </svg>`
  },
  scatter: {
    id: 'scatter',
    name: 'Free Spins',
    cls: 'color-scatter',
    color: '#00ffff',
    baseVal: 0,
    multipliers: { 3: 0, 4: 0, 5: 0 },
    weight: 5,
    svg: () => `<svg viewBox="0 0 100 100" class="neon-svg">
      <!-- Pulsirajuća zvezda sa rotirajućim oreolom -->
      <polygon points="50,10 63,36 92,36 68,54 77,82 50,65 23,82 32,54 8,36 37,36" stroke="#00ffff" stroke-width="3.5" fill="rgba(0, 255, 255, 0.15)" stroke-linejoin="round" />
      <circle cx="50" cy="50" r="20" stroke="#ff00de" stroke-width="3" fill="rgba(255, 0, 222, 0.2)" stroke-dasharray="4,3" />
      <text x="50" y="47" font-family="'Orbitron', sans-serif" font-weight="900" font-size="10" text-anchor="middle" fill="#ffffff" letter-spacing="1">FREE</text>
      <text x="50" y="60" font-family="'Orbitron', sans-serif" font-weight="900" font-size="10" text-anchor="middle" fill="#00ffff" letter-spacing="1">SPINS</text>
    </svg>`
  }
};

const BonusValues = {
  cherry: 1,
  lemon: 2,
  plum: 3,
  grapes: 5,
  bell: 10,
  seven: 20,
  wild: 50
};
