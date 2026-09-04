if (window.lucide) {
  lucide.createIcons({
    attrs: {
      "stroke-width": 1.8,
    },
  });
} else {
  document.documentElement.classList.add("no-icons");
}

const themeToggle = document.querySelector(".theme-toggle");
document.documentElement.dataset.theme = "light";

const updateThemeIcon = () => {
  if (!themeToggle) return;

  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeToggle.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeToggle.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}">${isDark ? "light" : "dark"}</i>`;

  if (window.lucide) {
    lucide.createIcons({
      attrs: {
        "stroke-width": 1.8,
      },
    });
  }
};

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  updateThemeIcon();
});

updateThemeIcon();

const goose = document.querySelector(".goose");
const hero = document.querySelector(".hero");
const shell = document.querySelector(".shell");
const techStrip = document.querySelector(".tech-strip");

if (goose && hero && shell && techStrip) {
  const state = {
    x: 0,
    y: 0,
    vx: -34,
    vy: 0,
    dragging: false,
    pointerId: null,
    grabX: 0,
    grabY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: performance.now(),
    lastFrame: performance.now(),
    facing: -1,
    honkTimer: null,
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const gooseSize = () => {
    const gooseBox = goose.getBoundingClientRect();
    return {
      width: gooseBox.width || 78,
      height: gooseBox.height || 64,
    };
  };

  const horizontalBounds = () => {
    const shellBox = shell.getBoundingClientRect();
    const { width } = gooseSize();

    return {
      minX: Math.max(10, shellBox.left + window.scrollX),
      maxX: Math.min(
        window.scrollX + window.innerWidth - width - 10,
        shellBox.right + window.scrollX - width,
      ),
      minY: 8,
    };
  };

  const topBarY = () => {
    const { height } = gooseSize();
    return Math.round(techStrip.getBoundingClientRect().top + window.scrollY - height);
  };

  const setFacing = () => {
    if (Math.abs(state.vx) > 8) {
      state.facing = state.vx >= 0 ? 1 : -1;
    }
  };

  const moveGoose = () => {
    setFacing();
    goose.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scaleX(${state.facing})`;
  };

  const placeGoose = () => {
    const limit = horizontalBounds();
    const floorY = topBarY();
    state.x = clamp(limit.maxX - 6, limit.minX, limit.maxX);
    state.y = floorY;
    moveGoose();
  };

  const updateVelocityFromPointer = (event) => {
    const now = performance.now();
    const dt = Math.max(16, now - state.lastPointerTime) / 1000;
    state.vx = (event.clientX - state.lastPointerX) / dt;
    state.vy = (event.clientY - state.lastPointerY) / dt;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerTime = now;
  };

  goose.addEventListener("pointerdown", (event) => {
    const rect = goose.getBoundingClientRect();
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.grabX = event.clientX - rect.left;
    state.grabY = event.clientY - rect.top;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerTime = performance.now();
    state.vx = 0;
    state.vy = 0;
    goose.classList.add("is-dragging");
    goose.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  const honk = () => {
    goose.classList.add("is-honking");
    window.clearTimeout(state.honkTimer);
    state.honkTimer = window.setTimeout(() => {
      goose.classList.remove("is-honking");
    }, 850);
  };

  goose.addEventListener("click", honk);
  goose.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      honk();
    }
  });

  const expressions = ["is-alert", "", "is-sleepy"];
  let expressionIndex = 0;

  window.setInterval(() => {
    goose.classList.remove("is-alert", "is-sleepy");
    expressionIndex = (expressionIndex + 1) % expressions.length;
    if (expressions[expressionIndex]) {
      goose.classList.add(expressions[expressionIndex]);
    }
  }, 3200);

  const releaseGoose = (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    state.dragging = false;
    state.pointerId = null;
    goose.classList.remove("is-dragging");
    try {
      goose.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be gone if the browser cancelled the drag.
    }
  };

  goose.addEventListener("pointermove", (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    const limit = horizontalBounds();
    const floorY = topBarY();
    const nextX = event.clientX + window.scrollX - state.grabX;
    const nextY = event.clientY + window.scrollY - state.grabY;
    updateVelocityFromPointer(event);
    state.x = clamp(nextX, limit.minX, limit.maxX);
    state.y = clamp(nextY, limit.minY, floorY);
    moveGoose();

    if (nextX !== state.x || nextY !== state.y) releaseGoose(event);
  });

  goose.addEventListener("pointerup", releaseGoose);
  goose.addEventListener("pointercancel", releaseGoose);
  goose.addEventListener("lostpointercapture", releaseGoose);

  const tick = (now) => {
    const dt = Math.min(0.032, (now - state.lastFrame) / 1000);
    state.lastFrame = now;

    if (!state.dragging) {
      const limit = horizontalBounds();
      const floorY = topBarY();
      const onFloor = Math.abs(state.y - floorY) < 1 && Math.abs(state.vy) < 4;

      goose.classList.toggle("is-walking", onFloor && Math.abs(state.vx) > 12);

      if (onFloor && Math.abs(state.vx) < 54) {
        state.vx += state.facing * 118 * dt;
      }

      state.vy += 1220 * dt;
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      state.vx *= onFloor ? 0.997 : 0.992;

      if (state.x <= limit.minX || state.x >= limit.maxX) {
        state.x = clamp(state.x, limit.minX, limit.maxX);
        state.vx *= -0.64;
        state.facing *= -1;
      }

      if (state.y <= limit.minY) {
        state.y = limit.minY;
        state.vy *= -0.25;
      }

      if (state.y >= floorY) {
        state.y = floorY;
        state.vy *= Math.abs(state.vy) > 120 ? -0.2 : 0;
        state.vx *= 0.97;
      }

      moveGoose();
    }

    requestAnimationFrame(tick);
  };

  window.addEventListener("resize", () => {
    const limit = horizontalBounds();
    state.x = clamp(state.x, limit.minX, limit.maxX);
    state.y = Math.min(state.y, topBarY());
    moveGoose();
  });

  placeGoose();
  requestAnimationFrame(tick);
}

const doodleCanvas = document.querySelector("[data-doodle-canvas]");
const clearDoodleButton = document.querySelector("[data-clear-doodle]");
const gooseifyButton = document.querySelector("[data-gooseify]");
const colorButtons = document.querySelectorAll("[data-color]");

if (doodleCanvas) {
  const ctx = doodleCanvas.getContext("2d");
  const doodleState = {
    strokes: [],
    drawing: false,
    currentStroke: null,
    color: "#17231f",
    lineWidth: 6,
    animationFrame: null,
    morphing: false,
  };

  const canvasSize = () => ({
    width: doodleCanvas.clientWidth,
    height: doodleCanvas.clientHeight,
  });

  const scaleCanvas = () => {
    const { width, height } = canvasSize();
    const ratio = window.devicePixelRatio || 1;
    doodleCanvas.width = Math.round(width * ratio);
    doodleCanvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const canvasPoint = (event) => {
    const rect = doodleCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const drawPath = (points, color = doodleState.color, width = doodleState.lineWidth) => {
    if (points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i += 1) {
      const previous = points[i - 1];
      const current = points[i];
      const midX = (previous.x + current.x) / 2;
      const midY = (previous.y + current.y) / 2;
      ctx.quadraticCurveTo(previous.x, previous.y, midX, midY);
    }

    const last = points.at(-1);
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  };

  const redrawDoodle = () => {
    const { width, height } = canvasSize();
    ctx.clearRect(0, 0, width, height);

    doodleState.strokes.forEach((stroke) => {
      drawPath(stroke.points, stroke.color, stroke.width);
    });
  };

  const resamplePath = (points, count) => {
    if (points.length === 0) return [];
    if (points.length === 1) {
      return Array.from({ length: count }, () => ({ ...points[0] }));
    }

    const segments = [];
    let total = 0;

    for (let i = 1; i < points.length; i += 1) {
      const length = Math.max(0.001, distance(points[i - 1], points[i]));
      total += length;
      segments.push({ from: points[i - 1], to: points[i], start: total - length, length });
    }

    return Array.from({ length: count }, (_, index) => {
      const target = count === 1 ? 0 : (index / (count - 1)) * total;
      const segment = segments.find((item) => target <= item.start + item.length) || segments.at(-1);
      const localT = (target - segment.start) / segment.length;

      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * localT,
        y: segment.from.y + (segment.to.y - segment.from.y) * localT,
      };
    });
  };

  const makeCurve = (count, pointAt) => (
    Array.from({ length: count }, (_, index) => pointAt(count === 1 ? 0 : index / (count - 1)))
  );

  const ellipsePath = (cx, cy, rx, ry, start, end, count) => (
    makeCurve(count, (t) => {
      const angle = start + (end - start) * t;
      return {
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      };
    })
  );

  const gooseTemplatePaths = (width, height) => {
    const sx = width / 640;
    const sy = height / 330;
    const p = (x, y) => ({ x: x * sx, y: y * sy });
    const ellipse = (cx, cy, rx, ry, start, end, count) => (
      ellipsePath(cx * sx, cy * sy, rx * sx, ry * sy, start, end, count)
    );

    return [
      ellipse(308, 198, 145, 72, Math.PI * 0.04, Math.PI * 1.97, 170),
      ellipse(310, 197, 83, 44, Math.PI * 0.12, Math.PI * 1.86, 88),
      makeCurve(64, (t) => {
        const angle = Math.PI * (1.07 + t * 0.52);
        return p(184 + Math.cos(angle) * 73, 190 + Math.sin(angle) * 41);
      }),
      makeCurve(72, (t) => {
        const y = 177 - t * 91;
        const x = 438 - Math.sin(t * Math.PI) * 29 + t * 8;
        return p(x, y);
      }),
      ellipse(476, 82, 40, 29, Math.PI * 0.2, Math.PI * 2.05, 76),
      makeCurve(26, (t) => p(512 + t * 43, 84 + Math.sin(t * Math.PI) * 4)),
      makeCurve(34, (t) => p(518 + t * 34, 94 + Math.sin(t * Math.PI) * 9)),
      ellipse(489, 76, 4, 4, 0, Math.PI * 2, 20),
      makeCurve(32, (t) => p(297 + t * 58, 274 + Math.sin(t * Math.PI) * 12)),
      makeCurve(34, (t) => p(347 + t * 42, 274 + Math.sin(t * Math.PI) * 12)),
      makeCurve(20, (t) => p(284 + t * 6, 267 + t * 36)),
      makeCurve(20, (t) => p(372 - t * 4, 266 + t * 36)),
      makeCurve(24, (t) => p(279 + t * 36, 304 + Math.sin(t * Math.PI) * 3)),
      makeCurve(24, (t) => p(355 + t * 37, 302 + Math.sin(t * Math.PI) * 3)),
    ];
  };

  const buildMorphPoints = () => {
    const { width, height } = canvasSize();
    const sourceRaw = doodleState.strokes.flatMap((stroke) => stroke.points);
    const targetPaths = gooseTemplatePaths(width, height);
    const targetRaw = targetPaths.flat();
    const desiredPointCount = Math.min(760, Math.max(220, sourceRaw.length * 3, targetRaw.length));
    const groupCounts = targetPaths.map((path) => (
      Math.max(2, Math.round((path.length / targetRaw.length) * desiredPointCount))
    ));
    const countDrift = desiredPointCount - groupCounts.reduce((sum, count) => sum + count, 0);
    groupCounts[0] += countDrift;

    const target = [];
    const groups = [];
    let cursor = 0;

    targetPaths.forEach((path, index) => {
      const start = cursor;
      const sampledPath = resamplePath(path, groupCounts[index]);
      target.push(...sampledPath);
      cursor += sampledPath.length;
      groups.push({ start, end: cursor });
    });

    const source = resamplePath(sourceRaw, target.length);
    return { source, target, groups };
  };

  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const drawMorphFrame = ({ source, target, groups }, progress) => {
    const eased = ease(progress);
    const points = source.map((point, index) => ({
      x: point.x + (target[index].x - point.x) * eased,
      y: point.y + (target[index].y - point.y) * eased,
    }));
    const color = `rgb(${Math.round(23 - eased * 5)} ${Math.round(35 + eased * 55)} ${Math.round(31 + eased * 36)})`;

    const { width, height } = canvasSize();
    ctx.clearRect(0, 0, width, height);
    groups.forEach((group) => {
      drawPath(points.slice(group.start, group.end), color, 5);
    });
  };

  const gooseify = () => {
    if (doodleState.morphing) return;
    if (doodleState.strokes.length === 0) {
      return;
    }

    const morphPoints = buildMorphPoints();
    const startedAt = performance.now();
    doodleState.morphing = true;

    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / 1150);
      drawMorphFrame(morphPoints, progress);

      if (progress < 1) {
        doodleState.animationFrame = requestAnimationFrame(animate);
        return;
      }

      doodleState.morphing = false;
      doodleState.strokes = [];
    };

    doodleState.animationFrame = requestAnimationFrame(animate);
  };

  const beginDrawing = (event) => {
    if (doodleState.morphing) return;
    const point = canvasPoint(event);
    doodleState.drawing = true;
    doodleState.currentStroke = {
      color: doodleState.color,
      width: doodleState.lineWidth,
      points: [point],
    };
    doodleState.strokes.push(doodleState.currentStroke);
    doodleCanvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const draw = (event) => {
    if (!doodleState.drawing || !doodleState.currentStroke) return;
    const point = canvasPoint(event);
    const points = doodleState.currentStroke.points;
    if (distance(points.at(-1), point) < 2) return;

    points.push(point);
    redrawDoodle();
  };

  const endDrawing = (event) => {
    if (!doodleState.drawing) return;
    doodleState.drawing = false;
    doodleState.currentStroke = null;
    try {
      doodleCanvas.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture can be cleared by the browser if the gesture is cancelled.
    }
  };

  const clearDoodle = () => {
    window.cancelAnimationFrame(doodleState.animationFrame);
    doodleState.strokes = [];
    doodleState.currentStroke = null;
    doodleState.drawing = false;
    doodleState.morphing = false;
    redrawDoodle();
  };

  colorButtons.forEach((button) => {
    button.style.setProperty("--swatch", button.dataset.color);
    button.addEventListener("click", () => {
      doodleState.color = button.dataset.color;
      colorButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    });
  });

  doodleCanvas.addEventListener("pointerdown", beginDrawing);
  doodleCanvas.addEventListener("pointermove", draw);
  doodleCanvas.addEventListener("pointerup", endDrawing);
  doodleCanvas.addEventListener("pointercancel", endDrawing);
  clearDoodleButton?.addEventListener("click", clearDoodle);
  gooseifyButton?.addEventListener("click", gooseify);
  window.addEventListener("resize", () => {
    scaleCanvas();
    redrawDoodle();
  });

  scaleCanvas();
  redrawDoodle();
}
