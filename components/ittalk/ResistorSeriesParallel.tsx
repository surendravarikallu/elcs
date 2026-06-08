"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

interface Resistor {
  id: string;
  value: string;
  unit: "R" | "k" | "M";
}

export function ResistorSeriesParallel() {
  const [config, setConfig] = useState<"series" | "parallel">("series");
  const [resistors, setResistors] = useState<Resistor[]>([
    { id: "1", value: "1000", unit: "R" },
    { id: "2", value: "1000", unit: "R" },
  ]);
  const [totalVal, setTotalVal] = useState<number>(2000);

  useEffect(() => {
    let sum = 0;
    let invSum = 0;
    let validCount = 0;

    resistors.forEach((r) => {
      const vRaw = parseFloat(r.value) || 0;
      if (vRaw <= 0) return;
      validCount++;

      const factor = r.unit === "k" ? 1000 : r.unit === "M" ? 1000000 : 1;
      const val = vRaw * factor;

      sum += val;
      invSum += 1 / val;
    });

    if (config === "series") {
      setTotalVal(sum);
    } else {
      setTotalVal(invSum > 0 && validCount > 0 ? 1 / invSum : 0);
    }
  }, [resistors, config]);

  const handleConfigChange = (newConfig: typeof config) => {
    TactileAudio.playClick();
    setConfig(newConfig);
  };

  const handleAddResistor = () => {
    TactileAudio.playClick();
    if (resistors.length >= 10) return;
    setResistors([
      ...resistors,
      { id: Date.now().toString(), value: "1000", unit: "R" },
    ]);
  };

  const handleRemoveResistor = (id: string) => {
    TactileAudio.playClick();
    if (resistors.length <= 1) return;
    setResistors(resistors.filter((r) => r.id !== id));
  };

  const handleUpdate = (id: string, field: "value" | "unit", val: string) => {
    TactileAudio.playClick();
    setResistors(
      resistors.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const formatValue = (ohms: number): string => {
    if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(3)} MΩ`;
    if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(3)} kΩ`;
    return `${ohms.toFixed(1)} Ω`;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-accent/20 bg-card/65 p-6 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ CIRCUIT CONFIGURATION ]</div>
              <div className="flex gap-2">
                {(["series", "parallel"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleConfigChange(c)}
                    className={`py-2 px-4 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                      config === c
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddResistor}
              disabled={resistors.length >= 10}
              className="py-2 px-4 bg-accent/10 border border-accent/40 font-mono text-[10px] text-accent tracking-wider uppercase hover:bg-accent/20 disabled:opacity-40 cursor-pointer"
            >
              + Add Resistor
            </button>
          </div>

          {/* Resistors list */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-4 max-h-[360px] overflow-y-auto pr-2">
            <div className="font-mono text-[10px] text-accent tracking-widest">[ COMPONENT ARRAY ]</div>
            <div className="space-y-3">
              {resistors.map((r, idx) => (
                <div key={r.id} className="flex items-center gap-3 bg-background/25 p-3 border border-foreground/5">
                  <span className="font-mono text-[10px] text-foreground/40 w-8">R{idx + 1}</span>
                  <input
                    type="number"
                    value={r.value}
                    onChange={(e) => handleUpdate(r.id, "value", e.target.value)}
                    className="flex-1 bg-background border border-foreground/15 py-1 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                  <select
                    value={r.unit}
                    onChange={(e) => handleUpdate(r.id, "unit", e.target.value as "R" | "k" | "M")}
                    className="bg-background border border-foreground/15 py-1 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                  >
                    <option value="R">Ω</option>
                    <option value="k">kΩ</option>
                    <option value="M">MΩ</option>
                  </select>
                  <button
                    onClick={() => handleRemoveResistor(r.id)}
                    disabled={resistors.length <= 1}
                    className="p-1 text-destructive hover:bg-destructive/10 disabled:opacity-30 cursor-pointer"
                    title="Remove component"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Readout panel */}
          <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ EQUIVALENT RESISTANCE ]</div>
            <div className="font-mono text-4xl font-light text-accent-glow">
              Req = {formatValue(totalVal)}
            </div>
          </div>
        </div>

        {/* Right pane: Schematic Visual & Theory */}
        <div className="lg:col-span-5 space-y-6">
          {/* Schematic drawing */}
          <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ TOPOLOGY DIAGRAM ]</div>
            
            <svg viewBox="0 0 200 120" className="w-full h-28 max-w-[280px]">
              {/* Input terminals */}
              <circle cx="20" cy="60" r="3" fill="var(--color-accent)" />
              <circle cx="180" cy="60" r="3" fill="var(--color-accent)" />
              <text x="20" y="50" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="7" fontFamily="JetBrains Mono">A</text>
              <text x="180" y="50" textAnchor="middle" fill="var(--color-foreground)" opacity="0.4" fontSize="7" fontFamily="JetBrains Mono">B</text>

              {config === "series" ? (
                <>
                  {/* Series connection line */}
                  <line x1="20" y1="60" x2="40" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                  {/* 3 placeholder resistors in series */}
                  <g transform="translate(40, 48)">
                    <rect x="0" y="0" width="30" height="24" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1" />
                    <text x="15" y="15" textAnchor="middle" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono">R1</text>
                  </g>
                  <line x1="70" y1="60" x2="85" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <g transform="translate(85, 48)">
                    <rect x="0" y="0" width="30" height="24" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1" />
                    <text x="15" y="15" textAnchor="middle" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono">R2</text>
                  </g>
                  <line x1="115" y1="60" x2="130" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <g transform="translate(130, 48)">
                    <rect x="0" y="0" width="30" height="24" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1" />
                    <text x="15" y="15" textAnchor="middle" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono">Rn</text>
                  </g>
                  <line x1="160" y1="60" x2="180" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                </>
              ) : (
                <>
                  {/* Parallel connection */}
                  <line x1="20" y1="60" x2="50" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <line x1="150" y1="60" x2="180" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                  
                  {/* Vertical bus lines */}
                  <line x1="50" y1="20" x2="50" y2="100" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <line x1="150" y1="20" x2="150" y2="100" stroke="var(--color-accent)" strokeWidth="1.2" />

                  {/* Resistor branch 1 */}
                  <line x1="50" y1="25" x2="70" y2="25" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <g transform="translate(70, 15)">
                    <rect x="0" y="0" width="60" height="20" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1" />
                    <text x="30" y="13" textAnchor="middle" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono">R1</text>
                  </g>
                  <line x1="130" y1="25" x2="150" y2="25" stroke="var(--color-accent)" strokeWidth="1.2" />

                  {/* Resistor branch 2 */}
                  <line x1="50" y1="60" x2="70" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <g transform="translate(70, 50)">
                    <rect x="0" y="0" width="60" height="20" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1" />
                    <text x="30" y="13" textAnchor="middle" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono">R2</text>
                  </g>
                  <line x1="130" y1="60" x2="150" y2="60" stroke="var(--color-accent)" strokeWidth="1.2" />

                  {/* Resistor branch 3 */}
                  <line x1="50" y1="95" x2="70" y2="95" stroke="var(--color-accent)" strokeWidth="1.2" />
                  <g transform="translate(70, 85)">
                    <rect x="0" y="0" width="60" height="20" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1" />
                    <text x="30" y="13" textAnchor="middle" fill="var(--color-foreground)" fontSize="8" fontFamily="JetBrains Mono">Rn</text>
                  </g>
                  <line x1="130" y1="95" x2="150" y2="95" stroke="var(--color-accent)" strokeWidth="1.2" />
                </>
              )}
            </svg>
          </div>

          {/* Theory */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ DESIGN LAWS ]</div>
            <p>
              <strong>Series</strong>: Equivalent resistance simply adds up (R_total = R_1 + R_2 + ...). Total resistance is always <em>larger</em> than the largest individual resistor.
            </p>
            <p>
              <strong>Parallel</strong>: Total resistance is calculated via reciprocals (1/R_total = 1/R_1 + 1/R_2 + ...). The equivalent resistance is always <em>smaller</em> than the smallest individual branch.
            </p>
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
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">What are Series and Parallel Resistors?</h4>
              <p>
                In electronic circuits, resistors can be connected in series, parallel, or a combination of both. These configurations are used to control current, adjust resistance, and distribute voltage according to circuit requirements.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Understanding these configurations is essential for:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Circuit design and analysis</li>
                <li>Power distribution</li>
                <li>Current limiting</li>
                <li>Sensor and signal conditioning</li>
                <li>Load balancing</li>
              </ol>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Series Connection:</h4>
              <p>
                In a series connection, resistors are connected end-to-end, so the same current flows through all resistors.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Same current through all resistors</li>
                <li>Total resistance increases</li>
                <li>Voltage divides across resistors</li>
                <li>Formula: R_total = R₁ + R₂ + R₃ + ...</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Parallel Connection:</h4>
              <p>
                In a parallel connection, all resistors are connected across the same two points, so the voltage across each resistor is the same.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Same voltage across all resistors</li>
                <li>Total resistance decreases</li>
                <li>Current divides between resistors</li>
                <li>Formula: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...</li>
                <li>Two resistor formula: R_total = (R₁ × R₂) / (R₁ + R₂)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Rules:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Series resistance is always greater than the largest resistor.</li>
                <li>Parallel resistance is always smaller than the smallest resistor.</li>
                <li>Use series resistors to increase resistance.</li>
                <li>Use parallel resistors to reduce resistance or increase current capacity.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Key Features:</h4>
              <p>Series calculation | Parallel calculation | Multiple resistor support | Add/remove resistors | Visual circuit diagram</p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Specifications:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Series</td>
                      <td className="p-2 font-mono text-foreground/85">Rtotal = R1 + R2 + ... + Rn</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Parallel</td>
                      <td className="p-2 font-mono text-foreground/85">1/Rt = 1/R1 + 1/R2 + ... + 1/Rn</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Max Resistors</td>
                      <td className="p-2">Up to 10</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Units</td>
                      <td className="p-2">Ω, kΩ, MΩ</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Output</td>
                      <td className="p-2">Equivalent resistance</td>
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
