import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Button({ children }) {
  return <button style={{ margin: "1rem" }}>{children}</button>;
}

ReactDOM.render(
  <React.StrictMode>
    <Button>Click me once!</Button>
    <Button>Click me twice!</Button>
    <Button>Click me thrice!</Button>
  </React.StrictMode>,
  document.getElementById("root")
);
