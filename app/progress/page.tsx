"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SiteShell } from "@/components/SiteShell";
import { TactileAudio } from "@/components/ittalk/TactileAudio";

interface Node {
  id: number;
  x: number;
  y: number;
  r: number;
  name: string;
  desc: string;
  component: string;
  isMilestone?: boolean;
  milestoneId?: string;
}

interface Trace {
  path: string;
  nodes: [number, number];
}

interface Milestone {
  id: string;
  name: string;
  sub: string;
  desc: string;
  status: "COMPLETED" | "IN_DEVELOPMENT" | "PLANNED";
  target: string;
  progress: number;
}

const NODES: Node[] = [
  { id: 0, x: 200, y: 150, r: 7, name: "VCC-5V", desc: "Main Power Supply Rail (5.0V Input)", component: "PWR_SYS" },
  { id: 1, x: 400, y: 120, r: 7, name: "REG-3V3", desc: "Low-Dropout Linear Regulator (3.3V Output)", component: "REG_SYS" },
  { id: 2, x: 650, y: 180, r: 7, name: "CAP-BANK", desc: "Decoupling Capacitor Array (10uF x 4)", component: "CAP_SYS" },
  { id: 3, x: 900, y: 130, r: 7, name: "BUCK-BOOST", desc: "Dynamic 24V Buck-Boost Driver Node", component: "BUCK_SYS" },
  { id: 4, x: 1150, y: 160, r: 7, name: "USB-IF", desc: "USB-C Hardware Physical Interface", component: "USB_SYS" },
  { id: 5, x: 1350, y: 280, r: 7, name: "UART-CH340", desc: "USB-to-UART Bridge Controller", component: "UART_SYS" },
  { id: 6, x: 1580, y: 200, r: 14, name: "CORE-ESP32", desc: "ESP32-S3 Dual-Core Main SoC", component: "MCU_SYS", isMilestone: true, milestoneId: "ota_wifi" },
  { id: 7, x: 1720, y: 420, r: 7, name: "ANT-WIFI", desc: "2.4GHz High-Gain Copper Trace Antenna", component: "RF_SYS" },
  { id: 8, x: 1600, y: 650, r: 7, name: "ANT-BLE", desc: "Bluetooth Low Energy Trace Antenna", component: "RF_SYS" },
  { id: 9, x: 1380, y: 520, r: 11, name: "SECURE-ELCS", desc: "Hardware Cryptographic Key Storage", component: "SEC_SYS", isMilestone: true, milestoneId: "crypto_sec" },
  { id: 10, x: 1200, y: 800, r: 11, name: "DAC-PCM5102", desc: "Precision 32-bit Stereo Audio DAC", component: "AUD_SYS", isMilestone: true, milestoneId: "audio_dac" },
  { id: 11, x: 950, y: 720, r: 7, name: "LPF-STAGE", desc: "Analog Low-Pass Reconstruction Filter", component: "AUD_SYS" },
  { id: 12, x: 750, y: 850, r: 7, name: "OPAMP-GAIN", desc: "Precision Operational Amplifier Gain Stage", component: "AMP_SYS" },
  { id: 13, x: 500, y: 900, r: 7, name: "JACK-OUT", desc: "3.5mm Analog Audio Telemetry Output", component: "AUD_SYS" },
  { id: 14, x: 300, y: 750, r: 7, name: "ADC-ADS1115", desc: "16-Bit Ultra-Compact Telemetry ADC", component: "ADC_SYS" },
  { id: 15, x: 150, y: 500, r: 11, name: "SENS-BUS", desc: "I2C Multi-Sensor Protocol Bus", component: "I2C_SYS", isMilestone: true, milestoneId: "sensor_diag" },
  { id: 16, x: 350, y: 450, r: 7, name: "SENS-BME280", desc: "Digital Barometric Pressure & Temp Sensor", component: "I2C_SYS" },
  { id: 17, x: 580, y: 380, r: 7, name: "OPTO-ISO", desc: "High-Speed Galvanic Optocoupler Isolation", component: "ISO_SYS" },
  { id: 18, x: 800, y: 460, r: 11, name: "GATE-MODBUS", desc: "Industrial RS-485 Modbus TCP Gateway", component: "IND_SYS", isMilestone: true, milestoneId: "modbus_tcp" },
  { id: 19, x: 1020, y: 400, r: 11, name: "FPGA-ICE40", desc: "Lattice iCE40 UltraPlus Edge Coprocessor", component: "FPGA_SYS", isMilestone: true, milestoneId: "edge_coproc" },
  { id: 20, x: 820, y: 300, r: 7, name: "SPI-FLASH", desc: "64MBit High-Speed Nor Flash Memory", component: "MEM_SYS" },
  { id: 21, x: 600, y: 580, r: 7, name: "LED-ARRAY", desc: "System Status LED Telemetry Panel", component: "DISP_SYS" },
  { id: 22, x: 400, y: 620, r: 7, name: "SW-RESET", desc: "Master Hardware Tactile Reset Button", component: "CTRL_SYS" },
  { id: 23, x: 1000, y: 580, r: 7, name: "JTAG-IF", desc: "Diagnostic Core JTAG Debugging Interface", component: "DIAG_SYS" },
  { id: 24, x: 1450, y: 750, r: 7, name: "GPIO-EXP", desc: "Parallel General Purpose I/O Expansion Bus", component: "EXP_SYS" },
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

const MILESTONES: Record<string, Milestone> = {
  ota_wifi: {
    id: "ota_wifi",
    name: "Wireless OTA Upgrades",
    sub: "WIFI / BLE SIMULTANEOUS PROVISIONING",
    desc: "Implementing secure Over-The-Air firmware updating protocols with dual-partition bank switching and checksum validation to prevent device bricking.",
    status: "COMPLETED",
    target: "Q1 2026",
    progress: 100,
  },
  crypto_sec: {
    id: "crypto_sec",
    name: "Hardware Key Cryptography",
    sub: "SECURE ELEMENT CO-PROCESSOR MIGRATION",
    desc: "Integrating physical root-of-trust hardware authentication keys (A256/ECC) to encrypt MQTT data packets and secure OTA transmissions.",
    status: "COMPLETED",
    target: "Q2 2026",
    progress: 100,
  },
  audio_dac: {
    id: "audio_dac",
    name: "Precision Audio Core",
    sub: "32-BIT 384KHZ STEREO DAC TELEMETRY",
    desc: "Creating high-fidelity analog output telemetry modules utilizing delta-sigma modulation for testing audio waveform generators and sensors.",
    status: "IN_DEVELOPMENT",
    target: "Q3 2026",
    progress: 75,
  },
  sensor_diag: {
    id: "sensor_diag",
    name: "Multi-Sensor Registry",
    sub: "DYNAMIC SENSOR SCANNER & INTERLOCK",
    desc: "Designing a hot-swappable sensor registry capable of scanning, identifying, and polling various digital and analog hardware modules concurrently.",
    status: "IN_DEVELOPMENT",
    target: "Q4 2026",
    progress: 60,
  },
  modbus_tcp: {
    id: "modbus_tcp",
    name: "Industrial Modbus Gateway",
    sub: "MODBUS RTU / TCP DETERMINISTIC LINK",
    desc: "Optimizing low-jitter signal translation between RS-485 serial fieldbus networks and Ethernet Modbus TCP industrial databases.",
    status: "PLANNED",
    target: "Q1 2027",
    progress: 10,
  },
  edge_coproc: {
    id: "edge_coproc",
    name: "Edge Coprocessor Shield",
    sub: "FPGA ACCELERATED EDGE INTELLIGENCE",
    desc: "Architecting a modular Lattice-based FPGA coprocessor board to handle real-time signal convolution, high-frequency filtering, and edge computing.",
    status: "PLANNED",
    target: "Q2 2027",
    progress: 5,
  },
};

export default function ProgressPage() {
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("ota_wifi");
  const [soundOn, setSoundOn] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Booting roadmap diagnostic module...",
    "PROBE_ENGINE: Logic probe interface ready. Move cursor to scan board.",
    "SYS_NOMINAL: All telemetry registers listening.",
  ]);
  const [probePos, setProbePos] = useState({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  // BIOS stats
  const [temp, setTemp] = useState(33.4);
  const [noise, setNoise] = useState(-96.4);
  const [clock, setClock] = useState(24.004);

  useEffect(() => {
    TactileAudio.enable(soundOn);
  }, [soundOn]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemp(t => +(t + (Math.random() - 0.5) * 0.15).toFixed(1));
      setNoise(n => +(n + (Math.random() - 0.5) * 0.4).toFixed(1));
      setClock(c => +(c + (Math.random() - 0.5) * 0.003).toFixed(3));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const randomLogs = [
      "TELEMETRY_POLL: VCC 5V line voltage stable at 5.01V",
      "SYS_MONITOR: LDO 3.3V current draw nominal: 148mA",
      "SIGNAL_DECK: SNR threshold high: +44.2dB",
      "RF_ENGINE: Wi-Fi RSSI signal strength: -56dBm",
      "RF_ENGINE: Bluetooth advertisement frames broadcasting",
      "CPU_MONITOR: Core thermal junction stable: 34.6°C",
      "SPI_FLASH: Verified device register key: 0x4B3A8F",
      "DIAG_COGNITIVE: Diagnostic auto-scan reports zero path errors",
    ];
    const interval = setInterval(() => {
      const log = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      addLog(log);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    const ts = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [`[${ts}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const svgX = (x / rect.width) * 1920;
    const svgY = (y / rect.height) * 1080;
    setProbePos({ x: svgX, y: svgY });

    // Calculate nearest 6 nodes within range
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

  const handleNodeHover = (node: Node) => {
    if (soundOn) TactileAudio.playHover();
    addLog(`PROBE_HOVER: Reading node [${node.name}] - ${node.desc}`);
  };

  const handleNodeClick = (node: Node) => {
    if (node.isMilestone && node.milestoneId) {
      if (soundOn) TactileAudio.playOpen();
      setSelectedMilestoneId(node.milestoneId);
      addLog(`PROBE_LOCK: Acquired telemetry link on [${node.name}]. Milestone details decrypted.`);
    } else {
      if (soundOn) TactileAudio.playClick();
      addLog(`PROBE_SCAN: Node [${node.name}] queried. Impedance: ${Math.floor(Math.random() * 80 + 10)}K Ohm. No milestone linked.`);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    TactileAudio.enable(next);
    if (next) setTimeout(() => TactileAudio.playClick(), 50);
    addLog(`SYS_CONFIG: Diagnostic click sounds ${next ? "ENABLED" : "MUTED"}.`);
  };

  const selectedMilestone = MILESTONES[selectedMilestoneId] || MILESTONES.ota_wifi;

  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground font-body flex flex-col selection:bg-accent selection:text-accent-foreground">
        {/* Spacer for fixed Navbar */}
        <div className="h-20 shrink-0" />

        {/* ── BIOS SUB-HEADER ── */}
        <div className="border-b border-border bg-card/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="font-display text-xl tracking-wider text-accent-glow uppercase leading-none">
                ROADMAP
              </div>
              <div className="hidden sm:block w-px h-5 bg-border" />
              <div className="font-mono text-[9px] text-foreground/45 tracking-widest uppercase leading-none">
                [ DIAGNOSTIC LAB REGISTRY &amp; SYSTEM RELEASE LOGS ]
              </div>
            </div>
            {/* System clock + state + sound toggle */}
            <div className="flex flex-wrap justify-center items-center gap-3 font-mono text-[9px] text-foreground/60 tracking-wider">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background/50 border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>STATE: RUNNING</span>
              </div>
              <div className="px-2.5 py-1 bg-background/50 border border-border">
                CLOCK: {clock.toFixed(3)} MHz
              </div>
              <button
                onClick={toggleSound}
                className={`px-3 py-1 border transition-all cursor-pointer font-mono font-medium ${
                  soundOn
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-destructive/30 bg-destructive/5 text-destructive/60 hover:border-destructive/50"
                }`}
              >
                [ AUDIO: {soundOn ? "ON" : "OFF"} ]
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN PLAYGROUND ── */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Left Block: Massive PCB Circuit Labyrinth */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex justify-between items-center px-2">
              <div className="font-mono text-[10px] tracking-widest text-accent uppercase">
                [ REGISTRY DIAGNOSTIC BOARD — 1920x1080 MULTI-LAYER LABYRINTH ]
              </div>
              <div className="hidden sm:block font-mono text-[9px] text-foreground/45 uppercase tracking-wide">
                Hover to probe signal pathways • Click golden nodes
              </div>
            </div>

            <div
              ref={containerRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative w-full aspect-video bg-[#050505] border border-border rounded-sm overflow-hidden select-none cursor-crosshair group shadow-[0_0_30px_rgba(0,0,0,0.8)_inset]"
            >
              {/* Background PCB Blueprint grid */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />
              <div className="absolute inset-0 bg-radial-gradient from-accent/5 to-transparent pointer-events-none opacity-40" />

              {/* Interactive SVG Layer */}
              <svg
                viewBox="0 0 1920 1080"
                className="w-full h-full absolute inset-0 select-none pointer-events-none"
              >
                {/* 1. Draw static background components/trimmings */}
                <g opacity="0.08">
                  <circle cx="960" cy="540" r="450" fill="none" stroke="var(--color-foreground)" strokeWidth="0.5" />
                  <circle cx="960" cy="540" r="300" fill="none" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="5 5" />
                  <line x1="100" y1="540" x2="1820" y2="540" stroke="var(--color-foreground)" strokeWidth="0.3" />
                  <line x1="960" y1="50" x2="960" y2="1030" stroke="var(--color-foreground)" strokeWidth="0.3" />
                </g>

                {/* 2. Draw IC chips & outlines */}
                {CHIPS.map((chip, idx) => {
                  const isHovered =
                    probePos.x >= chip.x &&
                    probePos.x <= chip.x + chip.w &&
                    probePos.y >= chip.y &&
                    probePos.y <= chip.y + chip.h;

                  return (
                    <g key={idx}>
                      {/* Chip package body */}
                      <rect
                        x={chip.x}
                        y={chip.y}
                        width={chip.w}
                        height={chip.h}
                        fill="oklch(0.08 0.003 240 / 0.85)"
                        stroke={isHovered ? "var(--color-accent)" : "var(--color-border)"}
                        strokeWidth={isHovered ? "1.5" : "0.8"}
                        rx="4"
                        className="transition-colors duration-200"
                      />
                      {/* Metallic heat sync center */}
                      <rect
                        x={chip.x + 15}
                        y={chip.y + 15}
                        width={chip.w - 30}
                        height={chip.h - 30}
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="0.4"
                        opacity="0.25"
                      />
                      {/* Silicon chip label */}
                      <text
                        x={chip.x + chip.w / 2}
                        y={chip.y + chip.h / 2 + 4}
                        textAnchor="middle"
                        fill={isHovered ? "var(--color-accent-glow)" : "var(--color-foreground)"}
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        letterSpacing="1"
                        opacity={isHovered ? "0.9" : "0.4"}
                        className="transition-all duration-200"
                      >
                        {chip.label}
                      </text>

                      {/* Small pins along the side edges */}
                      {Array.from({ length: chip.pinCount }).map((_, pIdx) => {
                        const pinY = chip.y + (chip.h / (chip.pinCount + 1)) * (pIdx + 1);
                        return (
                          <g key={pIdx}>
                            {/* Left pin contact pad */}
                            <rect x={chip.x - 8} y={pinY - 2} width={8} height={4} fill="var(--color-accent)" opacity="0.3" />
                            {/* Right pin contact pad */}
                            <rect x={chip.x + chip.w} y={pinY - 2} width={8} height={4} fill="var(--color-accent)" opacity="0.3" />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* 3. Render all traces (copper signals) */}
                {TRACES.map((trace, idx) => {
                  // Trace is lit if both endpoints are in activeNodes list
                  const lit = trace.nodes.every((nodeId) => activeNodes.includes(nodeId));

                  return (
                    <g key={idx}>
                      {/* Passive background trace shadow */}
                      <path
                        d={trace.path}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="0.8"
                        opacity="0.1"
                      />
                      {/* Animated active electron flow path */}
                      {lit && (
                        <motion.path
                          d={trace.path}
                          fill="none"
                          stroke="var(--color-accent-glow)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeDasharray="8 12"
                          animate={{ strokeDashoffset: [0, -40] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                          style={{
                            filter: "drop-shadow(0 0 3px var(--color-accent))",
                          }}
                        />
                      )}
                    </g>
                  );
                })}

                {/* 4. Render all node terminals */}
                {NODES.map((node) => {
                  const isActive = activeNodes.includes(node.id);
                  const isLocked = selectedMilestoneId === node.milestoneId;

                  return (
                    <g
                      key={node.id}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => handleNodeClick(node)}
                      onPointerOver={() => handleNodeHover(node)}
                    >
                      {/* Outer pulsing ring for roadmap milestones */}
                      {node.isMilestone && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.r + 9}
                          fill="none"
                          stroke={isLocked ? "var(--color-accent-glow)" : "var(--color-accent)"}
                          strokeWidth="0.6"
                          strokeDasharray={isActive ? "2 2" : "none"}
                          opacity={isActive || isLocked ? 0.75 : 0.25}
                        />
                      )}

                      {/* Interactive glow ring */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r + (isActive ? 4 : 0)}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={isActive ? "1.5" : "0.5"}
                        opacity={isActive || isLocked ? 0.8 : 0.3}
                        className="transition-all duration-300"
                      />

                      {/* Main pad core */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r - 2 > 2 ? node.r - 2 : 2}
                        fill={isLocked ? "var(--color-accent-glow)" : "var(--color-accent)"}
                        opacity={isActive || isLocked ? 1.0 : 0.6}
                      />

                      {/* Small text node labels */}
                      {(isActive || isLocked) && (
                        <text
                          x={node.x}
                          y={node.y - node.r - 8}
                          textAnchor="middle"
                          fill="var(--color-accent)"
                          fontSize="8"
                          fontFamily="JetBrains Mono"
                          fontWeight="semibold"
                          letterSpacing="0.5"
                        >
                          {node.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 5. Custom cursor solder glow heat overlay */}
                {probePos.x > 0 && (
                  <g>
                    {/* Solder heat radial halo */}
                    <circle
                      cx={probePos.x}
                      cy={probePos.y}
                      r="160"
                      fill="url(#probeGlowGrad)"
                      opacity="0.32"
                    />

                    {/* Precision crosshair overlay */}
                    <line x1={probePos.x - 30} y1={probePos.y} x2={probePos.x + 30} y2={probePos.y} stroke="var(--color-accent-glow)" strokeWidth="0.6" opacity="0.6" />
                    <line x1={probePos.x} y1={probePos.y - 30} x2={probePos.x} y2={probePos.y + 30} stroke="var(--color-accent-glow)" strokeWidth="0.6" opacity="0.6" />
                    <circle cx={probePos.x} cy={probePos.y} r="16" fill="none" stroke="var(--color-accent-glow)" strokeWidth="0.6" opacity="0.3" />
                    <circle cx={probePos.x} cy={probePos.y} r="2" fill="var(--color-accent-glow)" />

                    {/* Telemetry coordinate readout floating under logic probe */}
                    <text
                      x={probePos.x + 15}
                      y={probePos.y - 15}
                      fill="var(--color-accent)"
                      fontSize="7"
                      fontFamily="JetBrains Mono"
                      opacity="0.8"
                    >
                      X:{probePos.x.toFixed(0)} Y:{probePos.y.toFixed(0)}
                    </text>
                  </g>
                )}

                {/* Defs for glow gradients */}
                <defs>
                  <radialGradient id="probeGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right Block: Diagnostics Console & Roadmap details */}
          <aside className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">
            
            {/* Control & Statistics */}
            <div className="border border-border bg-card/35 p-4 space-y-3">
              <div className="font-mono text-[10px] text-accent tracking-widest border-b border-border pb-2 uppercase">
                [ DIAGNOSTICS CONTROL ]
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-foreground/60">
                <div className="p-2 border border-border/30 bg-background/30 rounded-sm">
                  <span className="block text-foreground/35 mb-0.5">SIGNAL NOISE</span>
                  <span className="text-foreground tracking-wide font-medium">{noise.toFixed(1)} dBm</span>
                </div>
                <div className="p-2 border border-border/30 bg-background/30 rounded-sm">
                  <span className="block text-foreground/35 mb-0.5">JUNCTION TEMP</span>
                  <span className="text-foreground tracking-wide font-medium">{temp.toFixed(1)}°C</span>
                </div>
              </div>
            </div>

            {/* Diagnostic scrolling terminal */}
            <div className="border border-border bg-card/35 p-4 space-y-2.5">
              <div className="font-mono text-[10px] text-accent tracking-widest border-b border-border pb-2 uppercase flex justify-between items-center">
                <span>[ TERMINAL REGISTER ]</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              </div>
              <div className="font-mono text-[8.5px] text-foreground/60 h-[140px] overflow-y-auto space-y-1.5 scrollbar-thin select-none">
                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="leading-normal whitespace-pre-wrap font-light"
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Decrypted roadmap details */}
            <div className="border border-accent/30 bg-card/40 p-5 space-y-4 shadow-[0_0_15px_oklch(0.78_0.13_85_/_0.03)] relative">
              <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-accent" />
              <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-accent" />
              <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-accent" />
              <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-accent" />

              <div className="space-y-1 border-b border-border pb-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[8px] text-accent tracking-[0.25em]">[ REG_MILESTONE ]</span>
                  <span className={`font-mono text-[8px] px-2 py-0.5 border ${
                    selectedMilestone.status === "COMPLETED"
                      ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                      : selectedMilestone.status === "IN_DEVELOPMENT"
                      ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                      : "border-sky-500/30 text-sky-500 bg-sky-500/5"
                  }`}>
                    {selectedMilestone.status.replace("_", " ")}
                  </span>
                </div>
                <h1 className="font-display uppercase text-xl text-foreground font-medium tracking-wide">
                  {selectedMilestone.name}
                </h1>
                <p className="font-mono text-[8px] text-foreground/45 tracking-widest">{selectedMilestone.sub}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[8px] text-foreground/50">
                  <span>TELEMETRY STAGE COMPLETION</span>
                  <span className="text-accent">{selectedMilestone.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-border/25 rounded-full overflow-hidden p-[1px]">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedMilestone.progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="font-product text-[11px] leading-relaxed text-foreground/75 font-light">
                {selectedMilestone.desc}
              </div>

              <div className="flex justify-between items-center font-mono text-[9px] pt-2 border-t border-foreground/5">
                <span className="text-foreground/45">EXPECTED SHIP TARGET</span>
                <span className="text-accent-glow font-medium">{selectedMilestone.target}</span>
              </div>
            </div>

          </aside>
        </main>
      </div>
    </SiteShell>
  );
}
