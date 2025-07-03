const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 5000;
const particles = [];
const mouse = { x: width/2, y: height/2, active: false };
let attractMode = false;

// Particle class
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = 1.5;
  }

  update() {
    // Update position by velocity
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if(this.x < 0 || this.x > width) this.vx *= -1;
    if(this.y < 0 || this.y > height) this.vy *= -1;

    // Interaction with mouse if active
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      const minDist = 150;  // influence radius

      if (dist < minDist && dist > 0) {
        const force = (minDist - dist) / minDist; // 0 to 1 strength
        const angle = Math.atan2(dy, dx);
        const strength = force * 0.5; // tweak this

        // Repel or attract based on mode
        if (attractMode) {
          this.vx -= Math.cos(angle) * strength;
          this.vy -= Math.sin(angle) * strength;
        } else {
          this.vx += Math.cos(angle) * strength;
          this.vy += Math.sin(angle) * strength;
        }
      }
    }

    // Slow down velocity for smooth movement
    this.vx *= 0.95;
    this.vy *= 0.95;
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Initialize particles
for(let i=0; i<PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// Mouse event listeners
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

window.addEventListener('mouseout', () => {
  mouse.active = false;
});

window.addEventListener('keydown', e => {
  if(e.key.toLowerCase() === 'a') {
    attractMode = !attractMode;
  }
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  for(let p of particles) {
    p.update();
    p.draw();
  }

  requestAnimationFrame(animate);
}

animate();
