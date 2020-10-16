import React from 'react';
export var handleRender = function (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) {
    if (!window.profiler)
        window.profiler = [];
    window.profiler.push({
        actualDuration: actualDuration,
        baseDuration: baseDuration,
        commitTime: commitTime,
        id: id,
        interactions: interactions,
        phase: phase,
        startTime: startTime,
    });
};
export var AutomationProfiler = function (_a) {
    var children = _a.children, id = _a.id;
    return React.createElement(React.Profiler, { id: id, onRender: handleRender }, children);
};
export default AutomationProfiler;
