"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const { PI, sin, cos } = Math;
const TAU = 2 * PI;

const map = (value: number, sMin: number, sMax: number, dMin: number, dMax: number) => {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
};

const range = (n: number, m = 0) =>
  Array(n)
    .fill(m)
    .map((i, j) => i + j);

const rand = (max: number, min = 0) => min + Math.random() * (max - min);
const randInt = (max: number, min = 0) => Math.floor(min + Math.random() * (max - min));
const randChoice = <T,>(arr: T[]): T => arr[randInt(arr.length)];
const polar = (ang: number, r = 1): [number, number] => [r * cos(ang), r * sin(ang)];

interface ThreeBackgroundProps {
  musicUrl?: string;
  autoPlay?: boolean;
  musicEnabled?: boolean;
}

// Global reference to stop music from anywhere
declare global {
  interface Window {
    stopSecretSantaMusic?: () => void;
    secretSantaAudio?: HTMLAudioElement;
  }
}

// Single global HTML5 Audio element - persists across component mounts/unmounts
let globalAudio: HTMLAudioElement | null = null;
let globalAudioContext: AudioContext | null = null;
let globalAnalyserNode: AnalyserNode | null = null;
let globalSourceNode: MediaElementAudioSourceNode | null = null;

function getGlobalAudio(musicUrl: string): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio(musicUrl);
    globalAudio.loop = true;
    globalAudio.volume = 0.5;
    window.secretSantaAudio = globalAudio;
  }
  return globalAudio;
}

function getGlobalAnalyser(audio: HTMLAudioElement, fftSize: number): AnalyserNode | null {
  if (!globalAudioContext) {
    globalAudioContext = new AudioContext();
  }
  if (!globalSourceNode) {
    globalSourceNode = globalAudioContext.createMediaElementSource(audio);
  }
  if (!globalAnalyserNode) {
    globalAnalyserNode = globalAudioContext.createAnalyser();
    globalAnalyserNode.fftSize = fftSize;
    globalSourceNode.connect(globalAnalyserNode);
    globalAnalyserNode.connect(globalAudioContext.destination);
  }
  return globalAnalyserNode;
}

// Global stop function - simple and reliable
window.stopSecretSantaMusic = () => {
  console.log("stopSecretSantaMusic called");
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    console.log("Audio stopped and reset");
  }
};

export default function ThreeBackground({
  musicUrl = "/sounds/christmas-music.mp3",
  autoPlay = true,
  musicEnabled = true
}: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const animationIdRef = useRef<number>(0);
  const analyserDataRef = useRef<Uint8Array | null>(null);
  const musicEnabledRef = useRef(musicEnabled);
  const uniformsRef = useRef({
    time: { value: 0.0 },
    step: { value: 0.0 },
    tAudioData: { value: null as THREE.DataTexture | null },
  });
  const stepRef = useRef(0);

  const fftSize = 2048;
  const totalPoints = 4000;

  const addTree = useCallback((scene: THREE.Scene, uniforms: typeof uniformsRef.current, treePosition: [number, number, number]) => {
    const vertexShader = `
      attribute float mIndex;
      varying vec3 vColor;
      varying float opacity;
      uniform sampler2D tAudioData;

      float norm(float value, float min, float max) {
        return (value - min) / (max - min);
      }
      float lerp(float norm, float min, float max) {
        return (max - min) * norm + min;
      }
      float map(float value, float sourceMin, float sourceMax, float destMin, float destMax) {
        return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
      }

      void main() {
        vColor = color;
        vec3 p = position;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        float amplitude = texture2D(tAudioData, vec2(mIndex, 0.1)).r;
        float amplitudeClamped = clamp(amplitude - 0.4, 0.0, 0.6);
        float sizeMapped = map(amplitudeClamped, 0.0, 0.6, 1.0, 20.0);
        opacity = map(mvPosition.z, -200.0, 15.0, 0.0, 1.0);
        gl_PointSize = sizeMapped * (100.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float opacity;
      uniform sampler2D pointTexture;
      void main() {
        gl_FragColor = vec4(vColor, opacity);
        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
      }
    `;

    const textureLoader = new THREE.TextureLoader();
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        pointTexture: {
          value: textureLoader.load("https://assets.codepen.io/3685267/spark1.png"),
        },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const mIndexs: number[] = [];

    const color = new THREE.Color();

    for (let i = 0; i < totalPoints; i++) {
      const t = Math.random();
      const y = map(t, 0, 1, -8, 10);
      const ang = map(t, 0, 1, 0, 6 * TAU) + (TAU / 2) * (i % 2);
      const [z, x] = polar(ang, map(t, 0, 1, 5, 0));

      const modifier = map(t, 0, 1, 1, 0);
      positions.push(x + rand(-0.3 * modifier, 0.3 * modifier));
      positions.push(y + rand(-0.3 * modifier, 0.3 * modifier));
      positions.push(z + rand(-0.3 * modifier, 0.3 * modifier));

      color.setHSL(map(i, 0, totalPoints, 1.0, 0.0), 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
      sizes.push(1);
      const mIndex = map(i, 0, totalPoints, 1.0, 0.0);
      mIndexs.push(mIndex);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("mIndex", new THREE.Float32BufferAttribute(mIndexs, 1));

    const tree = new THREE.Points(geometry, shaderMaterial);
    const [px, py, pz] = treePosition;
    tree.position.set(px, py, pz);
    scene.add(tree);
  }, [totalPoints]);

  const addSnow = useCallback((scene: THREE.Scene, uniforms: typeof uniformsRef.current) => {
    const vertexShader = `
      attribute float size;
      attribute float phase;
      attribute float phaseSecondary;
      varying vec3 vColor;
      varying float opacity;
      uniform float time;
      uniform float step;

      float norm(float value, float min, float max) {
        return (value - min) / (max - min);
      }
      float lerp(float norm, float min, float max) {
        return (max - min) * norm + min;
      }
      float map(float value, float sourceMin, float sourceMax, float destMin, float destMax) {
        return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
      }

      void main() {
        float t = time * 0.0006;
        vColor = color;
        vec3 p = position;
        p.y = map(mod(phase + step, 1000.0), 0.0, 1000.0, 25.0, -8.0);
        p.x += sin(t + phase);
        p.z += sin(t + phaseSecondary);
        opacity = map(p.z, -150.0, 15.0, 0.0, 1.0);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = size * (100.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      varying float opacity;
      void main() {
        gl_FragColor = vec4(vColor, opacity);
        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
      }
    `;

    const createSnowSet = (sprite: string) => {
      const snowPoints = 300;
      const textureLoader = new THREE.TextureLoader();
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          ...uniforms,
          pointTexture: { value: textureLoader.load(sprite) },
        },
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true,
      });

      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const colors: number[] = [];
      const sizes: number[] = [];
      const phases: number[] = [];
      const phaseSecondaries: number[] = [];

      const color = new THREE.Color();

      for (let i = 0; i < snowPoints; i++) {
        positions.push(rand(25, -25), 0, rand(15, -150));
        color.set(randChoice(["#f1d4d4", "#f1f6f9", "#eeeeee", "#f1f1e8"]));
        colors.push(color.r, color.g, color.b);
        phases.push(rand(1000));
        phaseSecondaries.push(rand(1000));
        sizes.push(rand(4, 2));
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
      geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
      geometry.setAttribute("phaseSecondary", new THREE.Float32BufferAttribute(phaseSecondaries, 1));

      const mesh = new THREE.Points(geometry, shaderMaterial);
      scene.add(mesh);
    };

    const sprites = [
      "https://assets.codepen.io/3685267/snowflake1.png",
      "https://assets.codepen.io/3685267/snowflake2.png",
      "https://assets.codepen.io/3685267/snowflake3.png",
      "https://assets.codepen.io/3685267/snowflake4.png",
      "https://assets.codepen.io/3685267/snowflake5.png",
    ];
    sprites.forEach(createSnowSet);
  }, []);

  const addPlane = useCallback((scene: THREE.Scene, uniforms: typeof uniformsRef.current, planePoints: number) => {
    const vertexShader = `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
      }
    `;

    const textureLoader = new THREE.TextureLoader();
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        pointTexture: { value: textureLoader.load("https://assets.codepen.io/3685267/spark1.png") },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    const color = new THREE.Color();

    for (let i = 0; i < planePoints; i++) {
      positions.push(rand(-25, 25), 0, rand(-150, 15));
      color.set(randChoice(["#93abd3", "#f2f4c0", "#9ddfd3"]));
      colors.push(color.r, color.g, color.b);
      sizes.push(1);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("customColor", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const plane = new THREE.Points(geometry, shaderMaterial);
    plane.position.y = -8;
    scene.add(plane);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Setup global HTML5 audio (persists across mounts)
    const audio = getGlobalAudio(musicUrl);

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(-0.09397456774197047, -2.5597086635726947, 24.420789670889008);
    camera.rotation.set(0.10443543723052419, -0.003827152981119352, 0.0004011488708739715);

    // Create empty audio data texture initially
    const emptyData = new Uint8Array(fftSize / 2);
    const format = THREE.RedFormat;
    uniformsRef.current.tAudioData.value = new THREE.DataTexture(emptyData, fftSize / 2, 1, format);

    // Setup Web Audio API analyser for visualization (reuse global)
    let analyser: AnalyserNode | null = null;
    try {
      analyser = getGlobalAnalyser(audio, fftSize);
      if (analyser) {
        analyserDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        // Update texture with analyser data
        uniformsRef.current.tAudioData.value = new THREE.DataTexture(
          analyserDataRef.current,
          fftSize / 2,
          1,
          format
        );
      }
    } catch (e) {
      console.log("Could not setup audio analyser:", e);
    }

    // Add scene elements
    addPlane(scene, uniformsRef.current, 3000);
    addSnow(scene, uniformsRef.current);

    range(10).forEach((i) => {
      addTree(scene, uniformsRef.current, [20, 0, -20 * i]);
      addTree(scene, uniformsRef.current, [-20, 0, -20 * i]);
    });

    // Setup bloom
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.9;
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Play audio if enabled (handles autoplay restrictions)
    if (autoPlay && musicEnabledRef.current && audio.paused) {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.log("Audio autoplay blocked, waiting for user interaction:", error);
          const startAudio = () => {
            if (musicEnabledRef.current && audio.paused) {
              audio.play();
            }
            document.removeEventListener("click", startAudio);
          };
          document.addEventListener("click", startAudio);
        });
      }
    }

    // Animation loop
    const animate = (time: number) => {
      // Update audio visualization data
      if (analyser && analyserDataRef.current) {
        analyser.getByteFrequencyData(analyserDataRef.current as Uint8Array<ArrayBuffer>);
        if (uniformsRef.current.tAudioData.value) {
          uniformsRef.current.tAudioData.value.needsUpdate = true;
        }
      }

      stepRef.current = (stepRef.current + 1) % 1000;
      uniformsRef.current.time.value = time;
      uniformsRef.current.step.value = stepRef.current;

      composer.render();
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup - only cleanup THREE.js resources, NOT the global audio
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationIdRef.current);

      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }

      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [musicUrl, autoPlay, addTree, addSnow, addPlane, fftSize]);

  // Control music based on musicEnabled prop
  useEffect(() => {
    musicEnabledRef.current = musicEnabled;

    if (globalAudio) {
      if (musicEnabled) {
        // Play audio if paused
        if (globalAudio.paused) {
          globalAudio.play().catch(() => {});
        }
      } else {
        // Pause audio
        globalAudio.pause();
      }
    }
  }, [musicEnabled]);

  return <div ref={containerRef} className="fixed inset-0 z-0" />;
}
