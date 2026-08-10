import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import gsap from "gsap";

export function initSky(canvas: HTMLCanvasElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 768px)").matches;

  /* — Panggung — */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x0d0a14, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 140);
  camera.position.set(0, 0, 26);

  /* — Ribuan bintang dihitung GPU — */
  const COUNT = small ? 1600 : 4200;
  const pos = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const tint = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 55;
    pos[i * 3 + 2] = 8 - Math.random() * 80;
    size[i] = 0.6 + Math.random() * 2.2;
    phase[i] = Math.random() * Math.PI * 2;
    tint[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));

  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: `
      uniform float uPixelRatio;
      attribute float aSize; attribute float aPhase; attribute float aTint;
      varying float vPhase; varying float vTint; varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(aSize * (120.0 / -mv.z), 16.0) * uPixelRatio;
        vPhase = aPhase; vTint = aTint;
        vFade = smoothstep(-85.0, -6.0, mv.z);
      }`,
    fragmentShader: `
      uniform float uTime;
      varying float vPhase; varying float vTint; varying float vFade;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float a = smoothstep(0.5, 0.05, d);
        float tw = 0.72 + 0.28 * sin(uTime * 1.6 + vPhase);
        vec3 ivory = vec3(0.953, 0.918, 0.847);
        vec3 gold  = vec3(0.925, 0.827, 0.631);
        vec3 rose  = vec3(0.851, 0.635, 0.608);
        vec3 col = mix(ivory, vTint < 0.5 ? gold : rose, step(0.75, vTint) * 0.9);
        gl_FragColor = vec4(col, a * tw * vFade * 0.9);
      }`,
  });
  scene.add(new THREE.Points(geo, starMat));

  /* — Tekstur cahaya (dibuat sendiri, tanpa aset) — */
  function makeGlow(): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,244,220,1)");
    g.addColorStop(0.25, "rgba(236,211,161,0.85)");
    g.addColorStop(0.6, "rgba(201,163,106,0.22)");
    g.addColorStop(1, "rgba(201,163,106,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const glow = makeGlow();

  function makeHero(scale: number): THREE.Sprite {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    s.scale.setScalar(scale);
    scene.add(s);
    return s;
  }

  /* — Dua bintang utama — */
  const arka = makeHero(6);
  const laras = makeHero(5);
  if (reduced) {
    arka.position.set(-1.35, 0.25, 2);
    laras.position.set(1.35, -0.2, 2);
  } else {
    arka.position.set(-9, 2.4, -10);
    laras.position.set(9, -2.6, -12);
    gsap.to(arka.position, { x: -1.35, y: 0.25, z: 2, duration: 4.5, ease: "power3.out" });
    gsap.to(laras.position, { x: 1.35, y: -0.2, z: 2, duration: 4.5, delay: 0.3, ease: "power3.out" });
  }

  /* — Bintang jatuh sesekali — */
  const meteor = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })
  );
  meteor.scale.set(0.4, 5, 1);
  meteor.visible = false;
  scene.add(meteor);
  let mLife = -1;
  let nextMeteor = 4;
  const mDir = new THREE.Vector3();

  function spawnMeteor(t: number) {
    meteor.position.set((Math.random() - 0.5) * 50, 14 + Math.random() * 6, -22 - Math.random() * 26);
    mDir.set(-0.55 - Math.random() * 0.3, -0.6 - Math.random() * 0.3, 0).normalize();
    meteor.material.rotation = Math.atan2(mDir.y, mDir.x) - Math.PI / 2;
    meteor.visible = true;
    mLife = 0;
    nextMeteor = t + 6 + Math.random() * 9;
  }

  /* — Bloom sinematik — */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), small ? 0.7 : 0.9, 0.75, 0.12));
  composer.addPass(new OutputPass());

  /* — Paralaks kursor (desktop saja) — */
  const mouse = { x: 0, y: 0 };
  if (!reduced && !small) {
    addEventListener("pointermove", (e) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  /* — Loop dengan jeda otomatis — */
  const clock = new THREE.Clock();
  let t = 0;
  let raf = 0;
  let running = false;
  let firstFrame = true;

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    starMat.uniforms.uTime.value = t;

    // Kamera: hanyut perlahan + paralaks lembut
    camera.position.z = 26 - Math.min(t * 0.15, 9);
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Dua bintang bernapas
    const breath = 1 + Math.sin(t * 1.2) * 0.06;
    arka.scale.setScalar(6 * breath);
    laras.scale.setScalar(5 * (1 + Math.sin(t * 1.2 + 1.4) * 0.06));

    // Bintang jatuh
    if (!reduced) {
      if (mLife < 0 && t > nextMeteor) spawnMeteor(t);
      if (mLife >= 0) {
        mLife += dt;
        meteor.position.addScaledVector(mDir, dt * 24);
        meteor.material.opacity = Math.sin(Math.PI * Math.min(mLife / 1.3, 1)) * 0.85;
        if (mLife > 1.3) { meteor.visible = false; mLife = -1; }
      }
    }

    composer.render();
    if (firstFrame) {
      firstFrame = false;
      canvas.classList.add("ready");
    }
  }

  function start() {
    if (reduced) { composer.render(); canvas.classList.add("ready"); return; }
    if (running) return;
    running = true;
    clock.getDelta();
    frame();
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    starMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });

  start();
}