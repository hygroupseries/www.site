console.info('✨ Welcome to hygroupseries\'s homepage!');

const canvas = document.getElementById('stars');
const ctx = canvas.getContext("2d");

let stars = [];
let meteors = [];
let animationId = null;

function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const totalPixels = window.innerHeight * window.innerWidth;
  const starCount = Math.min(totalPixels / 1000, 2000); // 限制最大星星数量以提升性能
  const meteorCount = Math.max(1, Math.floor(window.innerWidth / 300));
  
  stars = [];
  meteors = [];
  
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
  
  for (let i = 0; i < meteorCount; i++) {
    meteors.push(new Meteor());
  }
}

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speed = (canvas.width / 1000) * (Math.random() * 0.1 + 0.01);
    this.color = Math.random() > 0.9 ? '#ffffff' : '#cccccc';
    this.blinkDuration = Math.random() * 15000 + 2000;
    this.isBrighter = Math.random() > 0.5;
    this.globalAlpha = Math.random();
    this.minAlpha = Math.random() * 0.4 + 0.001;
    this.blinkStartTime = performance.now();
  }

  blink(now) {
    const elapsedTime = now - this.blinkStartTime;
    const progress = elapsedTime / (this.blinkDuration / 2);
    
    if (!this.isBrighter) {
      this.globalAlpha = Math.max(this.minAlpha, 1 - progress);
      if (this.globalAlpha <= this.minAlpha) {
        this.setBlinkState(true, now);
      }
    } else {
      this.globalAlpha = Math.min(1, this.minAlpha + progress);
      if (this.globalAlpha >= 1) {
        this.setBlinkState(false, now);
      }
    }
  }

  setBlinkState(isBrighter, now) {
    this.globalAlpha = isBrighter ? this.minAlpha : 1;
    this.isBrighter = isBrighter;
    this.blinkStartTime = now;
  }

  move() {
    this.x += this.speed;
    if (this.x > canvas.width) {
      this.x = 0;
      this.y = Math.random() * canvas.height;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.globalAlpha;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

class Meteor {
  constructor() {
    this.sleep = false;
    this.sleepTimeout = null;
    this.reborn();
  }

  reborn() {
    this.startX = Math.random() * canvas.width * 1.2;
    this.startY = Math.random() * 150 - 50;
    this.x = this.startX;
    this.y = this.startY;
    this.length = Math.floor(Math.random() * 80) + 80;
    this.speed = Math.random() * 2 + 2;
    this.duration = 4 * this.length;
    this.endX = this.x - this.duration;
    this.endY = this.y + this.duration;
    this.sleep = false;
  }

  move() {
    if (this.sleep) return;
    this.x -= this.speed;
    this.y += this.speed;
    if (this.x <= this.endX || this.y >= this.endY) {
      this.sleep = true;
      const sleepTime = Math.floor(Math.random() * 10000) + 3000;
      this.sleepTimeout = setTimeout(() => {
        this.reborn();
      }, sleepTime);
    }
  }

  draw() {
    if (this.sleep) return;
    ctx.fillStyle = "#ffffff";
    const progress = (this.y - this.startY) / this.duration;
    
    for (let i = 0; i < this.length; i++) {
      let alpha = i / this.length;
      if (progress < 0.2) {
        alpha *= progress / 0.2;
      } else if (progress > 0.7) {
        alpha *= (1 - progress) / 0.3;
      }
      ctx.globalAlpha = alpha;
      ctx.fillRect(this.x - i, this.y + i, 1, 1);
    }
  }
  
  cleanup() {
    if (this.sleepTimeout) {
      clearTimeout(this.sleepTimeout);
    }
  }
}

function draw(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (const star of stars) {
    star.move();
    star.blink(now);
    star.draw();
  }
  
  for (const meteor of meteors) {
    meteor.move();
    meteor.draw();
  }
  
  animationId = requestAnimationFrame(draw);
}

// 防抖的resize处理
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    meteors.forEach(m => m.cleanup());
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    initCanvas();
    animationId = requestAnimationFrame(draw);
  }, 250);
}

window.addEventListener('resize', handleResize);

// 页面可见性处理 - 节省资源
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  } else {
    if (!animationId) {
      animationId = requestAnimationFrame(draw);
    }
  }
});

// 初始化
initCanvas();
animationId = requestAnimationFrame(draw);
