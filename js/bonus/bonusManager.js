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

  // --- CYBER ARCADE RAIL-SHOOTER BONUS ---
  startShooterGame(currentBet) {
    this.shooterScore = 0;
    this.shooterActive = true;
    this.currentBet = currentBet;
    this.activeTargets = new Map();
    this.targetIdCounter = 0;

    // Combo sistem
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.lastHitTime = 0;

    // Tajmer (15 sekundi sa dinamičkim dodavanjem vremena)
    this.shooterDurationMs = 15000;
    this.shooterTimeRemaining = this.shooterDurationMs;
    this.shooterStartTime = performance.now();

    const modal = document.getElementById('bonus-game-modal');
    const scoreEl = document.getElementById('bonus-game-score');
    const container = document.getElementById('bonus-container');
    const cursor = document.getElementById('custom-cursor');
    const comboBadge = document.getElementById('shooter-combo-badge');
    const timeText = document.getElementById('shooter-time-text');
    const timeBar = document.getElementById('shooter-time-bar');

    if (scoreEl) scoreEl.innerText = "0";
    if (comboBadge) {
      comboBadge.innerText = "COMBO x1";
      comboBadge.className = "px-2 py-0.5 rounded-full bg-yellow-950/80 border border-yellow-400 text-yellow-300 text-[10px] font-black tracking-wider transition transform scale-95 shadow-[0_0_12px_#ffd700]";
    }
    if (modal) modal.style.display = 'block';
    if (cursor) cursor.style.display = 'block';

    Sound.playBonusTrigger();

    // Čišćenje starih elemenata
    container.querySelectorAll('.shooter-target-entity, .bonus-score-pop, .laser-impact-flash, .bomb-shockwave').forEach(e => e.remove());

    // Inicijalizacija laserskog i čestičnog Canvasa
    this.initShooterCanvas();

    // Mouse i Touch praćenje
    this.shooterPointerX = window.innerWidth / 2;
    this.shooterPointerY = window.innerHeight / 2;

    const moveHandler = (e) => {
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.type.startsWith('touch') && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      this.shooterPointerX = clientX;
      this.shooterPointerY = clientY;
      if (cursor) {
        cursor.style.left = clientX + 'px';
        cursor.style.top = clientY + 'px';
      }
    };

    // Globalni klik na ekran ispaljuje laserski hitac (Pew!)
    const shootHandler = (e) => {
      if (!this.shooterActive) return;
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.type.startsWith('touch') && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      this.fireLaserShot(clientX, clientY);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('touchmove', moveHandler, { passive: true });
    container.addEventListener('mousedown', shootHandler);
    container.addEventListener('touchstart', shootHandler, { passive: false });

    this.shooterMoveHandler = moveHandler;
    this.shooterFireHandler = shootHandler;

    // Spawnovanje meta (svakih 380ms)
    this.spawnTimer = setInterval(() => this.spawnShooterTarget(container), 380);

    // Glavna Loop petlja: ažurira vreme, HUD i kretanje meta
    let lastTick = performance.now();
    const gameLoop = (now) => {
      if (!this.shooterActive) return;
      const delta = now - lastTick;
      lastTick = now;

      this.shooterTimeRemaining -= delta;
      const progress = Math.max(0, this.shooterTimeRemaining / this.shooterDurationMs);

      if (timeText) timeText.innerText = (Math.max(0, this.shooterTimeRemaining) / 1000).toFixed(1) + 's';
      if (timeBar) timeBar.style.width = `${progress * 100}%`;

      // Ažuriranje kretanja aktivnih meta
      this.updateTargetsPosition(delta);

      // Provera isteka combo niza (ako nema pogotka duže od 1.4s)
      if (this.comboCount > 0 && (now - this.lastHitTime > 1400)) {
        this.resetCombo();
      }

      if (this.shooterTimeRemaining <= 0) {
        this.endShooterGame(modal, cursor);
      } else {
        requestAnimationFrame(gameLoop);
      }
    };
    requestAnimationFrame(gameLoop);
  }

  // --- LASER & CANVAS PARTICLE ENGINE ---
  initShooterCanvas() {
    this.fxCanvas = document.getElementById('shooter-fx-canvas');
    if (!this.fxCanvas) return;
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.fxCanvas.width = window.innerWidth;
    this.fxCanvas.height = window.innerHeight;
    this.particles = [];
    this.laserBeams = [];

    const fxLoop = () => {
      if (!this.shooterActive) return;
      this.renderShooterFX();
      requestAnimationFrame(fxLoop);
    };
    requestAnimationFrame(fxLoop);
  }

  fireLaserShot(targetX, targetY) {
    Sound.playLaserShot();

    // Dodaj laserski zrak od dna ekrana ka meti
    const startX = window.innerWidth * 0.5;
    const startY = window.innerHeight;
    this.laserBeams.push({
      x1: startX,
      y1: startY,
      x2: targetX,
      y2: targetY,
      alpha: 1,
      color: '#00ffff'
    });

    // Muzzle impact flash
    const flash = document.createElement('div');
    flash.className = 'laser-impact-flash';
    flash.style.left = targetX + 'px';
    flash.style.top = targetY + 'px';
    const container = document.getElementById('bonus-container');
    if (container) container.appendChild(flash);
    setTimeout(() => flash.remove(), 250);
  }

  renderShooterFX() {
    if (!this.fxCtx) return;
    this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);

    // 1. Crtaj Laserske zrake
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      const b = this.laserBeams[i];
      this.fxCtx.save();
      this.fxCtx.strokeStyle = `rgba(0, 255, 255, ${b.alpha})`;
      this.fxCtx.lineWidth = 4 * b.alpha;
      this.fxCtx.shadowColor = '#00ffff';
      this.fxCtx.shadowBlur = 15;
      this.fxCtx.beginPath();
      this.fxCtx.moveTo(b.x1, b.y1);
      this.fxCtx.lineTo(b.x2, b.y2);
      this.fxCtx.stroke();

      // Unutrašnje belo jezgro lasera
      this.fxCtx.strokeStyle = `rgba(255, 255, 255, ${b.alpha})`;
      this.fxCtx.lineWidth = 2 * b.alpha;
      this.fxCtx.beginPath();
      this.fxCtx.moveTo(b.x1, b.y1);
      this.fxCtx.lineTo(b.x2, b.y2);
      this.fxCtx.stroke();
      this.fxCtx.restore();

      b.alpha -= 0.12;
      if (b.alpha <= 0) {
        this.laserBeams.splice(i, 1);
      }
    }

    // 2. Crtaj Čestice eksplozija (Particles)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravitacija
      p.alpha -= 0.025;
      p.rotation += p.rotSpeed;

      this.fxCtx.save();
      this.fxCtx.translate(p.x, p.y);
      this.fxCtx.rotate(p.rotation);
      this.fxCtx.fillStyle = p.color;
      this.fxCtx.shadowColor = p.color;
      this.fxCtx.shadowBlur = 10;
      this.fxCtx.globalAlpha = Math.max(0, p.alpha);

      if (p.shape === 'star') {
        this.fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        this.fxCtx.beginPath();
        this.fxCtx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.fxCtx.fill();
      }
      this.fxCtx.restore();

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  createExplosionParticles(x, y, color = '#ffd700', count = 28) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color: color,
        alpha: 1,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'circle' : 'star'
      });
    }
  }

  // --- SPAWN META SA FIZIKOM I TRAJEKTORIJAMA ---
  spawnShooterTarget(container) {
    if (!this.shooterActive) return;

    // Ne dozvoljavamo prenatrpanost (max 7 istovremenih meta)
    if (this.activeTargets.size >= 7) return;

    const id = ++this.targetIdCounter;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Odabir tipa mete (70% standard voćkice, 12% Bomba, 10% Hyper Wild, 8% Chrono vreme)
    let type = 'fruit';
    const roll = Math.random();
    if (roll < 0.12) {
      type = 'bomb';
    } else if (roll < 0.22) {
      type = 'hyper_wild';
    } else if (roll < 0.30) {
      type = 'chrono';
    }

    const targetEl = document.createElement('div');
    targetEl.className = 'shooter-target-entity';

    let color = '#ffd700';
    let baseMult = 1;
    let symbolId = 'cherry';

    if (type === 'bomb') {
      targetEl.classList.add('target-bomb');
      color = '#ff0055';
      targetEl.innerHTML = `
        <svg viewBox="0 0 100 100" class="neon-svg">
          <circle cx="50" cy="55" r="32" stroke="#ff0055" stroke-width="5" fill="rgba(255, 0, 85, 0.25)" />
          <path d="M50 23 L50 12 Q 65 6 72 16" stroke="#ffd700" stroke-width="4" fill="none" />
          <circle cx="72" cy="16" r="6" fill="#ffff00" class="animate-ping" />
          <text x="50" y="63" font-family="'Orbitron', sans-serif" font-weight="900" font-size="16" text-anchor="middle" fill="#ffffff">BOMB</text>
        </svg>
      `;
    } else if (type === 'hyper_wild') {
      targetEl.classList.add('target-hyper-wild');
      color = '#ffd700';
      baseMult = 15;
      targetEl.innerHTML = SlotSymbols.wild.svg(5);
    } else if (type === 'chrono') {
      targetEl.classList.add('target-chrono');
      color = '#00ffcc';
      targetEl.innerHTML = `
        <svg viewBox="0 0 100 100" class="neon-svg">
          <circle cx="50" cy="50" r="36" stroke="#00ffcc" stroke-width="4.5" fill="rgba(0, 255, 204, 0.2)" />
          <path d="M50 24 L50 50 L68 50" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" />
          <text x="50" y="74" font-family="'Orbitron', sans-serif" font-weight="900" font-size="12" text-anchor="middle" fill="#00ffcc">+3s</text>
        </svg>
      `;
    } else {
      // Standardna neonska voćkica
      const fruits = Object.values(SlotSymbols).filter(s => s.id !== 'bonus');
      const fruit = fruits[Math.floor(Math.random() * fruits.length)];
      symbolId = fruit.id;
      baseMult = BonusValues[fruit.id] || 2;
      color = fruit.color || '#ff00de';
      targetEl.classList.add(fruit.cls);
      targetEl.innerHTML = fruit.svg();
    }

    // Pozicija i fizika (lete odozdo ka gore po paraboli ili levo-desno)
    const startFromBottom = Math.random() > 0.3;
    let posX, posY, velX, velY;

    if (startFromBottom) {
      posX = Math.random() * (w - 140) + 70;
      posY = h + 40;
      velX = (Math.random() - 0.5) * 3;
      velY = -(Math.random() * 5 + 9.5); // izbacuje u vis
    } else {
      const fromLeft = Math.random() > 0.5;
      posX = fromLeft ? -40 : w + 40;
      posY = Math.random() * (h * 0.5) + (h * 0.2);
      velX = fromLeft ? (Math.random() * 3 + 3.5) : -(Math.random() * 3 + 3.5);
      velY = (Math.random() - 0.5) * 2.5;
    }

    targetEl.style.transform = `translate(${posX}px, ${posY}px)`;

    const hit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.type.startsWith('touch') && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      this.hitTargetEntity(id, clientX, clientY);
    };

    targetEl.addEventListener('mousedown', hit);
    targetEl.addEventListener('touchstart', hit, { passive: false });

    container.appendChild(targetEl);

    this.activeTargets.set(id, {
      el: targetEl,
      type: type,
      symbolId: symbolId,
      baseMult: baseMult,
      color: color,
      x: posX,
      y: posY,
      vx: velX,
      vy: velY,
      gravity: startFromBottom ? 0.16 : 0.02
    });
  }

  updateTargetsPosition(delta) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const [id, t] of this.activeTargets.entries()) {
      t.x += t.vx;
      t.y += t.vy;
      t.vy += t.gravity;

      t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;

      // Ako je meta izletela van ekrana, uklanjamo je
      if (t.y > h + 100 || t.x < -100 || t.x > w + 100) {
        t.el.remove();
        this.activeTargets.delete(id);
      }
    }
  }

  hitTargetEntity(targetId, clickX, clickY) {
    const target = this.activeTargets.get(targetId);
    if (!target) return;

    const hitX = clickX || target.x + 38;
    const hitY = clickY || target.y + 38;

    // 1. Obrada COMBO niza
    const now = performance.now();
    this.lastHitTime = now;
    this.comboCount++;
    if (this.comboCount >= 8) {
      this.comboMultiplier = 5;
    } else if (this.comboCount >= 5) {
      this.comboMultiplier = 3;
    } else if (this.comboCount >= 3) {
      this.comboMultiplier = 2;
    } else {
      this.comboMultiplier = 1;
    }

    this.updateComboBadge();
    Sound.playComboSound(this.comboMultiplier);

    // 2. Čestice eksplozije i uklanjanje mete
    this.createExplosionParticles(hitX, hitY, target.color, 32);
    target.el.remove();
    this.activeTargets.delete(targetId);

    // 3. Efekti po tipu mete
    if (target.type === 'bomb') {
      // Masivna lančana reakcija (Screen Nuke)
      this.triggerBombShockwave(hitX, hitY);
    } else if (target.type === 'chrono') {
      // Dodaj +3s vremenu
      this.shooterTimeRemaining = Math.min(this.shooterDurationMs, this.shooterTimeRemaining + 3000);
      this.showPopText(hitX, hitY, '+3 SECONDS!', '#00ffcc');
      Sound.playMultiplierRise(3);
    } else {
      // Regularna voćkica ili Hyper Wild
      const win = Math.round(this.currentBet * target.baseMult * this.comboMultiplier);
      this.shooterScore += win;

      const scoreEl = document.getElementById('bonus-game-score');
      if (scoreEl) scoreEl.innerText = this.shooterScore;

      const popLabel = this.comboMultiplier > 1 ? `+${win} (x${this.comboMultiplier})` : `+${win}`;
      this.showPopText(hitX, hitY, popLabel, target.color);

      if (target.type === 'hyper_wild') {
        this.slot.jackpotManager.hyperCharge();
        this.showPopText(hitX, hitY - 40, 'HYPER CHARGE!', '#ffd700');
      }
    }

    // Shake ekrana pri pogotku
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 180);
  }

  triggerBombShockwave(x, y) {
    Sound.playBombExplosion();

    // Shockwave vizuelni talas
    const shockwave = document.createElement('div');
    shockwave.className = 'bomb-shockwave';
    shockwave.style.left = x + 'px';
    shockwave.style.top = y + 'px';
    const container = document.getElementById('bonus-container');
    if (container) container.appendChild(shockwave);
    setTimeout(() => shockwave.remove(), 600);

    this.showPopText(x, y, 'MEGA EXPLOSION!', '#ff0055');

    // Uništava sve preostale mete na ekranu uz lančani skor
    let bombBonus = 0;
    const targetsToDestroy = Array.from(this.activeTargets.entries());

    targetsToDestroy.forEach(([id, t], index) => {
      setTimeout(() => {
        if (!this.activeTargets.has(id)) return;
        this.createExplosionParticles(t.x + 38, t.y + 38, t.color, 24);
        t.el.remove();
        this.activeTargets.delete(id);

        const pieceWin = Math.round(this.currentBet * t.baseMult * this.comboMultiplier);
        bombBonus += pieceWin;
        this.shooterScore += pieceWin;
        const scoreEl = document.getElementById('bonus-game-score');
        if (scoreEl) scoreEl.innerText = this.shooterScore;
        this.showPopText(t.x + 38, t.y + 38, `+${pieceWin}`, t.color);
      }, (index + 1) * 70);
    });
  }

  updateComboBadge() {
    const badge = document.getElementById('shooter-combo-badge');
    if (!badge) return;
    badge.innerText = `COMBO x${this.comboMultiplier}`;
    if (this.comboMultiplier >= 5) {
      badge.className = "px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-bounce shadow-[0_0_20px_#ff0055]";
    } else if (this.comboMultiplier >= 3) {
      badge.className = "px-2.5 py-0.5 rounded-full bg-fuchsia-900 border border-fuchsia-400 text-fuchsia-300 font-black text-[11px] tracking-wider shadow-[0_0_15px_#ff00de]";
    } else if (this.comboMultiplier >= 2) {
      badge.className = "px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold text-[10px] tracking-wider shadow-[0_0_12px_#00ffff]";
    } else {
      badge.className = "px-2 py-0.5 rounded-full bg-yellow-950/80 border border-yellow-400 text-yellow-300 text-[10px] font-black tracking-wider shadow-[0_0_10px_#ffd700]";
    }
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.updateComboBadge();
  }

  showPopText(x, y, text, color = '#ffd700') {
    const el = document.createElement('div');
    el.className = 'bonus-score-pop';
    el.style.left = (x || window.innerWidth / 2) + 'px';
    el.style.top = (y || window.innerHeight / 2) + 'px';
    el.style.color = color;
    el.innerText = text;
    const container = document.getElementById('bonus-container') || document.body;
    container.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  endShooterGame(modal, cursor) {
    if (!this.shooterActive) return;
    this.shooterActive = false;
    clearInterval(this.spawnTimer);

    if (cursor) cursor.style.display = 'none';

    // Skidanje event listenera
    const container = document.getElementById('bonus-container');
    if (this.shooterMoveHandler) {
      window.removeEventListener('mousemove', this.shooterMoveHandler);
      window.removeEventListener('touchmove', this.shooterMoveHandler);
    }
    if (this.shooterFireHandler && container) {
      container.removeEventListener('mousedown', this.shooterFireHandler);
      container.removeEventListener('touchstart', this.shooterFireHandler);
    }

    // Ukloni preostale mete
    this.activeTargets.forEach(t => t.el.remove());
    this.activeTargets.clear();

    Sound.playWin(true);
    if (typeof confetti === 'function') {
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
    }

    setTimeout(() => {
      if (modal) modal.style.display = 'none';
      if (this.shooterScore > 0) {
        this.slot.addBonusWin(this.shooterScore, 'CYBER BLASTER BONUS');
      }
    }, 1200);
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
