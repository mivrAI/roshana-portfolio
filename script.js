/* ===== Roshana — Hero + Oliver Parallax + Text Roll ===== */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ----- Text Roll: split text into chars with clone row ----- */
function initTextRoll() {
  const elements = document.querySelectorAll(".text-roll");
  elements.forEach((el) => {
    const text = el.dataset.text || el.textContent;
    el.textContent = "";

    const inner = document.createElement("span");
    inner.className = "text-roll__inner";

    const rowOriginal = document.createElement("span");
    rowOriginal.className = "text-roll__row";

    const rowClone = document.createElement("span");
    rowClone.className = "text-roll__row text-roll__row--clone";

    [...text].forEach((char, i) => {
      const span1 = document.createElement("span");
      span1.className = "text-roll__char";
      span1.textContent = char === " " ? "\u00A0" : char;
      span1.style.transitionDelay = `${i * 0.03}s`;
      rowOriginal.appendChild(span1);

      const span2 = document.createElement("span");
      span2.className = "text-roll__char";
      span2.textContent = char === " " ? "\u00A0" : char;
      span2.style.transitionDelay = `${i * 0.03}s`;
      rowClone.appendChild(span2);
    });

    inner.appendChild(rowOriginal);
    inner.appendChild(rowClone);
    el.appendChild(inner);
  });
}

/* ----- Hero entrance: stagger chars ----- */
function initHeroEntrance() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const chars = hero.querySelectorAll(".hero__title .text-roll__char");
  chars.forEach((char, i) => {
    char.style.animationDelay = `${0.3 + i * 0.025}s`;
  });

  requestAnimationFrame(() => {
    setTimeout(() => hero.classList.add("is-loaded"), 100);
  });
}

/* ----- Lenis smooth scroll ----- */
function initLenis() {
  if (reduceMotion) return;
  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

/* ----- Oliver Parallax: scroll-driven column movement ----- */
function initParallax() {
  const gallery = document.querySelector(".parallax-gallery");
  const cols = document.querySelectorAll(".parallax-col");
  if (!gallery || cols.length === 0) return;

  const speeds = [0.8, 2.5, 1.0, 3.0];
  const baseOffsets = [-30, -60, -20, -50];

  let scrollY = window.scrollY;
  let galleryTop = 0;
  let galleryHeight = 0;
  let ticking = false;

  function recalc() {
    const rect = gallery.getBoundingClientRect();
    galleryTop = rect.top + window.scrollY;
    galleryHeight = gallery.offsetHeight;
  }

  function update() {
    const progress = (scrollY - galleryTop + window.innerHeight) / (galleryHeight + window.innerHeight);
    const clamped = Math.max(0, Math.min(1, progress));

    cols.forEach((col, i) => {
      const move = clamped * speeds[i] * 100;
      col.style.transform = `translateY(${baseOffsets[i] + move}%)`;
    });

    ticking = false;
  }

  function onScroll() {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  recalc();
  window.addEventListener("resize", recalc);
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
}

/* ----- Scroll text reveal ----- */
function initRevealText() {
  const elements = document.querySelectorAll(".reveal-text");
  if (elements.length === 0) return;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    elements.forEach((el) => el.classList.add("is-visible"));
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
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ----- Init ----- */
document.addEventListener("DOMContentLoaded", () => {
  initTextRoll();
  initHeroEntrance();
  initLenis();
  initParallax();
  initRevealText();
});
