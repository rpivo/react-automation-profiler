import React from 'react';

type AutomationProfilerProps = {
  children: React.ReactNode;
  id: string;
};

export const handleRender = (
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<{ id: number; name: string; timestamp: number; }>,
): void => {
  if (!window.profiler) window.profiler = [];
  window.profiler.push({
    actualDuration,
    baseDuration,
    commitTime,
    id,
    interactions,
    phase,
    startTime,
  });
};

export const AutomationProfiler: React.FC<AutomationProfilerProps> =
  ({ children, id }: AutomationProfilerProps): JSX.Element =>
    <React.Profiler id={id} onRender={handleRender}>
      {children}
    </React.Profiler>;

export default AutomationProfiler;
