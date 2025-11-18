import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProposalsList from "./pages/ProposalsList";
import ProposalForm from "./pages/ProposalForm";
import AdminUsers from "./pages/AdminUsers";
import AdminCommissions from "./pages/AdminCommissions";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/proposals"}>
        <ProtectedRoute>
          <ProposalsList />
        </ProtectedRoute>
      </Route>
      <Route path={"/proposals/new"}>
        <ProtectedRoute>
          <ProposalForm />
        </ProtectedRoute>
      </Route>
      <Route path={"/proposals/:id/edit"}>
        <ProtectedRoute>
          <ProposalForm />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/users"}>
        <ProtectedRoute requiredRole="admin">
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path={"/admin/commissions"}>
        <ProtectedRoute requiredRole="admin">
          <AdminCommissions />
        </ProtectedRoute>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;