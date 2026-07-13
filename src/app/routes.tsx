import { Authenticated } from "@refinedev/core";
import {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router";
import { Outlet, Route, Routes } from "react-router";

import { DashboardHome, DashboardLayout } from "@/pages/dashboard";
import { emailRoutes } from "@/pages/emails/routes";
import { LoginPage } from "@/pages/login";
import { practiceRoutes } from "@/pages/practices/routes";
import { userRoutes } from "@/pages/users/routes";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <Authenticated key="authenticated-outer" fallback={<Outlet />}>
            <NavigateToResource />
          </Authenticated>
        }
      >
        <Route path="/login" element={<LoginPage />} />
      </Route>

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
        <Route index element={<DashboardHome />} />

        {userRoutes}
        {practiceRoutes}
        {emailRoutes}
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

const ErrorPage = () => (
  <div className="flex min-h-svh items-center justify-center bg-background p-4 text-center">
    <div className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground text-lg">Page not found</p>
    </div>
  </div>
);
