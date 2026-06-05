"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { SiteShell } from "@/components/SiteShell";

interface Node {
  id: number;
  x: number;
  y: number;
  r: number;
  name: string;
  desc: string;
}

interface Trace {
  path: string;
  nodes: [number, number];
}

const NODES: Node[] = [
  { id: 0, x: 200, y: 150, r: 5, name: "VCC-5V", desc: "Main Power Supply Rail" },
  { id: 1, x: 400, y: 120, r: 5, name: "REG-3V3", desc: "Low-Dropout Regulator" },
  { id: 2, x: 650, y: 180, r: 5, name: "CAP-BANK", desc: "Decoupling Capacitor Array" },
  { id: 3, x: 900, y: 130, r: 5, name: "BUCK-BOOST", desc: "Dynamic Buck-Boost Driver" },
  { id: 4, x: 1150, y: 160, r: 5, name: "USB-IF", desc: "USB-C Hardware Physical Interface" },
  { id: 5, x: 1350, y: 280, r: 5, name: "UART-CH340", desc: "USB-to-UART Bridge Controller" },
  { id: 6, x: 1580, y: 200, r: 10, name: "CORE-ESP32", desc: "ESP32-S3 Main SoC" },
  { id: 7, x: 1720, y: 420, r: 5, name: "ANT-WIFI", desc: "2.4GHz Wi-Fi Copper Antenna" },
  { id: 8, x: 1600, y: 650, r: 5, name: "ANT-BLE", desc: "Bluetooth Trace Antenna" },
  { id: 9, x: 1380, y: 520, r: 8, name: "SECURE-ELCS", desc: "Hardware Cryptographic Key Storage" },
  { id: 10, x: 1200, y: 800, r: 8, name: "DAC-PCM5102", desc: "32-bit Stereo Audio DAC" },
  { id: 11, x: 950, y: 720, r: 5, name: "LPF-STAGE", desc: "Analog Low-Pass Filter" },
  { id: 12, x: 750, y: 850, r: 5, name: "OPAMP-GAIN", desc: "Op-Amp Gain Stage" },
  { id: 13, x: 500, y: 900, r: 5, name: "JACK-OUT", desc: "Analog Audio Output" },
  { id: 14, x: 300, y: 750, r: 5, name: "ADC-ADS1115", desc: "16-Bit Telemetry ADC" },
  { id: 15, x: 150, y: 500, r: 8, name: "SENS-BUS", desc: "I2C Multi-Sensor Protocol Bus" },
  { id: 16, x: 350, y: 450, r: 5, name: "SENS-BME280", desc: "Barometric Pressure & Temp Sensor" },
  { id: 17, x: 580, y: 380, r: 5, name: "OPTO-ISO", desc: "High-Speed Optocoupler Isolation" },
  { id: 18, x: 800, y: 460, r: 8, name: "GATE-MODBUS", desc: "Industrial Modbus Gateway" },
  { id: 19, x: 1020, y: 400, r: 8, name: "FPGA-ICE40", desc: "FPGA Edge Coprocessor" },
  { id: 20, x: 820, y: 300, r: 5, name: "SPI-FLASH", desc: "Nor Flash Memory" },
  { id: 21, x: 600, y: 580, r: 5, name: "LED-ARRAY", desc: "Status LED Panel" },
  { id: 22, x: 400, y: 620, r: 5, name: "SW-RESET", desc: "Master Tactile Reset Button" },
  { id: 23, x: 1000, y: 580, r: 5, name: "JTAG-IF", desc: "JTAG Debugging Interface" },
  { id: 24, x: 1450, y: 750, r: 5, name: "GPIO-EXP", desc: "GPIO Expansion Bus" },
];

const TRACES: Trace[] = [
  { path: "M200 150 L300 150 L300 120 L400 120", nodes: [0, 1] },
  { path: "M400 120 L520 120 L520 180 L650 180", nodes: [1, 2] },
  { path: "M650 180 L780 180 L780 130 L900 130", nodes: [2, 3] },
  { path: "M900 130 L1020 130 L1020 160 L1150 160", nodes: [3, 4] },
  { path: "M1150 160 L1250 160 L1250 280 L1350 280", nodes: [4, 5] },
  { path: "M1350 280 L1460 280 L1460 200 L1580 200", nodes: [5, 6] },
  { path: "M1580 200 L1660 200 L1660 420 L1720 420", nodes: [6, 7] },
  { path: "M1720 420 L1720 550 L1600 550 L1600 650", nodes: [7, 8] },
  { path: "M1600 650 L1480 650 L1480 520 L1380 520", nodes: [8, 9] },
  { path: "M1380 520 L1300 520 L1300 800 L1200 800", nodes: [9, 10] },
  { path: "M1200 800 L1080 800 L1080 720 L950 720", nodes: [10, 11] },
  { path: "M950 720 L860 720 L860 850 L750 850", nodes: [11, 12] },
  { path: "M750 850 L620 850 L620 900 L500 900", nodes: [12, 13] },
  { path: "M500 900 L380 900 L380 750 L300 750", nodes: [13, 14] },
  { path: "M300 750 L200 750 L200 500 L150 500", nodes: [14, 15] },
  { path: "M150 500 L250 500 L250 450 L350 450", nodes: [15, 16] },
  { path: "M350 450 L460 450 L460 380 L580 380", nodes: [16, 17] },
  { path: "M580 380 L700 380 L700 460 L800 460", nodes: [17, 18] },
  { path: "M800 460 L910 460 L910 400 L1020 400", nodes: [18, 19] },
  { path: "M1020 400 L940 400 L940 300 L820 300", nodes: [19, 20] },
  { path: "M820 300 L710 300 L710 580 L600 580", nodes: [20, 21] },
  { path: "M600 580 L500 580 L500 620 L400 620", nodes: [21, 22] },
  { path: "M400 620 L700 620 L700 580 L1000 580", nodes: [22, 23] },
  { path: "M1000 580 L1220 580 L1220 750 L1450 750", nodes: [23, 24] },
  { path: "M1450 750 L1580 750 L1580 200", nodes: [24, 6] },
];

const CHIPS = [
  { x: 1490, y: 140, w: 160, h: 120, label: "MCU-ESP32-S3", pinCount: 6 },
  { x: 960, y: 340, w: 120, h: 120, label: "FPGA-iCE40", pinCount: 5 },
  { x: 1300, y: 460, w: 100, h: 80, label: "SECURE-ELCS", pinCount: 4 },
  { x: 1120, y: 740, w: 110, h: 90, label: "DAC-PCM5102", pinCount: 4 },
  { x: 740, y: 410, w: 120, h: 80, label: "GATEWAY-RTU", pinCount: 4 },
  { x: 80, y: 450, w: 80, h: 60, label: "SENS-REG", pinCount: 3 },
];

export default function ProgressPage() {
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [probePos, setProbePos] = useState({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const svgX = (x / rect.width) * 1920;
    const svgY = (y / rect.height) * 1080;
    setProbePos({ x: svgX, y: svgY });

    // Calculate nearest nodes within hover distance
    const distances = NODES.map((node) => {
      const d = Math.hypot(node.x - svgX, node.y - svgY);
      return { id: node.id, d };
    });

    const activeList = distances
      .sort((a, b) => a.d - b.d)
      .slice(0, 6)
      .filter((n) => n.d < 380)
      .map((n) => n.id);

    setActiveNodes(activeList);
  };

  const handlePointerLeave = () => {
    setProbePos({ x: -1000, y: -1000 });
    setActiveNodes([]);
  };

  return (
    <SiteShell>
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Spacer for fixed Navbar */}
        <div className="h-20 shrink-0" />

        {/* ── Background PCB Labyrinth ── */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
          {/* Solder heat radial halo */}
          {probePos.x > 0 && (
            <div
              className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(350px circle at ${(probePos.x / 1920) * 100}% ${(probePos.y / 1080) * 100}%, oklch(0.78 0.13 85 / 0.10), transparent 70%)`,
              }}
            />
          )}

          {/* Background PCB Blueprint grid */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <svg
            viewBox="0 0 1920 1080"
            className="w-full h-full absolute inset-0 select-none pointer-events-none opacity-60"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Draw static background grid design */}
            <g opacity="0.08">
              <circle cx="960" cy="540" r="450" fill="none" stroke="var(--color-foreground)" strokeWidth="0.5" />
              <circle cx="960" cy="540" r="300" fill="none" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="5 5" />
              <line x1="100" y1="540" x2="1820" y2="540" stroke="var(--color-foreground)" strokeWidth="0.3" />
              <line x1="960" y1="50" x2="960" y2="1030" stroke="var(--color-foreground)" strokeWidth="0.3" />
            </g>

            {/* Draw IC chips & outlines */}
            {CHIPS.map((chip, idx) => {
              const isHovered =
                probePos.x >= chip.x &&
                probePos.x <= chip.x + chip.w &&
                probePos.y >= chip.y &&
                probePos.y <= chip.y + chip.h;

              return (
                <g key={idx}>
                  <rect
                    x={chip.x}
                    y={chip.y}
                    width={chip.w}
                    height={chip.h}
                    fill="oklch(0.08 0.003 240 / 0.25)"
                    stroke={isHovered ? "var(--color-accent)" : "var(--color-border)"}
                    strokeWidth={isHovered ? "1.2" : "0.6"}
                    rx="4"
                    opacity="0.45"
                    className="transition-colors duration-200"
                  />
                  <text
                    x={chip.x + chip.w / 2}
                    y={chip.y + chip.h / 2 + 3}
                    textAnchor="middle"
                    fill="var(--color-foreground)"
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                    opacity="0.12"
                  >
                    {chip.label}
                  </text>

                  {/* Pins */}
                  {Array.from({ length: chip.pinCount }).map((_, pIdx) => {
                    const pinY = chip.y + (chip.h / (chip.pinCount + 1)) * (pIdx + 1);
                    return (
                      <g key={pIdx} opacity="0.3">
                        <rect x={chip.x - 6} y={pinY - 1.5} width={6} height={3} fill="var(--color-accent)" />
                        <rect x={chip.x + chip.w} y={pinY - 1.5} width={6} height={3} fill="var(--color-accent)" />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Render traces */}
            {TRACES.map((trace, idx) => {
              const lit = trace.nodes.every((nodeId) => activeNodes.includes(nodeId));
              return (
                <g key={idx}>
                  <path
                    d={trace.path}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="0.8"
                    opacity="0.08"
                  />
                  {lit && (
                    <motion.path
                      d={trace.path}
                      fill="none"
                      stroke="var(--color-accent-glow)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      style={{
                        filter: "drop-shadow(0 0 2px var(--color-accent))",
                      }}
                    />
                  )}
                </g>
              );
            })}

            {/* Render node terminals */}
            {NODES.map((node) => {
              const isActive = activeNodes.includes(node.id);
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="0.5"
                    opacity={isActive ? 0.75 : 0.2}
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="2"
                    fill="var(--color-accent)"
                    opacity={isActive ? 0.9 : 0.45}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Centered Coming Soon Card ── */}
        <div className="relative z-10 px-4 py-16 text-center max-w-lg w-full">
          <div className="bg-card/45 border border-border/80 backdrop-blur-md px-6 py-10 md:px-12 md:py-14 rounded-sm relative shadow-2xl">
            {/* Cyberpunk corner ticks */}
            <span className="absolute -top-px -left-px w-4 h-4 border-t border-l border-accent" />
            <span className="absolute -top-px -right-px w-4 h-4 border-t border-r border-accent" />
            <span className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-accent" />
            <span className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-accent" />

            <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-4 uppercase">[ ROADMAP / REGISTRY ]</div>
            <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground font-light leading-[1.05] mb-4">
              UNDER DIAGNOSTICS
            </h1>
            <p className="font-body text-xs md:text-sm text-foreground/55 leading-relaxed mb-8">
              This registry channel is currently compiling. Interactive roadmap milestones, system telemetry registers, and development logs will be mounted here soon.
            </p>
            <div className="font-mono text-[9px] text-accent-glow tracking-widest uppercase animate-pulse">
              [ DIRECTORY ACCESS DEFERRED ]
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
