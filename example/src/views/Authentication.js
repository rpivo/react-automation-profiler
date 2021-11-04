import React from 'react';
import { AutomationProfiler } from 'react-automation-profiler';
import {
  ExampleBox,
  ExampleDescription,
  ExampleDivider,
  ExampleHeading,
  ExampleWidget,
} from '../components';
import { Button, FormControl, InputLabel, Input, Stack } from '@mui/material';

const UserCreds = Object.freeze({
  email: 'rpivo',
  password: 'password',
});

function ExampleInput({ children, handleChange }) {
  const label = 'input-' + children.replaceAll(' ', '-').toLowerCase();
  return (
    <FormControl style={{ marginBottom: '1rem' }}>
      <InputLabel htmlFor={label}>{children}</InputLabel>
      <Input
        aria-describedby="my-helper-text"
        id={label}
        onChange={handleChange}
      />
    </FormControl>
  );
}

export default function Authentication() {
  const [creds, setCreds] = React.useState({
    email: '',
    password: '',
  });
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  function handleInputChange({ ev, inputID }) {
    setCreds({ ...creds, [inputID]: ev.target.value });
  }

  function validate() {
    if (
      creds.email === UserCreds.email &&
      creds.password === UserCreds.password
    ) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }

  return (
    <AutomationProfiler id="authentication">
      <ExampleBox>
        <ExampleHeading>Authentication</ExampleHeading>
        <ExampleDivider />
        <ExampleDescription>
          This example makes use of the <b>leading-steps</b> config object. In
          order to render the message on this route, the user needs to log in to
          the form below.
          <br />
          <br />
          The automation steps for the <b>/authentication</b> route include
          leading-steps which perform these login steps. leading-steps are
          ignored by react-automation-profiler. They can be used to set the
          state of the application before react-automation-profiler begins
          recording renders.
        </ExampleDescription>
        <ExampleWidget>
          {isAuthenticated ? (
            <ExampleHeading>Thank you for logging in!</ExampleHeading>
          ) : (
            <Stack style={{ margin: '0 auto', width: '50%' }}>
              <ExampleInput
                handleChange={(ev) =>
                  handleInputChange({ ev, inputID: 'email' })
                }
              >
                Email address
              </ExampleInput>
              <ExampleInput
                handleChange={(ev) =>
                  handleInputChange({ ev, inputID: 'password' })
                }
              >
                Password
              </ExampleInput>
              <Button
                onClick={validate}
                variant="contained"
                style={{ marginTop: '1.5rem' }}
              >
                SUBMIT
              </Button>
            </Stack>
          )}
        </ExampleWidget>
      </ExampleBox>
    </AutomationProfiler>
  );
}
