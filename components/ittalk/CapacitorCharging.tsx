"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

export function CapacitorCharging() {
  const [mode, setMode] = useState<"charge" | "discharge">("charge");
  
  // Inputs
  const [rVal, setRVal] = useState("10000");   // Ohms
  const [cVal, setCVal] = useState("1e-6");    // Farads (1 µF)
  const [vVal, setVVal] = useState("5");       // Volts (Source Voltage)
  const [tVal, setTVal] = useState("0.01");    // Seconds (Target Time)

  // Calculated state
  const [tau, setTau] = useState(0.01);
  const [solvedVt, setSolvedVt] = useState(3.16);
  const [solvedPercent, setSolvedPercent] = useState(63.2);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    const r = parseFloat(rVal) || 0;
    const c = parseFloat(cVal) || 0;
    const v = parseFloat(vVal) || 0;
    const t = parseFloat(tVal) || 0;

    if (r <= 0 || c <= 0 || v < 0 || t < 0) {
      setErrorMsg("Resistance, capacitance, voltage, and time must be non-negative values.");
      return;
    }

    const calculatedTau = r * c;
    setTau(calculatedTau);

    if (calculatedTau === 0) {
      setSolvedVt(0);
      setSolvedPercent(0);
      return;
    }

    let vt = 0;
    let pct = 0;
    if (mode === "charge") {
      pct = 100 * (1 - Math.exp(-t / calculatedTau));
      vt = v * (1 - Math.exp(-t / calculatedTau));
    } else {
      pct = 100 * Math.exp(-t / calculatedTau);
      vt = v * Math.exp(-t / calculatedTau);
    }

    setSolvedVt(vt);
    setSolvedPercent(pct);
  }, [mode, rVal, cVal, vVal, tVal]);

  const handleModeChange = (newMode: typeof mode) => {
    TactileAudio.playClick();
    setMode(newMode);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  const formatUnit = (val: number, unit: string): string => {
    if (val >= 1) return `${val.toFixed(3)} ${unit}`;
    if (val >= 1e-3) return `${(val * 1e3).toFixed(3)} m${unit}`;
    if (val >= 1e-6) return `${(val * 1e6).toFixed(3)} µ${unit}`;
    if (val >= 1e-9) return `${(val * 1e9).toFixed(3)} n${unit}`;
    return `${val.toExponential(3)} ${unit}`;
  };

  // Generate SVG curve points
  const steps = 50;
  const maxTime = tau * 5; // Graph up to 5 time constants
  let points = "";
  for (let i = 0; i <= steps; i++) {
    const pctX = i / steps;
    const currTime = pctX * maxTime;
    
    let pctY = 0;
    if (mode === "charge") {
      pctY = 1 - Math.exp(-currTime / tau);
    } else {
      pctY = Math.exp(-currTime / tau);
    }

    const x = 20 + pctX * 160;
    const y = 90 - pctY * 70; // invert Y coordinate for SVG
    points += `${x},${y} `;
  }

  // Target time coordinates for cursor
  const targetTime = parseFloat(tVal) || 0;
  const cursorPctX = Math.min(1, targetTime / maxTime);
  const cursorX = 20 + cursorPctX * 160;
  const cursorY = 90 - (solvedPercent / 100) * 70;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Controls & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-accent/20 bg-card/65 p-5">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ MODE SELECT ]</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleModeChange("charge")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    mode === "charge"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  Charging
                </button>
                <button
                  onClick={() => handleModeChange("discharge")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    mode === "discharge"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  Discharging
                </button>
              </div>
            </div>

            <div className="border border-accent/20 bg-card/65 p-5 flex flex-col justify-center">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-1">[ TIME CONSTANT (τ) ]</div>
              <div className="font-mono text-2xl font-light text-accent-glow">
                τ = {formatUnit(tau, "s")}
              </div>
            </div>
          </div>

          <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
            <div className="font-mono text-[10px] text-accent tracking-widest">[ TUNING PARAMETERS ]</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Resistance (Ω)</label>
                <input
                  type="number"
                  value={rVal}
                  onChange={(e) => handleInputChange(setRVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Capacitance (F)</label>
                <input
                  type="text"
                  value={cVal}
                  placeholder="e.g. 1e-6"
                  onChange={(e) => handleInputChange(setCVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Voltage (V)</label>
                <input
                  type="number"
                  value={vVal}
                  onChange={(e) => handleInputChange(setVVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-foreground/50">Target Time (s)</label>
                <input
                  type="number"
                  step="any"
                  value={tVal}
                  onChange={(e) => handleInputChange(setTVal, e.target.value)}
                  className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            {errorMsg && (
              <div className="font-mono text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5">
                ERROR: {errorMsg}
              </div>
            )}
          </div>

          {/* Readout panel */}
          <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ STATE AT TARGET TIME ]</div>
            <div className="font-mono text-4xl font-light text-accent-glow">
              V(t) = {solvedVt.toFixed(3)} V
            </div>
            <div className="font-mono text-[10px] text-foreground/50 mt-2">
              Progress = {solvedPercent.toFixed(2)}% of source | t = {formatUnit(targetTime, "s")}
            </div>
          </div>
        </div>

        {/* Right pane: Graphic and Multiples of Tau table */}
        <div className="lg:col-span-5 space-y-6">
          {/* SVG Curve Plot */}
          <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ DYNAMIC RESPONSE WAVEFORM ]</div>
            
            <svg viewBox="0 0 200 110" className="w-full h-32 max-w-[280px]">
              {/* Grid Lines */}
              <line x1="20" y1="20" x2="180" y2="20" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.1" />
              <line x1="20" y1="55" x2="180" y2="55" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.1" />
              <line x1="20" y1="90" x2="180" y2="90" stroke="var(--color-foreground)" strokeWidth="0.8" opacity="0.3" />
              <line x1="20" y1="20" x2="20" y2="90" stroke="var(--color-foreground)" strokeWidth="0.8" opacity="0.3" />
              
              {/* Cutoff / Multiples of Tau lines */}
              <line x1="52" y1="20" x2="52" y2="90" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.15" />
              <line x1="84" y1="20" x2="84" y2="90" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.15" />
              <line x1="116" y1="20" x2="116" y2="90" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.15" />
              <line x1="148" y1="20" x2="148" y2="90" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.15" />
              <line x1="180" y1="20" x2="180" y2="90" stroke="var(--color-foreground)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.15" />

              {/* Labels */}
              <text x="20" y="98" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">0</text>
              <text x="52" y="98" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">1τ</text>
              <text x="84" y="98" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">2τ</text>
              <text x="116" y="98" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">3τ</text>
              <text x="148" y="98" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">4τ</text>
              <text x="180" y="98" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">5τ</text>

              <text x="12" y="22" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">V₀</text>
              <text x="12" y="92" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="6" fontFamily="JetBrains Mono">0V</text>

              {/* Curve */}
              <polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />

              {/* Target time indicator cursor */}
              {targetTime <= maxTime && (
                <>
                  <line x1={cursorX} y1="90" x2={cursorX} y2={cursorY} stroke="var(--color-accent-glow)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="20" y1={cursorY} x2={cursorX} y2={cursorY} stroke="var(--color-accent-glow)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <circle cx={cursorX} cy={cursorY} r="3" fill="var(--color-accent-glow)" />
                </>
              )}
            </svg>
          </div>

          {/* Transient State Table */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-3">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ TRANSIENT PROGRESS TABLE ]</div>
            <table className="w-full font-mono text-[9px] text-foreground/75">
              <thead>
                <tr className="border-b border-foreground/15 text-left text-foreground/55">
                  <th className="pb-1.5 font-normal">TIME INTERVAL</th>
                  <th className="pb-1.5 font-normal text-right">CHARGE STATE (%)</th>
                  <th className="pb-1.5 font-normal text-right">VOLTAGE (V)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {[1, 2, 3, 4, 5].map((multiplier) => {
                  const curPct = mode === "charge"
                    ? 100 * (1 - Math.exp(-multiplier))
                    : 100 * Math.exp(-multiplier);
                  const curV = (parseFloat(vVal) || 0) * (curPct / 100);
                  return (
                    <tr key={multiplier}>
                      <td className="py-1.5">{multiplier}τ ({formatUnit(tau * multiplier, "s")})</td>
                      <td className="py-1.5 text-right">{curPct.toFixed(1)}%</td>
                      <td className="py-1.5 text-right text-accent-glow">{curV.toFixed(2)} V</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Theory & Specifications */}
      <div className="border border-accent/20 bg-card/65 rounded-sm">
        <details className="group">
          <summary className="flex items-center justify-between p-5 font-mono text-[10px] text-accent tracking-widest uppercase cursor-pointer select-none hover:bg-accent/5 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <span>[ DETAILED THEORY & SPECIFICATIONS ]</span>
            <span className="text-[10px] text-accent/50 transition-transform duration-300 group-open:rotate-180">▼</span>
          </summary>
          <div className="p-6 border-t border-foreground/10 font-body text-xs text-foreground/70 space-y-6 leading-relaxed">
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">What is Capacitor Charging?</h4>
              <p>
                When a capacitor is connected to a voltage source through a resistor, it does not charge instantly. Instead, the voltage across the capacitor increases gradually over time. This charging behavior depends on the resistance (R), the capacitance (C), and the applied voltage (Vin). The rate at which the capacitor charges is determined by the Time Constant (τ).
              </p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Applications of RC Charging Circuits:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Timer circuits (like 555 timer)</li>
                <li>Power-on delay circuits</li>
                <li>Signal filtering</li>
                <li>Debouncing circuits</li>
                <li>Analog waveform generation</li>
                <li>Soft start circuits</li>
              </ol>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">How It Works:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>A resistor (R) is connected in series with a capacitor (C).</li>
                <li>Input voltage (Vin) is applied across R + C.</li>
                <li>Output is taken across the capacitor.</li>
                <li>The capacitor charges gradually following an exponential curve.</li>
                <li>After 5 time constants (5τ), the capacitor is considered fully charged (~99.3%).</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Formula Variables:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <thead>
                    <tr className="border-b border-foreground/15 bg-foreground/5 font-mono text-[10px] uppercase text-accent">
                      <th className="p-2 border-r border-foreground/10">Symbol</th>
                      <th className="p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">Vc(t)</td>
                      <td className="p-2">Capacitor voltage at time t (V)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">Vin</td>
                      <td className="p-2">Input Voltage (V)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">R</td>
                      <td className="p-2">Resistance (Ω)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">C</td>
                      <td className="p-2">Capacitance (F)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">t</td>
                      <td className="p-2">Time (seconds)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">τ (Tau)</td>
                      <td className="p-2">Time Constant = R × C (seconds)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">e</td>
                      <td className="p-2">Euler&apos;s constant (2.718)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Charging Table:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <thead>
                    <tr className="border-b border-foreground/15 bg-foreground/5 font-mono text-[10px] uppercase text-accent">
                      <th className="p-2 border-r border-foreground/10">Time</th>
                      <th className="p-2">Voltage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">1τ</td>
                      <td className="p-2">63.2% of Vin</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">2τ</td>
                      <td className="p-2">86.5% of Vin</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">3τ</td>
                      <td className="p-2">95.0% of Vin</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">4τ</td>
                      <td className="p-2">98.2% of Vin</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">5τ</td>
                      <td className="p-2">99.3% (Fully charged)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Worked Example:</h4>
              <p>
                <strong>Given:</strong> Vin = 5V, R = 10kΩ, C = 100µF
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Calculate Time Constant: τ = R × C = 10,000 × 0.0001 = 1 second.</li>
                <li>Voltage after 1 second (1τ): Vc = 5 × (1 - e⁻¹) = 5 × (1 - 0.368) ≈ 3.16V.</li>
                <li><strong>Conclusion:</strong> After 1 second, the capacitor reaches ~63% of 5V (3.16V). After 5 seconds (5τ), it is almost fully charged (~5V).</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Key Features:</h4>
              <p>Time constant (τ) calculation | Capacitor voltage at any time t | Charging time table (1τ to 5τ) | Worked example with step-by-step | Interactive RC charging calculator</p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Specifications:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Time Constant</td>
                      <td className="p-2 font-mono">τ = R × C</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Charging Formula</td>
                      <td className="p-2 font-mono">Vc(t) = Vin × (1 - e^(-t/RC))</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Full Charge</td>
                      <td className="p-2">~5τ (99.3%)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">At 1τ</td>
                      <td className="p-2">63.2% of Vin</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Output</td>
                      <td className="p-2">τ, Vc(t), charging table</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
