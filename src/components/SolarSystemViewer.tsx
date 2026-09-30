import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetId, Language } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { Compass, RotateCw, ZoomIn, Info } from 'lucide-react';

interface SolarSystemViewerProps {
  onSelectPlanet: (planet: PlanetId) => void;
  language: Language;
}

export default function SolarSystemViewer({ onSelectPlanet, language }: SolarSystemViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | 'earth' | null>(null);
  const [isDiving, setIsDiving] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Three.js setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b19, 0.0015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    camera.position.set(0, 45, 110);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x223344, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff7d6, 3.5, 800, 0.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Helpers to create realistic procedural textures without needing external image loading
    const createSunTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 512, 256);
      grad.addColorStop(0, '#FFD166');
      grad.addColorStop(0.3, '#FF8500');
      grad.addColorStop(0.7, '#FF4800');
      grad.addColorStop(1, '#FFB703');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Solar flares & granulation
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 200, 0.4)' : 'rgba(200, 50, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 7 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createEarthTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Deep Ocean Blue
      ctx.fillStyle = '#0d2b45';
      ctx.fillRect(0, 0, 1024, 512);

      // Continents procedural patches
      ctx.fillStyle = '#208b3a';
      for (let i = 0; i < 45; i++) {
        ctx.beginPath();
        const cx = Math.random() * 1024;
        const cy = Math.random() * 512;
        const r = Math.random() * 85 + 25;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Desert sand patches
      ctx.fillStyle = '#d4a373';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 40 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polar Ice Caps
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, 1024, 40);
      ctx.fillRect(0, 472, 1024, 40);

      return new THREE.CanvasTexture(canvas);
    };

    const createMoonTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(0, 0, 512, 256);

      // Maria dark basalt plains
      ctx.fillStyle = '#5c677d';
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 45 + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      // Craters
      ctx.fillStyle = '#ced4da';
      for (let i = 0; i < 150; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 5 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const createMarsTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Rust Red Base
      ctx.fillStyle = '#c1440e';
      ctx.fillRect(0, 0, 1024, 512);

      // Dark basalt regions (Syrtis Major, Acidalia Planitia)
      ctx.fillStyle = '#7a2810';
      for (let i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 65 + 20, 0, Math.PI * 2);
        ctx.fill();
      }
      // Bright orange dunes
      ctx.fillStyle = '#e76f51';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 50 + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polar Ice caps
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 25);
      ctx.fillRect(0, 487, 1024, 25);

      return new THREE.CanvasTexture(canvas);
    };

    // 1. Central Sun
    const sunGeom = new THREE.SphereGeometry(12, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      map: createSunTexture(),
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunMesh);

    // Sun Glow Corona
    const coronaGeom = new THREE.SphereGeometry(14.5, 32, 32);
    const coronaMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(1.0, 0.7, 0.2, 1.0) * intensity * 1.5;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    scene.add(coronaMesh);

    // 2. Earth System Pivot
    const earthOrbitRadius = 45;
    const earthPivot = new THREE.Group();
    scene.add(earthPivot);

    const earthGeom = new THREE.SphereGeometry(4.2, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.position.x = earthOrbitRadius;
    earthMesh.userData = { id: 'earth', name: 'Earth' };
    earthPivot.add(earthMesh);

    // Earth Clouds Layer
    const cloudsGeom = new THREE.SphereGeometry(4.35, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeom, cloudsMat);
    earthMesh.add(cloudsMesh);

    // 3. Moon orbiting Earth
    const moonOrbitRadius = 9;
    const moonPivot = new THREE.Group();
    earthMesh.add(moonPivot);

    const moonGeom = new THREE.SphereGeometry(1.4, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: createMoonTexture(),
      roughness: 0.9,
    });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.position.x = moonOrbitRadius;
    moonMesh.userData = { id: 'moon', name: 'The Moon' };
    moonPivot.add(moonMesh);

    // 4. Mars System Pivot
    const marsOrbitRadius = 72;
    const marsPivot = new THREE.Group();
    scene.add(marsPivot);

    const marsGeom = new THREE.SphereGeometry(3.2, 48, 48);
    const marsMat = new THREE.MeshStandardMaterial({
      map: createMarsTexture(),
      roughness: 0.75,
      metalness: 0.15,
    });
    const marsMesh = new THREE.Mesh(marsGeom, marsMat);
    marsMesh.position.x = marsOrbitRadius;
    marsMesh.userData = { id: 'mars', name: 'Mars' };
    marsPivot.add(marsMesh);

    // Orbit Path Rings
    const createOrbitLine = (radius: number, color = 0x00f5d4) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(120);
      const geom = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
      });
      return new THREE.Line(geom, mat);
    };

    scene.add(createOrbitLine(earthOrbitRadius, 0x38bdf8));
    scene.add(createOrbitLine(marsOrbitRadius, 0xff6b4a));

    // Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0.3;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        targetRotationX = Math.max(-0.4, Math.min(1.2, targetRotationX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Camera dive target animation
    let diveTarget: THREE.Vector3 | null = null;
    let selectedPlanetId: PlanetId | null = null;

    const executeDive = (planetId: PlanetId) => {
      soundEffects.playWarp();
      setIsDiving(true);
      selectedPlanetId = planetId;

      const targetMesh = planetId === 'moon' ? moonMesh : marsMesh;
      const worldPos = new THREE.Vector3();
      targetMesh.getWorldPosition(worldPos);

      diveTarget = worldPos;
    };

    const onClick = () => {
      if (isDiving) return;
      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects([moonMesh, marsMesh, earthMesh], false);
      if (intersects.length > 0) {
        const clicked = intersects[0].object.userData.id;
        if (clicked === 'moon' || clicked === 'mars') {
          executeDive(clicked as PlanetId);
        } else if (clicked === 'earth') {
          // If Earth clicked, divert toward Moon
          executeDive('moon');
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Touch support for mobile/tablet
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        targetRotationY += deltaX * 0.006;
        targetRotationX += deltaY * 0.006;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slow planetary revolutions & self-rotations
      sunMesh.rotation.y += 0.002;
      earthMesh.rotation.y += 0.01;
      cloudsMesh.rotation.y += 0.013;
      moonMesh.rotation.y += 0.008;
      marsMesh.rotation.y += 0.009;

      if (!isDiving) {
        earthPivot.rotation.y += 0.003;
        moonPivot.rotation.y += 0.015;
        marsPivot.rotation.y += 0.0022;

        // Camera gentle orbit or user rotation
        camera.position.x = Math.sin(targetRotationY) * 110 * Math.cos(targetRotationX);
        camera.position.z = Math.cos(targetRotationY) * 110 * Math.cos(targetRotationX);
        camera.position.y = 45 + Math.sin(targetRotationX) * 50;
        camera.lookAt(0, 0, 0);

        // Raycasting for hover tooltip
        raycaster.setFromCamera(mousePos, camera);
        const hits = raycaster.intersectObjects([moonMesh, marsMesh, earthMesh], false);
        if (hits.length > 0) {
          const hitId = hits[0].object.userData.id;
          setHoveredPlanet(hitId);
        } else {
          setHoveredPlanet(null);
        }
      } else if (diveTarget && selectedPlanetId) {
        // Dramatic Dive camera interpolation
        const currentTargetPos = new THREE.Vector3();
        const mesh = selectedPlanetId === 'moon' ? moonMesh : marsMesh;
        mesh.getWorldPosition(currentTargetPos);

        camera.position.lerp(
          new THREE.Vector3(
            currentTargetPos.x + 4,
            currentTargetPos.y + 2,
            currentTargetPos.z + 8
          ),
          0.04
        );
        camera.lookAt(currentTargetPos);

        const dist = camera.position.distanceTo(currentTargetPos);
        if (dist < 10) {
          onSelectPlanet(selectedPlanetId);
          return;
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectPlanet]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#070B19] select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top HUD info */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-none">
        <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border border-cyan-400/40 shadow-xl">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
              {language === 'bn' ? 'সৌরজগত রাডার • সক্রিয়' : 'Interplanetary Radar • Live'}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white font-space">
              {language === 'bn' ? 'চাঁদ ও মঙ্গল পরিদর্শন করুন' : 'Explore the Moon & Mars'}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Dive overlay banner */}
      {isDiving && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-cyan-950/30 backdrop-blur-[2px] pointer-events-none animate-pulse">
          <div className="text-cyan-300 font-mono text-sm tracking-widest uppercase mb-2">
            {language === 'bn' ? 'হাইপারড্রাইভ অ্যাক্টিভেটেড...' : 'Orbital Insertion Thrusters Firing...'}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-wider font-space">
            {language === 'bn' ? 'গ্রহের ভূখণ্ডে নামছি...' : 'Diving to Archaeological Site...'}
          </div>
        </div>
      )}

      {/* Hover Info Tooltip when aiming at a celestial body */}
      {hoveredPlanet && !isDiving && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none transition-all">
          <div className="glass-panel px-5 py-2.5 rounded-full border border-amber-400/50 shadow-2xl flex items-center gap-2.5 animate-bounce">
            <span className="text-lg">
              {hoveredPlanet === 'mars' ? '🔴' : hoveredPlanet === 'moon' ? '🌕' : '🌍'}
            </span>
            <span className="text-sm font-bold text-white font-space">
              {hoveredPlanet === 'mars'
                ? language === 'bn'
                  ? 'মঙ্গল গ্রহ: অপরচুনিটি ও ইনসাইট রোভার'
                  : 'Mars: Opportunity, Spirit & InSight'
                : hoveredPlanet === 'moon'
                ? language === 'bn'
                  ? 'চাঁদ: অ্যাপোলো ১১ "ঈগল" ল্যান্ডার'
                  : 'The Moon: Apollo 11 Lunar Module'
                : language === 'bn'
                ? 'পৃথিবী: আমাদের নীল বাড়ি'
                : 'Earth: Our Home Planet'}
            </span>
            <span className="text-xs text-cyan-300 font-mono tracking-wider ml-1">
              [ {language === 'bn' ? 'ক্লিক করে নামুন' : 'Click to Dive'} ]
            </span>
          </div>
        </div>
      )}

      {/* Bottom Mission Navigation Controls (Mobile & Desktop friendly!) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 w-11/12 max-w-lg">
        {/* Moon Destination Card */}
        <button
          onClick={() => onSelectPlanet('moon')}
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-2xl glass-panel hover:bg-slate-800/80 border-2 border-slate-400/40 hover:border-cyan-400 text-left transition-all group shadow-xl active:scale-95"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">🌕</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              1969
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
            {language === 'bn' ? 'চাঁদ এক্সপ্লোর' : 'Explore Moon'}
          </div>
          <div className="text-[11px] text-slate-300">
            {language === 'bn' ? 'অ্যাপোলো ১১ ও সার্ভেয়ার' : 'Apollo 11 & Surveyor'}
          </div>
        </button>

        {/* Mars Destination Card */}
        <button
          onClick={() => onSelectPlanet('mars')}
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-2xl glass-panel-warm hover:bg-red-950/70 border-2 border-amber-500/40 hover:border-amber-400 text-left transition-all group shadow-xl active:scale-95"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">🔴</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              MER & InSight
            </span>
          </div>
          <div className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
            {language === 'bn' ? 'মঙ্গল এক্সপ্লোর' : 'Explore Mars'}
          </div>
          <div className="text-[11px] text-slate-300">
            {language === 'bn' ? 'অপরচুনিটি, স্পিরিট ও ইনসাইট' : 'Opportunity, Spirit, InSight'}
          </div>
        </button>
      </div>

      {/* Control Tips badge */}
      <div className="hidden sm:flex absolute bottom-6 right-6 z-20 items-center gap-2 text-xs font-mono text-slate-400 glass-card px-3 py-1.5 rounded-lg border border-slate-700">
        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
        <span>{language === 'bn' ? 'ঘোরাতে মাউস টানুন' : 'Drag to Orbit'}</span>
      </div>
    </div>
  );
}
