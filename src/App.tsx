import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";

import { LoginPage } from "./pages/login";
import { DashboardLayout } from "./pages/dashboard";
import { UsersList, UsersCreate, UsersEdit, UsersShow } from "./pages/users";

import "./index.css";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";

import { ThemeProvider } from "@/components/theme-provider.tsx";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="blawby-ui-theme">
        <RefineKbarProvider>
          <DevtoolsProvider>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider}
              authProvider={authProvider}
              resources={[{
                name: "dashboard",
                list: "/",
              }, {
                name: "users",
                list: "/users",
                create: "/users/create",
                edit: "/users/edit/:id",
                show: "/users/show/:id"
              }, {
                name: "practices",
                list: "/practices",
                create: "/practices/create",
                edit: "/practices/edit/:id",
                show: "/practices/show/:id"
              }]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
            >
              <Routes>
                {/* Unauthenticated routes */}
                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Authenticated routes */}
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <DashboardLayout />
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={
                      <NavigateToResource resource="dashboard" />
                    }
                  />
                  <Route path="/users">
                    <Route index element={<UsersList />} />
                    <Route path="create" element={<UsersCreate />} />
                    <Route path="edit/:id" element={<UsersEdit />} />
                    <Route path="show/:id" element={<UsersShow />} />
                  </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<ErrorPage />} />
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </DevtoolsProvider>
        </RefineKbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

const ErrorPage = () => (
  <div className="flex min-h-svh items-center justify-center bg-background p-4 text-center">
    <div className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground text-lg">Page not found</p>
    </div>
  </div>
);

export default App;
