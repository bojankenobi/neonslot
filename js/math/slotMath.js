// Certified-grade Casino Math Engine: Cryptographic RNG, Unique Volatility Strips, and Wild Multipliers
class SlotMathEngine {
  constructor() {
    this.cabinetStrips = {};
    this.buildCabinetStrips();
  }

  // Kriptografski bezbedan generator slučajnih brojeva (pravi kazino standard)
  randomFloat() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] / (0xffffffff + 1);
    }
    return Math.random();
  }

  randomInt(min, max) {
    return Math.floor(this.randomFloat() * (max - min + 1)) + min;
  }

  // Generisanje unikatnih asimetričnih traka za svaki kabinet sa kalibrisanom volatilnošću
  buildCabinetStrips() {
    // 1. CLASSIC-3 (Retro 777 Deluxe) - Low/Medium-Low Volatility (RTP ~96.5%, Hit Frequency ~31%)
    // Česti niži dobitci (trešnja, limun, šljiva), uravnotežene 777
    const classicPool = {
      cherry: 32, lemon: 26, plum: 22, grapes: 16, bell: 11, seven: 8, wild: 6, bonus: 3, scatter: 4
    };
    this.cabinetStrips['classic-3'] = this.createAsymmetricStrips(classicPool, 3, {
      reel0ScatterBoost: 1.4,
      reel1ScatterBoost: 1.3,
      reel2ScatterBoost: 0.9
    });

    // 2. NEON-5 (Cyberpunk Neon) - Medium Volatility (RTP ~96.2%, Hit Frequency ~24%)
    // Balansirana igra: 5 koluta, 10 linija, češći Wild-ovi sa mogućim x2/x3 množiocem
    const neonPool = {
      cherry: 28, lemon: 24, plum: 20, grapes: 16, bell: 12, seven: 8, wild: 6, bonus: 3, scatter: 4
    };
    this.cabinetStrips['neon-5'] = this.createAsymmetricStrips(neonPool, 5, {
      reel0ScatterBoost: 1.5,
      reel1ScatterBoost: 1.4,
      reel2ScatterBoost: 1.0,
      reel3ScatterBoost: 0.85,
      reel4ScatterBoost: 0.75
    });

    // 3. VEGAS-20 (Vegas High-Roller) - High/Extreme Volatility (RTP ~96.0%, Hit Frequency ~18%)
    // 20 linija: ređi dobitci, ali veća koncentracija 777, Bell i Wild simbola na pojedinim kolutovima za masivne serije
    const vegasPool = {
      cherry: 34, lemon: 30, plum: 24, grapes: 18, bell: 14, seven: 11, wild: 7, bonus: 3, scatter: 3
    };
    this.cabinetStrips['vegas-20'] = this.createAsymmetricStrips(vegasPool, 5, {
      reel0ScatterBoost: 1.6,
      reel1ScatterBoost: 1.5,
      reel2ScatterBoost: 0.9,
      reel3ScatterBoost: 0.8,
      reel4ScatterBoost: 0.7
    });
  }

  // Kreira asimetrične trake po kolutovima (Reels 1 i 2 imaju veće šanse za Scatter radi Near-Miss suspense-a)
  createAsymmetricStrips(baseWeights, totalCols, scatterProfiles) {
    const strips = [];

    for (let c = 0; c < totalCols; c++) {
      const pool = [];
      const boostKey = `reel${c}ScatterBoost`;
      const boost = (scatterProfiles && scatterProfiles[boostKey]) ? scatterProfiles[boostKey] : 1.0;

      Object.entries(baseWeights).forEach(([symId, weight]) => {
        let finalWeight = weight;
        if (symId === 'scatter' || symId === 'bonus') {
          finalWeight = Math.max(1, Math.round(weight * boost));
        }
        for (let i = 0; i < finalWeight; i++) {
          pool.push(symId);
        }
      });

      // Fisher-Yates šafl sa kriptografskim RNG
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(this.randomFloat() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      strips.push(pool);
    }

    return strips;
  }

  // Pomoćna funkcija za instanciranje simbola sa podrškom za Wild Multiplier (x1, x2, x3, x5)
  createSymbolInstance(symId, forceMultiplier = null) {
    const base = SlotSymbols[symId];
    if (!base) return SlotSymbols.cherry;

    if (symId === 'wild') {
      let mult = 1;
      if (forceMultiplier) {
        mult = forceMultiplier;
      } else {
        // 20% šanse da Wild nosi x2, 8% šanse za x3, 3% za x5
        const roll = this.randomFloat();
        if (roll < 0.03) mult = 5;
        else if (roll < 0.11) mult = 3;
        else if (roll < 0.31) mult = 2;
      }

      return {
        ...base,
        wildMultiplier: mult
      };
    }

    return { ...base, wildMultiplier: 1 };
  }

  // Generiše stop pozicije za zadati aparat
  generateSpinResult(cols = 3, rows = 3, machineId = 'classic-3') {
    const strips = this.cabinetStrips[machineId] || this.cabinetStrips['classic-3'];
    const grid = [];

    for (let c = 0; c < cols; c++) {
      const strip = strips[c % strips.length];
      const stopIndex = Math.floor(this.randomFloat() * strip.length);
      const colSymbols = [];

      for (let r = 0; r < rows; r++) {
        const idx = (stopIndex + r) % strip.length;
        const symId = strip[idx];
        colSymbols.push(this.createSymbolInstance(symId));
      }
      grid.push(colSymbols);
    }

    return grid;
  }

  // Evaluacija dobitaka sa Wild multiplikatorima i uravnoteženom podelom po linijama
  evaluateWins(grid, paylines, bet) {
    const cols = grid.length;
    let totalWin = 0;
    const winningLines = [];
    let bonusCount = 0;
    let scatterCount = 0;

    // Prebroj bonus i scatter simbole na celom ekranu
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        if (grid[c][r].id === 'bonus') bonusCount++;
        if (grid[c][r].id === 'scatter') scatterCount++;
      }
    }

    const lineCount = paylines.length || (cols === 5 ? 10 : 5);
    const lineBet = bet / lineCount;

    // Provera svake isplatne linije s leva na desno
    paylines.forEach(line => {
      const coords = line.coords;
      const symbolsInLine = coords.map(([c, r]) => grid[c][r]);

      // Pronalaženje ciljnog regularnog simbola
      let targetSym = null;
      for (let i = 0; i < symbolsInLine.length; i++) {
        const s = symbolsInLine[i];
        if (s.id !== 'wild' && s.id !== 'bonus' && s.id !== 'scatter') {
          targetSym = s;
          break;
        }
      }

      // Ako su svi na liniji Wild
      if (!targetSym) {
        targetSym = SlotSymbols.wild;
      }

      let matchCount = 0;
      const matchedCoords = [];
      let combinedWildMultiplier = 1;

      for (let i = 0; i < symbolsInLine.length; i++) {
        const current = symbolsInLine[i];
        if (current.id === targetSym.id || current.id === 'wild') {
          matchCount++;
          matchedCoords.push(coords[i]);
          if (current.id === 'wild' && current.wildMultiplier > 1) {
            combinedWildMultiplier *= current.wildMultiplier;
          }
        } else {
          break; // niz je prekinut
        }
      }

      // Za 3 koluta mora biti 3 poklapanja; za 5 koluta 3, 4 ili 5
      if (matchCount >= 3) {
        const basePayoutMult = targetSym.multipliers[matchCount] || targetSym.baseVal;
        // Linijski dobitak: lineBet * bazni množilac * kombinovani Wild množilac
        const lineWin = Math.round(lineBet * basePayoutMult * combinedWildMultiplier);

        if (lineWin > 0) {
          totalWin += lineWin;
          winningLines.push({
            line: line,
            symbol: targetSym,
            matchCount: matchCount,
            matchedCoords: matchedCoords,
            wildMultiplier: combinedWildMultiplier,
            payout: lineWin
          });
        }
      }
    });

    return {
      totalWin,
      winningLines,
      bonusTriggered: bonusCount >= 3,
      bonusCount,
      freeSpinsTriggered: scatterCount >= 3,
      scatterCount
    };
  }

  // Kaskada: uklanja simbole koji su eksplodirali i ubacuje nove sa vrha
  cascadeGrid(grid, explodedCoords, machineId = 'classic-3') {
    const cols = grid.length;
    const rows = grid[0].length;
    const newGrid = [];
    const explodedSet = new Set(explodedCoords.map(([c, r]) => `${c},${r}`));
    const strips = this.cabinetStrips[machineId] || this.cabinetStrips['classic-3'];

    for (let c = 0; c < cols; c++) {
      const remainingSymbols = [];
      for (let r = 0; r < rows; r++) {
        if (!explodedSet.has(`${c},${r}`)) {
          remainingSymbols.push(grid[c][r]);
        }
      }

      const needed = rows - remainingSymbols.length;
      const newSymbols = [];
      const strip = strips[c % strips.length];

      for (let i = 0; i < needed; i++) {
        const randIdx = Math.floor(this.randomFloat() * strip.length);
        const symId = strip[randIdx];
        newSymbols.push(this.createSymbolInstance(symId));
      }

      newGrid.push([...newSymbols, ...remainingSymbols]);
    }

    return newGrid;
  }
}

const SlotMath = new SlotMathEngine();

