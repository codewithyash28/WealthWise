import { useState, useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles, Globe, Shield, RefreshCw } from "lucide-react";

interface ConceptNodeProps {
  position: [number, number, number];
  color: string;
  label: string;
}

function ConceptNode({ position, color, label }: ConceptNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle float animation based on elapsed clock time
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0] * 2) * 0.08;
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[hovered ? 0.22 : 0.16, 12, 12]} />
      <meshBasicMaterial 
        color={hovered ? "#eab308" : color} 
        wireframe 
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function GalaxyPoints() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Steady rotation of the galaxy
      pointsRef.current.rotation.y += delta * 0.04;
    }
  });

  const [positions, colors] = useMemo(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Golden Spiral galaxy algorithm
      const armIndex = i % 4; // 4-arm spiral galaxy
      const angle = (i / count) * Math.PI * 2 * 3.5 + (armIndex * (Math.PI / 2));
      const distance = (i / count) * 6.5 + 0.3;
      
      // Add randomness/dispersion
      const x = Math.cos(angle) * distance + (Math.random() - 0.5) * 0.6;
      const y = (Math.random() - 0.5) * 0.4;
      const z = Math.sin(angle) * distance + (Math.random() - 0.5) * 0.6;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color nodes based on proximity to center (Core heat map style)
      if (distance < 1.8) {
        // Bright golden core
        colors[i * 3] = 0.98; // R
        colors[i * 3 + 1] = 0.75; // G
        colors[i * 3 + 2] = 0.05; // B
      } else if (armIndex === 0) {
        // Emerald green arm
        colors[i * 3] = 0.06;
        colors[i * 3 + 1] = 0.72;
        colors[i * 3 + 2] = 0.45;
      } else if (armIndex === 1) {
        // Cyan blue arm
        colors[i * 3] = 0.06;
        colors[i * 3 + 1] = 0.60;
        colors[i * 3 + 2] = 0.98;
      } else {
        // Rose/Magenta arm representing dynamic assets
        colors[i * 3] = 0.93;
        colors[i * 3 + 1] = 0.20;
        colors[i * 3 + 2] = 0.55;
      }
    }

    return [positions, colors];
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function WealthGalaxy() {
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  const concepts = [
    { label: "Equities", pos: [-2.2, 0.4, 1.2] as [number, number, number], color: "#10b981", desc: "Dynamic compounding assets powering structural growth parameters." },
    { label: "Sovereign Debt", pos: [2.0, -0.3, -1.8] as [number, number, number], color: "#3b82f6", desc: "Low volatility security buffers mitigating unexpected systemic liquidity shocks." },
    { label: "Cryptographic Assets", pos: [-1.2, -0.6, -2.2] as [number, number, number], color: "#ec4899", desc: "High beta leverage variables representing edge decentralization paradigms." },
    { label: "Sovereign Vault Reserves", pos: [1.8, 0.6, 2.0] as [number, number, number], color: "#eab308", desc: "Liquidity multipliers ensuring ready deployment vectors during margin events." },
  ];

  return (
    <div className="relative w-full h-[320px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#05070c] to-[#0a0f1d] border border-border/80 shadow-2xl flex flex-col justify-between p-6">
      {/* HUD Header */}
      <div className="z-10 flex items-center justify-between pointer-events-none">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-accent-gold uppercase font-black">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span>Interactive Spatial Web Engine</span>
          </div>
          <h4 className="text-sm font-sans font-black text-text-primary uppercase tracking-wider">
            WealthGalaxy 3D Asset Topology
          </h4>
        </div>
        <div className="px-2 py-0.5 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full text-[#10b981] text-[8px] font-mono font-bold uppercase tracking-widest">
          WebGL Active
        </div>
      </div>

      {/* R3F Canvas container */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center text-xs text-text-muted font-mono gap-1.5">
            <RefreshCw className="w-4 h-4 animate-spin text-accent-gold" />
            <span>Initializing spatial Canvas...</span>
          </div>
        }>
          <Canvas camera={{ position: [0, 0, 5.5], fov: 60 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <GalaxyPoints />
            {concepts.map((c) => (
              <ConceptNode 
                key={c.label} 
                position={c.pos} 
                color={c.color} 
                label={c.label} 
              />
            ))}
          </Canvas>
        </Suspense>
      </div>

      {/* Interactive Labels Grid (allows clicking or hovering to see descriptions) */}
      <div className="z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        {concepts.map((c) => (
          <button
            key={c.label}
            onMouseEnter={() => setActiveConcept(c.label)}
            onMouseLeave={() => setActiveConcept(null)}
            className="p-2.5 rounded-xl border border-border/60 bg-bg-void/80 hover:border-accent-gold/40 hover:bg-bg-secondary/40 transition-all text-left group select-none cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: c.color }} />
              <span className="text-[10px] font-bold text-text-primary tracking-tight font-sans">
                {c.label}
              </span>
            </div>
            <p className="text-[8px] text-text-muted font-mono leading-normal mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
              {c.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
