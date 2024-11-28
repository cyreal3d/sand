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
appleImage.src = 'apple.png'; // Ensure this file exists in the correct directory

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg'; // Replace this with your background image file

// Gravity and motion variables
let tiltX = 0; // Horizontal tilt
let tiltY = 0; // Vertical tilt
const gravity = 0.5; // Constant downward pull

const apples = [];
const numApples = 25; // Number of apples
const appleSize = 40; // Constant size for all apples

// Apple class
class Apple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = appleSize; // Apples have a fixed size
    this.radius = this.size / 2; // For collision calculations
    this.dx = Math.random() * 2 - 1; // Random initial horizontal velocity
    this.dy = Math.random() * 2 - 1; // Random initial vertical velocity
  }

  draw() {
    if (appleImage.complete && appleImage.naturalWidth > 0) {
      // Add shadow for depth
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2, this.y + this.size + 5, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      ctx.drawImage(appleImage, this.x, this.y, this.size, this.size);
    } else {
      // Draw a red circle if the image fails to load
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  update() {
    // Apply gravity
    this.dy += gravity;

    // Apply tilt from device orientation
    this.dx += tiltX * 0.05;
    this.dy += tiltY * 0.05;

    // Update position
    this.x += this.dx;
    this.y += this.dy;

    // Friction to slow down motion
    this.dx *= 0.98; // Horizontal friction
    this.dy *= 0.98; // Vertical friction

    // Handle wall collisions
    if (this.x < 0) {
      this.x = 0;
      this.dx *= -0.6; // Bounce back
    }
    if (this.x + this.size > canvas.width) {
      this.x = canvas.width - this.size;
      this.dx *= -0.6;
    }
    if (this.y < 0) {
      this.y = 0;
      this.dy *= -0.6;
    }
    if (this.y + this.size > canvas.height) {
      this.y = canvas.height - this.size;
      this.dy *= -0.6;
    }

    this.draw();
  }
}

// Prevent overlapping during initialization
function initializeApples() {
  apples.length = 0; // Clear existing apples

  for (let i = 0; i < numApples; i++) {
    let x, y;
    let overlapping;

    // Ensure no apples overlap at the start
    do {
      overlapping = false;
      x = Math.random() * (canvas.width - appleSize);
      y = Math.random() * (canvas.height - appleSize);

      for (const apple of apples) {
        const distance = Math.sqrt((apple.x - x) ** 2 + (apple.y - y) ** 2);
        if (distance < appleSize) {
          overlapping = true;
          break;
        }
      }
    } while (overlapping);

    apples.push(new Apple(x, y));
  }
}

// Collision Detection and Resolution
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

        // Exchange velocities with reduced bounce
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

// Device orientation event listener
window.addEventListener('deviceorientation', (event) => {
  tiltX = event.gamma || 0; // Left/Right tilt
  tiltY = event.beta || 0;  // Up/Down tilt
});

// Animation loop
function animate() {
  // Draw the background image
  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  // Update and draw apples
  apples.forEach(apple => apple.update());

  // Handle collisions
  resolveCollisions();

  // Request the next frame
  requestAnimationFrame(animate);
}

// Start the animation once the image loads
backgroundImage.onload = () => {
  initializeApples();
  animate();
};
