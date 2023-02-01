import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import App from "./App";
import Challenge from "./pages/Challenge";
import Topic from "./pages/Topic";
import Home from "./pages/Home";
import Settings from "./pages/Settings";

const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route path="challenge" element={<Challenge />} />
      <Route path="topic" element={<Topic />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  )
);

root.render(<RouterProvider router={router} />);
