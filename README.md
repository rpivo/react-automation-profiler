# react-automation-profiler

## Setup

To set up the React Profiler API and profile specific component trees, import `AutomationProfiler` from `react-automation-profiler`. `AutomationProfiler` can wrap any component that you want to profile. It needs only one prop: `id: string`.

You can wrap your whole application in your index file:

```tsx
import React from 'react';
import { render } from 'react-dom';
import App from 'components/App';
import { AutomationProfiler } from 'react-automation-profiler';

render(
  <AutomationProfiler id='profiler-app'>
    <App />
  </AutomationProfiler>,
  document.getElementById('root'),
);
```
