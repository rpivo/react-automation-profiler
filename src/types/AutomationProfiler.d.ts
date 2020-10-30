import React from 'react';
declare type AutomationProfilerProps = {
    children: React.ReactNode;
    id: string;
};
export declare const handleRender: (id: string, phase: string, actualDuration: number, baseDuration: number, startTime: number, commitTime: number, interactions: Set<{
    id: number;
    name: string;
    timestamp: number;
}>) => void;
export declare const AutomationProfiler: React.FC<AutomationProfilerProps>;
export default AutomationProfiler;
