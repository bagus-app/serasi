import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import gsap from "gsap";
import { buildMemories, buildMonogram, type MemoryData } from "./mapper";

export interface SkyConfig {
  memories: MemoryData[];
  monogram: string;
}

export interface SkyHandle {
  setProgress(p: number): void;
  spawnWishStar(): void;
  restoreWish(n: number): void;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

export function initSky(canvas: HTMLCanvasElement, config: SkyConfig): SkyHandle {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 768px)").matches;

  /* ============ PANGGUNG ============ */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x0d0a14, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 160);
  camera.position.set(0, 0, 26);

  /* ============ MEDAN BINTANG (GPU) ============ */
  const COUNT = small ? 1600 : 4200;
  const pos = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const tint = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 55;
    pos[i * 3 + 2] = 8 - Math.random() * 110;
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
        vFade = smoothstep(-100.0, -6.0, mv.z);
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

  /* ============ TEKSTUR CAHAYA ============ */
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

  /* ============ DUA BINTANG UTAMA ============ */
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

  /* ============ RASI DARI CONFIG ============ */
  const cons = buildMemories(config.memories, glow, small);
  cons.forEach((c) => scene.add(c.group));

  /* ============ MONOGRAM DARI CONFIG ============ */
  const mono = buildMonogram(config.monogram, glow);
  scene.add(mono.group);

  /* ============ BINTANG DOA ============ */
  function placeWish(nearCamera: boolean): THREE.Sprite {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: Math.random() < 0.5 ? 0xf3d9c4 : 0xecd3a1,
        opacity: nearCamera ? 0 : 0.85,
      })
    );
    s.scale.setScalar(0.001);
    if (nearCamera) {
      s.position.set(
        camera.position.x + (Math.random() - 0.5) * 9,
        camera.position.y + (Math.random() - 0.5) * 5,
        camera.position.z - 12 - Math.random() * 10
      );
    } else {
      s.position.set(
        (Math.random() - 0.5) * 34,
        (Math.random() - 0.5) * 18,
        -14 - Math.random() * 62
      );
    }
    scene.add(s);
    return s;
  }

  /* ============ JALUR KAMERA ============ */
  const camPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 26),
    new THREE.Vector3(0, 0.5, 12),
    new THREE.Vector3(-0.4, 0.2, 0),
    new THREE.Vector3(0.6, 0, -16),
    new THREE.Vector3(-0.6, 0.3, -34),
    new THREE.Vector3(0.5, 0, -52),
    new THREE.Vector3(0, 0.5, -70),
    new THREE.Vector3(0, 0.8, -84),
  ]);
  const lookPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 8),
    new THREE.Vector3(1.9, 0.2, -8),
    new THREE.Vector3(-1.9, 0, -26),
    new THREE.Vector3(1.9, 0.2, -44),
    new THREE.Vector3(-1.9, 0, -62),
    new THREE.Vector3(0, 0.6, -92),
  ]);

  /* ============ BINTANG JATUH ============ */
  const meteor = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    })
  );
  meteor.scale.set(0.4, 5, 1);
  meteor.visible = false;
  scene.add(meteor);
  let mLife = -1;
  let nextMeteor = 4;
  const mDir = new THREE.Vector3();

  function spawnMeteor(t: number) {
    meteor.position.set(
      camera.position.x + (Math.random() - 0.5) * 46,
      camera.position.y + 12 + Math.random() * 6,
      camera.position.z - 18 - Math.random() * 24
    );
    mDir.set(-0.55 - Math.random() * 0.3, -0.6 - Math.random() * 0.3, 0).normalize();
    meteor.material.rotation = Math.atan2(mDir.y, mDir.x) - Math.PI / 2;
    meteor.visible = true;
    mLife = 0;
    nextMeteor = t + 6 + Math.random() * 9;
  }

  /* ============ CAKRAWALA ============ */
  const horizon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.4,
      color: 0xe8c894,
    })
  );
  horizon.position.set(0, -7, -96);
  horizon.scale.set(90, 34, 1);
  scene.add(horizon);

  /* ============ BLOOM ============ */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), small ? 0.7 : 0.9, 0.75, 0.12)
  );
  composer.addPass(new OutputPass());

  /* ============ PARALAKS ============ */
  const mouse = { x: 0, y: 0 };
  let px = 0, py = 0;
  if (!small) {
    addEventListener(
      "pointermove",
      (e) => {
        mouse.x = (e.clientX / innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  /* ============ LOOP ============ */
  const clock = new THREE.Clock();
  let t = 0, raf = 0, running = false, firstFrame = true;
  let targetP = 0, p = 0;

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    starMat.uniforms.uTime.value = t;

    p += (targetP - p) * 0.06;
    camera.position.copy(camPath.getPoint(p));
    px += (mouse.x * 1.1 - px) * 0.02;
    py += (-mouse.y * 0.7 - py) * 0.02;
    camera.position.x += px;
    camera.position.y += py;
    camera.lookAt(lookPath.getPoint(Math.min(p + 0.045, 1)));

    const hFade = 1 - smooth(0.03, 0.14, p);
    (arka.material as THREE.SpriteMaterial).opacity = hFade;
    (laras.material as THREE.SpriteMaterial).opacity = hFade;
    arka.scale.setScalar(6 * (1 + Math.sin(t * 1.2) * 0.06));
    laras.scale.setScalar(5 * (1 + Math.sin(t * 1.2 + 1.4) * 0.06));

    const camZ = camera.position.z;
    for (const c of cons) {
      const z = c.def.pos[2];
      const draw = 1 - smooth(z + 10, z + 24, camZ);
      const vis = draw * smooth(z - 14, z - 2, camZ);
      c.line.geometry.setDrawRange(0, Math.floor((draw * c.verts) / 2) * 2);
      c.lineMat.opacity = vis * 0.9;
      c.starsMat.opacity = vis;
    }

    mono.mat.opacity = smooth(0.8, 0.93, p) * 0.95;

    if (mLife < 0 && t > nextMeteor) spawnMeteor(t);
    if (mLife >= 0) {
      mLife += dt;
      meteor.position.addScaledVector(mDir, dt * 24);
      meteor.material.opacity = Math.sin(Math.PI * Math.min(mLife / 1.3, 1)) * 0.85;
      if (mLife > 1.3) {
        meteor.visible = false;
        mLife = -1;
      }
    }

    horizon.material.opacity = 0.34 + Math.sin(t * 0.5) * 0.08;

    composer.render();
    if (firstFrame) {
      firstFrame = false;
      canvas.classList.add("ready");
    }
  }

  function start() {
    if (running) return;
    running = true;
    clock.getDelta();
    frame();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    starMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });

  /* ============ EVENT LISTENERS (komunikasi dengan halaman) ============ */

  addEventListener("sky:progress", ((e: CustomEvent<number>) => {
    targetP = clamp01(e.detail);
  }) as EventListener);

  addEventListener("sky:spawnWish", () => {
    const s = placeWish(true);
    if (!reduced) {
      gsap.to(s.material, { opacity: 0.95, duration: 0.5 });
      gsap.to(s.scale, { x: 2.2, y: 2.2, duration: 1.6, ease: "back.out(2.5)" });
    } else {
      s.scale.setScalar(2);
      (s.material as THREE.SpriteMaterial).opacity = 0.9;
      composer.render();
    }
  });

  addEventListener("sky:restoreWish", ((e: CustomEvent<number>) => {
    const count = e.detail;
    for (let i = 0; i < count; i++) placeWish(false);
    if (reduced) composer.render();
  }) as EventListener);

  /* ============ REDUCED MODE ============ */
  if (reduced) {
    composer.render();
    canvas.classList.add("ready");
    return {
      setProgress: () => {},
      spawnWishStar: () => {
        const s = placeWish(true);
        s.scale.setScalar(2);
        (s.material as THREE.SpriteMaterial).opacity = 0.9;
        composer.render();
      },
      restoreWish: (n) => {
        for (let i = 0; i < n; i++) placeWish(false);
        composer.render();
      },
    };
  }

  start();
  return {
    setProgress: (v) => { targetP = clamp01(v); },
    spawnWishStar: () => {
      const s = placeWish(true);
      gsap.to(s.material, { opacity: 0.95, duration: 0.5 });
      gsap.to(s.scale, { x: 2.2, y: 2.2, duration: 1.6, ease: "back.out(2.5)" });
    },
    restoreWish: (n) => {
      for (let i = 0; i < n; i++) placeWish(false);
    },
  };
}