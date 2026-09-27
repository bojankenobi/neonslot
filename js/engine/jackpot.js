// Upravljanje Jackpotovima (Nano, Micro, Mini) sa Hot-zone efektima
class JackpotManager {
  constructor(jackpotConfigs) {
    this.jackpots = JSON.parse(JSON.stringify(jackpotConfigs));
    this.onDropCallback = null;
    this.animating = false;
  }

  init(onDropCallback) {
    this.onDropCallback = onDropCallback;
    this.renderUI();
    this.startAnimationLoop();
  }

  renderUI() {
    const container = document.getElementById('jackpot-container');
    if (!container) return;

    container.innerHTML = '';
    this.jackpots.forEach(jp => {
      const box = document.createElement('div');
      box.id = `jp-${jp.id}-box`;
      box.className = `jackpot-box jp-${jp.id}`;
      box.innerHTML = `
        <div class="jackpot-label">${jp.name}</div>
        <div id="jp-${jp.id}-val" class="jackpot-value">${jp.currentVal.toFixed(2)}</div>
        <div class="heartbeat-container">
          <svg class="heartbeat-svg" viewBox="0 0 200 20" preserveAspectRatio="none">
            <path d="M0,10 L80,10 L90,2 L100,18 L110,10 L200,10" vector-effect="non-scaling-stroke"></path>
          </svg>
        </div>
        <div class="must-drop-label">LIMIT: <span class="must-drop-val">${jp.limit.toFixed(2)}</span></div>
      `;
      container.appendChild(box);
    });
  }

  processBet(betAmount, multiplier = 1) {
    this.jackpots.forEach(jp => {
      const inc = (betAmount * jp.rate * multiplier) + (Math.random() * 0.15);
      jp.targetVal = Math.min(jp.limit, jp.targetVal + inc);
    });
    this.updateHotZones();
  }

  updateHotZones() {
    this.jackpots.forEach(jp => {
      const box = document.getElementById(`jp-${jp.id}-box`);
      if (!box) return;
      const pct = jp.targetVal / jp.limit;
      if (pct >= 0.90) {
        box.classList.add('jp-hot');
      } else {
        box.classList.remove('jp-hot');
      }
    });
  }

  startAnimationLoop() {
    const step = () => {
      this.jackpots.forEach(jp => {
        if (jp.currentVal < jp.targetVal) {
          let diff = jp.targetVal - jp.currentVal;
          let delta = Math.max(0.01, diff * 0.1);
          jp.currentVal = Math.min(jp.targetVal, jp.currentVal + delta);
          const el = document.getElementById(`jp-${jp.id}-val`);
          if (el) el.innerText = jp.currentVal.toFixed(2);
        }
      });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  checkDrops() {
    let dropped = null;
    for (let i = this.jackpots.length - 1; i >= 0; i--) {
      const jp = this.jackpots[i];
      if (jp.targetVal >= jp.limit) {
        dropped = jp;
        break;
      }
      if (jp.targetVal > (jp.limit * 0.94) && Math.random() < 0.03) {
        dropped = jp;
        break;
      }
    }

    if (dropped && this.onDropCallback) {
      const prize = dropped.currentVal;
      // Resetujemo na 50%
      dropped.currentVal = dropped.limit * 0.5;
      dropped.targetVal = dropped.currentVal;
      const box = document.getElementById(`jp-${dropped.id}-box`);
      if (box) box.classList.remove('jp-hot');
      this.onDropCallback(dropped, prize);
    }
  }

  hyperCharge() {
    this.jackpots.forEach(jp => {
      jp.targetVal = Math.min(jp.limit, jp.targetVal + (jp.limit * 0.05));
      const box = document.getElementById(`jp-${jp.id}-box`);
      if (box) {
        box.classList.add('jp-hyper-charge');
        setTimeout(() => box.classList.remove('jp-hyper-charge'), 600);
      }
    });
    this.updateHotZones();
  }
}
