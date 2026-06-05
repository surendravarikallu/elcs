"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { TactileAudio } from "./ittalk/TactileAudio";
import { submitEnquiry } from "@/app/actions/enquiry";
import type { Product } from "@/types/database";

interface ProductDetailsDrawerProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailsDrawer({ product, onClose }: ProductDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "code">("specs");
  const [copied,    setCopied]    = useState(false);

  // Quote form state (must be declared before the early return)
  const [quoteOpen,    setQuoteOpen]    = useState(false);
  const [quoteSent,    setQuoteSent]    = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteErr,     setQuoteErr]     = useState("");
  const [qf, setQf] = useState({ name: "", email: "", phone: "", company: "", qty: "1", message: "" });
  const quoteRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  const handleClose = () => {
    TactileAudio.playClick();
    onClose();
  };

  const handleTabChange = (tab: "specs" | "code") => {
    TactileAudio.playClick();
    setActiveTab(tab);
  };

  // Helper to generate dynamic example code for ECE engineers
  const getIntegrationCode = (p: Product) => {
    const nameUpper = p.name.toUpperCase().replace(/\s+/g, "_");
    const isI2c = p.tags.some(t => t.toLowerCase().includes("i2c"));
    const isSpi = p.tags.some(t => t.toLowerCase().includes("spi"));
    const isUart = p.tags.some(t => t.toLowerCase().includes("uart") || t.toLowerCase().includes("serial"));

    if (isI2c) {
      return `// Arduino / ESP32 Wire (I2C) Integration Example for ELCS ${p.name}
#include <Wire.h>

#define ${nameUpper}_I2C_ADDR  0x3A // Default Module Address

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA on Pin 21, SCL on Pin 22
  
  // Verify connection
  Wire.beginTransmission(${nameUpper}_I2C_ADDR);
  byte error = Wire.endTransmission();
  if (error == 0) {
    Serial.println("ELCS ${p.name} initialized successfully.");
  } else {
    Serial.println("ELCS Module not detected. Check lines.");
  }
}

void loop() {
  Wire.beginTransmission(${nameUpper}_I2C_ADDR);
  Wire.write(0x00); // Command byte / Register pointer
  Wire.endTransmission();
  
  Wire.requestFrom(${nameUpper}_I2C_ADDR, 2); // Request 2 bytes of data
  if (Wire.available() >= 2) {
    byte msb = Wire.read();
    byte lsb = Wire.read();
    int reading = (msb << 8) | lsb;
    Serial.printf("Telemetry Readout: %d\\n", reading);
  }
  delay(500);
}`;
    }

    if (isSpi) {
      return `// ESP-IDF SPI Master Example for ELCS ${p.name}
#include <stdio.h>
#include "driver/spi_master.h"
#include "driver/gpio.h"

#define PIN_NUM_MISO 19
#define PIN_NUM_MOSI 23
#define PIN_NUM_CLK  18
#define PIN_NUM_CS   5

void app_main(void) {
    spi_bus_config_t buscfg = {
        .miso_io_num = PIN_NUM_MISO,
        .mosi_io_num = PIN_NUM_MOSI,
        .sclk_io_num = PIN_NUM_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1
    };
    
    spi_device_interface_config_t devcfg = {
        .clock_speed_hz = 1000000, // 1 MHz
        .mode = 0,                 // SPI mode 0
        .spics_io_num = PIN_NUM_CS,
        .queue_size = 7
    };
    
    // Initialize SPI bus
    spi_bus_initialize(SPI2_HOST, &buscfg, SPI_DMA_CH_AUTO);
    spi_device_handle_t spi;
    spi_bus_add_device(SPI2_HOST, &devcfg, &spi);
    
    printf("ELCS ${p.name} SPI device interface initialized.\\n");
}`;
    }

    if (isUart) {
      return `# MicroPython Serial UART Driver for ELCS ${p.name}
from machine import UART, Pin
import time

# Initialize UART1 on pins 4 (TX) and 5 (RX)
uart = UART(1, baudrate=9600, tx=Pin(4), rx=Pin(5))

print("Initializing ELCS ${p.name} serial interface...")
uart.write(b"INIT_CMD\\r\\n")

while True:
    if uart.any():
        data = uart.readline()
        print("Telemetry packet rx:", data.decode('utf-8').strip())
    time.sleep(0.1)`;
    }

    // Default generic python script
    return `# Generic Python Integration Guide for ${p.name}
# Requires RPi.GPIO or smbus2 depending on physical protocol

class ELCS_${nameUpper}_Controller:
    def __init__(self, interface="/dev/ttyAMA0", baud=9600):
        self.interface = interface
        self.baudrate = baud
        print(f"Connecting to ELCS ${p.name} on {interface}...")

    def read_telemetry(self):
        # Read raw buffer
        return {"status": "NOMINAL", "frame_rx": 255}

if __name__ == "__main__":
    controller = ELCS_${nameUpper}_Controller()
    print("Module state:", controller.read_telemetry())`;
  };

  const handleCopyCode = () => {
    TactileAudio.playClick();
    navigator.clipboard.writeText(getIntegrationCode(product));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenQuote = () => {
    TactileAudio.playClick();
    setQuoteOpen(true);
    setTimeout(() => quoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteLoading(true);
    setQuoteErr("");
    try {
      const result = await submitEnquiry({
        name:         qf.name,
        email:        qf.email,
        phone:        qf.phone    || undefined,
        company:      qf.company  || undefined,
        message:      qf.message  || undefined,
        product_id:   product.id,
        product_name: product.name,
        quantity:     parseInt(qf.qty) || 1,
      });
      if (result.success) {
        setQuoteSent(true);
      } else {
        setQuoteErr(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setQuoteErr("Network error. Please try again.");
    }
    setQuoteLoading(false);
  };

  const hasSpecs = Object.keys(product.specs || {}).length > 0;
  const priceLabel = product.price != null
    ? `₹${product.price.toLocaleString("en-IN")}`
    : "Contact for Price";

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      {/* Backdrop backdrop-blur flattens 3D layers, but here we use a solid darkened background for accessibility & performance */}
      <motion.div
        className="absolute inset-0 bg-background/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Drawer Body */}
      <motion.div
        className="relative w-full md:w-[600px] h-full bg-card border-l border-border flex flex-col z-10"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
      >
        {/* Subtle laboratory grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {/* Header Section */}
        <div className="relative p-6 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <div className="font-mono text-[9px] text-accent tracking-[0.3em] uppercase mb-1">
              [ TECHNICAL SPECIFICATIONS SHELL ]
            </div>
            <h2 className="font-product text-2xl md:text-3xl text-foreground font-semibold tracking-tight leading-tight">
              {product.name}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="md:hidden w-10 h-10 flex items-center justify-center border border-border/40 hover:border-accent hover:bg-accent/5 text-foreground hover:text-accent cursor-pointer transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
          
          {/* Product Image and Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-5 aspect-square bg-background/50 border border-border overflow-hidden relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover grayscale-[20%]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <svg viewBox="0 0 80 60" className="w-16 h-12" fill="none" stroke="var(--color-accent)" strokeWidth="0.8">
                    <rect x="10" y="8" width="60" height="44" rx="2" />
                    <line x1="20" y1="20" x2="60" y2="20" />
                    <circle cx="55" cy="38" r="6" />
                  </svg>
                </div>
              )}
            </div>

            <div className="sm:col-span-7 space-y-3 font-mono text-[10px]">
              <div className="flex justify-between py-1.5 border-b border-border/5">
                <span className="text-foreground/45">CATEGORY</span>
                <span className="text-accent uppercase">{product.category?.name || "Uncategorized"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/5">
                <span className="text-foreground/45">PRICE BASIS</span>
                <span className="text-accent-glow font-medium">{priceLabel}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foreground/45">TELEMETRY ID</span>
                <span className="text-foreground/60">{product.slug.toUpperCase()}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {product.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[9px] tracking-[0.1em] px-2 py-0.5 border border-border bg-background/20 text-foreground/55">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase">[ OVERVIEW ]</div>
              <p className="font-product text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap font-light">
                {product.description}
              </p>
            </div>
          )}

          {/* Details Tabs */}
          <div className="space-y-4">
            <div className="flex border-b border-border">
              <button
                onClick={() => handleTabChange("specs")}
                className={`py-2 px-4 font-mono text-[10px] tracking-wider uppercase border-b-2 cursor-pointer transition-all ${
                  activeTab === "specs"
                    ? "border-accent text-accent"
                    : "border-transparent text-foreground/50 hover:text-foreground"
                }`}
              >
                [01] Parameters
              </button>
              <button
                onClick={() => handleTabChange("code")}
                className={`py-2 px-4 font-mono text-[10px] tracking-wider uppercase border-b-2 cursor-pointer transition-all ${
                  activeTab === "code"
                    ? "border-accent text-accent"
                    : "border-transparent text-foreground/50 hover:text-foreground"
                }`}
              >
                [02] Integration Guide
              </button>
            </div>

            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div className="space-y-3">
                {hasSpecs ? (
                  <div className="border border-border/40 bg-background/20 p-4 font-mono text-[10px] divide-y divide-border/5">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-2 items-center">
                        <span className="text-foreground/45 uppercase tracking-wider">{key.replace(/_/g, " ")}</span>
                        <span className="text-accent-glow font-medium text-right ml-4">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 font-mono text-[10px] text-foreground/45 border border-dashed border-border/35">
                    NO DYNAMIC PARAMETERS REGISTERED IN DB
                  </div>
                )}
              </div>
            )}

            {/* Code Tab */}
            {activeTab === "code" && (
              <div className="space-y-2 relative">
                <button
                  onClick={handleCopyCode}
                  className="absolute top-3 right-3 py-1 px-3 bg-accent/10 border border-accent/30 font-mono text-[9px] text-accent tracking-wider uppercase hover:bg-accent/25 transition-colors z-10 cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <pre className="border border-border/40 bg-background/50 p-4 font-mono text-[10px] text-[#81a1c1] overflow-x-auto whitespace-pre leading-relaxed select-text max-h-[300px]">
                  <code>{getIntegrationCode(product)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ── Quote Form (injected into scrollable area) ── */}
        {quoteOpen && (
          <div ref={quoteRef} className="mx-6 mb-6 border border-accent/25 bg-background/40 p-5 space-y-4">
            <div className="font-mono text-[9px] text-accent tracking-[0.4em]">
              [ REQUEST QUOTE — {product.name.toUpperCase()} ]
            </div>

            {quoteSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="font-mono text-[10px] text-accent tracking-[0.3em]">✓ ENQUIRY RECEIVED</div>
                <p className="font-body text-sm text-foreground/50">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Name *</label>
                    <input
                      required
                      value={qf.name}
                      onChange={(e) => setQf((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-transparent border-b border-foreground/20 pb-1.5 font-body text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={qf.email}
                      onChange={(e) => setQf((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full bg-transparent border-b border-foreground/20 pb-1.5 font-body text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Phone</label>
                    <input
                      value={qf.phone}
                      onChange={(e) => setQf((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 00000 00000"
                      className="w-full bg-transparent border-b border-foreground/20 pb-1.5 font-body text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={qf.qty}
                      onChange={(e) => setQf((p) => ({ ...p, qty: e.target.value }))}
                      className="w-full bg-transparent border-b border-foreground/20 pb-1.5 font-body text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Company / Institution</label>
                  <input
                    value={qf.company}
                    onChange={(e) => setQf((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Optional"
                    className="w-full bg-transparent border-b border-foreground/20 pb-1.5 font-body text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Message</label>
                  <textarea
                    rows={3}
                    value={qf.message}
                    onChange={(e) => setQf((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Custom requirements, bulk order details, etc."
                    className="w-full bg-transparent border border-foreground/10 p-2.5 font-body text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
                {quoteErr && (
                  <p className="font-mono text-[9px] text-destructive">{quoteErr}</p>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={quoteLoading}
                    className="flex-1 font-mono text-[10px] tracking-[0.3em] py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-all uppercase disabled:opacity-40 cursor-pointer"
                  >
                    {quoteLoading ? "SENDING…" : "SUBMIT ENQUIRY"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteOpen(false)}
                    className="font-mono text-[10px] tracking-[0.3em] px-5 py-3 border border-foreground/15 text-foreground/35 hover:border-foreground/30 transition-colors uppercase cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-background/30 shrink-0 grid grid-cols-2 gap-4">
          {product.manual_url ? (
            <a
              href={product.manual_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center font-mono text-[10px] tracking-[0.25em] py-3.5 border border-border hover:border-accent hover:text-accent transition-colors uppercase cursor-pointer"
              onClick={() => TactileAudio.playClick()}
            >
              Datasheet
            </a>
          ) : (
            <button
              disabled
              className="text-center font-mono text-[10px] tracking-[0.25em] py-3.5 border border-border/20 text-foreground/30 uppercase cursor-not-allowed"
            >
              No Datasheet
            </button>
          )}

          <button
            onClick={quoteSent ? undefined : quoteOpen ? () => setQuoteOpen(false) : handleOpenQuote}
            className={`text-center font-mono text-[10px] tracking-[0.25em] py-3.5 border uppercase font-medium transition-all cursor-pointer ${
              quoteSent
                ? "border-accent/30 text-accent/50 cursor-default"
                : "border-accent bg-accent/5 text-accent hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {quoteSent ? "✓ ENQUIRY SENT" : quoteOpen ? "CLOSE FORM" : "Request Quote"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
