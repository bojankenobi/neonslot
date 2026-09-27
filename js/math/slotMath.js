// Slot Matematika: Reel Strips, RNG i Evaluacija linija (3x3 i 5x3)
class SlotMathEngine {
  constructor() {
    this.strips = [];
    this.buildVirtualStrips();
  }

  // Kreira trake sa težinama simbola radi postizanja ~96% RTP
  buildVirtualStrips() {
    const symbolPool = [];
    Object.values(SlotSymbols).forEach(sym => {
      for (let i = 0; i < sym.weight; i++) {
        symbolPool.push(sym.id);
      }
    });

    // Kreiramo 5 nezavisnih traka (reels 0 do 4)
    this.strips = [];
    for (let c = 0; c < 5; c++) {
      // Šaflujemo pool za svaki kolut posebno
      const strip = [...symbolPool];
      for (let i = strip.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [strip[i], strip[j]] = [strip[j], strip[i]];
      }
      this.strips.push(strip);
    }
  }

  // Generiše stop pozicije za zadati broj koluta (3 ili 5)
  generateSpinResult(cols = 3, rows = 3) {
    const grid = []; // grid[col][row]
    for (let c = 0; c < cols; c++) {
      const strip = this.strips[c];
      const stopIndex = Math.floor(Math.random() * strip.length);
      const colSymbols = [];
      for (let r = 0; r < rows; r++) {
        const idx = (stopIndex + r) % strip.length;
        const symId = strip[idx];
        colSymbols.push(SlotSymbols[symId]);
      }
      grid.push(colSymbols);
    }
    return grid;
  }

  // Evaluira dobitke po isplatnim linijama za 3 ili 5 koluta
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

    // Provera svake isplatne linije
    paylines.forEach(line => {
      const coords = line.coords;
      const symbolsInLine = coords.map(([c, r]) => grid[c][r]);

      // Pravilo s leva na desno (wild menja sve osim bonus i scatter)
      let targetSym = null;
      for (let i = 0; i < symbolsInLine.length; i++) {
        if (symbolsInLine[i].id !== 'wild' && symbolsInLine[i].id !== 'bonus' && symbolsInLine[i].id !== 'scatter') {
          targetSym = symbolsInLine[i];
          break;
        }
      }

      // Ako su svi na liniji wild:
      if (!targetSym) {
        targetSym = SlotSymbols.wild;
      }

      // Brojimo uzastopna poklapanja s leva na desno
      let matchCount = 0;
      const matchedCoords = [];

      for (let i = 0; i < symbolsInLine.length; i++) {
        const current = symbolsInLine[i];
        if (current.id === targetSym.id || current.id === 'wild') {
          matchCount++;
          matchedCoords.push(coords[i]);
        } else {
          break; // niz je prekinut
        }
      }

      // Za 3 koluta mora biti 3; za 5 koluta isplaćuje se 3, 4 ili 5
      if (matchCount >= 3) {
        const multiplier = targetSym.multipliers[matchCount] || targetSym.baseVal;
        const lineCount = paylines.length || (cols === 5 ? 10 : 5);
        const lineWin = Math.round(bet * (multiplier / lineCount));
        
        if (lineWin > 0) {
          totalWin += lineWin;
          winningLines.push({
            line: line,
            symbol: targetSym,
            matchCount: matchCount,
            matchedCoords: matchedCoords,
            win: lineWin
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

  // Kaskada: uklanja simbole na zadatim koordinatama, spušta postojeće na dno i na vrh dodaje nove
  cascadeGrid(grid, explodedCoords) {
    const cols = grid.length;
    const rows = grid[0].length;
    const newGrid = [];

    // Set koordinata za brzu proveru npr "0,1"
    const explodedSet = new Set(explodedCoords.map(([c, r]) => `${c},${r}`));

    for (let c = 0; c < cols; c++) {
      const remainingSymbols = [];
      for (let r = 0; r < rows; r++) {
        if (!explodedSet.has(`${c},${r}`)) {
          remainingSymbols.push(grid[c][r]);
        }
      }

      // Koliko novih simbola treba da padne sa vrha
      const needed = rows - remainingSymbols.length;
      const newSymbols = [];
      const strip = this.strips[c];
      for (let i = 0; i < needed; i++) {
        const randIdx = Math.floor(Math.random() * strip.length);
        newSymbols.push(SlotSymbols[strip[randIdx]]);
      }

      // Novi padaju odozgo pa idu preživeli
      newGrid.push([...newSymbols, ...remainingSymbols]);
    }

    return newGrid;
  }
}

const SlotMath = new SlotMathEngine();
