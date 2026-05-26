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
  CylinderGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer
} from "three";
import {
  ArrowDown,
  ArrowUpRight,
  CircuitBoard,
  Cpu,
  Menu,
  Play,
  PlayCircle,
  Radar,
  ScanEye,
  Smartphone,
  Zap,
  createIcons
} from "lucide";

gsap.registerPlugin(ScrollTrigger);

createIcons({
  icons: {
    ArrowDown,
    ArrowUpRight,
    CircuitBoard,
    Cpu,
    Menu,
    Play,
    PlayCircle,
    Radar,
    ScanEye,
    Smartphone,
    Zap
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
const heroSection = document.querySelector("[data-cinematic-hero]");
const heroCanvas = document.querySelector("#hero-tunnel");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateNav = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 30);
};

updateNav();
window.addEventListener("scroll", updateNav, { passive: true });

initSmoothScroll();
initCinematicIntro();
initMobileMenu();
initCustomCursor();
initRevealObserver();
initMicroInteractions();

window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

function initSmoothScroll() {
  if (prefersReducedMotion) return;

  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.92,
    touchMultiplier: 0.9,
    smoothWheel: true,
    syncTouch: false
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initCinematicIntro() {
  if (!heroSection) return;

  if (prefersReducedMotion || !heroCanvas) {
    heroSection.classList.add("intro-reduced");
    return;
  }

  heroSection.classList.add("intro-active");
  gsap.set(".intro-content", { autoAlpha: 0, y: 42 });
  gsap.set(".boot-kicker, .boot-counter", { autoAlpha: 0, y: 12 });
  gsap.set(".boot-stage", { autoAlpha: 0, x: -18 });
  gsap.set(".boot-log span", { autoAlpha: 0, y: 12 });
  gsap.set(".boot-ring", { autoAlpha: 0, scale: 0.72 });
  gsap.set(".boot-core-line", { scaleY: 0, transformOrigin: "center bottom" });
  gsap.set(".stage-fill", { scaleX: 0, transformOrigin: "left center" });
  gsap.set(".boot-progress span", { scaleX: 0, transformOrigin: "left center" });

  const state = {
    boot: 0,
    scroll: 0,
    pointerX: 0,
    pointerY: 0
  };

  try {
    const scene = new Scene();
    const camera = new PerspectiveCamera(52, 1, 0.1, 180);
    camera.position.set(0, 0.25, 10.8);

    const renderer = new WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x02040a, 0);
    renderer.autoClear = false;

    const shaderScene = new Scene();
    const shaderCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const shaderUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uResolution: { value: new Vector3(1, 1, 1) },
      uPointer: { value: new Vector3(0, 0, 0) }
    };

    const backgroundMesh = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: shaderUniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform float uTime;
          uniform float uScroll;
          uniform vec3 uResolution;
          uniform vec3 uPointer;
          varying vec2 vUv;

          float gridLine(float value, float width) {
            return 1.0 - smoothstep(width, width + 0.006, abs(fract(value) - 0.5));
          }

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
            uv.x -= 0.18;
            uv += uPointer.xy * vec2(0.12, -0.08);

            float radius = length(uv);
            float angle = atan(uv.y, uv.x);
            float pulse = sin(uTime * 1.8) * 0.5 + 0.5;
            float scan = smoothstep(0.02, 0.0, abs(uv.y + 0.2 - sin(uTime * 0.45) * 0.72));
            float rings = gridLine(radius * (8.0 + uScroll * 12.0) - uTime * (0.62 + uScroll * 1.8), 0.025);
            float spokes = pow(max(cos(angle * 28.0 + uTime * 0.45), 0.0), 42.0);
            float horizon = smoothstep(1.15, -0.15, abs(uv.y + 0.28)) * smoothstep(1.55, 0.2, abs(uv.x));
            float noise = hash(floor((uv + uTime * 0.012) * 120.0));
            float coreGlow = exp(-radius * (2.4 - uScroll * 0.7)) * (0.24 + pulse * 0.12);
            float energy = clamp(uScroll * 1.4 + 0.18, 0.0, 1.0);

            vec3 deep = vec3(0.025, 0.018, 0.012);
            vec3 amber = vec3(0.78, 0.48, 0.20);
            vec3 cyan = vec3(0.40, 0.94, 0.90);
            vec3 color = deep;
            color += cyan * coreGlow * (0.8 + energy * 1.2);
            color += amber * rings * horizon * (0.34 + energy * 0.62);
            color += cyan * spokes * horizon * (0.18 + energy * 0.5);
            color += amber * scan * 0.18;
            color += amber * noise * 0.026;

            float alpha = clamp(coreGlow * 1.8 + rings * horizon * 0.42 + spokes * horizon * 0.36 + scan * 0.28, 0.0, 0.95);
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    shaderScene.add(backgroundMesh);

    const coreGroup = new Group();
    coreGroup.position.set(window.innerWidth < 900 ? 0.68 : 2.25, 0.2, -1.4);
    scene.add(coreGroup);

    const monolith = new Mesh(
      new BoxGeometry(4.9, 2.8, 0.32, 16, 10, 2),
      new MeshBasicMaterial({
        color: 0xc89149,
        transparent: true,
        opacity: 0.13,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    monolith.rotation.z = -0.045;
    coreGroup.add(monolith);

    const monolithEdges = new LineSegments(
      new EdgesGeometry(monolith.geometry),
      new LineBasicMaterial({
        color: 0x69f0e7,
        transparent: true,
        opacity: 0.78,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    coreGroup.add(monolithEdges);

    const fossilGroup = new Group();
    fossilGroup.position.set(0.22, 0.08, 0.46);
    fossilGroup.rotation.z = -0.08;
    fossilGroup.scale.setScalar(1.18);
    coreGroup.add(fossilGroup);

    const fossilParts = [];
    const boneMaterial = new MeshBasicMaterial({
      color: 0xf3eadb,
      transparent: true,
      opacity: 0.98,
      blending: AdditiveBlending,
      depthWrite: false
    });
    const jointMaterial = new MeshBasicMaterial({
      color: 0xd4aa67,
      transparent: true,
      opacity: 0.92,
      blending: AdditiveBlending,
      depthWrite: false
    });
    const boneGeometry = new CylinderGeometry(0.034, 0.048, 1, 8, 1);
    const ribGeometry = new CylinderGeometry(0.02, 0.03, 1, 7, 1);
    const jointGeometry = new SphereGeometry(0.095, 10, 8);
    const skullGeometry = new BoxGeometry(0.72, 0.42, 0.2, 3, 2, 1);

    const trackFossilPart = (mesh) => {
      mesh.userData.restPosition = mesh.position.clone();
      mesh.userData.restRotation = mesh.rotation.clone();
      mesh.userData.baseOpacity = mesh.material.opacity;
      mesh.userData.startOffset = new Vector3(
        (Math.random() - 0.5) * 2.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.4
      );
      mesh.userData.endOffset = new Vector3(
        (Math.random() - 0.5) * 1.55,
        (Math.random() - 0.5) * 1.05,
        0.35 + Math.random() * 0.95
      );
      mesh.userData.spin = new Vector3(
        (Math.random() - 0.5) * 1.3,
        (Math.random() - 0.5) * 1.1,
        (Math.random() - 0.5) * 1.5
      );
      fossilParts.push(mesh);
      fossilGroup.add(mesh);
      return mesh;
    };

    const addBone = (from, to, radius = 1, material = boneMaterial) => {
      const start = new Vector3(...from);
      const end = new Vector3(...to);
      const direction = end.clone().sub(start);
      const mesh = new Mesh(boneGeometry.clone(), material.clone());
      mesh.scale.set(radius, direction.length(), radius);
      mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
      return trackFossilPart(mesh);
    };

    const addRib = (from, to, radius = 0.7) => {
      const start = new Vector3(...from);
      const end = new Vector3(...to);
      const direction = end.clone().sub(start);
      const mesh = new Mesh(ribGeometry.clone(), boneMaterial.clone());
      mesh.scale.set(radius, direction.length(), radius);
      mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
      return trackFossilPart(mesh);
    };

    const addJoint = (position, scale = 1, material = jointMaterial) => {
      const mesh = new Mesh(jointGeometry, material.clone());
      mesh.position.set(...position);
      mesh.scale.setScalar(scale);
      return trackFossilPart(mesh);
    };

    const spine = [
      [-1.7, 0.22, 0],
      [-1.15, 0.24, 0],
      [-0.58, 0.18, 0],
      [0.02, 0.1, 0],
      [0.62, 0.04, 0],
      [1.1, -0.02, 0]
    ];
    spine.slice(0, -1).forEach((point, index) => addBone(point, spine[index + 1], 1.05));
    spine.forEach((point, index) => addJoint(point, index === 0 ? 0.9 : 0.72));

    addBone([-2.18, 0.48, 0], [-1.7, 0.22, 0], 0.86);
    const skull = new Mesh(skullGeometry, boneMaterial.clone());
    skull.position.set(-2.52, 0.62, 0.02);
    skull.rotation.z = 0.16;
    skull.scale.set(1.05, 1, 1);
    trackFossilPart(skull);
    addJoint([-2.82, 0.69, 0.04], 0.54);
    addBone([1.1, -0.02, 0], [1.72, 0.02, 0], 0.78);
    addBone([1.72, 0.02, 0], [2.35, 0.18, 0], 0.6);
    addBone([2.35, 0.18, 0], [2.98, 0.36, 0], 0.42);

    spine.slice(1, 5).forEach((point, index) => {
      addRib(point, [point[0] - 0.12, -0.38 - index * 0.02, 0.05], 0.82);
      addRib(point, [point[0] + 0.12, 0.74 - index * 0.07, -0.04], 0.62);
    });

    addBone([-0.58, 0.18, 0], [-0.88, -0.72, 0.04], 0.86);
    addBone([-0.88, -0.72, 0.04], [-1.16, -1.48, 0], 0.72);
    addBone([0.62, 0.04, 0], [0.28, -0.82, -0.04], 0.9);
    addBone([0.28, -0.82, -0.04], [0.1, -1.58, -0.02], 0.7);
    addBone([-1.18, 0.24, 0], [-1.42, -0.34, 0.03], 0.52);
    addBone([-1.42, -0.34, 0.03], [-1.78, -0.64, 0.05], 0.42);

    const fragments = [];
    const fragmentMaterial = new MeshBasicMaterial({
      color: 0xc89149,
      transparent: true,
      opacity: 0.16,
      blending: AdditiveBlending,
      depthWrite: false
    });
    for (let index = 0; index < 12; index += 1) {
      const fragment = new Mesh(new BoxGeometry(0.22, 0.58, 0.08), fragmentMaterial.clone());
      const side = index % 2 === 0 ? -1 : 1;
      fragment.position.set(side * (1.05 + Math.random() * 0.9), (Math.random() - 0.5) * 4.6, (Math.random() - 0.5) * 0.9);
      fragment.rotation.set(Math.random() * 0.7, Math.random() * 0.9, Math.random() * 1.4);
      fragment.scale.set(0.7 + Math.random() * 1.4, 0.6 + Math.random() * 1.2, 1);
      coreGroup.add(fragment);
      fragments.push(fragment);
    }

    const innerCore = new Mesh(
      new IcosahedronGeometry(1.48, 2),
      new MeshBasicMaterial({
        color: 0x69f0e7,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    coreGroup.add(innerCore);

    const rings = [];
    for (let index = 0; index < 9; index += 1) {
      const ring = new Mesh(
        new TorusGeometry(1.82 + index * 0.28, 0.012, 8, 128),
        new MeshBasicMaterial({
          color: index % 2 === 0 ? 0x69f0e7 : 0xc89149,
          transparent: true,
          opacity: 0.3,
          blending: AdditiveBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI / 2 + index * 0.08;
      ring.rotation.y = index * 0.18;
      coreGroup.add(ring);
      rings.push(ring);
    }

    const beamCount = 84;
    const beamPositions = new Float32Array(beamCount * 6);
    const beamSeeds = [];
    for (let index = 0; index < beamCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.3 + Math.random() * 7.5;
      const y = (Math.random() - 0.5) * 7.8;
      const z = -10 - Math.random() * 90;
      const length = 1.2 + Math.random() * 5.2;
      beamSeeds.push({ angle, radius, y, z, length, speed: 0.55 + Math.random() * 1.25 });
    }
    const beamGeometry = new BufferGeometry().setAttribute("position", new BufferAttribute(beamPositions, 3));
    const beams = new LineSegments(
      beamGeometry,
      new LineBasicMaterial({
        color: 0x69f0e7,
        transparent: true,
        opacity: 0.46,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(beams);

    const particleCount = window.innerWidth < 768 ? 420 : 980;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = (Math.random() - 0.5) * 16;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 9;
      particlePositions[index * 3 + 2] = -Math.random() * 95 + 8;
      particleSpeeds[index] = 0.6 + Math.random() * 1.8;
    }
    const particles = new Points(
      new BufferGeometry().setAttribute("position", new Float32BufferAttribute(particlePositions, 3)),
      new PointsMaterial({
        color: 0xd4aa67,
        size: window.innerWidth < 768 ? 0.034 : 0.045,
        transparent: true,
        opacity: 0.86,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    scene.add(particles);

    const writeBeams = () => {
      beamSeeds.forEach((beam, index) => {
        const x = Math.cos(beam.angle) * beam.radius;
        const y = beam.y;
        const z = beam.z;
        const offset = index * 6;
        beamPositions[offset] = x;
        beamPositions[offset + 1] = y;
        beamPositions[offset + 2] = z;
        beamPositions[offset + 3] = x * 0.32;
        beamPositions[offset + 4] = y * 0.4;
        beamPositions[offset + 5] = z + beam.length;
      });
      beamGeometry.attributes.position.needsUpdate = true;
    };

    const resize = () => {
      const { clientWidth, clientHeight } = heroSection;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, clientWidth < 768 ? 1.05 : 1.45));
      renderer.setSize(clientWidth, clientHeight, false);
      shaderUniforms.uResolution.value.set(clientWidth, clientHeight, 1);
      coreGroup.position.x = clientWidth < 900 ? 0.68 : 2.25;
      coreGroup.scale.setScalar(clientWidth < 768 ? 0.86 : 1.12);
    };

    const updatePointer = (event) => {
      state.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      state.pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    let currentX = 0;
    let currentY = 0;
    let running = true;
    const clock = new Clock();

    const animate = () => {
      if (!running) return;

      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;
      const scroll = state.scroll;
      const boot = state.boot;
      const energy = 0.34 + boot * 0.42 + scroll * 0.9;
      const speed = delta * (5.5 + boot * 12 + scroll * 24);

      currentX += (state.pointerX - currentX) * 0.045;
      currentY += (state.pointerY - currentY) * 0.045;
      camera.position.x = currentX * 0.82;
      camera.position.y = 0.25 - currentY * 0.5 + scroll * 0.34;
      camera.position.z = 10.8 - scroll * 5.6;
      camera.lookAt(currentX * 0.28, -currentY * 0.18, -6.2 - scroll * 9.5);

      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uScroll.value = scroll;
      shaderUniforms.uPointer.value.set(currentX, currentY, 0);

      coreGroup.rotation.y = elapsed * 0.16 + currentX * 0.18 + scroll * 0.9;
      coreGroup.rotation.x = -currentY * 0.1 + Math.sin(elapsed * 0.35) * 0.035;
      monolith.material.opacity = 0.12 + energy * 0.16;
      monolithEdges.material.opacity = 0.38 + energy * 0.5;
      innerCore.rotation.y -= delta * (0.28 + scroll * 0.8);
      innerCore.rotation.x += delta * 0.2;
      innerCore.material.opacity = 0.08 + energy * 0.16;

      const settle = Math.max(0, 1 - Math.min(boot / 0.56, 1));
      const decompose = Math.max(0, Math.min((boot - 0.7) / 0.3, 1));
      fossilParts.forEach((part, index) => {
        const rest = part.userData.restPosition;
        const startOffset = part.userData.startOffset;
        const endOffset = part.userData.endOffset;
        const spin = part.userData.spin;
        const restRotation = part.userData.restRotation;
        part.position.set(
          rest.x + startOffset.x * settle + endOffset.x * decompose,
          rest.y + startOffset.y * settle + endOffset.y * decompose + Math.sin(elapsed * 1.1 + index) * 0.012,
          rest.z + startOffset.z * settle + endOffset.z * decompose
        );
        part.rotation.set(
          restRotation.x + spin.x * (settle * 0.85 + decompose * 1.6),
          restRotation.y + spin.y * (settle * 0.85 + decompose * 1.6),
          restRotation.z + spin.z * (settle * 0.85 + decompose * 1.6)
        );
        part.material.opacity = part.userData.baseOpacity * (0.46 + boot * 0.74) * (1 - decompose * 0.28);
      });

      fragments.forEach((fragment, index) => {
        fragment.rotation.y += delta * (0.06 + (index % 4) * 0.015);
        fragment.rotation.z += delta * (index % 2 === 0 ? 0.035 : -0.028);
        fragment.position.y += Math.sin(elapsed * 0.7 + index) * 0.0009 + decompose * 0.002;
        fragment.material.opacity = 0.05 + energy * 0.08 + decompose * 0.16;
      });

      rings.forEach((ring, index) => {
        ring.rotation.z += delta * (index % 2 === 0 ? 0.22 : -0.18) * (1 + scroll * 2.2);
        ring.rotation.x += delta * 0.035;
        ring.material.opacity = 0.16 + Math.sin(elapsed * 1.6 + index) * 0.05 + energy * 0.22;
        ring.scale.setScalar(1 + Math.sin(elapsed * 0.9 + index) * 0.018 + scroll * 0.16);
      });

      for (let index = 0; index < particleCount; index += 1) {
        const zIndex = index * 3 + 2;
        particlePositions[zIndex] += speed * particleSpeeds[index];
        if (particlePositions[zIndex] > 9) {
          particlePositions[index * 3] = (Math.random() - 0.5) * 16;
          particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 9;
          particlePositions[zIndex] = -94;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.material.opacity = 0.42 + energy * 0.38;

      beamSeeds.forEach((beam) => {
        beam.z += speed * beam.speed;
        beam.angle += delta * 0.035;
        if (beam.z > 8) beam.z = -95 - Math.random() * 20;
      });
      beams.material.opacity = 0.18 + energy * 0.42;
      writeBeams();

      renderer.clear();
      renderer.render(shaderScene, shaderCamera);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    resize();
    writeBeams();
    heroSection.classList.add("intro-ready");
    window.addEventListener("resize", resize, { passive: true });
    if (canHover) window.addEventListener("pointermove", updatePointer, { passive: true });
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) {
        clock.getDelta();
        requestAnimationFrame(animate);
      }
    });

    requestAnimationFrame(animate);
    runIntroTimeline(heroSection, state);
  } catch (error) {
    console.warn("Cinematic intro fallback:", error);
    heroSection.classList.add("intro-fallback-mode");
    runIntroTimeline(heroSection, state);
  }
}

function runIntroTimeline(section, state) {
  const counter = document.querySelector("[data-boot-counter]");
  const counterState = { value: 0 };
  const updateCounter = () => {
    if (!counter) return;
    counter.textContent = `${String(Math.round(counterState.value)).padStart(3, "0")}%`;
  };

  const sequence = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => ScrollTrigger.refresh()
  });

  sequence
    .to(state, { boot: 1, duration: 4.8, ease: "power2.inOut" }, 0)
    .to(counterState, { value: 100, duration: 4.38, ease: "power1.inOut", onUpdate: updateCounter }, 0.18)
    .to(".boot-ring", { autoAlpha: 1, scale: 1, stagger: 0.16, duration: 0.9 }, 0.08)
    .to(".boot-ring", { rotation: "+=360", duration: 4.5, ease: "none", stagger: 0.06 }, 0.12)
    .to(".boot-core-line", { scaleY: 1, duration: 1.1, ease: "power2.inOut" }, 0.35)
    .to(".boot-kicker, .boot-counter", { autoAlpha: 1, y: 0, duration: 0.58 }, 0.18)
    .to(".boot-stage", { autoAlpha: 1, x: 0, stagger: 0.3, duration: 0.54 }, 0.55)
    .to(".stage-fill", { scaleX: 1, stagger: 0.42, duration: 0.82, ease: "power2.inOut" }, 0.86)
    .to(".boot-log span", { autoAlpha: 1, y: 0, stagger: 0.34, duration: 0.46 }, 1.25)
    .to(".boot-progress span", { scaleX: 1, duration: 4.2, ease: "power2.inOut" }, 0.28)
    .to(".boot-panel", { boxShadow: "0 0 80px rgba(200, 145, 73, 0.2), 0 0 42px rgba(105, 240, 231, 0.08)", duration: 0.7 }, 3.4)
    .to(".intro-boot", { autoAlpha: 0, filter: "blur(18px)", scale: 1.04, duration: 0.9 }, 4.68)
    .add(() => section.classList.add("intro-boot-complete"), 4.72)
    .to(".intro-content", { autoAlpha: 1, y: 0, duration: 1.1 }, 4.82)
    .from(".intro-title span", { yPercent: 112, duration: 0.92, stagger: 0.08 }, 4.86)
    .from(".intro-lede, .intro-actions, .intro-console, .intro-dock span", {
      autoAlpha: 0,
      y: 20,
      stagger: 0.06,
      duration: 0.7
    }, 5.2);

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${Math.round(window.innerHeight * (window.innerWidth >= 900 ? 1.35 : 0.9))}`,
    scrub: 0.75,
    pin: window.innerWidth >= 900,
    anticipatePin: 1,
    onUpdate: (self) => {
      state.scroll = self.progress;
      section.style.setProperty("--intro-scroll", self.progress.toFixed(3));
    }
  });
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
