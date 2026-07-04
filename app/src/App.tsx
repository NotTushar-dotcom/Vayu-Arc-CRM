import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadProfile from "./pages/LeadProfile";
import Tasks from "./pages/Tasks";
import Clients from "./pages/Clients";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/leads"
        element={
          <AppLayout>
            <Leads />
          </AppLayout>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <AppLayout>
            <LeadProfile />
          </AppLayout>
        }
      />
      <Route
        path="/tasks"
        element={
          <AppLayout>
            <Tasks />
          </AppLayout>
        }
      />
      <Route
        path="/clients"
        element={
          <AppLayout>
            <Clients />
          </AppLayout>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <AppLayout>
            <Clients />
          </AppLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppLayout>
            <Analytics />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <Settings />
          </AppLayout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
