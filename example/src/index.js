import React from "react";
import ReactDOM from "react-dom";
import { Authentication, ThreeButtons } from "./views";
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <main style={{ padding: "5rem" }}>
      <Router>
        <Route exact path="/">
          <Redirect to="three-buttons" />
        </Route>
        <Route path="/authentication">
          <Authentication />
        </Route>
        <Route path="/three-buttons">
          <ThreeButtons />
        </Route>
      </Router>
    </main>
  </React.StrictMode>,
  document.getElementById("root")
);
