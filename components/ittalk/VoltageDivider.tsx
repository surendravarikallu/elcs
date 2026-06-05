"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

export function VoltageDivider() {
  const [mode, setMode] = useState<"vout" | "vin" | "r1" | "r2">("vout");
  const [vin, setVin] = useState("5");
  const [r1, setR1] = useState("10000");
  const [r2, setR2] = useState("10000");
  const [vout, setVout] = useState("2.5");
  const [outputVal, setOutputVal] = useState<number>(2.5);

  useEffect(() => {
    const vI = parseFloat(vin) || 0;
    const res1 = parseFloat(r1) || 0;
    const res2 = parseFloat(r2) || 0;
    const vO = parseFloat(vout) || 0;

    let result = 0;
    if (mode === "vout") {
      if (res1 + res2 > 0) {
        result = vI * (res2 / (res1 + res2));
      }
    } else if (mode === "vin") {
      if (res2 > 0) {
        result = vO * ((res1 + res2) / res2);
      }
    } else if (mode === "r1") {
      if (vO > 0 && vI > vO) {
        result = res2 * ((vI - vO) / vO);
      }
    } else if (mode === "r2") {
      if (vI - vO > 0 && vO > 0) {
        result = res1 * (vO / (vI - vO));
      }
    }
    setOutputVal(result);
  }, [mode, vin, r1, r2, vout]);

  const handleModeChange = (newMode: typeof mode) => {
    TactileAudio.playClick();
    setMode(newMode);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  // Determine current glow percentage (0 to 1) for the SVG schematic
  const activeVin = mode === "vin" ? outputVal : parseFloat(vin) || 5;
  const activeVout = mode === "vout" ? outputVal : parseFloat(vout) || 2.5;
  const glowFactor = activeVin > 0 ? Math.min(1, Math.max(0, activeVout / activeVin)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left pane: Controls & Calculations */}
      <div className="lg:col-span-7 space-y-6">
        <div className="border border-accent/20 bg-card/65 p-6">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4">[ FUNCTION MODE ]</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["vout", "vin", "r1", "r2"] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`py-2 px-3 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                  mode === m
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                Solve {m}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
          <div className="font-mono text-[10px] text-accent tracking-widest">[ PARAMETERS ]</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mode !== "vin" && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Vin (V)</label>
                <input
                  type="number"
                  value={vin}
                  onChange={(e) => handleInputChange(setVin, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}
            {mode !== "r1" && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">R1 (Ω)</label>
                <input
                  type="number"
                  value={r1}
                  onChange={(e) => handleInputChange(setR1, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}
            {mode !== "r2" && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">R2 (Ω)</label>
                <input
                  type="number"
                  value={r2}
                  onChange={(e) => handleInputChange(setR2, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}
            {mode !== "vout" && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Vout (V)</label>
                <input
                  type="number"
                  value={vout}
                  onChange={(e) => handleInputChange(setVout, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Readout panel */}
        <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ SOLVED READOUT ]</div>
          <div className="font-mono text-4xl font-light text-accent-glow">
            {mode.toUpperCase()} = {outputVal.toFixed(mode.startsWith("r") ? 1 : 4)}
            <span className="text-lg ml-1">{mode.startsWith("r") ? "Ω" : "V"}</span>
          </div>
          <div className="font-mono text-[9px] text-foreground/40 mt-3 uppercase">
            Formula: Vout = Vin × (R2 / (R1 + R2))
          </div>
        </div>
      </div>

      {/* Right pane: Interactive SVG Schematic & Theory */}
      <div className="lg:col-span-5 space-y-6">
        {/* SVG Schematic */}
        <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[260px]">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ LIVE SCHEMATIC ]</div>
          <svg viewBox="0 0 160 220" className="w-40 h-52 overflow-visible">
            {/* Input node Vin */}
            <circle cx="80" cy="20" r="4" fill="var(--color-accent-glow)" />
            <text x="80" y="10" textAnchor="middle" fill="var(--color-accent-glow)" fontSize="8" fontFamily="JetBrains Mono">
              Vin ({activeVin.toFixed(1)}V)
            </text>
            <line x1="80" y1="20" x2="80" y2="40" stroke="var(--color-accent-glow)" strokeWidth="1.5" />

            {/* Resistor R1 */}
            <g transform="translate(68, 40)">
              <rect x="0" y="0" width="24" height="40" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1.2" />
              <line x1="4" y1="8" x2="20" y2="32" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.3" />
              <line x1="20" y1="8" x2="4" y2="32" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.3" />
              <text x="32" y="24" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono" className="font-semibold">R1</text>
            </g>

            {/* Connect middle node */}
            <line x1="80" y1="80" x2="80" y2="120" stroke="var(--color-accent)" strokeWidth="1.5" />

            {/* Output Node Vout */}
            <line x1="80" y1="100" x2="130" y2="100" stroke={`oklch(0.78 0.13 85 / ${0.2 + glowFactor * 0.8})`} strokeWidth="2" />
            <circle cx="130" cy="100" r="4" fill={`oklch(0.83 0.14 88 / ${0.2 + glowFactor * 0.8})`} style={{ filter: glowFactor > 0.4 ? "drop-shadow(0 0 4px var(--color-accent))" : "none" }} />
            <text x="138" y="103" fill={`oklch(0.78 0.13 85 / ${0.2 + glowFactor * 0.8})`} fontSize="8" fontFamily="JetBrains Mono">
              Vout ({activeVout.toFixed(2)}V)
            </text>

            {/* Resistor R2 */}
            <g transform="translate(68, 120)">
              <rect x="0" y="0" width="24" height="40" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1.2" />
              <line x1="4" y1="8" x2="20" y2="32" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.3" />
              <line x1="20" y1="8" x2="4" y2="32" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.3" />
              <text x="32" y="24" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono" className="font-semibold">R2</text>
            </g>

            {/* Ground line */}
            <line x1="80" y1="160" x2="80" y2="190" stroke="var(--color-accent)" strokeWidth="1.5" />
            <line x1="70" y1="190" x2="90" y2="190" stroke="var(--color-accent)" strokeWidth="1.5" />
            <line x1="73" y1="194" x2="87" y2="194" stroke="var(--color-accent)" strokeWidth="1.5" />
            <line x1="77" y1="198" x2="83" y2="198" stroke="var(--color-accent)" strokeWidth="1.5" />
            <text x="80" y="210" textAnchor="middle" fill="var(--color-foreground)" opacity="0.3" fontSize="6" fontFamily="JetBrains Mono">GND</text>
          </svg>
        </div>

        {/* Theory & Applications */}
        <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ THE THEORY ]</div>
          <p>
            A <strong>voltage divider</strong> is a simple passive linear circuit that scales down an input voltage. The output voltage is directly proportional to R2&apos;s fraction of the total series resistance (R1 + R2).
          </p>
          <div className="font-mono text-[9px] text-accent mt-3 uppercase">[ KEY USES ]</div>
          <ul className="list-decimal pl-4 space-y-1">
            <li>Level-shifting communication lines (e.g., 5V to 3.3V UART).</li>
            <li>ADC scaling to monitor battery voltages safely.</li>
            <li>Interfacing analog resistive sensors (like LDRs/Thermistors).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
