/* ==========================================================================
   Animated Blooming Rose Engine with Full Mobile & Touch Support
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const theme = {
    primary: '#ff1744',
    secondary: '#b71c1c',
    light: '#ff80ab',
    dark: '#880e4f',
    stem: '#2e7d32',
    leaf: '#1b5e20',
    glow: 'rgba(255, 23, 68, 0.45)'
  };

  // --- Animation State ---
  let bloomProgress = 0; // Starts from 0
  let targetProgress = 1;
  let animSpeed = 0.0078; // Dynamic, responsive blooming speed!

  let targetTiltX = 0, targetTiltY = 0;
  let tiltX = 0, tiltY = 0;

  // --- Typing Text Config ---
  const messageText = "I made this code for you ❤️";
  let typedIndex = 0;
  let isTypingStarted = false;
  let typingTimeout = null;

  const waitTextEl = document.getElementById('waitText');
  const romanticTextEl = document.getElementById('romanticText');
  const cursorEl = document.getElementById('cursor');
  const clickHintEl = document.getElementById('clickHint');

  function resetTypingText() {
    clearTimeout(typingTimeout);
    isTypingStarted = false;
    typedIndex = 0;
    romanticTextEl.textContent = '';
    waitTextEl.classList.remove('hidden');
    cursorEl.classList.remove('active');
    clickHintEl.classList.remove('visible');
  }

  function typeNextChar() {
    if (typedIndex < messageText.length) {
      romanticTextEl.textContent += messageText.charAt(typedIndex);
      typedIndex++;
      typingTimeout = setTimeout(typeNextChar, 70); // Smooth typing pace
    } else {
      cursorEl.classList.remove('active');
      clickHintEl.classList.add('visible');
    }
  }

  function startTypingEffect() {
    if (isTypingStarted) return;
    isTypingStarted = true;

    waitTextEl.classList.add('hidden');
    cursorEl.classList.add('active');

    setTimeout(typeNextChar, 200); // Slight pause right when final petal completes
  }

  // --- Canvas Setup ---
  const roseCanvas = document.getElementById('roseCanvas');
  const ctx = roseCanvas.getContext('2d');
  const bgCanvas = document.getElementById('bgCanvas');
  const bgCtx = bgCanvas.getContext('2d');

  function resizeCanvases() {
    const rect = roseCanvas.parentElement.getBoundingClientRect();
    roseCanvas.width = rect.width * window.devicePixelRatio;
    roseCanvas.height = rect.height * window.devicePixelRatio;
    
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvases);
  window.addEventListener('orientationchange', resizeCanvases);
  resizeCanvases();

  // Mouse & Touch Parallax Interaction
  function handlePointerMove(clientX, clientY) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetTiltX = (clientX - cx) / cx * 0.15;
    targetTiltY = (clientY - cy) / cy * 0.15;
  }

  document.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Re-bloom on Click or Touch anywhere
  function triggerRebloom(e) {
    // Avoid double triggering from touch + click
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    bloomProgress = 0;
    targetProgress = 1;
    resetTypingText();
  }

  document.body.addEventListener('click', triggerRebloom);
  document.body.addEventListener('touchstart', triggerRebloom, { passive: false });

  // --- Falling Petals & Glow Particles ---
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * bgCanvas.width;
      this.y = -20;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 1.4 + 0.6;
      this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.8;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.type = Math.random() > 0.35 ? 'petal' : 'star';
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.01) * 0.8 + this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y > bgCanvas.height + 20) {
        this.reset();
      }
    }
    draw() {
      bgCtx.save();
      bgCtx.translate(this.x, this.y);
      bgCtx.rotate(this.rotation);
      bgCtx.globalAlpha = this.opacity;

      if (this.type === 'petal') {
        bgCtx.fillStyle = theme.primary;
        bgCtx.beginPath();
        bgCtx.moveTo(0, 0);
        bgCtx.bezierCurveTo(this.size, -this.size, this.size * 1.5, this.size, 0, this.size * 1.8);
        bgCtx.bezierCurveTo(-this.size * 1.5, this.size, -this.size, -this.size, 0, 0);
        bgCtx.fill();
      } else {
        bgCtx.fillStyle = theme.light;
        bgCtx.shadowColor = theme.primary;
        bgCtx.shadowBlur = 10;
        bgCtx.beginPath();
        bgCtx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        bgCtx.fill();
      }

      bgCtx.restore();
    }
  }

  const particleCount = window.innerWidth < 600 ? 35 : 50;
  const particles = Array.from({ length: particleCount }, () => new Particle());

  function renderBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  // --- Procedural Animated Rose Renderer ---
  function drawRose() {
    const w = roseCanvas.width;
    const h = roseCanvas.height;
    const dpr = window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    // Smooth tilt interpolation
    tiltX += (targetTiltX - tiltX) * 0.05;
    tiltY += (targetTiltY - tiltY) * 0.05;

    ctx.save();
    const originX = w / 2;
    const originY = h * 0.84;

    ctx.translate(originX, originY);
    ctx.rotate(tiltX * 0.4);

    // Step 1: Grow Stem (0% to 35% progress)
    const stemHeight = h * 0.44;
    const stemProgress = Math.min(bloomProgress / 0.35, 1);

    if (stemProgress > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);

      const ctrl1X = Math.sin(tiltY) * 20 - 15;
      const ctrl1Y = -stemHeight * 0.4 * stemProgress;
      const ctrl2X = Math.cos(tiltY) * 20 + 15;
      const ctrl2Y = -stemHeight * 0.8 * stemProgress;
      const endX = 0;
      const endY = -stemHeight * stemProgress;

      ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
      ctx.lineWidth = 10 * dpr;
      ctx.lineCap = 'round';

      const stemGrad = ctx.createLinearGradient(0, 0, 0, -stemHeight);
      stemGrad.addColorStop(0, '#1b5e20');
      stemGrad.addColorStop(0.5, theme.stem);
      stemGrad.addColorStop(1, '#4caf50');

      ctx.strokeStyle = stemGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Thorns
      if (stemProgress > 0.5) {
        drawThorn(ctx, -6 * dpr, -stemHeight * 0.3, -1);
        drawThorn(ctx, 6 * dpr, -stemHeight * 0.55, 1);
      }

      // Step 2: Leaves sprout (20% to 50% progress)
      if (bloomProgress > 0.2) {
        const leafProgress = Math.min((bloomProgress - 0.2) / 0.3, 1);
        drawLeaf(ctx, -10 * dpr, -stemHeight * 0.35, -1, leafProgress);
        drawLeaf(ctx, 10 * dpr, -stemHeight * 0.6, 1, leafProgress);
      }

      ctx.restore();
    }

    // Step 3: Petals bloom layer by layer (25% to 100% progress)
    if (bloomProgress > 0.25) {
      const roseProgress = (bloomProgress - 0.25) / 0.75;
      const headY = -stemHeight;

      ctx.save();
      ctx.translate(0, headY);
      ctx.rotate(tiltY * 0.25);

      // Green Calyx Base
      ctx.save();
      ctx.fillStyle = theme.leaf;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(angle) * 8, Math.sin(angle) * 4 + 5, 7 * dpr, 18 * dpr, angle + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Petal Layers (Outer to Inner)
      const numPetalLayers = 7;
      const basePetalScale = Math.min(w, h) * 0.26;
      const maxPetalRadius = basePetalScale;

      for (let layer = numPetalLayers; layer >= 1; layer--) {
        const layerProgress = Math.min(Math.max((roseProgress - (numPetalLayers - layer) * 0.1) / 0.45, 0), 1);
        if (layerProgress <= 0) continue;

        const petalsInLayer = 5 + layer * 2;
        const layerRadius = (maxPetalRadius * (layer / numPetalLayers)) * (0.2 + 0.8 * layerProgress);
        const openAngleOffset = (1 - layerProgress) * (Math.PI / 2.8);

        for (let p = 0; p < petalsInLayer; p++) {
          const angle = (p / petalsInLayer) * Math.PI * 2 + (layer * 0.45);
          ctx.save();
          ctx.rotate(angle + tiltX * 0.15);

          // Rich Petal Shading
          const petalGrad = ctx.createRadialGradient(0, 0, 5, 0, -layerRadius * 0.8, layerRadius);
          if (layer === 1) {
            petalGrad.addColorStop(0, theme.dark);
            petalGrad.addColorStop(0.7, theme.primary);
            petalGrad.addColorStop(1, theme.light);
          } else {
            petalGrad.addColorStop(0, theme.secondary);
            petalGrad.addColorStop(0.6, theme.primary);
            petalGrad.addColorStop(0.92, theme.light);
            petalGrad.addColorStop(1, 'rgba(255,255,255,0.85)');
          }

          ctx.fillStyle = petalGrad;
          ctx.shadowColor = theme.dark;
          ctx.shadowBlur = 15 * dpr;

          ctx.beginPath();
          ctx.moveTo(0, 0);

          const petalWidth = layerRadius * (0.65 + 0.25 * Math.sin(p));
          const petalLength = layerRadius;

          ctx.bezierCurveTo(
            -petalWidth, -petalLength * 0.4,
            -petalWidth * 0.8, -petalLength * (1 - 0.2 * openAngleOffset),
            0, -petalLength
          );
          ctx.bezierCurveTo(
            petalWidth * 0.8, -petalLength * (1 - 0.2 * openAngleOffset),
            petalWidth, -petalLength * 0.4,
            0, 0
          );

          ctx.fill();

          // Petal Edge Highlight Line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Glowing Center Core
      ctx.save();
      ctx.fillStyle = theme.light;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 22 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, 14 * dpr * Math.min(roseProgress * 1.5, 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    ctx.restore();
  }

  function drawThorn(ctx, x, y, direction) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(direction * 12, -4, direction * 15, 8);
    ctx.quadraticCurveTo(direction * 5, 6, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function drawLeaf(ctx, x, y, direction, progress) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction * progress, progress);

    const leafGrad = ctx.createLinearGradient(0, 0, 40, -20);
    leafGrad.addColorStop(0, '#1b5e20');
    leafGrad.addColorStop(0.5, theme.leaf);
    leafGrad.addColorStop(1, '#81c784');

    ctx.fillStyle = leafGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(15, -25, 45, -20, 60, -5);
    ctx.bezierCurveTo(45, 15, 15, 10, 0, 0);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(30, -5, 58, -5);
    ctx.stroke();

    ctx.restore();
  }

  // --- Animation Main Loop ---
  function loop() {
    if (bloomProgress < targetProgress) {
      bloomProgress = Math.min(bloomProgress + animSpeed, targetProgress);
    }

    if (bloomProgress >= 1.0) {
      startTypingEffect();
    }

    renderBackground();
    drawRose();

    requestAnimationFrame(loop);
  }

  loop();

});
