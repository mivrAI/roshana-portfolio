const cards = [...document.querySelectorAll(".project-card")];
const dots = [...document.querySelectorAll(".playbook__dot")];
const panelShell = document.querySelector(".panel-shell");
const panelContents = [...document.querySelectorAll(".info-panel__content")];
const panelButtons = [...document.querySelectorAll("[data-panel-target]")];
const closePanelButtons = [...document.querySelectorAll("[data-close-panel]")];
const revealElements = [...document.querySelectorAll(".reveal")];
const scrollLinks = [...document.querySelectorAll('a[href^="#"]')];
const heroScene = document.querySelector(".scene--hero");
const playbookScene = document.querySelector(".scene--playbook");
const lens = document.querySelector(".hero__lens");
const glassStage = document.querySelector(".hero__glass-stage");
const portfolioScenes = [...document.querySelectorAll(".portfolio-scene")];
const sectionLenses = [...document.querySelectorAll(".section-lens")];
const floatElements = [...document.querySelectorAll("[data-float-speed]")];
const focusElements = [
  ...document.querySelectorAll(".case-study, .mini-project, .experience-list div, .testimonial-grid article"),
];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rootStyle = document.documentElement.style;

let heroGlassLens;
let activeIndex = 0;
let autoplayId;
let scrollTicking = false;
let lensTarget = { x: 85, y: 79 };
let lensCurrent = { x: 85, y: 79 };

focusElements.forEach((element, index) => {
  element.style.setProperty("--reveal-order", String(index % 6));
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renderCarousel(index) {
  if (!cards.length) {
    return;
  }

  activeIndex = index;

  cards.forEach((card, cardIndex) => {
    const offset = (cardIndex - activeIndex + cards.length) % cards.length;

    card.classList.remove("is-active", "is-next", "is-back");

    if (offset === 0) {
      card.classList.add("is-active");
      card.setAttribute("aria-hidden", "false");
    } else if (offset === 1) {
      card.classList.add("is-next");
      card.setAttribute("aria-hidden", "true");
    } else {
      card.classList.add("is-back");
      card.setAttribute("aria-hidden", "true");
    }
  });

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-pressed", String(isActive));
  });
}

function startAutoplay() {
  if (reduceMotion || !cards.length) {
    return;
  }

  clearInterval(autoplayId);
  autoplayId = window.setInterval(() => {
    renderCarousel((activeIndex + 1) % cards.length);
  }, 3600);
}

function openPanel(targetName) {
  panelShell.hidden = false;
  document.body.classList.add("panel-open");

  panelContents.forEach((content) => {
    const matches = content.dataset.panel === targetName;
    content.classList.toggle("is-visible", matches);
  });
}

function closePanel() {
  panelShell.hidden = true;
  document.body.classList.remove("panel-open");
}

function initHeroGlassLens() {
  if (!heroScene || !glassStage || reduceMotion || !window.THREE) {
    return null;
  }

  const glassScene = new THREE.Scene();
  const glassCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const textCanvas = document.createElement("canvas");
  const ctx = textCanvas.getContext("2d");
  const textTexture = new THREE.CanvasTexture(textCanvas);
  let stageWidth = 1;
  let stageHeight = 1;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  glassStage.appendChild(renderer.domElement);
  heroScene.classList.add("has-glass-lens");

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTexture: { value: textTexture },
      uMouse: { value: new THREE.Vector2(0.85, 0.21) },
      uResolution: { value: new THREE.Vector2(stageWidth, stageHeight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
        vec2 ratio = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = vUv;
        float dist = distance(uv * ratio, uMouse * ratio);
        float radius = 0.15;
        float strength = 0.045;
        float mask = smoothstep(radius, radius * 0.5, dist);
        vec2 distortion = (uv - uMouse) * mask * strength;

        vec4 redSample = texture2D(uTexture, uv - distortion * 1.5);
        vec4 greenSample = texture2D(uTexture, uv - distortion);
        vec4 blueSample = texture2D(uTexture, uv - distortion * 0.5);
        float alpha = max(max(redSample.a, greenSample.a), blueSample.a);

        gl_FragColor = vec4(redSample.r, greenSample.g, blueSample.b, alpha);
      }
    `,
  });

  glassScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function drawText() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    textCanvas.width = Math.max(1, Math.round(stageWidth * dpr));
    textCanvas.height = Math.max(1, Math.round(stageHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, stageWidth, stageHeight);
    ctx.textBaseline = "alphabetic";

    const pad = clamp(stageWidth * 0.055, 24, 80);
    const headlineSize = clamp(stageWidth * 0.145, 70, 180);
    const scriptSize = clamp(stageWidth * 0.092, 56, 124);
    const top = clamp(stageHeight * 0.38, 180, 330);

    ctx.fillStyle = "#e0e6ed";
    ctx.textAlign = "left";
    ctx.font = `600 ${headlineSize}px Manrope, sans-serif`;
    ctx.fillText("Cinematic", pad, top);

    ctx.fillStyle = "#f5b027";
    ctx.textAlign = "right";
    ctx.font = `italic 600 ${scriptSize}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText("visual", stageWidth - pad, top + headlineSize * 0.58);

    ctx.fillStyle = "#e0e6ed";
    ctx.textAlign = "left";
    ctx.font = `600 ${headlineSize}px Manrope, sans-serif`;
    ctx.fillText("editor", stageWidth < 680 ? pad : stageWidth * 0.34, top + headlineSize * 1.08);

    textTexture.needsUpdate = true;
  }

  function resize() {
    const rect = heroScene.getBoundingClientRect();
    stageWidth = Math.max(1, Math.round(rect.width));
    stageHeight = Math.max(1, Math.round(rect.height));
    renderer.setSize(stageWidth, stageHeight, false);
    material.uniforms.uResolution.value.set(stageWidth, stageHeight);
    drawText();
  }

  function move(clientX, clientY) {
    const rect = heroScene.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);

    if (window.gsap) {
      gsap.to(material.uniforms.uMouse.value, {
        x,
        y,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      material.uniforms.uMouse.value.set(x, y);
    }
  }

  function reset() {
    const rect = heroScene.getBoundingClientRect();
    move(rect.left + rect.width * 0.85, rect.top + rect.height * 0.79);
  }

  resize();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      drawText();
    });
  }

  return {
    move,
    reset,
    resize,
    render() {
      renderer.render(glassScene, glassCamera);
    },
  };
}
function animateLens() {
  lensCurrent.x += (lensTarget.x - lensCurrent.x) * 0.22;
  lensCurrent.y += (lensTarget.y - lensCurrent.y) * 0.22;

  heroScene.style.setProperty("--lens-x", lensCurrent.x.toFixed(2));
  heroScene.style.setProperty("--lens-y", lensCurrent.y.toFixed(2));

  if (heroGlassLens) {
    heroGlassLens.render();
  }

  window.requestAnimationFrame(animateLens);
}

function updateScrollEffects() {
  scrollTicking = false;

  if (reduceMotion) {
    return;
  }

  if (heroScene) {
    const heroProgress = clamp(window.scrollY / window.innerHeight, 0, 1);
    rootStyle.setProperty("--hero-shift", (heroProgress * 26).toFixed(2));
    rootStyle.setProperty("--hero-meta-shift", (heroProgress * 44).toFixed(2));
    rootStyle.setProperty("--hero-fade", (heroProgress * 0.42).toFixed(3));
  }

  if (playbookScene) {
    const rect = playbookScene.getBoundingClientRect();
    const playbookProgress = clamp(
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height * 0.15),
      0,
      1
    );

    rootStyle.setProperty("--playbook-copy-shift", (playbookProgress * 24).toFixed(2));
    rootStyle.setProperty("--playbook-stage-shift", (playbookProgress * 14).toFixed(2));
    rootStyle.setProperty("--playbook-controls-shift", (playbookProgress * -4).toFixed(2));
  }

  portfolioScenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const progress = clamp(
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
      0,
      1
    );

    scene.style.setProperty("--scene-progress", progress.toFixed(3));
    scene.classList.toggle("is-in-view", progress > 0.06 && progress < 0.96);
  });

  floatElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const progress = clamp(
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
      0,
      1
    );
    const speed = Number(element.dataset.floatSpeed || 0);
    element.style.setProperty("--float-y", `${((progress - 0.5) * speed).toFixed(2)}px`);
  });

  focusElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const center = (rect.top + rect.height * 0.5) / window.innerHeight;
    const focus = 1 - clamp(Math.abs(center - 0.55) * 1.55, 0, 1);
    element.style.setProperty("--focus", focus.toFixed(3));
  });
}

function requestScrollUpdate() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(updateScrollEffects);
}

function setupRevealObserver() {
  if (!revealElements.length) {
    return;
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

if (cards.length) {
  renderCarousel(activeIndex);
  startAutoplay();
}
setupRevealObserver();
heroGlassLens = initHeroGlassLens();
updateScrollEffects();

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    renderCarousel(Number(dot.dataset.index));
    startAutoplay();
  });
});

cards.forEach((card) => {
  card.addEventListener("mouseenter", () => clearInterval(autoplayId));
  card.addEventListener("mouseleave", startAutoplay);
});

panelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openPanel(button.dataset.panelTarget);
  });
});

closePanelButtons.forEach((button) => {
  button.addEventListener("click", closePanel);
});

scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panelShell.hidden) {
    closePanel();
  }
});

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  requestScrollUpdate();
  if (heroGlassLens) {
    heroGlassLens.resize();
  }
});

if (heroScene && lens && !reduceMotion) {
  animateLens();

  heroScene.addEventListener("pointermove", (event) => {
    const rect = heroScene.getBoundingClientRect();
    lensTarget.x = ((event.clientX - rect.left) / rect.width) * 100;
    lensTarget.y = ((event.clientY - rect.top) / rect.height) * 100;
    if (heroGlassLens) {
      heroGlassLens.move(event.clientX, event.clientY);
    }
  });

  heroScene.addEventListener("pointerleave", () => {
    lensTarget = { x: 85, y: 79 };
    if (heroGlassLens) {
      heroGlassLens.reset();
    }
  });
} else if (lens) {
  lens.style.opacity = "0.72";
}

if (!reduceMotion) {
  sectionLenses.forEach((lensEl) => {
    const scene = lensEl.closest(".portfolio-scene");
    if (!scene) {
      return;
    }

    scene.addEventListener("pointermove", (event) => {
      const rect = scene.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      lensEl.style.setProperty("--lens-x", x.toFixed(2));
      lensEl.style.setProperty("--lens-y", y.toFixed(2));
    });

    scene.addEventListener("pointerleave", () => {
      lensEl.style.setProperty("--lens-x", "50");
      lensEl.style.setProperty("--lens-y", "50");
    });
  });
}
