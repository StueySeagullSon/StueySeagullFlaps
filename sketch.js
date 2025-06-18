let player;
let obstacles = [];
let score = 0;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let bgLayers = [];
let seagullSprite;
let obstacleSprite;

function setup() {
  // Use windowWidth and windowHeight for a responsive canvas
  createCanvas(windowWidth, windowHeight);
  player = new Player();

  // Create pixelated seagull sprite
  seagullSprite = createGraphics(40, 30);
  drawSeagull(seagullSprite, 0);

  // Create pixelated obstacle sprite (e.g., a chimney)
  obstacleSprite = createGraphics(50, 100);
  drawObstacle(obstacleSprite);

  // Background layers for parallax effect
  bgLayers.push(new BackgroundLayer(0.2, height / 2, 5, 20, 200)); // Far clouds
  bgLayers.push(new BackgroundLayer(0.5, height / 2 - 50, 10, 30, 150)); // Near clouds
  bgLayers.push(new BackgroundLayer(1, 0, 0, 0, 0));
}

function draw() {
  background(135, 206, 250); // Sky blue

  for (let layer of bgLayers) {
    layer.update();
    layer.display();
  }

  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'playing') {
    player.update();
    player.display();

    // Add new obstacles periodically
    if (frameCount % 100 === 0) {
      obstacles.push(new Obstacle());
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();
      obstacles[i].display();

      if (obstacles[i].hits(player)) {
        gameState = 'gameOver';
      }

      if (obstacles[i].offscreen()) {
        obstacles.splice(i, 1);
        score++;
      }
    }
    drawScore();
  } else if (gameState === 'gameOver') {
    drawGameOverScreen();
  }

  drawInstructions();
}

// Handle keyboard input for desktop
function keyPressed() {
  if (key === ' ') {
    handleInput();
  }
}

// Handle touch input for mobile
function touchStarted() {
  handleInput();
  return false; // prevent default browser behavior
}

// A single function to handle all player input
function handleInput() {
  if (gameState === 'playing') {
    player.jump();
  } else if (gameState === 'start' || gameState === 'gameOver') {
    resetGame();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function resetGame() {
  player = new Player();
  obstacles = [];
  score = 0;
  gameState = 'playing';
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(0);
  textSize(40);
  text("Stuey's Seagull Son", width / 2, height / 2 - 50);
  textSize(20);
  text("Tap screen to Start", width / 2, height / 2);
}

function drawGameOverScreen() {
    textAlign(CENTER, CENTER);
    fill(255,0,0);
    textSize(50);
    text('GAME OVER', width / 2, height / 2 - 40);
    fill(0);
    textSize(20);
    text(`Score: ${score}`, width / 2, height / 2 + 10);
    text('Tap screen to restart', width / 2, height / 2 + 40);
}

function drawScore() {
  textAlign(LEFT, TOP);
  fill(0);
  textSize(24);
  text(`Score: ${score}`, 20, 20);
}

function drawInstructions() {
    if (gameState === 'playing') {
        textAlign(CENTER, BOTTOM);
        fill(0, 100);
        textSize(16);
        text("Tap screen to flap", width/2, height - 10);
    } else {
        textAlign(CENTER, BOTTOM);
        fill(0, 100);
        textSize(16);
        text("Also playable with SPACEBAR on desktop", width/2, height - 10);
    }
}

// (The rest of the code: drawSeagull, drawObstacle, and the Player, Obstacle, and BackgroundLayer classes remain the same)

// Function to draw a pixelated seagull
function drawSeagull(pg, frame) {
    pg.background(0, 0); // Transparent background
    pg.noStroke();
    pg.fill(220);
    pg.rect(10, 10, 20, 10); // Body
    pg.rect(30, 5, 10, 10); // Head
    pg.fill(255, 200, 0);
    pg.rect(40, 8, 5, 4); // Beak
    pg.fill(0);
    pg.rect(32, 7, 2, 2); // Eye
    pg.fill(200);
    if (floor(frame / 10) % 2 === 0) {
        pg.rect(5, 0, 15, 8); // Wing up
    } else {
        pg.rect(5, 12, 15, 8); // Wing down
    }
}

// Function to draw a pixelated obstacle
function drawObstacle(pg) {
  pg.background(0, 0);
  pg.fill(139, 69, 19);
  pg.rect(0, 0, 50, 100);
  pg.fill(105, 105, 105);
  pg.rect(0, 0, 50, 10);
}

class Player {
  constructor() {
    this.x = width / 4;
    this.y = height / 2;
    this.gravity = 0.6;
    this.lift = -15;
    this.velocity = 0;
    this.size = 30;
  }

  jump() {
    this.velocity += this.lift;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y > height - this.size / 2) {
      this.y = height - this.size / 2;
      this.velocity = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  display() {
    drawSeagull(seagullSprite, frameCount);
    image(seagullSprite, this.x, this.y - this.size / 2);
  }
}

class Obstacle {
  constructor() {
    this.x = width;
    this.w = 60;
    this.speed = 4;
    this.gap = height / 3.5;

    let topMin = 50;
    let bottomMin = 50;
    this.top = random(topMin, height - bottomMin - this.gap);
    this.bottom = height - this.top - this.gap;
  }

  hits(player) {
    if (player.y - player.size / 2 < this.top || player.y + player.size/2 > height - this.bottom) {
        if (player.x + player.size/2 > this.x && player.x - player.size/2 < this.x + this.w) {
            return true;
        }
    }
    return false;
  }

  update() {
    this.x -= this.speed;
  }

  display() {
    image(obstacleSprite, this.x, 0, this.w, this.top);
    image(obstacleSprite, this.x, height - this.bottom, this.w, this.bottom);
  }

  offscreen() {
    return this.x < -this.w;
  }
}

class BackgroundLayer {
  constructor(speed, y, size, alpha, col) {
    this.speed = speed;
    this.y = y;
    this.elements = [];
    for (let i = 0; i < 10; i++) {
        this.elements.push({x: random(width*2), y: this.y + random(-40, 40), size: random(size*0.8, size*1.2), color: color(col, alpha)});
    }
  }

  update() {
    for (let el of this.elements) {
      el.x -= this.speed;
      if (el.x < -el.size) {
        el.x = width + random(el.size);
      }
    }
  }

  display() {
    noStroke();
    for (let el of this.elements) {
      fill(el.color);
      ellipse(el.x, el.y, el.size * 2, el.size * 1.4);
    }
  }
}