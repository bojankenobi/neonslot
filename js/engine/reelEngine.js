// ReelEngine: Upravlja kolutovima, animacijama vrtenja, zaustavljanjem i linijama za 3 ili 5 koluta
class ReelEngine {
  constructor(containerEl, svgEl) {
    this.container = containerEl;
    this.svg = svgEl;
    this.cols = 3;
    this.rows = 3;
    this.reels = []; // niz objekata koluta: { windowEl, tapeEl, overlayEl, stopped, stopTimer }
    this.isSpinning = false;
    this.onAllStoppedCallback = null;
    this.gridState = []; // trenutni simboli [col][row]
  }

  // Postavljanje broja koluta (3 ili 5)
  setReelCount(cols, rows = 3) {
    this.cols = cols;
    this.rows = rows;
    this.renderDOM();
  }

  renderDOM() {
    this.container.innerHTML = '';
    this.svg.innerHTML = '';
    this.reels = [];
    this.gridState = [];

    // Kreiramo kolutove
    for (let c = 0; c < this.cols; c++) {
      const windowEl = document.createElement('div');
      windowEl.className = 'reel-window';
      windowEl.dataset.col = c;

      const overlayEl = document.createElement('div');
      overlayEl.className = 'stop-overlay';
      overlayEl.innerHTML = `<span class="stop-text">STOP</span>`;

      const tapeEl = document.createElement('div');
      tapeEl.className = 'reel-tape';

      windowEl.appendChild(overlayEl);
      windowEl.appendChild(tapeEl);
      this.container.appendChild(windowEl);

      const reelObj = {
        index: c,
        windowEl,
        tapeEl,
        overlayEl,
        stopped: true,
        stopTimer: null
      };

      // Klik na pojedinačni kolut za manualni stop
      windowEl.addEventListener('click', () => {
        this.manualStopReel(c);
      });

      this.reels.push(reelObj);
    }

    // Inicijalno popunjavanje nasumičnim simbolima
    const initialGrid = SlotMath.generateSpinResult(this.cols, this.rows);
    this.setGridInstant(initialGrid);
  }

  setGridInstant(grid) {
    this.gridState = grid;
    this.reels.forEach((reel, c) => {
      reel.tapeEl.innerHTML = '';
      grid[c].forEach(sym => {
        const box = document.createElement('div');
        box.className = `symbol-box ${sym.cls}`;
        const mult = sym.wildMultiplier || 1;
        box.innerHTML = sym.svg(mult);
        reel.tapeEl.appendChild(box);
      });
    });
  }

  startSpin(targetGrid, onAllStopped, isTurbo = false) {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.onAllStoppedCallback = onAllStopped;
    this.gridState = targetGrid;
    this.scatterCountSoFar = 0;

    const baseDuration = isTurbo ? 350 : SlotConfig.spinDurationBase;
    const stopDelay = isTurbo ? 120 : SlotConfig.reelStopDelay;

    // Generišemo dugu traku za iluziju vrtenja
    this.reels.forEach((reel, i) => {
      reel.stopped = false;
      reel.tapeEl.innerHTML = this.generateSpinningStripHTML(32);
      reel.windowEl.classList.add('is-spinning');
      reel.windowEl.classList.remove('reel-anticipating');
      reel.windowEl.style.cursor = 'pointer';
      reel.overlayEl.style.display = 'flex';

      // Zakaži automatsko kaskadno zaustavljanje koluta
      const baseDelay = baseDuration + (i * stopDelay);
      reel.stopTimer = setTimeout(() => {
        if (!reel.stopped) {
          this.stopReel(i);
        }
      }, baseDelay);
    });
  }

  manualStopReel(colIdx) {
    if (!this.isSpinning) return;
    const reel = this.reels[colIdx];
    if (reel && !reel.stopped) {
      clearTimeout(reel.stopTimer);
      this.stopReel(colIdx);
      reel.windowEl.classList.add('manual-stop-flash');
      setTimeout(() => reel.windowEl.classList.remove('manual-stop-flash'), 200);
    }
  }

  stopAll() {
    if (!this.isSpinning) return;
    this.reels.forEach((reel, i) => {
      clearTimeout(reel.stopTimer);
      if (!reel.stopped) {
        this.stopReel(i);
      }
    });
  }

  stopReel(colIdx) {
    const reel = this.reels[colIdx];
    if (!reel || reel.stopped) return;

    reel.stopped = true;
    reel.windowEl.classList.remove('is-spinning');
    reel.windowEl.style.cursor = 'default';
    reel.overlayEl.style.display = 'none';

    // Postavljamo ciljne simbole za ovaj kolut
    let html = '';
    this.gridState[colIdx].forEach(sym => {
      const mult = sym.wildMultiplier || 1;
      html += `<div class="symbol-box ${sym.cls}">${sym.svg(mult)}</div>`;
    });
    reel.tapeEl.innerHTML = html;

    // Bounce stop animacija
    reel.tapeEl.classList.remove('reel-stop');
    void reel.tapeEl.offsetWidth; // Trigger reflow
    reel.tapeEl.classList.add('reel-stop');

    // Zvuk zaustavljanja
    Sound.playReelStop();

    // Provera da li na ovom zaustavljenom kolutu ima Scatter (Free Spins) simbola
    const hasScatter = this.gridState[colIdx].some(s => s.id === 'scatter');
    if (hasScatter) {
      this.scatterCountSoFar = (this.scatterCountSoFar || 0) + 1;
      Sound.playMultiplierRise(this.scatterCountSoFar * 2); // Specijalni ding za scatter
    }

    // ANTICIPATION TRIGGER: Ako smo pogodili 2 scatter-a (ili bonusa), a ima još kolutova koji se vrte
    if (this.scatterCountSoFar >= 2) {
      let isAnticipatingAny = false;
      this.reels.forEach((r, idx) => {
        if (!r.stopped && idx > colIdx) {
          isAnticipatingAny = true;
          r.windowEl.classList.add('reel-anticipating');
          // Produžavamo vreme vrtenja za dramatičan slow-mo efekat
          clearTimeout(r.stopTimer);
          r.stopTimer = setTimeout(() => {
            if (!r.stopped) this.stopReel(idx);
          }, 1800 + ((idx - colIdx) * 900));
        }
      });

      if (isAnticipatingAny) {
        document.body.classList.add('anticipation-active');
        Sound.startAnticipationLoop();
      }
    }

    // Proveri da li su svi zaustavljeni
    const allStopped = this.reels.every(r => r.stopped);
    if (allStopped) {
      this.isSpinning = false;
      document.body.classList.remove('anticipation-active');
      Sound.stopAnticipationLoop();
      this.reels.forEach(r => r.windowEl.classList.remove('reel-anticipating'));
      if (this.onAllStoppedCallback) {
        setTimeout(() => {
          this.onAllStoppedCallback();
        }, 350);
      }
    }
  }

  generateSpinningStripHTML(count) {
    let html = '';
    const symArray = Object.values(SlotSymbols);
    for (let i = 0; i < count; i++) {
      const sym = symArray[Math.floor(Math.random() * symArray.length)];
      html += `<div class="symbol-box ${sym.cls}">${sym.svg()}</div>`;
    }
    return html;
  }

  clearWinningEffects() {
    this.stopWinCycle();
    this.svg.innerHTML = '';
    this.container.querySelectorAll('.symbol-box').forEach(el => {
      el.classList.remove('symbol-dim', 'symbol-win', 'symbol-line-active');
    });
  }

  // Crtanje isplatnih linija i pokretanje sekvencijalnog line-by-line pregleda
  drawWins(winningLines, onLineDisplayed = null) {
    this.clearWinningEffects();
    if (!winningLines || winningLines.length === 0) return;

    this.winningLines = winningLines;
    this.onLineDisplayed = onLineDisplayed;

    // 1. Zatamni sve simbole u pozadini
    this.container.querySelectorAll('.symbol-box').forEach(el => {
      el.classList.add('symbol-dim');
    });

    // 2. Nacrtaj sve dobitne linije zbirno u prvom trenutku
    this.renderAllLinesOverlay(winningLines);

    // 3. Pokreni sekvencijalno Line-by-Line listanje nakon inicijalnog prikaza
    if (winningLines.length > 1) {
      this.winCycleTimer = setTimeout(() => {
        this.startWinCycle(0);
      }, 700);
    }
  }

  renderAllLinesOverlay(winningLines) {
    this.svg.innerHTML = '';
    winningLines.forEach(win => {
      this.drawSinglePath(win.line.coords, win.line.color, 0.75);
      win.matchedCoords.forEach(([c, r]) => {
        const reel = this.reels[c];
        if (reel && reel.tapeEl.children[r]) {
          const symBox = reel.tapeEl.children[r];
          symBox.classList.remove('symbol-dim');
          symBox.classList.add('symbol-win');
        }
      });
    });
  }

  drawSinglePath(coords, color, opacity = 1) {
    const pathD = this.calculatePathString(coords);

    // Spoljni neonski plazma sjaj (Aura)
    const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glowPath.setAttribute("d", pathD);
    glowPath.setAttribute("stroke", color);
    glowPath.setAttribute("stroke-width", "8");
    glowPath.setAttribute("fill", "none");
    glowPath.setAttribute("filter", `drop-shadow(0 0 14px ${color})`);
    glowPath.setAttribute("stroke-linecap", "round");
    glowPath.setAttribute("opacity", opacity.toString());
    this.svg.appendChild(glowPath);

    // Unutrašnje lasersko jezgro
    const corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    corePath.setAttribute("d", pathD);
    corePath.setAttribute("stroke", "#ffffff");
    corePath.setAttribute("stroke-width", "3.5");
    corePath.setAttribute("fill", "none");
    corePath.setAttribute("stroke-linecap", "round");
    this.svg.appendChild(corePath);
  }

  startWinCycle(index = 0) {
    if (!this.winningLines || this.winningLines.length <= 1) return;
    const currentWin = this.winningLines[index % this.winningLines.length];

    // Očisti prethodne linije
    this.svg.innerHTML = '';
    this.container.querySelectorAll('.symbol-box').forEach(el => {
      el.classList.add('symbol-dim');
      el.classList.remove('symbol-win', 'symbol-line-active');
    });

    // Nacrtaj samo ovu liniju
    this.drawSinglePath(currentWin.line.coords, currentWin.line.color, 1);

    // Osvetli samo simbole ove linije
    currentWin.matchedCoords.forEach(([c, r]) => {
      const reel = this.reels[c];
      if (reel && reel.tapeEl.children[r]) {
        const symBox = reel.tapeEl.children[r];
        symBox.classList.remove('symbol-dim');
        symBox.classList.add('symbol-win', 'symbol-line-active');
      }
    });

    if (this.onLineDisplayed) {
      this.onLineDisplayed(currentWin, (index % this.winningLines.length) + 1, this.winningLines.length);
    }

    // Prelazak na sledeću liniju
    this.winCycleTimer = setTimeout(() => {
      this.startWinCycle(index + 1);
    }, 1100);
  }

  stopWinCycle() {
    if (this.winCycleTimer) {
      clearTimeout(this.winCycleTimer);
      this.winCycleTimer = null;
    }
  }

  calculatePathString(coords) {
    const totalCols = this.cols;
    const totalRows = this.rows;

    const width = this.svg.clientWidth || this.container.clientWidth || 300;
    const height = this.svg.clientHeight || this.container.clientHeight || 200;

    const colStep = width / totalCols;
    const halfCol = colStep / 2;

    const rowStep = height / totalRows;
    const halfRow = rowStep / 2;

    const points = coords.map(([c, r]) => {
      const x = Math.round((c * colStep) + halfCol);
      const y = Math.round((r * rowStep) + halfRow);
      return `${x} ${y}`;
    });

    return `M ${points.join(' L ')}`;
  }

  // Animira eksploziju dobitnih simbola i uletanje novih odozgo
  animateCascade(explodedCoords, newGrid, onComplete) {
    // 1. Zvuk i vizuelna eksplozija dobitnih simbola
    Sound.playCascadeExplosion();
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 220);

    explodedCoords.forEach(([c, r]) => {
      const reel = this.reels[c];
      if (reel && reel.tapeEl.children[r]) {
        reel.tapeEl.children[r].classList.add('symbol-explode');
      }
    });

    // 2. Nakon eksplozije (350ms), postavljamo novu mrežu sa drop-in efektom
    setTimeout(() => {
      this.clearWinningEffects();
      this.gridState = newGrid;

      this.reels.forEach((reel, c) => {
        reel.tapeEl.innerHTML = '';
        newGrid[c].forEach(sym => {
          const box = document.createElement('div');
          box.className = `symbol-box ${sym.cls} symbol-drop-in`;
          const mult = sym.wildMultiplier || 1;
          box.innerHTML = sym.svg(mult);
          reel.tapeEl.appendChild(box);
        });
      });

      // 3. Pozivamo onComplete kada novi simboli padnu na svoje mesto
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
    }, 360);
  }
}
