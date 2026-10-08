// UI Extension plugins are built with React as an external, so they read it from these globals.
// This module must run before the plugin scripts in index.html.
import React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

globalThis.React = React;
globalThis.ReactDOM = ReactDOM;
globalThis.ReactDOMClient = ReactDOMClient;
