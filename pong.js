(() => {
  const WIDTH = 900;
  const HEIGHT = 560;
  const PADDLE_WIDTH = 14;
  const PADDLE_HEIGHT = 96;
  const BALL_SIZE = 14;
  const WINNING_SCORE = 7;

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
    }

    body {
      display: grid;
      place-items: center;
      overflow: hidden;
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

  const shell = document.createElement("main");
  shell.className = "pong-shell";

  const topbar = document.createElement("div");
  topbar.className = "pong-topbar";

  const help = document.createElement("div");
  help.textContent = "Move: W/S or arrow keys";

  const score = document.createElement("div");
  score.className = "pong-score";
  score.textContent = "0 : 0";

  const restartButton = document.createElement("button");
  restartButton.className = "pong-button";
  restartButton.type = "button";
  restartButton.textContent = "Menu";

  const board = document.createElement("section");
  board.className = "pong-board";

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const menu = document.createElement("div");
  menu.className = "pong-menu";

  board.append(canvas, menu);
  topbar.append(help, score, restartButton);
  shell.append(topbar, board);
  document.body.appendChild(shell);

  const ctx = canvas.getContext("2d");
  const keys = new Set();
  let screen = "main";
  let selectedDifficulty = DIFFICULTIES.Medium;
  let ballSpeedPercent = 100;
  let lastTime = performance.now();
  let roundMessage = "Press Space to serve";
  let paused = true;
  let gameActive = false;

  const player = {
    x: 36,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 520,
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
        subtitle("Classic Pong against an AI opponent."),
        makeButton("PLAY", () => setScreen("mode"), "primary"),
        makeButton("INFO", () => setScreen("info")),
        makeButton("CREDITS", () => setScreen("credits"))
      );
    }

    if (screen === "mode") {
      panel.append(
        title("PLAY"),
        subtitle("Choose your match type."),
        makeButton("Play Against Bot", () => setScreen("speed"), "primary"),
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

    if (screen === "info") {
      const instructions = document.createElement("ul");
      instructions.className = "pong-info";
      ["Use W/S or the arrow keys to move your paddle.", "Press Space to serve the ball.", "First player to 7 points wins.", "Hit the ball near the paddle edges to change its angle."].forEach((text) => {
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetPaddles() {
    player.y = HEIGHT / 2 - player.height / 2;
    ai.y = HEIGHT / 2 - ai.height / 2;
  }

  function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
    ball.x = WIDTH / 2 - ball.size / 2;
    ball.y = HEIGHT / 2 - ball.size / 2;
    ball.speed = getStartingBallSpeed();
    ball.vx = direction * ball.speed;
    ball.vy = (Math.random() * 240 - 120) || 100;
  }

  function getStartingBallSpeed() {
    return selectedDifficulty.ballSpeed * (ballSpeedPercent / 100);
  }

  function restartGame() {
    player.score = 0;
    ai.score = 0;
    score.textContent = "0 : 0";
    help.textContent = `Difficulty: ${selectedDifficulty.name} | Speed: ${ballSpeedPercent}%`;
    ai.speed = selectedDifficulty.aiSpeed;
    resetPaddles();
    resetBall();
    paused = true;
    gameActive = true;
    roundMessage = "Press Space to serve";
  }

  function startGame(difficulty) {
    selectedDifficulty = difficulty;
    setScreen("game");
    restartGame();
  }

  function returnToMenu() {
    gameActive = false;
    paused = true;
    roundMessage = "";
    help.textContent = "Move: W/S or arrow keys";
    setScreen("main");
  }

  function startRound() {
    if (!gameActive || screen !== "game") {
      return;
    }

    if (player.score >= WINNING_SCORE || ai.score >= WINNING_SCORE) {
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

    ball.speed = Math.min(ball.speed + 24, getStartingBallSpeed() + 330);
    ball.vx = direction * ball.speed;
    ball.vy = hitPosition * 360;
    ball.x = direction > 0 ? paddle.x + paddle.width : paddle.x - ball.size;
  }

  function pointScored(scoringSide) {
    if (scoringSide === "player") {
      player.score += 1;
      resetBall(1);
    } else {
      ai.score += 1;
      resetBall(-1);
    }

    score.textContent = `${player.score} : ${ai.score}`;
    paused = true;

    if (player.score >= WINNING_SCORE) {
      roundMessage = "You win! Press Space to play again";
    } else if (ai.score >= WINNING_SCORE) {
      roundMessage = "AI wins. Press Space to try again";
    } else {
      roundMessage = "Press Space to serve";
    }
  }

  function updatePlayer(deltaSeconds) {
    const up = keys.has("w") || keys.has("arrowup");
    const down = keys.has("s") || keys.has("arrowdown");
    const movement = (down ? 1 : 0) - (up ? 1 : 0);

    player.y += movement * player.speed * deltaSeconds;
    player.y = clamp(player.y, 0, HEIGHT - player.height);
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
    }

    if (ball.y + ball.size >= HEIGHT) {
      ball.y = HEIGHT - ball.size;
      ball.vy *= -1;
    }

    if (rectangleCollision(ball, player) && ball.vx < 0) {
      bounceOffPaddle(player, 1);
    }

    if (rectangleCollision(ball, ai) && ball.vx > 0) {
      bounceOffPaddle(ai, -1);
    }

    if (ball.x + ball.size < 0) {
      pointScored("ai");
    } else if (ball.x > WIDTH) {
      pointScored("player");
    }
  }

  function drawCourt() {
    ctx.fillStyle = "#171b22";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = "#303746";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 18);
    ctx.lineTo(WIDTH / 2, HEIGHT - 18);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawRect(rect, color) {
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  function drawBall() {
    ctx.fillStyle = "#f8f4db";
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
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
    drawCourt();
    drawRect(player, "#63d2ff");
    drawRect(ai, "#ffcc66");
    drawBall();
    drawMessage();
  }

  function gameLoop(now) {
    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.033);
    lastTime = now;

    if (gameActive) {
      updatePlayer(deltaSeconds);

      if (!paused) {
        updateAi(deltaSeconds);
        updateBall(deltaSeconds);
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

  restartButton.addEventListener("click", returnToMenu);

  resetBall();
  renderMenu();
  draw();
  requestAnimationFrame(gameLoop);
})();
