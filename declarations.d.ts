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
    cwd: string;
    includeMount: boolean;
    packagePath: string;
    port: number;
    serverPath: string;
    url: string;
  } & {
    [key: string]: boolean | number | string;
  };
}

export {};
