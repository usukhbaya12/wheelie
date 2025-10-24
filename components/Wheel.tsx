"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { WheelEntry } from "@/types/wheel";
import { selectWithProbability } from "@/lib/storage";

interface WheelCanvasProps {
  entries: WheelEntry[];
  isRigged: boolean;
  onSpinComplete?: (winner: WheelEntry) => void;
}

export default function WheelCanvas({
  entries,
  isRigged,
  onSpinComplete,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelEntry | null>(null);
  const animationRef = useRef<number>();
  const startAngleRef = useRef(0);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (entries.length === 0) {
      ctx.font = "16px Gilroy";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Өгөгдөл оруулаарай хө😉", centerX, centerY);
      return;
    }

    const anglePerSlice = (2 * Math.PI) / entries.length;

    // Draw slices
    entries.forEach((entry, index) => {
      const startAngle = startAngleRef.current + index * anglePerSlice;
      const endAngle = startAngle + anglePerSlice;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = entry.color || "#ccc";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSlice / 2);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;

      const maxWidth = radius - 20;
      const text = entry.text;
      const textWidth = ctx.measureText(text).width;

      if (textWidth > maxWidth) {
        const scale = maxWidth / textWidth;
        ctx.font = `bold ${14 * scale}px Arial`;
      }

      ctx.fillText(text, 30, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 10, centerY);
    ctx.lineTo(centerX + radius - 15, centerY - 15);
    ctx.lineTo(centerX + radius - 15, centerY + 15);
    ctx.closePath();
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.strokeStyle = "#8B0000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [entries]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel, rotation]);

  const spin = () => {
    if (isSpinning || entries.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Select winner based on rigged mode
    const selectedEntry = isRigged
      ? selectWithProbability(entries)
      : entries[Math.floor(Math.random() * entries.length)];

    // Calculate final angle to land on the selected entry
    const entryIndex = entries.indexOf(selectedEntry);
    const anglePerSlice = (2 * Math.PI) / entries.length;
    const targetAngle = -entryIndex * anglePerSlice - anglePerSlice / 2;

    // Add multiple rotations for effect
    const totalRotation = targetAngle + Math.PI * 2 * (5 + Math.random() * 3);

    let start: number;
    let currentRotation = startAngleRef.current;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const duration = 4000; // 4 seconds
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      currentRotation = startAngleRef.current + totalRotation * easeOut;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(currentRotation - startAngleRef.current);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          startAngleRef.current = currentRotation % (2 * Math.PI);
          drawWheel();
          ctx.restore();
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(selectedEntry);
        onSpinComplete?.(selectedEntry);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={335}
          height={335}
          className="border-[2px] blur-[0.5px] border-blue-600 rounded-full shadow-lg shadow-slate-200"
        />
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || entries.length === 0}
        className={`blur-[0.75px] px-6 py-3 font-bold text-white rounded-full transition-all transform ${
          isSpinning || entries.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
        }`}
      >
        {isSpinning ? "Эргэж байна хө..." : "Erguuley🌀"}
      </button>

      {winner && (
        <div className="mt-4 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
          <p className="text-xl font-bold text-green-800">
            🎉 Ялагч: {winner.text}
          </p>
        </div>
      )}
    </div>
  );
}
