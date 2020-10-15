# react-automation-profiler

Analyze your React app's renders with automated user flows that generate comparison charts. Run flows before and after major changes to see how it affects components and renders, or run them on every build.

## Setup

### AutomationProfiler Component

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

### Flows

You can define your automation flows in a file called **flows.js** at the root of your repo.

Export a default object containing keys that represent each of your automation flows. In the below example, there are three flows:
- `'Toggle PlayArea Card Active'`
- `'Click Each PlayArea Card'`
- `'Draw Card'`

**flows.js**
```js
import { FlowActions } from 'react-automation-profiler';

const { CLICK } = FlowActions;

export default {
  'Toggle PlayArea Card Active': [
    [CLICK, 'div.playArea div.card'],
    [CLICK, 'div.playArea'],
  ],
  'Click Each PlayArea Card': [
    [CLICK, 'div.playArea div.card:nth-of-type(1)'],
    [CLICK, 'div.playArea div.card:nth-of-type(2)'],
    [CLICK, 'div.playArea div.card:nth-of-type(3)'],
    [CLICK, 'div.playArea div.card:nth-of-type(4)'],
    [CLICK, 'div.playArea div.card:nth-of-type(5)'],
    [CLICK, 'div.playArea'],
  ],
  'Draw Card': [
    [CLICK, 'div.stackedCard'],
    [CLICK, 'div.playArea'],
  ],
};
```

For convenience, the `'click'` action type is the default value and can therefore be omitted. A series of click actions can be combined into a single array:
```js
export default {
  'Toggle PlayArea Card Active': [
    'div.playArea div.card',
    'div.playArea',
  ],
  'Click Each PlayArea Card': [
    'div.playArea div.card:nth-of-type(1)',
    'div.playArea div.card:nth-of-type(2)',
    'div.playArea div.card:nth-of-type(3)',
    'div.playArea div.card:nth-of-type(4)',
    'div.playArea div.card:nth-of-type(5)',
    'div.playArea',
  ],
  'Draw Card': [
    'div.stackedCard',
    'div.playArea',
  ],
};
```