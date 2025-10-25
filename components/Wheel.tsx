"use client";

import React, { useRef, useState, useEffect } from "react";
import { WheelEntry } from "@/types/wheel";

interface WheelCanvasProps {
  entries: WheelEntry[];
  onSpinComplete?: (winner: WheelEntry) => void;
}

export default function WheelCanvas({
  entries,
  onSpinComplete,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelEntry | null>(null);
  const [rotation, setRotation] = useState(0);

  // Draw the wheel
  const drawWheel = (rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    if (entries.length === 0) {
      ctx.fillStyle = "#777";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add entries to spin!", center, center);
      return;
    }

    const slice = (2 * Math.PI) / entries.length;

    entries.forEach((entry, i) => {
      const start = rotationAngle + i * slice;
      const end = start + slice;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = entry.color || (i % 2 === 0 ? "#3b82f6" : "#60a5fa");
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text - fit automatically inside slice
      const textRadius = radius - 20; // near outer edge
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + slice / 2);

      // Scale text to fit slice
      const maxWidth = radius * slice * 0.6; // 60% of arc length
      let fontSize = 16;
      ctx.font = `bold ${fontSize}px sans-serif`;
      let textWidth = ctx.measureText(entry.text).width;
      while (textWidth > maxWidth && fontSize > 6) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px sans-serif`;
        textWidth = ctx.measureText(entry.text).width;
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.fillText(entry.text, textRadius, 0);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e3a8a";
    ctx.fill();

    // Pointer triangle - tip only inside
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-Math.PI / 2); // point upward
    const tip = radius - 10; // tip inside the wheel
    const base = radius + 20; // base outside
    ctx.beginPath();
    ctx.moveTo(0, -tip); // tip
    ctx.lineTo(-15, -base); // left base
    ctx.lineTo(15, -base); // right base
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(rotation);
  }, [entries, rotation]);

  const spin = () => {
    if (spinning || entries.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const spinDuration = 4000;
    const finalRotation = rotation + Math.PI * 10 + Math.random() * Math.PI * 2;

    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / spinDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = rotation + (finalRotation - rotation) * eased;
      setRotation(angle);
      drawWheel(angle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const normalized =
          ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const slice = (2 * Math.PI) / entries.length;
        const index = Math.floor(
          ((2 * Math.PI - normalized + slice / 2) % (2 * Math.PI)) / slice
        );
        const selected = entries[index];
        setWinner(selected);
        if (onSpinComplete) onSpinComplete(selected);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center mt-8 space-y-4">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="rounded-full border-4 border-blue-500 shadow-md"
      />
      <button
        onClick={spin}
        disabled={spinning || entries.length === 0}
        className={`px-6 py-2 text-white font-bold rounded-full ${
          spinning || entries.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95 transition"
        }`}
      >
        {spinning ? "Spinning..." : "Spin 🌀"}
      </button>
      {winner && (
        <div className="p-3 bg-green-100 border border-green-500 rounded-lg font-semibold text-green-800">
          🎉 Winner: {winner.text}
        </div>
      )}
    </div>
  );
}
