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

if (goose && hero && shell) {
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
    return Math.round(hero.getBoundingClientRect().bottom + window.scrollY - height - 1);
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

  goose.addEventListener("pointermove", (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    const limit = horizontalBounds();
    updateVelocityFromPointer(event);
    state.x = clamp(event.clientX + window.scrollX - state.grabX, limit.minX, limit.maxX);
    state.y = clamp(
      event.clientY + window.scrollY - state.grabY,
      limit.minY,
      topBarY(),
    );
    moveGoose();
  });

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

  goose.addEventListener("pointerup", releaseGoose);
  goose.addEventListener("pointercancel", releaseGoose);

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
