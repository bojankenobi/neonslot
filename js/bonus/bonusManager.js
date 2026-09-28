// Bonus Manager: Shooter Mini-Game, Rulet Točak & Gamble (Crveno/Crno)
class BonusManager {
  constructor(slotMachine) {
    this.slot = slotMachine;
    this.shooterActive = false;
    this.shooterScore = 0;
    this.spawnTimer = null;
    this.endTimer = null;
    this.currentPendingJackpot = 0;
    this.currentGambleAmount = 0;

    this.rouletteSegments = [
      { label: 'x1.5', bg: '#0d0f22', glow: '#00ffff', text: '#00ffff', val: 1.5, badge: 'NICE' },
      { label: 'x3',   bg: '#25002b', glow: '#ff00de', text: '#ff00de', val: 3,   badge: 'SUPER' },
      { label: 'x1',   bg: '#0a0a14', glow: '#666688', text: '#aaaaaa', val: 1,   badge: 'BASE' },
      { label: 'x5',   bg: '#251b00', glow: '#ffd700', text: '#ffd700', val: 5,   badge: 'MEGA' },
      { label: 'x2',   bg: '#00241b', glow: '#00ffcc', text: '#00ffcc', val: 2,   badge: 'DOUBLE' },
      { label: 'x1',   bg: '#0a0a14', glow: '#666688', text: '#aaaaaa', val: 1,   badge: 'BASE' },
      { label: 'x10',  bg: '#2e001f', glow: '#ff0055', text: '#ff0055', val: 10,  badge: 'ULTRA' },
      { label: 'x2.5', bg: '#002626', glow: '#00ffff', text: '#00ffff', val: 2.5, badge: 'TRIPLE' },
      { label: 'x1',   bg: '#0a0a14', glow: '#666688', text: '#aaaaaa', val: 1,   badge: 'BASE' },
      { label: 'x20',  bg: '#332000', glow: '#ffd700', text: '#ffffff', val: 20,  badge: '★ JACKPOT ★' }
    ];

    this.wheelSpinning = false;
    this.wheelRotationDeg = 0;
    this.initRouletteWheel();
  }

  // --- ROULETTE JACKPOT WHEEL ---
  initRouletteWheel() {
    const canvas = document.getElementById('roulette-wheel');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width || 400;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);
    const numSegments = this.rouletteSegments.length;
    const arc = (Math.PI * 2) / numSegments;

    // 1. Spoljni neonski prsten
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#05000a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffd700';
    ctx.stroke();

    for (let i = 0; i < numSegments; i++) {
      const seg = this.rouletteSegments[i];
      const startAngle = i * arc - (Math.PI / 2);
      const endAngle = startAngle + arc;

      // Segment wedge sa radijalnim gradijentom
      const grad = ctx.createRadialGradient(center, center, 20, center, center, radius);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.5, seg.bg);
      grad.addColorStop(1, '#05020c');

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius - 4, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Granica segmenta
      ctx.lineWidth = 2;
      ctx.strokeStyle = seg.glow;
      ctx.stroke();

      // Metalni klinac (Peg) na obodu svakog segmenta
      const pegAngle = startAngle;
      const pegX = center + (radius - 12) * Math.cos(pegAngle);
      const pegY = center + (radius - 12) * Math.sin(pegAngle);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Tekst i bedž segmenta
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arc / 2);

      // Tekst multiplikatora (npr. x20, x10)
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.text;
      ctx.font = seg.val >= 10 ? "900 24px 'Orbitron', sans-serif" : "900 21px 'Orbitron', sans-serif";
      ctx.shadowColor = seg.glow;
      ctx.shadowBlur = 15;
      ctx.fillText(seg.label, radius - 26, 8);

      // Mini oznaka / Bedž (npr. JACKPOT, ULTRA)
      ctx.font = "bold 9px 'Orbitron', sans-serif";
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.fillText(seg.badge, radius - 28, -14);

      ctx.restore();
    }

    // Unutrašnji ukrasni prsten
    ctx.beginPath();
    ctx.arc(center, center, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0014';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  openRoulette(jackpot, baseAmount) {
    this.currentPendingJackpot = baseAmount;
    this.wheelSpinning = false;
    this.wheelRotationDeg = 0;

    const modal = document.getElementById('roulette-modal');
    const guaranteedEl = document.getElementById('roulette-guaranteed');
    const tierNameEl = document.getElementById('roulette-tier-name');
    const statusMsg = document.getElementById('roulette-status-msg');
    const rotator = document.getElementById('wheel-rotator');
    const btn = document.getElementById('spin-roulette-btn');
    const pointer = document.getElementById('roulette-pointer');

    if (guaranteedEl) guaranteedEl.innerText = Math.floor(baseAmount);
    if (tierNameEl) tierNameEl.innerText = (jackpot ? jackpot.name : 'MEGA') + ' WHEEL';
    if (statusMsg) {
      statusMsg.innerText = "SPIN TO MULTIPLY YOUR JACKPOT!";
      statusMsg.className = "z-10 h-6 text-center text-xs md:text-sm font-bold text-cyan-300 tracking-widest uppercase transition-all mb-2 animate-pulse";
    }

    if (rotator) {
      rotator.style.transform = 'rotate(0deg)';
      rotator.classList.remove('wheel-celebrate');
    }
    if (pointer) {
      pointer.classList.remove('suspense-wobble', 'peg-hit');
    }
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerText = "SPIN THE WHEEL";
    }

    if (modal) modal.style.display = 'flex';
    Sound.playBonusTrigger();
  }

  spinRouletteWheel() {
    if (this.wheelSpinning) return;
    this.wheelSpinning = true;

    const btn = document.getElementById('spin-roulette-btn');
    const rotator = document.getElementById('wheel-rotator');
    const statusMsg = document.getElementById('roulette-status-msg');
    const pointer = document.getElementById('roulette-pointer');

    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.innerText = "SPINNING...";
    }
    if (statusMsg) {
      statusMsg.innerText = "FEEL THE POWER... WHERE WILL IT LAND?";
      statusMsg.className = "z-10 h-6 text-center text-xs md:text-sm font-bold text-yellow-300 tracking-widest uppercase transition-all mb-2";
    }

    const numSegments = this.rouletteSegments.length;
    const degPerSegment = 360 / numSegments;

    // Random odabir pobedničkog segmenta sa blagim ponderisanjem
    // x20 i x10 su ređi ali potpuno dostižni
    let winningIndex;
    const roll = Math.random();
    if (roll < 0.08) {
      winningIndex = 9; // x20 JACKPOT!
    } else if (roll < 0.22) {
      winningIndex = 6; // x10 ULTRA!
    } else if (roll < 0.45) {
      winningIndex = 3; // x5 MEGA!
    } else {
      const rest = [0, 1, 2, 4, 5, 7, 8];
      winningIndex = rest[Math.floor(Math.random() * rest.length)];
    }

    // Izračunavanje tačnog ciljnog ugla tako da flapper na vrhu (0 deg) pokazuje na winningIndex
    // Segment i zauzima interval [i * degPerSegment, (i+1) * degPerSegment] relativno na vrh
    const segmentCenterDeg = (winningIndex * degPerSegment) + (degPerSegment / 2);
    // Margina unutar segmenta da se izbegne tačno na liniji
    const safetyMargin = (Math.random() * (degPerSegment * 0.6)) - (degPerSegment * 0.3);
    const targetDegOnWheel = (segmentCenterDeg + safetyMargin) % 360;

    // Rotiramo u smeru kazaljke na satu: 6 do 8 punih krugova + ugao koji postavlja taj segment pod kazaljku na vrhu
    const fullSpins = 7 * 360;
    const finalRotation = fullSpins + (360 - targetDegOnWheel);

    const startTime = performance.now();
    const duration = 6500; // 6.5 sekundi filmske neizvesnosti
    let lastPegIndex = -1;

    Sound.playSpinStart();

    const animateWheel = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Prilagođena funkcija usporavanja sa produženim "suspense creep" na kraju
      // Kombinacija cubic-out i quartic usporavanja
      let ease;
      if (progress < 0.8) {
        ease = 1 - Math.pow(1 - (progress / 0.8), 3);
        ease *= 0.88;
      } else {
        const p2 = (progress - 0.8) / 0.2;
        ease = 0.88 + (1 - Math.pow(1 - p2, 4)) * 0.12;
      }

      const currentDeg = finalRotation * ease;
      if (rotator) {
        rotator.style.transform = `rotate(${currentDeg}deg)`;
      }

      // Detekcija klika iglice o pinove (pegs)
      const currentWheelAngle = currentDeg % 360;
      const currentPeg = Math.floor(currentWheelAngle / degPerSegment);
      if (currentPeg !== lastPegIndex) {
        lastPegIndex = currentPeg;
        
        // Zvuk klika i animacija iglice
        if (pointer) {
          pointer.classList.remove('peg-hit');
          void pointer.offsetWidth;
          pointer.classList.add('peg-hit');
          setTimeout(() => pointer.classList.remove('peg-hit'), 40);
        }

        const tickPitch = Math.max(300, 850 - (progress * 500));
        Sound.playWheelTick(tickPitch);
      }

      // Drama i neizvesnost u poslednjoj sekundi (Suspense Phase)
      if (progress > 0.82 && progress < 0.98) {
        if (statusMsg) {
          statusMsg.innerText = "SLOWING DOWN... HOLD YOUR BREATH!";
          statusMsg.className = "z-10 h-6 text-center text-xs md:text-sm font-black text-pink-400 tracking-widest uppercase transition-all mb-2 animate-bounce";
        }
        if (pointer) {
          pointer.classList.add('suspense-wobble');
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animateWheel);
      } else {
        // Završen spin
        if (pointer) {
          pointer.classList.remove('suspense-wobble');
        }
        const winningSegment = this.rouletteSegments[winningIndex];
        const finalPrize = this.currentPendingJackpot * winningSegment.val;

        if (statusMsg) {
          statusMsg.innerText = `WINNER: ${winningSegment.label} MULTIPLIER! (${winningSegment.badge})`;
          statusMsg.className = "z-10 h-6 text-center text-xs md:text-sm font-black text-yellow-300 tracking-widest uppercase transition-all mb-2";
        }

        if (rotator) {
          rotator.classList.add('wheel-celebrate');
        }

        Sound.playWin(winningSegment.val >= 3);
        if (typeof confetti === 'function') {
          confetti({
            particleCount: winningSegment.val >= 5 ? 300 : 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#ff00de', '#00ffff', '#ffffff']
          });
        }

        setTimeout(() => {
          const modal = document.getElementById('roulette-modal');
          if (modal) modal.style.display = 'none';
          this.slot.addJackpotWin(finalPrize, `JACKPOT ${winningSegment.label} (${winningSegment.badge})`);
        }, 1800);
      }
    };

    requestAnimationFrame(animateWheel);
  }

  // --- SHOOTER BONUS ---
  startShooterGame(currentBet) {
    this.shooterScore = 0;
    this.shooterActive = true;
    this.currentBet = currentBet;

    const modal = document.getElementById('bonus-game-modal');
    const scoreEl = document.getElementById('bonus-game-score');
    const container = document.getElementById('bonus-container');
    const cursor = document.getElementById('custom-cursor');

    if (scoreEl) scoreEl.innerText = "0";
    if (modal) modal.style.display = 'block';
    if (cursor) cursor.style.display = 'block';

    Sound.playBonusTrigger();

    // Čišćenje starih elemenata
    container.querySelectorAll('.fruit-carrier').forEach(e => e.remove());

    const moveHandler = (e) => {
      if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', moveHandler);

    this.spawnTimer = setInterval(() => this.spawnShooterTarget(container), 550);
    this.endTimer = setTimeout(() => {
      window.removeEventListener('mousemove', moveHandler);
      this.endShooterGame(modal, cursor);
    }, 14000);
  }

  spawnShooterTarget(container) {
    if (!this.shooterActive) return;

    const availableFruits = Object.values(SlotSymbols).filter(s => s.id !== 'bonus');
    const fruitType = availableFruits[Math.floor(Math.random() * availableFruits.length)];

    const carrier = document.createElement('div');
    carrier.className = 'fruit-carrier';

    const startAngle = Math.random() * 360;
    carrier.style.transform = `translate(-50%, -50%) rotate(${startAngle}deg)`;
    carrier.animate([
      { transform: `translate(-50%, -50%) rotate(${startAngle}deg)` },
      { transform: `translate(-50%, -50%) rotate(${startAngle + 360}deg)` }
    ], { duration: 4000 + Math.random() * 2000, iterations: Infinity, easing: 'linear' });

    const target = document.createElement('div');
    target.className = `fruit-target ${fruitType.cls}`;
    target.innerHTML = fruitType.svg();

    const hit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.type.startsWith('touch') && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      this.hitTarget(clientX, clientY, carrier, fruitType);
    };

    target.addEventListener('mousedown', hit);
    target.addEventListener('touchstart', hit, { passive: false });

    carrier.appendChild(target);
    container.appendChild(carrier);

    setTimeout(() => {
      if (carrier.parentNode) carrier.remove();
    }, 4500);
  }

  hitTarget(x, y, carrier, fruit) {
    carrier.remove();
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 250);

    const mult = BonusValues[fruit.id] || 1;
    const win = this.currentBet * mult;
    this.shooterScore += win;

    const scoreEl = document.getElementById('bonus-game-score');
    if (scoreEl) scoreEl.innerText = this.shooterScore;

    this.showPopText(x, y, `+${win}`, '#ffff00');

    if (fruit.id === 'wild') {
      this.showPopText(x, y - 35, 'HYPER CHARGE!', '#ff00de');
      this.slot.jackpotManager.hyperCharge();
    }

    Sound.playReelStop();
  }

  showPopText(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'bonus-score-pop';
    el.style.left = (x || window.innerWidth / 2) + 'px';
    el.style.top = (y || window.innerHeight / 2) + 'px';
    el.style.color = color;
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  endShooterGame(modal, cursor) {
    this.shooterActive = false;
    clearInterval(this.spawnTimer);
    clearTimeout(this.endTimer);

    if (cursor) cursor.style.display = 'none';

    setTimeout(() => {
      if (modal) modal.style.display = 'none';
      if (this.shooterScore > 0) {
        this.slot.addBonusWin(this.shooterScore, 'SHOOTER BONUS');
      }
    }, 1000);
  }

  // --- GAMBLE (CRVENO / CRNO SA OGRANIČENJEM NA 5 RUNDI) ---
  openGamble(amount) {
    // Ako je aktivan timer na glavnom ekranu, zaustavljamo ga
    if (this.slot && this.slot.clearGambleTimer) {
      this.slot.clearGambleTimer();
    }
    this.currentGambleAmount = amount;
    this.gambleStreak = 0;
    this.maxGambleStreak = 5;

    const modal = document.getElementById('gamble-modal');
    const amtEl = document.getElementById('gamble-amount');
    if (amtEl) amtEl.innerText = amount.toFixed(2);
    this.updateGambleStreakUI();
    if (modal) modal.style.display = 'flex';
  }

  updateGambleStreakUI() {
    const streakEl = document.getElementById('gamble-streak-text');
    if (streakEl) {
      streakEl.innerText = `${this.gambleStreak + 1} / ${this.maxGambleStreak}`;
    }
    const dotsContainer = document.getElementById('gamble-streak-dots');
    if (dotsContainer) {
      const dots = dotsContainer.children;
      for (let i = 0; i < dots.length; i++) {
        if (i < this.gambleStreak) {
          dots[i].className = 'w-2.5 h-2.5 rounded-full border border-yellow-400 bg-yellow-400 shadow-[0_0_8px_#ffd700]';
        } else if (i === this.gambleStreak) {
          dots[i].className = 'w-2.5 h-2.5 rounded-full border-2 border-yellow-400 bg-yellow-500/40 animate-pulse';
        } else {
          dots[i].className = 'w-2.5 h-2.5 rounded-full border border-gray-700 bg-black';
        }
      }
    }
  }

  playGamble(choice) {
    // 50% fer šansa
    const win = Math.random() < 0.5;
    const amtEl = document.getElementById('gamble-amount');

    if (win) {
      this.currentGambleAmount *= 2;
      this.gambleStreak++;
      if (amtEl) amtEl.innerText = this.currentGambleAmount.toFixed(2);
      Sound.playWin(true);
      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 50, colors: ['#ffd700', '#ff00de'] });
      }

      // Ako je igrač dostigao maksimalan broj rundi (5 uzastopnih pogađanja), automatski isplaćujemo
      if (this.gambleStreak >= this.maxGambleStreak) {
        this.updateGambleStreakUI();
        setTimeout(() => {
          this.closeGamble(true);
          this.slot.showFinalModal("MAX GAMBLE REACHED (5/5)!", this.currentGambleAmount);
        }, 800);
      } else {
        this.updateGambleStreakUI();
      }
    } else {
      this.currentGambleAmount = 0;
      this.closeGamble(false);
      this.slot.onGambleLost();
    }
  }

  closeGamble(takeWin = true) {
    const modal = document.getElementById('gamble-modal');
    if (modal) modal.style.display = 'none';
    if (takeWin && this.currentGambleAmount > 0) {
      this.slot.onGambleCollect(this.currentGambleAmount);
    }
  }
}
