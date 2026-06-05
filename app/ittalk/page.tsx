"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SiteShell } from "@/components/SiteShell";
import { TactileAudio } from "@/components/ittalk/TactileAudio";
import { VoltageDivider } from "@/components/ittalk/VoltageDivider";
import { ResistorColorCode } from "@/components/ittalk/ResistorColorCode";
import { ResistorSeriesParallel } from "@/components/ittalk/ResistorSeriesParallel";
import { RcFilter } from "@/components/ittalk/RcFilter";
import { OhmsLaw } from "@/components/ittalk/OhmsLaw";
import { CapacitorCharging } from "@/components/ittalk/CapacitorCharging";
import { PcbTraceWidth } from "@/components/ittalk/PcbTraceWidth";
import { BatteryLife } from "@/components/ittalk/BatteryLife";
import { OpAmpGain } from "@/components/ittalk/OpAmpGain";
import { Timer555 } from "@/components/ittalk/Timer555";

interface Tool {
  id: string;
  slot: string;
  name: string;
  tag: string;
  component: React.ComponentType;
}

const TOOLS: Tool[] = [
  { id: "volt_div",     slot: "SLOT_01", name: "Voltage Divider",       tag: "VOLT_DIV",    component: VoltageDivider },
  { id: "res_color",    slot: "SLOT_02", name: "Resistor Color Bands",   tag: "RES_COLOR",   component: ResistorColorCode },
  { id: "res_array",    slot: "SLOT_03", name: "Resistors Array (S/P)",  tag: "RES_ARRAY",   component: ResistorSeriesParallel },
  { id: "rc_filter",    slot: "SLOT_04", name: "RC Passive Filter",      tag: "RC_FILTER",   component: RcFilter },
  { id: "ohms_law",     slot: "SLOT_05", name: "Ohm's Law Solver",       tag: "OHMS_LAW",    component: OhmsLaw },
  { id: "cap_charge",   slot: "SLOT_06", name: "Capacitor Charging",     tag: "CAP_CHARGE",  component: CapacitorCharging },
  { id: "pcb_width",    slot: "SLOT_07", name: "PCB Trace Width",        tag: "PCB_WIDTH",   component: PcbTraceWidth },
  { id: "battery_life", slot: "SLOT_08", name: "Battery Life Calculator",tag: "BATTERY_LIFE",component: BatteryLife },
  { id: "opamp_gain",   slot: "SLOT_09", name: "Op-Amp Gain Analyzer",   tag: "OPAMP_GAIN",  component: OpAmpGain },
  { id: "timer_555",    slot: "SLOT_10", name: "NE555 Timer IC",         tag: "NE555_TIMER", component: Timer555 },
];

export default function ItTalkPage() {
  const [activeToolId, setActiveToolId] = useState<string>("volt_div");
  const [soundOn, setSoundOn]           = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Booting diagnostic laboratory environment...",
    "AUDIO_ENGINE: Loaded synthetic PCM click synthesizer.",
    "SYS_NOMINAL: All workbench nodes listening.",
  ]);

  // Live BIOS flavour metrics
  const [temp, setTemp]           = useState<number>(34.2);
  const [coreClock, setCoreClock] = useState<number>(16.000);

  useEffect(() => { TactileAudio.enable(soundOn); }, [soundOn]);

  useEffect(() => {
    const id = setInterval(() => {
      setTemp(p => +(p + (Math.random() - 0.5) * 0.2).toFixed(1));
      setCoreClock(p => +(p + (Math.random() - 0.5) * 0.005).toFixed(3));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleToolSelect = (tool: Tool) => {
    TactileAudio.playClick();
    setActiveToolId(tool.id);
    addLog(`MODULE_MOUNT: Initialized ${tool.slot} [${tool.tag}] successfully.`);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    TactileAudio.enable(next);
    if (next) setTimeout(() => TactileAudio.playClick(), 50);
    addLog(`SYS_CONFIG: Diagnostic click sound set to ${next ? "ENABLED" : "MUTED"}.`);
  };

  const addLog = (msg: string) => {
    const ts = new Date().toISOString().split("T")[1].slice(0, 8);
    setLogs(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const activeTool    = TOOLS.find(t => t.id === activeToolId) || TOOLS[0];
  const ActiveComponent = activeTool.component;

  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground font-body flex flex-col selection:bg-accent selection:text-accent-foreground">

        {/* Spacer for fixed Navbar */}
        <div className="h-20 shrink-0" />

        {/* ── BIOS SUB-HEADER ── */}
        <div className="border-b border-border bg-card/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="font-display text-xl tracking-wider text-accent-glow uppercase">
                iT Talk
              </div>
              <div className="hidden sm:block w-px h-5 bg-border" />
              <div className="font-mono text-[9px] text-foreground/45 tracking-widest uppercase">
                [ DIGITAL DIAGNOSTICS WORKBENCH v1.0.4 ]
              </div>
            </div>

            {/* Diagnostic metrics + sound toggle */}
            <div className="flex flex-wrap justify-center items-center gap-3 font-mono text-[9px] text-foreground/60 tracking-wider">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background/50 border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SYS_STATE: NOMINAL</span>
              </div>
              <div className="px-2.5 py-1 bg-background/50 border border-border">
                TEMP: {temp.toFixed(1)}°C
              </div>
              <div className="px-2.5 py-1 bg-background/50 border border-border">
                CLOCK: {coreClock.toFixed(3)} MHz
              </div>
              <button
                onClick={toggleSound}
                className={`px-3 py-1 border transition-all cursor-pointer font-mono font-medium ${
                  soundOn
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-destructive/30 bg-destructive/5 text-destructive/60 hover:border-destructive/50"
                }`}
              >
                [ SOUND: {soundOn ? "ON" : "OFF"} ]
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN WORKSPACE ── */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR ── */}
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6">

            {/* Mobile custom dropdown */}
            <div className="block lg:hidden relative">
              <label className="block font-mono text-[10px] text-accent tracking-widest mb-2">
                [ MOUNTED SOLVER SELECTOR ]
              </label>
              <button
                onClick={() => { TactileAudio.playClick(); setDropdownOpen(v => !v); }}
                className="w-full flex items-center justify-between bg-card border border-accent/30 p-3 font-mono text-xs text-accent cursor-pointer transition-colors hover:border-accent"
              >
                <span>{activeTool.slot} — {activeTool.name}</span>
                <motion.svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="1.5"
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 ml-2"
                >
                  <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 right-0 top-full z-50 border border-accent/30 bg-card shadow-xl max-h-72 overflow-y-auto"
                  >
                    {TOOLS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { handleToolSelect(t); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 font-mono text-xs tracking-wide border-b border-border/30 last:border-b-0 transition-colors cursor-pointer ${
                          activeToolId === t.id
                            ? "bg-accent/10 text-accent font-medium"
                            : "text-foreground/70 hover:bg-accent/5 hover:text-accent"
                        }`}
                      >
                        <span className="text-[9px] opacity-50 block">{t.slot}</span>
                        {t.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop nav list */}
            <div className="hidden lg:block border border-border bg-card/35 p-4 space-y-3">
              <div className="font-mono text-[10px] text-accent tracking-widest border-b border-border pb-2 uppercase">
                [ SOLVER DIRECTORY ]
              </div>
              <nav className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {TOOLS.map(t => {
                  const isActive = activeToolId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleToolSelect(t)}
                      className={`w-full text-left p-2 font-mono text-[10px] tracking-wider uppercase border transition-all cursor-pointer ${
                        isActive
                          ? "border-accent bg-accent/10 text-accent font-medium shadow-[0_0_8px_rgba(212,175,55,0.1)]"
                          : "border-transparent text-foreground/60 hover:text-foreground hover:border-foreground/15 hover:bg-background/40"
                      }`}
                    >
                      <div className="text-[8px] opacity-45">{t.slot}</div>
                      <div className="truncate mt-0.5">{t.name}</div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Diagnostic console */}
            <div className="border border-border bg-card/35 p-4 space-y-2.5">
              <div className="font-mono text-[10px] text-accent tracking-widest border-b border-border pb-2 uppercase">
                [ DIAGNOSTIC CONSOLE ]
              </div>
              <div className="font-mono text-[9px] text-foreground/60 h-[150px] overflow-y-auto space-y-1.5 scrollbar-thin select-none">
                {logs.map((log, i) => (
                  <div key={i} className="leading-normal whitespace-pre-wrap font-light">{log}</div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── TOOL RENDERER ── */}
          <section className="flex-1 border border-border bg-card/15 p-4 lg:p-8 relative min-h-[500px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-sm" />
            <div className="relative z-10 space-y-6">
              <div className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-mono text-[10px] text-accent-glow tracking-widest mr-2">[{activeTool.slot}]</span>
                  <span className="font-mono text-[10px] text-foreground/40 mr-3">|</span>
                  <span className="font-mono text-[10px] text-foreground/60 tracking-wider">SYSTEM_TAG: {activeTool.tag}</span>
                  <h1 className="font-display text-3xl text-foreground mt-1 tracking-wider uppercase">{activeTool.name}</h1>
                </div>
                <div className="font-mono text-[9px] text-accent px-2.5 py-1 bg-accent/5 border border-accent/25 uppercase">
                  Ready for computation
                </div>
              </div>
              <ActiveComponent />
            </div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-border bg-card/25 p-4 text-center">
          <div className="font-mono text-[9px] text-foreground/45 tracking-widest uppercase">
            ELCS LABORATORIES © {new Date().getFullYear()} — HARDWARE SIMULATION SYSTEMS
          </div>
        </footer>
      </div>
    </SiteShell>
  );
}
