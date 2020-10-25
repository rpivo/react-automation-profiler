# react-automation-profiler

Analyze your React app's renders with automated user flows that generate comparison charts. Run flows before and after major changes to see how it affects components and renders, or run them on every build.

### Contents
- [Install](#Install)
- [Wrapping Components With AutomationProfiler](#Wrapping-Components-With-AutomationProfiler)
- [Automation Flows](#Automation-Flows)
- [CLI: Generating Charts](#CLI-Generating-Charts)
- [`rap` options](#rap-options)

## Install

`npm i -D react-automation-profiler`

or

`yarn add react-automation-profiler --dev`

## Wrapping Components With AutomationProfiler

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
    <DeeplyNestedComponent />
  </AutomationProfiler>;
```

You can wrap as many components and at as many levels as you want. `react-automation-profiler` will track all of these components' renders and auto-generate charts based on render metrics of these components during specific user flows.

> **Note**: `AutomationProfiler` is meant to be used only when profiling components. You should not use it in production.

## Automation Flows

You can define your automation flows in a file at the root of your repo using the name **react.automation.js**.

Here's an example **react.automation.js** file:

```js
const CLICK = 'click';

module.exports = {
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

There are currently three **action types** that can be used in **react.automation.js**:
- `'click'`
- '`focus`'
- `'hover'`

Each flow has the shape `[key: string]: string[]`. Each key is a string that briefly describes the scenario of the flow, and the value is an array of strings, each item of which alternates between an Action Type that will be evaluated followed by a CSS selector representing the element that the Action Type will be used on.

In the example above, the first flow `'Toggle PlayArea Card Active'` has two actions: clicking the CSS selector `'div.playArea div.card'`, and then clicking the CSS selector `'div.playArea'`. This represents what a user would do when toggling a PlayArea Card's active state.

> **Note**: The automation flows will run one after another in the order they are listed in the automation file. No subsequent page loads happen between each flow.

## CLI: Generating Charts

There are a few prerequisites before you can start generating charts:
- `AutomationProfiler` must be wrapping at least one of your components.
- A **react.automation.js** (or similar) file should be set up at the root of your repo.
- Your app should be running locally (ex: running at `http://localhost:8000/index.html`).

After that, you can then call the `rap` command to generate charts:

```sh
npx rap --page=http://localhost:8000/index.html --watch=src
```

## `rap` options

| option         | type    | required | default | description                                                                                                                                                                                                                                                                                                                                                                       |
|----------------|---------|----------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| page           | string  | yes      |         | the page that automation will be run on.                                                                                                                                                                                                                                                                                                                                          |
| averageOf      | number  | no       | 1       | runs each automation flow n number of times and generates averaged metrics for the flow.                                                                                                                                                                                                                                                                                          |
| changeInterval | number  | no       | 1       | rerun after n number of changes. Note that there is a cooldown of 10 seconds before another change is counted. This flag effectively does nothing without use of the `watch` flag.                                                                                                                                                                                                |
| includeMount   | boolean | no       | false   | includes the initial `mount` phase renders that happen before any automation flows are initialized.                                                                                                                                                                                                                                                                               |
| port           | number  | no       | 1235    | the port that charts will be displayed on.                                                                                                                                                                                                                                                                                                                                        |
| watch          | string  | no       |         | rerun `rap` on any changes to the given build folder. This will save charts from the previous run(s) and generate new charts based on the latest changes, resulting in a new version for each flow. Note that `watch` runs on a 10-second delay to allow the application's local development toolchain to finish building before re-running the automation against the new build. |