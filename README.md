# react-automation-profiler

Analyze your React app's renders with automated user flows that generate comparison charts. Run flows before and after major changes to see how it affects components and renders, or run them on every build.

## Setup

To profile specific component trees, import `AutomationProfiler` from `react-automation-profiler`. `AutomationProfiler` can wrap any component that you want to profile. It needs only one prop: `id: string`. Try to make the `id` short, ideally five characters or less. This will help with readability on charts that display many renders.

You can wrap your whole application in your index file:

```tsx
import React from 'react';
import { render } from 'react-dom';
import App from 'components/App';
import { AutomationProfiler } from 'react-automation-profiler';

render(
  <AutomationProfiler id='p-app'>
    <App />
  </AutomationProfiler>,
  document.getElementById('root'),
);
```
