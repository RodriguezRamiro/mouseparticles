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

function connectParticles(particles) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const alpha = 1 - dist / 100;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function generateTextShape(text, canvasWidth, canvasHeight) {
    const shapePoints = [];

    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const offCtx = offCanvas.getContext("2d");

    offCtx.fillStyle = "#fff";
    offCtx.font = "bold 100px Arial";
    offCtx.textAlign = "center";
    offCtx.fillText(text, canvasWidth / 2, canvasHeight / 2);

    const data = offCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

    for (let y = 0; y < canvasHeight; y += 6) {
      for (let x = 0; x < canvasWidth; x += 6) {
        const i = (y * canvasWidth + x) * 4;
        if (data[i + 3] > 128) {
          shapePoints.push({ x, y });
        }
      }
    }

    return shapePoints;
  }


  draw(ctx) {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const hue = Math.min(360, speed * 100); // hue shift by speed
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size + speed * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }



animate();
