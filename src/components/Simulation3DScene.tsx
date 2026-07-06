import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

interface Simulation3DSceneProps {
  activeTab: "WEALTH" | "INFLATION" | "STARTUP" | "LOAN";
  wealthData: {
    sipMonthly: number;
    sipReturn: number;
    sipPeriod: number;
    sipResults: { fv: number; totalInvested: number; returns: number };
  };
  inflationData: {
    capital: number;
    rate: number;
    period: number;
    realValue: number;
    lostValue: number;
  };
  startupData: {
    seed: number;
    burn: number;
    revenue: number;
    runway: number;
  };
  loanData: {
    principal: number;
    rate: number;
    tenure: number;
    emi: number;
    totalInterest: number;
  };
}

// 1. Wealth Growth Graph Component (Exponential Columns)
function WealthGrowthGraph({
  visible,
  data,
}: {
  visible: boolean;
  data: Simulation3DSceneProps["wealthData"];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { sipReturn, sipPeriod } = data;

  useFrame((_state, _delta) => {
    if (groupRef.current) {
      const targetScale = visible ? 1 : 0;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.1);
    }
  });

  // Render 10 columns showing compound interest growth over the time period
  const columns = Array.from({ length: 10 }, (_, i) => {
    const fraction = i / 9;
    const years = fraction * sipPeriod;
    const r = sipReturn / 12 / 100;
    const n = years * 12;
    const fv = n === 0 ? 0 : data.sipMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    
    // Scale height based on final value
    const maxHeight = 3;
    const height = data.sipResults.fv > 0 ? (fv / data.sipResults.fv) * maxHeight + 0.1 : 0.1;

    const xPos = fraction * 4 - 2; // Span from -2 to 2 on X-axis

    return (
      <mesh key={i} position={[xPos, height / 2, 0]}>
        <boxGeometry args={[0.3, height, 0.3]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.9}
          roughness={0.15}
          emissive="#D4AF37"
          emissiveIntensity={visible ? 0.35 : 0}
        />
      </mesh>
    );
  });

  return <group ref={groupRef}>{columns}</group>;
}

// 2. Inflation Decay Graph Component (Decaying Orange Sloped Columns)
function InflationGraph({
  visible,
  data,
}: {
  visible: boolean;
  data: Simulation3DSceneProps["inflationData"];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { rate, period } = data;

  useFrame((_state, _delta) => {
    if (groupRef.current) {
      const targetScale = visible ? 1 : 0;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.1);
    }
  });

  // Render 10 decaying columns
  const columns = Array.from({ length: 10 }, (_, i) => {
    const fraction = i / 9;
    const years = fraction * period;
    const decayedRatio = 1 / Math.pow(1 + rate / 100, years);
    
    const height = decayedRatio * 2.5 + 0.1;
    const xPos = fraction * 4 - 2;

    return (
      <mesh key={i} position={[xPos, height / 2, 0]}>
        <boxGeometry args={[0.28, height, 0.28]} />
        <meshStandardMaterial
          color="#C2410C"
          metalness={0.8}
          roughness={0.25}
          emissive="#EA580C"
          emissiveIntensity={visible ? 0.3 : 0}
        />
      </mesh>
    );
  });

  return <group ref={groupRef}>{columns}</group>;
}

// 3. Startup Planner Graph Component (Floating Milestones & Volumetric Connections)
function StartupPlannerGraph({
  visible,
  data,
}: {
  visible: boolean;
  data: Simulation3DSceneProps["startupData"];
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, _delta) => {
    if (groupRef.current) {
      const targetScale = visible ? 1 : 0;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.1);

      // Add gentle floating animation for the spheres
      if (visible) {
        groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
      }
    }
  });

  // Define 4 Milestones / Nodes
  // Y levels model runway projections: drop then spike on funding rounds
  const nodes = [
    { name: "Seed Round", x: -2, y: 1.5, color: "#D4AF37", size: 0.25 },
    { name: "Year 1 Burn", x: -0.7, y: 0.5, color: "#C2410C", size: 0.2 },
    { name: "Series A Round", x: 0.6, y: 2.2, color: "#3B82F6", size: 0.28 },
    { name: "Growth Phase", x: 2, y: 1.8, color: "#10D9A0", size: 0.22 },
  ];

  return (
    <group ref={groupRef}>
      {/* Volumetric Tubes connecting nodes */}
      {nodes.map((node, i) => {
        if (i === 0) return null;
        const prev = nodes[i - 1];
        
        // Calculate length and rotation to connect nodes
        const start = new THREE.Vector3(prev.x, prev.y, 0);
        const end = new THREE.Vector3(node.x, node.y, 0);
        const distance = start.distanceTo(end);
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        
        // Direction vector
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        
        // Orientation alignment
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

        return (
          <mesh key={`tube-${i}`} position={midPoint} quaternion={quaternion}>
            <cylinderGeometry args={[0.04, 0.04, distance, 8]} />
            <meshStandardMaterial 
              color="#F59E0B" 
              emissive="#F59E0B"
              emissiveIntensity={visible ? 0.4 : 0} 
              roughness={0.1}
            />
          </mesh>
        );
      })}

      {/* Floating Milestone Spheres */}
      {nodes.map((node, i) => (
        <group key={`node-${i}`} position={[node.x, node.y, 0]}>
          <mesh>
            <sphereGeometry args={[node.size, 32, 32]} />
            <meshStandardMaterial
              color={node.color}
              metalness={0.9}
              roughness={0.1}
              emissive={node.color}
              emissiveIntensity={visible ? 0.5 : 0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 4. Loan Calculator Graph Component (Principal vs. Interest stacked cylinders)
function LoanCalculatorGraph({
  visible,
  data,
}: {
  visible: boolean;
  data: Simulation3DSceneProps["loanData"];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { tenure } = data;

  useFrame((_state, _delta) => {
    if (groupRef.current) {
      const targetScale = visible ? 1 : 0;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.1);
    }
  });

  // Render 5 intervals across tenure showing changing Principal vs. Interest stacked structures
  const stacks = Array.from({ length: 5 }, (_, i) => {
    const fraction = i / 4;
    
    // Total height representing remaining debt decreases over time
    const totalHeight = 2.8 * (1 - fraction * 0.8) + 0.2;
    
    // Shifting ratio: initially interest is high, later principal dominates
    // Interest proportion shifts from 60% down to 5%
    const interestRatio = 0.6 * (1 - fraction) + 0.05;
    const interestHeight = totalHeight * interestRatio;
    const principalHeight = totalHeight - interestHeight;

    const xPos = fraction * 4 - 2;

    return (
      <group key={i} position={[xPos, 0, 0]}>
        {/* Bottom Segment: Interest (Bright glowing emissive gold) */}
        <mesh position={[0, interestHeight / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, interestHeight, 32]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.1}
            emissive="#FFD700"
            emissiveIntensity={visible ? 0.6 : 0}
          />
        </mesh>

        {/* Top Segment: Principal (Solid matte brass/dark gold) */}
        <mesh position={[0, interestHeight + principalHeight / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, principalHeight, 32]} />
          <meshStandardMaterial
            color="#5C4D24"
            metalness={0.85}
            roughness={0.4}
            emissive="#3A3011"
            emissiveIntensity={visible ? 0.1 : 0}
          />
        </mesh>
      </group>
    );
  });

  return <group ref={groupRef}>{stacks}</group>;
}

export function Simulation3DScene({
  activeTab,
  wealthData,
  inflationData,
  startupData,
  loanData,
}: Simulation3DSceneProps) {
  return (
    <div className="w-full h-full relative min-h-[300px] sm:min-h-[420px] bg-bg-void/40 rounded-2xl overflow-hidden border border-border/80">
      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <color attach="background" args={["#030712"]} />
        <PerspectiveCamera makeDefault position={[3.8, 3.2, 5.2]} fov={40} />
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2 - 0.05} // Do not go beneath floor
          minPolarAngle={0.1}
          autoRotate={activeTab === "STARTUP"}
          autoRotateSpeed={0.8}
        />

        {/* Studio-Quality Lighting */}
        <ambientLight intensity={0.4} />
        
        {/* Overhead Spotlights with customized gold flares */}
        <spotLight
          position={[0, 8, 2]}
          angle={0.6}
          penumbra={1}
          intensity={14}
          castShadow
          color="#FFD700"
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[4, 3, -2]} intensity={4} color="#3B82F6" />
        <pointLight position={[-4, 3, 2]} intensity={3} color="#F59E0B" />

        {/* Graphs rendered simultaneously but scaling/transitioning based on active tab */}
        <WealthGrowthGraph visible={activeTab === "WEALTH"} data={wealthData} />
        <InflationGraph visible={activeTab === "INFLATION"} data={inflationData} />
        <StartupPlannerGraph visible={activeTab === "STARTUP"} data={startupData} />
        <LoanCalculatorGraph visible={activeTab === "LOAN"} data={loanData} />

        {/* Glossy, Highly Reflective Dark Floor Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <MeshReflectorMaterial
            mirror={0.9}
            blur={[400, 100]}
            resolution={512}
            mixBlur={1.2}
            mixStrength={2.5}
            roughness={0.2}
            depthScale={1.5}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.6}
            color="#090d16"
            metalness={0.9}
          />
        </mesh>

        {/* Subtle Post-Processing Bloom for High-End Cinematic Feel */}
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* Helper Interaction Label */}
      <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-bg-void/70 border border-border/40 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest text-text-muted select-none pointer-events-none backdrop-blur-md">
        🖱️ Drag to Rotate 3D Model
      </div>
    </div>
  );
}
