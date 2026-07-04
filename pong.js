(() => {
  const WIDTH = 900;
  const HEIGHT = 560;
  const PADDLE_WIDTH = 14;
  const PADDLE_HEIGHT = 96;
  const BALL_SIZE = 14;
  const BOT_WINNING_SCORE = 5;
  const ONLINE_WINNING_SCORE = 5;
  const SURVIVAL_BASE_SPEED = 430;
  const PLAYER_BASE_SPEED = 520;

  const POWERUP_RADIUS = 22;
  const POWERUP_MIN_SPAWN = 15;
  const POWERUP_MAX_SPAWN = 30;
  const POWERUP_LIFETIME = 9;
  const EFFECT_DURATION = 10;

  const POWERUP_TYPES = {
    paddle: {
      color: "#63d2ff",
      glow: "rgba(99, 210, 255, 0.55)",
      label: "Paddle +50%",
    },
    slow: {
      color: "#8fe388",
      glow: "rgba(143, 227, 136, 0.55)",
      label: "Slow Ball",
    },
    immunity: {
      color: "#ffd166",
      glow: "rgba(255, 209, 102, 0.55)",
      label: "Immunity",
    },
  };
  const POWERUP_KEYS = Object.keys(POWERUP_TYPES);

  const DIFFICULTIES = {
    Easy: {
      aiSpeed: 300,
      ballSpeed: 370,
      reactionWobble: 60,
      name: "Easy",
    },
    Medium: {
      aiSpeed: 410,
      ballSpeed: 430,
      reactionWobble: 28,
      name: "Medium",
    },
    Hard: {
      aiSpeed: 535,
      ballSpeed: 490,
      reactionWobble: 12,
      name: "Hard",
    },
    Extreme: {
      aiSpeed: 690,
      ballSpeed: 560,
      reactionWobble: 2,
      name: "Extreme",
    },
  };

  const pageStyle = document.createElement("style");
  pageStyle.textContent = `
    html, body {
      margin: 0;
      min-height: 100%;
      background: #101319;
      color: #f5f7fb;
      font-family: Arial, Helvetica, sans-serif;
      overscroll-behavior: none;
    }

    body {
      display: grid;
      place-items: center;
      overflow: hidden;
      touch-action: manipulation;
    }

    .pong-shell {
      width: min(94vw, ${WIDTH}px);
      display: grid;
      gap: 12px;
    }

    .pong-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-size: 15px;
      color: #cfd6e5;
    }

    .pong-score {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0;
    }

    .pong-button {
      border: 1px solid #465063;
      background: #202631;
      color: #f5f7fb;
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      font: inherit;
    }

    .pong-button:hover,
    .pong-button:focus-visible {
      background: #2a3240;
      outline: none;
    }

    .pong-board {
      position: relative;
    }

    canvas {
      width: 100%;
      aspect-ratio: ${WIDTH} / ${HEIGHT};
      display: block;
      border: 1px solid #384252;
      background: #171b22;
      touch-action: none;
    }

    .pong-menu {
      position: absolute;
      inset: 1px;
      display: grid;
      place-items: center;
      padding: 22px;
      background: rgba(16, 19, 25, 0.9);
    }

    .pong-menu[hidden] {
      display: none;
    }

    .pong-panel {
      width: min(92%, 390px);
      display: grid;
      gap: 14px;
      text-align: center;
    }

    .pong-title {
      margin: 0 0 6px;
      color: #ffffff;
      font-size: 44px;
      line-height: 1;
      letter-spacing: 0;
    }

    .pong-subtitle {
      margin: 0 0 4px;
      color: #bac3d4;
      font-size: 16px;
      line-height: 1.45;
    }

    .pong-menu-button {
      min-height: 46px;
      border: 1px solid #556276;
      background: #242b37;
      color: #ffffff;
      border-radius: 6px;
      padding: 10px 14px;
      cursor: pointer;
      font: 700 16px Arial, Helvetica, sans-serif;
    }

    .pong-menu-button:hover,
    .pong-menu-button:focus-visible {
      background: #313a49;
      outline: none;
    }

    .pong-menu-button.primary {
      border-color: #79d8ff;
      background: #185671;
    }

    .pong-menu-button.primary:hover,
    .pong-menu-button.primary:focus-visible {
      background: #1f6d8f;
    }

    .pong-info {
      margin: 0;
      padding-left: 20px;
      color: #e5eaf4;
      text-align: left;
      line-height: 1.55;
    }

    .pong-contact {
      margin: 0;
      color: #e5eaf4;
      line-height: 1.55;
    }

    .pong-slider-wrap {
      display: grid;
      gap: 10px;
      padding: 12px 0 4px;
      color: #e5eaf4;
      text-align: left;
    }

    .pong-slider-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-weight: 700;
    }

    .pong-slider-value {
      color: #79d8ff;
    }

    .pong-slider {
      width: 100%;
      accent-color: #79d8ff;
      cursor: pointer;
    }

    .pong-code-input {
      width: 100%;
      box-sizing: border-box;
      font: 700 24px Arial, Helvetica, sans-serif;
      letter-spacing: 8px;
      text-align: center;
      text-transform: uppercase;
      color: #ffffff;
      background: #1b2029;
      border: 1px solid #556276;
      border-radius: 6px;
      padding: 10px;
    }

    .pong-code-input:focus-visible {
      outline: 2px solid #79d8ff;
    }

    .pong-stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 2px 0;
      color: #e5eaf4;
      text-align: left;
      font-size: 14px;
    }

    .pong-stat {
      border: 1px solid #354052;
      border-radius: 6px;
      background: rgba(36, 43, 55, 0.72);
      padding: 8px 10px;
    }

    .pong-stat strong {
      display: block;
      color: #79d8ff;
      font-size: 16px;
      line-height: 1.25;
    }

    @media (max-width: 560px) {
      .pong-topbar {
        align-items: stretch;
        flex-direction: column;
        text-align: center;
      }

      .pong-title {
        font-size: 34px;
      }

      .pong-menu {
        padding: 16px;
      }
    }
  `;
  document.head.appendChild(pageStyle);

  const isTouchDevice =
    "ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0;
  let touchTargetY = null;

  const shell = document.createElement("main");
  shell.className = "pong-shell";

  const topbar = document.createElement("div");
  topbar.className = "pong-topbar";

  const help = document.createElement("div");
  help.textContent = isTouchDevice
    ? "Drag the board to move, tap to serve"
    : "Move: W/S or arrow keys";

  const score = document.createElement("div");
  score.className = "pong-score";
  score.textContent = "0 : 0";

  const restartButton = document.createElement("button");
  restartButton.className = "pong-button";
  restartButton.type = "button";
  restartButton.textContent = "Menu";

  const soundButton = document.createElement("button");
  soundButton.className = "pong-button";
  soundButton.type = "button";
  soundButton.textContent = "\uD83D\uDD0A Sound: On";

  const board = document.createElement("section");
  board.className = "pong-board";

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const menu = document.createElement("div");
  menu.className = "pong-menu";

  board.append(canvas, menu);
  topbar.append(help, score, soundButton, restartButton);
  shell.append(topbar, board);
  document.body.appendChild(shell);

  const ctx = canvas.getContext("2d");
  const keys = new Set();
  let screen = "main";
  let gameMode = "bot";
  let selectedDifficulty = DIFFICULTIES.Medium;
  let ballSpeedPercent = 100;
  let lastTime = performance.now();
  let roundMessage = isTouchDevice ? "Tap the board to serve" : "Press Space to serve";
  let paused = true;
  let gameActive = false;
  let survivalReturns = 0;
  let survivalBest = Number(localStorage.getItem("pongSurvivalBest") || 0);
  let survivalGameOver = false;
  let speedBonusPercent = 0;
  let paddleBonusPercent = 0;
  let impactFlash = 0;
  let shakeTime = 0;
  let shakeStrength = 0;
  const ballTrail = [];
  const botStats = loadBotStats();

  let fieldPowerUp = null;
  let powerUpSpawnTimer = randomSpawnDelay();
  const effects = {
    paddle: 0,
    slow: 0,
    immunity: 0,
  };
  let soundEnabled = true;
  let audioCtx = null;

  let peer = null;
  let onlineConn = null;
  let onlineRole = null; // "host" | "client"
  let onlineRoomCode = "";
  let onlineStatusMessage = "";
  let joinCodeDraft = "";
  let peerJsPromise = null;
  let clientOwnY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

  const player = {
    x: 36,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PLAYER_BASE_SPEED,
    score: 0,
  };

  const ai = {
    x: WIDTH - 36 - PADDLE_WIDTH,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: selectedDifficulty.aiSpeed,
    score: 0,
  };

  const ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    speed: selectedDifficulty.ballSpeed,
    vx: 0,
    vy: 0,
  };

  function makeButton(label, onClick, className = "") {
    const button = document.createElement("button");
    button.className = `pong-menu-button ${className}`.trim();
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function ensureAudio() {
    if (!soundEnabled) {
      return null;
    }

    if (!audioCtx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) {
        return null;
      }
      audioCtx = new AudioCtor();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    return audioCtx;
  }

  function playTone({ freq, duration = 0.12, type = "square", volume = 0.18, delay = 0, slideTo = null }) {
    const ctxAudio = ensureAudio();
    if (!ctxAudio) {
      return;
    }

    const startTime = ctxAudio.currentTime + delay;
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), startTime + duration);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctxAudio.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  const sfx = {
    paddleHit: () => playTone({ freq: 220, duration: 0.09, type: "square", volume: 0.16 }),
    wallBounce: () => playTone({ freq: 340, duration: 0.06, type: "square", volume: 0.12 }),
    score: () => {
      playTone({ freq: 200, duration: 0.18, type: "sawtooth", volume: 0.16 });
      playTone({ freq: 150, duration: 0.22, type: "sawtooth", volume: 0.14, delay: 0.09 });
    },
    win: () => {
      [523, 659, 784, 1046].forEach((freq, index) => {
        playTone({ freq, duration: 0.18, type: "triangle", volume: 0.18, delay: index * 0.11 });
      });
    },
    lose: () => {
      [392, 330, 262, 196].forEach((freq, index) => {
        playTone({ freq, duration: 0.2, type: "sawtooth", volume: 0.16, delay: index * 0.1 });
      });
    },
    powerUpSpawn: () => playTone({ freq: 500, duration: 0.15, type: "sine", volume: 0.1, slideTo: 700 }),
    powerUpCollect: (type) => {
      const base = type === "immunity" ? 440 : type === "slow" ? 330 : 392;
      playTone({ freq: base, duration: 0.1, type: "triangle", volume: 0.2 });
      playTone({ freq: base * 1.5, duration: 0.14, type: "triangle", volume: 0.18, delay: 0.07 });
    },
    powerUpExpire: () => playTone({ freq: 260, duration: 0.14, type: "sine", volume: 0.09, slideTo: 140 }),
  };

  function setScreen(nextScreen) {
    screen = nextScreen;
    renderMenu();
  }

  function renderMenu() {
    menu.replaceChildren();
    menu.hidden = screen === "game";

    if (screen === "game") {
      return;
    }

    const panel = document.createElement("div");
    panel.className = "pong-panel";

    if (screen === "main") {
      panel.append(
        title("PONG"),
        subtitle("Classic Pong against an AI opponent or a real player online."),
        statsPanel(),
        makeButton("PLAY", () => setScreen("mode"), "primary"),
        makeButton("INFO", () => setScreen("info")),
        makeButton("CREDITS", () => setScreen("credits"))
      );
    }

    if (screen === "mode") {
      panel.append(
        title("PLAY"),
        subtitle("Choose your match type."),
        statsPanel(),
        makeButton("Play Against Bot", () => setScreen("speed"), "primary"),
        makeButton("Play Online (1v1)", () => setScreen("online")),
        makeButton("Survival Mode", startSurvivalGame),
        makeButton("Back", () => setScreen("main"))
      );
    }

    if (screen === "speed") {
      panel.append(
        title("Ball Speed"),
        subtitle("Set how fast the ball moves before choosing difficulty."),
        speedSlider(),
        makeButton("Continue", () => setScreen("difficulty"), "primary"),
        makeButton("Back", () => setScreen("mode"))
      );
    }

    if (screen === "difficulty") {
      panel.append(
        title("Difficulty"),
        subtitle("Higher difficulty makes the bot faster and more accurate."),
        ...Object.keys(DIFFICULTIES).map((name) =>
          makeButton(name, () => startGame(DIFFICULTIES[name]), name === "Medium" ? "primary" : "")
        ),
        makeButton("Back", () => setScreen("mode"))
      );
    }

    if (screen === "online") {
      panel.append(
        title("PLAY ONLINE"),
        subtitle("Challenge another player over the internet. First to 5 wins."),
        makeButton("Create Match", () => {
          setScreen("online-host");
          hostOnlineMatch();
        }, "primary"),
        makeButton("Join Match", () => {
          onlineStatusMessage = "";
          setScreen("online-join");
        }),
        makeButton("Back", () => setScreen("mode"))
      );
    }

    if (screen === "online-host") {
      panel.append(
        title("HOSTING"),
        subtitle(onlineStatusMessage || "Setting up match..."),
        subtitle("Waiting for an opponent to join with this code."),
        makeButton("Cancel", () => {
          closeOnlineConnection();
          onlineStatusMessage = "";
          setScreen("online");
        })
      );
    }

    if (screen === "online-join") {
      const wrap = document.createElement("label");
      wrap.className = "pong-slider-wrap";

      const label = document.createElement("span");
      label.textContent = "Enter match code";

      const input = document.createElement("input");
      input.className = "pong-code-input";
      input.type = "text";
      input.maxLength = 4;
      input.placeholder = "ABCD";
      input.autocapitalize = "characters";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.value = joinCodeDraft;
      input.addEventListener("input", () => {
        joinCodeDraft = input.value.toUpperCase();
        input.value = joinCodeDraft;
      });
      input.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Enter") {
          joinOnlineMatch(joinCodeDraft);
        }
      });

      wrap.append(label, input);

      panel.append(
        title("JOIN MATCH"),
        wrap,
        subtitle(onlineStatusMessage || "Ask your opponent for their match code."),
        makeButton("Connect", () => joinOnlineMatch(joinCodeDraft), "primary"),
        makeButton("Back", () => {
          closeOnlineConnection();
          onlineStatusMessage = "";
          setScreen("online");
        })
      );
    }

    if (screen === "info") {
      const instructions = document.createElement("ul");
      instructions.className = "pong-info";
      [
        "Use W/S or the arrow keys to move your paddle.",
        "Press Space to serve the ball.",
        "On touch devices, drag anywhere on the board to move your paddle and tap to serve.",
        "Bot mode: first player to 5 points wins.",
        "Quitting a bot match before it's over counts as a loss.",
        "Online 1v1: challenge a real opponent over the internet, first to 5 wins.",
        "Survival mode: return the ball for as long as possible against the wall.",
        "In survival, every successful return makes the ball 5% faster.",
        "Your paddle speed increases by 2.5% for each survival return.",
        "Hit the ball near the paddle edges to change its angle.",
        "Power-ups spawn on the field every 15-30 seconds - glide your paddle into one to grab it.",
        "\u2195\uFE0F Paddle+: your paddle grows 50% taller for 10 seconds.",
        "\uD83D\uDC0C Slow Ball: instantly saps the ball's speed by 25% for 10 seconds.",
        "\uD83D\uDEE1\uFE0F Immunity: you can't lose a point or the survival run for 10 seconds.",
        "Toggle the Sound button in the top bar to mute or unmute effects.",
      ].forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        instructions.appendChild(item);
      });

      panel.append(title("INFO"), instructions, makeButton("Back", () => setScreen("main"), "primary"));
    }

    if (screen === "credits") {
      const contact = document.createElement("p");
      contact.className = "pong-contact";
      contact.innerHTML = "Created by<br><strong>Micah Nicholson</strong><br>micahnicholson2444@gmail.com";

      panel.append(title("CREDITS"), contact, makeButton("Back", () => setScreen("main"), "primary"));
    }

    menu.appendChild(panel);
  }

  function title(text) {
    const element = document.createElement("h1");
    element.className = "pong-title";
    element.textContent = text;
    return element;
  }

  function subtitle(text) {
    const element = document.createElement("p");
    element.className = "pong-subtitle";
    element.textContent = text;
    return element;
  }

  function speedSlider() {
    const wrap = document.createElement("label");
    wrap.className = "pong-slider-wrap";

    const top = document.createElement("div");
    top.className = "pong-slider-top";

    const label = document.createElement("span");
    label.textContent = "Speed";

    const value = document.createElement("span");
    value.className = "pong-slider-value";
    value.textContent = `${ballSpeedPercent}%`;

    const slider = document.createElement("input");
    slider.className = "pong-slider";
    slider.type = "range";
    slider.min = "100";
    slider.max = "200";
    slider.step = "5";
    slider.value = String(ballSpeedPercent);
    slider.addEventListener("input", () => {
      ballSpeedPercent = Number(slider.value);
      value.textContent = `${ballSpeedPercent}%`;
    });

    top.append(label, value);
    wrap.append(top, slider);
    return wrap;
  }

  function statsPanel() {
    const stats = document.createElement("div");
    stats.className = "pong-stats";

    [
      ["Best Survival", `${survivalBest}`],
      ["Best Bot Beaten", botStats.bestDifficulty || "None"],
      ["Bot Wins", `${botStats.botWins}`],
      ["Bot Losses", `${botStats.botLosses}`],
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "pong-stat";
      item.innerHTML = `<strong>${value}</strong>${label}`;
      stats.appendChild(item);
    });

    return stats;
  }

  function loadBotStats() {
    let saved = {};

    try {
      saved = JSON.parse(localStorage.getItem("pongBotStats") || "{}");
    } catch {
      saved = {};
    }

    return {
      botWins: Number(saved.botWins || 0),
      botLosses: Number(saved.botLosses || 0),
      bestDifficulty: saved.bestDifficulty || "",
    };
  }

  function saveBotStats() {
    localStorage.setItem("pongBotStats", JSON.stringify(botStats));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function currentWinningScore() {
    return gameMode === "online" ? ONLINE_WINNING_SCORE : BOT_WINNING_SCORE;
  }

  function serveHintText(context = "serve") {
    if (!isTouchDevice) {
      if (context === "again") return "Press Space to play again";
      if (context === "retry") return "Press Space to retry";
      return "Press Space to serve";
    }
    if (context === "again") return "Tap the board to play again";
    if (context === "retry") return "Tap the board to retry";
    return "Tap the board to serve";
  }

  function isOnlineClient() {
    return gameMode === "online" && onlineRole === "client";
  }

  function isOnlineHost() {
    return gameMode === "online" && onlineRole === "host";
  }

  function resetPaddles() {
    player.speed = PLAYER_BASE_SPEED;
    player.height = PADDLE_HEIGHT;
    player.y = HEIGHT / 2 - player.height / 2;
    ai.y = HEIGHT / 2 - ai.height / 2;
  }

  function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
    ball.x = WIDTH / 2 - ball.size / 2;
    ball.y = HEIGHT / 2 - ball.size / 2;
    ball.speed = getStartingBallSpeed();
    ball.vx = direction * ball.speed;
    ball.vy = (Math.random() * 240 - 120) || 100;
    ballTrail.length = 0;
  }

  function getStartingBallSpeed() {
    if (gameMode === "survival") {
      return SURVIVAL_BASE_SPEED * (1 + speedBonusPercent / 100);
    }

    return selectedDifficulty.ballSpeed * (ballSpeedPercent / 100);
  }

  function restartGame() {
    player.score = 0;
    ai.score = 0;
    survivalReturns = 0;
    survivalGameOver = false;
    speedBonusPercent = 0;
    paddleBonusPercent = 0;
    touchTargetY = null;
    clientOwnY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    updateScoreLabel();
    const serveHint = serveHintText("serve");
    if (gameMode === "survival") {
      help.textContent = `Survival | Best: ${survivalBest} | Ball: 100% | Paddle: 100%`;
    } else if (gameMode === "online") {
      help.textContent =
        onlineRole === "host"
          ? `Online 1v1 | You control the LEFT paddle | ${serveHint}`
          : `Online 1v1 | You control the RIGHT paddle | ${serveHint}`;
    } else {
      help.textContent = `Difficulty: ${selectedDifficulty.name} | Speed: ${ballSpeedPercent}% | ${serveHint}`;
    }
    ai.speed = selectedDifficulty.aiSpeed;
    resetPaddles();
    resetBall(gameMode === "survival" ? -1 : undefined);
    paused = true;
    gameActive = true;
    if (gameMode === "survival") {
      roundMessage = `Survival: ${serveHint.charAt(0).toLowerCase()}${serveHint.slice(1)}`;
    } else if (gameMode === "online") {
      roundMessage = onlineRole === "host" ? serveHint : "Waiting for host to serve...";
    } else {
      roundMessage = serveHint;
    }
    fieldPowerUp = null;
    powerUpSpawnTimer = randomSpawnDelay();
    effects.paddle = 0;
    effects.slow = 0;
    effects.immunity = 0;
  }

  function startGame(difficulty) {
    gameMode = "bot";
    selectedDifficulty = difficulty;
    setScreen("game");
    restartGame();
  }

  function startSurvivalGame() {
    gameMode = "survival";
    setScreen("game");
    restartGame();
  }

  function startOnlineGame() {
    gameMode = "online";
    setScreen("game");
    restartGame();
  }

  function updateScoreLabel() {
    if (gameMode === "survival") {
      score.textContent = `Returns: ${survivalReturns}`;
      return;
    }

    score.textContent = `${player.score} : ${ai.score}`;
  }

  function returnToMenu() {
    if (
      gameMode === "bot" &&
      gameActive &&
      player.score < currentWinningScore() &&
      ai.score < currentWinningScore()
    ) {
      // Leaving an unfinished bot match counts as a loss.
      recordBotResult("ai");
    }

    if (gameMode === "online") {
      closeOnlineConnection();
    }

    gameActive = false;
    paused = true;
    roundMessage = "";
    help.textContent = isTouchDevice
      ? "Drag the board to move, tap to serve"
      : "Move: W/S or arrow keys";
    setScreen("main");
  }

  function startRound() {
    if (!gameActive || screen !== "game") {
      return;
    }

    if (gameMode === "survival" && survivalGameOver) {
      restartGame();
      return;
    }

    if (isOnlineClient()) {
      // The client never runs physics; ask the host to serve instead.
      if (onlineConn && onlineConn.open) {
        onlineConn.send({ serve: true });
      }
      return;
    }

    if (player.score >= currentWinningScore() || ai.score >= currentWinningScore()) {
      restartGame();
      return;
    }

    paused = false;
    roundMessage = "";
  }

  function rectangleCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.size > b.x &&
      a.y < b.y + b.height &&
      a.y + a.size > b.y
    );
  }

  function bounceOffPaddle(paddle, direction) {
    const paddleCenter = paddle.y + paddle.height / 2;
    const ballCenter = ball.y + ball.size / 2;
    const hitPosition = (ballCenter - paddleCenter) / (paddle.height / 2);
    const slowFactor = effects.slow > 0 ? 0.75 : 1;

    if (gameMode === "survival" && paddle === player) {
      survivalReturns += 1;
      survivalBest = Math.max(survivalBest, survivalReturns);
      localStorage.setItem("pongSurvivalBest", String(survivalBest));
      speedBonusPercent += 5;
      paddleBonusPercent += 2.5;
      player.speed = PLAYER_BASE_SPEED * (1 + paddleBonusPercent / 100);
      ball.speed = getStartingBallSpeed() * slowFactor;
      help.textContent = `Survival | Best: ${survivalBest} | Ball: ${100 + speedBonusPercent}% | Paddle: ${formatPercent(100 + paddleBonusPercent)}`;
      updateScoreLabel();
    } else {
      ball.speed = Math.min(ball.speed + 24, getStartingBallSpeed() * slowFactor + 330);
    }

    ball.vx = direction * ball.speed;
    ball.vy = hitPosition * 360;
    ball.x = direction > 0 ? paddle.x + paddle.width : paddle.x - ball.size;
    triggerImpact(0.12, 5);
    if (paddle === player) {
      sfx.paddleHit();
    } else {
      playTone({ freq: 165, duration: 0.09, type: "square", volume: 0.15 });
    }
  }

  function pointScored(scoringSide) {
    if (scoringSide === "player") {
      player.score += 1;
      resetBall(1);
    } else {
      ai.score += 1;
      resetBall(-1);
    }

    updateScoreLabel();
    paused = true;
    sfx.score();

    const target = currentWinningScore();
    if (player.score >= target) {
      if (gameMode === "bot") {
        recordBotResult("player");
      }
      roundMessage = `You win! ${serveHintText("again")}`;
      sfx.win();
    } else if (ai.score >= target) {
      if (gameMode === "bot") {
        recordBotResult("ai");
      }
      roundMessage =
        gameMode === "online"
          ? `Opponent wins. ${serveHintText("again")}`
          : `AI wins. ${serveHintText("again")}`;
      sfx.lose();
    } else {
      roundMessage = serveHintText("serve");
    }
  }

  function endSurvivalRun() {
    paused = true;
    survivalGameOver = true;
    roundMessage = `Game over: ${survivalReturns} returns. ${serveHintText("retry")}`;
    triggerImpact(0.3, 10);
    sfx.lose();
  }

  function recordBotResult(winner) {
    if (winner === "player") {
      botStats.botLosses += 1;
      updateBestDifficulty();
    } else {
      botStats.botWins += 1;
    }

    saveBotStats();
  }

  function updateBestDifficulty() {
    const order = Object.keys(DIFFICULTIES);
    const currentBestIndex = order.indexOf(botStats.bestDifficulty);
    const selectedIndex = order.indexOf(selectedDifficulty.name);

    if (selectedIndex > currentBestIndex) {
      botStats.bestDifficulty = selectedDifficulty.name;
    }
  }

  function loadPeerJs() {
    if (window.Peer) {
      return Promise.resolve();
    }
    if (peerJsPromise) {
      return peerJsPromise;
    }
    peerJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load networking library"));
      document.head.appendChild(script);
    });
    return peerJsPromise;
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function closeOnlineConnection() {
    if (onlineConn) {
      try {
        onlineConn.close();
      } catch {
        // ignore
      }
    }
    if (peer) {
      try {
        peer.destroy();
      } catch {
        // ignore
      }
    }
    onlineConn = null;
    peer = null;
    onlineRole = null;
    onlineRoomCode = "";
  }

  function hostOnlineMatch() {
    onlineStatusMessage = "Setting up match...";
    renderMenu();

    loadPeerJs()
      .then(() => {
        const code = generateRoomCode();
        peer = new window.Peer(`pong-${code}`, { debug: 0 });

        peer.on("open", () => {
          onlineRoomCode = code;
          onlineStatusMessage = `Share this code: ${code}`;
          if (screen === "online-host") {
            renderMenu();
          }
        });

        peer.on("connection", (conn) => {
          onlineConn = conn;
          onlineRole = "host";
          conn.on("data", handleOnlineData);
          conn.on("close", handleOnlineDisconnect);
          setupOnlineConnection();
        });

        peer.on("error", (err) => {
          onlineStatusMessage =
            err && err.type === "unavailable-id"
              ? "That code is taken, try again."
              : "Connection error. Try again.";
          if (screen === "online-host" || screen === "online") {
            renderMenu();
          }
        });
      })
      .catch(() => {
        onlineStatusMessage = "Could not load networking library. Check your connection.";
        renderMenu();
      });
  }

  function joinOnlineMatch(rawCode) {
    const code = (rawCode || "").trim().toUpperCase();
    if (code.length < 4) {
      onlineStatusMessage = "Enter the 4-character code from your opponent.";
      renderMenu();
      return;
    }

    onlineStatusMessage = "Connecting...";
    renderMenu();

    loadPeerJs()
      .then(() => {
        peer = new window.Peer(undefined, { debug: 0 });

        peer.on("open", () => {
          const conn = peer.connect(`pong-${code}`, { reliable: true });
          onlineConn = conn;
          onlineRole = "client";

          conn.on("open", () => setupOnlineConnection());
          conn.on("data", handleOnlineData);
          conn.on("close", handleOnlineDisconnect);
          conn.on("error", () => {
            onlineStatusMessage = "Could not reach that match. Check the code and try again.";
            if (screen === "online-join") {
              renderMenu();
            }
          });
        });

        peer.on("error", () => {
          onlineStatusMessage = "Could not reach that match. Check the code and try again.";
          if (screen === "online-join") {
            renderMenu();
          }
        });
      })
      .catch(() => {
        onlineStatusMessage = "Could not load networking library. Check your connection.";
        renderMenu();
      });
  }

  function setupOnlineConnection() {
    onlineStatusMessage = "";
    startOnlineGame();
  }

  function handleOnlineDisconnect() {
    if (gameMode === "online" && screen === "game") {
      gameActive = false;
      paused = true;
      roundMessage = "Opponent disconnected";
      setTimeout(() => {
        if (gameMode === "online") {
          returnToMenu();
        }
      }, 2500);
    }
  }

  function handleOnlineData(data) {
    if (!data) {
      return;
    }

    if (onlineRole === "host") {
      if (data.serve) {
        startRound();
      }
      if (typeof data.y === "number") {
        ai.y = clamp(data.y, 0, HEIGHT - ai.height);
      }
      return;
    }

    // Client: apply the authoritative state broadcast by the host.
    if (data.ball) {
      ball.x = data.ball.x;
      ball.y = data.ball.y;
    }
    if (typeof data.hostY === "number") {
      player.y = data.hostY;
    }
    if (typeof data.clientY === "number") {
      ai.y = data.clientY;
    }
    if (typeof data.hostScore === "number") {
      player.score = data.hostScore;
    }
    if (typeof data.clientScore === "number") {
      ai.score = data.clientScore;
    }
    if (typeof data.message === "string") {
      roundMessage = data.message;
    }
    if (typeof data.paused === "boolean") {
      paused = data.paused;
    }
    updateScoreLabel();
  }

  function updateAndSendClientInput(deltaSeconds) {
    if (touchTargetY !== null) {
      clientOwnY = clamp(touchTargetY - PADDLE_HEIGHT / 2, 0, HEIGHT - PADDLE_HEIGHT);
    } else {
      const up = keys.has("w") || keys.has("arrowup");
      const down = keys.has("s") || keys.has("arrowdown");
      const movement = (down ? 1 : 0) - (up ? 1 : 0);
      clientOwnY = clamp(clientOwnY + movement * PLAYER_BASE_SPEED * deltaSeconds, 0, HEIGHT - PADDLE_HEIGHT);
    }

    if (onlineConn && onlineConn.open) {
      onlineConn.send({ y: clientOwnY });
    }
  }

  function broadcastHostState() {
    if (!onlineConn || !onlineConn.open) {
      return;
    }
    onlineConn.send({
      ball: { x: ball.x, y: ball.y },
      hostY: player.y,
      clientY: ai.y,
      hostScore: player.score,
      clientScore: ai.score,
      message: roundMessage,
      paused,
    });
  }

  function formatPercent(value) {
    return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
  }

  function triggerImpact(flash, shake) {
    impactFlash = Math.max(impactFlash, flash);
    shakeTime = Math.max(shakeTime, 0.16);
    shakeStrength = Math.max(shakeStrength, shake);
  }

  function randomSpawnDelay() {
    return POWERUP_MIN_SPAWN + Math.random() * (POWERUP_MAX_SPAWN - POWERUP_MIN_SPAWN);
  }

  function spawnPowerUp() {
    const type = POWERUP_KEYS[Math.floor(Math.random() * POWERUP_KEYS.length)];
    const margin = POWERUP_RADIUS + 30;
    fieldPowerUp = {
      type,
      x: player.x + player.width / 2,
      y: margin + Math.random() * (HEIGHT - margin * 2),
      life: POWERUP_LIFETIME,
      spawnedAt: performance.now(),
    };
    sfx.powerUpSpawn();
  }

  function updatePowerUpSpawning(deltaSeconds) {
    if (fieldPowerUp) {
      fieldPowerUp.life -= deltaSeconds;
      if (fieldPowerUp.life <= 0) {
        fieldPowerUp = null;
        powerUpSpawnTimer = randomSpawnDelay();
      }
      return;
    }

    powerUpSpawnTimer -= deltaSeconds;
    if (powerUpSpawnTimer <= 0) {
      spawnPowerUp();
    }
  }

  function circleRectCollision(circleX, circleY, radius, rect) {
    const closestX = clamp(circleX, rect.x, rect.x + rect.width);
    const closestY = clamp(circleY, rect.y, rect.y + rect.height);
    const dx = circleX - closestX;
    const dy = circleY - closestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function checkPowerUpPickup() {
    if (!fieldPowerUp) {
      return;
    }

    if (circleRectCollision(fieldPowerUp.x, fieldPowerUp.y, POWERUP_RADIUS, player)) {
      applyPowerUp(fieldPowerUp.type);
      fieldPowerUp = null;
      powerUpSpawnTimer = randomSpawnDelay();
    }
  }

  function applyPowerUp(type) {
    sfx.powerUpCollect(type);
    triggerImpact(0.1, 3);

    if (type === "paddle") {
      if (effects.paddle <= 0) {
        player.height = PADDLE_HEIGHT * 1.5;
        player.y = clamp(player.y - (player.height - PADDLE_HEIGHT) / 2, 0, HEIGHT - player.height);
      }
      effects.paddle = EFFECT_DURATION;
    } else if (type === "slow") {
      if (effects.slow <= 0) {
        ball.vx *= 0.75;
        ball.vy *= 0.75;
      }
      effects.slow = EFFECT_DURATION;
    } else if (type === "immunity") {
      effects.immunity = EFFECT_DURATION;
    }
  }

  function updateActiveEffects(deltaSeconds) {
    if (effects.paddle > 0) {
      effects.paddle -= deltaSeconds;
      if (effects.paddle <= 0) {
        effects.paddle = 0;
        sfx.powerUpExpire();
        player.height = PADDLE_HEIGHT;
        player.y = clamp(player.y, 0, HEIGHT - player.height);
      }
    }

    if (effects.slow > 0) {
      effects.slow -= deltaSeconds;
      if (effects.slow <= 0) {
        effects.slow = 0;
        sfx.powerUpExpire();
      }
    }

    if (effects.immunity > 0) {
      effects.immunity -= deltaSeconds;
      if (effects.immunity <= 0) {
        effects.immunity = 0;
        sfx.powerUpExpire();
      }
    }
  }

  function updatePlayer(deltaSeconds) {
    if (touchTargetY !== null) {
      player.y = clamp(touchTargetY - player.height / 2, 0, HEIGHT - player.height);
      checkPowerUpPickup();
      return;
    }

    const up = keys.has("w") || keys.has("arrowup");
    const down = keys.has("s") || keys.has("arrowdown");
    const movement = (down ? 1 : 0) - (up ? 1 : 0);

    player.y += movement * player.speed * deltaSeconds;
    player.y = clamp(player.y, 0, HEIGHT - player.height);
    checkPowerUpPickup();
  }

  function updateAi(deltaSeconds) {
    const aiCenter = ai.y + ai.height / 2;
    const ballCenter = ball.y + ball.size / 2;
    const wobble = selectedDifficulty.reactionWobble;
    const reactionOffset = ball.vx > 0 ? Math.sin(performance.now() / 180) * wobble : 0;
    const target = ballCenter + reactionOffset;
    const distance = target - aiCenter;
    const maxStep = ai.speed * deltaSeconds;

    ai.y += clamp(distance, -maxStep, maxStep);
    ai.y = clamp(ai.y, 0, HEIGHT - ai.height);
  }

  function updateBall(deltaSeconds) {
    ball.x += ball.vx * deltaSeconds;
    ball.y += ball.vy * deltaSeconds;

    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy *= -1;
      sfx.wallBounce();
    }

    if (ball.y + ball.size >= HEIGHT) {
      ball.y = HEIGHT - ball.size;
      ball.vy *= -1;
      sfx.wallBounce();
    }

    if (rectangleCollision(ball, player) && ball.vx < 0) {
      bounceOffPaddle(player, 1);
    }

    if ((gameMode === "bot" || gameMode === "online") && rectangleCollision(ball, ai) && ball.vx > 0) {
      bounceOffPaddle(ai, -1);
    }

    if (gameMode === "survival" && ball.x + ball.size >= WIDTH) {
      ball.x = WIDTH - ball.size;
      ball.vx = -Math.abs(ball.vx);
      ball.vy += Math.sin(performance.now() / 90) * 35;
      triggerImpact(0.08, 3);
      sfx.wallBounce();
    }

    if (ball.x + ball.size < 0) {
      if (effects.immunity > 0) {
        ball.x = 0;
        ball.vx = Math.abs(ball.vx);
        triggerImpact(0.16, 6);
        sfx.wallBounce();
      } else if (gameMode === "survival") {
        endSurvivalRun();
      } else {
        pointScored("ai");
      }
    } else if ((gameMode === "bot" || gameMode === "online") && ball.x > WIDTH) {
      pointScored("player");
    }
  }

  function drawCourt() {
    ctx.fillStyle = "#171b22";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (impactFlash > 0) {
      ctx.fillStyle = `rgba(121, 216, 255, ${impactFlash})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    ctx.strokeStyle = "#303746";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 18);
    ctx.lineTo(WIDTH / 2, HEIGHT - 18);
    ctx.stroke();
    ctx.setLineDash([]);

    if (gameMode === "survival") {
      ctx.strokeStyle = "#ffcc66";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(WIDTH - 8, 0);
      ctx.lineTo(WIDTH - 8, HEIGHT);
      ctx.stroke();
    }
  }

  function drawRect(rect, color) {
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  function drawBall() {
    ballTrail.forEach((point, index) => {
      const alpha = ((index + 1) / ballTrail.length) * 0.22;
      ctx.fillStyle = `rgba(248, 244, 219, ${alpha})`;
      ctx.fillRect(point.x, point.y, ball.size, ball.size);
    });

    ctx.fillStyle = "#f8f4db";
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
  }

  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function drawPowerIcon(type, radius, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    if (type === "paddle") {
      const barWidth = radius * 0.28;
      const barHeight = radius * 1.15;
      drawRoundedRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, barWidth / 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-radius * 0.28, -barHeight / 2 - radius * 0.16);
      ctx.lineTo(0, -barHeight / 2 - radius * 0.42);
      ctx.lineTo(radius * 0.28, -barHeight / 2 - radius * 0.16);
      ctx.lineWidth = radius * 0.16;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-radius * 0.28, barHeight / 2 + radius * 0.16);
      ctx.lineTo(0, barHeight / 2 + radius * 0.42);
      ctx.lineTo(radius * 0.28, barHeight / 2 + radius * 0.16);
      ctx.stroke();
    } else if (type === "slow") {
      const rx = radius * 0.58;
      const ry = radius * 0.4;

      ctx.beginPath();
      ctx.ellipse(-radius * 0.02, radius * 0.05, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(radius * 0.5, -radius * 0.02, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(16, 19, 25, 0.85)";
      [-0.32, 0, 0.32].forEach((offset) => {
        ctx.beginPath();
        ctx.ellipse(offset * radius, radius * 0.36, radius * 0.1, radius * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(radius * 0.5, -radius * 0.02, radius * 0.05, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "immunity") {
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.85);
      ctx.lineTo(radius * 0.7, -radius * 0.5);
      ctx.bezierCurveTo(radius * 0.7, radius * 0.15, radius * 0.4, radius * 0.65, 0, radius * 0.9);
      ctx.bezierCurveTo(-radius * 0.4, radius * 0.65, -radius * 0.7, radius * 0.15, -radius * 0.7, -radius * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(16, 19, 25, 0.85)";
      ctx.lineWidth = radius * 0.14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(-radius * 0.32, 0);
      ctx.lineTo(-radius * 0.06, radius * 0.28);
      ctx.lineTo(radius * 0.4, -radius * 0.28);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawPlayerPaddle() {
    if (effects.immunity > 0) {
      const glowPulse = 0.5 + Math.sin(performance.now() / 110) * 0.25;
      ctx.save();
      ctx.shadowColor = POWERUP_TYPES.immunity.color;
      ctx.shadowBlur = 18 * glowPulse + 6;
      ctx.fillStyle = "#63d2ff";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.restore();
      ctx.strokeStyle = POWERUP_TYPES.immunity.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
      return;
    }

    if (effects.paddle > 0) {
      ctx.save();
      ctx.shadowColor = POWERUP_TYPES.paddle.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#63d2ff";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.restore();
      return;
    }

    drawRect(player, "#63d2ff");
  }

  function drawPowerUp() {
    if (!fieldPowerUp) {
      return;
    }

    const def = POWERUP_TYPES[fieldPowerUp.type];
    const pulse = 1 + Math.sin(performance.now() / 160) * 0.08;
    const radius = POWERUP_RADIUS * pulse;
    const lifeRatio = clamp(fieldPowerUp.life / POWERUP_LIFETIME, 0, 1);

    ctx.save();
    ctx.translate(fieldPowerUp.x, fieldPowerUp.y);

    const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.7);
    gradient.addColorStop(0, def.glow);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(16, 19, 25, 0.88)";
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = def.color;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    drawPowerIcon(fieldPowerUp.type, radius * 0.72, "#ffffff");

    ctx.restore();
  }

  function drawEffectHud() {
    const active = POWERUP_KEYS.filter((key) => effects[key] > 0);
    if (!active.length) {
      return;
    }

    const size = 36;
    const gap = 10;
    const y = 16;
    let x = 16;

    active.forEach((key) => {
      const def = POWERUP_TYPES[key];
      const ratio = clamp(effects[key] / EFFECT_DURATION, 0, 1);

      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);

      ctx.fillStyle = "rgba(16, 19, 25, 0.8)";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2 - 1.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2 - 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();

      drawPowerIcon(key, size * 0.32, "#ffffff");

      ctx.restore();
      x += size + gap;
    });
  }

  function drawMessage() {
    if (!roundMessage) {
      return;
    }

    ctx.fillStyle = "rgba(18, 20, 24, 0.72)";
    ctx.fillRect(0, HEIGHT / 2 - 42, WIDTH, 84);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(roundMessage, WIDTH / 2, HEIGHT / 2);
  }

  function draw() {
    ctx.save();
    if (shakeTime > 0) {
      const shakeX = (Math.random() - 0.5) * shakeStrength;
      const shakeY = (Math.random() - 0.5) * shakeStrength;
      ctx.translate(shakeX, shakeY);
    }

    drawCourt();
    drawPowerUp();
    drawPlayerPaddle();
    if (gameMode === "bot") {
      drawRect(ai, "#ffcc66");
    } else if (gameMode === "online") {
      drawRect(ai, "#ff8fd6");
    }
    drawBall();
    drawEffectHud();
    drawMessage();
    ctx.restore();
  }

  function gameLoop(now) {
    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;
    impactFlash = Math.max(0, impactFlash - deltaSeconds * 1.8);
    shakeTime = Math.max(0, shakeTime - deltaSeconds);
    if (shakeTime === 0) {
      shakeStrength = 0;
    }

    if (gameActive) {
      const client = isOnlineClient();
      const host = isOnlineHost();

      if (!client) {
        updatePlayer(deltaSeconds);
      }
      if (client) {
        updateAndSendClientInput(deltaSeconds);
      }

      if (!paused) {
        ballTrail.push({ x: ball.x, y: ball.y });
        if (ballTrail.length > 12) {
          ballTrail.shift();
        }

        if (gameMode === "bot") {
          updateAi(deltaSeconds);
        }

        if (!client) {
          updateBall(deltaSeconds);
          updatePowerUpSpawning(deltaSeconds);
          updateActiveEffects(deltaSeconds);
        }
      }

      if (host) {
        broadcastHostState();
      }
    }

    draw();
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (["arrowup", "arrowdown", " "].includes(key)) {
      event.preventDefault();
    }

    if (key === " ") {
      startRound();
      return;
    }

    if (key === "escape" && screen === "game") {
      returnToMenu();
      return;
    }

    keys.add(key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  function relativeCanvasY(clientY) {
    const rect = canvas.getBoundingClientRect();
    const ratio = HEIGHT / rect.height;
    return clamp((clientY - rect.top) * ratio, 0, HEIGHT);
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    event.preventDefault();
    touchTargetY = relativeCanvasY(touch.clientY);

    if (screen === "game" && gameActive && paused) {
      startRound();
    }
  }

  function handleTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    event.preventDefault();
    touchTargetY = relativeCanvasY(touch.clientY);
  }

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

  restartButton.addEventListener("click", returnToMenu);
  soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundButton.textContent = soundEnabled ? "\uD83D\uDD0A Sound: On" : "\uD83D\uDD07 Sound: Off";
    if (soundEnabled) {
      ensureAudio();
    }
  });

  resetBall();
  renderMenu();
  draw();
  requestAnimationFrame(gameLoop);
})();