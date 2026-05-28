import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import UploadPage from "./components/UploadPage";
import ReviewPage from "./components/ReviewPage";
import SessionsPage from "./components/SessionsPage";
import LookupsPage from "./components/LookupsPage";
import SchemasPage from "./components/SchemasPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: UploadPage,
      },
      {
        path: "schemas",
        Component: SchemasPage,
      },
      {
        path: "lookups",
        Component: LookupsPage,
      },
      {
        path: "sessions",
        Component: SessionsPage,
      },
      {
        path: "review",
        Component: ReviewPage,
      },
    ],
  },
]);

