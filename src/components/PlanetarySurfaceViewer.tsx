import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetId, Language } from '../types';
import { RELICS_DATA } from '../data/relicsData';
import { soundEffects } from '../utils/soundEffects';
import { ArrowLeft, Sun, Moon, Wind, Compass, Radio, MapPin, Sparkles } from 'lucide-react';

interface PlanetarySurfaceViewerProps {
  planet: PlanetId;
  onBackToOrbit: () => void;
  onSelectRelic: (relicId: string) => void;
  language: Language;
}

export default function PlanetarySurfaceViewer({
  planet,
  onBackToOrbit,
  onSelectRelic,
  language,
}: PlanetarySurfaceViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isDustStorm, setIsDustStorm] = useState(false);
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null);

  // Filter relics on this planet
  const planetRelics = Object.values(RELICS_DATA).filter((r) => r.planet === planet);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const isMars = planet === 'mars';

    // Sky / Fog based on planet & environment
    const dayFogColor = isMars ? 0xd06c45 : 0x111625;
    const nightFogColor = 0x050814;
    scene.fog = new THREE.FogExp2(dayFogColor, 0.012);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 14, 38);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(isMars ? 0xffe2b8 : 0xffffff, 2.5);
    sunLight.position.set(30, 45, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(
      isMars ? 0xcc6633 : 0x667799,
      isMars ? 0x662211 : 0x223344,
      0.8
    );
    scene.add(hemiLight);

    // Create 3D undulating terrain surface
    const terrainGeom = new THREE.PlaneGeometry(160, 160, 64, 64);
    terrainGeom.rotateX(-Math.PI / 2);

    // Add crater & dune displacements
    const pos = terrainGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const dist = Math.hypot(vx, vz);
      // Gentle rolling hills and subtle impact crater depressions
      const elevation =
        Math.sin(vx * 0.06) * Math.cos(vz * 0.06) * 2.2 +
        Math.sin(vx * 0.15) * 0.8 -
        Math.exp(-Math.pow(dist - 15, 2) / 40) * 1.5;
      pos.setY(i, elevation);
    }
    terrainGeom.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: isMars ? 0xba431f : 0x88929e,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Decorative Rocks & Boulders scattered
    const rockGeom = new THREE.DodecahedronGeometry(0.8, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMars ? 0x7c2612 : 0x5a636e,
      roughness: 0.9,
    });
    const rockInstanced = new THREE.InstancedMesh(rockGeom, rockMat, 60);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 60; i++) {
      const rx = (Math.random() - 0.5) * 100;
      const rz = (Math.random() - 0.5) * 100;
      dummy.position.set(rx, 0.4, rz);
      dummy.scale.set(
        Math.random() * 1.2 + 0.4,
        Math.random() * 0.8 + 0.3,
        Math.random() * 1.2 + 0.4
      );
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      rockInstanced.setMatrixAt(i, dummy.matrix);
    }
    scene.add(rockInstanced);

    // Relic Location Beacons (Pulsing 3D Holographic Pillars)
    const beaconsGroup = new THREE.Group();
    scene.add(beaconsGroup);

    const beaconPositions = [
      { id: planetRelics[0]?.id || 'opportunity', x: -16, z: -8, color: 0x00f5d4 },
      { id: planetRelics[1]?.id || 'spirit', x: 18, z: -14, color: 0xffb703 },
      { id: planetRelics[2]?.id || 'insight', x: 2, z: -25, color: 0xf72585 },
    ];

    const beaconMeshes: THREE.Mesh[] = [];

    beaconPositions.slice(0, planetRelics.length).forEach((bp) => {
      // Cylinder Light Beam
      const beamGeom = new THREE.CylinderGeometry(0.2, 1.2, 28, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: bp.color,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(bp.x, 14, bp.z);
      beaconsGroup.add(beam);

      // Base Pulsing Radar Ring
      const ringGeom = new THREE.RingGeometry(0.8, 3.2, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: bp.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(bp.x, 0.4, bp.z);
      beaconsGroup.add(ring);

      // Floating Hologram Target Core
      const coreGeom = new THREE.OctahedronGeometry(1.4, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: bp.color,
        emissive: bp.color,
        emissiveIntensity: 0.8,
        wireframe: true,
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      core.position.set(bp.x, 3.8, bp.z);
      core.userData = { relicId: bp.id };
      beaconsGroup.add(core);
      beaconMeshes.push(core);
    });

    // Swirling Dust Storm Particles
    const dustCount = 800;
    const dustGeom = new THREE.BufferGeometry();
    const dustCoords = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustCoords[i] = (Math.random() - 0.5) * 120;
      dustCoords[i + 1] = Math.random() * 25 + 0.2;
      dustCoords[i + 2] = (Math.random() - 0.5) * 120;
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustCoords, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isMars ? 0xe76f51 : 0xd8e2dc,
      size: 0.6,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeom, dustMat);
    scene.add(dustParticles);

    // Raycasting for Beacon clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(beaconMeshes, false);
      if (hits.length > 0) {
        const relicId = hits[0].object.userData.relicId;
        soundEffects.playClick();
        onSelectRelic(relicId);
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Beacon rotations and pulse
      beaconsGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.OctahedronGeometry) {
          child.rotation.y += 0.02;
          child.rotation.x += 0.01;
          child.position.y = 3.8 + Math.sin(elapsedTime * 2 + index) * 0.4;
        }
      });

      // Dust Storm particle motion
      const currentDustOpacity = isDustStorm ? 0.85 : 0.25;
      dustMat.opacity = currentDustOpacity;

      const positions = dustGeom.attributes.position.array as Float32Array;
      const speed = isDustStorm ? 1.6 : 0.2;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += speed * (isDustStorm ? 0.8 : 0.2);
        positions[i + 2] += speed * 0.3;
        if (positions[i] > 60) positions[i] = -60;
        if (positions[i + 2] > 60) positions[i + 2] = -60;
      }
      dustGeom.attributes.position.needsUpdate = true;

      // Day / Night light transition
      if (isNightMode) {
        sunLight.intensity = 0.1;
        hemiLight.intensity = 0.2;
        (scene.fog as THREE.FogExp2).color.setHex(nightFogColor);
      } else {
        sunLight.intensity = isDustStorm ? 1.0 : 2.5;
        hemiLight.intensity = 0.8;
        (scene.fog as THREE.FogExp2).color.setHex(dayFogColor);
      }

      // Gentle camera sway
      camera.position.x = Math.sin(elapsedTime * 0.12) * 4;
      camera.lookAt(0, 3, -12);

      // Check hover for beacon
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(beaconMeshes, false);
      if (hits.length > 0) {
        setSelectedBeacon(hits[0].object.userData.relicId);
      } else {
        setSelectedBeacon(null);
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
      window.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [planet, isNightMode, isDustStorm, onSelectRelic, planetRelics]);

  const toggleDustStorm = () => {
    soundEffects.playClick();
    if (!isDustStorm) {
      soundEffects.playSimulatedMartianWind(6);
    }
    setIsDustStorm(!isDustStorm);
  };

  const toggleDayNight = () => {
    soundEffects.playClick();
    setIsNightMode(!isNightMode);
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#070B19] select-none">
      {/* 3D Surface Terrain Canvas */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-crosshair" />

      {/* Top Left Navigation: Back to Solar System */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBackToOrbit();
          }}
          className="px-3.5 py-2.5 rounded-xl glass-panel hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-2 border border-cyan-400/50 shadow-xl transition-all active:scale-95 text-xs sm:text-sm font-bold font-space"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'সৌরজগতে ফিরে যান' : 'Back to Orbit'}</span>
        </button>

        {/* Planet Status Pill */}
        <div className="glass-panel px-3.5 py-2 rounded-xl border border-slate-700 hidden sm:flex items-center gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-white font-space">
            {planet === 'mars'
              ? language === 'bn'
                ? 'মঙ্গল গ্রহ • মেরিডিয়ানি ও গুসেভ'
                : 'Mars • Meridiani & Gusev Plains'
              : language === 'bn'
              ? 'চাঁদ • মারে ট্রাঙ্কুইলিটাটিস'
              : 'The Moon • Sea of Tranquility'}
          </span>
        </div>
      </div>

      {/* Top Right: Dynamic Space Weather & Day/Night Simulator Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        {/* Day / Night Toggle */}
        <button
          onClick={toggleDayNight}
          title={isNightMode ? 'Switch to Sol Day' : 'Switch to Sol Night'}
          className={`p-2.5 rounded-xl glass-panel border transition-all ${
            isNightMode
              ? 'border-indigo-400 text-indigo-300 bg-indigo-950/60 shadow-lg shadow-indigo-500/30'
              : 'border-amber-400 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Dust Storm Simulator Toggle */}
        <button
          onClick={toggleDustStorm}
          title={isDustStorm ? 'Clear Dust Storm' : 'Simulate Martian Dust Storm'}
          className={`px-3 py-2 rounded-xl glass-panel border transition-all flex items-center gap-1.5 text-xs font-bold ${
            isDustStorm
              ? 'border-rose-500 text-rose-300 bg-rose-950/70 shadow-lg shadow-rose-500/40 animate-pulse'
              : 'border-slate-700 text-slate-300 hover:border-cyan-400'
          }`}
        >
          <Wind className={`w-3.5 h-3.5 ${isDustStorm ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isDustStorm
              ? language === 'bn'
                ? 'ধূলিঝড় চলছে!'
                : 'Dust Storm Active!'
              : language === 'bn'
              ? 'ধূলিঝড় সিমুলেট'
              : 'Dust Storm'}
          </span>
        </button>
      </div>

      {/* Floating Hover Indicator for 3D Beacons */}
      {selectedBeacon && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none transition-all">
          <div className="glass-panel px-5 py-2.5 rounded-2xl border-2 border-cyan-400 shadow-2xl flex items-center gap-3 animate-bounce">
            <Radio className="w-4 h-4 text-cyan-400 animate-ping" />
            <div>
              <div className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
                {language === 'bn' ? 'রেডিও বীকন শনাক্ত' : 'Telemetry Beacon Locked'}
              </div>
              <div className="text-sm font-extrabold text-white font-space">
                {RELICS_DATA[selectedBeacon]?.[language === 'bn' ? 'nameBn' : 'name']}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Relic Cards Deck (Children can tap cards or click 3D beams) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-2xl">
        <div className="text-center text-xs font-mono text-cyan-300 mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {language === 'bn'
              ? 'নিচের কার্ডে বা ৩D আলোর পিলারে ক্লিক করে রোভারের কাছে যান'
              : 'Click any relic card or 3D beacon pillar to approach'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {planetRelics.map((relic) => (
            <button
              key={relic.id}
              onClick={() => {
                soundEffects.playClick();
                onSelectRelic(relic.id);
              }}
              className="p-3 rounded-2xl glass-panel hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-left transition-all group shadow-xl active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{relic.badgeIcon}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {relic.planet === 'mars' ? 'MARS' : 'MOON'}
                </span>
              </div>
              <div>
                <div className="font-extrabold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {language === 'bn' ? relic.nameBn : relic.name}
                </div>
                <div className="text-[10px] text-slate-300 line-clamp-1">
                  {relic.coordinates}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{language === 'bn' ? 'জাগিয়ে তুলুন →' : 'Awaken Relic →'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
