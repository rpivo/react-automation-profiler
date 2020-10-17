# react-automation-profiler

Analyze your React app's renders with automated user flows that generate comparison charts. Run flows before and after major changes to see how it affects components and renders, or run them on every build.

## Install

`npm i -D react-automation-profiler`

or

`yarn add react-automation-profiler --dev`

## Setup

### Wrapping Components to Be Profiled With AutomationProfiler

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

Or, you can wrap deeply nested components:

```tsx
import React from 'react';

export default () =>
  <AutomationProfiler id='p-card'>
    <DeeplyNestedComponent someProp={someValue} />
  </AutomationProfiler>;
```

You can wrap as many components and at as many levels as you want. `react-automation-profiler` will track all of these components' renders and auto-generate charts based on render metrics of these components during specific user experience flows.

⚠️  **Note** ⚠️ `AutomationProfiler` is meant to be used only when profiling components. You should not use it in production.

### Automation Flows

You can define your automation flows in a file at the root of your repo using one of these names (in order of precedence):
- **react.automation.js**
- **automation.js**
- **flows.js**

Here's an example **react.automation.js** file:

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

In this file, export a default object containing keys that represent each of your automation flows. In the above example, there are three flows:
- `'Toggle PlayArea Card Active'`
- `'Click Each PlayArea Card'`
- `'Draw Card'`

Import `ActionTypes` from `react-automation-profiler` and use its enums to define **action types** within each flow.

There are currently three enums available in `ActionTypes`:
- `CLICK`
- `FOCUS`
- `HOVER`

Each flow has the shape `[key: string]: string[]`. Each key is a string that briefly describes the scenario of the flow, and the value is an array of strings, each item of which alternates between an Action Type that will be evaluated followed by a CSS selector representing the element that the Action Type will be used on.

In the example above, the first flow `'Toggle PlayArea Card Active'` has two actions: clicking the CSS selector `'div.playArea div.card'`, and then clicking the CSS selector `'div.playArea'`. This represents what a user would do when toggling a PlayArea Card's active state.

### Generating Charts

There are a few prerequisites before you can start generating charts:
- `AutomationProfiler` must be wrapping at least one of your components.
- A **react.automation.js** (or similar) file should be set up at the root of your repo.
- Your app should be running locally (ex: running at `http://localhost:8000/index.html`).

After that, you can then call the `rap` command to generate charts:

```sh
rap --page=http://localhost:8000/index.html --port=3000
```

`rap` options:
- `page` (required): the page that automation will be run on.
- `port` (optional): the port that charts will be displayed on. This will default to port `1235`, but can be manually set in case `1235` is already in use.
