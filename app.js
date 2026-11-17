(() => {
  'use strict';

  /* =========================================================
     PALETTES DARKROOM (AMBRE, ROUGE, FIBRE PAPER)
     ========================================================= */
  const PALETTES = {
    amber: {
      label: 'Ambre',
      paper: '#1b1815',
      paper2: '#231f1b',
      paper3: '#2e2924',
      ink: '#eae3d8',
      ink2: '#cfc6b8',
      muted: '#9c9288',
      rule: '#4a4139',
      grid: 'rgba(156, 146, 136, 0.14)',
      accent: '#e8943c',
      accentSoft: 'rgba(232, 148, 60, 0.22)',
      accentWarm: '#f5d076',
      accentDeep: '#c86420',
      scrim: 'rgba(20, 18, 16, 0.78)',
      shadow: 'rgba(10, 9, 8, 0.55)',
      shield: '#a8c6d8',
      waxLight: '#f1e8d9',
      waxMid: '#dfd4c3',
      waxDark: '#9c8c79',
      faceInk: '#1b1815',
      sisterCalm: '#b8afa4',
      sisterSad: '#877f78',
      sisterAngry: '#6e5245',
      cakeTop: '#2a241f',
      cakeBottom: '#1b1815'
    },
    red: {
      label: 'Rouge',
      paper: '#1b1815',
      paper2: '#231f1b',
      paper3: '#2e2924',
      ink: '#eae3d8',
      ink2: '#cfc6b8',
      muted: '#9c9288',
      rule: '#4a4139',
      grid: 'rgba(156, 146, 136, 0.14)',
      accent: '#e0583c',
      accentSoft: 'rgba(224, 88, 60, 0.22)',
      accentWarm: '#f29072',
      accentDeep: '#9e3320',
      scrim: 'rgba(20, 18, 16, 0.78)',
      shadow: 'rgba(10, 9, 8, 0.55)',
      shield: '#a8c6d8',
      waxLight: '#f1e8d9',
      waxMid: '#dfd4c3',
      waxDark: '#9c8c79',
      faceInk: '#1b1815',
      sisterCalm: '#b8afa4',
      sisterSad: '#877f78',
      sisterAngry: '#6e4942',
      cakeTop: '#2a2220',
      cakeBottom: '#1b1815'
    },
    fibre: {
      label: 'Fibre',
      paper: '#efeae1',
      paper2: '#e4ded3',
      paper3: '#d8d1c4',
      ink: '#1e1b18',
      ink2: '#3c3630',
      muted: '#6c6358',
      rule: '#bfb5a4',
      grid: 'rgba(80, 72, 62, 0.12)',
      accent: '#c43a1a',
      accentSoft: 'rgba(196, 58, 26, 0.16)',
      accentWarm: '#e07a2e',
      accentDeep: '#982c12',
      scrim: 'rgba(239, 234, 225, 0.88)',
      shadow: 'rgba(30, 27, 24, 0.22)',
      shield: '#2a6f8c',
      waxLight: '#fffaf0',
      waxMid: '#e8dec9',
      waxDark: '#b8aa94',
      faceInk: '#1b1815',
      sisterCalm: '#c7bcae',
      sisterSad: '#a3998b',
      sisterAngry: '#825e52',
      cakeTop: '#d4cab9',
      cakeBottom: '#bfb3a0'
    }
  };

  let currentTheme = 'amber';
  function getCanvasPalette() {
    return PALETTES[currentTheme] || PALETTES.amber;
  }

  /* =========================================================
     AUDIO SYNTHÉTIQUE WEB AUDIO (MUET PAR DÉFAUT)
     ========================================================= */
  let soundEnabled = false;
  let audioCtx = null;

  function playSfx(kind) {
    if (!soundEnabled) return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const now = audioCtx.currentTime;
    const ping = (f0, f1, dur, wave, vol, delay = 0) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(f0, now + delay);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), now + delay + dur);
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur);
    };

    if (kind === 'jump') {
      ping(250, 480, 0.11, 'triangle', 0.05);
    } else if (kind === 'revive') {
      ping(440, 660, 0.12, 'sine', 0.05, 0);
      ping(660, 880, 0.16, 'triangle', 0.04, 0.06);
    } else if (kind === 'hit') {
      ping(150, 52, 0.14, 'sawtooth', 0.05);
    } else if (kind === 'relay') {
      ping(220, 110, 0.04, 'square', 0.035);
    } else if (kind === 'score') {
      ping(587, 880, 0.09, 'triangle', 0.045);
    } else if (kind === 'mission') {
      ping(440, 440, 0.09, 'triangle', 0.04, 0);
      ping(554, 554, 0.09, 'triangle', 0.04, 0.08);
      ping(659, 880, 0.18, 'triangle', 0.05, 0.16);
    }
  }

  /* =========================================================
     TOAST, MISSIONS ET HUD DÉBOGAGE
     ========================================================= */
  const toastEl = document.getElementById('toast');
  const questBadgeEl = document.getElementById('questCounterBadge');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 2600);
  }

  const missionsDone = new Set();
  const TOTAL_MISSIONS = 5;

  function completeMission(key, label) {
    if (missionsDone.has(key)) return;
    missionsDone.add(key);
    playSfx('mission');
    if (questBadgeEl) {
      questBadgeEl.textContent = `Missions : ${missionsDone.size} sur ${TOTAL_MISSIONS}`;
      questBadgeEl.classList.toggle('is-complete', missionsDone.size >= TOTAL_MISSIONS);
    }
    if (missionsDone.size === TOTAL_MISSIONS) {
      showToast('Toutes les missions interactives sont validées.');
    } else if (label) {
      showToast(`Mission validée : ${label}`);
    }
  }

  function copyEmail(email) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(
        () => showToast(`Adresse copiée : ${email}`),
        () => fallbackCopy(email)
      );
    } else {
      fallbackCopy(email);
    }
  }

  function fallbackCopy(text) {
    const tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.style.position = 'fixed';
    tmp.style.opacity = '0';
    document.body.appendChild(tmp);
    tmp.select();
    try {
      document.execCommand('copy');
      showToast(`Adresse copiée : ${text}`);
    } catch {
      showToast(`Courriel : ${text}`);
    }
    document.body.removeChild(tmp);
  }

  ['heroCopyEmailBtn', 'footerCopyEmailBtn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        copyEmail(btn.dataset.email || 'kemerdyjohn@gmail.com');
      });
    }
  });

  /* Contrôleur de thème, audio et HUD technique */
  function initToolbarControls() {
    const themeBtns = document.querySelectorAll('.theme-btn');
    const soundBtn = document.getElementById('soundToggleBtn');
    const debugBtn = document.getElementById('debugToggleBtn');
    const debugHud = document.getElementById('debugHud');
    const debugFps = document.getElementById('debugFps');
    const debugTheme = document.getElementById('debugTheme');
    const debugArena = document.getElementById('debugArena');
    const debugAudio = document.getElementById('debugAudio');

    function applyTheme(name) {
      if (!PALETTES[name]) return;
      currentTheme = name;
      if (name === 'amber') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', name);
      }
      themeBtns.forEach((b) => {
        const active = b.dataset.themeChoice === name;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (debugTheme) debugTheme.textContent = `Thème : ${PALETTES[name].label}`;
      showToast(`Palette Darkroom : ${PALETTES[name].label}`);
    }

    themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.themeChoice || 'amber');
        playSfx('relay');
      });
    });

    const bgMusic = new Audio('assets/audio/ambiance.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.28;

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = soundEnabled ? 'Son : On' : 'Son : Off';
        soundBtn.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
        if (debugAudio) debugAudio.textContent = `Audio : ${soundEnabled ? 'On' : 'Off'}`;
        if (soundEnabled) {
          bgMusic.play().catch(() => {});
          playSfx('revive');
          showToast('Musique d’ambiance et audio activés.');
        } else {
          bgMusic.pause();
          showToast('Audio coupé.');
        }
      });
    }

    function toggleDebugHud() {
      if (!debugHud || !debugBtn) return;
      const open = debugHud.classList.toggle('hidden');
      const isOpen = !open;
      debugBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    }

    if (debugBtn) debugBtn.addEventListener('click', toggleDebugHud);

    let frames = 0;
    let lastTime = performance.now();
    function tickDebug() {
      frames += 1;
      const now = performance.now();
      if (now - lastTime >= 500) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
        if (debugFps) debugFps.textContent = `FPS : ${fps}`;
        if (debugArena) debugArena.textContent = `Banc : ${activeArena}`;
      }
      requestAnimationFrame(tickDebug);
    }
    tickDebug();

    return { applyTheme, toggleDebugHud };
  }

  /* =========================================================
     GESTION CENTRALISÉE DE L'ARÈNE CLAVIER (AZERTY / QWERTY / FLÈCHES)
     ========================================================= */
  let activeArena = 'hero';
  const keysHeld = new Set();
  const arenaHooks = {};

  function setActiveArena(name) {
    if (!name) return;
    activeArena = name;
    document.querySelectorAll('[data-arena]').forEach((el) => {
      el.classList.toggle('is-keyboard-active', el.dataset.arena === name);
    });
  }

  function isModalOpen() {
    return Array.from(document.querySelectorAll('.modal-backdrop')).some(
      (m) => !m.classList.contains('hidden')
    );
  }

  function getMoveDir(e) {
    const k = (e.key || '').toLowerCase();
    if (e.code === 'ArrowUp' || k === 'z' || k === 'w') return 'UP';
    if (e.code === 'ArrowDown' || k === 's') return 'DOWN';
    if (e.code === 'ArrowLeft' || k === 'q' || k === 'a') return 'LEFT';
    if (e.code === 'ArrowRight' || k === 'd') return 'RIGHT';
    return null;
  }

  function focusArena(name) {
    const el = document.querySelector(`[data-arena="${name}"]`);
    if (!el) return;
    setActiveArena(name);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const canvas = el.querySelector('canvas');
    if (canvas) canvas.focus({ preventScroll: true });
  }

  function initArenaWiring(toolbarCtrl) {
    document.querySelectorAll('[data-arena]').forEach((el) => {
      const name = el.dataset.arena;
      el.addEventListener('pointerdown', () => setActiveArena(name));
      el.addEventListener('focusin', () => setActiveArena(name));
      el.addEventListener('mouseenter', () => {
        if (!keysHeld.size) setActiveArena(name);
      });
    });

    const quickArenaMap = {
      Digit1: 'hero',
      Digit2: 'rover',
      Digit3: 'home',
      Digit4: 'hero',
      Digit5: 'runner',
      Digit6: 'snake'
    };

    const themeOrder = ['amber', 'red', 'fibre'];

    window.addEventListener('keydown', (e) => {
      if (isModalOpen()) return;
      const focused = document.activeElement;
      if (focused && (focused.tagName === 'TEXTAREA' || (focused.tagName === 'INPUT' && focused.type !== 'range' && focused.type !== 'checkbox'))) {
        return;
      }

      if (e.code === 'F3') {
        e.preventDefault();
        toolbarCtrl.toggleDebugHud();
        return;
      }

      if (e.code === 'KeyC' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const nextTheme = themeOrder[(themeOrder.indexOf(currentTheme) + 1) % themeOrder.length];
        toolbarCtrl.applyTheme(nextTheme);
        playSfx('relay');
        return;
      }

      if (quickArenaMap[e.code] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        focusArena(quickArenaMap[e.code]);
        return;
      }

      const dir = getMoveDir(e);
      if (focused && focused.tagName === 'INPUT' && focused.type === 'range' && (dir === 'LEFT' || dir === 'RIGHT')) {
        return;
      }

      if (dir) keysHeld.add(dir);

      const hook = arenaHooks[activeArena];
      if (hook && hook.onKeyDown) {
        const handled = hook.onKeyDown(e, dir);
        if (handled && (e.code.startsWith('Arrow') || e.code === 'Space')) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const dir = getMoveDir(e);
      if (dir) keysHeld.delete(dir);
    });

    window.addEventListener('blur', () => {
      keysHeld.clear();
    });
  }

  /* =========================================================
     SCÈNE JOUABLE HERO : LA DERNIÈRE BOUGIE + DÉFI 30S + BUS ESP32
     ========================================================= */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const exprLabel = document.getElementById('heroExpressionLabel');
    const teleLabel = document.getElementById('heroTelemetryText');
    const scoreLabel = document.getElementById('heroScoreLabel');
    const challengeBtn = document.getElementById('heroChallengeBtn');
    const modeBtns = document.querySelectorAll('.hero-mode-btn');

    let mode = 'flame';
    let t = 0;
    let pointerWind = 0;
    let pointerSpeed = 0;
    let lastMouseX = canvas.width / 2;

    const cakeLeft = 180;
    const cakeRight = canvas.width - 180;
    const groundY = canvas.height - 62;

    const player = {
      x: canvas.width / 2,
      y: groundY,
      vx: 0,
      vy: 0,
      grounded: true,
      jumpCount: 0,
      scaleX: 1,
      scaleY: 1,
      lean: 0,
      flame: 100,
      blinkTimer: 160,
      reviveWave: 0,
      reviveCooldown: 0,
      successTimer: 0,
      dangerTimer: 0,
      dodges: 0
    };

    const challenge = {
      active: false,
      timeLeft: 30.0,
      best: 0
    };

    const drips = [
      { ox: -22, len: 18 },
      { ox: -6, len: 29 },
      { ox: 12, len: 15 },
      { ox: 25, len: 24 }
    ];

    const sisters = [
      { x: 112, y: groundY + 4, side: 1, phase: 0.4, state: 1, windCharge: 80 },
      { x: canvas.width - 112, y: groundY + 4, side: -1, phase: 2.1, state: 2, windCharge: 160 }
    ];

    const gusts = [];
    const embers = Array.from({ length: 28 }, () => ({
      x: player.x + (Math.random() - 0.5) * 32,
      y: player.y - 130 - Math.random() * 50,
      vy: -0.7 - Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.5,
      size: 1.4 + Math.random() * 2.2,
      alpha: 0.35 + Math.random() * 0.55
    }));

    function toggleChallenge() {
      challenge.active = !challenge.active;
      if (challenge.active) {
        challenge.timeLeft = 30.0;
        player.flame = 100;
        player.dodges = 0;
        gusts.length = 0;
        if (mode === 'telemetry') {
          mode = 'flame';
          modeBtns.forEach((b) => {
            const act = b.dataset.heroMode === 'flame';
            b.classList.toggle('active', act);
            b.setAttribute('aria-selected', act ? 'true' : 'false');
          });
        }
        if (challengeBtn) challengeBtn.textContent = 'Arrêter le défi';
        canvas.focus({ preventScroll: true });
        setActiveArena('hero');
        playSfx('relay');
        showToast('Défi survie 30s lancé : esquivez les rafales des 3 phases.');
      } else if (challengeBtn) {
        challengeBtn.textContent = 'Défi survie 30s';
      }
    }

    if (challengeBtn) challengeBtn.addEventListener('click', toggleChallenge);

    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        mode = btn.dataset.heroMode || 'flame';
      });
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const dx = nx - lastMouseX;
      pointerWind = Math.max(-18, Math.min(18, dx * 0.55));
      pointerSpeed = Math.min(40, Math.abs(dx));
      lastMouseX = nx;
    });

    function triggerJumpOrRevive() {
      if (player.grounded) {
        player.vy = -12.4;
        player.grounded = false;
        player.jumpCount = 1;
        player.scaleX = 0.84;
        player.scaleY = 1.2;
        playSfx('jump');
      } else if (player.jumpCount === 1 && player.reviveCooldown <= 0) {
        player.vy = Math.min(player.vy, -6.4);
        player.jumpCount = 2;
        player.reviveWave = 1;
        player.reviveCooldown = 120;
        player.flame = Math.max(25, player.flame - 8);
        player.successTimer = 95;
        gusts.forEach((g) => {
          if (Math.hypot(g.x - player.x, g.y - (player.y - 60)) < 260) {
            g.alive = false;
            player.dodges += 1;
          }
        });
        sisters.forEach((s) => {
          if (Math.abs(s.x - player.x) < 420 && s.state > 0) s.state -= 1;
        });
        playSfx('revive');
        completeMission('hero', 'Esquive et ravivage sur le gâteau');
      }
    }

    canvas.addEventListener('click', () => {
      canvas.focus({ preventScroll: true });
      setActiveArena('hero');
      if (mode === 'telemetry') {
        playSfx('relay');
      }
    });

    arenaHooks.hero = {
      onKeyDown(e, dir) {
        if (mode === 'telemetry') {
          if (e.code === 'Space') {
            pointerSpeed = 30;
            playSfx('relay');
            return true;
          }
          return false;
        }
        if (e.code === 'Space' || dir === 'UP') {
          triggerJumpOrRevive();
          return true;
        }
        return dir === 'LEFT' || dir === 'RIGHT';
      }
    };

    function updateHeroGame() {
      t += 1;
      pointerSpeed *= 0.92;
      pointerWind *= 0.9;
      if (player.reviveCooldown > 0) player.reviveCooldown -= 1;
      if (player.successTimer > 0) player.successTimer -= 1;
      if (player.dangerTimer > 0) player.dangerTimer -= 1;
      if (player.reviveWave > 0) player.reviveWave = Math.max(0, player.reviveWave - 0.045);

      if (player.blinkTimer > 0) {
        player.blinkTimer -= 1;
      } else {
        player.blinkTimer = 140 + Math.floor(Math.random() * 140);
      }

      if (challenge.active) {
        challenge.timeLeft = Math.max(0, challenge.timeLeft - 1 / 60);
        if (player.flame <= 0) {
          challenge.active = false;
          if (challengeBtn) challengeBtn.textContent = 'Défi survie 30s';
          playSfx('hit');
          showToast(`Défi échoué : flamme éteinte (${player.dodges} esquives).`);
        } else if (challenge.timeLeft <= 0) {
          challenge.active = false;
          challenge.best = Math.max(challenge.best, player.dodges);
          if (challengeBtn) challengeBtn.textContent = 'Défi survie 30s';
          completeMission('hero', 'Défi 30s La Dernière Bougie réussi');
          showToast(`Défi 30s réussi : ${player.dodges} esquives (record ${challenge.best}).`);
        }
      }

      if (activeArena === 'hero' && mode !== 'telemetry') {
        const accel = 0.85;
        if (keysHeld.has('LEFT')) player.vx -= accel;
        if (keysHeld.has('RIGHT')) player.vx += accel;
      }

      player.vx *= 0.84;
      player.vx = Math.max(-7.5, Math.min(7.5, player.vx));
      player.x += player.vx;

      if (player.x < cakeLeft + 44) {
        player.x = cakeLeft + 44;
        player.vx *= -0.2;
      } else if (player.x > cakeRight - 44) {
        player.x = cakeRight - 44;
        player.vx *= -0.2;
      }

      player.vy += 0.58;
      player.y += player.vy;
      if (player.y >= groundY) {
        if (!player.grounded && player.vy > 4) {
          player.scaleX = 1.18;
          player.scaleY = 0.84;
        }
        player.y = groundY;
        player.vy = 0;
        player.grounded = true;
        player.jumpCount = 0;
      }

      const breath = 1 + Math.sin(t * 0.08) * 0.025;
      player.scaleX += (1 / Math.sqrt(breath) - player.scaleX) * 0.18;
      player.scaleY += (breath - player.scaleY) * 0.18;
      player.lean += (player.vx * 0.045 + pointerWind * 0.01 - player.lean) * 0.2;

      const phaseSpeedFactor = challenge.active
        ? (challenge.timeLeft <= 10 ? 1.55 : challenge.timeLeft <= 20 ? 1.25 : 1.0)
        : 1.0;

      sisters.forEach((s) => {
        s.windCharge -= phaseSpeedFactor;
        if (s.windCharge <= 0) {
          s.state = (s.state + 1) % 3;
          s.windCharge = 125 + Math.floor(Math.random() * 85);
          if (s.state >= 1 || challenge.active) {
            gusts.push({
              x: s.x + s.side * 34,
              y: groundY - 46 - Math.random() * 48,
              vx: s.side * (3.6 + Math.random() * 1.4) * phaseSpeedFactor,
              life: 240,
              alive: true,
              passed: false
            });
          }
        }
      });

      for (let i = gusts.length - 1; i >= 0; i--) {
        const g = gusts[i];
        g.x += g.vx;
        g.life -= 1;
        const distPlayer = Math.hypot(g.x - player.x, g.y - (player.y - 64));
        if (distPlayer < 38) {
          g.alive = false;
          player.flame = Math.max(challenge.active ? 0 : 20, player.flame - 16);
          player.dangerTimer = 55;
          playSfx('hit');
        } else if (!g.passed && Math.abs(g.x - player.x) < 12 && Math.abs(g.y - (player.y - 64)) >= 38) {
          g.passed = true;
          player.dodges += 1;
          player.successTimer = 42;
          if (player.dodges >= 1 && activeArena === 'hero' && (player.vy !== 0 || Math.abs(player.vx) > 0.4)) {
            completeMission('hero', 'Esquive sur La Dernière Bougie');
          }
        }
        if (!g.alive || g.life <= 0 || g.x < 40 || g.x > canvas.width - 40) {
          gusts.splice(i, 1);
        }
      }

      if (player.dangerTimer <= 0 && !challenge.active) {
        player.flame = Math.min(100, player.flame + 0.08);
      }
    }

    function drawOrganicFlame(fx, fy, height, windOffset, isWireframe, pal) {
      const sway1 = Math.sin(t * 0.17) * 3.5 + Math.cos(t * 0.29) * 1.8;
      const sway2 = Math.sin(t * 0.23 + 1.1) * 4.5;
      const tipX = fx + windOffset + sway1;
      const tipY = fy - height;

      if (isWireframe) {
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.bezierCurveTo(fx - 18, fy - height * 0.35, tipX - 10, tipY + height * 0.28, tipX, tipY);
        ctx.bezierCurveTo(tipX + 10, tipY + height * 0.28, fx + 18, fy - height * 0.35, fx, fy);
        ctx.stroke();

        ctx.strokeStyle = pal.accentWarm;
        ctx.beginPath();
        ctx.moveTo(fx, fy - 2);
        ctx.quadraticCurveTo(fx - 8, fy - height * 0.3, fx + windOffset * 0.5, fy - height * 0.56);
        ctx.quadraticCurveTo(fx + 8, fy - height * 0.3, fx, fy - 2);
        ctx.stroke();
        return;
      }

      const halo = ctx.createRadialGradient(fx + windOffset * 0.3, fy - height * 0.45, 4, fx, fy - height * 0.45, height * 2.1);
      halo.addColorStop(0, pal.accentSoft);
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(fx, fy - height * 0.45, height * 2.1, 0, Math.PI * 2);
      ctx.fill();

      const outerGrad = ctx.createLinearGradient(fx, fy, tipX, tipY);
      outerGrad.addColorStop(0, pal.accentDeep);
      outerGrad.addColorStop(0.55, pal.accent);
      outerGrad.addColorStop(1, pal.accentWarm);
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 2);
      ctx.bezierCurveTo(fx - 20, fy - height * 0.3, tipX - 11 + sway2 * 0.3, tipY + height * 0.32, tipX, tipY);
      ctx.bezierCurveTo(tipX + 11 + sway2 * 0.3, tipY + height * 0.32, fx + 20, fy - height * 0.3, fx, fy + 2);
      ctx.fill();

      const midX = fx + windOffset * 0.65 + sway2 * 0.4;
      const midY = fy - height * 0.66;
      ctx.fillStyle = '#f5d076';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(fx - 10, fy - height * 0.2, midX - 6, midY + 8, midX, midY);
      ctx.bezierCurveTo(midX + 6, midY + 8, fx + 10, fy - height * 0.2, fx, fy);
      ctx.fill();

      ctx.fillStyle = '#fff4df';
      ctx.beginPath();
      ctx.ellipse(fx + windOffset * 0.2, fy - height * 0.16, 4.2, height * 0.16, windOffset * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawSisterCandle(s, isWireframe, pal) {
      const bob = Math.sin(t * 0.07 + s.phase) * 2.5;
      const topY = s.y - 78 + bob;
      const w = 36;
      const h = 76 - bob;

      ctx.save();
      ctx.translate(s.x, 0);

      if (isWireframe) {
        ctx.strokeStyle = s.state === 2 ? pal.accent : pal.muted;
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2, topY, w, h);
        ctx.beginPath();
        ctx.ellipse(0, topY, w / 2, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pal.shadow;
        ctx.beginPath();
        ctx.ellipse(0, s.y + 2, 24, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const col = s.state === 2 ? pal.sisterAngry : s.state === 1 ? pal.sisterSad : pal.sisterCalm;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(-w / 2, topY, w, h, [6, 6, 4, 4]);
        ctx.fill();

        ctx.fillStyle = pal.rule;
        ctx.beginPath();
        ctx.ellipse(0, topY + 1, w / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = s.state === 2 ? pal.accent : pal.faceInk;
        ctx.beginPath();
        ctx.arc(s.side * 4 - 6, topY + 26, 2.8, 0, Math.PI * 2);
        ctx.arc(s.side * 4 + 6, topY + 26, 2.8, 0, Math.PI * 2);
        ctx.fill();

        if (s.state === 2) {
          ctx.strokeStyle = pal.faceInk;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.side * 4 - 10, topY + 20);
          ctx.lineTo(s.side * 4 - 2, topY + 23);
          ctx.moveTo(s.side * 4 + 10, topY + 20);
          ctx.lineTo(s.side * 4 + 2, topY + 23);
          ctx.stroke();
        }
      }

      ctx.strokeStyle = pal.muted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(s.side * 4, topY - 10);
      ctx.stroke();

      ctx.restore();
    }

    function drawCandle25D(isWireframe, pal) {
      ctx.save();

      ctx.strokeStyle = isWireframe ? pal.accent : pal.rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(32, groundY + 18);
      ctx.lineTo(canvas.width - 32, groundY + 18);
      ctx.stroke();

      const cakeW = cakeRight - cakeLeft;
      if (isWireframe) {
        ctx.strokeStyle = pal.muted;
        ctx.strokeRect(cakeLeft, groundY - 4, cakeW, 22);
        for (let x = cakeLeft + 80; x < cakeRight; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, groundY - 4);
          ctx.lineTo(x, groundY + 18);
          ctx.stroke();
        }
      } else {
        const cakeGrad = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 20);
        cakeGrad.addColorStop(0, pal.cakeTop);
        cakeGrad.addColorStop(1, pal.cakeBottom);
        ctx.fillStyle = cakeGrad;
        ctx.fillRect(cakeLeft, groundY - 2, cakeW, 20);

        ctx.strokeStyle = pal.rule;
        ctx.beginPath();
        ctx.moveTo(cakeLeft, groundY - 2);
        ctx.lineTo(cakeRight, groundY - 2);
        ctx.stroke();
      }

      sisters.forEach((s) => drawSisterCandle(s, isWireframe, pal));

      gusts.forEach((g) => {
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(g.x - g.vx * 5, g.y - 4);
        ctx.quadraticCurveTo(g.x, g.y + 4, g.x + g.vx * 3, g.y - 2);
        ctx.stroke();

        ctx.strokeStyle = pal.muted;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(g.x - g.vx * 7, g.y + 5);
        ctx.lineTo(g.x + g.vx * 2, g.y + 5);
        ctx.stroke();
      });

      const heightRatio = Math.max(0.35, 1 - (groundY - player.y) / 180);
      if (!isWireframe) {
        ctx.fillStyle = pal.shadow;
        ctx.beginPath();
        ctx.ellipse(player.x, groundY + 2, 34 * heightRatio, 7 * heightRatio, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (player.reviveWave > 0) {
        const ringR = (1 - player.reviveWave) * 190 + 28;
        ctx.strokeStyle = pal.accent;
        ctx.globalAlpha = player.reviveWave * 0.85;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(player.x, player.y - 56, ringR, ringR * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      const bodyW = 60;
      const bodyH = 114;
      const halfW = bodyW / 2;

      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.lean);
      ctx.scale(player.scaleX, player.scaleY);

      if (isWireframe) {
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 1.1;
        ctx.strokeRect(-halfW, -bodyH, bodyW, bodyH);
        ctx.beginPath();
        ctx.ellipse(0, -bodyH, halfW, 7, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, halfW, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let r = 1; r < 5; r++) {
          const y = (-bodyH / 5) * r;
          ctx.beginPath();
          ctx.ellipse(0, y, halfW, 5, 0, 0, Math.PI);
          ctx.stroke();
        }
        for (let c = -2; c <= 2; c++) {
          const x = (halfW / 2.5) * c;
          ctx.beginPath();
          ctx.moveTo(x, -bodyH);
          ctx.lineTo(x, 0);
          ctx.stroke();
        }
      } else {
        const waxGrad = ctx.createLinearGradient(-halfW, -bodyH, halfW, -bodyH);
        waxGrad.addColorStop(0, pal.waxMid);
        waxGrad.addColorStop(0.28, pal.waxLight);
        waxGrad.addColorStop(0.68, pal.waxMid);
        waxGrad.addColorStop(1, pal.waxDark);
        ctx.fillStyle = waxGrad;

        ctx.beginPath();
        ctx.moveTo(-halfW, -4);
        ctx.lineTo(-halfW + 1, -bodyH);
        ctx.bezierCurveTo(-halfW + 1, -bodyH - 7, halfW - 1, -bodyH - 7, halfW - 1, -bodyH);
        ctx.lineTo(halfW, -4);
        ctx.bezierCurveTo(halfW, 4, -halfW, 4, -halfW, -4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = pal.rule;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = pal.waxLight;
        drips.forEach((d) => {
          const dripH = d.len + Math.sin(t * 0.04 + d.ox) * 1.4;
          ctx.beginPath();
          ctx.roundRect(d.ox - 4, -bodyH + 1, 8, dripH, 4);
          ctx.fill();
        });

        const poolGrad = ctx.createRadialGradient(0, -bodyH, 3, 0, -bodyH, halfW);
        poolGrad.addColorStop(0, '#f5d076');
        poolGrad.addColorStop(0.45, pal.accent);
        poolGrad.addColorStop(1, pal.waxDark);
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.ellipse(0, -bodyH + 1, halfW - 2, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const lookX = Math.max(-2.6, Math.min(2.6, player.vx * 0.45));
        const inDanger = player.dangerTimer > 0 || pointerSpeed > 15;
        const inSuccess = player.successTimer > 0;
        const blink = player.blinkTimer < 6;

        ctx.fillStyle = pal.faceInk;
        ctx.strokeStyle = pal.faceInk;
        ctx.lineWidth = 2.2;

        if (blink) {
          ctx.beginPath();
          ctx.moveTo(-16, -bodyH + 46);
          ctx.lineTo(-7, -bodyH + 46);
          ctx.moveTo(7, -bodyH + 46);
          ctx.lineTo(16, -bodyH + 46);
          ctx.stroke();
        } else if (inSuccess) {
          ctx.beginPath();
          ctx.arc(-11, -bodyH + 47, 5, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(11, -bodyH + 47, 5, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          const eyeR = inDanger ? 5.2 : 4.4;
          ctx.beginPath();
          ctx.arc(-11 + lookX, -bodyH + 46, eyeR, 0, Math.PI * 2);
          ctx.arc(11 + lookX, -bodyH + 46, eyeR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff4df';
          ctx.beginPath();
          ctx.arc(-12.2 + lookX, -bodyH + 44.5, 1.5, 0, Math.PI * 2);
          ctx.arc(9.8 + lookX, -bodyH + 44.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = pal.faceInk;
        ctx.lineWidth = 2.2;
        if (inDanger) {
          ctx.beginPath();
          ctx.moveTo(-17, -bodyH + 38);
          ctx.lineTo(-7, -bodyH + 35);
          ctx.moveTo(7, -bodyH + 35);
          ctx.lineTo(17, -bodyH + 38);
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(0, -bodyH + 64, 4.5, 6.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0 + lookX * 0.4, -bodyH + 56, inSuccess ? 10 : 8, 0.14 * Math.PI, 0.86 * Math.PI);
          ctx.stroke();
        }
      }

      const flameDrag = -player.vx * 2.1 + pointerWind * 0.85;
      const wickTipX = flameDrag * 0.25;
      const wickTopY = -bodyH - 13;

      ctx.strokeStyle = pal.rule;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -bodyH);
      ctx.quadraticCurveTo(wickTipX * 0.4, -bodyH - 6, wickTipX, wickTopY);
      ctx.stroke();

      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(wickTipX, wickTopY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      const flameH = Math.max(28, 36 + (player.flame / 100) * 18 - pointerSpeed * 0.4) + Math.sin(t * 0.15) * 3.5;
      drawOrganicFlame(wickTipX, wickTopY, flameH, flameDrag, isWireframe, pal);

      ctx.restore();

      embers.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + player.vx * 0.15 + pointerWind * 0.04;
        if (p.y < player.y - bodyH - 110 || p.y < 14) {
          p.y = player.y - bodyH - 22;
          p.x = player.x + (Math.random() - 0.5) * 26;
        }
        ctx.fillStyle = pal.accent;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
      });

      ctx.restore();

      if (exprLabel && teleLabel) {
        if (challenge.active) {
          const pNum = challenge.timeLeft <= 10 ? 3 : challenge.timeLeft <= 20 ? 2 : 1;
          exprLabel.textContent = `Défi Phase ${pNum} : ${challenge.timeLeft.toFixed(1)}s`;
          teleLabel.textContent = `Flamme : ${Math.round(player.flame)}% | Esquives : ${player.dodges}`;
        } else if (isWireframe) {
          exprLabel.textContent = 'Maillage Blender : Mode filaire animé';
          teleLabel.textContent = 'Pipeline 2.5D actif (ZQSD et Espace)';
        } else {
          const stateText =
            player.dangerTimer > 0
              ? 'Danger (rafale)'
              : player.successTimer > 0
                ? 'Réussite (ravivage)'
                : 'Sécurité';
          exprLabel.textContent = `État joueur : ${stateText}`;
          teleLabel.textContent = `Flamme : ${Math.round(player.flame)}% | ZQSD / Espace`;
        }
      }
      if (scoreLabel) {
        scoreLabel.textContent = challenge.best > 0
          ? `Esquives : ${player.dodges} (Record Défi : ${challenge.best})`
          : `Esquives : ${player.dodges}`;
      }
    }

    function drawTelemetryBus(pal) {
      ctx.save();
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const ampBoost = 1 + pointerSpeed * 0.04;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 24; x < canvas.width - 24; x += 6) {
        const wave = (Math.sin((x + t * 3) * 0.03) * 32 + Math.cos((x - t * 2) * 0.07) * 12) * ampBoost;
        const y = canvas.height * 0.36 + wave;
        if (x === 24) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 24; x < canvas.width - 24; x += 6) {
        const sq = Math.sin((x + t * 4) * 0.035) > 0 ? -20 : 20;
        const y = canvas.height * 0.74 + sq;
        if (x === 24) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = pal.accent;
      ctx.font = '14px "Barlow", sans-serif';
      ctx.fillText('Canal 1 : Trames NMEA GPS et Blynk (ESP32 Wi-Fi)', 28, 34);
      ctx.fillStyle = pal.ink;
      ctx.fillText('Canal 2 : Ping ultrasons HC-SR04 et signaux PWM moteurs (Espace pour impulser)', 28, canvas.height * 0.62);
      ctx.restore();

      if (exprLabel && teleLabel) {
        exprLabel.textContent = 'Bus ESP32 : Signal matériel actif';
        teleLabel.textContent = 'Synchronisation Godot et capteurs nominale';
      }
    }

    function loop() {
      const pal = getCanvasPalette();
      updateHeroGame();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'telemetry') {
        drawTelemetryBus(pal);
      } else {
        drawCandle25D(mode === 'wireframe', pal);
      }

      requestAnimationFrame(loop);
    }

    loop();
  }

  /* =========================================================
     FILTRES PROJETS
     ========================================================= */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        cards.forEach((card) => {
          const cats = (card.dataset.categories || '').split(' ');
          const show = filter === 'all' || cats.includes(filter);
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  /* =========================================================
     PROJET 1 : SIMULATEUR ROBOT VOITURE ESP32 + GODOT (CLAVIER + CLIC GPS)
     ========================================================= */
  function initRoverSimulator() {
    const canvas = document.getElementById('roverCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const modeBtns = document.querySelectorAll('.rover-mode-btn');
    const dirBtns = document.querySelectorAll('[data-rover-dir]');
    const badgeEl = document.getElementById('roverStateBadge');
    const latEl = document.getElementById('roverLat');
    const lonEl = document.getElementById('roverLon');
    const ultraEl = document.getElementById('roverUltrasonic');
    const pwmEl = document.getElementById('roverPwm');

    let roverMode = 'manual';
    let manualCmd = 'stop';

    const rover = { x: 140, y: canvas.height / 2, angle: 0, speed: 0 };
    let waypoint = { x: canvas.width - 180, y: 100 };
    const obstacles = [
      { x: 420, y: 85, r: 26 },
      { x: 560, y: 215, r: 30 },
      { x: 820, y: 140, r: 24 }
    ];

    function switchMode(newMode) {
      roverMode = newMode;
      modeBtns.forEach((b) => b.classList.toggle('active', b.dataset.roverMode === newMode));
      if (badgeEl) {
        const labels = {
          manual: 'Mode : Manuel Godot (ZQSD / Flèches)',
          gps: 'Mode : Suivi GPS',
          auto: 'Mode : Évitement autonome'
        };
        badgeEl.textContent = labels[newMode] || 'Mode : Actif';
      }
    }

    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        switchMode(btn.dataset.roverMode || 'manual');
        playSfx('relay');
        completeMission('rover', 'Pilotage robot ESP32');
      });
    });

    dirBtns.forEach((btn) => {
      const startCmd = () => {
        manualCmd = btn.dataset.roverDir || 'stop';
        if (roverMode !== 'manual') switchMode('manual');
        completeMission('rover', 'Pilotage robot ESP32');
      };
      const stopCmd = () => {
        if (btn.dataset.roverDir !== 'stop') manualCmd = 'stop';
      };
      btn.addEventListener('mousedown', startCmd);
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startCmd();
      });
      btn.addEventListener('mouseup', stopCmd);
      btn.addEventListener('mouseleave', stopCmd);
      btn.addEventListener('touchend', stopCmd);
    });

    canvas.addEventListener('click', (e) => {
      canvas.focus({ preventScroll: true });
      setActiveArena('rover');
      const rect = canvas.getBoundingClientRect();
      waypoint.x = Math.max(40, Math.min(canvas.width - 40, ((e.clientX - rect.left) / rect.width) * canvas.width));
      waypoint.y = Math.max(30, Math.min(canvas.height - 30, ((e.clientY - rect.top) / rect.height) * canvas.height));
      switchMode('gps');
      playSfx('relay');
      completeMission('rover', 'Point GPS défini sur la carte');
    });

    arenaHooks.rover = {
      onKeyDown(e, dir) {
        if (e.code === 'Space') {
          manualCmd = 'stop';
          switchMode('manual');
          playSfx('relay');
          return true;
        }
        if (dir) {
          if (roverMode !== 'manual') switchMode('manual');
          completeMission('rover', 'Conduite clavier robot ESP32');
          return true;
        }
        return false;
      }
    };

    function measureUltrasonic() {
      let minDist = 240;
      const fx = Math.cos(rover.angle);
      const fy = Math.sin(rover.angle);
      obstacles.forEach((obs) => {
        const dx = obs.x - rover.x;
        const dy = obs.y - rover.y;
        const proj = dx * fx + dy * fy;
        if (proj > 0 && proj < 240) {
          const perp = Math.abs(dx * -fy + dy * fx);
          if (perp < obs.r + 18) {
            minDist = Math.min(minDist, Math.max(8, Math.round(proj - obs.r)));
          }
        }
      });
      return minDist;
    }

    function updateRover() {
      const dist = measureUltrasonic();
      let leftPwm = 0;
      let rightPwm = 0;

      const kbUp = activeArena === 'rover' && keysHeld.has('UP');
      const kbDown = activeArena === 'rover' && keysHeld.has('DOWN');
      const kbLeft = activeArena === 'rover' && keysHeld.has('LEFT');
      const kbRight = activeArena === 'rover' && keysHeld.has('RIGHT');

      if (roverMode === 'manual') {
        const goUp = kbUp || manualCmd === 'up';
        const goDown = kbDown || manualCmd === 'down';
        const goLeft = kbLeft || manualCmd === 'left';
        const goRight = kbRight || manualCmd === 'right';

        if (goUp) {
          rover.speed = 2.6;
          leftPwm = 85;
          rightPwm = 85;
        } else if (goDown) {
          rover.speed = -1.8;
          leftPwm = -60;
          rightPwm = -60;
        } else {
          rover.speed = 0;
        }

        if (goLeft) {
          rover.angle -= 0.055;
          if (!goUp && !goDown) rover.speed = 0.6;
          leftPwm = 25;
          rightPwm = 75;
        } else if (goRight) {
          rover.angle += 0.055;
          if (!goUp && !goDown) rover.speed = 0.6;
          leftPwm = 75;
          rightPwm = 25;
        }
      } else if (roverMode === 'gps') {
        const dx = waypoint.x - rover.x;
        const dy = waypoint.y - rover.y;
        const distWp = Math.hypot(dx, dy);
        if (distWp < 22) {
          waypoint.x = 80 + Math.random() * (canvas.width - 160);
          waypoint.y = 50 + Math.random() * (canvas.height - 100);
        }
        const targetAngle = Math.atan2(dy, dx);
        let diff = targetAngle - rover.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        rover.angle += Math.max(-0.05, Math.min(0.05, diff));
        if (dist < 50) {
          rover.angle += 0.09;
        }
        rover.speed = 2.1;
        leftPwm = Math.round(70 - diff * 20);
        rightPwm = Math.round(70 + diff * 20);
      } else if (roverMode === 'auto') {
        if (dist < 64) {
          rover.angle += 0.075;
          rover.speed = 0.9;
          leftPwm = 75;
          rightPwm = -40;
        } else {
          rover.speed = 2.2;
          leftPwm = 82;
          rightPwm = 82;
        }
      }

      const nx = rover.x + Math.cos(rover.angle) * rover.speed;
      const ny = rover.y + Math.sin(rover.angle) * rover.speed;

      if (nx < 24 || nx > canvas.width - 24) {
        rover.angle = Math.PI - rover.angle;
      } else {
        rover.x = nx;
      }
      if (ny < 24 || ny > canvas.height - 24) {
        rover.angle = -rover.angle;
      } else {
        rover.y = ny;
      }

      const lat = (6.418 + (rover.y / canvas.height) * 0.004).toFixed(5);
      const lon = (2.341 + (rover.x / canvas.width) * 0.008).toFixed(5);
      if (latEl) latEl.textContent = `${lat}° N`;
      if (lonEl) lonEl.textContent = `${lon}° E`;
      if (ultraEl) ultraEl.textContent = `${dist} cm`;
      if (pwmEl) pwmEl.textContent = `G:${leftPwm}% D:${rightPwm}%`;
    }

    function drawRover() {
      const pal = getCanvasPalette();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(waypoint.x, waypoint.y, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = pal.accent;
      ctx.font = '13px "Barlow", sans-serif';
      ctx.fillText('Cible GPS', waypoint.x - 24, waypoint.y - 16);

      obstacles.forEach((obs) => {
        ctx.fillStyle = pal.accentSoft;
        ctx.strokeStyle = pal.accentDeep;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.save();
      ctx.translate(rover.x, rover.y);
      ctx.rotate(rover.angle);

      ctx.fillStyle = pal.grid;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(120, -32);
      ctx.lineTo(120, 32);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pal.ink;
      ctx.fillRect(-15, -10, 30, 20);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(6, -7, 7, 14);
      ctx.restore();
    }

    function step() {
      updateRover();
      drawRover();
      requestAnimationFrame(step);
    }

    step();
  }

  /* =========================================================
     PROJET 2 : MAISON INTELLIGENTE ESP32 + BLYNK + SYNOPTIQUE MATÉRIEL
     ========================================================= */
  function initSmartHomeSimulator() {
    const homeCanvas = document.getElementById('homeCanvas');
    const tempSlider = document.getElementById('tempSlider');
    const tempValEl = document.getElementById('tempValue');
    const pirBtn = document.getElementById('pirTriggerBtn');
    const pirStatus = document.getElementById('pirStatus');
    const servoBtn = document.getElementById('servoToggleBtn');
    const servoAngleEl = document.getElementById('servoAngle');
    const relayBtn = document.getElementById('relayToggleBtn');
    const relayStateEl = document.getElementById('relayState');
    const ledBtn = document.getElementById('ledToggleBtn');
    const ledStateEl = document.getElementById('ledState');
    const autoCheck = document.getElementById('autoModeToggle');
    const lcd1 = document.getElementById('lcdLine1');
    const lcd2 = document.getElementById('lcdLine2');

    if (!tempSlider || !lcd1 || !lcd2) return;

    const home = {
      temp: 26,
      motion: false,
      servoOpen: false,
      relayOn: false,
      ledOn: false,
      servoDegAnim: 0,
      tick: 0
    };

    function renderHome() {
      if (autoCheck && autoCheck.checked) {
        home.relayOn = home.temp >= 30;
        if (home.motion) home.ledOn = true;
      }

      tempValEl.textContent = `${home.temp}°C`;
      pirStatus.textContent = home.motion ? 'Détecté' : 'Aucun';
      pirBtn.classList.toggle('is-on', home.motion);

      servoAngleEl.textContent = home.servoOpen ? '90° (Ouvert)' : '0° (Fermé)';
      servoBtn.classList.toggle('is-on', home.servoOpen);

      relayStateEl.textContent = home.relayOn ? 'Actif' : 'Éteint';
      relayBtn.classList.toggle('is-on', home.relayOn);

      ledStateEl.textContent = home.ledOn ? 'Allumée' : 'Éteinte';
      ledBtn.classList.toggle('is-on', home.ledOn);

      const line1 = `T:${home.temp}C MOV:${home.motion ? 'OUI' : 'NON'}`.padEnd(16, ' ').slice(0, 16);
      const line2 = `SRV:${home.servoOpen ? '90' : '0 '} REL:${home.relayOn ? 'ON ' : 'OFF'}`.padEnd(16, ' ').slice(0, 16);
      lcd1.textContent = line1;
      lcd2.textContent = line2;
    }

    function toggleMotion() {
      home.motion = !home.motion;
      renderHome();
      playSfx('relay');
      completeMission('home', 'Capteur mouvement activé');
    }

    function toggleServo() {
      home.servoOpen = !home.servoOpen;
      renderHome();
      playSfx('relay');
      completeMission('home', 'Servomoteur actionné');
    }

    function toggleRelay() {
      if (autoCheck && autoCheck.checked) autoCheck.checked = false;
      home.relayOn = !home.relayOn;
      renderHome();
      playSfx('relay');
      completeMission('home', 'Relais commuté');
    }

    function toggleLed() {
      home.ledOn = !home.ledOn;
      renderHome();
      playSfx('relay');
      completeMission('home', 'Éclairage LED commuté');
    }

    tempSlider.addEventListener('input', () => {
      home.temp = Number(tempSlider.value);
      renderHome();
      completeMission('home', 'Automatisme maison ESP32 testé');
    });

    pirBtn.addEventListener('click', toggleMotion);
    servoBtn.addEventListener('click', toggleServo);
    relayBtn.addEventListener('click', toggleRelay);
    ledBtn.addEventListener('click', toggleLed);

    if (autoCheck) {
      autoCheck.addEventListener('change', renderHome);
    }

    if (homeCanvas) {
      homeCanvas.addEventListener('click', (e) => {
        homeCanvas.focus({ preventScroll: true });
        setActiveArena('home');
        const rect = homeCanvas.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        if (relX > 0.25 && relX <= 0.5) toggleMotion();
        else if (relX > 0.5 && relX <= 0.75) toggleServo();
        else if (relX > 0.75 && relX <= 0.89) toggleRelay();
        else if (relX > 0.89) toggleLed();
      });

      const hCtx = homeCanvas.getContext('2d');
      function drawHomeSchematic() {
        const pal = getCanvasPalette();
        home.tick += 1;
        const targetDeg = home.servoOpen ? Math.PI / 2 : 0;
        home.servoDegAnim += (targetDeg - home.servoDegAnim) * 0.16;

        hCtx.clearRect(0, 0, homeCanvas.width, homeCanvas.height);

        // Grille d'atelier PCB
        hCtx.strokeStyle = pal.grid;
        hCtx.lineWidth = 1;
        for (let x = 0; x < homeCanvas.width; x += 36) {
          hCtx.beginPath();
          hCtx.moveTo(x, 0);
          hCtx.lineTo(x, homeCanvas.height);
          hCtx.stroke();
        }

        // Lignes de bus ESP32 -> modules
        hCtx.strokeStyle = pal.rule;
        hCtx.lineWidth = 1.6;
        [68, 110, 152].forEach((y) => {
          hCtx.beginPath();
          hCtx.moveTo(210, y);
          hCtx.lineTo(1060, y);
          hCtx.stroke();
        });

        // Impulsion de données Blynk sur le bus
        const pktX = 210 + ((home.tick * 4) % 840);
        hCtx.fillStyle = pal.accent;
        hCtx.fillRect(pktX, 107, 14, 6);

        // Bloc 1 : Carte ESP32 DevKit + Blynk
        hCtx.fillStyle = pal.paper2;
        hCtx.strokeStyle = pal.accent;
        hCtx.lineWidth = 1.6;
        hCtx.fillRect(42, 34, 176, 152);
        hCtx.strokeRect(42, 34, 176, 152);
        hCtx.fillStyle = pal.ink;
        hCtx.font = '14px "Barlow", sans-serif';
        hCtx.fillText('ESP32-WROOM-32', 64, 72);
        hCtx.fillStyle = pal.muted;
        hCtx.font = '12px "Barlow", sans-serif';
        hCtx.fillText('Wi-Fi Blynk actif', 64, 96);
        hCtx.fillText(`Temp. : ${home.temp}°C`, 64, 124);
        hCtx.fillText(`Auto : ${autoCheck && autoCheck.checked ? 'Oui' : 'Manuel'}`, 64, 146);

        // Thermomètre analogique sous ESP32
        const barW = Math.round(((home.temp - 18) / 24) * 124);
        hCtx.fillStyle = pal.paper3;
        hCtx.fillRect(64, 160, 124, 8);
        hCtx.fillStyle = home.temp >= 30 ? pal.accent : pal.ink2;
        hCtx.fillRect(64, 160, barW, 8);

        // Bloc 2 : Capteur PIR Mouvement
        const pirCx = 420;
        const pirCy = 110;
        hCtx.fillStyle = pal.paper2;
        hCtx.strokeStyle = home.motion ? pal.accent : pal.rule;
        hCtx.fillRect(320, 34, 200, 152);
        hCtx.strokeRect(320, 34, 200, 152);
        hCtx.fillStyle = home.motion ? pal.accent : pal.muted;
        hCtx.beginPath();
        hCtx.arc(pirCx, pirCy + 10, 18, Math.PI, 0);
        hCtx.fill();
        if (home.motion) {
          for (let r = 1; r <= 2; r++) {
            const rad = 24 + ((home.tick * 0.7 + r * 14) % 34);
            hCtx.strokeStyle = pal.accent;
            hCtx.beginPath();
            hCtx.arc(pirCx, pirCy + 10, rad, Math.PI * 1.15, Math.PI * 1.85);
            hCtx.stroke();
          }
        }
        hCtx.fillStyle = pal.ink;
        hCtx.font = '13px "Barlow", sans-serif';
        hCtx.fillText('Capteur PIR (M)', 366, 164);

        // Bloc 3 : Servomoteur SG90
        const srvCx = 685;
        const srvCy = 112;
        hCtx.fillStyle = pal.paper2;
        hCtx.strokeStyle = home.servoOpen ? pal.accent : pal.rule;
        hCtx.fillRect(585, 34, 200, 152);
        hCtx.strokeRect(585, 34, 200, 152);

        hCtx.save();
        hCtx.translate(srvCx, srvCy);
        hCtx.fillStyle = pal.rule;
        hCtx.beginPath();
        hCtx.arc(0, 0, 16, 0, Math.PI * 2);
        hCtx.fill();
        hCtx.rotate(-home.servoDegAnim);
        hCtx.fillStyle = home.servoOpen ? pal.accent : pal.ink;
        hCtx.fillRect(-4, -4, 48, 8);
        hCtx.restore();

        hCtx.fillStyle = pal.ink;
        hCtx.fillText(`Servomoteur ${home.servoOpen ? '90°' : '0°'} (V)`, 620, 164);

        // Bloc 4 : Relais 5V & LED
        hCtx.fillStyle = pal.paper2;
        hCtx.strokeStyle = home.relayOn || home.ledOn ? pal.accent : pal.rule;
        hCtx.fillRect(850, 34, 260, 152);
        hCtx.strokeRect(850, 34, 260, 152);

        // Contact relais
        hCtx.strokeStyle = pal.ink;
        hCtx.lineWidth = 2;
        hCtx.beginPath();
        hCtx.moveTo(885, 94);
        hCtx.lineTo(920, home.relayOn ? 94 : 74);
        hCtx.stroke();
        hCtx.fillStyle = home.relayOn ? pal.accent : pal.muted;
        hCtx.beginPath();
        hCtx.arc(926, 94, 5, 0, Math.PI * 2);
        hCtx.fill();
        hCtx.fillStyle = pal.ink;
        hCtx.fillText('Relais (R)', 880, 164);

        // LED
        const ledX = 1045;
        const ledY = 92;
        if (home.ledOn) {
          const glow = hCtx.createRadialGradient(ledX, ledY, 4, ledX, ledY, 32);
          glow.addColorStop(0, pal.accentSoft);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          hCtx.fillStyle = glow;
          hCtx.beginPath();
          hCtx.arc(ledX, ledY, 32, 0, Math.PI * 2);
          hCtx.fill();
        }
        hCtx.fillStyle = home.ledOn ? pal.accentWarm : pal.muted;
        hCtx.beginPath();
        hCtx.arc(ledX, ledY, 13, 0, Math.PI * 2);
        hCtx.fill();
        hCtx.fillStyle = pal.ink;
        hCtx.fillText('LED (L)', 1022, 164);

        requestAnimationFrame(drawHomeSchematic);
      }
      drawHomeSchematic();
    }

    arenaHooks.home = {
      onKeyDown(e, dir) {
        const k = (e.key || '').toLowerCase();
        if (k === 'm') {
          toggleMotion();
          return true;
        }
        if (k === 'v') {
          toggleServo();
          return true;
        }
        if (k === 'r') {
          toggleRelay();
          return true;
        }
        if (k === 'l') {
          toggleLed();
          return true;
        }
        if (dir === 'UP' || dir === 'DOWN') {
          const delta = dir === 'UP' ? 1 : -1;
          home.temp = Math.max(18, Math.min(42, home.temp + delta));
          tempSlider.value = String(home.temp);
          renderHome();
          completeMission('home', 'Température ESP32 ajustée');
          return true;
        }
        return false;
      }
    };

    renderHome();
  }

  /* =========================================================
     PROJET 3 : SANDBOX FSM ET AUDIO 3 PHASES (RACCOURCIS CLAVIER)
     ========================================================= */
  function initCandleFsmSimulator() {
    const stage = document.getElementById('candleStage');
    const timerSlider = document.getElementById('timerSlider');
    const timerLabel = document.getElementById('timerRemainingLabel');
    const flameBar = document.getElementById('playerFlameBar');
    const flameValEl = document.getElementById('playerFlameValue');
    const cooldownBadge = document.getElementById('ravivageCooldownBadge');
    const audioBadge = document.getElementById('audioPhaseBadge');
    const audioRule = document.getElementById('audioPhaseRule');
    const victoryBadge = document.getElementById('victoryStatusBadge');
    const missedBlowBtn = document.getElementById('simMissedBlowBtn');
    const ravivageBtn = document.getElementById('simRavivageBtn');
    const resetBtn = document.getElementById('simResetFsmBtn');

    if (!stage || !timerSlider) return;

    const statesOrder = ['joyeuse', 'triste', 'mechante'];
    const labelsMap = { joyeuse: 'Joyeuse', triste: 'Triste', mechante: 'Méchante' };
    let candles = [
      { id: 0, name: 'Sœur A', stateIndex: 0 },
      { id: 1, name: 'Sœur B', stateIndex: 1 },
      { id: 2, name: 'Sœur C', stateIndex: 0 }
    ];
    let selectedId = 1;
    let playerFlame = 100;
    let elapsed = 0;
    let cooldownLeft = 0;
    let cooldownTimer = null;

    function computeAudioAndRender() {
      const remaining = 90 - elapsed;
      const wickedCount = candles.filter((c) => statesOrder[c.stateIndex] === 'mechante').length;

      let phase = 1;
      let ruleTxt = `Règle : Phase 1 calme (${wickedCount} sur 3 méchantes)`;
      if (remaining <= 30) {
        phase = 3;
        ruleTxt = 'Règle : Dernier tiers du chrono, Phase 3 prioritaire';
      } else if (wickedCount >= 1) {
        phase = 2;
        ruleTxt = `Règle : Un tiers atteint (${wickedCount} sur 3 méchantes), Phase 2`;
      }

      if (audioBadge) audioBadge.textContent = `Audio : Phase ${phase}`;
      if (audioRule) audioRule.textContent = ruleTxt;
      if (timerLabel) timerLabel.textContent = `${remaining}s sur 90s restantes`;

      if (flameBar) flameBar.style.transform = `scaleX(${playerFlame / 100})`;
      if (flameValEl) flameValEl.textContent = `${playerFlame}%`;

      if (victoryBadge) {
        if (playerFlame <= 0) {
          victoryBadge.textContent = 'Condition : Flamme éteinte, défaite';
        } else if (remaining === 0) {
          victoryBadge.textContent = 'Condition : Survie complète, niveau 2 débloqué';
        } else {
          victoryBadge.textContent = 'Condition : En cours de survie';
        }
      }

      stage.innerHTML = '';
      candles.forEach((c) => {
        const st = statesOrder[c.stateIndex];
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `sim-candle${c.id === selectedId ? ' selected' : ''}`;
        card.dataset.state = st;
        card.innerHTML = `
          <span class="candle-glyph num">${labelsMap[st]}</span>
          <span class="candle-name">${c.name}</span>
          <span class="candle-state-badge">${c.id === selectedId ? 'Ciblée' : 'Sélectionner'}</span>
        `;
        card.addEventListener('click', () => {
          selectedId = c.id;
          computeAudioAndRender();
        });
        stage.appendChild(card);
      });
    }

    function triggerMissedBlow() {
      const c = candles[selectedId];
      if (c.stateIndex < 2) {
        c.stateIndex += 1;
      } else {
        playerFlame = Math.max(0, playerFlame - 10);
      }
      playSfx('hit');
      computeAudioAndRender();
      completeMission('fsm', 'Machine à états La Dernière Bougie');
    }

    function triggerRavivage() {
      if (cooldownLeft > 0) {
        showToast(`Ravivage en attente (${cooldownLeft}s)`);
        return;
      }
      if (playerFlame <= 20) {
        showToast('Jauge de flamme insuffisante pour raviver.');
        return;
      }
      candles[selectedId].stateIndex = 0;
      playerFlame = Math.max(0, playerFlame - 20);
      cooldownLeft = 10;
      playSfx('revive');
      if (cooldownBadge) cooldownBadge.textContent = `Ravivage : Attente ${cooldownLeft}s`;

      clearInterval(cooldownTimer);
      cooldownTimer = setInterval(() => {
        cooldownLeft -= 1;
        if (cooldownLeft <= 0) {
          clearInterval(cooldownTimer);
          cooldownLeft = 0;
          if (cooldownBadge) cooldownBadge.textContent = 'Ravivage : Prêt';
        } else if (cooldownBadge) {
          cooldownBadge.textContent = `Ravivage : Attente ${cooldownLeft}s`;
        }
      }, 1000);

      computeAudioAndRender();
      completeMission('fsm', 'Saut et ravivage FSM');
    }

    timerSlider.addEventListener('input', () => {
      elapsed = Number(timerSlider.value);
      computeAudioAndRender();
      completeMission('fsm', 'Phase audio adaptative testée');
    });

    if (missedBlowBtn) missedBlowBtn.addEventListener('click', triggerMissedBlow);
    if (ravivageBtn) ravivageBtn.addEventListener('click', triggerRavivage);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        candles = [
          { id: 0, name: 'Sœur A', stateIndex: 0 },
          { id: 1, name: 'Sœur B', stateIndex: 1 },
          { id: 2, name: 'Sœur C', stateIndex: 0 }
        ];
        playerFlame = 100;
        elapsed = 0;
        timerSlider.value = '0';
        clearInterval(cooldownTimer);
        cooldownLeft = 0;
        if (cooldownBadge) cooldownBadge.textContent = 'Ravivage : Prêt';
        computeAudioAndRender();
      });
    }

    arenaHooks.fsm = {
      onKeyDown(e, dir) {
        if (dir === 'LEFT') {
          selectedId = (selectedId + 2) % 3;
          computeAudioAndRender();
          return true;
        }
        if (dir === 'RIGHT') {
          selectedId = (selectedId + 1) % 3;
          computeAudioAndRender();
          return true;
        }
        if (e.code === 'Space') {
          triggerRavivage();
          return true;
        }
        if (e.code === 'KeyF') {
          triggerMissedBlow();
          return true;
        }
        return false;
      }
    };

    computeAudioAndRender();
  }

  /* =========================================================
     PROJET 4 : RUNNER PROCÉDURAL JOUABLE AU CLAVIER
     ========================================================= */
  function initRunnerSimulator() {
    const canvas = document.getElementById('runnerCanvas');
    const slider = document.getElementById('runnerSpeedSlider');
    const modeBadge = document.getElementById('runnerModeBadge');
    const scoreBadge = document.getElementById('runnerScoreVal');
    const speedValEl = document.getElementById('runnerSpeedVal');
    const densityEl = document.getElementById('runnerDensityVal');
    const gapEl = document.getElementById('runnerGapVal');
    const playBtn = document.getElementById('runnerPlayBtn');
    const jumpBtn = document.getElementById('runnerJumpBtn');
    if (!canvas || !slider) return;

    const ctx = canvas.getContext('2d');
    const groundY = canvas.height - 42;
    let speedMult = 1.5;
    let playerY = groundY;
    let playerVy = 0;
    let spawnDist = 0;
    let obstacles = [{ x: 480, w: 22, h: 36, scored: false }];
    let playerMode = false;
    let gameOver = false;
    let score = 0;
    let best = 0;

    function syncRunnerHud() {
      const minGap = Math.round(250 - speedMult * 28);
      if (speedValEl) speedValEl.textContent = `Vitesse : ${speedMult.toFixed(1)}x`;
      if (gapEl) gapEl.textContent = `Espacement min. : ${minGap} px`;
      if (densityEl) {
        densityEl.textContent =
          speedMult < 1.8 ? 'Densité : Progressive' : speedMult < 2.7 ? 'Densité : Soutenue' : 'Densité : Intense';
      }
      if (modeBadge) {
        modeBadge.textContent = playerMode
          ? (gameOver ? 'Mode : Collision (Espace rejouer)' : 'Mode : Joueur Clavier actif')
          : 'Mode : Démo auto (Espace pour jouer)';
      }
      if (scoreBadge) {
        scoreBadge.textContent = `Score : ${score} (Record : ${best})`;
      }
      return minGap;
    }

    function startPlayerMode() {
      playerMode = true;
      gameOver = false;
      score = 0;
      playerY = groundY;
      playerVy = 0;
      spawnDist = 0;
      obstacles = [{ x: canvas.width - 140, w: 22, h: 36, scored: false }];
      if (playBtn) playBtn.textContent = 'Relancer au clavier';
      syncRunnerHud();
    }

    function triggerJump() {
      if (!playerMode || gameOver) {
        startPlayerMode();
      }
      if (playerY >= groundY - 2) {
        playerVy = -11.4;
        playSfx('jump');
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        canvas.focus({ preventScroll: true });
        setActiveArena('runner');
        startPlayerMode();
      });
    }

    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        canvas.focus({ preventScroll: true });
        setActiveArena('runner');
        triggerJump();
      });
    }

    canvas.addEventListener('click', () => {
      canvas.focus({ preventScroll: true });
      setActiveArena('runner');
      triggerJump();
    });

    arenaHooks.runner = {
      onKeyDown(e, dir) {
        if (e.code === 'Space' || dir === 'UP') {
          triggerJump();
          return true;
        }
        if (dir === 'DOWN' && playerMode && playerY < groundY) {
          playerVy = Math.max(playerVy, 7.5);
          return true;
        }
        return false;
      }
    };

    slider.addEventListener('input', () => {
      speedMult = Number(slider.value) / 10;
      syncRunnerHud();
    });

    function frame() {
      const pal = getCanvasPalette();
      const minGap = syncRunnerHud();
      const pxPerFrame = 3.2 * speedMult;

      if (!gameOver) {
        spawnDist += pxPerFrame;
        if (spawnDist >= minGap + Math.random() * 140) {
          spawnDist = 0;
          const tall = Math.random() > 0.45;
          obstacles.push({
            x: canvas.width + 20,
            w: tall ? 22 : 34,
            h: tall ? 46 : 26,
            scored: false
          });
        }

        obstacles.forEach((o) => {
          o.x -= pxPerFrame;
          if (playerMode && !o.scored && o.x + o.w < 110) {
            o.scored = true;
            score += 1;
            best = Math.max(best, score);
            playSfx('score');
            if (score >= 2) completeMission('arcade', 'Obstacles franchis au Runner');
          }
        });
        obstacles = obstacles.filter((o) => o.x + o.w > -10);

        if (!playerMode) {
          const incoming = obstacles.find((o) => o.x > 110 && o.x < 190);
          if (incoming && playerY >= groundY - 1) {
            playerVy = -10.8;
          }
        }

        playerY += playerVy;
        playerVy += 0.56;
        if (playerY > groundY) {
          playerY = groundY;
          playerVy = 0;
        }

        if (playerMode) {
          const hit = obstacles.some(
            (o) =>
              o.x < 132 &&
              o.x + o.w > 112 &&
              playerY > groundY - o.h + 4
          );
          if (hit) {
            gameOver = true;
            playSfx('hit');
            syncRunnerHud();
            showToast(`Runner terminé, score : ${score}. Espace pour rejouer.`);
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = pal.rule;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      const stretch = playerY < groundY ? 4 : 0;
      ctx.fillStyle = playerMode ? pal.accentWarm : pal.ink;
      ctx.fillRect(110 + stretch * 0.5, playerY - 30 - stretch, 24 - stretch, 30 + stretch);

      ctx.fillStyle = pal.accent;
      obstacles.forEach((o) => {
        ctx.fillRect(o.x, groundY - o.h, o.w, o.h);
      });

      if (gameOver) {
        ctx.fillStyle = pal.scrim;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pal.ink;
        ctx.font = '16px "Barlow", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Collision à ${score} point(s) : appuyez sur Espace pour relancer`, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
      }

      requestAnimationFrame(frame);
    }

    frame();
  }

  /* =========================================================
     PROJET 5 : MINI-SNAKE JOUABLE IMMÉDIATEMENT AU CLAVIER
     ========================================================= */
  function initSnakeGame() {
    const canvas = document.getElementById('snakeCanvas');
    const scoreEl = document.getElementById('snakeScore');
    const bestEl = document.getElementById('snakeBest');
    const bonusEl = document.getElementById('snakeActiveBonus');
    const startBtn = document.getElementById('snakeStartBtn');
    const pauseBtn = document.getElementById('snakePauseBtn');
    const dpadBtns = document.querySelectorAll('.snake-dpad-btn');

    const toggleBtn = document.getElementById('snakeSourceToggleBtn');
    const jsView = document.getElementById('snakeJsView');
    const godotView = document.getElementById('snakeGodotView');
    const godotFrame = document.getElementById('snakeGodotFrame');
    const godotStatus = document.getElementById('snakeGodotStatus');

    if (toggleBtn && jsView && godotView) {
      let showingGodot = false;
      toggleBtn.addEventListener('click', () => {
        showingGodot = !showingGodot;
        jsView.classList.toggle('hidden', showingGodot);
        godotView.classList.toggle('hidden', !showingGodot);
        toggleBtn.textContent = showingGodot
          ? 'Revenir au Snake de test'
          : 'Charger export Godot';

        if (showingGodot && godotFrame && godotStatus && !godotFrame.dataset.checked) {
          godotFrame.dataset.checked = 'true';
          fetch('games/snake/index.html', { method: 'HEAD' })
            .then((res) => {
              if (res.ok) {
                godotFrame.src = 'games/snake/index.html';
                godotFrame.classList.remove('hidden');
                godotStatus.classList.add('hidden');
              }
            })
            .catch(() => {});
        }
      });
    }

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cell = 20;
    const cols = Math.floor(canvas.width / cell);
    const rows = Math.floor(canvas.height / cell);

    let snake = [];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 10, y: 6 };
    let bonus = null;
    let shieldTicks = 0;
    let score = 0;
    let best = 0;
    let running = false;
    let paused = false;
    let tickTimer = null;

    function randomFreeCell() {
      let pos;
      do {
        pos = {
          x: Math.floor(Math.random() * cols),
          y: Math.floor(Math.random() * rows)
        };
      } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
      return pos;
    }

    function startOrResetGame() {
      snake = [
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 6 }
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      food = randomFreeCell();
      bonus = null;
      shieldTicks = 0;
      score = 0;
      paused = false;
      running = true;
      if (pauseBtn) pauseBtn.textContent = 'Pause (P)';
      updateHud();
      clearInterval(tickTimer);
      tickTimer = setInterval(step, 120);
      draw();
    }

    function updateHud() {
      if (scoreEl) scoreEl.textContent = `Score : ${score}`;
      if (bestEl) bestEl.textContent = `Record : ${best}`;
      if (bonusEl) {
        bonusEl.textContent = shieldTicks > 0 ? `Bonus : Bouclier (${shieldTicks})` : 'Bonus : Aucun';
      }
    }

    function setDirection(name) {
      if (name === 'UP' && dir.y === 0) nextDir = { x: 0, y: -1 };
      if (name === 'DOWN' && dir.y === 0) nextDir = { x: 0, y: 1 };
      if (name === 'LEFT' && dir.x === 0) nextDir = { x: -1, y: 0 };
      if (name === 'RIGHT' && dir.x === 0) nextDir = { x: 1, y: 0 };
    }

    function step() {
      if (!running || paused) {
        draw();
        return;
      }

      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (shieldTicks > 0) {
        shieldTicks -= 1;
        head.x = (head.x + cols) % cols;
        head.y = (head.y + rows) % rows;
      } else if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        running = false;
        playSfx('hit');
        showToast(`Fin de partie Snake, score : ${score}`);
        draw();
        return;
      }

      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        running = false;
        playSfx('hit');
        showToast(`Fin de partie Snake, score : ${score}`);
        draw();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10;
        best = Math.max(best, score);
        playSfx('score');
        completeMission('arcade', 'Fruit récolté sur Snake');
        food = randomFreeCell();
        if (!bonus && Math.random() > 0.45) {
          const bPos = randomFreeCell();
          bonus = {
            x: bPos.x,
            y: bPos.y,
            type: Math.random() > 0.5 ? 'gold' : 'shield',
            ttl: 45
          };
        }
      } else {
        snake.pop();
      }

      if (bonus) {
        bonus.ttl -= 1;
        if (head.x === bonus.x && head.y === bonus.y) {
          playSfx('revive');
          if (bonus.type === 'gold') {
            score += 30;
            best = Math.max(best, score);
          } else {
            shieldTicks = 40;
          }
          bonus = null;
        } else if (bonus.ttl <= 0) {
          bonus = null;
        }
      }

      updateHud();
      draw();
    }

    function draw() {
      const pal = getCanvasPalette();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = pal.grid;
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cell, 0);
        ctx.lineTo(x * cell, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cell);
        ctx.lineTo(canvas.width, y * cell);
        ctx.stroke();
      }

      ctx.fillStyle = pal.accent;
      ctx.fillRect(food.x * cell + 3, food.y * cell + 3, cell - 6, cell - 6);

      if (bonus) {
        ctx.fillStyle = bonus.type === 'gold' ? pal.accentWarm : pal.shield;
        ctx.fillRect(bonus.x * cell + 3, bonus.y * cell + 3, cell - 6, cell - 6);
      }

      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? pal.ink : shieldTicks > 0 ? pal.shield : pal.muted;
        ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
      });

      if (!running) {
        ctx.fillStyle = pal.scrim;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = pal.ink;
        ctx.font = '16px "Barlow", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur Espace ou une flèche pour démarrer', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
      }
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        canvas.focus({ preventScroll: true });
        setActiveArena('snake');
        startOrResetGame();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (!running) return;
        paused = !paused;
        pauseBtn.textContent = paused ? 'Reprendre (P)' : 'Pause (P)';
      });
    }

    dpadBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveArena('snake');
        if (!running) startOrResetGame();
        setDirection(btn.dataset.snakeDir);
      });
    });

    canvas.addEventListener('click', () => {
      canvas.focus({ preventScroll: true });
      setActiveArena('snake');
      if (!running) startOrResetGame();
    });

    arenaHooks.snake = {
      onKeyDown(e, dirName) {
        if (e.code === 'KeyP') {
          if (!running) return false;
          paused = !paused;
          if (pauseBtn) pauseBtn.textContent = paused ? 'Reprendre (P)' : 'Pause (P)';
          return true;
        }
        if (e.code === 'Space') {
          if (!running) {
            startOrResetGame();
          } else {
            paused = !paused;
            if (pauseBtn) pauseBtn.textContent = paused ? 'Reprendre (P)' : 'Pause (P)';
          }
          return true;
        }
        if (dirName) {
          if (!running) startOrResetGame();
          if (!paused) setDirection(dirName);
          return true;
        }
        return false;
      }
    };

    // Redessiner quand l'utilisateur change de palette
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.addEventListener('click', () => setTimeout(draw, 10));
    });

    draw();
  }

  /* =========================================================
     SECTION 3 : RAIL 3D BLENDER ASSET LAB (BOUGIE 3D SCULPTÉE + FACE)
     ========================================================= */
  function init3DAssetLab() {
    let bougieExpr = 'security';
    let activeBougieVariant = 'player';
    const bougieVariants = {
      player: { path: 'assets/models/bougie.glb', customUrl: null, available: false, label: 'Bougie joueur' },
      enemy: { path: 'assets/models/bougie-ennemie.glb', customUrl: null, available: false, label: 'Bougies ennemies' }
    };

    function renderBougieAnimations() {
      const mv = document.getElementById('mv-bougie');
      const bar = document.getElementById('bougieAnimBar');
      if (!mv || !bar) return;
      const anims = Array.isArray(mv.availableAnimations) ? mv.availableAnimations : [];
      bar.innerHTML = '';
      if (!anims.length) return;
      const defaultAnim = anims.includes('Idle') ? 'Idle' : anims[0];
      mv.animationName = defaultAnim;
      anims.forEach((animName) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bougie-expr-btn' + (animName === defaultAnim ? ' active' : '');
        btn.textContent = animName;
        btn.addEventListener('click', () => {
          bar.querySelectorAll('.bougie-expr-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          mv.animationName = animName;
          if (typeof mv.play === 'function') mv.play();
        });
        bar.appendChild(btn);
      });
    }

    const mvBougieEl = document.getElementById('mv-bougie');
    if (mvBougieEl) {
      mvBougieEl.addEventListener('load', renderBougieAnimations);
    }

    document.querySelectorAll('.viewer-fs-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const viewport = btn.closest('.lab-viewport');
        if (!viewport) return;
        if (document.fullscreenElement === viewport) {
          document.exitFullscreen().catch(() => {});
        } else if (typeof viewport.requestFullscreen === 'function') {
          viewport.requestFullscreen().catch(() => {});
        }
      });
    });

    const stackMarquee = document.getElementById('stackMarquee');
    if (stackMarquee) {
      const track = stackMarquee.querySelector('.stack-marquee-track');
      let isHovering = false;
      let isDragging = false;
      let startX = 0;
      let startScroll = 0;
      const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      stackMarquee.addEventListener('mouseenter', () => { isHovering = true; });
      stackMarquee.addEventListener('mouseleave', () => { isHovering = false; isDragging = false; stackMarquee.classList.remove('is-dragging'); });

      stackMarquee.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startScroll = stackMarquee.scrollLeft;
        stackMarquee.classList.add('is-dragging');
        if (typeof stackMarquee.setPointerCapture === 'function') {
          try { stackMarquee.setPointerCapture(e.pointerId); } catch (_) {}
        }
      });

      stackMarquee.addEventListener('pointermove', (e) => {
        if (!isDragging || !track) return;
        const half = track.scrollWidth / 2;
        let next = startScroll - (e.clientX - startX);
        if (half > 0) {
          if (next < 0) {
            next += half;
            startScroll += half;
          } else if (next >= half) {
            next -= half;
            startScroll -= half;
          }
        }
        stackMarquee.scrollLeft = next;
      });

      const stopDrag = () => {
        isDragging = false;
        stackMarquee.classList.remove('is-dragging');
      };
      stackMarquee.addEventListener('pointerup', stopDrag);
      stackMarquee.addEventListener('pointercancel', stopDrag);

      function stepMarquee() {
        if (track && !isHovering && !isDragging && !reducedMotion) {
          const half = track.scrollWidth / 2;
          if (half > 0) {
            stackMarquee.scrollLeft += 0.7;
            if (stackMarquee.scrollLeft >= half) {
              stackMarquee.scrollLeft -= half;
            }
          }
        }
        requestAnimationFrame(stepMarquee);
      }
      requestAnimationFrame(stepMarquee);
    }

    function syncBougieViewer() {
      const mv = document.getElementById('mv-bougie');
      const canvas = document.getElementById('viewerCanvas-bougie');
      const v = bougieVariants[activeBougieVariant];
      if (!mv || !canvas || !v) return;
      const src = v.customUrl || (v.available ? v.path : null);
      if (src) {
        mv.setAttribute('src', src);
        mv.classList.remove('hidden');
        canvas.classList.add('hidden');
      } else {
        mv.classList.add('hidden');
        canvas.classList.remove('hidden');
        if (activeBougieVariant === 'enemy') {
          bougieExpr = 'danger';
          showToast('Bougies ennemies : ajoute assets/models/bougie-ennemie.glb ou clique sur Charger .glb.');
        }
      }
    }

    const variantBtns = document.querySelectorAll('.bougie-variant-btn');
    variantBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const variant = btn.dataset.variant === 'enemy' ? 'enemy' : 'player';
        activeBougieVariant = variant;
        variantBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        syncBougieViewer();
      });
    });

    const configs = [
      { key: 'bougie', canvasId: 'viewerCanvas-bougie', mvId: 'mv-bougie', defaultPath: 'assets/models/bougie.glb' },
      { key: 'phare', canvasId: 'viewerCanvas-phare', mvId: 'mv-phare', defaultPath: 'assets/models/phare.glb' },
      { key: 'pokeball', canvasId: 'viewerCanvas-pokeball', mvId: 'mv-pokeball', defaultPath: 'assets/models/pokeball.glb' }
    ];

    function project3D(pt, yaw, pitch, cx, cy, scale) {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const x1 = pt[0] * cosY - pt[2] * sinY;
      const z1 = pt[0] * sinY + pt[2] * cosY;
      const y2 = pt[1] * cosP - z1 * sinP;
      const z2 = pt[1] * sinP + z1 * cosP;

      const dist = 4.2;
      const factor = dist / (dist - z2);
      return {
        x: cx + x1 * scale * factor,
        y: cy + y2 * scale * factor,
        z: z2
      };
    }

    function buildMesh(kind) {
      const rings = [];
      if (kind === 'bougie') {
        const profile = [
          { y: 0.92, r: 0.48, wave: 0 },
          { y: 0.78, r: 0.43, wave: 0 },
          { y: 0.42, r: 0.41, wave: 0 },
          { y: 0.04, r: 0.4, wave: 0 },
          { y: -0.34, r: 0.4, wave: 0.012 },
          { y: -0.68, r: 0.42, wave: 0.04 },
          { y: -0.82, r: 0.36, wave: 0.025 }
        ];
        const segs = 16;
        profile.forEach((p, idx) => {
          const ring = [];
          for (let j = 0; j < segs; j++) {
            const a = (j / segs) * Math.PI * 2;
            const dripOffset = p.wave > 0 ? Math.sin(a * 3 + idx) * p.wave : 0;
            ring.push([Math.cos(a) * p.r, p.y + dripOffset, Math.sin(a) * p.r]);
          }
          rings.push(ring);
        });
      } else if (kind === 'phare') {
        const layers = [
          { y: -0.95, r: 0.48 },
          { y: -0.62, r: 0.56 },
          { y: -0.25, r: 0.42 },
          { y: 0.1, r: 0.34 },
          { y: 0.55, r: 0.44 },
          { y: 0.92, r: 0.25 }
        ];
        layers.forEach((l) => {
          const ring = [];
          for (let j = 0; j < 14; j++) {
            const a = (j / 14) * Math.PI * 2;
            ring.push([Math.cos(a) * l.r, l.y, Math.sin(a) * l.r]);
          }
          rings.push(ring);
        });
      } else {
        for (let i = 0; i <= 6; i++) {
          const phi = (i / 6) * Math.PI;
          const y = -Math.cos(phi) * 0.85;
          const r = Math.max(0.05, Math.sin(phi) * 0.85);
          const ring = [];
          for (let j = 0; j < 16; j++) {
            const a = (j / 16) * Math.PI * 2;
            ring.push([Math.cos(a) * r, y, Math.sin(a) * r]);
          }
          rings.push(ring);
        }
      }
      return rings;
    }

    configs.forEach((cfg) => {
      const canvas = document.getElementById(cfg.canvasId);
      const mv = document.getElementById(cfg.mvId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const mesh = buildMesh(cfg.key);

      let yaw = 0.25;
      let pitch = 0.22;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let wireframe = false;
      let animT = 0;

      const wfBtn = document.querySelector(`.wireframe-btn[data-model="${cfg.key}"]`);
      if (wfBtn) {
        wfBtn.addEventListener('click', () => {
          wireframe = !wireframe;
          wfBtn.classList.toggle('active', wireframe);
        });
      }

      const fileInput = document.querySelector(`.glb-file-input[data-model="${cfg.key}"]`);
      if (fileInput && mv) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          if (cfg.key === 'bougie') {
            bougieVariants[activeBougieVariant].customUrl = url;
            syncBougieViewer();
            showToast(`${bougieVariants[activeBougieVariant].label} : ${file.name} chargé.`);
          } else {
            mv.setAttribute('src', url);
            mv.classList.remove('hidden');
            canvas.classList.add('hidden');
            showToast(`Modèle ${file.name} chargé.`);
          }
        });
      }

      if (mv && window.location.protocol !== 'file:') {
        if (cfg.key === 'bougie') {
          Object.keys(bougieVariants).forEach((vKey) => {
            fetch(bougieVariants[vKey].path, { method: 'HEAD' })
              .then((res) => {
                if (res.ok) {
                  bougieVariants[vKey].available = true;
                  if (activeBougieVariant === vKey) syncBougieViewer();
                }
              })
              .catch(() => {});
          });
        } else {
          fetch(cfg.defaultPath, { method: 'HEAD' })
            .then((res) => {
              if (res.ok) {
                mv.setAttribute('src', cfg.defaultPath);
                mv.classList.remove('hidden');
                canvas.classList.add('hidden');
              }
            })
            .catch(() => {});
        }
      }

      canvas.addEventListener('mousedown', (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        yaw += (e.clientX - lastX) * 0.012;
        pitch = Math.max(-0.8, Math.min(0.8, pitch + (e.clientY - lastY) * 0.01));
        lastX = e.clientX;
        lastY = e.clientY;
      });
      window.addEventListener('mouseup', () => {
        dragging = false;
      });

      function renderModel() {
        const pal = getCanvasPalette();
        animT += 1;
        if (!canvas.classList.contains('hidden')) {
          if (!dragging) yaw += 0.008;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const cx = canvas.width / 2;
          const cy = canvas.height / 2 + 16;
          const scale = 104;

          const projected = mesh.map((ring) => ring.map((pt) => project3D(pt, yaw, pitch, cx, cy, scale)));

          for (let r = 0; r < projected.length - 1; r++) {
            const ringA = projected[r];
            const ringB = projected[r + 1];
            for (let j = 0; j < ringA.length; j++) {
              const nextJ = (j + 1) % ringA.length;
              const p1 = ringA[j];
              const p2 = ringA[nextJ];
              const p3 = ringB[nextJ];
              const p4 = ringB[j];

              const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
              if (!wireframe && avgZ < -0.1) continue;

              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.lineTo(p4.x, p4.y);
              ctx.closePath();

              if (wireframe) {
                ctx.strokeStyle = cfg.key === 'pokeball' ? pal.ink : pal.accent;
                ctx.lineWidth = 1;
                ctx.stroke();
              } else {
                let fill = pal.muted;
                if (cfg.key === 'bougie') {
                  fill = bougieExpr === 'danger' ? pal.accentDeep : bougieExpr === 'success' ? pal.accentWarm : pal.waxLight;
                } else if (cfg.key === 'phare') {
                  fill = r < 3 ? pal.accent : pal.muted;
                } else if (cfg.key === 'pokeball') {
                  fill = r < 2 ? pal.accent : r === 3 ? pal.rule : pal.waxLight;
                }
                ctx.fillStyle = fill;
                ctx.globalAlpha = Math.min(1, 0.56 + (avgZ + 0.5) * 0.42);
                ctx.fill();
                ctx.strokeStyle = pal.rule;
                ctx.lineWidth = 0.75;
                ctx.stroke();
                ctx.globalAlpha = 1;
              }
            }
          }

          if (cfg.key === 'bougie') {
            const wickBase = project3D([0, -0.8, 0], yaw, pitch, cx, cy, scale);
            const sway = Math.sin(animT * 0.14) * 0.06;
            const wickTop = project3D([sway * 0.4, -0.96, 0], yaw, pitch, cx, cy, scale);
            const flameTip = project3D([sway * 1.4, -1.36 - Math.sin(animT * 0.2) * 0.05, 0], yaw, pitch, cx, cy, scale);

            if (!wireframe) {
              const eyeL = project3D([-0.14, -0.18, 0.39], yaw, pitch, cx, cy, scale);
              const eyeR = project3D([0.14, -0.18, 0.39], yaw, pitch, cx, cy, scale);
              const mouth = project3D([0, 0.02, 0.4], yaw, pitch, cx, cy, scale);

              if (eyeL.z > 0.05 && eyeR.z > 0.05) {
                ctx.fillStyle = pal.faceInk;
                ctx.beginPath();
                ctx.arc(eyeL.x, eyeL.y, 4.2, 0, Math.PI * 2);
                ctx.arc(eyeR.x, eyeR.y, 4.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = pal.faceInk;
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (bougieExpr === 'danger') {
                  ctx.ellipse(mouth.x, mouth.y, 4, 6, 0, 0, Math.PI * 2);
                } else {
                  ctx.arc(mouth.x, mouth.y - 3, 7, 0.15 * Math.PI, 0.85 * Math.PI);
                }
                ctx.stroke();
              }

              const glow = ctx.createRadialGradient(wickTop.x, (wickTop.y + flameTip.y) / 2, 4, wickTop.x, (wickTop.y + flameTip.y) / 2, 54);
              glow.addColorStop(0, pal.accentSoft);
              glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = glow;
              ctx.beginPath();
              ctx.arc(wickTop.x, (wickTop.y + flameTip.y) / 2, 54, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = pal.rule;
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(wickBase.x, wickBase.y);
              ctx.lineTo(wickTop.x, wickTop.y);
              ctx.stroke();

              ctx.fillStyle = pal.accent;
              ctx.beginPath();
              ctx.moveTo(wickTop.x, wickTop.y);
              ctx.quadraticCurveTo(wickTop.x - 16, (wickTop.y + flameTip.y) / 2, flameTip.x, flameTip.y);
              ctx.quadraticCurveTo(wickTop.x + 16, (wickTop.y + flameTip.y) / 2, wickTop.x, wickTop.y);
              ctx.fill();

              ctx.fillStyle = '#f5d076';
              ctx.beginPath();
              ctx.ellipse(wickTop.x, wickTop.y - 12, 5, 11, sway * 0.8, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = pal.ink;
              ctx.font = '14px "Barlow", sans-serif';
              ctx.textAlign = 'center';
              const badge =
                bougieExpr === 'danger' ? 'Expression : Danger' : bougieExpr === 'success' ? 'Expression : Réussite' : 'Expression : Sécurité';
              ctx.fillText(badge, cx, canvas.height - 14);
              ctx.textAlign = 'left';
            } else {
              ctx.strokeStyle = pal.accentWarm;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(wickTop.x, wickTop.y);
              ctx.quadraticCurveTo(wickTop.x - 14, (wickTop.y + flameTip.y) / 2, flameTip.x, flameTip.y);
              ctx.quadraticCurveTo(wickTop.x + 14, (wickTop.y + flameTip.y) / 2, wickTop.x, wickTop.y);
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(renderModel);
      }

      renderModel();
    });
  }

  /* =========================================================
     MODALES : GDD, CV IMPRIMABLE ET COMMAND PALETTE (CTRL + K)
     ========================================================= */
  function initModalsAndCommands(toolbarCtrl) {
    const gddModal = document.getElementById('gddModal');
    const cvModal = document.getElementById('cvModal');
    const cmdModal = document.getElementById('cmdModal');

    function closeAll() {
      [gddModal, cvModal, cmdModal].forEach((m) => m && m.classList.add('hidden'));
    }

    function openModal(modal) {
      closeAll();
      if (modal) modal.classList.remove('hidden');
    }

    const bindOpen = (id, modal) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => openModal(modal));
    };

    bindOpen('openGddModalBtn', gddModal);
    bindOpen('openCvBtn', cvModal);
    bindOpen('heroCvBtn', cvModal);
    bindOpen('footerCvBtn', cvModal);

    const closeGddBtn = document.getElementById('closeGddBtn');
    const closeCvBtn = document.getElementById('closeCvBtn');
    const closeCmdBtn = document.getElementById('closeCmdBtn');
    const printCvBtn = document.getElementById('printCvBtn');

    if (closeGddBtn) closeGddBtn.addEventListener('click', closeAll);
    if (closeCvBtn) closeCvBtn.addEventListener('click', closeAll);
    if (closeCmdBtn) closeCmdBtn.addEventListener('click', closeAll);
    if (printCvBtn) printCvBtn.addEventListener('click', () => window.print());

    [gddModal, cvModal, cmdModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAll();
      });
    });

    const openCmdBtn = document.getElementById('openCmdBtn');
    const cmdInput = document.getElementById('cmdInput');
    const cmdList = document.getElementById('cmdList');

    const commands = [
      { label: 'Thème Darkroom : Ambre', hint: 'Couleur', run: () => toolbarCtrl.applyTheme('amber') },
      { label: 'Thème Darkroom : Rouge', hint: 'Couleur', run: () => toolbarCtrl.applyTheme('red') },
      { label: 'Thème Darkroom : Fibre Paper (Clair)', hint: 'Couleur', run: () => toolbarCtrl.applyTheme('fibre') },
      { label: 'Jouer à La Dernière Bougie (Hero)', hint: 'Touche 1', run: () => focusArena('hero') },
      { label: 'Conduire le robot ESP32 au clavier', hint: 'Touche 2', run: () => focusArena('rover') },
      { label: 'Piloter la maison ESP32 (M / V / R / L)', hint: 'Touche 3', run: () => focusArena('home') },
      { label: 'Tester le Runner procédural au clavier', hint: 'Touche 5', run: () => focusArena('runner') },
      { label: 'Démarrer Snake revisité au clavier', hint: 'Touche 6', run: () => focusArena('snake') },
      { label: 'Ouvrir le CV A4 imprimable', hint: 'CV PDF', run: () => openModal(cvModal) },
      { label: 'Lire le GDD : La Dernière Bougie', hint: 'GDD', run: () => openModal(gddModal) },
      { label: 'Copier le courriel kemerdyjohn@gmail.com', hint: 'Copier', run: () => copyEmail('kemerdyjohn@gmail.com') },
      { label: 'Aller au rail 3D Blender', hint: '#lab3d', run: () => (window.location.hash = '#lab3d') },
      {
        label: 'Ouvrir GitHub (shinkiflinn-ops)',
        hint: 'Lien externe',
        run: () => window.open('https://github.com/shinkiflinn-ops', '_blank', 'noopener,noreferrer')
      },
      {
        label: 'Ouvrir LinkedIn (john-dev88)',
        hint: 'Lien externe',
        run: () => window.open('https://linkedin.com/in/john-dev88', '_blank', 'noopener,noreferrer')
      }
    ];

    function renderCommands(filterText = '') {
      if (!cmdList) return;
      const q = filterText.trim().toLowerCase();
      cmdList.innerHTML = '';
      commands
        .filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q))
        .forEach((cmd) => {
          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'cmd-item';
          btn.innerHTML = `<span>${cmd.label}</span><span>${cmd.hint}</span>`;
          btn.addEventListener('click', () => {
            closeAll();
            cmd.run();
          });
          li.appendChild(btn);
          cmdList.appendChild(li);
        });
    }

    function openCmd() {
      openModal(cmdModal);
      renderCommands('');
      if (cmdInput) {
        cmdInput.value = '';
        cmdInput.focus();
      }
    }

    if (openCmdBtn) openCmdBtn.addEventListener('click', openCmd);
    if (cmdInput) {
      cmdInput.addEventListener('input', () => renderCommands(cmdInput.value));
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (cmdModal && !cmdModal.classList.contains('hidden')) {
          closeAll();
        } else {
          openCmd();
        }
      } else if (e.key === 'Escape') {
        closeAll();
      }
    });
  }

  function initLanguageSwitcher() {
    const btn = document.getElementById('langToggleBtn');
    if (!btn) return;
    let lang = 'fr';

    const store = new Map();
    function setText(selector, enText) {
      const el = document.querySelector(selector);
      if (!el) return;
      if (!store.has(el)) store.set(el, el.textContent);
      el.textContent = lang === 'en' ? enText : store.get(el);
    }
    function setHtml(selector, enHtml) {
      const el = document.querySelector(selector);
      if (!el) return;
      if (!store.has(el)) store.set(el, el.innerHTML);
      el.innerHTML = lang === 'en' ? enHtml : store.get(el);
    }
    function setList(selector, enList) {
      document.querySelectorAll(selector).forEach((el, i) => {
        if (!store.has(el)) store.set(el, el.innerHTML);
        if (enList[i] !== undefined) {
          el.innerHTML = lang === 'en' ? enList[i] : store.get(el);
        }
      });
    }

    function applyLang(next) {
      lang = next === 'en' ? 'en' : 'fr';
      document.documentElement.lang = lang;
      document.title = lang === 'en'
        ? 'John-Mary Ayivi: Embedded Systems, 3D & Godot'
        : 'John-Mary AYIVI : Systèmes embarqués, 3D et Godot';

      btn.textContent = lang === 'en' ? 'FR' : 'EN';
      btn.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');

      setList('.nav-links a', ['Projects', '3D Lab', 'Skills', 'Contact']);
      setText('#openCvBtn', 'Resume Preview');
      setText('#openCmdBtn', 'Commands');

      const avail = document.querySelector('.availability-badge');
      if (avail) {
        if (!store.has(avail)) store.set(avail, avail.innerHTML);
        avail.innerHTML = lang === 'en'
          ? '<span class="avail-dot" aria-hidden="true"></span>Available — internships · projects · opportunities'
          : store.get(avail);
      }

      setText('.hero-name', 'John-Mary Ayivi');
      setText('.hero-copy h1', 'Embedded electronics, robotics and game dev');
      setHtml('.hero-copy .lead', '3rd-year Electrical &amp; Computer Engineering student and President of the INSTI Art, Design &amp; Gaming Club, I build embedded and interactive systems.<br />Passionate about game dev, game design, and everything interactive, I also dedicate time to 3D modeling in Blender.');
      setText('.hero-cta-row a.btn-primary', 'Explore electronics & demos');
      setText('#heroCvBtn', 'Generate Resume');
      const godotBtn = document.getElementById('bougieGodotToggleBtn');
      if (godotBtn) {
        const isGodotOpen = document.getElementById('bougieGodotView') && !document.getElementById('bougieGodotView').classList.contains('hidden');
        godotBtn.textContent = lang === 'en'
          ? (isGodotOpen ? 'Back to 2.5D mini-game' : 'Play Godot 3D Game')
          : (isGodotOpen ? 'Revenir au mini-jeu 2.5D' : 'Jouer au jeu Godot 3D');
      }
      const runnerGodotBtn = document.getElementById('runnerGodotToggleBtn');
      if (runnerGodotBtn) {
        const isRunnerOpen = document.getElementById('runnerGodotView') && !document.getElementById('runnerGodotView').classList.contains('hidden');
        runnerGodotBtn.textContent = lang === 'en'
          ? (isRunnerOpen ? 'Back to JS Runner' : 'Play Ninja Run (Godot)')
          : (isRunnerOpen ? 'Revenir au mini-jeu Runner' : 'Jouer à Ninja Run (Godot)');
      }

      setText('#projets .section-head-line h2', 'Projects and digital twins');
      setList('.filter-bar .filter-btn', ['All (5)', 'Electronics & IoT', 'Games & Godot', '3D Modeling']);

      setList('.project-card h3', [
        'GPS Rover Car & Godot Remote',
        'Smart Home Connected via Blynk',
        'The Last Candle: 2.5D Survival',
        'Procedural Obstacle Runner',
        'Revisited Bonus Snake (WIP)'
      ]);

      setList('.project-card .project-brief', [
        '<li><strong>Problem:</strong> Remotely drive a mobile robot while handling obstacles and live GPS coordinates.</li><li><strong>Solution:</strong> ESP32 chassis with GPS tracking, autonomous ultrasonic avoidance, and a dedicated Godot Engine remote.</li><li><strong>Role:</strong> Embedded electronics, avoidance logic, and Godot control interface.</li>',
        '<li><strong>Problem:</strong> Automate and remotely monitor temperature, lighting, and access inside a home.</li><li><strong>Solution:</strong> ESP32 node linking temperature &amp; motion sensors to servos, relays, LEDs, local LCD, and Blynk dashboard.</li><li><strong>Role:</strong> Hardware wiring, local automation rules, and Blynk supervision.</li>',
        '<li><strong>Problem:</strong> Design a short, tense survival game where sound and visuals directly mirror danger.</li><li><strong>Solution:</strong> 2.5D pipeline with player/enemy candles animated in Blender (.glb), async state machine, and 3-phase adaptive audio.</li><li><strong>Role:</strong> Game Design Document, 3D modeling/animation, and interactive prototyping.</li>',
        '<li><strong>Problem:</strong> Keep gameplay challenging without static levels or unfair difficulty spikes.</li><li><strong>Solution:</strong> Procedural obstacle spawning in Godot (GDScript) where frequency and spacing scale with speed.</li><li><strong>Role:</strong> Difficulty curve Game Design and GDScript programming.</li>',
        '<li><strong>Problem:</strong> Refresh a classic game by adding risk-reward choices and tactical pacing.</li><li><strong>Solution:</strong> GDScript rewrite in Godot with temporary bonuses (golden points, wall shield) and progressive pace for HTML5 Web export.</li><li><strong>Role:</strong> Bonus Game Design, GDScript coding, and Web integration.</li>'
      ]);

      setText('#lab3d .section-head-line h2', 'Blender Modeling & 3D Prototypes');
      setText('#lab3d .section-head-line .lead', 'Swipe horizontally to explore the interactive 3D models.');
      setList('#lab3d .lab-title-col h3', ['The Last Candle', '3D Lighthouse', 'Pokéball Collection']);
      setList('#lab3d .lab-title-col p', [
        'Two Blender models (.glb) in one card: player candle and enemy candles, with their glTF animations.',
        'Hard-surface Blender modeling and glTF (.glb) export optimized for real-time rendering.',
        'Hard-surface modeling in Blender focusing on bevels and metallic reflections.'
      ]);
      setList('.bougie-variant-btn', ['Player candle', 'Enemy candles']);
      setList('.viewer-hint', ['↻ Drag 360°', '↻ Drag 360°', '↻ Drag 360°']);
      setText('.prototype-row h3', 'Godot 3D Prototype: Controller & Mixamo');

      setHtml('.datasheet-head', lang === 'en'
        ? '<span>REF // JMA-01 · DATASHEET</span><span>STATUS : AVAILABLE</span>'
        : store.get(document.querySelector('.datasheet-head')) || '<span>REF // JMA-01 · FICHE TECHNIQUE</span><span>STATUT : DISPONIBLE</span>');

      setList('.datasheet-specs div', [
        '<dt>Identity</dt><dd>John-Mary Ayivi</dd>',
        '<dt>Education</dt><dd>B.Sc. Year 3 Electrical &amp; Computer Engineering</dd>',
        '<dt>Location</dt><dd>Cotonou / Abomey-Calavi</dd>',
        '<dt>Leadership</dt><dd>President — Art, Design &amp; Gaming Club (INSTI)</dd>',
        '<dt>Specialties</dt><dd>ESP32 · KiCad · Godot · Game Design · Blender 3D</dd>'
      ]);
      setList('.datasheet-counters span', [
        '<strong>5</strong> Interactive projects',
        '<strong>3</strong> 3D .glb models',
        '<strong>3</strong> Playable demos'
      ]);

      setText('#piliers h2', 'Four complementary domains');
      setList('#piliers .sheet-row h3', [
        'Electrical & Embedded Engineering',
        'Game Design & Interactive Systems',
        'Blender 3D Modeling & Animation',
        'Artificial Intelligence Foundations'
      ]);
      setList('#piliers .sheet-row p', [
        'ESP32 microcontrollers, KiCad schematics &amp; PCB routing, Proteus simulation, PL7 automation, GPS/ultrasonic sensors, servos, relays, LCDs, and Blynk.',
        'Game Design Documents, gameplay balancing, UI design basics, GDScript in Godot, finite state machines, and procedural generation.',
        'Character and hard-surface modeling, 2.5D pipeline preparation, contextual animations, and glTF (.glb) export.',
        'Currently learning AI fundamentals with the goal of connecting future models to ESP32 robotics and Godot behaviors.'
      ]);
      setText('.stack-label', 'Languages & Tools');

      setText('.vision-quote', '“Connecting embedded electronics, 3D art, and game development to build tangible, living systems.”');
      setText('.footer-statement h2', 'Collaborate on a hardware or software project');
      setText('.footer-statement p', 'Available for engineering builds, embedded prototypes, and interactive experiences.');
      setText('#footerCvBtn strong', 'Download Resume');
      setText('#footerCvBtn small', 'A4 PDF Format');
      setText('.footer-meta', '© John-Mary Ayivi · Cotonou & Abomey-Calavi');
      setText('#footerCopyEmailBtn', 'Copy address: kemerdyjohn@gmail.com');

      setText('#cvSheet h1', 'John-Mary Ayivi');
      setText('#cvSheet .cv-role', 'Electrical & Computer Engineering Student');
    }

    btn.addEventListener('click', () => {
      applyLang(lang === 'fr' ? 'en' : 'fr');
      showToast(lang === 'en' ? 'Language switched to English (John-Mary Ayivi).' : 'Langue : Français (John-Mary AYIVI).');
    });
  }

  function wireGodotEmbed(cfg) {
    const toggleBtn = document.getElementById(cfg.toggleBtnId);
    const godotView = document.getElementById(cfg.viewId);
    const arena = document.getElementById(cfg.arenaId);
    const frame = document.getElementById(cfg.frameId);
    const fsBtn = document.getElementById(cfg.fsBtnId);
    if (!toggleBtn || !godotView || !arena || !frame) return;

    let loaded = false;
    toggleBtn.addEventListener('click', () => {
      const opening = godotView.classList.contains('hidden');
      godotView.classList.toggle('hidden', !opening);
      arena.classList.toggle('hidden', opening);
      const isEn = document.documentElement.lang === 'en';
      toggleBtn.textContent = opening
        ? (isEn ? cfg.closeEn : cfg.closeFr)
        : (isEn ? cfg.openEn : cfg.openFr);
      if (opening && !loaded) {
        frame.src = encodeURI(cfg.path);
        loaded = true;
        showToast(isEn ? cfg.toastEn : cfg.toastFr);
      } else if (!opening) {
        frame.src = 'about:blank';
        loaded = false;
      }
    });

    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (document.fullscreenElement === frame) {
          document.exitFullscreen().catch(() => {});
        } else if (typeof frame.requestFullscreen === 'function') {
          frame.requestFullscreen().catch(() => {});
        }
      });
    }
  }

  function initBougieGodotEmbed() {
    wireGodotEmbed({
      toggleBtnId: 'bougieGodotToggleBtn',
      viewId: 'bougieGodotView',
      arenaId: 'heroArena',
      frameId: 'bougieGodotFrame',
      fsBtnId: 'bougieGodotFsBtn',
      path: 'games/bougie/la_dernière_bougie.html',
      openFr: 'Jouer au jeu Godot 3D',
      openEn: 'Play Godot 3D Game',
      closeFr: 'Revenir au mini-jeu 2.5D',
      closeEn: 'Back to 2.5D mini-game',
      toastFr: 'Chargement du jeu Godot 3D...',
      toastEn: 'Loading Godot 3D Web build...'
    });
    wireGodotEmbed({
      toggleBtnId: 'runnerGodotToggleBtn',
      viewId: 'runnerGodotView',
      arenaId: 'runnerJsArena',
      frameId: 'runnerGodotFrame',
      fsBtnId: 'runnerGodotFsBtn',
      path: 'games/ninja run/ninja run.html',
      openFr: 'Jouer à Ninja Run (Godot)',
      openEn: 'Play Ninja Run (Godot)',
      closeFr: 'Revenir au mini-jeu Runner',
      closeEn: 'Back to JS Runner',
      toastFr: 'Chargement de Ninja Run (Godot)...',
      toastEn: 'Loading Ninja Run (Godot)...'
    });
  }

  function initClockPreloader() {
    const preloader = document.getElementById('clockPreloader');
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDuration = reduced ? 120 : 950;
    const startTime = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      if (preloader) preloader.classList.add('is-ready');
      window.setTimeout(() => {
        document.body.classList.remove('is-loading');
        if (preloader) preloader.classList.add('is-done');
      }, reduced ? 40 : 180);
    };

    const scheduleFinish = () => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      window.setTimeout(finish, remaining);
    };

    if (document.readyState === 'complete') {
      scheduleFinish();
    } else {
      window.addEventListener('load', scheduleFinish, { once: true });
    }

    // Sécurité si une ressource externe tarde sur connexion très lente
    window.setTimeout(finish, 8000);
  }

  function initScrollAstrolabe() {
    const clock = document.getElementById('hyruleUmbraClock');
    if (!clock) return;
    function onScroll() {
      const y = window.scrollY || 0;
      document.body.classList.toggle('is-clock-centered', y > 40);
      clock.style.setProperty('--crescent-rot', `${(y * 0.14).toFixed(1)}deg`);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initProjectScrollFade() {
    const cards = Array.from(document.querySelectorAll('#projets .project-card'));
    if (!cards.length) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    document.body.classList.add('has-gsap-summon');

    const clock = document.getElementById('hyruleUmbraClock');
    const triTop = document.getElementById('triPieceTop');
    const triLeft = document.getElementById('triPieceLeft');
    const triRight = document.getElementById('triPieceRight');
    const summonRing = document.getElementById('triSummonRing');
    const pieces = [triTop, triLeft, triRight];

    // Créer dynamiquement la zone vide d'invocation avant chaque carte projet
    const zones = cards.map((card) => {
      const zone = document.createElement('div');
      zone.className = 'project-summon-zone';
      zone.setAttribute('aria-hidden', 'true');
      card.parentNode.insertBefore(zone, card);
      return { zone, card };
    });

    const bootGsap = () => {
      if (!window.gsap || !window.ScrollTrigger || !clock || pieces.some((p) => !p)) {
        cards.forEach((c) => c.classList.remove('gsap-hidden'));
        return;
      }

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // État initial : projets invisibles (opacity: 0, scale: 0.95)
      gsap.set(cards, { opacity: 0, scale: 0.95 });
      gsap.set(pieces, { opacity: 0, scale: 1 });
      if (summonRing) gsap.set(summonRing, { opacity: 0, scale: 0.2 });

      let activeTl = null;
      let activeCard = null;

      // Calcule les coordonnées exactes de repos de l'horloge sur le côté droit
      const getClockHomeSlots = () => {
        const cx = clock.offsetLeft + clock.offsetWidth / 2;
        const cy = clock.offsetTop + clock.offsetHeight / 2;
        const s = clock.offsetWidth / 420;
        return {
          cx,
          cy,
          scale: s,
          top: { x: cx, y: cy - 46 * s, scale: s },
          left: { x: cx - 32 * s, y: cy + 10 * s, scale: s },
          right: { x: cx + 32 * s, y: cy + 10 * s, scale: s }
        };
      };

      const summonProject = (zone, card) => {
        if (card.dataset.summoned === '1' || card.dataset.summoning === '1') return;

        // Gestion des interruptions si l'utilisateur scrolle rapidement
        if (activeTl) {
          activeTl.kill();
          if (activeCard && activeCard !== card && activeCard.dataset.summoned !== '1') {
            activeCard.dataset.summoned = '1';
            activeCard.dataset.summoning = '0';
            activeCard.classList.add('is-summoned');
            gsap.to(activeCard, { opacity: 1, scale: 1, duration: 0.28, overwrite: 'auto' });
          }
          gsap.set(pieces, { opacity: 0 });
          clock.classList.remove('is-triforce-away', 'is-clock-moving');
          gsap.set(clock, { rotation: 0, rotationY: 0 });
        }

        card.dataset.summoning = '1';
        activeCard = card;
        const home = getClockHomeSlots();
        const zRect = zone.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const vw = window.innerWidth || 1280;

        // Centre de l'espace vide juste avant le projet
        const targetCx = zRect.left + zRect.width / 2;
        const targetCy = Math.min(vh * 0.58, Math.max(vh * 0.28, zRect.top + zRect.height * 0.55));
        const dx = targetCx - home.cx;
        const dy = targetCy - home.cy;
        const leftSweepX = -(home.cx - Math.max(120, vw * 0.14));

        clock.classList.remove('is-triforce-away');
        clock.classList.add('is-clock-moving');
        gsap.set(pieces, { opacity: 0 });
        gsap.set(clock, { transformPerspective: 1100, rotationY: 0, rotation: 0 });

        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          onComplete: () => {
            clock.classList.remove('is-triforce-away', 'is-clock-moving');
            gsap.set(pieces, { opacity: 0 });
            gsap.set(clock, { x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1 });
            card.dataset.summoning = '0';
            if (activeTl === tl) {
              activeTl = null;
              activeCard = null;
            }
          }
        });
        activeTl = tl;

        // PHASE 1 : L'horloge va au milieu (0 -> 120°) et y dépose la Triforce
        tl.to(clock, {
          x: dx,
          y: dy,
          rotation: 120,
          rotationY: 120,
          scale: 0.72,
          duration: 0.52,
          ease: 'power2.in'
        }, 0);

        // PHASE 2 : Dépôt de la Triforce au milieu -> L'horloge file à gauche (240°) puis balaie totalement de la gauche vers la droite (360°)
        tl.add(() => {
          clock.classList.add('is-triforce-away');
          gsap.set(triTop, { x: targetCx, y: targetCy - 28, scale: 1, rotation: 0, opacity: 1 });
          gsap.set(triLeft, { x: targetCx - 32, y: targetCy + 28, scale: 1, rotation: 0, opacity: 1 });
          gsap.set(triRight, { x: targetCx + 32, y: targetCy + 28, scale: 1, rotation: 0, opacity: 1 });
        }, 'drop');

        tl.to(clock, {
          x: leftSweepX,
          y: dy * 0.65,
          rotation: 240,
          rotationY: 240,
          scale: 0.78,
          duration: 0.44,
          ease: 'power1.inOut'
        }, 'drop')
          .to(clock, {
            x: 0,
            y: 0,
            rotation: 360,
            rotationY: 360,
            scale: 1,
            duration: 0.74,
            ease: 'power2.out',
            onComplete: () => gsap.set(clock, { rotation: 0, rotationY: 0 })
          });

        // PHASE 3 : Au milieu, la Triforce exécute son animation complète (éclatement, réassemblage, invocation)
        tl.to(triTop, {
          x: targetCx,
          y: targetCy - 92,
          rotation: -180,
          scale: 1.15,
          duration: 0.36,
          ease: 'power2.out'
        }, 'drop')
          .to(triLeft, {
            x: targetCx - 104,
            y: targetCy + 72,
            rotation: 160,
            scale: 1.15,
            duration: 0.36,
            ease: 'power2.out'
          }, 'drop')
          .to(triRight, {
            x: targetCx + 104,
            y: targetCy + 72,
            rotation: -160,
            scale: 1.15,
            duration: 0.36,
            ease: 'power2.out'
          }, 'drop');

        tl.to(triTop, {
          x: targetCx,
          y: targetCy - 28,
          rotation: 0,
          scale: 1,
          duration: 0.32,
          ease: 'back.out(1.7)'
        }, 'assemble')
          .to(triLeft, {
            x: targetCx - 32,
            y: targetCy + 28,
            rotation: 0,
            scale: 1,
            duration: 0.32,
            ease: 'back.out(1.7)'
          }, 'assemble')
          .to(triRight, {
            x: targetCx + 32,
            y: targetCy + 28,
            rotation: 0,
            scale: 1,
            duration: 0.32,
            ease: 'back.out(1.7)'
          }, 'assemble');

        tl.add(() => {
          if (summonRing) {
            gsap.set(summonRing, { x: targetCx, y: targetCy, scale: 0.25, opacity: 0.98 });
            gsap.to(summonRing, {
              scale: 3.1,
              opacity: 0,
              duration: 0.72,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        }, 'invoke')
          .to(pieces, {
            scale: 1.3,
            rotation: 360,
            duration: 0.4,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: 1
          }, 'invoke');

        // PHASE 4 : Le projet n'apparaît QU'APRÈS la fin de l'animation Triforce, puis la Triforce retourne dans l'horloge
        tl.add(() => {
          card.dataset.summoned = '1';
          card.classList.add('is-summoned');
          gsap.to(card, {
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }, 'invoke+=0.65');

        tl.to(triTop, {
          x: () => getClockHomeSlots().top.x,
          y: () => getClockHomeSlots().top.y,
          scale: () => getClockHomeSlots().top.scale,
          rotation: 0,
          duration: 0.56,
          ease: 'power3.inOut'
        }, 'invoke+=0.65')
          .to(triLeft, {
            x: () => getClockHomeSlots().left.x,
            y: () => getClockHomeSlots().left.y,
            scale: () => getClockHomeSlots().left.scale,
            rotation: 0,
            duration: 0.56,
            ease: 'power3.inOut'
          }, 'invoke+=0.65')
          .to(triRight, {
            x: () => getClockHomeSlots().right.x,
            y: () => getClockHomeSlots().right.y,
            scale: () => getClockHomeSlots().right.scale,
            rotation: 0,
            duration: 0.56,
            ease: 'power3.inOut'
          }, 'invoke+=0.65');
      };

      const registerTriggers = () => {
        zones.forEach(({ zone, card }) => {
          ScrollTrigger.create({
            trigger: zone,
            start: 'top 82%',
            onEnter: () => summonProject(zone, card),
            onLeaveBack: () => {
              card.dataset.summoned = '0';
              card.dataset.summoning = '0';
              card.classList.remove('is-summoned');
              gsap.to(card, { opacity: 0, scale: 0.95, duration: 0.3, overwrite: 'auto' });
            }
          });
        });
        ScrollTrigger.refresh();
      };

      if (document.body.classList.contains('is-loading')) {
        window.setTimeout(registerTriggers, 1150);
      } else {
        registerTriggers();
      }

      // Sécurité : uniquement si l'utilisateur a déjà dépassé tout le projet vers le bas (saut d'ancre)
      window.addEventListener('scroll', () => {
        zones.forEach(({ card }) => {
          if (card.dataset.summoned === '1' || card.dataset.summoning === '1') return;
          if (card.getBoundingClientRect().bottom < -40) {
            card.dataset.summoned = '1';
            card.classList.add('is-summoned');
            gsap.set(card, { opacity: 1, scale: 1 });
          }
        });
      }, { passive: true });
    };

    if (window.gsap && window.ScrollTrigger) {
      bootGsap();
    } else {
      window.addEventListener('load', bootGsap, { once: true });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initClockPreloader();
    const toolbarCtrl = initToolbarControls();
    initLanguageSwitcher();
    initBougieGodotEmbed();
    initScrollAstrolabe();
    initProjectScrollFade();
    initArenaWiring(toolbarCtrl);
    initHeroCanvas();
    initProjectFilters();
    initRoverSimulator();
    initSmartHomeSimulator();
    initCandleFsmSimulator();
    initRunnerSimulator();
    initSnakeGame();
    init3DAssetLab();
    initModalsAndCommands(toolbarCtrl);
  });
})();
