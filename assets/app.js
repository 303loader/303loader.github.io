/* 303 Loader — background + download link */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var config = window.LOADER_CONFIG || {};

  var canvas = document.getElementById("bg");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var particles = [];
  var width = 0, height = 0, dpr = 1, raf = 0;

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.max(24, Math.min(70, Math.round((width * height) / 26000)));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.6 + 0.5,
        a: Math.random() * 0.4 + 0.1,
        pink: Math.random() > 0.35
      });
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j];
        var dx = p.x - q.x, dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = "rgba(255,47,146," + (0.05 * (1 - dist / 120)).toFixed(3) + ")";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < particles.length; k++) {
      var s = particles[k];
      ctx.beginPath();
      ctx.fillStyle = s.pink
        ? "rgba(255,47,146," + s.a + ")"
        : "rgba(210,200,225," + (s.a * 0.55) + ")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function tick() {
    if (!ctx) return;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }
    draw();
    raf = window.requestAnimationFrame(tick);
  }

  function start() {
    if (!ctx) return;
    resize();
    if (reduced) { draw(); return; }
    window.cancelAnimationFrame(raf);
    tick();
  }

  window.addEventListener("resize", function () {
    window.clearTimeout(window.__303resize);
    window.__303resize = window.setTimeout(start, 160);
  });

  /* mouse spotlight */
  var spotlight = document.getElementById("spotlight");
  if (spotlight && !reduced && window.matchMedia("(pointer: fine)").matches) {
    var sx = window.innerWidth / 2, sy = window.innerHeight / 2;
    var tx = sx, ty = sy;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });
    (function follow() {
      sx += (tx - sx) * 0.09;
      sy += (ty - sy) * 0.09;
      spotlight.style.transform = "translate(" + sx + "px," + sy + "px) translate(-50%,-50%)";
      window.requestAnimationFrame(follow);
    })();
  } else if (spotlight) {
    spotlight.style.display = "none";
  }

  /* download */
  var download = document.getElementById("downloadBtn");
  if (download && config.downloadUrl) download.setAttribute("href", config.downloadUrl);

  /* loader information */
  var metaName = document.getElementById("loaderName");
  var metaUpdated = document.getElementById("loaderUpdated");
  var metaVersion = document.getElementById("loaderVersion");
  var metaStatus = document.getElementById("loaderStatus");
  if (metaName && config.loaderName) metaName.textContent = config.loaderName;
  if (metaUpdated && config.lastUpdate) metaUpdated.textContent = config.lastUpdate;
  if (metaVersion && config.version) metaVersion.textContent = config.version;
  if (metaStatus && config.status) metaStatus.textContent = config.status;

  start();
})();
