console.info('welcome here!');

const canvas = document.getElementById('stars');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const totalPixels = window.innerHeight * window.innerWidth;
const starCount = totalPixels / 1000;
const meteorCount = window.innerWidth / 300;

class Star {
  constructor() {
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(Math.random() * canvas.height);
    this.size = Math.floor(Math.random() * 3) + 1;
    this.speed = (window.innerWidth * window.innerWidth / 1117000) * (Math.random() * 0.1 + 0.01);
    this.color = Math.random() > 0.9 ? '#ffffff' : '#cccccc';
    this.blinkDuration = Math.random() * 15000 + 2000;
    this.isBrighter = true;
    this.globalAlpha = 0;
    this.minAlpha = Math.random() * 0.4 + 0.001; // 最低的亮度
    this.blinkStartTime = Date.now();
  }

  blink() {
    const elapsedTime = Date.now() - this.blinkStartTime;
    const progress = elapsedTime / (this.blinkDuration / 2); // 前半部分逐渐变暗（0 到 1）
    if (!this.isBrighter) {
      this.globalAlpha = 1 - progress; // 根据进度逐渐降低亮度
      if (this.globalAlpha <= this.minAlpha) {  // 最暗了
        this.setBlinkState(true);
      }
    } else { // 变亮
      this.globalAlpha = progress; // 根据进度逐渐降低亮度
      if (this.globalAlpha >= 1) {  // 最亮了
        this.setBlinkState(false);
      }
    }
  }

  setBlinkState(isBrighter) {
    this.globalAlpha = isBrighter ? this.minAlpha : 1;
    this.isBrighter = isBrighter;
    this.blinkStartTime = Date.now();
  }

  move() {
    this.x += this.speed;
    if (this.x > canvas.width) {
      this.x = 0;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.globalAlpha;
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}

const stars = [];
const meteors = [];

function createStars() {
  for (let i = 0; i < starCount; i++) {
    const star = new Star();
    stars.push(star);
  }
}

class Meteor {
  constructor() {
    this.reborn();
  }

  reborn() {
    this.startX = Math.floor(Math.random() * canvas.width);
    this.startY = Math.floor(Math.random() * 100);
    this.x = this.startX;
    this.y = this.startY;
    this.length = Math.floor(Math.random() * 50) + 100;
    this.duration = 3.5 * this.length;
    this.endX = this.x - this.duration;
    this.endY = this.y + this.duration;
  }

  move() {
    if (this.sleep) return;
    this.x -= 3;
    this.y += 3;
    if (this.x <= this.endX || this.y >= this.endY) {
      this.sleep = true;
      const sleepTime = Math.floor(Math.random() * 8000) + 2000;
      setTimeout(() => {
        this.reborn();
        this.sleep = false;
      }, sleepTime);
    }
  }

  // 绘制流星
  draw() {
    if (this.sleep) return;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < this.length; ++i) {
      ctx.globalAlpha = i / this.length;
      const progress = (this.y - this.startY) / this.duration;
      if (progress < 0.2) {
        ctx.globalAlpha = ctx.globalAlpha * progress / 0.2;
      }
      if (progress > 0.7) {
        ctx.globalAlpha = ctx.globalAlpha * (1 - progress) / 0.3;
      }
      ctx.fillRect(this.x - i, this.y + i, 1, 1);
    }
  }
}

function createMeteors() {
  for (let i = 0; i < meteorCount; i++) {
    const meteor = new Meteor();
    meteors.push(meteor);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const star of stars) {
    star.move();
    star.blink();
    star.draw();
  }
  for (const meteor of meteors) {
    meteor.move();
    meteor.draw();
  }
  requestAnimationFrame(draw);
}

createStars();
createMeteors();
draw();
