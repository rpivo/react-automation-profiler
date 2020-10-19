declare global {
  namespace NodeJS {
    interface Global {
      automation: {
        cwd: string;
        includeMount: boolean;
        packagePath: string;
        port: number;
        serverPath: string;
        url: string;
      };
    }
  }
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
