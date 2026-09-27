// SlotMachine Glavni Kontroler & UI Binds
class SlotMachineApp {
  constructor() {
    this.currentMachineId = SlotConfig.defaultMachine || 'classic-3';
    this.currentMachine = SlotConfig.machines[this.currentMachineId];
    this.currentMode = this.currentMachine.cols; // 3 ili 5
    this.balance = SlotConfig.startingBalance;
    this.currentBet = SlotConfig.minBet;
    this.lastWin = 0;
    this.isSpinning = false;
    this.multiplier = 1;
    this.cascadeStep = 0;

    // Free Spins State (Sticky Multiplier)
    this.freeSpinsActive = false;
    this.freeSpinsRemaining = 0;
    this.freeSpinsTotalWin = 0;

    // Turbo & Autospin State
    this.isTurbo = false;
    this.autoSpinCount = 0;

    // Big Win Ticker State
    this.bigWinRolling = false;
    this.bigWinTarget = 0;
    this.bigWinCurrent = 0;
    this.bigWinInterval = null;
    this.bigWinCallback = null;

    // Komponente
    this.reelContainer = document.getElementById('reels-container');
    this.paylineSvg = document.getElementById('payline-svg');
    this.reels = new ReelEngine(this.reelContainer, this.paylineSvg);
    this.jackpotManager = new JackpotManager(SlotConfig.jackpots);
    this.bonusManager = new BonusManager(this);
    this.questManager = new QuestManager(this);

    // Elementi UI za Lobby i Igru
    this.lobbyView = document.getElementById('lobby-view');
    this.slotGameView = document.getElementById('slot-game-view');
    this.lobbyGrid = document.getElementById('lobby-machines-grid');
    this.lobbyBalanceEl = document.getElementById('lobby-balance');
    this.lobbyLevelEl = document.getElementById('lobby-level');

    this.activeTitleEl = document.getElementById('active-machine-title');
    this.activeBadgeEl = document.getElementById('active-machine-badge');
    this.machineLinesEl = document.getElementById('machine-lines-count');

    this.balanceEl = document.getElementById('balance');
    this.lastWinEl = document.getElementById('last-win');
    this.betEl = document.getElementById('bet-amount');
    this.spinBtn = document.getElementById('spin-btn');
    this.gambleBtn = document.getElementById('gamble-btn');
    this.msgEl = document.getElementById('message');
    this.betContainer = document.getElementById('bet-control-container');
    this.multiplierEl = document.getElementById('current-multiplier');
    this.multiplierBox = document.getElementById('multiplier-box');
    this.freeSpinsBanner = document.getElementById('free-spins-banner');
    this.freeSpinsLeftEl = document.getElementById('free-spins-left');
    this.turboBtn = document.getElementById('turbo-btn');
    this.autospinBtn = document.getElementById('autospin-btn');
    this.autospinText = document.getElementById('autospin-text');
    this.bigWinModal = document.getElementById('big-win-ticker-modal');
    this.bigWinTitleEl = document.getElementById('big-win-tier-title');
    this.bigWinCounterEl = document.getElementById('big-win-rolling-counter');
  }

  init() {
    // Inicijalizacija jackpotova
    this.jackpotManager.init((jackpot, prize) => {
      this.bonusManager.openRoulette(jackpot, prize);
    });

    // Inicijalizacija sistema zadataka i tema
    this.questManager.init();

    // Renderovanje Lobby ponude aparata
    this.renderLobby();

    this.updateUI();
    this.initBackgroundParticles();
    this.registerPWA();
    this.bindEvents();
  }

  // Renderovanje kartica slot kabineta u predvorju
  renderLobby() {
    if (!this.lobbyGrid) return;
    this.lobbyGrid.innerHTML = '';

    Object.values(SlotConfig.machines).forEach(machine => {
      const card = document.createElement('div');
      card.className = 'lobby-cabinet-card';
      card.style.setProperty('--card-glow', machine.color);

      // Mini preview ikonica voćkica
      const previewSymbols = machine.cols === 3 
        ? [SlotSymbols.seven.svg(), SlotSymbols.cherry.svg(), SlotSymbols.bell.svg()]
        : [SlotSymbols.wild.svg(), SlotSymbols.seven.svg(), SlotSymbols.grapes.svg(), SlotSymbols.scatter.svg()];

      card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <span class="cabinet-badge" style="color: ${machine.color}; border-color: ${machine.color};">${machine.badge}</span>
          <span class="text-xs text-yellow-400 font-mono">${machine.volatilityStars}</span>
        </div>

        <h3 class="text-lg md:text-xl font-black text-white mb-0.5 tracking-wide">${machine.name}</h3>
        <p class="text-[11px] font-bold text-gray-400 tracking-wider mb-3">${machine.subtitle}</p>

        <!-- Preview Simbola u kabinetu -->
        <div class="flex justify-center gap-2 my-2 py-3 bg-black/50 rounded-xl border border-gray-800">
          ${previewSymbols.map(s => `<div class="w-10 h-10 flex items-center justify-center">${s}</div>`).join('')}
        </div>

        <p class="text-xs text-gray-400 mb-4 line-clamp-2">${machine.description}</p>

        <div class="flex items-center justify-between text-[11px] text-gray-400 mb-4 border-t border-gray-800 pt-2 font-mono">
          <span>VOLATILITY:</span>
          <span class="text-white font-bold">${machine.volatility}</span>
        </div>

        <button class="cabinet-play-btn w-full cursor-pointer uppercase font-black">
          PLAY CABINET ➔
        </button>
      `;

      card.addEventListener('click', () => {
        this.selectMachine(machine.id);
      });

      this.lobbyGrid.appendChild(card);
    });

    if (this.lobbyBalanceEl) this.lobbyBalanceEl.innerText = Math.floor(this.balance);
    if (this.lobbyLevelEl) this.lobbyLevelEl.innerText = `LEVEL ${this.questManager.state.level}`;
  }

  // Ulazak u izabrani slot aparat iz Lobby-ja
  selectMachine(machineId) {
    const machine = SlotConfig.machines[machineId];
    if (!machine) return;

    this.currentMachineId = machineId;
    this.currentMachine = machine;
    this.currentMode = machine.cols;

    // Prilagođavanje širine CSS koluta
    if (this.currentMode === 5) {
      document.body.classList.add('mode-5-reels');
    } else {
      document.body.classList.remove('mode-5-reels');
    }

    // Ažuriranje koluta i mašine
    this.reels.setReelCount(this.currentMode, 3);

    // Postavljanje naslova i bedževa u igri
    if (this.activeTitleEl) this.activeTitleEl.innerText = machine.name.toUpperCase();
    if (this.activeBadgeEl) this.activeBadgeEl.innerText = `${machine.cols} REELS • ${machine.paylines.length} LINES`;
    if (this.machineLinesEl) this.machineLinesEl.innerText = `${machine.paylines.length} LINES`;

    // Prelaz sa Lobby na Slot Igru
    if (this.lobbyView) this.lobbyView.classList.add('hidden');
    if (this.slotGameView) {
      this.slotGameView.classList.remove('hidden');
      this.slotGameView.classList.add('flex');
    }

    this.setMessage(`WELCOME TO ${machine.name.toUpperCase()}!`, 'text-cyan-400 font-bold');
    Sound.playClick();
  }

  // Povratak u Lobby
  showLobby() {
    if (this.isSpinning) {
      this.setMessage("PLEASE WAIT FOR SPIN TO FINISH!", "text-yellow-400");
      return;
    }

    // Zaustavi autospin ako je aktivan
    if (this.autoSpinCount > 0) {
      this.autoSpinCount = 0;
      this.autospinText.innerText = "AUTO";
      this.autospinBtn.classList.remove('speed-btn-active');
    }

    if (this.slotGameView) {
      this.slotGameView.classList.add('hidden');
      this.slotGameView.classList.remove('flex');
    }
    if (this.lobbyView) {
      this.lobbyView.classList.remove('hidden');
    }

    this.renderLobby();
    Sound.playClick();
  }

  changeBet(delta) {
    if (this.isSpinning) return;
    const newBet = this.currentBet + delta;
    if (newBet >= SlotConfig.minBet && newBet <= Math.min(this.balance, SlotConfig.maxBet)) {
      this.currentBet = newBet;
      this.betEl.innerText = this.currentBet;

      // Vizuelni flash
      this.betContainer.classList.remove('bet-flash-green', 'bet-flash-red');
      void this.betContainer.offsetWidth;
      if (delta > 0) {
        this.betContainer.classList.add('bet-flash-green');
      } else {
        this.betContainer.classList.add('bet-flash-red');
      }
      setTimeout(() => this.betContainer.classList.remove('bet-flash-green', 'bet-flash-red'), 300);
      Sound.playClick();
    }
  }

  spin() {
    if (this.isSpinning) {
      this.reels.stopAll();
      return;
    }

    // Ako NISU aktivni besplatni spinovi, proveravamo i skidamo ulog
    if (!this.freeSpinsActive) {
      if (this.balance < this.currentBet) {
        this.setMessage("INSUFFICIENT CREDITS!", "text-red-500 font-bold");
        return;
      }
      this.balance -= this.currentBet;
      this.multiplier = 1; // resetujemo multiplikator samo u regularnoj igri
    } else {
      // U Free Spins režimu, multiplikator je STICKY (ne resetuje se na 1!)
      this.freeSpinsRemaining--;
      if (this.freeSpinsLeftEl) this.freeSpinsLeftEl.innerText = this.freeSpinsRemaining;
    }

    this.lastWin = 0;
    this.updateUI();
    this.lastWinEl.innerText = "0";
    this.gambleBtn.classList.add('hidden');
    this.isSpinning = true;
    this.cascadeStep = 0;
    this.updateMultiplierUI();

    // Notifikacija za nivo i zadatke
    this.questManager.onSpinPlayed();

    // Jackpot doprinos po spinu
    this.jackpotManager.processBet(this.currentBet, 1);

    // Audio
    Sound.playSpinStart();

    // UI stanje dugmeta
    this.spinBtn.innerText = "STOP";
    this.spinBtn.classList.add('bg-red-900/50');
    this.spinBtn.classList.remove('btn-glow');
    
    if (this.freeSpinsActive) {
      this.setMessage(`FREE SPINS REMAINING: ${this.freeSpinsRemaining}`, "text-cyan-400 font-bold animate-pulse");
    } else {
      this.setMessage("STOP REELS!", "text-yellow-400 animate-pulse");
    }

    // Matematika: generisanje ciljnog rasporeda za trenutni broj koluta
    let targetGrid = SlotMath.generateSpinResult(this.currentMode, 3);

    // SPECIAL MYSTERY EVENT: 8% šanse za Neon Lightning Expanding Wild
    const triggerLightning = Math.random() < 0.08 && !this.freeSpinsActive;
    if (triggerLightning) {
      const luckyCol = Math.floor(Math.random() * this.currentMode);
      for (let r = 0; r < 3; r++) {
        targetGrid[luckyCol][r] = SlotSymbols.wild;
      }
      setTimeout(() => {
        Sound.playLightningStrike();
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        this.reelContainer.appendChild(flash);
        setTimeout(() => flash.remove(), 450);
        this.setMessage("⚡ NEON LIGHTNING! EXPANDING WILD! ⚡", "text-cyan-300 font-black animate-pulse");
      }, this.isTurbo ? 200 : 700);
    }

    // Pokretanje vizuelnog spina (sa turbo podrškom)
    this.reels.startSpin(targetGrid, () => {
      this.handleCascadeStep(targetGrid);
    }, this.isTurbo);
  }

  // Rekurzivni kaskadni korak
  handleCascadeStep(currentGrid) {
    const paylines = (this.currentMachine && this.currentMachine.paylines) || SlotConfig.machines['classic-3'].paylines;
    const result = SlotMath.evaluateWins(currentGrid, paylines, this.currentBet);

    // 1. Provera za Free Spins (3+ Scatter simbola)
    if (result.freeSpinsTriggered && this.cascadeStep === 0 && !this.freeSpinsActive) {
      this.isSpinning = false;
      this.spinBtn.innerText = "SPIN";
      this.spinBtn.classList.remove('bg-red-900/50');
      this.startFreeSpinsMode();
      return;
    }

    // 2. Provera za Super Bonus Shooter (3+ Bonus simbola)
    if (result.bonusTriggered && this.cascadeStep === 0) {
      this.isSpinning = false;
      this.spinBtn.innerText = "SPIN";
      this.spinBtn.classList.remove('bg-red-900/50');
      this.setMessage("SUPER SHOOTER BONUS!", "text-red-500 font-bold animate-pulse");
      setTimeout(() => {
        this.bonusManager.startShooterGame(this.currentBet);
      }, 700);
      return;
    }

    if (result.totalWin > 0) {
      // Izračunaj dobitak sa trenutnim kaskadnim multiplikatorom
      const multipliedWin = result.totalWin * this.multiplier;
      this.lastWin += multipliedWin;
      this.balance += multipliedWin;
      if (this.freeSpinsActive) {
        this.freeSpinsTotalWin += multipliedWin;
      }
      this.updateUI();
      this.lastWinEl.innerText = this.lastWin;

      // Zvuk dobitka i highlight
      this.reels.drawWins(result.winningLines);
      const isBigWin = multipliedWin >= this.currentBet * 4;
      Sound.playWin(isBigWin);

      if (typeof confetti === 'function' && isBigWin) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }

      this.setMessage(`CASCADE! WIN: ${multipliedWin} (${this.multiplier}x)`, "text-yellow-400 font-bold animate-pulse");
      this.questManager.onCascadeTriggered(this.multiplier);

      // Skupi sve koordinate dobitnih simbola koji eksplodiraju
      const explodedCoordsMap = new Map();
      result.winningLines.forEach(w => {
        w.matchedCoords.forEach(c => explodedCoordsMap.set(`${c[0]},${c[1]}`, c));
      });
      const explodedCoords = Array.from(explodedCoordsMap.values());

      // Povećaj multiplikator za sledeću kaskadu (1x -> 2x -> 3x -> 5x -> 10x -> 15x -> 20x -> 25x)
      this.cascadeStep++;
      const multiplierSteps = [1, 2, 3, 5, 10, 15, 20, 25, 30];
      const curIdx = multiplierSteps.indexOf(this.multiplier);
      if (curIdx >= 0 && curIdx < multiplierSteps.length - 1) {
        this.multiplier = multiplierSteps[curIdx + 1];
      } else if (curIdx === -1) {
        this.multiplier = Math.min(50, this.multiplier + 2);
      }

      // Zakaži eksploziju i pad novih simbola (brže ako je turbo)
      const cascadeDelay = this.isTurbo ? 450 : 950;
      setTimeout(() => {
        this.updateMultiplierUI(true);
        const nextGrid = SlotMath.cascadeGrid(currentGrid, explodedCoords);
        this.reels.animateCascade(explodedCoords, nextGrid, () => {
          this.handleCascadeStep(nextGrid);
        });
      }, cascadeDelay);

    } else {
      // Nema više kaskada - kraj spina
      this.isSpinning = false;
      this.spinBtn.innerText = "SPIN";
      this.spinBtn.classList.remove('bg-red-900/50');

      const onSpinFinished = () => {
        if (this.lastWin > 0) {
          this.setMessage(`WIN: ${this.lastWin}!`, "text-yellow-300 font-bold");
          this.questManager.onWinRecorded(this.lastWin);
          if (!this.freeSpinsActive && this.autoSpinCount === 0) {
            this.gambleBtn.classList.remove('hidden');
          }
          this.jackpotManager.processBet(this.currentBet, 2);
        } else {
          this.setMessage(this.freeSpinsActive ? "FREE SPIN NO WIN" : "SPIN AGAIN", "text-gray-500");
          this.spinBtn.classList.add('btn-glow');
        }

        this.jackpotManager.checkDrops();

        // 1. Ako su aktivni Free Spins
        if (this.freeSpinsActive) {
          if (this.freeSpinsRemaining > 0) {
            setTimeout(() => {
              this.spin();
            }, this.isTurbo ? 500 : 1200);
          } else {
            setTimeout(() => {
              this.endFreeSpinsMode();
            }, 1000);
          }
        } 
        // 2. Ako je aktivan Autospin u regularnoj igri
        else if (this.autoSpinCount > 0) {
          this.autoSpinCount--;
          this.updateAutospinUI();
          if (this.autoSpinCount > 0 && this.balance >= this.currentBet) {
            setTimeout(() => {
              this.spin();
            }, this.isTurbo ? 400 : 1000);
          } else {
            this.stopAutospin();
          }
        }
      };

      // Provera za Big Win Ticker Rollup (ako je dobitak >= 15x ulog)
      if (this.lastWin >= this.currentBet * 15) {
        this.triggerBigWinTicker(this.lastWin, onSpinFinished);
      } else {
        onSpinFinished();
      }
    }
  }

  startFreeSpinsMode() {
    this.freeSpinsActive = true;
    this.freeSpinsRemaining = 10;
    this.freeSpinsTotalWin = 0;
    // Multiplikator startuje na 1 ili trenutnom i postaje STICKY (nikad ne opada!)
    this.multiplier = Math.max(1, this.multiplier);

    document.body.classList.add('free-spins-active');
    if (this.freeSpinsBanner) this.freeSpinsBanner.classList.remove('hidden');
    if (this.modeSelectorContainer) this.modeSelectorContainer.classList.add('hidden');
    if (this.freeSpinsLeftEl) this.freeSpinsLeftEl.innerText = this.freeSpinsRemaining;

    Sound.playBonusTrigger();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#00ffff', '#ff00de', '#ffd700'] });
    }

    this.showFinalModal("10 FREE SPINS WON!", "STICKY MULTIPLIER ACTIVE");
    setTimeout(() => {
      this.closeFinalModal();
      this.spin();
    }, 2800);
  }

  endFreeSpinsMode() {
    this.freeSpinsActive = false;
    document.body.classList.remove('free-spins-active');
    if (this.freeSpinsBanner) this.freeSpinsBanner.classList.add('hidden');
    if (this.modeSelectorContainer) this.modeSelectorContainer.classList.remove('hidden');

    this.showFinalModal("FREE SPINS COMPLETED!", this.freeSpinsTotalWin);
    this.multiplier = 1;
    this.updateMultiplierUI();
    Sound.playWin(true);
  }

  updateMultiplierUI(pulse = false) {
    if (this.multiplierEl) {
      this.multiplierEl.innerText = `x${this.multiplier}`;
    }
    if (this.multiplierBox) {
      if (this.multiplier > 1) {
        this.multiplierBox.classList.add('mult-active');
      } else {
        this.multiplierBox.classList.remove('mult-active');
      }
    }
    if (pulse) {
      Sound.playMultiplierRise(this.multiplier);
    }
  }

  // --- BIG WIN TICKER ROLLUP ---
  triggerBigWinTicker(totalWin, onComplete) {
    this.bigWinRolling = true;
    this.bigWinTarget = totalWin;
    this.bigWinCurrent = 0;
    this.bigWinCallback = onComplete;

    const ratio = totalWin / this.currentBet;
    let title = "BIG WIN!";
    let colorClass = "text-yellow-400";
    if (ratio >= 60) {
      title = "LEGENDARY WIN!";
      colorClass = "text-fuchsia-400";
    } else if (ratio >= 30) {
      title = "MEGA WIN!";
      colorClass = "text-cyan-400";
    }

    if (this.bigWinTitleEl) {
      this.bigWinTitleEl.innerText = title;
      this.bigWinTitleEl.className = `ticker-title ${colorClass} mb-2`;
    }
    if (this.bigWinCounterEl) {
      this.bigWinCounterEl.innerText = "0";
      this.bigWinCounterEl.className = `ticker-counter ${colorClass} mb-4`;
    }
    if (this.bigWinModal) {
      this.bigWinModal.style.display = 'flex';
    }

    if (typeof confetti === 'function') {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    }

    // Trajanje roll-up animacije: ~3.5 sekunde
    const duration = 3500;
    const intervalTime = 40;
    const steps = duration / intervalTime;
    const increment = totalWin / steps;
    let tickCount = 0;

    this.bigWinInterval = setInterval(() => {
      this.bigWinCurrent += increment;
      tickCount++;
      if (this.bigWinCurrent >= this.bigWinTarget) {
        this.bigWinCurrent = this.bigWinTarget;
        if (this.bigWinCounterEl) this.bigWinCounterEl.innerText = Math.floor(this.bigWinCurrent);
        clearInterval(this.bigWinInterval);
        Sound.playWin(true);
        setTimeout(() => this.closeBigWinTicker(), 1400);
      } else {
        if (this.bigWinCounterEl) this.bigWinCounterEl.innerText = Math.floor(this.bigWinCurrent);
        // Ticking audio koji raste po frekvenciji
        const pitch = 250 + (tickCount * 6);
        Sound.playRollupTick(pitch);
      }
    }, intervalTime);
  }

  fastForwardBigWin() {
    if (!this.bigWinRolling) return;
    clearInterval(this.bigWinInterval);
    this.bigWinCurrent = this.bigWinTarget;
    if (this.bigWinCounterEl) this.bigWinCounterEl.innerText = Math.floor(this.bigWinCurrent);
    Sound.playWin(true);
    setTimeout(() => this.closeBigWinTicker(), 500);
  }

  closeBigWinTicker() {
    this.bigWinRolling = false;
    if (this.bigWinModal) this.bigWinModal.style.display = 'none';
    if (this.bigWinCallback) {
      const cb = this.bigWinCallback;
      this.bigWinCallback = null;
      cb();
    }
  }

  // --- TURBO & AUTOSPIN LOGIKA ---
  toggleTurbo() {
    this.isTurbo = !this.isTurbo;
    if (this.turboBtn) {
      this.turboBtn.classList.toggle('speed-btn-active', this.isTurbo);
    }
    this.setMessage(this.isTurbo ? "⚡ TURBO MODE ON" : "TURBO OFF", "text-yellow-400");
    Sound.playClick();
  }

  toggleAutospin() {
    if (this.autoSpinCount > 0) {
      this.stopAutospin();
    } else {
      // Biranje 25 autospinova po defaultu
      this.autoSpinCount = 25;
      this.updateAutospinUI();
      this.setMessage("AUTOSPIN (25) STARTED", "text-cyan-400 font-bold");
      if (!this.isSpinning) {
        this.spin();
      }
    }
    Sound.playClick();
  }

  stopAutospin() {
    this.autoSpinCount = 0;
    this.updateAutospinUI();
    this.setMessage("AUTOSPIN STOPPED", "text-gray-400");
  }

  updateAutospinUI() {
    if (this.autospinBtn) {
      this.autospinBtn.classList.toggle('speed-btn-active', this.autoSpinCount > 0);
    }
    if (this.autospinText) {
      this.autospinText.innerText = this.autoSpinCount > 0 ? `${this.autoSpinCount}` : "AUTO";
    }
  }

  addBonusWin(amount, title = 'SHOOTER BONUS') {
    this.lastWin = amount;
    this.balance += amount;
    this.updateUI();
    if (this.lastWinEl) this.lastWinEl.innerText = amount;
    this.questManager.onWinRecorded(amount);
    this.showFinalModal(title, amount);
    Sound.playWin(true);
  }

  addJackpotWin(amount, title) {
    this.lastWin = amount;
    this.balance += amount;
    this.updateUI();
    if (this.lastWinEl) this.lastWinEl.innerText = amount;
    this.questManager.onWinRecorded(amount);
    this.showFinalModal(title, amount);
    Sound.playWin(true);
  }

  showFinalModal(title, amount) {
    const modal = document.getElementById('final-win-modal');
    const titleEl = document.getElementById('final-win-title');
    const amtEl = document.getElementById('final-win-amount');
    if (titleEl) titleEl.innerText = title;
    if (amtEl) amtEl.innerText = typeof amount === 'number' ? amount.toFixed(2) : amount;
    if (modal) modal.style.display = 'flex';
    if (typeof confetti === 'function') {
      confetti({ particleCount: 300, spread: 100, origin: { y: 0.5 } });
    }
  }

  closeFinalModal() {
    const modal = document.getElementById('final-win-modal');
    if (modal) modal.style.display = 'none';
  }

  onGambleCollect(amount) {
    this.gambleBtn.classList.add('hidden');
    this.setMessage(`COLLECTED: ${amount}`, "text-green-400 font-bold");
  }

  onGambleLost() {
    this.balance -= this.lastWin;
    if (this.balance < 0) this.balance = 0;
    this.lastWin = 0;
    this.updateUI();
    this.lastWinEl.innerText = "0";
    this.gambleBtn.classList.add('hidden');
    this.setMessage("GAMBLE LOST", "text-red-500 font-bold");
  }

  updateUI() {
    if (this.balanceEl) this.balanceEl.innerText = Math.floor(this.balance);
    if (this.lobbyBalanceEl) this.lobbyBalanceEl.innerText = Math.floor(this.balance);
  }

  setMessage(msg, cls) {
    this.msgEl.className = "h-5 text-center font-bold text-xs md:text-sm tracking-widest truncate w-full " + cls;
    this.msgEl.innerText = msg;
  }

  initBackgroundParticles() {
    const canvas = document.getElementById('synthwave-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Zvezdano nebo
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.65),
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005
      });
    }

    let gridOffset = 0;
    const horizon = height * 0.55;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Duboki noćni cyberpunk gradijent
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
      skyGrad.addColorStop(0, '#020005');
      skyGrad.addColorStop(0.7, '#0b0014');
      skyGrad.addColorStop(1, '#25002b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizon);

      // 2. Crtaj trepereće zvezde
      stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Synthwave Neonsko Sunce na horizontu
      const sunRadius = Math.min(width * 0.22, 110);
      const sunGrad = ctx.createLinearGradient(width / 2, horizon - sunRadius, width / 2, horizon);
      sunGrad.addColorStop(0, '#ffff00');
      sunGrad.addColorStop(0.5, '#ff00de');
      sunGrad.addColorStop(1, '#ff0055');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width / 2, horizon, sunRadius, Math.PI, 0, false);
      ctx.fill();

      // 4. Synthwave 3D Podna Mreža (Outrun Perspective Grid)
      const floorGrad = ctx.createLinearGradient(0, horizon, 0, height);
      floorGrad.addColorStop(0, '#05000a');
      floorGrad.addColorStop(1, '#000000');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizon, width, height - horizon);

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.22)';
      ctx.lineWidth = 1.2;

      // Perspektivne linije iz centra horizonta
      const fovLines = 24;
      for (let i = -fovLines; i <= fovLines; i++) {
        const xAtBottom = (width / 2) + (i * (width / fovLines) * 2.2);
        ctx.beginPath();
        ctx.moveTo(width / 2, horizon);
        ctx.lineTo(xAtBottom, height);
        ctx.stroke();
      }

      // Horizontalne linije koje se kreću napred (brže dok se kolutovi vrte)
      gridOffset += this.isSpinning ? 2.5 : 0.6;
      if (gridOffset > 40) gridOffset = 0;

      for (let y = 0; y < 14; y++) {
        const progress = (y + (gridOffset / 40)) / 14;
        const lineY = horizon + Math.pow(progress, 2.2) * (height - horizon);
        const alpha = progress * 0.35;
        ctx.strokeStyle = `rgba(255, 0, 222, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }
      ctx.restore();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  registerPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    }

    // Rukovanje automatskim zahtevom za instalaciju (beforeinstallprompt)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Spreči podrazumevani mini-infobar pregledača
      e.preventDefault();
      this.deferredPrompt = e;

      // Prikaz prilagođenog neonskog install banera
      const banner = document.getElementById('pwa-install-banner');
      if (banner && !sessionStorage.getItem('pwa_prompt_dismissed')) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
      }

      const installBtn = document.getElementById('pwa-install-btn');
      const dismissBtn = document.getElementById('pwa-dismiss-btn');

      installBtn?.addEventListener('click', async () => {
        if (!this.deferredPrompt) return;
        banner?.classList.add('hidden');
        // Pokretanje nativnog install dijaloga
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          this.setMessage("INSTALLING NEON NIGHTS...", "text-green-400 font-bold");
        }
        this.deferredPrompt = null;
      });

      dismissBtn?.addEventListener('click', () => {
        banner?.classList.add('hidden');
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
      });
    });

    // Sakrij baner čim se aplikacija instalira
    window.addEventListener('appinstalled', () => {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('hidden');
      this.deferredPrompt = null;
      this.setMessage("APP INSTALLED SUCCESSFULLY!", "text-cyan-400 font-bold");
    });
  }

  bindEvents() {
    // Info modal
    document.getElementById('open-info-btn')?.addEventListener('click', () => {
      document.getElementById('info-modal').style.display = 'flex';
      Sound.playClick();
    });
    document.getElementById('close-info-btn')?.addEventListener('click', () => {
      document.getElementById('info-modal').style.display = 'none';
    });

    // Quests modal
    document.getElementById('open-quests-btn')?.addEventListener('click', () => {
      document.getElementById('quests-modal').style.display = 'flex';
      this.questManager.renderUI();
      Sound.playClick();
    });
    document.getElementById('close-quests-btn')?.addEventListener('click', () => {
      document.getElementById('quests-modal').style.display = 'none';
    });

    // Mute zvuk toggle with neon SVG
    document.getElementById('sound-toggle-btn')?.addEventListener('click', () => {
      const isMuted = !Sound.toggle();
      const soundIcon = document.getElementById('sound-icon');
      const soundBtn = document.getElementById('sound-toggle-btn');
      if (isMuted) {
        if (soundIcon) {
          soundIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.3"></polygon>
            <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"></line>
            <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"></line>
          `;
        }
        if (soundBtn) {
          soundBtn.classList.add('opacity-40');
          soundBtn.classList.remove('border-cyan-400');
        }
      } else {
        if (soundIcon) {
          soundIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.3"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          `;
        }
        if (soundBtn) {
          soundBtn.classList.remove('opacity-40');
          soundBtn.classList.add('border-cyan-400');
        }
      }
    });

    // Final Win modal OK
    document.getElementById('final-modal-ok-btn')?.addEventListener('click', () => {
      this.closeFinalModal();
    });

    // Turbo & Autospin
    document.getElementById('turbo-btn')?.addEventListener('click', () => {
      this.toggleTurbo();
    });
    document.getElementById('autospin-btn')?.addEventListener('click', () => {
      this.toggleAutospin();
    });

    // Spin Roulette dugme
    document.getElementById('spin-roulette-btn')?.addEventListener('click', () => {
      this.bonusManager.spinRouletteWheel();
    });
  }
}

// Inicijalizacija pri učitavanju
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new SlotMachineApp();
  app.init();
});
