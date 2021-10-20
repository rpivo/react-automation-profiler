import React from 'react';
import { AutomationProfiler } from 'react-automation-profiler';
import {
  ExampleBox,
  ExampleDescription,
  ExampleDivider,
  ExampleHeading,
} from '../components';

export default function ThreeButtons() {
  return (
    <AutomationProfiler id="authentication">
      <ExampleBox>
        <ExampleHeading>Authentication</ExampleHeading>
        <ExampleDivider />
        <ExampleDescription>This example will show auth.</ExampleDescription>
      </ExampleBox>
    </AutomationProfiler>
  );
}
