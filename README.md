# react-automation-profiler

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
