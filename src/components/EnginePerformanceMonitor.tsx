import React, { useState, useEffect } from "react";
import { Cpu, Zap, Activity, ShieldCheck, Server, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

export function EnginePerformanceMonitor() {
  const [latencyHistory, setLatencyHistory] = useState<number[]>([120, 115, 128, 110, 142, 105, 118, 122, 114, 130]);
  const [currentLatency, setCurrentLatency] = useState<number>(124);
  const [memoryUsage, setMemoryUsage] = useState<number>(14.8);
  const [engineStatus, setEngineStatus] = useState<"HEALTHY" | "OPTIMIZING">("HEALTHY");

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time sub-150ms high-speed latency pulses
      const nextLatency = Math.floor(95 + Math.random() * 45);
      const nextMemory = Number((14.2 + Math.random() * 1.2).toFixed(1));

      setCurrentLatency(nextLatency);
      setMemoryUsage(nextMemory);
      setLatencyHistory((prev) => [...prev.slice(1), nextLatency]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Calculate SVG Sparkline coordinates
  const minVal = 80;
  const maxVal = 160;
  const svgWidth = 140;
  const svgHeight = 28;

  const points = latencyHistory
    .map((val, idx) => {
      const x = (idx / (latencyHistory.length - 1)) * svgWidth;
      const normalizedY = (val - minVal) / (maxVal - minVal);
      const y = svgHeight - normalizedY * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="p-4 rounded-2xl bg-bg-secondary/90 border border-accent-gold/30 shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
      {/* Background Accent Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-display text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              Wexa Autonomous Engine Telemetry
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                PROD RUNTIME
              </span>
            </h4>
            <p className="text-[10px] text-text-muted">Real-time sub-150ms latency & micro-container footprint</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            100% OPERATIONAL
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        {/* Gemini 3 Flash Latency with Sparkline */}
        <div className="p-2.5 rounded-xl bg-bg-void/80 border border-border/80 flex flex-col justify-between space-y-1">
          <div className="flex justify-between items-center text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Gemini 3 Flash
            </span>
            <span className="text-emerald-400 font-bold">{currentLatency}ms</span>
          </div>
          {/* Sparkline chart */}
          <div className="h-7 w-full flex items-center justify-center pt-1">
            <svg width={svgWidth} height={svgHeight} className="overflow-visible">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        {/* Midnight Auditor Latency */}
        <div className="p-2.5 rounded-xl bg-bg-void/80 border border-border/80 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> Midnight Auditor
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm font-extrabold text-text-primary">16ms</span>
            <span className="text-[9px] text-emerald-400 font-bold">0 Drift</span>
          </div>
        </div>

        {/* Rebalancer Engine */}
        <div className="p-2.5 rounded-xl bg-bg-void/80 border border-border/80 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" /> D3 Rebalancer
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm font-extrabold text-text-primary">11ms</span>
            <span className="text-[9px] text-purple-300 font-bold">Sub-pixel</span>
          </div>
        </div>

        {/* Memory Footprint */}
        <div className="p-2.5 rounded-xl bg-bg-void/80 border border-border/80 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted flex items-center gap-1">
            <Server className="w-3 h-3 text-blue-400" /> Memory Footprint
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm font-extrabold text-text-primary">{memoryUsage} MB</span>
            <span className="text-[9px] text-blue-400 font-bold">Ultra-light</span>
          </div>
        </div>
      </div>
    </div>
  );
}
