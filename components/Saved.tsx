"use client";

import React, { useState, useEffect } from "react";
import { WheelConfig } from "@/types/wheel";
import { storage } from "@/lib/storage";
import { AltArrowUpBold, AltArrowDownBold } from "solar-icons";

interface SavedWheelsProps {
  currentConfig: WheelConfig | null;
  onLoad: (config: WheelConfig) => void;
  onSave: (name: string) => void;
}

export default function SavedWheels({
  currentConfig,
  onLoad,
  onSave,
}: SavedWheelsProps) {
  const [savedConfigs, setSavedConfigs] = useState<WheelConfig[]>([]);
  const [saveName, setSaveName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    setSavedConfigs(storage.getConfigs());
  };

  const handleSave = () => {
    if (!saveName.trim()) {
      alert("Please enter a name for this wheel configuration");
      return;
    }
    onSave(saveName.trim());
    setSaveName("");
    loadConfigs();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this wheel configuration?")) {
      storage.deleteConfig(id);
      loadConfigs();
    }
  };

  const filteredConfigs = savedConfigs.filter((config) =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white w-full border border-blue-50 rounded-t-3xl shadow-md shadow-slate-200">
      {/* Header */}
      <div
        className="p-5 border-b border-blue-600 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold">Загварууд</h2>
            <div className="text-sm text-blue-600 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <div>{savedConfigs.length}</div>
            </div>
          </div>
          {isExpanded ? (
            <AltArrowUpBold width={18} />
          ) : (
            <AltArrowDownBold width={18} />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Save Current Configuration */}
          {currentConfig && currentConfig.entries.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Enter name to save current wheel..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          {savedConfigs.length > 0 && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved wheels..."
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Saved Configs List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredConfigs.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">
                {searchTerm ? "No matching wheels found" : "Алга байна."}
              </p>
            ) : (
              filteredConfigs.map((config) => (
                <div
                  key={config.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{config.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {config.entries.length} entries
                        {config.isRigged && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                            Rigged
                          </span>
                        )}
                      </p>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        {formatDate(config.createdAt)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {config.entries.slice(0, 5).map((entry, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {entry.text}
                          </span>
                        ))}
                        {config.entries.length > 5 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                            +{config.entries.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onLoad(config)}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Load this wheel"
                      >
                        dwnld{" "}
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Delete this wheel"
                      >
                        trsh
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
