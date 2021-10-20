import React from 'react';
import { AutomationProfiler } from 'react-automation-profiler';
import { Button, ButtonGroup, Typography } from '@mui/material';
import {
  ExampleBox,
  ExampleDescription,
  ExampleDivider,
  ExampleHeading,
  ExampleWidget,
} from '../components';

export default function ThreeButtons() {
  const [count, setCount] = React.useState(0);

  function handleSetCount() {
    setCount(count + 1);
  }

  return (
    <AutomationProfiler id="three-buttons">
      <ExampleBox>
        <ExampleHeading variant="h4">Three Buttons</ExampleHeading>
        <ExampleDivider />
        <ExampleDescription>
          This example shows three buttons, each of which has an onClick handler
          connected to a counter that will update state, causing rerenders to
          occur.
        </ExampleDescription>
        <ExampleWidget>
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
          >
            <Button className="first-button" onClick={handleSetCount}>
              Click me once!
            </Button>
            <Button className="second-button" onClick={handleSetCount}>
              Click me twice!
            </Button>
            <Button className="third-button" onClick={handleSetCount}>
              Click me thrice!
            </Button>
          </ButtonGroup>
        </ExampleWidget>
        <Typography variant="h4" style={{ textAlign: 'center' }}>
          {count}
        </Typography>
      </ExampleBox>
    </AutomationProfiler>
  );
}
