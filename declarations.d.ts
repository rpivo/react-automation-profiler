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

  type AutomationProps = {
    averageOf: number;
    cwd: string;
    includeMount: boolean;
    packagePath: string;
    serverPort: number;
    url: string;
  } & {
    [key: string]: boolean | number | string;
  };
}

export {};
