const canvas = document.getElementById('appleCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const appleImage = new Image();
appleImage.src = 'apple.png'; // Replace with your apple image path
const backgroundImage = new Image();
backgroundImage.src = 'background6.png'; // Replace with your background image path

const numApples = 25; // Number of apples
const appleSize = 40; // Fixed size for apples
const gravity = 0.5; // Gravity constant
let tiltX = 0; // Horizontal tilt
let tiltY = 0; // Vertical tilt

const apples = [];

// Apple class
class Apple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = appleSize / 2;
    this.dx = Math.random() * 2 - 1; // Random initial horizontal velocity
    this.dy = Math.random() * 2 - 1; // Random initial vertical velocity
  }

  draw() {
    // Draw shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + appleSize / 2,
      this.y + appleSize + 5,
      this.radius * 0.8,
      this.radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    // Draw apple
    ctx.drawImage(appleImage, this.x, this.y, appleSize, appleSize);
  }

  update() {
    // Apply gravity and tilt
    this.dy += gravity;
    this.dx += tiltX * 0.05;
    this.dy += tiltY * 0.05;

    // Update position
    this.x += this.dx;
    this.y += this.dy;

    // Friction
    this.dx *= 0.98;
    this.dy *= 0.98;

    // Wall collisions
    if (this.x < 0) {
      this.x = 0;
      this.dx *= -0.6;
    }
    if (this.x + appleSize > canvas.width) {
      this.x = canvas.width - appleSize;
      this.dx *= -0.6;
    }
    if (this.y < 0) {
      this.y = 0;
      this.dy *= -0.6;
    }
    if (this.y + appleSize > canvas.height) {
      this.y = canvas.height - appleSize;
      this.dy *= -0.6;
    }

    this.draw();
  }
}

// Initialize apples
function initializeApples() {
  apples.length = 0; // Clear existing apples
  for (let i = 0; i < numApples; i++) {
    const x = Math.random() * (canvas.width - appleSize);
    const y = Math.random() * (canvas.height - appleSize);
    apples.push(new Apple(x, y));
  }
}

// Resolve collisions
function resolveCollisions() {
  for (let i = 0; i < apples.length; i++) {
    for (let j = i + 1; j < apples.length; j++) {
      const apple1 = apples[i];
      const apple2 = apples[j];

      const dx = apple2.x + apple1.radius - (apple1.x + apple1.radius);
      const dy = apple2.y + apple1.radius - (apple1.y + apple1.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < appleSize) {
        // Resolve overlap
        const overlap = (appleSize - distance) / 2;
        const angle = Math.atan2(dy, dx);
        const overlapX = Math.cos(angle) * overlap;
        const overlapY = Math.sin(angle) * overlap;

        apple1.x -= overlapX;
        apple1.y -= overlapY;
        apple2.x += overlapX;
        apple2.y += overlapY;

        // Exchange velocities
        const tempDx = apple1.dx;
        const tempDy = apple1.dy;
        apple1.dx = apple2.dx * 0.7;
        apple1.dy = apple2.dy * 0.7;
        apple2.dx = tempDx * 0.7;
        apple2.dy = tempDy * 0.7;
      }
    }
  }
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  // Update and draw apples
  apples.forEach((apple) => apple.update());

  // Handle collisions
  resolveCollisions();

  requestAnimationFrame(animate);
}

// Device orientation event listener
window.addEventListener('deviceorientation', (event) => {
  tiltX = event.gamma || 0; // Left/Right tilt
  tiltY = event.beta || 0;  // Up/Down tilt
});

// Resize canvas without resizing apples
window.addEventListener('resize', () => {
  const prevWidth = canvas.width;
  const prevHeight = canvas.height;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scaleX = canvas.width / prevWidth;
  const scaleY = canvas.height / prevHeight;

  apples.forEach((apple) => {
    apple.x *= scaleX;
    apple.y *= scaleY;
  });
});

// Start game after images load
let imagesLoaded = 0;

function startGame() {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    initializeApples();
    animate();
  }
}

backgroundImage.onload = startGame;
appleImage.onload = startGame;

backgroundImage.onerror = () => console.error('Background image failed to load.');
appleImage.onerror = () => console.error('Apple image failed to load.');
