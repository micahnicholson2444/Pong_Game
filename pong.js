(() => {
  const WIDTH = 900;
  const HEIGHT = 560;
  const PADDLE_WIDTH = 14;
  const PADDLE_HEIGHT = 96;
  const BALL_SIZE = 14;
  const WINNING_SCORE = 7;

  const pageStyle = document.createElement("style");
  pageStyle.textContent = `
    html, body {
      margin: 0;
      min-height: 100%;
      background: #121418;
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

    .pong-button:hover {
      background: #2a3240;
    }

    canvas {
      width: 100%;
      aspect-ratio: ${WIDTH} / ${HEIGHT};
      display: block;
      border: 1px solid #384252;
      background: #171b22;
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
  restartButton.textContent = "Restart";

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  topbar.append(help, score, restartButton);
  shell.append(topbar, canvas);
  document.body.appendChild(shell);

  const ctx = canvas.getContext("2d");
  const keys = new Set();

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
    speed: 410,
    score: 0,
  };

  const ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    speed: 430,
    vx: 0,
    vy: 0,
  };

  let lastTime = performance.now();
  let roundMessage = "Press Space to serve";
  let paused = true;

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
    ball.speed = 430;
    ball.vx = direction * ball.speed;
    ball.vy = (Math.random() * 240 - 120) || 100;
  }

  function restartGame() {
    player.score = 0;
    ai.score = 0;
    score.textContent = "0 : 0";
    resetPaddles();
    resetBall();
    paused = true;
    roundMessage = "Press Space to serve";
  }

  function startRound() {
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

    ball.speed = Math.min(ball.speed + 24, 760);
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
    const reactionOffset = ball.vx > 0 ? Math.sin(performance.now() / 180) * 18 : 0;
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

    updatePlayer(deltaSeconds);

    if (!paused) {
      updateAi(deltaSeconds);
      updateBall(deltaSeconds);
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

    keys.add(key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  restartButton.addEventListener("click", restartGame);

  resetBall();
  draw();
  requestAnimationFrame(gameLoop);
})();
