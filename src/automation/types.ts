export type AutomationLogs = {
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  id: string;
  interactions: Set<Interaction>;
  phase: string;
  startTime: number;
};

export interface Interaction {
  id: number;
  name: string;
  timestamp: number;
}

export interface AutomationResult {
  logs: AutomationLogs[];
  numberOfInteractions: number;
  id: string;
}
