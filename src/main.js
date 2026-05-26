import "./styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Clock,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import {
  Archive,
  ArrowDown,
  ArrowUpRight,
  Box,
  BrainCircuit,
  Menu,
  PlayCircle,
  Radar,
  ScanLine,
  createIcons
} from "lucide";

gsap.registerPlugin(ScrollTrigger);

createIcons({
  icons: {
    Archive,
    ArrowDown,
    ArrowUpRight,
    Box,
    BrainCircuit,
    Menu,
    PlayCircle,
    Radar,
    ScanLine
  },
  attrs: {
    "stroke-width": 1.7,
    "aria-hidden": "true"
  }
});

const nav = document.querySelector("#site-nav");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const cursorDot = document.querySelector("#cursor-dot");
const cursorRing = document.querySelector("#cursor-ring");
const intro = document.querySelector("[data-intro]");
const skipIntro = document.querySelector("[data-skip-intro]");
const introCanvas = document.querySelector("#intro-canvas");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initNav();
initSmoothScroll();
initMobileMenu();
initCustomCursor();
initRevealObserver();
initMicroInteractions();
initIntroExperience();
initScrollCinematics();

window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

function initNav() {
  const updateNav = () => nav?.classList.toggle("is-scrolled", window.scrollY > 30);
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });
}

function initSmoothScroll() {
  if (prefersReducedMotion) return;

  const lenis = new Lenis({
    lerp: 0.075,
    wheelMultiplier: 0.9,
    touchMultiplier: 0.9,
    smoothWheel: true,
    syncTouch: false
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initIntroExperience() {
  if (!intro) return;

  const finishIntro = () => {
    intro.classList.add("is-complete");
    document.body.classList.add("intro-complete");
    setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
      ScrollTrigger.refresh();
    }, 900);
  };

  if (prefersReducedMotion || !introCanvas) {
    finishIntro();
    return;
  }

  document.body.classList.add("intro-running");
  const sceneApi = createExcavationScene(introCanvas);

  gsap.set(".intro-stone", { autoAlpha: 0, scale: 1.08 });
  gsap.set(".intro-inscriptions span", { autoAlpha: 0, y: 28, rotate: -3 });
  gsap.set(".intro-artifact-stage", { autoAlpha: 0, xPercent: -50, yPercent: -50, y: 32, scale: 0.92 });
  gsap.set(".artifact-crack", { scaleX: 0, transformOrigin: "left center" });
  gsap.set(".intro-title-card", { autoAlpha: 0, y: 26, filter: "blur(10px)" });
  gsap.set(".intro-transition", { xPercent: -110 });

  const state = { progress: 0 };
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onUpdate: () => sceneApi?.setProgress(state.progress),
    onComplete: finishIntro
  });

  timeline
    .to(state, { progress: 0.12, duration: 0.9, ease: "sine.inOut" }, 0)
    .to(".intro-stone", { autoAlpha: 1, scale: 1, duration: 1.25, ease: "power2.out" }, 0.45)
    .to(state, { progress: 0.34, duration: 1.45, ease: "sine.inOut" }, 0.65)
    .to(".intro-inscriptions span", { autoAlpha: 1, y: 0, rotate: 0, stagger: 0.16, duration: 0.75 }, 1.15)
    .to(".intro-artifact-stage", { autoAlpha: 1, y: 0, scale: 1, duration: 1.15, ease: "power2.out" }, 1.75)
    .to(".artifact-crack", { scaleX: 1, stagger: 0.18, duration: 0.7, ease: "power2.inOut" }, 2.15)
    .to(state, { progress: 0.72, duration: 1.9, ease: "sine.inOut" }, 2.05)
    .to(".intro-title-card", { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0 }, 3.15)
    .to(state, { progress: 1, duration: 1.25, ease: "power2.inOut" }, 3.95)
    .to(".intro-title-card", { autoAlpha: 0, y: -20, filter: "blur(8px)", duration: 0.7 }, 4.45)
    .to(".intro-transition", { xPercent: 110, duration: 1.05, ease: "power3.inOut" }, 4.65)
    .to(intro, { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" }, 5.15);

  skipIntro?.addEventListener("click", () => {
    timeline.progress(1);
    finishIntro();
  });

  window.setTimeout(() => {
    if (!intro.classList.contains("is-complete")) finishIntro();
  }, 8500);
}

function createExcavationScene(canvas) {
  try {
    const scene = new Scene();
    const camera = new PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 0.45, 9.6);

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x080604, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.05 : 1.45));

    const group = new Group();
    scene.add(group);

    const slab = new Mesh(
      new BoxGeometry(2.65, 3.55, 0.42, 8, 12, 2),
      new MeshBasicMaterial({
        color: 0xc08a49,
        transparent: true,
        opacity: 0.16,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    slab.rotation.set(-0.04, -0.12, -0.055);
    group.add(slab);

    const edges = new LineSegments(
      new EdgesGeometry(slab.geometry),
      new LineBasicMaterial({
        color: 0xf3d09a,
        transparent: true,
        opacity: 0.34,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    edges.rotation.copy(slab.rotation);
    group.add(edges);

    const crackPositions = new Float32Array([
      -0.72, 1.18, 0.34, -0.18, 0.58, 0.36,
      -0.18, 0.58, 0.36, -0.54, -0.14, 0.35,
      0.2, 1.25, 0.35, 0.42, 0.36, 0.36,
      0.42, 0.36, 0.36, 0.16, -0.72, 0.36,
      -0.92, -1.0, 0.34, -0.2, -0.6, 0.35,
      0.62, -1.2, 0.35, 0.18, -0.72, 0.36
    ]);
    const cracks = new LineSegments(
      new BufferGeometry().setAttribute("position", new BufferAttribute(crackPositions, 3)),
      new LineBasicMaterial({
        color: 0x2b1a0e,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      })
    );
    cracks.rotation.copy(slab.rotation);
    group.add(cracks);

    const inscriptionPositions = new Float32Array([
      -0.92, 0.74, 0.39, -0.48, 0.74, 0.39,
      -0.7, 0.98, 0.39, -0.7, 0.48, 0.39,
      -0.18, 0.86, 0.39, 0.24, 0.62, 0.39,
      0.24, 0.62, 0.39, -0.16, 0.42, 0.39,
      0.52, 0.82, 0.39, 0.88, 0.82, 0.39,
      0.7, 1.02, 0.39, 0.7, 0.55, 0.39,
      -0.64, -0.36, 0.39, -0.2, -0.18, 0.39,
      -0.2, -0.18, 0.39, -0.56, 0.04, 0.39,
      0.24, -0.38, 0.39, 0.72, -0.38, 0.39,
      0.48, -0.62, 0.39, 0.48, -0.12, 0.39
    ]);
    const inscriptionLines = new LineSegments(
      new BufferGeometry().setAttribute("position", new BufferAttribute(inscriptionPositions, 3)),
      new LineBasicMaterial({
        color: 0xf1c77d,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    inscriptionLines.rotation.copy(slab.rotation);
    group.add(inscriptionLines);

    const fragmentMaterial = new MeshBasicMaterial({
      color: 0xba7b3d,
      transparent: true,
      opacity: 0.24,
      blending: AdditiveBlending,
      depthWrite: false
    });
    const fragments = [];
    for (let i = 0; i < 24; i += 1) {
      const fragment = new Mesh(new BoxGeometry(0.12 + Math.random() * 0.18, 0.22 + Math.random() * 0.34, 0.08), fragmentMaterial.clone());
      fragment.userData.rest = new Vector3((Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 4.1, 0.25 + Math.random() * 0.72);
      fragment.userData.start = new Vector3((Math.random() - 0.5) * 8.5, -3.8 - Math.random() * 2.8, -3.5 - Math.random() * 3.2);
      fragment.userData.spin = new Vector3(Math.random() * 0.8, Math.random() * 1.2, Math.random() * 1.1);
      fragment.position.copy(fragment.userData.start);
      fragment.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(fragment);
      fragments.push(fragment);
    }

    const particleCount = window.innerWidth < 768 ? 260 : 620;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 9.5;
      positions[i * 3 + 1] = -3.2 + Math.random() * 6.4;
      positions[i * 3 + 2] = -Math.random() * 10;
      speeds[i] = 0.08 + Math.random() * 0.32;
    }
    const dust = new Points(
      new BufferGeometry().setAttribute("position", new Float32BufferAttribute(positions, 3)),
      new PointsMaterial({
        color: 0xb77a3f,
        size: window.innerWidth < 768 ? 0.022 : 0.03,
        transparent: true,
        opacity: 0.55,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(dust);

    const depthLayerPositions = new Float32Array([
      -4.2, -2.2, -3.6, 4.2, -2.2, -3.6,
      -3.6, -1.4, -5.8, 3.6, -1.4, -5.8,
      -3.2, -0.6, -8.2, 3.2, -0.6, -8.2,
      -2.7, 0.3, -10.5, 2.7, 0.3, -10.5
    ]);
    const depthLayers = new LineSegments(
      new BufferGeometry().setAttribute("position", new BufferAttribute(depthLayerPositions, 3)),
      new LineBasicMaterial({
        color: 0x7a4d2a,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      })
    );
    scene.add(depthLayers);

    let progress = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = true;
    const clock = new Clock();

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.05 : 1.45));
      group.scale.setScalar(width < 768 ? 0.72 : 1.05);
      group.position.x = width < 900 ? 0 : 1.15;
      group.position.y = width < 768 ? -0.1 : 0.05;
    };

    const pointer = (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const animate = () => {
      if (!running) return;
      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;

      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      camera.position.x = currentX * 0.34;
      camera.position.y = 0.48 - currentY * 0.18;
      camera.position.z = 9.6 - progress * 3.4 + Math.sin(elapsed * 18) * 0.006 * progress;
      camera.lookAt(currentX * 0.1, -currentY * 0.05, -1.8 - progress * 1.4);

      group.rotation.y = -0.18 + Math.sin(elapsed * 0.18) * 0.05 + currentX * 0.06 + progress * 0.13;
      group.rotation.x = -0.1 - currentY * 0.035 + progress * 0.05;
      slab.material.opacity = 0.02 + progress * 0.2;
      edges.material.opacity = 0.08 + progress * 0.36;
      cracks.material.opacity = 0.22 + progress * 0.58;
      inscriptionLines.material.opacity = Math.max(0, (progress - 0.28) / 0.5) * 0.9;

      fragments.forEach((fragment, index) => {
        const settle = Math.min(Math.max((progress - 0.2) / 0.58, 0), 1);
        const rest = fragment.userData.rest;
        const start = fragment.userData.start;
        fragment.position.lerpVectors(start, rest, settle);
        fragment.position.y += Math.sin(elapsed * 0.85 + index) * 0.004;
        fragment.rotation.x += delta * fragment.userData.spin.x;
        fragment.rotation.y += delta * fragment.userData.spin.y;
        fragment.rotation.z += delta * fragment.userData.spin.z;
        fragment.material.opacity = 0.02 + settle * 0.34;
      });

      for (let i = 0; i < particleCount; i += 1) {
        const y = i * 3 + 1;
        const z = i * 3 + 2;
        positions[y] += delta * speeds[i] * (0.26 + progress * 0.72);
        positions[z] += delta * speeds[i] * 0.12;
        if (positions[y] > 3.5) positions[y] = -3.5;
        if (positions[z] > 2.5) positions[z] = -10;
      }
      dust.geometry.attributes.position.needsUpdate = true;
      dust.material.opacity = 0.12 + progress * 0.42;
      depthLayers.material.opacity = 0.1 + progress * 0.24;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    if (canHover) window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) {
        clock.getDelta();
        requestAnimationFrame(animate);
      }
    });
    requestAnimationFrame(animate);

    return {
      setProgress(value) {
        progress = value;
      }
    };
  } catch (error) {
    console.warn("Intro WebGL fallback:", error);
    return null;
  }
}

function initMobileMenu() {
  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu?.classList.toggle("is-open", !isOpen);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle?.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
    });
  });
}

function initCustomCursor() {
  if (!canHover || prefersReducedMotion || !cursorDot || !cursorRing) return;

  document.body.classList.add("has-custom-cursor");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    },
    { passive: true }
  );

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"));
    element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
  });
}

function initRevealObserver() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -70px 0px"
    }
  );

  document.querySelectorAll(".reveal-up, [data-clip]").forEach((element) => {
    revealObserver.observe(element);
  });
}

function initMicroInteractions() {
  if (prefersReducedMotion) return;

  const parallaxNodes = [...document.querySelectorAll("[data-parallax]")];
  const tiltNodes = [...document.querySelectorAll("[data-tilt]")];

  const updateParallax = () => {
    const offset = window.scrollY;
    parallaxNodes.forEach((node) => {
      const speed = Number(node.dataset.parallax || 0.1);
      node.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
    });
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });

  if (!canHover) return;

  tiltNodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      node.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      node.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    });

    node.addEventListener("pointerleave", () => {
      node.style.setProperty("--tilt-x", "0deg");
      node.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function initScrollCinematics() {
  if (prefersReducedMotion) return;

  gsap.utils.toArray(".research-card, .data-panel, .archive-card").forEach((card) => {
    gsap.fromTo(
      card,
      { y: 34, opacity: 0.65 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 86%"
        }
      }
    );
  });

  gsap.to(".wire-temple span", {
    scaleY: 1,
    opacity: 1,
    stagger: 0.12,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".reconstruction-stage",
      start: "top 72%",
      end: "bottom 60%",
      scrub: 0.8
    }
  });
}
