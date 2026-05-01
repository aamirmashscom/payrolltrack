import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, LogOut, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { to: "/employees", label: "Employees", ocid: "nav.employees_link" },
  { to: "/attendance", label: "Attendance", ocid: "nav.attendance_link" },
  { to: "/salary", label: "Salary", ocid: "nav.salary_link" },
  { to: "/advances", label: "Advances", ocid: "nav.advances_link" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, login, clear } = useInternetIdentity();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
          <Link
            to="/employees"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.brand_link"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-base text-foreground tracking-tight">
              PayrollTrack
            </span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label, ocid }) => {
              const isActive = currentPath.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={ocid}
                  className={cn(
                    "px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                data-ocid="nav.logout_button"
                className="gap-1.5 text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                data-ocid="nav.login_button"
                className="gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      <footer className="bg-card border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-4 h-10 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
