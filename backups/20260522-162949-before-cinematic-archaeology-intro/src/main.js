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
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
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
  const sceneApi = createArtifactScene(introCanvas);

  gsap.set(".intro-status span, .intro-readout span", { autoAlpha: 0, y: 12 });
  gsap.set(".intro-core", { autoAlpha: 0, scale: 0.86 });
  gsap.set(".intro-ring", { scale: 0.45, opacity: 0 });
  gsap.set(".intro-glyphs span", { autoAlpha: 0, y: 20, rotate: -4 });

  const state = { progress: 0 };
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onUpdate: () => sceneApi?.setProgress(state.progress),
    onComplete: finishIntro
  });

  timeline
    .to(state, { progress: 0.18, duration: 0.9, ease: "power2.inOut" }, 0)
    .to(".intro-status span", { autoAlpha: 1, y: 0, stagger: 0.28, duration: 0.55 }, 0.35)
    .to(".intro-core", { autoAlpha: 1, scale: 1, duration: 0.9 }, 1.15)
    .to(".intro-ring", { scale: 1, opacity: 1, stagger: 0.16, duration: 0.8 }, 1.2)
    .to(state, { progress: 0.62, duration: 2.2, ease: "power2.inOut" }, 1.15)
    .to(".intro-glyphs span", { autoAlpha: 1, y: 0, rotate: 0, stagger: 0.18, duration: 0.75 }, 2.05)
    .to(".intro-readout span", { autoAlpha: 1, y: 0, stagger: 0.18, duration: 0.5 }, 2.65)
    .to(state, { progress: 1, duration: 1.55, ease: "power2.inOut" }, 3.3)
    .to(".intro-ui", { autoAlpha: 0, y: -22, filter: "blur(10px)", duration: 0.8 }, 4.25)
    .to(intro, { autoAlpha: 0, duration: 0.95, ease: "power2.inOut" }, 4.45);

  skipIntro?.addEventListener("click", () => {
    timeline.progress(1);
    finishIntro();
  });

  window.setTimeout(() => {
    if (!intro.classList.contains("is-complete")) finishIntro();
  }, 7600);
}

function createArtifactScene(canvas) {
  try {
    const scene = new Scene();
    const camera = new PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 0.35, 8.6);

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

    const tablet = new Mesh(
      new BoxGeometry(2.1, 3.35, 0.34, 8, 12, 2),
      new MeshBasicMaterial({
        color: 0xc08a49,
        transparent: true,
        opacity: 0.18,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    tablet.rotation.z = -0.04;
    group.add(tablet);

    const edges = new LineSegments(
      new EdgesGeometry(tablet.geometry),
      new LineBasicMaterial({
        color: 0x67f0e7,
        transparent: true,
        opacity: 0.46,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    edges.rotation.copy(tablet.rotation);
    group.add(edges);

    const relic = new Mesh(
      new IcosahedronGeometry(1.06, 2),
      new MeshBasicMaterial({
        color: 0xf3eadb,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    relic.position.set(0.08, 0, 0.28);
    group.add(relic);

    const rings = [];
    for (let i = 0; i < 7; i += 1) {
      const ring = new Mesh(
        new TorusGeometry(1.25 + i * 0.32, 0.008, 8, 96),
        new MeshBasicMaterial({
          color: i % 2 === 0 ? 0x67f0e7 : 0xc08a49,
          transparent: true,
          opacity: 0.16,
          blending: AdditiveBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI / 2 + i * 0.06;
      ring.rotation.y = i * 0.18;
      group.add(ring);
      rings.push(ring);
    }

    const fragmentMaterial = new MeshBasicMaterial({
      color: 0xd7aa66,
      transparent: true,
      opacity: 0.22,
      blending: AdditiveBlending,
      depthWrite: false
    });
    const fragments = [];
    for (let i = 0; i < 18; i += 1) {
      const fragment = new Mesh(new BoxGeometry(0.14, 0.36, 0.08), fragmentMaterial.clone());
      fragment.userData.rest = new Vector3((Math.random() - 0.5) * 2.7, (Math.random() - 0.5) * 3.3, 0.4 + Math.random() * 0.55);
      fragment.userData.start = new Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5, -2.5 - Math.random() * 3);
      fragment.position.copy(fragment.userData.start);
      fragment.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(fragment);
      fragments.push(fragment);
    }

    const particleCount = window.innerWidth < 768 ? 360 : 840;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = -Math.random() * 12;
      speeds[i] = 0.15 + Math.random() * 0.55;
    }
    const particles = new Points(
      new BufferGeometry().setAttribute("position", new Float32BufferAttribute(positions, 3)),
      new PointsMaterial({
        color: 0xd7aa66,
        size: window.innerWidth < 768 ? 0.026 : 0.034,
        transparent: true,
        opacity: 0.72,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(particles);

    const scanPositions = new Float32Array(34 * 6);
    const scanGeometry = new BufferGeometry().setAttribute("position", new BufferAttribute(scanPositions, 3));
    const scanLines = new LineSegments(
      scanGeometry,
      new LineBasicMaterial({
        color: 0x67f0e7,
        transparent: true,
        opacity: 0.36,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(scanLines);

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
      group.scale.setScalar(width < 768 ? 0.72 : 1);
      group.position.x = width < 900 ? 0 : 1.05;
    };

    const pointer = (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const writeScanLines = (time) => {
      for (let i = 0; i < 34; i += 1) {
        const y = -2.4 + ((i * 0.18 + time * 0.42) % 4.8);
        const z = -0.35 + Math.sin(i + time) * 0.06;
        const offset = i * 6;
        scanPositions[offset] = -2.4;
        scanPositions[offset + 1] = y;
        scanPositions[offset + 2] = z;
        scanPositions[offset + 3] = 2.4;
        scanPositions[offset + 4] = y;
        scanPositions[offset + 5] = z;
      }
      scanGeometry.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      if (!running) return;
      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;

      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      camera.position.x = currentX * 0.45;
      camera.position.y = 0.35 - currentY * 0.25;
      camera.lookAt(currentX * 0.12, -currentY * 0.08, -1.8);

      group.rotation.y = Math.sin(elapsed * 0.28) * 0.16 + currentX * 0.08;
      group.rotation.x = -0.08 - currentY * 0.06;
      tablet.material.opacity = 0.05 + progress * 0.18;
      edges.material.opacity = 0.15 + progress * 0.46;
      relic.rotation.y += delta * (0.22 + progress * 0.4);
      relic.rotation.x += delta * 0.12;
      relic.material.opacity = 0.08 + progress * 0.24;
      scanLines.material.opacity = 0.08 + progress * 0.42;

      rings.forEach((ring, index) => {
        ring.rotation.z += delta * (index % 2 ? -0.14 : 0.18);
        ring.material.opacity = 0.06 + progress * (0.1 + index * 0.018);
      });

      fragments.forEach((fragment, index) => {
        const settle = Math.min(progress / 0.72, 1);
        const rest = fragment.userData.rest;
        const start = fragment.userData.start;
        fragment.position.lerpVectors(start, rest, settle);
        fragment.position.y += Math.sin(elapsed * 1.2 + index) * 0.004;
        fragment.rotation.y += delta * 0.18;
        fragment.material.opacity = 0.03 + progress * 0.34;
      });

      for (let i = 0; i < particleCount; i += 1) {
        const y = i * 3 + 1;
        const z = i * 3 + 2;
        positions[y] += delta * speeds[i] * (0.4 + progress);
        positions[z] += delta * speeds[i] * 0.22;
        if (positions[y] > 3.5) positions[y] = -3.5;
        if (positions[z] > 2.5) positions[z] = -10;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.material.opacity = 0.24 + progress * 0.54;

      writeScanLines(elapsed);
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
