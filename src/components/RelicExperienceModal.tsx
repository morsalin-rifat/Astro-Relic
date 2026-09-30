import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { RelicData, RelicComponent, Language, ChatMessage } from '../types';
import { soundEffects } from '../utils/soundEffects';
import {
  X,
  Sparkles,
  Layers,
  Radio,
  Volume2,
  VolumeX,
  Send,
  Camera,
  Heart,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  RefreshCw,
  Play,
  Pause,
  Award,
} from 'lucide-react';

interface RelicExperienceProps {
  relic: RelicData;
  onClose: () => void;
  onUnlockStamp: (relicId: string) => void;
  hasUnlockedStamp: boolean;
  language: Language;
}

export default function RelicExperienceModal({
  relic,
  onClose,
  onUnlockStamp,
  hasUnlockedStamp,
  language,
}: RelicExperienceProps) {
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [activeTab, setActiveTab] = useState<'3d' | 'story' | 'chat' | 'gallery'>('3d');
  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = useState<RelicComponent | null>(null);

  // Dust wipe state
  const [dustPercentage, setDustPercentage] = useState<number>(0);
  const [isAwakened, setIsAwakened] = useState<boolean>(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isNarratorSpeaking, setIsNarratorSpeaking] = useState<boolean>(false);

  // Initialize initial welcome message in chat
  useEffect(() => {
    const initialGreeting =
      language === 'bn'
        ? `হ্যালো ছোট্ট বন্ধু! আমি ${relic.nameBn}। তুমি আমার সোলার প্যানেলের ধুলো মুছে দিয়ে আমাকে আবার মনে করিয়ে দিয়েছ! তুমি আমার সম্পর্কে কী জানতে চাও?`
        : `Hello young explorer! I am ${relic.name}. Thank you for brushing off the dust of decades! What would you like to ask me about my cosmic journey?`;

    setMessages([
      {
        id: 'msg-init',
        role: 'relic',
        text: initialGreeting,
        timestamp: Date.now(),
      },
    ]);
  }, [relic, language]);

  // 1. Interactive Dust Canvas Setup
  useEffect(() => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    // Fill with thick Martian reddish dust or Lunar gray dust
    const dustColor = relic.planet === 'mars' ? '#c85a32' : '#8d99ae';
    ctx.fillStyle = dustColor;
    ctx.fillRect(0, 0, width, height);

    // Dust texture speckles
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(80, 20, 10, 0.4)' : 'rgba(255, 200, 150, 0.3)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add dust prompt text in center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    const wipeInstruction =
      language === 'bn'
        ? 'মাউস বা আঙুল দিয়ে ধুলো মুছে আমাকে জাগিয়ে তোলো!'
        : 'Wipe your mouse or finger to brush off the dust!';
    ctx.fillText(wipeInstruction, width / 2, height / 2);

    let isDrawing = false;
    let clearedPixels = 0;
    const totalPixels = width * height;

    const wipe = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 38, 0, Math.PI * 2);
      ctx.fill();
      soundEffects.playDustBrush();

      clearedPixels += Math.PI * 38 * 38 * 0.35;
      const pct = Math.min(100, Math.round((clearedPixels / (totalPixels * 0.5)) * 100));
      setDustPercentage(pct);

      if (pct >= 80 && !isAwakened) {
        setIsAwakened(true);
        soundEffects.playAwakeningChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F5D4', '#FFB703', '#FF6B4A'],
        });
        onUnlockStamp(relic.id);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      wipe(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      wipe(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onMouseUp = () => (isDrawing = false);

    // Touch events for mobile
    const onTouchStart = (e: TouchEvent) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      if (e.touches[0]) {
        wipe(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      if (e.touches[0]) {
        wipe(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [relic, isAwakened, onUnlockStamp, language]);

  // 2. Three.js 3D Hardware Model Renderer
  useEffect(() => {
    const container = threeMountRef.current;
    if (!container || activeTab !== '3d') return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1128);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5d4, 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffb703, 1.2);
    dirLight2.position.set(-5, 3, -5);
    scene.add(dirLight2);

    // Build Procedural 3D Relic Model based on relic type
    const relicGroup = new THREE.Group();
    scene.add(relicGroup);

    // Chassis Body
    const bodyGeom = new THREE.BoxGeometry(2.4, 0.8, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isXRayMode ? 0x00f5d4 : 0xd1d5db,
      wireframe: isXRayMode,
      transparent: isXRayMode,
      opacity: isXRayMode ? 0.35 : 1,
      metalness: 0.8,
      roughness: 0.3,
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.y = 0.6;
    relicGroup.add(bodyMesh);

    // Solar Wings
    const wingGeom = new THREE.BoxGeometry(3.6, 0.08, 2.2);
    const wingMat = new THREE.MeshStandardMaterial({
      color: isXRayMode ? 0xffb703 : 0x1e3a8a,
      emissive: isXRayMode ? 0xffb703 : 0x0f172a,
      emissiveIntensity: isXRayMode ? 0.8 : 0.2,
      wireframe: isXRayMode,
    });
    const wingsMesh = new THREE.Mesh(wingGeom, wingMat);
    wingsMesh.position.y = 1.05;
    relicGroup.add(wingsMesh);

    // Pancam Mast / Eye
    const mastGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const mastMesh = new THREE.Mesh(mastGeom, mastMat);
    mastMesh.position.set(0.4, 1.7, 0.4);
    relicGroup.add(mastMesh);

    // Camera Eyes Bar
    const eyeGeom = new THREE.BoxGeometry(0.5, 0.25, 0.3);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: isAwakened ? 0x00f5d4 : 0x1e293b,
      emissiveIntensity: isAwakened ? 1.5 : 0.2,
    });
    const eyeMesh = new THREE.Mesh(eyeGeom, eyeMat);
    eyeMesh.position.set(0.4, 2.4, 0.4);
    relicGroup.add(eyeMesh);

    // Wheels & Suspension (6 wheels for rovers, 4 pads for Apollo)
    const wheelsGroup = new THREE.Group();
    relicGroup.add(wheelsGroup);

    if (relic.planet === 'moon') {
      // 4 Golden Landing Pads
      const padPositions = [
        [-1.6, 0, -1.2],
        [1.6, 0, -1.2],
        [-1.6, 0, 1.2],
        [1.6, 0, 1.2],
      ];
      padPositions.forEach(([px, py, pz]) => {
        const padGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 16);
        const padMat = new THREE.MeshStandardMaterial({
          color: 0xffb703,
          metalness: 0.9,
          roughness: 0.2,
        });
        const padMesh = new THREE.Mesh(padGeom, padMat);
        padMesh.position.set(px, py, pz);
        wheelsGroup.add(padMesh);
      });
    } else {
      // 6 Rover Wheels
      const wheelPositions = [
        [-1.4, 0.2, -0.9],
        [-1.4, 0.2, 0],
        [-1.4, 0.2, 0.9],
        [1.4, 0.2, -0.9],
        [1.4, 0.2, 0],
        [1.4, 0.2, 0.9],
      ];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
        wheelGeom.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.7,
          roughness: 0.4,
        });
        const wheelMesh = new THREE.Mesh(wheelGeom, wheelMat);
        wheelMesh.position.set(wx, wy, wz);
        wheelsGroup.add(wheelMesh);
      });
    }

    // High Gain Dish Antenna
    const dishGeom = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      wireframe: isXRayMode,
    });
    const dishMesh = new THREE.Mesh(dishGeom, dishMat);
    dishMesh.rotation.x = -Math.PI / 4;
    dishMesh.position.set(-0.6, 1.5, -0.4);
    relicGroup.add(dishMesh);

    // X-Ray Glowing Internal Core (Computer Brain & Battery)
    if (isXRayMode) {
      const coreGeom = new THREE.BoxGeometry(0.8, 0.5, 0.8);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f5d4,
        emissive: 0x00f5d4,
        emissiveIntensity: 1.2,
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      coreMesh.position.set(0, 0.6, 0);
      relicGroup.add(coreMesh);
    }

    // Mouse drag to rotate 3D relic model
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      relicGroup.rotation.y += dx * 0.01;
      relicGroup.rotation.x += dy * 0.008;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => (isDragging = false);

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      if (!isDragging) {
        relicGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 450;
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
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeTab, isXRayMode, isAwakened, relic]);

  // Chat message send handler
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isChatLoading) return;

    soundEffects.playClick();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relicId: relic.id,
          message: textToSend,
          language,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const relicReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'relic',
        text: data.reply || (language === 'bn' ? 'ধন্যবাদ বন্ধু!' : 'Thank you my friend!'),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, relicReply]);
      soundEffects.playTelemetryPing();
    } catch (err) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'relic',
        text:
          language === 'bn'
            ? 'তোমাদের এই ভালোবাসা পেয়ে কোটি কোটি মাইল দূরেও আমার মনে হচ্ছে পৃথিবী আমার পাশেই আছে!'
            : 'Hearing from young explorers like you makes me feel right at home across millions of miles!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Audio Playback
  const handleToggleAudio = () => {
    soundEffects.playClick();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if (relic.id === 'insight' || relic.id === 'opportunity') {
        soundEffects.playSimulatedMartianWind(8);
      } else {
        soundEffects.playTelemetryPing();
      }
      setTimeout(() => setIsPlayingAudio(false), 8000);
    }
  };

  // Fairy tale speech synthesis
  const handleNarrateStory = () => {
    soundEffects.playClick();
    if (isNarratorSpeaking) {
      soundEffects.stopSpeaking();
      setIsNarratorSpeaking(false);
    } else {
      setIsNarratorSpeaking(true);
      const text =
        language === 'bn'
          ? `${relic.fairyTaleIntroBn} ${relic.heroicStoryBn}`
          : `${relic.fairyTaleIntro} ${relic.heroicStory}`;
      soundEffects.speakText(text, language, 1.1, 0.95);
      setTimeout(() => setIsNarratorSpeaking(false), text.length * 80);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] rounded-3xl glass-panel border-2 border-cyan-400/50 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40">
              {relic.badgeIcon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold">
                  {relic.codeName}
                </span>
                <span className="text-xs text-slate-400 font-mono">{relic.coordinates}</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white font-space">
                {language === 'bn' ? relic.nameBn : relic.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stamp status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold font-space">
              <Award className="w-3.5 h-3.5" />
              <span>
                {hasUnlockedStamp
                  ? language === 'bn'
                    ? 'স্ট্যাম্প আনলকড!'
                    : 'Stamp Unlocked!'
                  : language === 'bn'
                  ? 'ধুলো মুছে স্ট্যাম্প পান'
                  : 'Wipe dust to unlock'}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                soundEffects.stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-cyan-500/20 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === '3d'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>{language === 'bn' ? '৩D হার্ডওয়্যার ও ধুলো মুছুন' : '3D Model & Dust Brush'}</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'story'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'bn' ? 'রূপকথার গল্প ও অডিও' : 'Bedtime Story & Audio'}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{language === 'bn' ? 'রোভারের সাথে কথা বলুন (AI)' : 'Chat with Relic (AI)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'gallery'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'bn' ? 'নাসার আসল ছবি' : 'NASA Raw Photos'}</span>
          </button>
        </div>

        {/* Modal Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: 3D MODEL & DUST WIPING */}
          {activeTab === '3d' && (
            <div className="flex flex-col h-full gap-4">
              {/* Controls bar above canvas */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* X-Ray Scanner Button */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setIsXRayMode(!isXRayMode);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      isXRayMode
                        ? 'bg-cyan-500 text-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/40'
                        : 'glass-panel border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>
                      {isXRayMode
                        ? language === 'bn'
                          ? 'এক্স-রে অন (X-Ray ON)'
                          : 'X-Ray Scanner: ON'
                        : language === 'bn'
                        ? 'এক্স-রে স্ক্যানার চালু করুন'
                        : 'Turn ON X-Ray'}
                    </span>
                  </button>

                  {/* Dust Cleaning Progress */}
                  <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono flex items-center gap-2">
                    <span className="text-amber-400">
                      {language === 'bn' ? 'ধুলো পরিষ্কার:' : 'Dust Cleaned:'}
                    </span>
                    <span className="font-bold text-white">{dustPercentage}%</span>
                    {isAwakened && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono hidden sm:block">
                  {language === 'bn'
                    ? '৩৬০° রোভার ঘোরাতে ড্র্যাগ করুন'
                    : 'Drag to inspect 360°'}
                </div>
              </div>

              {/* 3D Viewport & Interactive Dust Canvas Container */}
              <div className="relative flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0A1128]">
                {/* 3D Model Renderer Container */}
                <div ref={threeMountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

                {/* Dust Overlay Canvas (Wipe to clean) */}
                <canvas
                  ref={dustCanvasRef}
                  className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ${
                    dustPercentage >= 80 ? 'opacity-0 pointer-events-none' : 'opacity-95'
                  }`}
                />

                {/* Awakening Victory Celebration Banner */}
                {isAwakened && (
                  <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none animate-bounce">
                    <div className="glass-panel-warm p-3 rounded-2xl border-2 border-amber-400 text-center shadow-2xl">
                      <div className="text-sm font-extrabold text-amber-300 font-space flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {language === 'bn'
                            ? 'অভিনন্দন! রোভারটি ঘুম থেকে জেগে উঠেছে!'
                            : 'Awakened! The Relic is Back to Life!'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5">
                        {language === 'bn'
                          ? relic.finalMessageBn
                          : relic.finalMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Scientific Components Badges */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  {language === 'bn'
                    ? 'যন্ত্রপাতির অভ্যন্তরীণ পার্টস (ক্লিক করে জানুন):'
                    : 'Internal Hardware Components (Click to decode):'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {relic.components.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedComponent(comp);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedComponent?.id === comp.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                          : 'glass-panel text-slate-300 border-slate-700 hover:border-cyan-400'
                      }`}
                    >
                      {language === 'bn' ? comp.nameBn : comp.name}
                    </button>
                  ))}
                </div>

                {/* Selected Component Explanation Box */}
                {selectedComponent && (
                  <div className="glass-panel p-3.5 rounded-2xl border border-cyan-400/40 text-xs mt-2 animate-fade-in">
                    <div className="font-bold text-cyan-300 font-space mb-1 flex items-center justify-between">
                      <span>{language === 'bn' ? selectedComponent.nameBn : selectedComponent.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20">
                        {selectedComponent.category}
                      </span>
                    </div>
                    <div className="text-amber-300 font-medium mb-1">
                      {language === 'bn' ? selectedComponent.kidMetaphorBn : selectedComponent.kidMetaphor}
                    </div>
                    <p className="text-slate-300">
                      {language === 'bn' ? selectedComponent.descriptionBn : selectedComponent.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BEDTIME STORY & AUDIO TIME CAPSULE */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              {/* NASA Audio Capsule Banner */}
              <div className="glass-panel p-4 rounded-2xl border-2 border-cyan-400/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleAudio}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isPlayingAudio
                        ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <div>
                    <div className="text-[10px] font-mono tracking-wider text-cyan-300 uppercase">
                      {language === 'bn' ? 'নাসার আসল অডিও টাইম-ক্যাপসুল' : 'NASA Authentic Audio Capsule'}
                    </div>
                    <div className="text-sm font-extrabold text-white font-space">
                      {relic.audioTrackName}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {language === 'bn' ? relic.audioTrackDescriptionBn : relic.audioTrackDescription}
                    </div>
                  </div>
                </div>

                {/* Animated Audio Equalizer Bars */}
                {isPlayingAudio && (
                  <div className="hidden sm:flex items-center gap-1 h-8">
                    {[16, 28, 20, 32, 14, 26].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-cyan-400 rounded-full animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Fairy Tale Storybook Box */}
              <div className="glass-panel p-6 rounded-3xl border border-amber-400/40 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    <h3 className="text-lg font-black text-amber-300 font-space">
                      {language === 'bn' ? 'একাকী বীরের রূপকথা' : 'The Legend of the Solitary Hero'}
                    </h3>
                  </div>

                  {/* Audio Read Story Button */}
                  <button
                    onClick={handleNarrateStory}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      isNarratorSpeaking
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/40'
                        : 'glass-panel text-amber-300 border-amber-400/40 hover:bg-amber-400/20'
                    }`}
                  >
                    {isNarratorSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{language === 'bn' ? 'গল্পটি শুনুন' : 'Listen to Story'}</span>
                  </button>
                </div>

                <p className="text-base sm:text-lg leading-relaxed text-slate-100 font-medium italic border-l-4 border-amber-400 pl-4 py-1">
                  {language === 'bn' ? relic.fairyTaleIntroBn : relic.fairyTaleIntro}
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                  {language === 'bn' ? relic.heroicStoryBn : relic.heroicStory}
                </p>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-mono text-cyan-300">
                  <span>
                    {language === 'bn'
                      ? `অবতরণ: ${relic.landingDateBn}`
                      : `Landing: ${relic.landingDate}`}
                  </span>
                  <span>
                    {language === 'bn'
                      ? `কার্যকাল: ${relic.activeDurationBn}`
                      : `Mission Lifespan: ${relic.activeDuration}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEMINI AI CHAT WITH RELIC */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[520px] max-h-full">
              {/* Relic Persona Card Header */}
              <div className="glass-panel p-3 rounded-2xl border border-rose-500/30 flex items-center justify-between mb-3 bg-rose-950/20">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-rose-300 font-space">
                    {language === 'bn'
                      ? `${relic.nameBn}-এর সাথে সরাসরি এআই সংযোগ`
                      : `Direct AI Telemetry Link to ${relic.name}`}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Powered by Google Gemini 3.8 Flash
                </span>
              </div>

              {/* Chat Messages History */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 pr-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm font-medium shadow-lg leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-cyan-500 text-slate-950 rounded-br-none'
                          : 'glass-panel text-slate-100 border border-slate-700 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="glass-panel px-4 py-2.5 rounded-2xl border border-cyan-400/40 text-xs text-cyan-300 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        {language === 'bn'
                          ? `${relic.codeName} উত্তর টাইপ করছে...`
                          : `${relic.codeName} is transmitting a reply...`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Quick Questions Chips */}
              <div className="py-2 flex items-center gap-2 overflow-x-auto">
                {relic.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(language === 'bn' ? q.bn : q.en)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full glass-card hover:bg-cyan-500/20 border border-slate-700 text-[11px] font-medium text-slate-300 hover:text-cyan-300 transition-all"
                  >
                    💬 {language === 'bn' ? q.bn : q.en}
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 pt-2 border-t border-slate-800"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'তোমার প্রশ্নটি এখানে লেখো...'
                      : 'Ask anything to this space relic...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 text-xs sm:text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'পাঠান' : 'Send'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: NASA RAW PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relic.galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl overflow-hidden border border-slate-700 flex flex-col group hover:border-cyan-400 transition-all shadow-xl"
                >
                  <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center p-3">
                    {/* Simulated High-tech archival frame */}
                    <div className="w-full h-full rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-center p-4">
                      <Camera className="w-8 h-8 text-cyan-400 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-white line-clamp-2">
                        {language === 'bn' ? img.titleBn : img.title}
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 mt-2">
                        {img.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 line-clamp-3">
                      {language === 'bn' ? img.descriptionBn : img.description}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 mt-2 border-t border-slate-800 pt-2">
                      Credit: {img.credit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
