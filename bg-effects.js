/* =====================================================================
   AMIGA 1200 SUPERDUPE-FX BACKGROUND ENGINE
   Effects from C:\_projects\superduperFX (Special / Experimental & Physics)
   1. Three.js Generative Art — Geometric Lattice (Wireframe Parametric)
   2. Manifold Mandala (WebGL Non-Euclidean Kaleidoscopic Shader)
   3. Liquid Chrome (Mercury Fluid Specular Raymarch)
   4. GLSL Sample027 — Distance Field Raymarch & Chromatic Aberration
   5. Gradient Drift — WebGL Chromatic Shaders
   6. ASCII Art Matrix Real-Time Stream
   7. Phosphorescence Bioluminescent Particle Stream
   ===================================================================== */

(function(window) {
  'use strict';

  const EFFECTS = [
    {
      id: 'lattice',
      title: 'Geometric Lattice',
      fullTitle: 'Three.js Generative Art — Geometric Lattice',
      type: '2d',
      desc: 'Parametrische roterende wireframe-kristalstructuren in neon cyan & magenta'
    },
    {
      id: 'mandala',
      title: 'Manifold Mandala',
      fullTitle: 'Manifold Mandala — Non-Euclidean WebGL',
      type: 'webgl',
      desc: 'Oneindige non-Euclidische fractale mandala geïnspireerd door Liam Egan'
    },
    {
      id: 'chrome',
      title: 'Liquid Chrome',
      fullTitle: 'Liquid Chrome (Mercury Fluid Raymarch)',
      type: 'webgl',
      desc: 'Vloeibaar reflecterend kwikzilver / chroom blob met dynamische lichtreflecties'
    },
    {
      id: 'glsl027',
      title: 'GLSL Sample027',
      fullTitle: 'GLSL Sample027 — Distance Field Raymarch',
      type: 'webgl',
      desc: 'SDF raymarching-golf met chromatische aberratie en RGB-split'
    },
    {
      id: 'drift',
      title: 'Gradient Drift',
      fullTitle: 'Gradient Drift — WebGL Chromatic Shaders',
      type: 'webgl',
      desc: 'Chromatische vloeiende kleurgradiënten met organische vloeistofdrift'
    },
    {
      id: 'matrix',
      title: 'ASCII Art Matrix',
      fullTitle: 'ASCII Art Matrix Real-Time Renderer',
      type: '2d',
      desc: 'Typografische retro ASCII cyber rain & fosfor matrixstream'
    },
    {
      id: 'phosphor',
      title: 'Phosphorescence',
      fullTitle: 'Phosphorescence Bioluminescent Particle Stream',
      type: '2d',
      desc: 'Bioluminescente deeltjesstromen via vector-veld curl noise'
    }
  ];

  // Common Vertex Shader for all fullscreen fragment shaders
  const VS_SOURCE = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // 1. Manifold Mandala Fragment Shader
  const FS_MANDALA = `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_time;
    #define PI 3.14159265359

    void main() {
      vec2 p = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
      p /= 1.35;
      float t = u_time * 0.22;
      float r = length(p);
      float a = atan(p.y, p.x) + t * 0.25;
      float tau = 2.0 * PI / 8.0;
      a = abs(mod(a, tau) - tau * 0.5);
      p = vec2(cos(a), sin(a)) * r;

      float c = 0.0;
      for (int i = 0; i < 5; i++) {
        p = abs(p) / dot(p, p) - vec2(0.72 + sin(t * 0.35) * 0.05);
        c += exp(-5.0 * abs(length(p) - 0.5));
      }
      vec3 col = vec3(0.05, 0.35, 0.85) * c * 0.45 + vec3(0.85, 0.15, 0.65) * (c * c * 0.22) + vec3(0.1, 0.7, 0.8) * 0.12;
      gl_FragColor = vec4(col * 0.75, 1.0);
    }
  `;

  // 2. Liquid Chrome Specular Mercury Fluid
  const FS_CHROME = `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_time;

    float noise(vec3 p) {
      return sin(p.x * 1.4 + u_time * 0.8) * cos(p.y * 1.4 + u_time * 0.8) * sin(p.z * 1.4);
    }

    float map(vec3 p) {
      return length(p) - 1.25 + noise(p * 2.2) * 0.25;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
      vec3 ro = vec3(0.0, 0.0, 3.2);
      vec3 rd = normalize(vec3(uv, -1.8));
      float t = 0.0;
      for (int i = 0; i < 35; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.006 || t > 7.0) break;
        t += d * 0.7;
      }
      vec3 col = vec3(0.02, 0.03, 0.07);
      if (t < 7.0) {
        vec3 p = ro + rd * t;
        vec2 e = vec2(0.005, 0.0);
        vec3 n = normalize(vec3(map(p+e.xyy) - map(p-e.xyy), map(p+e.yxy) - map(p-e.yxy), map(p+e.yyx) - map(p-e.yyx)));
        vec3 ref = reflect(rd, n);
        float fresnel = pow(1.0 - max(0.0, dot(-rd, n)), 3.0);
        float spec = pow(max(0.0, dot(ref, normalize(vec3(1.0, 1.6, 2.0)))), 28.0);
        vec3 chrome = vec3(0.65, 0.82, 0.98) * (fresnel * 0.85 + 0.25) + vec3(1.0) * spec + vec3(0.0, 0.65, 0.95) * (n.y * 0.35 + 0.35);
        col = chrome * 0.8;
      }
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // 3. GLSL Sample027 — Distance Field Raymarch & Chromatic Aberration
  const FS_GLSL027 = `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_time;

    void main() {
      vec2 p = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
      float d = length(p) * 0.055;
      float rx = p.x * (1.0 + d);
      float gx = p.x;
      float bx = p.x * (1.0 - d);
      float t = u_time * 1.4;

      float r = 0.045 / abs(p.y + sin((rx + t) * 1.1) * 0.55);
      float g = 0.045 / abs(p.y + sin((gx + t) * 1.1) * 0.55);
      float b = 0.045 / abs(p.y + sin((bx + t) * 1.1) * 0.55);

      vec3 col = vec3(r * 1.1 + b * 0.15, g * 0.75 + r * 0.1, b * 1.35);
      gl_FragColor = vec4(col * 0.8, 1.0);
    }
  `;

  // 4. Gradient Drift — Chromatic Fluid Shaders
  const FS_DRIFT = `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_time;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.35;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_res.x / u_res.y;
      for (int i = 1; i < 4; i++) {
        float fi = float(i);
        p.x += 0.32 / fi * sin(fi * 2.4 * p.y + t + fi * 0.6) + 0.1;
        p.y += 0.32 / fi * cos(fi * 2.4 * p.x + t + fi * 0.4) + 0.1;
      }
      float r = 0.5 + 0.5 * sin(p.x * 2.0 + t + 0.0);
      float g = 0.5 + 0.5 * sin(p.y * 2.0 + t + 2.0);
      float b = 0.5 + 0.5 * sin((p.x + p.y) * 1.5 + t + 4.0);
      vec3 col = mix(vec3(0.03, 0.02, 0.08), vec3(r, g, b), 0.55);
      gl_FragColor = vec4(col * 0.85, 1.0);
    }
  `;

  class SuperFXBackgroundEngine {
    constructor() {
      this.effects = EFFECTS;
      this.currentIndex = 0;
      this.active = true;
      this.autoCycle = true;
      this.cycleTimer = 0;
      this.cycleDuration = 12.0; // 12 seconds per background

      this.glCanvas = null;
      this.gl = null;
      this.glPrograms = {};
      this.quadBuffer = null;

      this.ctxCanvas = null;
      this.ctx = null;

      // ASCII Matrix state
      this.matrixCols = [];

      // Phosphor Particles state
      this.particles = [];

      // Listeners
      this.onChangeCallbacks = [];
    }

    init(container) {
      this.container = container || document.body;

      // 1. WebGL Canvas
      this.glCanvas = document.createElement('canvas');
      this.glCanvas.id = 'bg-webgl-canvas';
      this.glCanvas.style.position = 'fixed';
      this.glCanvas.style.top = '0';
      this.glCanvas.style.left = '0';
      this.glCanvas.style.width = '100%';
      this.glCanvas.style.height = '100%';
      this.glCanvas.style.zIndex = '0';
      this.glCanvas.style.pointerEvents = 'none';
      this.glCanvas.style.transition = 'opacity 0.6s ease';
      this.glCanvas.style.opacity = '1';
      this.container.appendChild(this.glCanvas);

      // 2. 2D Canvas
      this.ctxCanvas = document.createElement('canvas');
      this.ctxCanvas.id = 'bg-2d-canvas';
      this.ctxCanvas.style.position = 'fixed';
      this.ctxCanvas.style.top = '0';
      this.ctxCanvas.style.left = '0';
      this.ctxCanvas.style.width = '100%';
      this.ctxCanvas.style.height = '100%';
      this.ctxCanvas.style.zIndex = '0';
      this.ctxCanvas.style.pointerEvents = 'none';
      this.ctxCanvas.style.transition = 'opacity 0.6s ease';
      this.ctxCanvas.style.opacity = '0';
      this.container.appendChild(this.ctxCanvas);

      this.ctx = this.ctxCanvas.getContext('2d');
      this.initGL();
      this.resize();

      this.initMatrix();
      this.initParticles();

      window.addEventListener('resize', () => this.resize());
      this.applyEffect(0);
    }

    initGL() {
      try {
        this.gl = this.glCanvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false }) ||
                  this.glCanvas.getContext('experimental-webgl');
      } catch (e) {
        console.warn('WebGL background initialization failed:', e);
      }
      if (!this.gl) return;

      const gl = this.gl;

      // Fullscreen quad
      const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]);
      this.quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      // Compile programs
      this.glPrograms['mandala'] = this.createGLProgram(VS_SOURCE, FS_MANDALA);
      this.glPrograms['chrome'] = this.createGLProgram(VS_SOURCE, FS_CHROME);
      this.glPrograms['glsl027'] = this.createGLProgram(VS_SOURCE, FS_GLSL027);
      this.glPrograms['drift'] = this.createGLProgram(VS_SOURCE, FS_DRIFT);
    }

    createGLProgram(vsCode, fsCode) {
      const gl = this.gl;
      if (!gl) return null;

      function compileShader(type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vs = compileShader(gl.VERTEX_SHADER, vsCode);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsCode);
      if (!vs || !fs) return null;

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(prog));
        return null;
      }

      return {
        program: prog,
        posAttr: gl.getAttribLocation(prog, 'position'),
        resUniform: gl.getUniformLocation(prog, 'u_res'),
        timeUniform: gl.getUniformLocation(prog, 'u_time')
      };
    }

    resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      if (this.glCanvas) {
        this.glCanvas.width = Math.floor(w * dpr);
        this.glCanvas.height = Math.floor(h * dpr);
        if (this.gl) {
          this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
        }
      }

      if (this.ctxCanvas) {
        this.ctxCanvas.width = Math.floor(w * dpr);
        this.ctxCanvas.height = Math.floor(h * dpr);
      }

      this.initMatrix();
    }

    initMatrix() {
      const w = this.ctxCanvas ? this.ctxCanvas.width : window.innerWidth;
      const colWidth = 14;
      const cols = Math.floor(w / colWidth);
      this.matrixCols = [];
      for (let i = 0; i < cols; i++) {
        this.matrixCols.push({
          x: i * colWidth,
          y: Math.random() * -600,
          speed: 2 + Math.random() * 5,
          chars: 'GEERTVERHULST0123456789@#*+=:.'
        });
      }
    }

    initParticles() {
      this.particles = [];
      const count = 350;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 1.5 + Math.random() * 2.5,
          life: Math.random() * 100,
          hue: 140 + Math.random() * 60 // Emerald to cyan
        });
      }
    }

    applyEffect(index) {
      if (index < 0) index = this.effects.length - 1;
      if (index >= this.effects.length) index = 0;
      this.currentIndex = index;

      const eff = this.effects[this.currentIndex];
      if (eff.type === 'webgl') {
        if (this.glCanvas) this.glCanvas.style.opacity = '1';
        if (this.ctxCanvas) this.ctxCanvas.style.opacity = '0';
      } else {
        if (this.glCanvas) this.glCanvas.style.opacity = '0';
        if (this.ctxCanvas) this.ctxCanvas.style.opacity = '1';
      }

      this.onChangeCallbacks.forEach(cb => cb(eff, this.currentIndex));
    }

    onEffectChange(cb) {
      this.onChangeCallbacks.push(cb);
    }

    next() {
      this.cycleTimer = 0;
      this.applyEffect(this.currentIndex + 1);
    }

    prev() {
      this.cycleTimer = 0;
      this.applyEffect(this.currentIndex - 1);
    }

    setEffectById(id) {
      this.cycleTimer = 0;
      const idx = this.effects.findIndex(e => e.id === id);
      if (idx !== -1) this.applyEffect(idx);
    }

    render(time) {
      if (!this.active) return;

      // Autonomous Background Auto-Cycling (every cycleDuration seconds)
      if (this.autoCycle) {
        if (this.lastTime === undefined || this.lastTime === null) {
          this.lastTime = time;
        }
        const dt = time - this.lastTime;
        this.lastTime = time;
        if (dt > 0 && dt < 1.0) {
          this.cycleTimer += dt;
          if (this.cycleTimer >= this.cycleDuration) {
            this.cycleTimer = 0;
            this.applyEffect(this.currentIndex + 1);
          }
        } else {
          this.lastTime = time;
        }
      }

      const eff = this.effects[this.currentIndex];

      if (eff.type === 'webgl' && this.gl) {
        this.renderWebGL(eff.id, time);
      } else if (eff.type === '2d' && this.ctx) {
        this.render2D(eff.id, time);
      }
    }

    renderWebGL(id, time) {
      const gl = this.gl;
      const progInfo = this.glPrograms[id];
      if (!gl || !progInfo) return;

      gl.useProgram(progInfo.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.enableVertexAttribArray(progInfo.posAttr);
      gl.vertexAttribPointer(progInfo.posAttr, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(progInfo.resUniform, this.glCanvas.width, this.glCanvas.height);
      gl.uniform1f(progInfo.timeUniform, time);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    render2D(id, time) {
      const ctx = this.ctx;
      const w = this.ctxCanvas.width;
      const h = this.ctxCanvas.height;

      if (id === 'lattice') {
        // Geometric Lattice (Yukiloz7 Three.js wireframe rings with connected hyper-lattice depth)
        ctx.fillStyle = 'rgba(3, 5, 12, 0.42)';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const numRings = 18;
        const maxR = Math.min(w, h) * 0.48;

        ctx.save();
        ctx.translate(cx, cy);

        let prevPoints = [];

        for (let i = 0; i < numRings; i++) {
          const r = (i + 1) * (maxR / numRings);
          const sides = 6;
          const rot = time * (0.12 + i * 0.025) * ((i % 2 === 0) ? 1 : -1);
          const alpha = 0.35 + 0.5 * Math.sin(time * 2.2 + i * 0.35);

          const currentPoints = [];
          ctx.save();
          ctx.rotate(rot);
          ctx.beginPath();
          for (let s = 0; s <= sides; s++) {
            const angle = (s / sides) * Math.PI * 2;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            currentPoints.push({ x: px, y: py });
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = (i % 2 === 0) ? `rgba(0, 255, 204, ${alpha})` : `rgba(236, 72, 153, ${alpha * 0.85})`;
          ctx.lineWidth = 1.6;
          ctx.shadowBlur = 14;
          ctx.shadowColor = (i % 2 === 0) ? '#00ffcc' : '#ec4899';
          ctx.stroke();

          // Connect concentric vertex struts for 3D crystal depth
          if (i % 3 === 0 && prevPoints.length > 0) {
            ctx.beginPath();
            for (let s = 0; s < sides; s += 2) {
              ctx.moveTo(currentPoints[s].x, currentPoints[s].y);
              ctx.lineTo(prevPoints[s].x, prevPoints[s].y);
            }
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.4})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
          ctx.restore();

          prevPoints = currentPoints;
        }
        ctx.restore();

      } else if (id === 'matrix') {
        // ASCII Art Matrix Real-Time Stream (Vibrant Cyber Rain with Glowing Heads)
        ctx.fillStyle = 'rgba(2, 5, 18, 0.2)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = 'bold 13px monospace';
        for (let i = 0; i < this.matrixCols.length; i++) {
          const col = this.matrixCols[i];
          const char = col.chars[Math.floor(Math.random() * col.chars.length)];

          // Glowing leading head character in bright white/cyan
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#00ffff';
          ctx.fillText(char, col.x, col.y);

          // Subtle green trail character just above
          if (col.y > 18) {
            const trailChar = col.chars[(i * 3) % col.chars.length];
            ctx.fillStyle = '#00ff66';
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#00ff66';
            ctx.fillText(trailChar, col.x, col.y - 14);
          }

          col.y += col.speed;
          if (col.y > h + 30) {
            col.y = Math.random() * -120;
            col.speed = 2.5 + Math.random() * 5.5;
          }
        }
        ctx.shadowBlur = 0;

      } else if (id === 'phosphor') {
        // Phosphorescence Bioluminescent Particle Stream (Glowing Stardust Nevel)
        ctx.fillStyle = 'rgba(2, 5, 16, 0.22)';
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];

          // Curl noise vector field flow
          const angle = Math.sin(p.y * 0.005 + time * 0.7) * Math.cos(p.x * 0.005 + time * 0.7) * Math.PI * 2;
          p.vx += Math.cos(angle) * 0.18;
          p.vy += Math.sin(angle) * 0.18;

          p.vx *= 0.94;
          p.vy *= 0.94;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          // Glowing particle with halo
          const pulse = 0.8 + 0.4 * Math.sin(time * 3.0 + i);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, 0.7)`;
          ctx.shadowBlur = 14;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 75%)`;
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
      }
    }
  }

  window.SuperFXBackgroundEngine = SuperFXBackgroundEngine;

})(window);

