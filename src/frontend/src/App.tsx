import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import AdvancesPage from "@/pages/Advances";
import AttendancePage from "@/pages/Attendance";
import EmployeesPage from "@/pages/Employees";
import SalaryPage from "@/pages/Salary";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { LogIn, TrendingUp } from "lucide-react";

function RootComponent() {
  const { isAuthenticated, isInitializing, login } = useInternetIdentity();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-base text-foreground tracking-tight">
                PayrollTrack
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
              Welcome to PayrollTrack
            </h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Automated attendance and payroll management system. Sign in with
              Internet Identity to continue.
            </p>
            <Button
              size="lg"
              onClick={login}
              disabled={isInitializing}
              data-ocid="auth.login_button"
              className="gap-2 w-full max-w-xs"
            >
              <LogIn className="h-4 w-4" />
              {isInitializing
                ? "Initializing..."
                : "Sign in with Internet Identity"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/employees" });
  },
  component: () => null,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employees",
  component: EmployeesPage,
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendance",
  component: AttendancePage,
});

const salaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/salary",
  component: SalaryPage,
});

const advancesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/advances",
  component: AdvancesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  employeesRoute,
  attendanceRoute,
  salaryRoute,
  advancesRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
