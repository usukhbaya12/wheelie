import { WheelConfig, WheelEntry } from "@/types/wheel";

const STORAGE_KEY = "wheel_configs";

export const storage = {
  getConfigs: (): WheelConfig[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const configs = JSON.parse(data);
      // Convert date strings back to Date objects
      return configs.map((config: any) => ({
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt),
      }));
    } catch {
      return [];
    }
  },

  saveConfig: (config: WheelConfig): void => {
    if (typeof window === "undefined") return;
    const configs = storage.getConfigs();
    const existingIndex = configs.findIndex((c) => c.id === config.id);

    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  },

  deleteConfig: (id: string): void => {
    if (typeof window === "undefined") return;
    const configs = storage.getConfigs();
    const filtered = configs.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getConfig: (id: string): WheelConfig | null => {
    const configs = storage.getConfigs();
    return configs.find((c) => c.id === id) || null;
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getRandomColor = (): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#FFD93D",
    "#6BCB77",
    "#FF6B9D",
    "#C44569",
    "#F8C291",
    "#786fa6",
    "#f8b500",
    "#cf1b1b",
    "#00b8a9",
    "#f6416c",
    "#00d2d3",
    "#f38181",
    "#aa96da",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const selectWithProbability = (entries: WheelEntry[]): WheelEntry => {
  const totalProbability = entries.reduce(
    (sum, entry) => sum + (entry.probability || 1),
    0
  );
  let random = Math.random() * totalProbability;

  for (const entry of entries) {
    random -= entry.probability || 1;
    if (random <= 0) {
      return entry;
    }
  }

  return entries[entries.length - 1];
};
