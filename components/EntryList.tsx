"use client";

import React, { useState } from "react";
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
  const [newEntry, setNewEntry] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addEntry = () => {
    if (!newEntry.trim()) return;

    const entry: WheelEntry = {
      id: generateId(),
      text: newEntry.trim(),
      color: getRandomColor(),
      probability: 1,
    };

    onEntriesChange([...entries, entry]);
    setNewEntry("");
  };

  const removeEntry = (id: string) => {
    onEntriesChange(entries.filter((e) => e.id !== id));
  };

  const updateEntryProbability = (id: string, probability: number) => {
    onEntriesChange(
      entries.map((e) =>
        e.id === id ? { ...e, probability: Math.max(0, probability) } : e
      )
    );
  };

  const handleShuffle = () => {
    onEntriesChange(shuffleArray(entries));
  };

  const handleSort = () => {
    const sorted = [...entries].sort((a, b) => a.text.localeCompare(b.text));
    onEntriesChange(sorted);
  };

  const handleBulkAdd = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const newEntries = lines.map((line) => ({
      id: generateId(),
      text: line.trim(),
      color: getRandomColor(),
      probability: 1,
    }));
    onEntriesChange([...entries, ...newEntries]);
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Wheel Entries</h2>

        {/* Add Entry Form */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEntry()}
            placeholder="Enter a new item..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addEntry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            plus{" "}
          </button>
        </div>

        {/* Bulk Add */}
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Bulk add entries (one per line)
          </summary>
          <div className="mt-2">
            <textarea
              placeholder="Enter multiple items (one per line)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              onBlur={(e) => {
                if (e.target.value) {
                  handleBulkAdd(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
        </details>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            Shuffle
          </button>
          <button
            onClick={handleSort}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            Sort A-Z
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 ${
              showAdvanced ? "bg-orange-600" : "bg-gray-600"
            } text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2`}
          >
            Advanced Mode
          </button>
        </div>

        {/* Advanced Mode Toggle */}
        {showAdvanced && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRigged}
                onChange={(e) => onRiggedChange(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="font-medium text-orange-800">
                Enable Rigged Mode (Set custom probabilities)
              </span>
            </label>
            {isRigged && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Rigged mode is active! Adjust probabilities below.
              </p>
            )}
          </div>
        )}

        {/* Entry List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No entries yet. Add some items to get started!
            </p>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="flex-1 font-medium">{entry.text}</span>

                {isRigged && showAdvanced && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Weight:</label>
                    <input
                      type="number"
                      value={entry.probability || 1}
                      onChange={(e) =>
                        updateEntryProbability(entry.id, Number(e.target.value))
                      }
                      min="0"
                      step="0.1"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}

                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  trash
                </button>
              </div>
            ))
          )}
        </div>

        {/* Entry Count */}
        <div className="mt-4 text-sm text-gray-600">
          Total entries: {entries.length}
          {isRigged && showAdvanced && entries.length > 0 && (
            <span className="ml-2">
              | Total weight:{" "}
              {entries
                .reduce((sum, e) => sum + (e.probability || 1), 0)
                .toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
