"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

type KnownPair = "vi" | "vr" | "vp" | "ir" | "ip" | "rp";

export function OhmsLaw() {
  const [knownPair, setKnownPair] = useState<KnownPair>("vr");
  
  // Inputs
  const [vVal, setVVal] = useState("5");   // Volts
  const [iVal, setIVal] = useState("0.02"); // Amperes (20mA)
  const [rVal, setRVal] = useState("250");  // Ohms
  const [pVal, setPVal] = useState("0.1");  // Watts

  // Solved values
  const [solvedV, setSolvedV] = useState(5);
  const [solvedI, setSolvedI] = useState(0.02);
  const [solvedR, setSolvedR] = useState(250);
  const [solvedP, setSolvedP] = useState(0.1);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    let v = parseFloat(vVal) || 0;
    let i = parseFloat(iVal) || 0;
    let r = parseFloat(rVal) || 0;
    let p = parseFloat(pVal) || 0;

    try {
      if (knownPair === "vi") {
        if (i === 0) throw new Error("Current cannot be zero");
        r = v / i;
        p = v * i;
      } else if (knownPair === "vr") {
        if (r === 0) throw new Error("Resistance cannot be zero");
        i = v / r;
        p = (v * v) / r;
      } else if (knownPair === "vp") {
        if (v === 0) throw new Error("Voltage cannot be zero");
        i = p / v;
        r = (v * v) / p;
      } else if (knownPair === "ir") {
        v = i * r;
        p = i * i * r;
      } else if (knownPair === "ip") {
        if (i === 0) throw new Error("Current cannot be zero");
        v = p / i;
        r = p / (i * i);
      } else if (knownPair === "rp") {
        if (r <= 0 || p < 0) throw new Error("Values must be positive");
        v = Math.sqrt(p * r);
        i = Math.sqrt(p / r);
      }

      if (v < 0 || i < 0 || r < 0 || p < 0) {
        throw new Error("Values cannot be negative");
      }

      setSolvedV(v);
      setSolvedI(i);
      setSolvedR(r);
      setSolvedP(p);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Invalid inputs");
      TactileAudio.playWarning();
    }
  }, [knownPair, vVal, iVal, rVal, pVal]);

  const handlePairChange = (pair: KnownPair) => {
    TactileAudio.playClick();
    setKnownPair(pair);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  const formatUnit = (val: number, unit: string): string => {
    if (isNaN(val) || !isFinite(val)) return "N/A";
    if (val >= 1e6) return `${(val / 1e6).toFixed(3)} M${unit}`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(3)} k${unit}`;
    if (val < 1 && val > 0) {
      if (val >= 1e-3) return `${(val * 1e3).toFixed(2)} m${unit}`;
      if (val >= 1e-6) return `${(val * 1e6).toFixed(2)} µ${unit}`;
    }
    return `${val.toFixed(3)} ${unit}`;
  };

  // Determine flow animation duration based on current
  // Higher current = faster movement
  const flowDuration = solvedI > 0 ? Math.max(0.2, Math.min(5, 0.1 / solvedI)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left pane: Solver configuration and inputs */}
      <div className="lg:col-span-7 space-y-6">
        <div className="border border-accent/20 bg-card/65 p-6">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4">[ SELECT KNOWN PARAMETERS ]</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(
              [
                { id: "vr", label: "V + R" },
                { id: "vi", label: "V + I" },
                { id: "vp", label: "V + P" },
                { id: "ir", label: "I + R" },
                { id: "ip", label: "I + P" },
                { id: "rp", label: "R + P" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handlePairChange(item.id)}
                className={`py-2 px-1 border font-mono text-[9px] tracking-wider uppercase cursor-pointer text-center transition-all ${
                  knownPair === item.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
          <div className="font-mono text-[10px] text-accent tracking-widest">[ INPUT PARAMETERS ]</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Show inputs conditionally depending on known pair */}
            {(knownPair === "vi" || knownPair === "vr" || knownPair === "vp") && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Voltage (V)</label>
                <input
                  type="number"
                  step="any"
                  value={vVal}
                  onChange={(e) => handleInputChange(setVVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}

            {(knownPair === "vi" || knownPair === "ir" || knownPair === "ip") && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Current (A)</label>
                <input
                  type="number"
                  step="any"
                  value={iVal}
                  onChange={(e) => handleInputChange(setIVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}

            {(knownPair === "vr" || knownPair === "ir" || knownPair === "rp") && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Resistance (Ω)</label>
                <input
                  type="number"
                  step="any"
                  value={rVal}
                  onChange={(e) => handleInputChange(setRVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}

            {(knownPair === "vp" || knownPair === "ip" || knownPair === "rp") && (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Power (W)</label>
                <input
                  type="number"
                  step="any"
                  value={pVal}
                  onChange={(e) => handleInputChange(setPVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="font-mono text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5">
              ERROR: {errorMsg}
            </div>
          )}
        </div>

        {/* Readout panel */}
        <div className="border border-accent-glow bg-accent/5 p-6">
          <div className="font-mono text-[10px] text-accent tracking-widest text-center mb-4">[ COMPLETE CALCULATED METRICS ]</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-background/30 border border-foreground/5">
              <div className="font-mono text-[9px] text-foreground/45 uppercase">Voltage</div>
              <div className="font-mono text-lg font-medium text-accent-glow mt-1">{formatUnit(solvedV, "V")}</div>
            </div>
            <div className="p-3 bg-background/30 border border-foreground/5">
              <div className="font-mono text-[9px] text-foreground/45 uppercase">Current</div>
              <div className="font-mono text-lg font-medium text-accent-glow mt-1">{formatUnit(solvedI, "A")}</div>
            </div>
            <div className="p-3 bg-background/30 border border-foreground/5">
              <div className="font-mono text-[9px] text-foreground/45 uppercase">Resistance</div>
              <div className="font-mono text-lg font-medium text-accent-glow mt-1">{formatUnit(solvedR, "Ω")}</div>
            </div>
            <div className="p-3 bg-background/30 border border-foreground/5">
              <div className="font-mono text-[9px] text-foreground/45 uppercase">Power</div>
              <div className="font-mono text-lg font-medium text-accent-glow mt-1">{formatUnit(solvedP, "W")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right pane: Schematic simulation and formulas */}
      <div className="lg:col-span-5 space-y-6">
        <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
          <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ LIVE CIRCUIT SIMULATION ]</div>
          
          <svg viewBox="0 0 200 120" className="w-full h-32 max-w-[280px]">
            {/* Battery / DC source (Left) */}
            <g transform="translate(35, 60)">
              <circle cx="0" cy="0" r="12" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1.2" />
              <text x="0" y="-18" textAnchor="middle" fill="var(--color-accent-glow)" fontSize="8" fontFamily="JetBrains Mono">
                {solvedV.toFixed(1)}V
              </text>
              <line x1="0" y1="-7" x2="0" y2="7" stroke="var(--color-accent)" strokeWidth="1" />
              <line x1="-7" y1="0" x2="7" y2="0" stroke="var(--color-accent)" strokeWidth="1" />
            </g>

            {/* Resistor (Right) */}
            <g transform="translate(165, 60)">
              <rect x="-8" y="-18" width="16" height="36" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1.2" />
              <text x="0" y="-23" textAnchor="middle" fill="var(--color-accent-glow)" fontSize="8" fontFamily="JetBrains Mono">
                {formatUnit(solvedR, "Ω")}
              </text>
              <text x="0" y="27" textAnchor="middle" fill="var(--color-foreground)" opacity="0.5" fontSize="7" fontFamily="JetBrains Mono">
                {formatUnit(solvedP, "W")}
              </text>
            </g>

            {/* Connecting wires */}
            <path
              id="wire-path"
              d="M 35 48 L 35 25 L 165 25 L 165 42 M 165 78 L 165 95 L 35 95 L 35 72"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.2"
              opacity="0.4"
            />

            {/* Animated electrons along the wire path */}
            {flowDuration > 0 && (
              <path
                d="M 35 48 L 35 25 L 165 25 L 165 42 M 165 78 L 165 95 L 35 95 L 35 72"
                fill="none"
                stroke="var(--color-accent-glow)"
                strokeWidth="1.8"
                strokeDasharray="6, 12"
                style={{
                  animation: `dash ${flowDuration}s linear infinite`,
                }}
              />
            )}

            {/* Electron movement styles */}
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -18;
                }
              }
            `}</style>

            {/* Current direction indicator */}
            <g transform="translate(100, 18)">
              <polygon points="5,-3 11,0 5,3" fill="var(--color-accent-glow)" />
              <text x="-5" y="3" fill="var(--color-accent-glow)" fontSize="8" fontFamily="JetBrains Mono">
                {formatUnit(solvedI, "A")}
              </text>
            </g>
          </svg>
        </div>

        {/* Ohm&apos;s Law formulas */}
        <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ DESIGN LAWS ]</div>
          <p>
            Ohm&apos;s Law governs the fundamental behavior of electrical circuits:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Voltage ($V$)</strong> is the potential difference: $V = I \cdot R$</li>
            <li><strong>Current ($I$)</strong> is the rate of electron flow: $I = V / R$</li>
            <li><strong>Resistance ($R$)</strong> is the opposition to flow: $R = V / I$</li>
            <li><strong>Power ($P$)</strong> is the energy dissipation: $P = V \cdot I = I^2 \cdot R = V^2 / R$</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
