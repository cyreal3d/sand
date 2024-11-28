const canvas = document.getElementById('appleCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initializeApples(); // Reinitialize apples on resize
});

const appleImage = new Image();
appleImage.src = 'apple.png'; // Replace with your apple image

// Gravity and motion variables
let tiltX = 0; // Horizontal tilt
let tiltY = 0; // Vertical tilt

const apples = [];
const numApples = 25; // Number of apples

// Apple class
class Apple {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = size / 2; // For collision calculations
    this.dx = 0; // Horizontal velocity
    this.dy = 0; // Vertical velocity
  }

  draw() {
    ctx.drawImage(appleImage, this.x, this.y, this.size, this.size);
  }

  update() {
    // Apply tilt (gravity simulation)
    this.dx += tiltX * 0.1;
    this.dy += tiltY * 0.1;

    // Update position
    this.x += this.dx;
    this.y += this.dy;

    // Friction to slow down motion
    this.dx *= 0.98;
    this.dy *= 0.98;

    // Handle wall collisions
    if (this.x < 0) {
      this.x = 0;
      this.dx *= -0.8; // Bounce back
    }
    if (this.x + this.size > canvas.width) {
      this.x = canvas.width - this.size;
      this.dx *= -0.8;
    }
    if (this.y < 0) {
      this.y = 0;
      this.dy *= -0.8;
    }
    if (this.y + this.size > canvas.height) {
      this.y = canvas.height - this.size;
      this.dy *= -0.8;
    }

    this.draw();
  }
}

// Detect and resolve collisions between apples
function resolveCollisions() {
  for (let i = 0; i < apples.length; i++) {
    for (let j = i + 1; j < apples.length; j++) {
      const apple1 = apples[i];
      const apple2 = apples[j];

      const dx = apple2.x + apple2.radius - (apple1.x + apple1.radius);
      const dy = apple2.y + apple2.radius - (apple1.y + apple1.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < apple1.radius + apple2.radius) {
        // Resolve overlap
        const overlap = (apple1.radius + apple2.radius - distance) / 2;

        // Push apples apart
        const angle = Math.atan2(dy, dx);
        const overlapX = Math.cos(angle) * overlap;
        const overlapY = Math.sin(angle) * overlap;

        apple1.x -= overlapX;
        apple1.y -= overlapY;
        apple2.x += overlapX;
        apple2.y += overlapY;

        // Exchange velocities (simple elastic collision)
        const tempDx = apple1.dx;
        const tempDy = apple1.dy;
        apple1.dx = apple2.dx;
        apple1.dy = apple2.dy;
        apple2.dx = tempDx;
        apple2.dy = tempDy;
      }
    }
  }
}

// Initialize apples
function initializeApples() {
  apples.length = 0; // Clear existing apples
  const appleSize = 40; // Size of each apple
  for (let i = 0; i < numApples; i++) {
    const x = Math.random() * (canvas.width - appleSize);
    const y = Math.random() * (canvas.height - appleSize);
    apples.push(new Apple(x, y, appleSize));
  }
}

// Device orientation event listener
window.addEventListener('deviceorientation', (event) => {
  tiltX = event.gamma || 0; // Left/Right tilt
  tiltY = event.beta || 0;  // Up/Down tilt
});

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Update and draw apples
  apples.forEach(apple => apple.update());

  // Handle collisions
  resolveCollisions();

  requestAnimationFrame(animate);
}

// Start the animation once the image loads
appleImage.onload = () => {
  initializeApples();
  animate();
};
