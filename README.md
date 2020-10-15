# react-automation-profiler

Analyze your React app's renders with automated user flows that generate comparison charts. Run flows before and after major changes to see how it affects components and renders, or run them on every build.

## Setup

### AutomationProfiler Component

To profile specific component trees, import the `AutomationProfiler` component from `react-automation-profiler`. `AutomationProfiler` can wrap any component that you want to profile, similarly to how React's Profiler API works. It needs only one prop: `id: string`. Try to make the `id` short. This will help with readability on charts that display many renders.

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

### Flows

You can define your automation flows in a file at the root of your repo using one of these names (in order of precedence):
- **react.automation.js**
- **automation.js**
- **flows.js**

Export a default object containing keys that represent each of your automation flows. In the below example, there are three flows:
- `'Toggle PlayArea Card Active'`
- `'Click Each PlayArea Card'`
- `'Draw Card'`

Import `FlowActions` from `react-automation-profiler` and use its enums to define **action types** within each flow. You can pull off `CLICK`, `FOCUS`, and `HOVER` from `FlowActions`.

**flows.js**
```js
import { ActionTypes } from 'react-automation-profiler';

const { CLICK } = ActionTypes;

export default {
  'Toggle PlayArea Card Active': [
    CLICK, 'div.playArea div.card',
    CLICK, 'div.playArea',
  ],
  'Click Each PlayArea Card': [
    CLICK, 'div.playArea div.card:nth-of-type(1)',
    CLICK, 'div.playArea div.card:nth-of-type(2)',
    CLICK, 'div.playArea div.card:nth-of-type(3)',
    CLICK, 'div.playArea div.card:nth-of-type(4)',
    CLICK, 'div.playArea div.card:nth-of-type(5)',
    CLICK, 'div.playArea',
  ],
  'Draw Card': [
    CLICK, 'div.stackedCard',
    CLICK, 'div.playArea',
  ],
};
```