import "./styles.css";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  Float32BufferAttribute,
  FogExp2,
  Group,
  Line,
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
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroSection = document.querySelector(".hero-section");
const heroCanvas = document.querySelector("#hero-tunnel");

const updateNav = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 30);
};

updateNav();
window.addEventListener("scroll", updateNav, { passive: true });

initHeroTunnel();

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

if (canHover && !prefersReducedMotion && cursorDot && cursorRing) {
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

function initHeroTunnel() {
  if (!heroSection || !heroCanvas) return;

  if (prefersReducedMotion) {
    heroSection.classList.add("webgl-reduced");
    return;
  }

  try {
    const scene = new Scene();
    scene.fog = new FogExp2(0x050813, 0.024);

    const camera = new PerspectiveCamera(58, 1, 0.1, 220);
    camera.position.set(0, 0, 17);

    const renderer = new WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x050813, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.15 : 1.55));
    renderer.autoClear = false;

    const shaderScene = new Scene();
    const shaderCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const shaderUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new Vector3(1, 1, 1) },
      uMouse: { value: new Vector3(0, 0, 0) }
    };
    const shaderMesh = new Mesh(
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
          uniform vec3 uResolution;
          uniform vec3 uMouse;
          varying vec2 vUv;

          float line(float value, float width) {
            return 1.0 - smoothstep(width, width + 0.012, abs(value));
          }

          void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
            uv -= vec2(0.42, 0.12);
            uv += uMouse.xy * vec2(0.18, -0.12);

            float radius = length(uv);
            float angle = atan(uv.y, uv.x);
            float depth = 1.0 / max(radius, 0.045);
            float pulse = sin(uTime * 1.8) * 0.5 + 0.5;

            float ringPhase = depth * 2.35 - uTime * 2.2;
            float ring = smoothstep(0.47, 0.5, abs(fract(ringPhase) - 0.5));

            float spokes = pow(max(cos(angle * 18.0 + depth * 0.34 - uTime * 0.8), 0.0), 26.0);
            float fineSpokes = pow(max(cos(angle * 42.0 - uTime * 1.35), 0.0), 54.0);
            float data = pow(max(sin(angle * 9.0 + depth * 1.4 - uTime * 4.8), 0.0), 18.0);

            float core = smoothstep(0.92, 0.08, radius);
            float edgeFade = smoothstep(1.65, 0.18, radius);
            float centerHole = smoothstep(0.05, 0.34, radius);
            float tunnelMask = edgeFade * centerHole;
            float glow = exp(-radius * 1.9) * (0.34 + pulse * 0.16);

            vec3 deep = vec3(0.008, 0.02, 0.055);
            vec3 blue = vec3(0.12, 0.44, 1.0);
            vec3 cyan = vec3(0.45, 0.96, 1.0);
            vec3 color = deep;
            color += blue * ring * tunnelMask * 0.72;
            color += cyan * spokes * tunnelMask * 0.92;
            color += cyan * fineSpokes * tunnelMask * 0.32;
            color += cyan * data * tunnelMask * 0.72;
            color += cyan * glow * core * 1.24;

            float alpha = clamp((ring * 0.72 + spokes * 0.95 + fineSpokes * 0.32 + data * 0.72 + glow * 1.1) * tunnelMask, 0.0, 0.96);
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    shaderScene.add(shaderMesh);

    const tunnel = new Group();
    scene.add(tunnel);

    const depth = 156;
    const spacing = 5.2;
    const frameCount = 34;
    const cyan = new Color(0x72f3ff);
    const blue = new Color(0x4ea8ff);

    const makeFrameGeometry = (width, height) =>
      new BufferGeometry().setFromPoints([
        new Vector3(-width, -height, 0),
        new Vector3(width, -height, 0),
        new Vector3(width, height, 0),
        new Vector3(-width, height, 0),
        new Vector3(-width, -height, 0)
      ]);

    const frames = [];
    for (let i = 0; i < frameCount; i += 1) {
      const material = new LineBasicMaterial({
        color: i % 3 === 0 ? cyan : blue,
        transparent: true,
        opacity: 0.16 + (1 - i / frameCount) * 0.34,
        blending: AdditiveBlending,
        depthWrite: false
      });
      const frame = new Line(makeFrameGeometry(5.2, 3), material);
      frame.position.z = -i * spacing;
      frame.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.015 * i;
      frame.userData.seed = i * 0.37;
      tunnel.add(frame);
      frames.push(frame);
    }

    const portalRings = [];
    for (let i = 0; i < 15; i += 1) {
      const ring = new Mesh(
        new TorusGeometry(2.15 + (i % 4) * 0.1, 0.012, 8, 96),
        new MeshBasicMaterial({
          color: i % 2 === 0 ? 0x72f3ff : 0x4ea8ff,
          transparent: true,
          opacity: 0.22 + (1 - i / 15) * 0.18,
          blending: AdditiveBlending,
          depthWrite: false
        })
      );
      ring.position.z = -i * 9.2 - 4;
      ring.rotation.z = i * 0.18;
      tunnel.add(ring);
      portalRings.push(ring);
    }

    const railPositions = [];
    [-5.2, -2.6, 0, 2.6, 5.2].forEach((x) => {
      railPositions.push(x, -3, 18, x, -3, -depth);
      railPositions.push(x, 3, 18, x, 3, -depth);
    });
    [-3, -1.5, 0, 1.5, 3].forEach((y) => {
      railPositions.push(-5.2, y, 18, -5.2, y, -depth);
      railPositions.push(5.2, y, 18, 5.2, y, -depth);
    });
    const rails = new LineSegments(
      new BufferGeometry().setAttribute("position", new Float32BufferAttribute(railPositions, 3)),
      new LineBasicMaterial({
        color: 0x4ea8ff,
        transparent: true,
        opacity: 0.24,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    tunnel.add(rails);

    const particleCount = window.innerWidth < 768 ? 360 : 760;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10.4;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = -Math.random() * depth + 16;
    }
    const particles = new Points(
      new BufferGeometry().setAttribute("position", new BufferAttribute(particlePositions, 3)),
      new PointsMaterial({
        color: 0x72f3ff,
        size: window.innerWidth < 768 ? 0.035 : 0.045,
        transparent: true,
        opacity: 0.92,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    tunnel.add(particles);

    const streakCount = window.innerWidth < 768 ? 56 : 104;
    const streakPositions = new Float32Array(streakCount * 6);
    const streakData = Array.from({ length: streakCount }, () => ({
      x: (Math.random() - 0.5) * 9.6,
      y: (Math.random() - 0.5) * 5.6,
      z: -Math.random() * depth + 12,
      length: 1.8 + Math.random() * 4.4
    }));
    const streakGeometry = new BufferGeometry().setAttribute(
      "position",
      new BufferAttribute(streakPositions, 3)
    );
    const streaks = new LineSegments(
      streakGeometry,
      new LineBasicMaterial({
        color: 0x72f3ff,
        transparent: true,
        opacity: 0.56,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    tunnel.add(streaks);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = true;
    const clock = new Clock();

    const resize = () => {
      const { clientWidth, clientHeight } = heroSection;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, clientWidth < 768 ? 1.15 : 1.55));
      tunnel.position.x = clientWidth < 900 ? 0.8 : 2.3;
      shaderUniforms.uResolution.value.set(clientWidth, clientHeight, 1);
    };

    const updatePointer = (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const writeStreaks = () => {
      streakData.forEach((streak, index) => {
        const offset = index * 6;
        streakPositions[offset] = streak.x;
        streakPositions[offset + 1] = streak.y;
        streakPositions[offset + 2] = streak.z;
        streakPositions[offset + 3] = streak.x;
        streakPositions[offset + 4] = streak.y;
        streakPositions[offset + 5] = streak.z - streak.length;
      });
      streakGeometry.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      if (!running) return;

      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;
      const bootBoost = 1 + Math.max(0, 1 - elapsed / 2.6) * 2.8;
      const scrollSlow = 1 - Math.min(window.scrollY / window.innerHeight, 1) * 0.58;
      const speed = 15.5 * delta * bootBoost * scrollSlow;

      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      camera.position.x = currentX * 1.7;
      camera.position.y = -currentY * 0.9;
      camera.lookAt(currentX * 0.35, -currentY * 0.2, -78);

      tunnel.rotation.z = currentX * 0.045 + Math.sin(elapsed * 0.22) * 0.018;
      tunnel.rotation.x = -currentY * 0.035;
      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uMouse.value.set(currentX, currentY, 0);

      frames.forEach((frame, index) => {
        frame.position.z += speed;
        if (frame.position.z > 18) frame.position.z -= depth;
        frame.rotation.z += delta * (index % 2 === 0 ? 0.035 : -0.025);
        frame.material.opacity = 0.12 + Math.max(0, 1 - Math.abs(frame.position.z - 6) / depth) * 0.42;
      });

      portalRings.forEach((ring, index) => {
        ring.position.z += speed * 0.82;
        if (ring.position.z > 16) ring.position.z -= depth;
        ring.rotation.z += delta * (index % 2 === 0 ? 0.18 : -0.14);
        ring.material.opacity = 0.16 + Math.max(0, 1 - Math.abs(ring.position.z - 4) / depth) * 0.34;
      });

      for (let i = 0; i < particleCount; i += 1) {
        const zIndex = i * 3 + 2;
        particlePositions[zIndex] += speed * (0.7 + (i % 5) * 0.08);
        if (particlePositions[zIndex] > 18) particlePositions[zIndex] -= depth;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      streakData.forEach((streak, index) => {
        streak.z += speed * (1.25 + (index % 4) * 0.18);
        if (streak.z > 18) {
          streak.z -= depth;
          streak.x = (Math.random() - 0.5) * 9.6;
          streak.y = (Math.random() - 0.5) * 5.6;
        }
      });
      writeStreaks();

      renderer.clear();
      renderer.render(shaderScene, shaderCamera);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    resize();
    writeStreaks();
    window.addEventListener("resize", resize, { passive: true });
    if (canHover) window.addEventListener("pointermove", updatePointer, { passive: true });
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) {
        clock.getDelta();
        requestAnimationFrame(animate);
      }
    });

    heroSection.classList.add("webgl-ready");
    requestAnimationFrame(animate);
  } catch (error) {
    console.warn("Hero WebGL fallback:", error);
    heroSection.classList.add("webgl-fallback");
  }
}

if (!prefersReducedMotion) {
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

  if (canHover) {
    tiltNodes.forEach((node) => {
      node.addEventListener("pointermove", (event) => {
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        node.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
        node.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
      });

      node.addEventListener("pointerleave", () => {
        node.style.setProperty("--tilt-x", "0deg");
        node.style.setProperty("--tilt-y", "0deg");
      });
    });
  }
}
