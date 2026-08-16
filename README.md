# 🧊 Wexa AI — Spatial 3D WebGL Graphics Engine Architecture

> **Module Overview:** Real-time spatial 3D visualization matrix integrated into [Wexa AI](https://github.com/studywithyash28/Wexa-AI). Built with Three.js, React Three Fiber, and Drei, this engine transforms complex financial simulations—such as net worth trajectories, inflation degradation, and loan amortization—into interactive WebGL models.

---

## 🛠️ Tech Stack & Dependencies

* **3D Core:** [Three.js](https://threejs.org/)
* **React Adapter:** `@react-three/fiber`
* **3D Helpers & Component Library:** `@react-three/drei`
* **Motion & Physics Animations:** Framer Motion (`motion/react`)
* **State Integration:** React 18 / TypeScript

---

## 🏗️ System Architecture & Data Flow

+-------------------------------------------------------------------------+
|                        InvestmentSimulator.tsx                          |
|  - Receives user financial metrics (Net Worth, APR, Term Years)         |
|  - Manages interactive parameter sliders & state updates                |
+------------------------------------+------------------------------------+
|
v
+-------------------------------------------------------------------------+
|                        Simulation3DScene.tsx                            |
|  +------------------------+      +-----------------------------------+  |
|  |     Wrapper    |      |      Environment & Lighting       |  |
|  | - OrbitControls        |      | - Reflective Floor Mesh Plane     |  |
|  | - Camera FOV Configuration|   | - Soft Ambient & Spotlights       |  |
|  +-----------+------------+      +----------------+------------------+  |
|              |                                    |                     |
|              +-----------------+------------------+                     |
|                                |                                        |
|                                v                                        |
|  +-------------------------------------------------------------------+  |
|  |                   3D Rendered WebGL Meshes                        |  |
|  |  1. Spatial Wealth Columns  (Compounding Projections)               |  |
|  |  2. Inflation Decay Mesh    (Real vs. Nominal Asset Erosion)       |  |
|  |  3. Amortization Cylinders  (Principal vs. Interest Ratio)          |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+


---

## ⚡ Core Visualizer Capabilities

**1. Spatial Wealth Trajectory Columns**
* Generates staggered 3D geometric columns representing annual compounding capital accumulation over 10-to-30-year horizons.
* Height dynamic scaling automatically interpolates as financial input variables change.

**2. Real vs. Nominal Inflation Decay Mesh**
* Visual mesh degradation engine comparing nominal portfolio growth against real purchasing power eroded by inflation.
* Visualized via contrasting material textures and geometric height reduction.

**3. Dual-Segmented Amortization Cylinders**
* Dual-tone cylinder models dynamically breaking down monthly debt clearance.
* Visually separates principal debt reduction from cumulative interest paid across loan lifetimes.

**4. Reflective Mirror Environment & Controls**
* Implements high-gloss ground plane reflections to enhance visual depth.
* Powered by `<OrbitControls />` for full 360° rotation, panning, and distance zoom.

---

## 📂 File Hierarchy

```text
src/
└── components/
    ├── Simulation3DScene.tsx    # Core WebGL Scene, custom shaders, lights & meshes
    └── InvestmentSimulator.tsx  # React parent controller feeding financial state
💻 Code Example & Integration
TypeScript
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Simulation3DScene } from './Simulation3DScene';

interface VisualizerProps {
  netWorth: number;
  interestRate: number;
  years: number;
}

export const Wealth3DViewport: React.FC<VisualizerProps> = ({ netWorth, interestRate, years }) => {
  return (
    <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl">
      <Canvas 15], 45 8, [0, camera="{{" fov: position: shadows }}>
        {/* Ambient Baseline & Directional Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 8]} intensity={1.2} castShadow />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#4f46e5" />

        {/* Core 3D Scene Assembly */}
        <Simulation3DScene interestRate="{interestRate}" netWorth="{netWorth}" years="{years}"/>

        {/* Camera Control Navigation */}
        <OrbitControls - / // 0.05} 2 Restrict below camera enableZoom="{true}" floor level maxDistance="{30}" maxPolarAngle="{Math.PI" minDistance="{5}"/>
      </Canvas>
    </div>
  );
};
