"use client";

import SavedWheels from "@/components/Saved";
import WheelCanvas from "@/components/Wheel";
import { WheelConfig, WheelEntry } from "@/types/wheel";
import Image from "next/image";
import { useState } from "react";
import { storage, generateId } from "@/lib/storage";
import EntryList from "@/components/EntryList";

export default function Home() {
  const [entries, setEntries] = useState<WheelEntry[]>([]);
  const [isRigged, setIsRigged] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<WheelConfig | null>(null);
  const [spinHistory, setSpinHistory] = useState<WheelEntry[]>([]);

  const handleSpinComplete = (winner: WheelEntry) => {
    setSpinHistory((prev) => [winner, ...prev.slice(0, 9)]);
  };

  const loadConfig = (config: WheelConfig) => {
    setEntries(config.entries);
    setIsRigged(config.isRigged);
    setCurrentConfig(config);
    setSpinHistory([]);
  };

  const saveConfig = (name: string) => {
    const config: WheelConfig = {
      id: currentConfig?.id || generateId(),
      name,
      entries,
      isRigged,
      createdAt: currentConfig?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    storage.saveConfig(config);
    setCurrentConfig(config);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center p-6 bg-white dark:bg-black sm:items-start">
        <div className="flex items-end">
          <Image
            className="dark:invert"
            src="/favicon.ico"
            alt="Next.js logo"
            width={40}
            height={20}
            priority
          />
          <div className="blur-[0.75px] text-blue-700 font-black text-lg">
            Erg
          </div>
          <div className="blur-[0.75px] text-blue-600 font-black text-lg">
            uuley🌀
          </div>
        </div>

        <div className="pt-8">
          <WheelCanvas
            entries={entries}
            isRigged={isRigged}
            onSpinComplete={handleSpinComplete}
          />
        </div>
        <div className="w-full pt-6">
          <SavedWheels
            currentConfig={currentConfig}
            onLoad={loadConfig}
            onSave={saveConfig}
          />
        </div>
        <div className="w-full pt-6">
          <EntryList
            entries={entries}
            isRigged={isRigged}
            onEntriesChange={setEntries}
            onRiggedChange={setIsRigged}
          />
        </div>
      </main>
    </div>
  );
}
