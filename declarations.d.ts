declare global {
  interface Window {
    profiler: {
      actualDuration: number;
      baseDuration: number;
      commitTime: number;
      id: string;
      interactions: Set<{ id: number; name: string; timestamp: number; }>;
      phase: string;
      startTime: number;
    }[];
  }
}

export {};
