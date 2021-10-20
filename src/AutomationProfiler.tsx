import React from 'react';

function handleRender(
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<{ id: number; name: string; timestamp: number }>
): void {
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
}

function AutomationProfiler({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}): JSX.Element {
  return (
    <React.Profiler id={id} onRender={handleRender}>
      {children}
    </React.Profiler>
  );
}

export default AutomationProfiler;
