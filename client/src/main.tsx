import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Loading from "./components/Loading";
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from "./pages/errors/ErrorPage.js";
// Lazy load the App component
const App = lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
