"use client";

import React, { useState, useEffect, useRef } from "react";
import { WheelEntry } from "@/types/wheel";
import { generateId, getRandomColor, shuffleArray } from "@/lib/storage";

interface EntryListProps {
  entries: WheelEntry[];
  isRigged: boolean;
  onEntriesChange: (entries: WheelEntry[]) => void;
  onRiggedChange: (rigged: boolean) => void;
}

export default function EntryList({
  entries,
  isRigged,
  onEntriesChange,
  onRiggedChange,
}: EntryListProps) {
  const [textareaValue, setTextareaValue] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [multiplyCount, setMultiplyCount] = useState(2);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ only update textareaValue when entry count changes externally
  useEffect(() => {
    const text = entries.map((e) => e.text).join("\n");
    if (text !== textareaValue) {
      setTextareaValue(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]); // depend only on length to avoid overwriting typing

  const handleTextChange = (value: string) => {
    setTextareaValue(value);

    const lines = value.split("\n").filter((line) => line.trim());
    const newEntries: WheelEntry[] = lines.map((line) => {
      const text = line.trim();
      const existingEntry = entries.find((e) => e.text === text);
      return {
        id: existingEntry?.id || generateId(),
        text,
        color: existingEntry?.color || getRandomColor(),
        probability: existingEntry?.probability || 1,
      };
    });

    onEntriesChange(newEntries);
  };

  // ✅ fix: allow Enter to work even at end of line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        textarea.value.substring(0, start) +
        "\n" +
        textarea.value.substring(end);
      setTextareaValue(newValue);
      handleTextChange(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    }
  };

  const updateEntryProbability = (id: string, probability: number) => {
    onEntriesChange(
      entries.map((e) =>
        e.id === id ? { ...e, probability: Math.max(0, probability) } : e
      )
    );
  };

  const handleShuffle = () => onEntriesChange(shuffleArray(entries));
  const handleSort = () =>
    onEntriesChange([...entries].sort((a, b) => a.text.localeCompare(b.text)));

  const handleClear = () => {
    if (confirm("Clear all entries?")) {
      onEntriesChange([]);
      setTextareaValue("");
    }
  };

  const handleMultiply = () => {
    if (entries.length === 0) return alert("Add entries first");
    if (multiplyCount < 2 || multiplyCount > 100)
      return alert("Multiply count must be 2–100");

    const multiplied: WheelEntry[] = [];
    for (let i = 0; i < multiplyCount; i++) {
      entries.forEach((entry) =>
        multiplied.push({
          id: generateId(),
          text: entry.text,
          color: entry.color || getRandomColor(),
          probability: entry.probability || 1,
        })
      );
    }
    onEntriesChange(multiplied);
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Wheel Entries</h2>

        {/* Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter items (one per line)
          </label>
          <textarea
            ref={textareaRef}
            value={textareaValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Apple\nBanana\nOrange"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y"
            rows={8}
          />
          <p className="text-xs text-gray-500 mt-1">
            Total entries: {entries.length}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            🔀 Shuffle
          </button>
          <button
            onClick={handleSort}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🔤 Sort A-Z
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🗑️ Clear All
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 ${
              showAdvanced ? "bg-orange-600" : "bg-gray-600"
            } text-white rounded-lg`}
          >
            ⚙️ Advanced Mode
          </button>
        </div>

        {/* Advanced */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            {/* Multiply */}
            <div className="pb-4 border-b border-orange-200">
              <h3 className="font-medium text-orange-800 mb-2">
                🔢 Multiply Entries
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm">Multiply all by:</span>
                <input
                  type="number"
                  value={multiplyCount}
                  onChange={(e) => setMultiplyCount(Number(e.target.value))}
                  min="2"
                  max="100"
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={handleMultiply}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Multiply
                </button>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Creates {multiplyCount}× copies →{" "}
                {entries.length * multiplyCount} total
              </p>
            </div>

            {/* Rigged */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={isRigged}
                  onChange={(e) => onRiggedChange(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="font-medium text-orange-800">
                  Enable Rigged Mode
                </span>
              </label>

              {isRigged && (
                <>
                  <p className="text-sm text-orange-600 mb-3">
                    ⚠️ Adjust probabilities:
                  </p>

                  {entries.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-2 p-2 bg-white rounded"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="flex-1 text-sm font-medium truncate">
                            {entry.text}
                          </span>
                          <input
                            type="number"
                            value={entry.probability || 1}
                            onChange={(e) =>
                              updateEntryProbability(
                                entry.id,
                                Number(e.target.value)
                              )
                            }
                            min="0"
                            step="0.5"
                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Add entries to set probabilities
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {entries.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Preview Wheel Slices
            </h3>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm shadow-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate max-w-[120px]">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <p className="font-medium mb-1">💡 Quick Tips:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Press Enter at the end to add a new line (now works ✅)</li>
            <li>Multiply to duplicate all entries</li>
            <li>Use Rigged Mode to set probabilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
