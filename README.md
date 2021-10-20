# react-automation-profiler

<p align="middle" float="left">
  <img src="https://1wgkxk0rgg.execute-api.us-east-1.amazonaws.com/production/last-published/react-automation-profiler" />
  <img src="https://1wgkxk0rgg.execute-api.us-east-1.amazonaws.com/production/latest-version/react-automation-profiler" />
</p>

Analyze your React app's renders with automated user flows that generate comparison charts. Run flows before and after major changes to see how it effects components and renders, or run them on every build.

### What Can You Do?

- Create user flows unique to the app that will automatically be run in the background
- Rerun automation flows every time the codebase is built during development, or rerun after x number of builds
- Compare charts that get generated as you work (or do a before-and-after by stashing major changes) to see if changes are creating more/less renders, reducing render timings, etc.
- Export all generated charts into a single HTML file
- TypeScript support

### Contents

- [Try it out](#try-it-out)
- [Install](#Install)
- [Wrapping Components With AutomationProfiler](#Wrapping-Components-With-AutomationProfiler)
- [Automation Flows](#Automation-Flows)
- [CLI: Generating Charts](#CLI-Generating-Charts)
- [`rap` options](#rap-options)

## Try it out

To try react-automation-profiler out:

### Clone the repo

```sh
git clone git@github.com:rpivo/react-automation-profiler.git
```

### Start the example app

This will install all dependencies and start the example app.

```sh
npm run example
```

### Start `rap`

In a separate terminal:

```sh
npm run rap
```

This will start react-automation-profiler, which will run the automation flows inside example/react.automation.yaml and then generate render charts. These charts should automatically open in your browser once automation is complete.

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
  <AutomationProfiler id="p-app">
    <App />
  </AutomationProfiler>,
  document.getElementById('root')
);
```

Or, you can wrap deeply nested components:

```tsx
import React from 'react';

export default () => (
  <AutomationProfiler id="p-card">
    <DeeplyNestedComponent />
  </AutomationProfiler>
);
```

You can wrap as many components and at as many levels as you want. `react-automation-profiler` will track all of these components' renders and auto-generate charts based on render metrics of these components during specific user flows.

## Automation Flows

You can define your automation flows in a YAML file at the root of your repo using the name **react.automation.yml** (or **.yaml** extension).

Here's an example **react.automation.yml** file:

```yaml
Toggle PlayArea Card Active:
  - click div.playArea div.card
  - click div.playArea
Click Each PlayArea Card:
  - click div.playArea div.card:nth-of-type(1)
  - click div.playArea div.card:nth-of-type(2)
  - click div.playArea div.card:nth-of-type(3)
  - click div.playArea div.card:nth-of-type(4)
  - click div.playArea div.card:nth-of-type(5)
  - click div.playArea
Draw Card:
  - click div.stackedCard
  - click div.playArea
```

In the file above, there are three keys that each represent a different automation flow:

- `Toggle PlayArea Card Active`
- `Click Each PlayArea Card`
- `Draw Card`

In the example above, the first flow `Toggle PlayArea Card Active` has two actions: clicking the CSS selector `div.playArea div.card`, and then clicking the CSS selector `div.playArea`. This represents what a user would do when toggling a PlayArea Card's active state.

There are currently three **action types** that can be used in **react.automation.yaml**:

- `click`
- `focus`
- `hover`

Note that `#` marks the beginning of a comment in YAML, so the HTML tag should always prefix an isolated `id`:

```yaml
- click button#cta
```

> **Note**: The automation flows will run one after another in the order they are listed in the automation file. No subsequent page loads happen between each flow.

## CLI: Generating Charts

There are a few prerequisites before you can start generating charts:

- `AutomationProfiler` must be wrapping at least one of your components.
- A **react.automation.yaml** file should be set up at the root of your repo.
- Your app should be running locally (ex: running at `http://localhost:8000/index.html`).

After that, you can then call the `rap` command in a separate terminal to start generating charts:

```sh
npx rap --page=http://localhost:8000/index.html --watch=dist
```

## `rap` options

| option         | type    | required | default | description                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| page           | string  | yes      |         | the page that automation will be run on.                                                                                                                                                                                                                                                                                                                                                                   |
| averageOf      | number  | no       | 1       | runs each automation flow n number of times and generates averaged metrics for the flow.                                                                                                                                                                                                                                                                                                                   |
| changeInterval | number  | no       | 1       | rerun after n number of changes. Note that there is a cooldown of 10 seconds before another change is counted. This flag effectively does nothing without use of the `watch` flag.                                                                                                                                                                                                                         |
| includeMount   | boolean | no       | false   | includes the initial `mount` phase renders that happen before any automation flows are initialized.                                                                                                                                                                                                                                                                                                        |
| port           | number  | no       | 1235    | the port that charts will be displayed on.                                                                                                                                                                                                                                                                                                                                                                 |
| watch          | string  | no       |         | rerun `rap` on any changes to the given build folder (not source code folder). This will save charts from the previous run(s) and generate new charts based on the latest changes, resulting in a new version for each flow. Note that `watch` runs on a 10-second delay to allow the application's local development toolchain to finish building before re-running the automation against the new build. |
