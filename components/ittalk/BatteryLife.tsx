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
  );
}
