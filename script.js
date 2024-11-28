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

// Gravity and motion variables
let tiltX = 0; // Horizontal tilt
let tiltY = 0; // Vertical tilt
const gravity = 0.5; // Constant downward pull

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
    if (appleImage.complete && appleImage.naturalWidth > 0) {
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
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw apples
  apples.forEach(apple => apple.update());

  // Request the next frame
  requestAnimationFrame(animate);
}

// Start the animation once the image loads
appleImage.onload = () => {
  console.log("Apple image loaded!");
  initializeApples();
  animate();
};

// Fallback if the image fails to load
appleImage.onerror = () => {
  console.error("Failed to load apple image. Drawing circles instead.");
  initializeApples();
  animate();
};
