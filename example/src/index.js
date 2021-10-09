import React from "react";
import ReactDOM from "react-dom";
import { AutomationProfiler } from "react-automation-profiler";
import "./index.css";

function Button({ children, className }) {
  const [count, setCount] = React.useState(0);
  return (
    <button
      className={className}
      onClick={() => setCount(count + 1)}
      style={{ margin: "1rem" }}
    >
      {children}
    </button>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <AutomationProfiler id="p-app">
      <Button className="first-button">Click me once!</Button>
      <Button className="second-button">Click me twice!</Button>
      <Button className="third-button">Click me thrice!</Button>
    </AutomationProfiler>
  </React.StrictMode>,
  document.getElementById("root")
);
