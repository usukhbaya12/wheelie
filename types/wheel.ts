export interface WheelEntry {
  id: string;
  text: string;
  probability?: number; // For rigged mode
  color?: string;
}

export interface WheelConfig {
  id: string;
  name: string;
  entries: WheelEntry[];
  isRigged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpinResult {
  entry: WheelEntry;
  angle: number;
}
