# Neon Nights — Cyberpunk Arcade Slot Machine

A high-performance, responsive Progressive Web Application (PWA) arcade slot cabinet engineered with Vanilla JavaScript, HTML5 Canvas, SVG graphics, Web Audio API, and CSS3 animations. Features dynamic multi-cabinet selection, cascading reel mechanics, expanding multipliers, interactive bonus arcade mini-games, and a physical progressive jackpot wheel.

---

## 🇷🇸 Pregled Projekta (Serbian)

**Neon Nights** je napredna arkadna slot mašina inspirisana retro-futurističkom cyberpunk i synthwave estetikom 80-ih godina. Projekat je kompletno razvijen bez spoljnih teških frejmvorka, sa fokusom na maksimalne performanse, 60 FPS animacije i čistu modularnu arhitekturu.

### Ključne Funkcionalnosti
- **Casino Lobby (Predvorje kabineta):** Mogućnost izbora između 3 različita aparata u realnom vremenu:
  1. *Retro 777 Deluxe* — 3 koluta, 5 dobitnih linija (Klasičan Vegas stil).
  2. *Cyberpunk Neon* — 5 koluta, 10 dobitnih linija (Srednja volatilnost, Expanding Wild munje).
  3. *Vegas High-Roller* — 5 koluta, 20 dobitnih linija (Visoka volatilnost, maksimalne isplate).
- **Kaskadni Mehanizam & Množioci:** Dobitni simboli eksplodiraju i prave mesto novim padajućim simbolima. Svaka uzastopna kaskada penje multiplikator (`x1 ➔ x2 ➔ x3 ➔ x5 ➔ x10 ➔ x15 ➔ x20 ➔ x25`).
- **Free Spins Režim (Sticky Multiplier):** 3+ Scatter simbola dodeljuju 10 besplatnih spinova u kojima multiplikator nikada ne pada, već se samo akumulira.
- **Cyber Jackpot Wheel (Progresivni točak):**
  - **Sistem Energije & Ciljeva:** Točak se otključava akumulacijom energije (50 spinova ili rešavanjem dnevnih misija) ili dostizanjem kalibrisanih Nano, Micro i Mega "Must-Drop" limita.
  - **Vremenski Prozor Dostupnosti (Claim Window):** Kada se otključa, igrač dobija neonski baner sa tajmerom (35 sekundi) da samostalno pokrene točak, bez nasilnog prekidanja spina.
  - Fizika točka sa 10 segmenata (do `x20` Jackpot), svetlosnim neonskim prstenom, mehaničkim flapper pinom i audio klikovima sa dramatičnom suspense fazom usporavanja.
- **Cyber Blaster Rail-Shooter Bonus:** 
  - Arkadna pucačina sa fizikom gravitacije i paraboličnim trajektorijama meta.
  - Laserski zraci u realnom vremenu i Canvas sistem eksplozija sa fizikom čestica.
  - **Combo Multiplier (`x1 ➔ x2 ➔ x3 ➔ x5`)** za brze uzastopne pogotke.
  - **Specijalne mete:** *Cyber Bombe* (eksplozivni udarni talas koji uništava ceo ekran), *Hyper Wild* ($x15$ + Hyper Charge), i *Chrono Target* ($+3s$ dodatnog vremena).
- **Gamble Funkcija (Crveno / Crno):** Udvostručavanje sa vremenskim prozorom od 5 sekundi, dostupno na dobicima do 25x ulog, uz limit od maksimalno 5 uzastopnih pogađanja (streak).
- **Progresija & Dnevne Misije:** XP nivoi, nagradni krediti (+10 Wheel Energy po završenoj misiji) i promena neonskih plazma tema (Cyberpunk, Toxic Acid, Solar Gold).
- **Kriptografski RNG & Asimetrični Kolutovi:** `window.crypto.getRandomValues` algoritam sa sertifikovanim matematičkim modelom (~96.2% RTP) i posebnim trakama za svaki kabinet.
- **Web Audio API Sintisajzer:** Proceduralni zvučni efekti u realnom vremenu (arpeggiatori, bas udarci, mehanički klikovi) bez zavisnosti od eksternih MP3 datoteka.
- **PWA & Offline Podrška:** Service Worker sa Network-First keširanjem omogućava instalaciju na Android/iOS i offline igranje.

---

## 🇬🇧 Project Overview (English)

**Neon Nights** is a modern retro-futuristic arcade slot cabinet built for modern web standards. Designed with a distinct 80s outrun cyberpunk visual identity, it brings fluid reel mechanics, responsive payline overlays, and physical arcade casino action straight to the browser.

### Key Features
- **Multi-Cabinet Casino Lobby:** Seamlessly switch between cabinets without resetting balance or XP:
  - *Classic 3-Reel (5 Paylines)*
  - *Cyberpunk 5-Reel (10 Paylines)*
  - *Vegas High-Roller 5-Reel (20 Paylines)*
- **Cascading Tumbling Reels:** Winning combinations explode and disappear; new symbols drop from above to trigger chain reactions with an escalating multiplier trail up to `x25`.
- **Sticky Multiplier Free Spins:** Triggered by 3+ Scatters. Multiplier values persist across all free spins for massive win potential.
- **Cyber Jackpot Wheel:**
  - **Milestone Energy Progression:** Earn wheel spins by charging the Cyber Energy Meter (50 spins or mission rewards) or by hitting Nano, Micro, and Mega Must-Drop limits.
  - **Timed Claim Window (35s):** Alerts players when ready and lets them trigger the wheel whenever they wish within the expiration window.
  - 10 multiplier wedges up to `x20`, animated neon lighting ring, flapper peg bounce animation, and procedural ticking audio with suspense slowdown.
- **Cyber Blaster Rail-Shooter Bonus:** 
  - Dynamic arcade rail-shooter featuring projectile physics and parabolic trajectories.
  - Real-time laser beams, muzzle flashes, and a dedicated 60 FPS HTML5 Canvas particle explosion engine.
  - **Combo Multipliers (`x1 ➔ x2 ➔ x3 ➔ x5`)** rewarded for rapid consecutive target hits.
  - **Special Targets:** *Cyber Bombs* (clears screen via shockwave chain reaction), *Hyper Wilds* ($x15$ + Hyper Charge), and *Chrono Targets* ($+3s$ time bonus).
- **Gamble (Double or Nothing):** Fair 50/50 red vs black card gamble with a 5-second decision window and a 5-round maximum streak cap.
- **Daily Quests & Player Progression:** Level progression with XP bars, milestone rewards (+10 Wheel Energy on quest completion), and switchable plasma color themes.
- **Cryptographic RNG:** Uses `window.crypto.getRandomValues` and cabinet-specific asymmetric reel strips targeting ~96.2% commercial RTP.
- **Pure Web Audio Synthesizer:** Zero external audio assets required; all sound effects are synthesized on the fly via oscillators, gain envelopes, and filters.
- **Progressive Web App (PWA):** Installable to home screens on mobile and desktop, supporting high-DPI displays and offline capabilities.

---

## 🏛 Arhitektura Sistema / System Architecture

Aplikacija se oslanja na strogu separaciju odgovornosti (SoC) kroz modularne ES6 klase:

```
slot neon/
├── index.html                  # Glavni HTML sa SVG definicijama i modalnim prozorima
├── manifest.json               # PWA manifest konfiguracija
├── sw.js                       # Service Worker (Network-First keširanje)
├── css/
│   └── style.css               # Neonski stilovi, glassmorphism, 3D dugmad i animacije
├── js/
│   ├── config.js               # Konfiguracija kabineta, uloga, paytable i isplatnih linija
│   ├── audio.js                # Web Audio API sintisajzer (proceduralni zvukovi i haptika)
│   ├── symbols.js              # Vektorski SVG neonski simboli sa glow filterima
│   ├── app.js                  # Glavni kontroler aplikacije i UI koordinacija
│   ├── math/
│   │   └── slotMath.js         # RNG algoritam, evaluacija linija i kaskadna matrica
│   ├── engine/
│   │   ├── reelEngine.js       # Upravljanje DOM kolutovima, animacija i SVG putanje
│   │   └── jackpot.js          # Progresivni bazeni (Nano, Micro, Mini) i drop triggeri
│   └── bonus/
│       ├── bonusManager.js     # Shooter mini-igra, Jackpot točak i Gamble
│       └── questManager.js     # XP sistem nivoa, zadaci i promena tema
└── assets/
    └── icons/                  # PWA ikone za instalaciju (192x192, 512x512)
```

### Detaljan Opis Modula:

1. **`SlotMath` (`js/math/slotMath.js`)**:
   - Upravlja matematičkim modelom igre sa sertifikovanim RTP profilom (~96.4%).
   - Generiše dinamičku matricu koluta ($3 \times 3$ ili $5 \times 3$).
   - Evaluira isplate za proizvoljan broj isplatnih linija sa leve na desnu stranu.
   - Izračunava kaskadno propadanje simbola (`cascadeGrid`).

2. **`ReelEngine` (`js/engine/reelEngine.js`)**:
   - Renderuje DOM elemente koluta i upravlja tajmingom zaustavljanja.
   - Crta precizne vektorske SVG linije dobitaka preko koluta koristeći apsolutne koordinate u realnom vremenu.
   - Sadrži podršku za Turbo režim sa skraćenim vremenom spina.

3. **`BonusManager` (`js/bonus/bonusManager.js`)**:
   - Upravlja mini-igrom `Shooter` (detekcija dodira/klika, orbite i leteće voćkice).
   - Renderuje **Cyber Jackpot Wheel** na HTML5 Canvasu, računa tačan ugao zaustavljanja i sinhronizuje animaciju iglice sa zvukom.
   - Upravlja kartičnom igrom dupliranja (Gamble).

4. **`SoundController` (`js/audio.js`)**:
   - Koristi standardni `AudioContext`.
   - Generiše harmonične sintetizovane tonove, kaskadne laser-crunch zvukove, fanfare i mehaničke klikove točka.
   - Automatski aktivira haptičke vibracije na mobilnim uređajima (`navigator.vibrate`).

5. **`QuestManager` (`js/bonus/questManager.js`)**:
   - Prati statistike spina, kaskada i velikih dobitaka.
   - Perzistira stanje (nivo, XP, završeni zadaci, odabrana tema) u `localStorage`.

---

## 🚀 Pokretanje i Instalacija / Getting Started

Za pokretanje aplikacije nije potreban Node.js build proces — aplikacija se može pokrenuti putem bilo kog lokalnog web servera.

### Opcija 1: Python HTTP Server
```bash
# Pokretanje iz korenskog direktorijuma
python -m http.server 8000
```
Otvorite pregledač na adresi: `http://localhost:8000`

### Opcija 2: Node.js `http-server` ili `serve`
```bash
npx serve .
```

### PWA Instalacija
1. Otvorite aplikaciju u Chrome, Edge ili Safari pregledaču preko HTTPS ili `localhost`.
2. Kliknite na ikonu **Install** u adresnoj traci (ili "Add to Home Screen" na mobilnom uređaju).
3. Aplikacija se pokreće u nativnom celoekranskom režimu sa offline keširanjem.

---

## 🎨 Dizajn i Estetika

- **Synthwave 3D Canvas:** Dinamička perspektivna mreža u pozadini (Outrun grid) sa zvezdanim nebom i neonskim suncem na horizontu koja ubrzava tokom spina.
- **Električni plazma okvir:** Napredni SVG filter sa turbulencijom (`feTurbulence`, `feDisplacementMap`) koji stvara živi električni luk oko kućišta.
- **Autentične neonske ikone:** Čiste SVG vektorske ikone prilagođene mračnoj temi sa višeslojnim `drop-shadow` sjajem.

---

## 📄 Licenca / License

Ovaj projekat je licenciran pod [MIT Licencom](LICENSE). Slobodno se može koristiti, menjati i distribuirati.
