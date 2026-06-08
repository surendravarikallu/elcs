"use client";

import { useState, useEffect } from "react";
import { TactileAudio } from "./TactileAudio";

export function BatteryLife() {
  const [profile, setProfile] = useState<"continuous" | "duty">("continuous");

  // General Inputs
  const [capacityMah, setCapacityMah] = useState("2500"); // mAh (e.g. 18650 cell or AA battery)
  const [voltage, setVoltage] = useState("3.7");         // Volts
  const [derating, setDerating] = useState("85");        // % efficiency (derating factor)

  // Continuous Mode Inputs
  const [loadCurrentMa, setLoadCurrentMa] = useState("150"); // mA

  // Duty Cycle Mode Inputs
  const [activeCurrentMa, setActiveCurrentMa] = useState("120"); // mA during active transmission
  const [activeTimeMs, setActiveTimeMs] = useState("800");      // duration active
  const [sleepCurrentUa, setSleepCurrentUa] = useState("15");    // µA during sleep
  const [periodS, setPeriodS] = useState("60");                  // transmission period (seconds)

  // Calculated values
  const [avgCurrentMa, setAvgCurrentMa] = useState(150);
  const [lifetimeHours, setLifetimeHours] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    const cap = parseFloat(capacityMah) || 0;
    const v = parseFloat(voltage) || 0;
    const eff = (parseFloat(derating) || 0) / 100;

    if (cap <= 0 || v <= 0 || eff <= 0 || eff > 1) {
      setErrorMsg("Capacity, voltage, and efficiency must be positive numbers.");
      return;
    }

    if (profile === "continuous") {
      const iLoad = parseFloat(loadCurrentMa) || 0;
      if (iLoad <= 0) {
        setErrorMsg("Load current must be greater than zero.");
        return;
      }
      setAvgCurrentMa(iLoad);
      // Life = (Cap * Eff) / I
      setLifetimeHours((cap * eff) / iLoad);
    } else {
      const iActive = parseFloat(activeCurrentMa) || 0;
      const tActiveMs = parseFloat(activeTimeMs) || 0;
      const iSleepUa = parseFloat(sleepCurrentUa) || 0;
      const tPeriodS = parseFloat(periodS) || 0;

      if (iActive <= 0 || tActiveMs <= 0 || iSleepUa < 0 || tPeriodS <= 0) {
        setErrorMsg("Duty cycle parameters must be valid positive values.");
        return;
      }

      const tPeriodMs = tPeriodS * 1000;
      if (tActiveMs > tPeriodMs) {
        setErrorMsg("Active duration cannot exceed the total cycle period.");
        return;
      }

      // Convert sleep current from uA to mA
      const iSleepMa = iSleepUa / 1000;

      // Average Current = (Iactive * Tactive + Isleep * Tsleep) / Tperiod
      const tSleepMs = tPeriodMs - tActiveMs;
      const iAvg = (iActive * tActiveMs + iSleepMa * tSleepMs) / tPeriodMs;

      setAvgCurrentMa(iAvg);
      setLifetimeHours((cap * eff) / iAvg);
    }
  }, [profile, capacityMah, voltage, derating, loadCurrentMa, activeCurrentMa, activeTimeMs, sleepCurrentUa, periodS]);

  const handleProfileChange = (newProfile: typeof profile) => {
    TactileAudio.playClick();
    setProfile(newProfile);
  };

  const handleInputChange = (setter: (v: string) => void, val: string) => {
    TactileAudio.playClick();
    setter(val);
  };

  const formatDuration = (hours: number): string => {
    if (isNaN(hours) || !isFinite(hours)) return "N/A";
    
    const days = hours / 24;
    const years = days / 365;

    if (years >= 1) {
      return `${years.toFixed(2)} Years (${Math.round(days)} days)`;
    }
    if (days >= 1) {
      return `${days.toFixed(1)} Days (${Math.round(hours)} hours)`;
    }
    return `${hours.toFixed(1)} Hours`;
  };

  const formatCurrent = (ma: number): string => {
    if (ma < 1) {
      return `${(ma * 1000).toFixed(1)} µA`;
    }
    return `${ma.toFixed(2)} mA`;
  };

  // Charge status graphic indicator (scales with derating / efficiency)
  const chargePct = parseFloat(derating) || 85;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-accent/20 bg-card/65 p-5">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-3">[ DISCHARGE PROFILE ]</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleProfileChange("continuous")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    profile === "continuous"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  Continuous
                </button>
                <button
                  onClick={() => handleProfileChange("duty")}
                  className={`flex-1 py-2 border font-mono text-[10px] tracking-wider uppercase cursor-pointer transition-all ${
                    profile === "duty"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-foreground/15 bg-background/30 text-foreground/60 hover:border-foreground/30"
                  }`}
                >
                  IoT Duty Cycle
                </button>
              </div>
            </div>

            <div className="border border-accent/20 bg-card/65 p-5 flex flex-col justify-center">
              <div className="font-mono text-[10px] text-accent tracking-widest mb-1.5">[ CAPACITY & CELL VOLTAGE ]</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={capacityMah}
                  placeholder="Capacity (mAh)"
                  onChange={(e) => handleInputChange(setCapacityMah, e.target.value)}
                  className="bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                />
                <input
                  type="number"
                  step="any"
                  value={voltage}
                  placeholder="Voltage (V)"
                  onChange={(e) => handleInputChange(setVoltage, e.target.value)}
                  className="bg-background border border-foreground/15 py-1.5 px-2 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-4">
            <div className="font-mono text-[10px] text-accent tracking-widest">
              {profile === "continuous" ? "[ CONTINUOUS RUN METRICS ]" : "[ PULSED LOAD SCHEDULING ]"}
            </div>

            {profile === "continuous" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-foreground/50">Load Current Draw (mA)</label>
                  <input
                    type="number"
                    value={loadCurrentMa}
                    onChange={(e) => handleInputChange(setLoadCurrentMa, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-foreground/50">Cell Efficiency Derating (%)</label>
                  <input
                    type="number"
                    value={derating}
                    onChange={(e) => handleInputChange(setDerating, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-2 px-3 font-mono text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="block font-mono text-[9px] text-foreground/50">Active Curr. (mA)</label>
                  <input
                    type="number"
                    value={activeCurrentMa}
                    onChange={(e) => handleInputChange(setActiveCurrentMa, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-1.5 px-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="block font-mono text-[9px] text-foreground/50">Active Time (ms)</label>
                  <input
                    type="number"
                    value={activeTimeMs}
                    onChange={(e) => handleInputChange(setActiveTimeMs, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-1.5 px-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="block font-mono text-[9px] text-foreground/50">Sleep Curr. (µA)</label>
                  <input
                    type="number"
                    value={sleepCurrentUa}
                    onChange={(e) => handleInputChange(setSleepCurrentUa, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-1.5 px-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="block font-mono text-[9px] text-foreground/50">Period T (sec)</label>
                  <input
                    type="number"
                    value={periodS}
                    onChange={(e) => handleInputChange(setPeriodS, e.target.value)}
                    className="w-full bg-background border border-foreground/15 py-1.5 px-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="font-mono text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5">
                ERROR: {errorMsg}
              </div>
            )}
          </div>

          {/* Readout panel */}
          <div className="border border-accent-glow bg-accent/5 p-6 flex flex-col items-center justify-center text-center">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-2">[ ESTIMATED RUNTIME ]</div>
            <div className="font-mono text-4xl font-light text-accent-glow">
              {formatDuration(lifetimeHours)}
            </div>
            <div className="font-mono text-[10px] text-foreground/50 mt-2">
              Average Current Draw: {formatCurrent(avgCurrentMa)} | Watt-Hours: {((parseFloat(capacityMah) * parseFloat(voltage)) / 1000).toFixed(2)} Wh
            </div>
          </div>
        </div>

        {/* Right pane: Battery status graphic & notes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-accent/20 bg-card/65 p-6 flex flex-col items-center justify-center min-h-[220px]">
            <div className="font-mono text-[10px] text-accent tracking-widest mb-4 align-self-start">[ BATTERY CHARGE & CELL CAPACITY ]</div>
            
            <svg viewBox="0 0 200 120" className="w-full h-32 max-w-[280px]">
              {/* Battery Body */}
              <rect x="40" y="30" width="110" height="60" rx="6" fill="var(--color-background)" stroke="var(--color-accent)" strokeWidth="1.5" />
              {/* Positive Terminal Cap */}
              <path d="M 150 45 L 157 45 L 157 75 L 150 75 Z" fill="var(--color-accent)" />

              {/* Glowing fill level based on capacity factor */}
              <rect
                x="45"
                y="35"
                width={Math.max(2, 100 * (chargePct / 100))}
                height="50"
                rx="3"
                fill="var(--color-accent)"
                opacity="0.25"
              />
              {/* Active flow dots indicating current leaving battery */}
              <line x1="165" y1="60" x2="190" y2="60" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
              <polygon points="187,58 193,60 187,62" fill="var(--color-accent-glow)" />

              {/* In-Cell Info */}
              <text x="95" y="58" textAnchor="middle" fill="var(--color-accent-glow)" fontSize="10" fontFamily="JetBrains Mono">
                {capacityMah} mAh
              </text>
              <text x="95" y="73" textAnchor="middle" fill="var(--color-foreground)" opacity="0.6" fontSize="8" fontFamily="JetBrains Mono">
                {voltage}V Cell
              </text>
            </svg>
          </div>

          {/* Battery usage tips */}
          <div className="border border-accent/20 bg-card/65 p-6 space-y-3 font-body text-xs text-foreground/70 leading-relaxed">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">[ DESIGN TIP ]</div>
            <p>
              Chemical batteries degrade over time and drop their nominal voltage.
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Derating Factor</strong>: Typically set between 75% to 85% to account for self-discharge, cell aging, thermal fluctuations, and voltage regulator conversion loss.</li>
              <li><strong>Duty Cycling</strong>: Pulse mode is highly representative of low-power RF nodes (like BLE, LoRa, or WiFi). Reducing active duration from 800ms to 200ms can often quadruple overall battery lifetime.</li>
            </ul>
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
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">What is Battery Life?</h4>
              <p>
                Battery life is the estimated amount of time a battery can power a device before it needs recharging or replacement. It depends on battery capacity (mAh or Ah), load current consumption (mA or A), operating conditions, and efficiency of the circuit. This calculator helps estimate runtime for both continuous and duty-cycled loads.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Common Applications:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                <li>ESP8266 / ESP32 projects</li>
                <li>IoT sensor nodes</li>
                <li>GPS trackers</li>
                <li>Portable devices</li>
                <li>Wireless sensors</li>
                <li>R&amp;D prototypes</li>
              </ol>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">How It Works:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Battery capacity (mAh) divided by load current (mA) gives runtime in hours.</li>
                <li>Real batteries are not 100% efficient — an efficiency factor (70–90%) is applied.</li>
                <li>For duty-cycled devices, average current is calculated from active and sleep periods.</li>
                <li>Battery chemistry affects nominal voltage and discharge behavior.</li>
                <li>Higher discharge rates reduce effective capacity.</li>
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
                      <td className="p-2 border-r border-foreground/10 font-mono">Capacity</td>
                      <td className="p-2">Battery capacity (mAh or Ah)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">I_load</td>
                      <td className="p-2">Load current (mA or A)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">η (Efficiency)</td>
                      <td className="p-2">Battery efficiency factor (0.7–0.9)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">I_active</td>
                      <td className="p-2">Active mode current (mA)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">T_active</td>
                      <td className="p-2">Active time per cycle (seconds)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">I_sleep</td>
                      <td className="p-2">Sleep mode current (mA)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">T_sleep</td>
                      <td className="p-2">Sleep time per cycle (seconds)</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">I_avg</td>
                      <td className="p-2">Weighted average current (mA)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Battery Chemistry Reference:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <thead>
                    <tr className="border-b border-foreground/15 bg-foreground/5 font-mono text-[10px] uppercase text-accent">
                      <th className="p-2 border-r border-foreground/10">Type</th>
                      <th className="p-2 border-r border-foreground/10">Voltage</th>
                      <th className="p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">Li-ion</td>
                      <td className="p-2 border-r border-foreground/10">3.7V nominal (4.2V full)</td>
                      <td className="p-2">Most common for portable devices</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">Lead-acid</td>
                      <td className="p-2 border-r border-foreground/10">2.0V per cell (12V battery)</td>
                      <td className="p-2">Used in UPS, vehicles</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">LiFePO4</td>
                      <td className="p-2 border-r border-foreground/10">3.2V nominal</td>
                      <td className="p-2">Safer, longer cycle life</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono">NiMH</td>
                      <td className="p-2 border-r border-foreground/10">1.2V per cell</td>
                      <td className="p-2">Rechargeable AA/AAA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Engineering Notes:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Li-ion nominal voltage = 3.7V, full charge = 4.2V.</li>
                <li>Capacity reduces at high discharge current (C-rate).</li>
                <li>Temperature affects battery performance significantly.</li>
                <li>Always add 20–30% safety margin to estimated runtime.</li>
                <li>Deep discharge shortens battery cycle life.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Worked Example (Basic):</h4>
              <p>
                <strong>Given:</strong> Battery = 2000 mAh, Load Current = 200 mA
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Basic battery life: 2000 / 200 = 10 hours.</li>
                <li>With 85% efficiency: (2000 × 0.85) / 200 = 8.5 hours.</li>
                <li><strong>Conclusion:</strong> The device will run approximately 8.5 hours with efficiency losses accounted for.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Worked Example (IoT / Duty Cycle):</h4>
              <p>
                <strong>Given:</strong> Active: 80mA × 5s, Sleep: 0.05mA × 55s, Cycle: 60s, Battery: 2000mAh
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Calculate average current: I_avg = (80 × 5 + 0.05 × 55) / 60 ≈ 6.7 mA.</li>
                <li>Calculate battery life: Life = 2000 / 6.7 ≈ 298 hours ≈ 12.4 days.</li>
                <li><strong>Conclusion:</strong> Using duty cycling, the same 2000mAh battery lasts ~12 days instead of just 10 hours!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Key Features:</h4>
              <p>Basic &amp; advanced (IoT) modes | Efficiency factor support | Duty cycle average current | Battery chemistry selection | Power consumption in Watts &amp; Wh</p>
            </div>
            <div>
              <h4 className="font-mono text-accent text-[11px] uppercase tracking-wider mb-2">Specifications:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-foreground/10 text-left text-xs">
                  <tbody>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Basic Formula</td>
                      <td className="p-2">Life = Capacity / Current</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Advanced</td>
                      <td className="p-2">Life = (Capacity × η) / I_avg</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Avg Current</td>
                      <td className="p-2 font-mono">I_avg = (I_act×T_act + I_slp×T_slp) / T_total</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Capacity Units</td>
                      <td className="p-2">mAh, Ah</td>
                    </tr>
                    <tr className="border-b border-foreground/10">
                      <td className="p-2 border-r border-foreground/10 font-mono text-accent">Output</td>
                      <td className="p-2">Hours, days, power (W, Wh)</td>
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
