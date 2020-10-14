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

```yml
# toggle the active state of a playArea card
- flow: Toggle PlayArea Card Active
  actions:
  - type: click
    selector: div.playArea div.card
  - type: click
    selector: div.playArea
  # click on each card in the playArea, one by one. Click the playArea at the end to remove
  # card active state
- flow: Click Each PlayArea Card
  actions:
  - type: click
    selector: div.playArea div.card:nth-of-type(1)
  - type: click
    selector: div.playArea div.card:nth-of-type(2)
  - type: click
    selector: div.playArea div.card:nth-of-type(3)
  - type: click
    selector: div.playArea div.card:nth-of-type(4)
  - type: click
    selector: div.playArea div.card:nth-of-type(5)
  - type: click
    selector: div.playArea
  # draw a card. click the playArea afterward to put the hand back in the hidden state
- flow: Draw Card
  actions:
  - type: click
    selector: div.stackedCard
  - type: click
    selector: div.playArea
```