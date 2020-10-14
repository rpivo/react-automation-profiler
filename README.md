# react-automation-profiler

Analyze your React app's renders with automated flows using Puppeteer run through React's Profiler API, and compare data from different builds on auto-generated D3 charts.

## Setup

To profile specific component trees, import `AutomationProfiler` from `react-automation-profiler`. `AutomationProfiler` can wrap any component that you want to profile. It needs only one prop: `id: string`. Try to make the `id` short and sweet, ideally five characters or less.

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
