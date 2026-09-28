// Quest & Level-Up Progression Manager
class QuestManager {
  constructor(slotMachine) {
    this.slot = slotMachine;
    this.storageKey = 'neon_slot_progression_v1';
    
    // Učitaj ili inicijalizuj stanje
    this.state = this.loadState() || {
      level: 1,
      xp: 0,
      xpNeeded: 100,
      activeTheme: 'cyberpunk', // cyberpunk, toxic, solar
      dailyQuests: [
        { id: 'spins', title: 'Spin reels 15 times', target: 15, current: 0, reward: 200, completed: false, claimed: false },
        { id: 'cascade', title: 'Trigger a 3x cascade', target: 1, current: 0, reward: 300, completed: false, claimed: false },
        { id: 'win_big', title: 'Win 100+ credits', target: 1, current: 0, reward: 500, completed: false, claimed: false }
      ]
    };

    this.themes = {
      cyberpunk: { name: 'Cyberpunk (Pink/Cyan)', primary: '#ff00de', secondary: '#00ffff' },
      toxic:     { name: 'Toxic Acid (Green/Yellow)', primary: '#39ff14', secondary: '#ffff00' },
      solar:     { name: 'Solar Vegas (Gold/Orange)', primary: '#ffd700', secondary: '#ff3b00' }
    };
  }

  init() {
    this.applyTheme(this.state.activeTheme);
    this.renderUI();
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {}
  }

  addXP(amount) {
    this.state.xp += amount;
    if (this.state.xp >= this.state.xpNeeded) {
      this.state.xp -= this.state.xpNeeded;
      this.state.level++;
      this.state.xpNeeded = Math.round(this.state.xpNeeded * 1.35);

      const bonusCredit = this.state.level * 150;
      this.slot.balance += bonusCredit;
      this.slot.updateUI();
      
      Sound.playBonusTrigger();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 250, spread: 80, origin: { y: 0.5 }, colors: ['#ffd700', '#ff00de', '#00ffff'] });
      }

      this.slot.showFinalModal(`LEVEL UP! LEVEL ${this.state.level}`, `+${bonusCredit} BONUS CREDITS!`);
    }
    this.saveState();
    this.renderUI();
  }

  // Spin notification
  onSpinPlayed() {
    this.addXP(10);
    this.updateQuestProgress('spins', 1);
  }

  // Cascade notification
  onCascadeTriggered(multiplier) {
    this.addXP(15);
    if (multiplier >= 3) {
      this.updateQuestProgress('cascade', 1);
    }
  }

  // Win notification
  onWinRecorded(amount) {
    if (amount >= 100) {
      this.updateQuestProgress('win_big', 1);
    }
  }

  updateQuestProgress(questId, delta) {
    const q = this.state.dailyQuests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.current = Math.min(q.target, q.current + delta);
      if (q.current >= q.target) {
        q.completed = true;
        this.notifyQuestComplete(q);
      }
      this.saveState();
      this.renderUI();
    }
  }

  claimReward(questId) {
    const q = this.state.dailyQuests.find(item => item.id === questId);
    if (q && q.completed && !q.claimed) {
      q.claimed = true;
      this.slot.balance += q.reward;
      this.slot.updateUI();
      this.addXP(50);
      // Završena misija puni +10 poena na Cyber Wheel energiju!
      if (this.slot.incrementWheelEnergy) {
        for (let i = 0; i < 10; i++) {
          this.slot.incrementWheelEnergy();
        }
      }
      Sound.playWin(true);
      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      }
      this.slot.setMessage(`MISSION COMPLETED: +${q.reward} CREDITS & +10 WHEEL ENERGY!`, 'text-green-400 font-bold animate-pulse');
      this.saveState();
      this.renderUI();
    }
  }

  notifyQuestComplete(quest) {
    Sound.playMultiplierRise(4);
    this.slot.setMessage(`OBJECTIVE REACHED: ${quest.title}!`, 'text-yellow-300 font-bold animate-pulse');
  }

  applyTheme(themeKey) {
    const theme = this.themes[themeKey];
    if (!theme) return;
    this.state.activeTheme = themeKey;
    document.documentElement.style.setProperty('--electric-color', theme.primary);
    document.documentElement.style.setProperty('--electric-secondary', theme.secondary);
    this.saveState();
  }

  renderUI() {
    // XP Bar
    const xpPercent = Math.min(100, Math.round((this.state.xp / this.state.xpNeeded) * 100));
    const levelEl = document.getElementById('player-level');
    const xpBarEl = document.getElementById('xp-bar-fill');
    const xpTextEl = document.getElementById('xp-text');

    if (levelEl) levelEl.innerText = this.state.level;
    if (xpBarEl) xpBarEl.style.width = `${xpPercent}%`;
    if (xpTextEl) xpTextEl.innerText = `${this.state.xp}/${this.state.xpNeeded} XP`;

    // Quests modal
    const questListEl = document.getElementById('quest-list-items');
    if (questListEl) {
      questListEl.innerHTML = '';
      this.state.dailyQuests.forEach(q => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2 rounded-xl bg-black/60 border border-gray-800';
        
        let actionBtn = '';
        if (q.claimed) {
          actionBtn = `<span class="text-xs text-gray-500 font-bold tracking-wider">CLAIMED</span>`;
        } else if (q.completed) {
          actionBtn = `<button onclick="app.questManager.claimReward('${q.id}')" class="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-lg hover:scale-105 transition animate-pulse">CLAIM +${q.reward}</button>`;
        } else {
          actionBtn = `<span class="text-xs text-cyan-400 font-mono">${q.current}/${q.target}</span>`;
        }

        item.innerHTML = `
          <div>
            <div class="text-xs md:text-sm font-bold text-white">${q.title}</div>
            <div class="text-[10px] text-yellow-400">Reward: +${q.reward} credits</div>
          </div>
          <div>${actionBtn}</div>
        `;
        questListEl.appendChild(item);
      });
    }

    // Active theme markers
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active-theme', btn.dataset.theme === this.state.activeTheme);
    });
  }
}
